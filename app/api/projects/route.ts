import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

const PAGE_SIZE = 10;

const projectSchema = z.object({
  name: z.string().min(1, "Name is required").max(150),
  description: z.string().max(2000).optional().or(z.literal("")),
  status: z.enum(["PLANNING", "ACTIVE", "ON_HOLD", "COMPLETED", "CANCELLED"]),
  budget: z.string().optional().or(z.literal("")),
  startDate: z.string().optional().or(z.literal("")),
  endDate: z.string().optional().or(z.literal("")),
  clientId: z.string().optional().or(z.literal("")),
});

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);

  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      where: { userId: session.user.id },
      include: { client: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.project.count({ where: { userId: session.user.id } }),
  ]);

  return NextResponse.json({
    projects,
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
    `create-project:${session.user.id}`,
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
    const parsed = projectSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { name, description, status, budget, startDate, endDate, clientId } =
      parsed.data;

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

    const project = await prisma.project.create({
      data: {
        name,
        description: description || null,
        status,
        budget: budget ? budget : null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        clientId: clientId || null,
        userId: session.user.id,
      },
      include: { client: { select: { id: true, name: true } } },
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    console.error("Create project error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
