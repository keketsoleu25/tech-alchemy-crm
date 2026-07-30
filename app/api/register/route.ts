import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { generateToken, getTokenExpiry } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/mail";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

const registerSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  email: z.string().email(),
  password: z.string().min(6).max(100),
});

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const { success } = rateLimit(`register:${ip}`, 5, 15 * 60 * 1000);
    if (!success) {
      return NextResponse.json(
        { error: "Too many registration attempts. Try again later." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    if (!hashedPassword || !hashedPassword.startsWith("$2")) {
      console.error("Password hashing failed for registration:", email);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }

    const emailVerifyToken = generateToken();
    const emailVerifyExpires = getTokenExpiry(24);

    const user = await prisma.user.create({
      data: {
        name: name || null,
        email,
        password: hashedPassword,
        emailVerifyToken,
        emailVerifyExpires,
        role: "USER",
      },
    });

    try {
      await sendVerificationEmail(email, emailVerifyToken);
    } catch (mailErr) {
      console.error("Failed to send verification email:", mailErr);
    }

    return NextResponse.json(
      {
        message: "Registration successful. Please check your email to verify your account.",
        userId: user.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}