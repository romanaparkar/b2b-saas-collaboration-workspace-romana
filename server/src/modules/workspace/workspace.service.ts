import { Channel } from "../channel/channel.model";
import { DEFAULT_CHANNEL_NAME } from "../channel/channel.types";
import { Message } from "../message/message.model";
import { ROLES } from "../../shared/constants/roles";
import { AppError } from "../../shared/errors/AppError";
import { Workspace } from "./workspace.model";
import { IWorkspace } from "./workspace.types";
import { CreateWorkspaceInput } from "./workspace.validation";

export const workspaceService = {
  /**
   * Create a workspace owned by `userId`, who becomes its first admin member.
   * A default "general" channel is created so the workspace is immediately
   * usable for messaging.
   */
  async create(userId: string, input: CreateWorkspaceInput): Promise<IWorkspace> {
    const workspace = await Workspace.create({
      name: input.name,
      description: input.description,
      owner: userId,
      members: [{ user: userId, role: ROLES.ADMIN }],
    });

    await Channel.create({
      name: DEFAULT_CHANNEL_NAME,
      workspace: workspace._id,
      createdBy: userId,
    });

    return workspace;
  },

  /** List every workspace the user is a member of, newest first. */
  async listForUser(userId: string): Promise<IWorkspace[]> {
    return Workspace.find({ "members.user": userId }).sort({ createdAt: -1 });
  },

  /** Fetch a single workspace, enforcing membership. */
  async getByIdForUser(workspaceId: string, userId: string): Promise<IWorkspace> {
    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      throw AppError.notFound("Workspace not found");
    }

    const isMember = workspace.members.some(
      (member) => member.user.toString() === userId,
    );

    if (!isMember) {
      throw AppError.forbidden("You do not have access to this workspace");
    }

    return workspace;
  },

  /**
   * Delete a workspace and its dependent data. Only the owner may delete.
   */
  async remove(workspaceId: string, userId: string): Promise<void> {
    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      throw AppError.notFound("Workspace not found");
    }

    if (workspace.owner.toString() !== userId) {
      throw AppError.forbidden("Only the workspace owner can delete it");
    }

    // Remove dependent records so no orphaned channels/messages remain.
    await Promise.all([
      Message.deleteMany({ workspace: workspace._id }),
      Channel.deleteMany({ workspace: workspace._id }),
    ]);

    await workspace.deleteOne();
  },
};
