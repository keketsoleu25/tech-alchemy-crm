import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ProjectsManager from "@/components/projects-manager";

export default async function ProjectsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const [projects, clients] = await Promise.all([
    prisma.project.findMany({
      where: { userId: session.user.id },
      include: { client: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.client.findMany({
      where: { userId: session.user.id },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const serializedProjects = projects.map((project) => ({
    ...project,
    budget: project.budget ? project.budget.toString() : null,
    startDate: project.startDate ? project.startDate.toISOString() : null,
    endDate: project.endDate ? project.endDate.toISOString() : null,
  }));

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">
          Dashboard
        </p>
        <h1 className="text-3xl font-bold text-white mb-1">Projects</h1>
        <p className="text-gray-400 mb-8">
          Track work in progress and link it back to your clients.
        </p>

        <ProjectsManager
          initialProjects={serializedProjects}
          clients={clients}
        />
      </div>
    </div>
  );
}
