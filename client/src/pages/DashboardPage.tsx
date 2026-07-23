import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Trash2 } from "lucide-react";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../hooks/useAuth";
import { ApiError } from "../lib/apiClient";
import { workspaceService } from "../services/workspaceService";
import type { Workspace } from "../types/workspace";

/** Prefer the server's message when the failure came from the API. */
const toMessage = (error: unknown, fallback: string) =>
  error instanceof ApiError ? error.message : fallback;

const DashboardPage = () => {
  const { user } = useAuth();

  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Initial load. State is only updated after the request settles, so the
  // effect body itself performs no synchronous state updates.
  useEffect(() => {
    let cancelled = false;

    const loadWorkspaces = async () => {
      try {
        const data = await workspaceService.list();
        if (!cancelled) {
          setWorkspaces(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(toMessage(err, "Failed to load workspaces."));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadWorkspaces();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const created = await workspaceService.create({ name, description });
      setWorkspaces((current) => [created, ...current]);
      setName("");
      setDescription("");
      setIsFormOpen(false);
    } catch (err) {
      setError(toMessage(err, "Failed to create workspace."));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (workspace: Workspace) => {
    if (!window.confirm(`Delete "${workspace.name}"? This cannot be undone.`)) {
      return;
    }

    setError(null);
    const previous = workspaces;

    // Optimistic removal, rolled back if the request fails.
    setWorkspaces((current) => current.filter((item) => item.id !== workspace.id));

    try {
      await workspaceService.remove(workspace.id);
    } catch (err) {
      setWorkspaces(previous);
      setError(toMessage(err, "Failed to delete workspace."));
    }
  };

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar />

      <div className="flex-1">
        <Navbar />

        <main className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">
                Welcome back, {user?.name ?? "there"} 👋
              </h1>
              <p className="text-gray-500 mt-2">
                Manage your team and collaborate in one place.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsFormOpen((open) => !open)}
              className="bg-cyan-600 hover:bg-cyan-700 text-white px-5 py-3 rounded-lg font-semibold"
            >
              {isFormOpen ? "Cancel" : "+ Create Workspace"}
            </button>
          </div>

          {error && (
            <p
              role="alert"
              className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </p>
          )}

          {isFormOpen && (
            <form
              onSubmit={handleCreate}
              className="mb-8 rounded-xl bg-white p-6 shadow"
            >
              <h2 className="mb-4 text-lg font-semibold">New workspace</h2>

              <input
                type="text"
                placeholder="Workspace name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength={2}
                className="mb-4 w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />

              <input
                type="text"
                placeholder="Description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mb-4 w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />

              <button
                type="submit"
                disabled={isSaving}
                className="rounded-lg bg-cyan-600 px-5 py-3 font-semibold text-white hover:bg-cyan-700 disabled:cursor-not-allowed disabled:bg-cyan-400"
              >
                {isSaving ? "Creating…" : "Create workspace"}
              </button>
            </form>
          )}

          <h2 className="text-xl font-semibold mb-4">Your Workspaces</h2>

          {isLoading ? (
            <p className="text-gray-500">Loading workspaces…</p>
          ) : workspaces.length === 0 ? (
            <div className="rounded-xl bg-white p-10 text-center shadow">
              <p className="text-gray-500">
                You don&apos;t have any workspaces yet. Create your first one to get
                started.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {workspaces.map((workspace) => (
                <div
                  key={workspace.id}
                  className="flex flex-col bg-white rounded-xl shadow p-6 hover:shadow-lg transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-xl font-semibold">{workspace.name}</h3>

                    <button
                      type="button"
                      onClick={() => void handleDelete(workspace)}
                      aria-label={`Delete ${workspace.name}`}
                      className="rounded-md p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <p className="text-gray-500 mt-2 flex-1">
                    {workspace.description || "No description"}
                  </p>

                  <button
                    type="button"
                    className="mt-6 bg-slate-900 hover:bg-slate-700 text-white px-4 py-2 rounded-lg"
                  >
                    Open Workspace
                  </button>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;
