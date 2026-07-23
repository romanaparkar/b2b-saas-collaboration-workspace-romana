import { Home, LogOut, MessageSquare, Settings, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";

const NAV_ITEMS = [
  { label: "Dashboard", icon: Home },
  { label: "Workspaces", icon: Users },
  { label: "Messages", icon: MessageSquare },
  { label: "Settings", icon: Settings },
];

const Sidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <aside className="w-64 h-screen bg-slate-900 text-white flex flex-col">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-2xl font-bold text-cyan-400">B2B Workspace</h1>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {NAV_ITEMS.map(({ label, icon: Icon }) => (
          <a
            key={label}
            href="#"
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800"
          >
            <Icon size={20} />
            {label}
          </a>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-700">
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-red-500"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
