import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import InvoicesManager from "@/components/invoices-manager";

const PAGE_SIZE = 10;

export default async function InvoicesPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const [invoices, total, clients, projects] = await Promise.all([
    prisma.invoice.findMany({
      where: { userId: session.user.id },
      include: {
        client: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } },
        lineItems: true,
      },
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE,
    }),
    prisma.invoice.count({ where: { userId: session.user.id } }),
    prisma.client.findMany({
      where: { userId: session.user.id },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.project.findMany({
      where: { userId: session.user.id },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const serializedInvoices = invoices.map((invoice) => ({
    ...invoice,
    issueDate: invoice.issueDate.toISOString(),
    dueDate: invoice.dueDate ? invoice.dueDate.toISOString() : null,
    taxRate: invoice.taxRate ? invoice.taxRate.toString() : null,
    lineItems: invoice.lineItems.map((li) => ({
      id: li.id,
      description: li.description,
      quantity: li.quantity.toString(),
      unitPrice: li.unitPrice.toString(),
    })),
  }));

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">
          Dashboard
        </p>
        <h1 className="text-3xl font-bold text-white mb-1">Invoices</h1>
        <p className="text-gray-400 mb-8">
          Create and track invoices for your clients and projects.
        </p>

        <InvoicesManager
          initialInvoices={serializedInvoices}
          initialTotal={total}
          pageSize={PAGE_SIZE}
          clients={clients}
          projects={projects}
        />
      </div>
    </div>
  );
}
