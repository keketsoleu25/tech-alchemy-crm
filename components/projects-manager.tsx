"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

type ProjectStatus =
  | "PLANNING"
  | "ACTIVE"
  | "ON_HOLD"
  | "COMPLETED"
  | "CANCELLED";

type Project = {
  id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  budget: string | null;
  startDate: string | null;
  endDate: string | null;
  clientId: string | null;
  client: { id: string; name: string } | null;
};

type ClientOption = { id: string; name: string };

type FormState = {
  name: string;
  description: string;
  status: ProjectStatus;
  budget: string;
  startDate: string;
  endDate: string;
  clientId: string;
};

const emptyForm: FormState = {
  name: "",
  description: "",
  status: "PLANNING",
  budget: "",
  startDate: "",
  endDate: "",
  clientId: "",
};

const STATUS_LABELS: Record<ProjectStatus, string> = {
  PLANNING: "Planning",
  ACTIVE: "Active",
  ON_HOLD: "On hold",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

const STATUS_STYLES: Record<ProjectStatus, string> = {
  PLANNING: "bg-blue-950 text-blue-300 border-blue-900",
  ACTIVE: "bg-green-950 text-green-300 border-green-900",
  ON_HOLD: "bg-yellow-950 text-yellow-300 border-yellow-900",
  COMPLETED: "bg-gray-800 text-gray-300 border-gray-700",
  CANCELLED: "bg-red-950 text-red-300 border-red-900",
};

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString();
}

