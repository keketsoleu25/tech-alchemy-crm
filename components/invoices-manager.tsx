"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type InvoiceStatus = "DRAFT" | "SENT" | "PAID" | "OVERDUE" | "CANCELLED";

type LineItem = {
  id?: string;
  description: string;
  quantity: string;
  unitPrice: string;
};

type Invoice = {
  id: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string | null;
  notes: string | null;
  taxRate: string | null;
  clientId: string | null;
  projectId: string | null;
  client: { id: string; name: string } | null;
  project: { id: string; name: string } | null;
  lineItems: LineItem[];
};

type ClientOption = { id: string; name: string };
type ProjectOption = { id: string; name: string };

type FormState = {
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  notes: string;
  taxRate: string;
  clientId: string;
  projectId: string;
  lineItems: LineItem[];
};

const emptyLineItem: LineItem = { description: "", quantity: "1", unitPrice: "0" };

const emptyForm: FormState = {
  status: "DRAFT",
  issueDate: "",
  dueDate: "",
  notes: "",
  taxRate: "",
  clientId: "",
  projectId: "",
  lineItems: [{ ...emptyLineItem }],
};

const STATUS_LABELS: Record<InvoiceStatus, string> = {
  DRAFT: "Draft",
  SENT: "Sent",
  PAID: "Paid",
  OVERDUE: "Overdue",
  CANCELLED: "Cancelled",
};

const STATUS_STYLES: Record<InvoiceStatus, string> = {
  DRAFT: "bg-gray-800 text-gray-300 border-gray-700",
  SENT: "bg-blue-950 text-blue-300 border-blue-900",
  PAID: "bg-green-950 text-green-300 border-green-900",
  OVERDUE: "bg-red-950 text-red-300 border-red-900",
  CANCELLED: "bg-gray-800 text-gray-500 border-gray-700",
};

