import { Bell, Search, UserCircle } from "lucide-react";

import { useAuth } from "../hooks/useAuth";

const Navbar = () => {
  const { user } = useAuth();

  return (
    <header className="flex items-center justify-between bg-white shadow px-8 py-4">
      <div className="relative w-96">
        <Search className="absolute left-3 top-3 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Search..."
          className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
      </div>

      <div className="flex items-center gap-6">
        <Bell className="cursor-pointer text-gray-600" size={22} />

        <div className="flex items-center gap-2">
          <UserCircle className="text-cyan-600" size={35} />
          <div>
            <p className="font-semibold">{user?.name ?? "—"}</p>
            <p className="text-sm text-gray-500 capitalize">{user?.role ?? ""}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
