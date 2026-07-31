"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type NotificationType =
  | "INFO"
  | "SUCCESS"
  | "WARNING"
  | "ERROR"
  | "TASK_ASSIGNED"
  | "INVOICE_DUE"
  | "LEAD_UPDATE"
  | "PROJECT_UPDATE"
  | "SYSTEM";

type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  actionUrl: string | null;
  readAt: string | null;
  createdAt: string;
};

type FormState = {
  type: NotificationType;
  title: string;
  message: string;
  actionUrl: string;
};

const emptyForm: FormState = {
  type: "INFO",
  title: "",
  message: "",
  actionUrl: "",
};

const TYPE_LABELS: Record<NotificationType, string> = {
  INFO: "Info",
  SUCCESS: "Success",
  WARNING: "Warning",
  ERROR: "Error",
  TASK_ASSIGNED: "Task assigned",
  INVOICE_DUE: "Invoice due",
  LEAD_UPDATE: "Lead update",
  PROJECT_UPDATE: "Project update",
  SYSTEM: "System",
};

const TYPE_STYLES: Record<NotificationType, string> = {
  INFO: "bg-blue-950 text-blue-300 border-blue-900",
  SUCCESS: "bg-green-950 text-green-300 border-green-900",
  WARNING: "bg-yellow-950 text-yellow-300 border-yellow-900",
  ERROR: "bg-red-950 text-red-300 border-red-900",
  TASK_ASSIGNED: "bg-purple-950 text-purple-300 border-purple-900",
  INVOICE_DUE: "bg-orange-950 text-orange-300 border-orange-900",
  LEAD_UPDATE: "bg-teal-950 text-teal-300 border-teal-900",
  PROJECT_UPDATE: "bg-indigo-950 text-indigo-300 border-indigo-900",
  SYSTEM: "bg-gray-800 text-gray-300 border-gray-700",
};

function formatDateTime(value: string) {
  return new Date(value).toLocaleString();
}

export default function NotificationsManager({
  initialNotifications,
}: {
  initialNotifications: Notification[];
}) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>(
    initialNotifications
  );
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        setSubmitting(false);
        return;
      }

      setNotifications((prev) => [data.notification, ...prev]);
      setForm(emptyForm);
      setShowForm(false);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleRead(notification: Notification) {
    setBusyId(notification.id);
    try {
      const res = await fetch(`/api/notifications/${notification.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: notification.readAt ? "mark_unread" : "mark_read",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to update notification");
        return;
      }
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? data.notification : n))
      );
      router.refresh();
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this notification?")) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/notifications/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to delete notification");
        return;
      }
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      router.refresh();
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setBusyId(null);
    }
  }

  const visible = notifications.filter((n) =>
    filter === "unread" ? !n.readAt : true
  );
  const unreadCount = notifications.filter((n) => !n.readAt).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <p className="text-sm text-gray-400">
            {unreadCount} unread of {notifications.length}
          </p>
          <div className="flex rounded-md border border-gray-700 overflow-hidden text-xs">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 ${
                filter === "all"
                  ? "bg-gray-800 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`px-3 py-1.5 border-l border-gray-700 ${
                filter === "unread"
                  ? "bg-gray-800 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Unread
            </button>
          </div>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="rounded-md border border-gray-700 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
          >
            Add notification
          </button>
        )}
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-6 rounded-lg border border-gray-800 bg-gray-950 p-6 space-y-4"
        >
          <h2 className="text-sm font-medium text-white">New notification</h2>

          {error && (
            <p className="text-sm text-red-400 bg-red-950/40 border border-red-900 rounded-md px-3 py-2">
              {error}
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Type
              </label>
              <select
                value={form.type}
                onChange={(e) =>
                  setForm({ ...form, type: e.target.value as NotificationType })
                }
                className="w-full rounded-md border border-gray-700 bg-black px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                {Object.entries(TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Action URL (optional)
              </label>
              <input
                type="text"
                value={form.actionUrl}
                onChange={(e) =>
                  setForm({ ...form, actionUrl: e.target.value })
                }
                placeholder="/dashboard/invoices"
                className="w-full rounded-md border border-gray-700 bg-black px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-gray-500"
              />
            </div>
          </div>

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
              Message *
            </label>
            <textarea
              required
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
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
              {submitting ? "Saving..." : "Create notification"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setError(null);
                setForm(emptyForm);
              }}
              className="rounded-md border border-gray-700 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {visible.length === 0 ? (
        <div className="rounded-lg border border-gray-800 bg-gray-950 p-10 text-center">
          <p className="text-gray-400 text-sm">
            {filter === "unread" ? "No unread notifications." : "No notifications yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {visible.map((n) => (
            <div
              key={n.id}
              className={`rounded-lg border p-4 flex items-start justify-between gap-4 ${
                n.readAt
                  ? "border-gray-800 bg-gray-950"
                  : "border-gray-700 bg-gray-900"
              }`}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`inline-block rounded-full border px-2 py-0.5 text-xs ${TYPE_STYLES[n.type]}`}
                  >
                    {TYPE_LABELS[n.type]}
                  </span>
                  {!n.readAt && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white inline-block" />
                  )}
                  <span className="text-xs text-gray-500">
                    {formatDateTime(n.createdAt)}
                  </span>
                </div>
                <p className="text-white font-medium">{n.title}</p>
                <p className="text-gray-400 text-sm">{n.message}</p>
                {n.actionUrl && (
                  <a
                    href={n.actionUrl}
                    className="text-xs text-blue-400 hover:text-blue-300"
                  >
                    {n.actionUrl}
                  </a>
                )}
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <button
                  onClick={() => toggleRead(n)}
                  disabled={busyId === n.id}
                  className="text-gray-300 hover:text-white text-xs whitespace-nowrap disabled:opacity-50"
                >
                  {n.readAt ? "Mark unread" : "Mark read"}
                </button>
                <button
                  onClick={() => handleDelete(n.id)}
                  disabled={busyId === n.id}
                  className="text-red-400 hover:text-red-300 text-xs disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
