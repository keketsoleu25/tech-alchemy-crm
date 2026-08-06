import { LeadStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const updateSchema = z.object({
  status: z.nativeEnum(LeadStatus).optional(),
  name: z.string().optional(),
  businessName: z.string().optional().or(z.literal("")),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  service: z.string().optional().or(z.literal("")),
  selectedPackage: z.string().optional().or(z.literal("")),
});

export async function GET(req: Request, ctx: any) {
  const params = ctx?.params ?? {};
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const lead = await prisma.lead.findFirst({ where: { id: params.id, userId: session.user.id } });
  if (!lead) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ lead });
}

export async function PATCH(req: Request, ctx: any) {
  const params = ctx?.params ?? {};
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });

    const lead = await prisma.lead.updateMany({ where: { id: params.id, userId: session.user.id }, data: parsed.data });
    if (lead.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Update lead error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, ctx: any) {
  const params = ctx?.params ?? {};
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await prisma.lead.deleteMany({ where: { id: params.id, userId: session.user.id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete lead error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
