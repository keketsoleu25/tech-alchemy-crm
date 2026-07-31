import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

function money(n: number) {
  return `R ${n.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = session.user.id;

  const [
    clientCount,
    activeProjectCount,
    openTaskCount,
    unpaidInvoices,
    unreadNotificationCount,
  ] = await Promise.all([
    prisma.client.count({ where: { userId } }),
    prisma.project.count({
      where: { userId, status: { in: ["PLANNING", "ACTIVE"] } },
    }),
    prisma.task.count({
      where: { userId, status: { in: ["TODO", "IN_PROGRESS"] } },
    }),
    prisma.invoice.findMany({
      where: { userId, status: { in: ["DRAFT", "SENT", "OVERDUE"] } },
      include: { lineItems: true },
    }),
    prisma.notification.count({
      where: { userId, readAt: null, deletedAt: null },
    }),
  ]);

  const outstandingTotal = unpaidInvoices.reduce((sum, inv) => {
    const subtotal = inv.lineItems.reduce(
      (s, li) => s + Number(li.quantity) * Number(li.unitPrice),
      0
    );
    const tax = subtotal * (Number(inv.taxRate ?? 0) / 100);
    return sum + subtotal + tax;
  }, 0);

  const stats = [
    {
      label: "Clients",
      value: clientCount,
      href: "/dashboard/clients",
    },
    {
      label: "Active projects",
      value: activeProjectCount,
      href: "/dashboard/projects",
    },
    {
      label: "Open tasks",
      value: openTaskCount,
      href: "/dashboard/tasks",
    },
    {
      label: "Outstanding invoices",
      value: money(outstandingTotal),
      sublabel: `${unpaidInvoices.length} unpaid`,
      href: "/dashboard/invoices",
    },
    {
      label: "Unread notifications",
      value: unreadNotificationCount,
      href: "/dashboard/notifications",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <p className="mb-2 text-xs font-medium uppercase tracking-widest text-gray-500">
        Dashboard
      </p>
      <h1 className="text-3xl font-bold tracking-tight text-white">
        Welcome back
        {session.user.name ? `, ${session.user.name.split(" ")[0]}` : ""}
      </h1>
      <p className="mt-2 text-gray-400">
        Here&apos;s what&apos;s happening across your CRM.
      </p>

      <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="rounded-xl border border-gray-800 bg-gray-950 p-4 hover:border-gray-700 hover:bg-gray-900 transition-colors"
          >
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-sm text-gray-400 mt-1">{stat.label}</p>
            {stat.sublabel && (
              <p className="text-xs text-gray-600 mt-0.5">{stat.sublabel}</p>
            )}
          </Link>
        ))}
      </div>

      <div className="mt-8 space-y-3 rounded-xl border border-gray-800 bg-gray-950 p-6">
        <p className="text-xs font-medium uppercase tracking-widest text-gray-500 mb-1">
          Session
        </p>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Email</span>
          <strong className="text-white">{session.user.email}</strong>
        </div>
        <div className="h-px bg-gray-800" />
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Name</span>
          <span className="text-gray-300">{session.user.name || "—"}</span>
        </div>
        <div className="h-px bg-gray-800" />
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Role</span>
          <span className="rounded-full bg-gray-800 px-2.5 py-0.5 text-xs font-medium text-gray-300">
            {session.user.role}
          </span>
        </div>
        <div className="h-px bg-gray-800" />
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">User ID</span>
          <code className="max-w-[60%] truncate font-mono text-xs text-gray-500">
            {session.user.id}
          </code>
        </div>
      </div>

      {session.user.role === "ADMIN" && (
        <p className="mt-6 text-sm text-gray-500">
          Admin privileges enabled.{" "}
          <Link
            href="/admin"
            className="underline underline-offset-4 text-gray-300 hover:text-white"
          >
            Open admin panel
          </Link>
        </p>
      )}
    </div>
  );
}
