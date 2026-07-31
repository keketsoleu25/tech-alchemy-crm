import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ClientsManager from "@/components/clients-manager";

export default async function ClientsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const clients = await prisma.client.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  const serializedClients = clients.map((client) => ({
    ...client,
    createdAt: client.createdAt.toISOString(),
    updatedAt: client.updatedAt.toISOString(),
  }));

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">
          Dashboard
        </p>
        <h1 className="text-3xl font-bold text-white mb-1">Clients</h1>
        <p className="text-gray-400 mb-8">
          Manage the people and companies you work with.
        </p>

        <ClientsManager initialClients={serializedClients} />
      </div>
    </div>
  );
}
