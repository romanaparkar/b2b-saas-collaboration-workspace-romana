import { AppError } from "../../shared/errors/AppError";
import { SOCKET_EVENTS } from "../../socket/socket.events";
import { MessageReadPayload } from "../../socket/socket.types";
import { emitToWorkspace } from "../../socket/socketEmitter";
import { IUser } from "../auth/auth.types";
import { channelService } from "../channel/channel.service";
import { Message } from "./message.model";
import { IMessage, MessageDto } from "./message.types";
import { CreateMessageInput, ListMessagesQuery } from "./message.validation";

/** Only the author fields the client needs; never the whole user document. */
type PopulatedSender = Pick<IUser, "_id" | "name" | "email">;

type PopulatedMessage = Omit<IMessage, "sender"> & { sender: PopulatedSender };

const SENDER_FIELDS = "name email";

function toMessageDto(message: PopulatedMessage): MessageDto {
  return {
    id: message._id.toString(),
    content: message.content,
    channel: message.channel.toString(),
    workspace: message.workspace.toString(),
    sender: {
      id: message.sender._id.toString(),
      name: message.sender.name,
      email: message.sender.email,
    },
    readBy: message.readBy.map((userId) => userId.toString()),
    createdAt: message.createdAt.toISOString(),
  };
}

export const messageService = {
  /**
   * Persist a message and broadcast it.
   *
   * Order matters: the database write happens first so a broadcast can never
   * announce a message that was not stored. Both the REST endpoint and the
   * `message:new` socket event call this one method, so the two transports can
   * never drift apart.
   *
   * The broadcast targets the *workspace* room rather than the channel room.
   * Members viewing a different channel still need to know a message landed so
   * their unread badge updates; the client filters by `channel` for display.
   *
   * @param tempId - Client-generated id of the optimistic placeholder, echoed
   *   back in the broadcast so the author reconciles rather than duplicating.
   */
  async create(
    channelId: string,
    userId: string,
    input: CreateMessageInput,
    tempId?: string,
  ): Promise<MessageDto> {
    const channel = await channelService.getAccessibleChannel(channelId, userId);

    const created = await Message.create({
      content: input.content,
      channel: channel._id,
      workspace: channel.workspace,
      sender: userId,
      // The author has, by definition, read their own message.
      readBy: [userId],
    });

    const message = await created.populate<{ sender: PopulatedSender }>(
      "sender",
      SENDER_FIELDS,
    );

    const dto = toMessageDto(message);

    emitToWorkspace(dto.workspace, SOCKET_EVENTS.MESSAGE_CREATED, {
      message: dto,
      tempId,
    });

    return dto;
  },

  /**
   * Channel history, newest first.
   *
   * `before` is a keyset cursor: paging by timestamp stays correct while new
   * messages keep arriving, which offset paging would not.
   */
  async listForChannel(
    channelId: string,
    userId: string,
    query: ListMessagesQuery,
  ): Promise<MessageDto[]> {
    await channelService.getAccessibleChannel(channelId, userId);

    const messages = await Message.find({
      channel: channelId,
      ...(query.before ? { createdAt: { $lt: query.before } } : {}),
    })
      .sort({ createdAt: -1 })
      .limit(query.limit)
      .populate<{ sender: PopulatedSender }>("sender", SENDER_FIELDS);

    return messages.map(toMessageDto);
  },

  /**
   * Record that a user has read a message.
   *
   * Returns `null` when the receipt already existed, so callers can skip a
   * redundant broadcast — clients re-report reads on every scroll and focus.
   */
  async markRead(messageId: string, userId: string): Promise<MessageReadPayload | null> {
    const message = await Message.findById(messageId);

    if (!message) {
      throw AppError.notFound("Message not found");
    }

    await channelService.getAccessibleChannel(message.channel.toString(), userId);

    const alreadyRead = message.readBy.some((reader) => reader.toString() === userId);

    if (alreadyRead) {
      return null;
    }

    const updated = await Message.findByIdAndUpdate(
      messageId,
      { $addToSet: { readBy: userId } },
      { new: true },
    );

    if (!updated) {
      throw AppError.notFound("Message not found");
    }

    const payload: MessageReadPayload = {
      messageId: updated._id.toString(),
      channelId: updated.channel.toString(),
      workspaceId: updated.workspace.toString(),
      userId,
      readBy: updated.readBy.map((reader) => reader.toString()),
    };

    emitToWorkspace(payload.workspaceId, SOCKET_EVENTS.MESSAGE_READ, payload);

    return payload;
  },
};
