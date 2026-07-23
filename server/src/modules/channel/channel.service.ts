import { AppError } from "../../shared/errors/AppError";
import { SOCKET_EVENTS } from "../../socket/socket.events";
import { emitToWorkspace } from "../../socket/socketEmitter";
import { Message } from "../message/message.model";
import { workspaceService } from "../workspace/workspace.service";
import { Channel } from "./channel.model";
import { ChannelDto, IChannel } from "./channel.types";
import { CreateChannelInput } from "./channel.validation";

/** Map a channel document to the shape sent over HTTP and sockets alike. */
function toChannelDto(channel: IChannel): ChannelDto {
  return {
    id: channel._id.toString(),
    name: channel.name,
    workspace: channel.workspace.toString(),
    createdBy: channel.createdBy.toString(),
    createdAt: channel.createdAt.toISOString(),
  };
}

export const channelService = {
  /**
   * Load a channel and confirm the user may access it.
   *
   * Access is derived from workspace membership — there is no per-channel
   * membership yet — and every other channel/message operation funnels through
   * here so the rule is enforced in exactly one place, for both transports.
   */
  async getAccessibleChannel(channelId: string, userId: string): Promise<IChannel> {
    const channel = await Channel.findById(channelId);

    if (!channel) {
      throw AppError.notFound("Channel not found");
    }

    // Throws 403/404 when the user is not a member of the owning workspace.
    await workspaceService.getByIdForUser(channel.workspace.toString(), userId);

    return channel;
  },

  /** List a workspace's channels, oldest first so "general" stays at the top. */
  async listForWorkspace(workspaceId: string, userId: string): Promise<ChannelDto[]> {
    await workspaceService.getByIdForUser(workspaceId, userId);

    const channels = await Channel.find({ workspace: workspaceId }).sort({
      createdAt: 1,
    });

    return channels.map(toChannelDto);
  },

  /**
   * Create a channel. Any workspace member may do so; the whole workspace is
   * notified in real time.
   */
  async create(
    workspaceId: string,
    userId: string,
    input: CreateChannelInput,
  ): Promise<ChannelDto> {
    await workspaceService.getByIdForUser(workspaceId, userId);

    // Checked explicitly for a clear message; the unique compound index is
    // still the actual guarantee under concurrent creates.
    const existing = await Channel.findOne({
      workspace: workspaceId,
      name: input.name,
    });

    if (existing) {
      throw AppError.conflict(`A channel named "${input.name}" already exists`);
    }

    const channel = await Channel.create({
      name: input.name,
      workspace: workspaceId,
      createdBy: userId,
    });

    const dto = toChannelDto(channel);

    // Persist first, broadcast second: a client never learns about a channel
    // that failed to save.
    emitToWorkspace(workspaceId, SOCKET_EVENTS.CHANNEL_CREATED, dto);

    return dto;
  },

  /**
   * Delete a channel and its messages.
   *
   * Restricted to the workspace owner or the channel's creator, and the last
   * remaining channel cannot be removed — a workspace with no channels would
   * leave members with nowhere to post.
   */
  async remove(workspaceId: string, channelId: string, userId: string): Promise<void> {
    const workspace = await workspaceService.getByIdForUser(workspaceId, userId);
    const channel = await Channel.findOne({ _id: channelId, workspace: workspaceId });

    if (!channel) {
      throw AppError.notFound("Channel not found");
    }

    const isOwner = workspace.owner.toString() === userId;
    const isCreator = channel.createdBy.toString() === userId;

    if (!isOwner && !isCreator) {
      throw AppError.forbidden(
        "Only the workspace owner or the channel creator can delete this channel",
      );
    }

    const channelCount = await Channel.countDocuments({ workspace: workspaceId });

    if (channelCount <= 1) {
      throw AppError.badRequest("A workspace must have at least one channel");
    }

    await Message.deleteMany({ channel: channel._id });
    await channel.deleteOne();

    emitToWorkspace(workspaceId, SOCKET_EVENTS.CHANNEL_DELETED, {
      channelId,
      workspaceId,
    });
  },
};
