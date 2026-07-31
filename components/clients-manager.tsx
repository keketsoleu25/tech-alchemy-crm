"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Client = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  notes: string | null;
  createdAt: string;
};

type FormState = {
  name: string;
  email: string;
  phone: string;
  company: string;
  notes: string;
};

const emptyForm: FormState = {
  name: "",
  email: "",
  phone: "",
  company: "",
  notes: "",
};

export default function ClientsManager({
  initialClients,
}: {
  initialClients: Client[];
}) {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function startCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setError(null);
    setShowForm(true);
  }

  function startEdit(client: Client) {
    setEditingId(client.id);
    setForm({
      name: client.name,
      email: client.email ?? "",
      phone: client.phone ?? "",
      company: client.company ?? "",
      notes: client.notes ?? "",
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

    const url = editingId ? `/api/clients/${editingId}` : "/api/clients";
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

      if (editingId) {
        setClients((prev) =>
          prev.map((c) => (c.id === editingId ? data.client : c))
        );
      } else {
        setClients((prev) => [data.client, ...prev]);
      }

      cancelForm();
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this client? This cannot be undone.")) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/clients/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to delete client");
        return;
      }
      setClients((prev) => prev.filter((c) => c.id !== id));
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
          {clients.length} {clients.length === 1 ? "client" : "clients"}
        </p>
        {!showForm && (
          <button
            onClick={startCreate}
            className="rounded-md border border-gray-700 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
          >
            Add client
          </button>
        )}
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-6 rounded-lg border border-gray-800 bg-gray-950 p-6 space-y-4"
        >
          <h2 className="text-sm font-medium text-white">
            {editingId ? "Edit client" : "New client"}
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
                Company
              </label>
              <input
                type="text"
                value={form.company}
                onChange={(e) =>
                  setForm({ ...form, company: e.target.value })
                }
                className="w-full rounded-md border border-gray-700 bg-black px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-gray-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-md border border-gray-700 bg-black px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-gray-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Phone
              </label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full rounded-md border border-gray-700 bg-black px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-gray-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
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
                : "Create client"}
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

      {clients.length === 0 ? (
        <div className="rounded-lg border border-gray-800 bg-gray-950 p-10 text-center">
          <p className="text-gray-400 text-sm">
            No clients yet. Add your first one to get started.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-800 bg-gray-950 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-left text-gray-400">
                <th className="px-4 py-3 font-normal">Name</th>
                <th className="px-4 py-3 font-normal">Company</th>
                <th className="px-4 py-3 font-normal">Email</th>
                <th className="px-4 py-3 font-normal">Phone</th>
                <th className="px-4 py-3 font-normal text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr
                  key={client.id}
                  className="border-b border-gray-800 last:border-0"
                >
                  <td className="px-4 py-3 text-white font-medium">
                    {client.name}
                  </td>
                  <td className="px-4 py-3 text-gray-300">
                    {client.company || "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-300">
                    {client.email || "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-300">
                    {client.phone || "—"}
                  </td>
                  <td className="px-4 py-3 text-right space-x-3 whitespace-nowrap">
                    <button
                      onClick={() => startEdit(client)}
                      className="text-gray-300 hover:text-white text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(client.id)}
                      disabled={deletingId === client.id}
                      className="text-red-400 hover:text-red-300 text-sm disabled:opacity-50"
                    >
                      {deletingId === client.id ? "Deleting..." : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
