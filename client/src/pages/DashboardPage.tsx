import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

const DashboardPage = () => {
  const workspaces = [
    {
      id: 1,
      name: "Marketing Team",
      members: 12,
    },
    {
      id: 2,
      name: "Development",
      members: 8,
    },
    {
      id: 3,
      name: "Design",
      members: 5,
    },
  ];

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar />

      <div className="flex-1">
        <Navbar />

        <main className="p-8">

          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">
                Welcome Back, Romana 👋
              </h1>

              <p className="text-gray-500 mt-2">
                Manage your team and collaborate in one place.
              </p>
            </div>

            <button className="bg-cyan-600 hover:bg-cyan-700 text-white px-5 py-3 rounded-lg font-semibold">
              + Create Workspace
            </button>
          </div>

          <h2 className="text-xl font-semibold mb-4">
            Your Workspaces
          </h2>

          <div className="grid grid-cols-3 gap-6">

            {workspaces.map((workspace) => (
              <div
                key={workspace.id}
                className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition"
              >
                <h3 className="text-xl font-semibold">
                  {workspace.name}
                </h3>

                <p className="text-gray-500 mt-2">
                  {workspace.members} Members
                </p>

                <button className="mt-6 bg-slate-900 hover:bg-slate-700 text-white px-4 py-2 rounded-lg">
                  Open Workspace
                </button>
              </div>
            ))}

          </div>

          <div className="mt-10 bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-semibold mb-4">
              Recent Activity
            </h2>

            <ul className="space-y-3 text-gray-600">
              <li>✅ John joined Marketing Team</li>
              <li>📁 Sarah uploaded design.fig</li>
              <li>📅 Meeting scheduled at 4:00 PM</li>
            </ul>
          </div>

        </main>
      </div>
    </div>
  );
};

export default DashboardPage;