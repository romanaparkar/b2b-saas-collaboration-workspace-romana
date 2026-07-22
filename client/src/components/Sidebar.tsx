import { Home, Users, MessageSquare, Settings, LogOut } from "lucide-react";

const Sidebar = () => {
  return (
    <aside className="w-64 h-screen bg-slate-900 text-white flex flex-col">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-2xl font-bold text-cyan-400">
          B2B Workspace
        </h1>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        <a
          href="#"
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800"
        >
          <Home size={20} />
          Dashboard
        </a>

        <a
          href="#"
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800"
        >
          <Users size={20} />
          Workspaces
        </a>

        <a
          href="#"
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800"
        >
          <MessageSquare size={20} />
          Messages
        </a>

        <a
          href="#"
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800"
        >
          <Settings size={20} />
          Settings
        </a>
      </nav>

      <div className="p-4 border-t border-slate-700">
        <button className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-red-500">
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
