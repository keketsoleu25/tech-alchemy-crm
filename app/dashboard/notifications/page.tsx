import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import NotificationsManager from "@/components/notifications-manager";

export default async function NotificationsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id, deletedAt: null },
    orderBy: { createdAt: "desc" },
  });

  const serialized = notifications.map((n) => ({
    ...n,
    readAt: n.readAt ? n.readAt.toISOString() : null,
    createdAt: n.createdAt.toISOString(),
  }));

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">
        Dashboard
      </p>
      <h1 className="text-3xl font-bold text-white mb-1">Notifications</h1>
      <p className="text-gray-400 mb-8">
        Stay on top of updates across your CRM.
      </p>

      <NotificationsManager initialNotifications={serialized} />
    </div>
  );
}
