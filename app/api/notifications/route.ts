import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const NOTIFICATION_TYPES = [
  "INFO",
  "SUCCESS",
  "WARNING",
  "ERROR",
  "TASK_ASSIGNED",
  "INVOICE_DUE",
  "LEAD_UPDATE",
  "PROJECT_UPDATE",
  "SYSTEM",
] as const;

const notificationSchema = z.object({
  type: z.enum(NOTIFICATION_TYPES),
  title: z.string().min(1, "Title is required").max(150),
  message: z.string().min(1, "Message is required").max(1000),
  actionUrl: z.string().max(500).optional().or(z.literal("")),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id, deletedAt: null },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ notifications });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = notificationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { type, title, message, actionUrl } = parsed.data;

    const notification = await prisma.notification.create({
      data: {
        type,
        title,
        message,
        actionUrl: actionUrl || null,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ notification }, { status: 201 });
  } catch (error) {
    console.error("Create notification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
