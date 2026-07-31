import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DashboardNav from "@/components/dashboard-nav";
import AdminUsersManager from "@/components/admin-users-manager";

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      emailVerified: true,
      createdAt: true,
      _count: {
        select: { clients: true, projects: true, invoices: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const serializedUsers = users.map((u) => ({
    ...u,
    emailVerified: u.emailVerified ? u.emailVerified.toISOString() : null,
    createdAt: u.createdAt.toISOString(),
  }));

  return (
    <div className="min-h-screen bg-black">
      <DashboardNav isAdmin />
      <div className="max-w-6xl mx-auto px-6 py-10">
        <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">
          Admin
        </p>
        <h1 className="text-3xl font-bold text-white mb-1">User management</h1>
        <p className="text-gray-400 mb-8">
          View all registered users and manage their access level.
        </p>

        <AdminUsersManager
          initialUsers={serializedUsers}
          currentUserId={session.user.id}
        />
      </div>
    </div>
  );
}
