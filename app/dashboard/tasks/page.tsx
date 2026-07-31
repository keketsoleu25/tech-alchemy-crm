import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import TasksManager from "@/components/tasks-manager";

export default async function TasksPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const [tasks, projects] = await Promise.all([
    prisma.task.findMany({
      where: { userId: session.user.id },
      include: { project: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.project.findMany({
      where: { userId: session.user.id },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const serializedTasks = tasks.map((task) => ({
    ...task,
    dueDate: task.dueDate ? task.dueDate.toISOString() : null,
  }));

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">
          Dashboard
        </p>
        <h1 className="text-3xl font-bold text-white mb-1">Tasks</h1>
        <p className="text-gray-400 mb-8">
          Keep track of what needs to get done on each project.
        </p>

        <TasksManager initialTasks={serializedTasks} projects={projects} />
      </div>
    </div>
  );
}
