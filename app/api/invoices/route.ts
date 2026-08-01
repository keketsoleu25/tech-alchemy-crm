import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

const PAGE_SIZE = 10;

const positiveNumberString = (label: string) =>
  z
    .string()
    .min(1, `${label} is required`)
    .refine((val) => !isNaN(Number(val)), `${label} must be a valid number`)
    .refine((val) => Number(val) >= 0, `${label} cannot be negative`)
    .refine((val) => Number(val) <= 1000000, `${label} is unreasonably large`);

const lineItemSchema = z.object({
  description: z.string().min(1, "Description is required").max(300),
  quantity: positiveNumberString("Quantity"),
  unitPrice: positiveNumberString("Unit price"),
});

const invoiceSchema = z.object({
  status: z.enum(["DRAFT", "SENT", "PAID", "OVERDUE", "CANCELLED"]),
  issueDate: z.string().optional().or(z.literal("")),
  dueDate: z.string().optional().or(z.literal("")),
  notes: z.string().max(2000).optional().or(z.literal("")),
  taxRate: z.string().optional().or(z.literal("")),
  clientId: z.string().optional().or(z.literal("")),
  projectId: z.string().optional().or(z.literal("")),
  lineItems: z
    .array(lineItemSchema)
    .min(1, "At least one line item is required"),
});

function generateInvoiceNumber(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `INV-${ts}-${rand}`;
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);

  const [invoices, total] = await Promise.all([
    prisma.invoice.findMany({
      where: { userId: session.user.id },
      include: {
        client: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } },
        lineItems: true,
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.invoice.count({ where: { userId: session.user.id } }),
  ]);

  return NextResponse.json({
    invoices,
    page,
    pageSize: PAGE_SIZE,
    total,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { success } = rateLimit(
    `create-invoice:${session.user.id}`,
    30,
    15 * 60 * 1000
  );
  if (!success) {
    return NextResponse.json(
      { error: "Too many requests. Please slow down and try again shortly." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const parsed = invoiceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const {
      status,
      issueDate,
      dueDate,
      notes,
      taxRate,
      clientId,
      projectId,
      lineItems,
    } = parsed.data;

    if (clientId) {
      const client = await prisma.client.findFirst({
        where: { id: clientId, userId: session.user.id },
      });
      if (!client) {
        return NextResponse.json(
          { error: "Selected client not found" },
          { status: 400 }
        );
      }
    }

    if (projectId) {
      const project = await prisma.project.findFirst({
        where: { id: projectId, userId: session.user.id },
      });
      if (!project) {
        return NextResponse.json(
          { error: "Selected project not found" },
          { status: 400 }
        );
      }
    }

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: generateInvoiceNumber(),
        status,
        issueDate: issueDate ? new Date(issueDate) : new Date(),
        dueDate: dueDate ? new Date(dueDate) : null,
        notes: notes || null,
        taxRate: taxRate ? taxRate : null,
        clientId: clientId || null,
        projectId: projectId || null,
        userId: session.user.id,
        lineItems: {
          create: lineItems.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        },
      },
      include: {
        client: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } },
        lineItems: true,
      },
    });

    return NextResponse.json({ invoice }, { status: 201 });
  } catch (error) {
    console.error("Create invoice error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
