import { useState } from "react";
import type { FormEvent } from "react";
import { Hash, Plus, Trash2 } from "lucide-react";

import type { Channel } from "../../types/channel";
import type { UnreadCounts } from "../../hooks/useUnreadCounts";

interface ChannelSidebarProps {
  channels: Channel[];
  activeChannelId: string | null;
  unreadCounts: UnreadCounts;
  isLoading: boolean;
  onSelect: (channelId: string) => void;
  onCreate: (name: string) => Promise<void>;
  onDelete: (channel: Channel) => void;
}

const ChannelSidebar = ({
  channels,
  activeChannelId,
  unreadCounts,
  isLoading,
  onSelect,
  onCreate,
  onDelete,
}: ChannelSidebarProps) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [name, setName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);

    await onCreate(name);

    setIsSaving(false);
    setName("");
    setIsFormOpen(false);
  };

  return (
    <aside className="flex w-64 flex-col border-r border-slate-200 bg-slate-50">
      <div className="flex items-center justify-between px-4 py-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Channels
        </h2>

        <button
          type="button"
          onClick={() => setIsFormOpen((open) => !open)}
          aria-label={isFormOpen ? "Cancel new channel" : "Create channel"}
          className="rounded-md p-1 text-slate-500 transition hover:bg-slate-200 hover:text-slate-900"
        >
          <Plus size={18} className={isFormOpen ? "rotate-45 transition" : "transition"} />
        </button>
      </div>

      {isFormOpen && (
        <form onSubmit={handleSubmit} className="px-4 pb-3">
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="new-channel"
            required
            minLength={2}
            maxLength={60}
            autoFocus
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />

          <button
            type="submit"
            disabled={isSaving}
            className="mt-2 w-full rounded-md bg-cyan-600 px-3 py-2 text-sm font-semibold text-white hover:bg-cyan-700 disabled:cursor-not-allowed disabled:bg-cyan-400"
          >
            {isSaving ? "Creating…" : "Create channel"}
          </button>
        </form>
      )}

      <nav className="flex-1 overflow-y-auto px-2 pb-4">
        {isLoading ? (
          <p className="px-2 py-2 text-sm text-slate-500">Loading channels…</p>
        ) : channels.length === 0 ? (
          <p className="px-2 py-2 text-sm text-slate-500">No channels yet.</p>
        ) : (
          channels.map((channel) => {
            const isActive = channel.id === activeChannelId;
            const unread = unreadCounts[channel.id] ?? 0;

            return (
              <div
                key={channel.id}
                className={`group flex items-center gap-1 rounded-md ${
                  isActive ? "bg-cyan-600 text-white" : "text-slate-700 hover:bg-slate-200"
                }`}
              >
                <button
                  type="button"
                  onClick={() => onSelect(channel.id)}
                  aria-current={isActive ? "true" : undefined}
                  className="flex min-w-0 flex-1 items-center gap-2 px-3 py-2 text-left text-sm"
                >
                  <Hash size={16} className="shrink-0 opacity-70" />
                  <span className="truncate">{channel.name}</span>

                  {unread > 0 && !isActive && (
                    <span
                      aria-label={`${unread} unread messages`}
                      className="ml-auto shrink-0 rounded-full bg-cyan-600 px-2 py-0.5 text-xs font-bold text-white"
                    >
                      {unread}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => onDelete(channel)}
                  aria-label={`Delete ${channel.name}`}
                  className={`mr-1 rounded p-1 opacity-0 transition group-hover:opacity-100 ${
                    isActive ? "hover:bg-cyan-700" : "hover:bg-slate-300"
                  }`}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })
        )}
      </nav>
    </aside>
  );
};

export default ChannelSidebar;
