"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";
type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  projectId: string;
  project: { id: string; name: string };
};

type ProjectOption = { id: string; name: string };

type FormState = {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  projectId: string;
};

const emptyForm: FormState = {
  title: "",
  description: "",
  status: "TODO",
  priority: "MEDIUM",
  dueDate: "",
  projectId: "",
};

const STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: "To do",
  IN_PROGRESS: "In progress",
  DONE: "Done",
};

const STATUS_STYLES: Record<TaskStatus, string> = {
  TODO: "bg-gray-800 text-gray-300 border-gray-700",
  IN_PROGRESS: "bg-blue-950 text-blue-300 border-blue-900",
  DONE: "bg-green-950 text-green-300 border-green-900",
};

const PRIORITY_LABELS: Record<TaskPriority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
};

const PRIORITY_STYLES: Record<TaskPriority, string> = {
  LOW: "text-gray-400",
  MEDIUM: "text-yellow-400",
  HIGH: "text-red-400",
};

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString();
}

export default function TasksManager({
  initialTasks,
  initialTotal,
  pageSize,
  projects,
}: {
  initialTasks: Task[];
  initialTotal: number;
  pageSize: number;
  projects: ProjectOption[];
}) {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
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
      const res = await fetch(`/api/tasks?page=${targetPage}`);
      const data = await res.json();
      if (res.ok) {
        setTasks(data.tasks);
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
    setForm({ ...emptyForm, projectId: projects[0]?.id ?? "" });
    setError(null);
    setShowForm(true);
  }

  function startEdit(task: Task) {
    setEditingId(task.id);
    setForm({
      title: task.title,
      description: task.description ?? "",
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.slice(0, 10) : "",
      projectId: task.projectId,
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

    if (!form.projectId) {
      setError("You need at least one project before adding tasks.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const url = editingId ? `/api/tasks/${editingId}` : "/api/tasks";
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
        setTasks((prev) =>
          prev.map((t) => (t.id === editingId ? data.task : t))
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

  async function handleDelete(id: string) {
    if (!confirm("Delete this task? This cannot be undone.")) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to delete task");
        return;
      }

      const remainingOnPage = tasks.length - 1;
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
          {total} {total === 1 ? "task" : "tasks"}
        </p>
        {!showForm && (
          <button
            onClick={startCreate}
            disabled={projects.length === 0}
            className="rounded-md border border-gray-700 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            Add task
          </button>
        )}
      </div>

      {projects.length === 0 && !showForm && (
        <div className="mb-6 rounded-lg border border-gray-800 bg-gray-950 p-4 text-sm text-gray-400">
          You need at least one project before you can add tasks. Create a
          project first.
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-6 rounded-lg border border-gray-800 bg-gray-950 p-6 space-y-4"
        >
          <h2 className="text-sm font-medium text-white">
            {editingId ? "Edit task" : "New task"}
          </h2>

          {error && (
            <p className="text-sm text-red-400 bg-red-950/40 border border-red-900 rounded-md px-3 py-2">
              {error}
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Title *
              </label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full rounded-md border border-gray-700 bg-black px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-gray-500"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Project *
              </label>
              <select
                required
                value={form.projectId}
                onChange={(e) =>
                  setForm({ ...form, projectId: e.target.value })
                }
                className="w-full rounded-md border border-gray-700 bg-black px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                <option value="" disabled>
                  Select a project
                </option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
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
                  setForm({ ...form, status: e.target.value as TaskStatus })
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
                Priority
              </label>
              <select
                value={form.priority}
                onChange={(e) =>
                  setForm({
                    ...form,
                    priority: e.target.value as TaskPriority,
                  })
                }
                className="w-full rounded-md border border-gray-700 bg-black px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Due date
              </label>
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) =>
                  setForm({ ...form, dueDate: e.target.value })
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
                : "Create task"}
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

      {tasks.length === 0 ? (
        <div className="rounded-lg border border-gray-800 bg-gray-950 p-10 text-center">
          <p className="text-gray-400 text-sm">
            No tasks yet. Add your first one to get started.
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
                <th className="px-4 py-3 font-normal">Title</th>
                <th className="px-4 py-3 font-normal">Project</th>
                <th className="px-4 py-3 font-normal">Status</th>
                <th className="px-4 py-3 font-normal">Priority</th>
                <th className="px-4 py-3 font-normal">Due</th>
                <th className="px-4 py-3 font-normal text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr
                  key={task.id}
                  className="border-b border-gray-800 last:border-0"
                >
                  <td className="px-4 py-3 text-white font-medium">
                    {task.title}
                  </td>
                  <td className="px-4 py-3 text-gray-300">
                    {task.project.name}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full border px-2 py-0.5 text-xs ${STATUS_STYLES[task.status]}`}
                    >
                      {STATUS_LABELS[task.status]}
                    </span>
                  </td>
                  <td
                    className={`px-4 py-3 font-medium ${PRIORITY_STYLES[task.priority]}`}
                  >
                    {PRIORITY_LABELS[task.priority]}
                  </td>
                  <td className="px-4 py-3 text-gray-300">
                    {formatDate(task.dueDate)}
                  </td>
                  <td className="px-4 py-3 text-right space-x-3 whitespace-nowrap">
                    <button
                      onClick={() => startEdit(task)}
                      className="text-gray-300 hover:text-white text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(task.id)}
                      disabled={deletingId === task.id}
                      className="text-red-400 hover:text-red-300 text-sm disabled:opacity-50"
                    >
                      {deletingId === task.id ? "Deleting..." : "Delete"}
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