function money(n: number) {
  return `R ${n.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function calcTotals(lineItems: LineItem[], taxRate: string) {
  const subtotal = lineItems.reduce((sum, item) => {
    const qty = parseFloat(item.quantity) || 0;
    const price = parseFloat(item.unitPrice) || 0;
    return sum + qty * price;
  }, 0);
  const rate = parseFloat(taxRate) || 0;
  const tax = subtotal * (rate / 100);
  const total = subtotal + tax;
  return { subtotal, tax, total };
}

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString();
}

export default function InvoicesManager({
  initialInvoices,
  clients,
  projects,
}: {
  initialInvoices: Invoice[];
  clients: ClientOption[];
  projects: ProjectOption[];
}) {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function startCreate() {
    setEditingId(null);
    setForm({ ...emptyForm, lineItems: [{ ...emptyLineItem }] });
    setError(null);
    setShowForm(true);
  }

  function startEdit(invoice: Invoice) {
    setEditingId(invoice.id);
    setForm({
      status: invoice.status,
      issueDate: invoice.issueDate ? invoice.issueDate.slice(0, 10) : "",
      dueDate: invoice.dueDate ? invoice.dueDate.slice(0, 10) : "",
      notes: invoice.notes ?? "",
      taxRate: invoice.taxRate ?? "",
      clientId: invoice.clientId ?? "",
      projectId: invoice.projectId ?? "",
      lineItems: invoice.lineItems.length
        ? invoice.lineItems.map((li) => ({
            description: li.description,
            quantity: li.quantity,
            unitPrice: li.unitPrice,
          }))
        : [{ ...emptyLineItem }],
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

  function updateLineItem(index: number, field: keyof LineItem, value: string) {
    setForm((prev) => {
      const lineItems = [...prev.lineItems];
      lineItems[index] = { ...lineItems[index], [field]: value };
      return { ...prev, lineItems };
    });
  }

  function addLineItem() {
    setForm((prev) => ({
      ...prev,
      lineItems: [...prev.lineItems, { ...emptyLineItem }],
    }));
  }

  function removeLineItem(index: number) {
    setForm((prev) => ({
      ...prev,
      lineItems: prev.lineItems.filter((_, i) => i !== index),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const url = editingId ? `/api/invoices/${editingId}` : "/api/invoices";
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
        setInvoices((prev) =>
          prev.map((inv) => (inv.id === editingId ? data.invoice : inv))
        );
      } else {
        setInvoices((prev) => [data.invoice, ...prev]);
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
    if (!confirm("Delete this invoice? This cannot be undone.")) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/invoices/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to delete invoice");
        return;
      }
      setInvoices((prev) => prev.filter((inv) => inv.id !== id));
      router.refresh();
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }

  const formTotals = calcTotals(form.lineItems, form.taxRate);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-400">
          {invoices.length} {invoices.length === 1 ? "invoice" : "invoices"}
        </p>
        {!showForm && (
          <button
            onClick={startCreate}
            className="rounded-md border border-gray-700 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
          >
            Add invoice
          </button>
        )}
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-6 rounded-lg border border-gray-800 bg-gray-950 p-6 space-y-5"
        >
          <h2 className="text-sm font-medium text-white">
            {editingId ? "Edit invoice" : "New invoice"}
          </h2>

          {error && (
            <p className="text-sm text-red-400 bg-red-950/40 border border-red-900 rounded-md px-3 py-2">
              {error}
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                Project
              </label>
              <select
                value={form.projectId}
                onChange={(e) =>
                  setForm({ ...form, projectId: e.target.value })
                }
                className="w-full rounded-md border border-gray-700 bg-black px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                <option value="">No project</option>
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
                  setForm({
                    ...form,
                    status: e.target.value as InvoiceStatus,
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
                Issue date
              </label>
              <input
                type="date"
                value={form.issueDate}
                onChange={(e) =>
                  setForm({ ...form, issueDate: e.target.value })
                }
                className="w-full rounded-md border border-gray-700 bg-black px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-gray-500"
              />
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

            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Tax rate (%)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.taxRate}
                onChange={(e) =>
                  setForm({ ...form, taxRate: e.target.value })
                }
                className="w-full rounded-md border border-gray-700 bg-black px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-gray-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs text-gray-400">
                Line items *
              </label>
              <button
                type="button"
                onClick={addLineItem}
                className="text-xs text-gray-300 hover:text-white"
              >
                + Add line
              </button>
            </div>

            <div className="space-y-2">
              {form.lineItems.map((item, index) => {
                const qty = parseFloat(item.quantity) || 0;
                const price = parseFloat(item.unitPrice) || 0;
                const lineTotal = qty * price;
                return (
                  <div
                    key={index}
                    className="grid grid-cols-12 gap-2 items-center"
                  >
                    <input
                      type="text"
                      placeholder="Description"
                      required
                      value={item.description}
                      onChange={(e) =>
                        updateLineItem(index, "description", e.target.value)
                      }
                      className="col-span-6 rounded-md border border-gray-700 bg-black px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-gray-500"
                    />
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Qty"
                      required
                      value={item.quantity}
                      onChange={(e) =>
                        updateLineItem(index, "quantity", e.target.value)
                      }
                      className="col-span-2 rounded-md border border-gray-700 bg-black px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-gray-500"
                    />
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Unit price"
                      required
                      value={item.unitPrice}
                      onChange={(e) =>
                        updateLineItem(index, "unitPrice", e.target.value)
                      }
                      className="col-span-2 rounded-md border border-gray-700 bg-black px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-gray-500"
                    />
                    <div className="col-span-1 text-xs text-gray-400 text-right">
                      {money(lineTotal)}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeLineItem(index)}
                      disabled={form.lineItems.length === 1}
                      className="col-span-1 text-red-400 hover:text-red-300 text-sm disabled:opacity-30"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border-t border-gray-800 pt-4 space-y-1 text-sm max-w-xs ml-auto">
            <div className="flex justify-between text-gray-400">
              <span>Subtotal</span>
              <span>{money(formTotals.subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Tax</span>
              <span>{money(formTotals.tax)}</span>
            </div>
            <div className="flex justify-between text-white font-medium">
              <span>Total</span>
              <span>{money(formTotals.total)}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
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
                : "Create invoice"}
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

      {invoices.length === 0 ? (
        <div className="rounded-lg border border-gray-800 bg-gray-950 p-10 text-center">
          <p className="text-gray-400 text-sm">
            No invoices yet. Add your first one to get started.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-800 bg-gray-950 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-left text-gray-400">
                <th className="px-4 py-3 font-normal">Invoice #</th>
                <th className="px-4 py-3 font-normal">Client</th>
                <th className="px-4 py-3 font-normal">Status</th>
                <th className="px-4 py-3 font-normal">Total</th>
                <th className="px-4 py-3 font-normal">Due</th>
                <th className="px-4 py-3 font-normal text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => {
                const totals = calcTotals(
                  invoice.lineItems,
                  invoice.taxRate ?? "0"
                );
                return (
                  <tr
                    key={invoice.id}
                    className="border-b border-gray-800 last:border-0"
                  >
                    <td className="px-4 py-3 text-white font-medium">
                      {invoice.invoiceNumber}
                    </td>
                    <td className="px-4 py-3 text-gray-300">
                      {invoice.client?.name || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full border px-2 py-0.5 text-xs ${STATUS_STYLES[invoice.status]}`}
                      >
                        {STATUS_LABELS[invoice.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-300">
                      {money(totals.total)}
                    </td>
                    <td className="px-4 py-3 text-gray-300">
                      {formatDate(invoice.dueDate)}
                    </td>
                    <td className="px-4 py-3 text-right space-x-3 whitespace-nowrap">
                      <button
                        onClick={() => startEdit(invoice)}
                        className="text-gray-300 hover:text-white text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(invoice.id)}
                        disabled={deletingId === invoice.id}
                        className="text-red-400 hover:text-red-300 text-sm disabled:opacity-50"
                      >
                        {deletingId === invoice.id ? "Deleting..." : "Delete"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
