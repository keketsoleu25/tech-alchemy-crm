"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type AdminUser = {
  id: string;
  name: string | null;
  email: string;
  role: "USER" | "ADMIN";
  emailVerified: string | null;
  createdAt: string;
  _count: { clients: number; projects: number; invoices: number };
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString();
}

export default function AdminUsersManager({
  initialUsers,
  currentUserId,
}: {
  initialUsers: AdminUser[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>(initialUsers);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function toggleRole(user: AdminUser) {
    const newRole = user.role === "ADMIN" ? "USER" : "ADMIN";
    if (
      !confirm(
        `Change ${user.email}'s role from ${user.role} to ${newRole}?`
      )
    )
      return;

    setBusyId(user.id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to update role");
        return;
      }
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? data.user : u))
      );
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <p className="text-sm text-gray-400 mb-6">
        {users.length} {users.length === 1 ? "user" : "users"}
      </p>

      {error && (
        <p className="mb-4 text-sm text-red-400 bg-red-950/40 border border-red-900 rounded-md px-3 py-2">
          {error}
        </p>
      )}

      <div className="rounded-lg border border-gray-800 bg-gray-950 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-left text-gray-400">
              <th className="px-4 py-3 font-normal">Name</th>
              <th className="px-4 py-3 font-normal">Email</th>
              <th className="px-4 py-3 font-normal">Role</th>
              <th className="px-4 py-3 font-normal">Verified</th>
              <th className="px-4 py-3 font-normal">Data</th>
              <th className="px-4 py-3 font-normal">Joined</th>
              <th className="px-4 py-3 font-normal text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-b border-gray-800 last:border-0"
              >
                <td className="px-4 py-3 text-white font-medium">
                  {user.name || "—"}
                </td>
                <td className="px-4 py-3 text-gray-300">{user.email}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded-full border px-2 py-0.5 text-xs ${
                      user.role === "ADMIN"
                        ? "bg-purple-950 text-purple-300 border-purple-900"
                        : "bg-gray-800 text-gray-300 border-gray-700"
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-300">
                  {user.emailVerified ? "Yes" : "No"}
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs">
                  {user._count.clients}c / {user._count.projects}p /{" "}
                  {user._count.invoices}i
                </td>
                <td className="px-4 py-3 text-gray-300">
                  {formatDate(user.createdAt)}
                </td>
                <td className="px-4 py-3 text-right">
                  {user.id === currentUserId ? (
                    <span className="text-xs text-gray-600">You</span>
                  ) : (
                    <button
                      onClick={() => toggleRole(user)}
                      disabled={busyId === user.id}
                      className="text-gray-300 hover:text-white text-sm disabled:opacity-50"
                    >
                      {busyId === user.id
                        ? "Updating..."
                        : user.role === "ADMIN"
                        ? "Demote to USER"
                        : "Promote to ADMIN"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
