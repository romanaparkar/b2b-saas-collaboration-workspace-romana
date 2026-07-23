import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import ChannelSidebar from "../components/workspace/ChannelSidebar";
import ChatArea from "../components/workspace/ChatArea";
import ConnectionStatus from "../components/workspace/ConnectionStatus";
import OnlineMembers from "../components/workspace/OnlineMembers";
import { useAuth } from "../hooks/useAuth";
import { useChannels } from "../hooks/useChannels";
import { usePresence } from "../hooks/usePresence";
import { useSocket } from "../hooks/useSocket";
import { useUnreadCounts } from "../hooks/useUnreadCounts";
import { useWorkspaceRoom } from "../hooks/useWorkspaceRoom";
import { toErrorMessage } from "../lib/errors";
import { workspaceService } from "../services/workspaceService";
import type { Channel } from "../types/channel";
import type { Workspace } from "../types/workspace";

/**
 * The real-time workspace: channels, chat, presence and typing, all wired to a
 * single shared socket.
 *
 * This page owns only *selection and coordination* state — which workspace,
 * which channel. Every live concern (messages, presence, unread, typing) lives
 * in a dedicated hook, keeping this component a thin composition root.
 */
const WorkspacePage = () => {
  const { workspaceId = null } = useParams();
  const { user } = useAuth();

  const { isConnected, connectionError } = useSocket();

  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  // The channel the user has explicitly opened. May be null (nothing picked
  // yet) or stale (the channel was deleted) — the *displayed* channel is
  // derived from it below, so neither case needs a correcting effect.
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);

  // Ensure membership, then load the workspace. Opening a workspace by id is
  // idempotent server-side, so this doubles as the "join" flow.
  useEffect(() => {
    if (!workspaceId) {
      return;
    }

    let cancelled = false;

    const openWorkspace = async () => {
      try {
        const joined = await workspaceService.join(workspaceId);
        if (!cancelled) {
          setWorkspace(joined);
          setLoadError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(toErrorMessage(err, "Failed to open workspace."));
        }
      }
    };

    void openWorkspace();

    return () => {
      cancelled = true;
    };
  }, [workspaceId]);

  // Subscribe to the workspace's realtime room (re-joined on every reconnect).
  const { error: roomError } = useWorkspaceRoom(workspaceId, isConnected);

  const { channels, isLoading: channelsLoading, error: channelsError, createChannel, deleteChannel } =
    useChannels(workspaceId);

  const onlineUsers = usePresence(workspaceId);

  // The displayed channel: the user's pick when it still exists, otherwise a
  // sensible default (the first channel, i.e. "general"). Deleting the open
  // channel therefore falls back automatically, with no effect required.
  const activeChannel = useMemo<Channel | null>(() => {
    const selected = channels.find((channel) => channel.id === selectedChannelId);
    return selected ?? channels[0] ?? null;
  }, [channels, selectedChannelId]);

  const activeChannelId = activeChannel?.id ?? null;

  const { unreadCounts, markChannelRead } = useUnreadCounts(activeChannelId);

  const handleSelectChannel = (channelId: string) => {
    setSelectedChannelId(channelId);
    markChannelRead(channelId);
  };

  const handleCreateChannel = async (name: string) => {
    const created = await createChannel(name);

    if (created) {
      setSelectedChannelId(created.id);
    }
  };

  const handleDeleteChannel = (channel: Channel) => {
    if (
      !window.confirm(
        `Delete #${channel.name}? Its messages will be permanently removed.`,
      )
    ) {
      return;
    }

    void deleteChannel(channel.id);
  };

  if (loadError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-100">
        <p className="text-slate-700">{loadError}</p>
        <Link to="/dashboard" className="font-semibold text-cyan-600 hover:underline">
          Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-white">
      <header className="flex items-center justify-between border-b border-slate-200 px-6 py-3">
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            aria-label="Back to dashboard"
            className="rounded-md p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-lg font-bold text-slate-900">
            {workspace?.name ?? "Workspace"}
          </h1>
        </div>

        <ConnectionStatus isConnected={isConnected} error={connectionError} />
      </header>

      {(roomError || channelsError) && (
        <p role="alert" className="bg-red-50 px-6 py-2 text-sm text-red-700">
          {roomError ?? channelsError}
        </p>
      )}

      <div className="flex min-h-0 flex-1">
        <ChannelSidebar
          channels={channels}
          activeChannelId={activeChannelId}
          unreadCounts={unreadCounts}
          isLoading={channelsLoading}
          onSelect={handleSelectChannel}
          onCreate={handleCreateChannel}
          onDelete={handleDeleteChannel}
        />

        {activeChannel && workspaceId ? (
          <ChatArea
            // Remount on channel change so no state crosses over.
            key={activeChannel.id}
            workspaceId={workspaceId}
            channel={activeChannel}
            isConnected={isConnected}
          />
        ) : (
          <div className="flex flex-1 items-center justify-center bg-slate-100">
            <p className="text-sm text-slate-500">
              {channelsLoading ? "Loading…" : "Select a channel to start chatting."}
            </p>
          </div>
        )}

        <OnlineMembers users={onlineUsers} currentUserId={user?.id ?? null} />
      </div>
    </div>
  );
};

export default WorkspacePage;