export default function ProjectsManager({
  initialProjects,
  initialTotal,
  pageSize,
  clients,
}: {
  initialProjects: Project[];
  initialTotal: number;
  pageSize: number;
  clients: ClientOption[];
}) {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(1);
  const [loadingPage, setLoadingPage] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const loadPage = useCallback(async (targetPage: number) => {
    setLoadingPage(true);
    try {
      const res = await fetch(`/api/projects?page=${targetPage}`);
      const data = await res.json();
      if (res.ok) {
        setProjects(data.projects);
        setTotal(data.total);
        setPage(data.page);
      }
    } catch {
      // Keep current view if refetch fails
    } finally {
      setLoadingPage(false);
    }
  }, []);

  useEffect(() => {
    if (page !== 1) {
      loadPage(page);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  function startCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setError(null);
    setShowForm(true);
  }

  function startEdit(project: Project) {
    setEditingId(project.id);
    setForm({
      name: project.name,
      description: project.description ?? "",
      status: project.status,
      budget: project.budget ?? "",
      startDate: project.startDate ? project.startDate.slice(0, 10) : "",
      endDate: project.endDate ? project.endDate.slice(0, 10) : "",
      clientId: project.clientId ?? "",
    });
    setError(null);
    setShowForm(true);
  }

  function cancelForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const url = editingId ? `/api/projects/${editingId}` : "/api/projects";
    const method = editingId ? "PATCH" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        setSubmitting(false);
        return;
      }

      cancelForm();

      if (editingId) {
        setProjects((prev) =>
          prev.map((p) => (p.id === editingId ? data.project : p))
        );
      } else {
        if (page === 1) {
          await loadPage(1);
        } else {
          setPage(1);
        }
      }

      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    setDeletingId(id);

    let taskCount = 0;
    try {
      const res = await fetch(`/api/tasks?projectId=${id}&countOnly=true`);
      if (res.ok) {
        const data = await res.json();
        taskCount = typeof data.total === "number" ? data.total : 0;
      }
    } catch {
      // If the count check fails, fall through to a generic warning below.
    }

    const warning =
      taskCount > 0
        ? `"${name}" has ${taskCount} task${
            taskCount === 1 ? "" : "s"
          } attached. Deleting this project will permanently delete ${
            taskCount === 1 ? "that task" : "all of those tasks"
          } too. This cannot be undone.`
        : `Delete "${name}"? This cannot be undone.`;

    if (!confirm(warning)) {
      setDeletingId(null);
      return;
    }

    try {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to delete project");
        return;
      }

      const remainingOnPage = projects.length - 1;
      const targetPage = remainingOnPage === 0 && page > 1 ? page - 1 : page;
      await loadPage(targetPage);
      router.refresh();
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-400">
          {total} {total === 1 ? "project" : "projects"}
        </p>
        {!showForm && (
          <button
            onClick={startCreate}
            className="rounded-md border border-gray-700 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
          >
            Add project
          </button>
        )}
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-6 rounded-lg border border-gray-800 bg-gray-950 p-6 space-y-4"
        >
          <h2 className="text-sm font-medium text-white">
            {editingId ? "Edit project" : "New project"}
          </h2>

          {error && (
            <p className="text-sm text-red-400 bg-red-950/40 border border-red-900 rounded-md px-3 py-2">
              {error}
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Name *
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-md border border-gray-700 bg-black px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-gray-500"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Client
              </label>
              <select
                value={form.clientId}
                onChange={(e) =>
                  setForm({ ...form, clientId: e.target.value })
                }
                className="w-full rounded-md border border-gray-700 bg-black px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                <option value="">No client</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Status
              </label>
              <select
                value={form.status}
                onChange={(e) =>
                  setForm({
                    ...form,
                    status: e.target.value as ProjectStatus,
                  })
                }
                className="w-full rounded-md border border-gray-700 bg-black px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Budget (ZAR)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.budget}
                onChange={(e) => setForm({ ...form, budget: e.target.value })}
                className="w-full rounded-md border border-gray-700 bg-black px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-gray-500"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Start date
              </label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) =>
                  setForm({ ...form, startDate: e.target.value })
                }
                className="w-full rounded-md border border-gray-700 bg-black px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-gray-500"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">
                End date
              </label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) =>
                  setForm({ ...form, endDate: e.target.value })
                }
                className="w-full rounded-md border border-gray-700 bg-black px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-gray-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              rows={3}
              className="w-full rounded-md border border-gray-700 bg-black px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-gray-500"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-white px-4 py-2 text-sm font-medium text-black hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              {submitting
                ? "Saving..."
                : editingId
                ? "Save changes"
                : "Create project"}
            </button>
            <button
              type="button"
              onClick={cancelForm}
              className="rounded-md border border-gray-700 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {projects.length === 0 ? (
        <div className="rounded-lg border border-gray-800 bg-gray-950 p-10 text-center">
          <p className="text-gray-400 text-sm">
            No projects yet. Add your first one to get started.
          </p>
        </div>
      ) : (
        <div
          className={`rounded-lg border border-gray-800 bg-gray-950 overflow-hidden ${
            loadingPage ? "opacity-50" : ""
          }`}
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-left text-gray-400">
                <th className="px-4 py-3 font-normal">Name</th>
                <th className="px-4 py-3 font-normal">Client</th>
                <th className="px-4 py-3 font-normal">Status</th>
                <th className="px-4 py-3 font-normal">Budget</th>
                <th className="px-4 py-3 font-normal">Start</th>
                <th className="px-4 py-3 font-normal">End</th>
                <th className="px-4 py-3 font-normal text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr
                  key={project.id}
                  className="border-b border-gray-800 last:border-0"
                >
                  <td className="px-4 py-3 text-white font-medium">
                    {project.name}
                  </td>
                  <td className="px-4 py-3 text-gray-300">
                    {project.client?.name || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full border px-2 py-0.5 text-xs ${STATUS_STYLES[project.status]}`}
                    >
                      {STATUS_LABELS[project.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-300">
                    {project.budget
                      ? `R ${Number(project.budget).toLocaleString()}`
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-300">
                    {formatDate(project.startDate)}
                  </td>
                  <td className="px-4 py-3 text-gray-300">
                    {formatDate(project.endDate)}
                  </td>
                  <td className="px-4 py-3 text-right space-x-3 whitespace-nowrap">
                    <button
                      onClick={() => startEdit(project)}
                      className="text-gray-300 hover:text-white text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(project.id, project.name)}
                      disabled={deletingId === project.id}
                      className="text-red-400 hover:text-red-300 text-sm disabled:opacity-50"
                    >
                      {deletingId === project.id ? "Deleting..." : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1 || loadingPage}
            className="rounded-md border border-gray-700 px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-900 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-sm text-gray-500">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages || loadingPage}
            className="rounded-md border border-gray-700 px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-900 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
