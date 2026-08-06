import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import LeadsManager from "@/components/leads-manager";

const PAGE_SIZE = 10;

export default async function LeadsPage({ searchParams }: { searchParams?: { page?: string } }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const page = Math.max(1, parseInt(searchParams?.page ?? "1", 10) || 1);

  const [leads, total] = await Promise.all([
    prisma.lead.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: "desc" }, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE }),
    prisma.lead.count({ where: { userId: session.user.id } }),
  ]);

  const serialized = leads.map((l) => ({
  ...l,
  createdAt: l.createdAt.toISOString(),
  budget: l.budget !== null ? l.budget.toString() : null,
}));

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-white mb-2">Leads</h1>
      <p className="text-gray-400 mb-6">Manage incoming enquiries and convert them to clients.</p>
      <LeadsManager initialLeads={serialized} initialTotal={total} pageSize={PAGE_SIZE} />
    </div>
  );
}
