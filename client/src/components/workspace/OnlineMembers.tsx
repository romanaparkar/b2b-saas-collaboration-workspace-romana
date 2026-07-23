import type { OnlineUser } from "../../types/socket";

interface OnlineMembersProps {
  users: OnlineUser[];
  currentUserId: string | null;
}

const OnlineMembers = ({ users, currentUserId }: OnlineMembersProps) => (
  <aside className="hidden w-56 shrink-0 border-l border-slate-200 bg-slate-50 p-4 lg:block">
    <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
      Online — {users.length}
    </h2>

    {users.length === 0 ? (
      <p className="text-sm text-slate-500">Nobody is online.</p>
    ) : (
      <ul className="space-y-2">
        {users.map((user) => (
          <li key={user.id} className="flex items-center gap-2 text-sm text-slate-700">
            <span
              aria-hidden="true"
              className="h-2.5 w-2.5 shrink-0 rounded-full bg-green-500"
            />
            <span className="truncate">
              {user.name}
              {user.id === currentUserId && (
                <span className="text-slate-400"> (you)</span>
              )}
            </span>
          </li>
        ))}
      </ul>
    )}
  </aside>
);

export default OnlineMembers;
