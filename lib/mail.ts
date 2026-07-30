import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(email: string, token: string) {
  const verifyUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`;

  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM || "Tech Alchemy CRM <onboarding@resend.dev>",
    to: email,
    subject: "Verify your email address — Tech Alchemy CRM",
    html: `
      <h2>Email Verification</h2>
      <p>Click the link below to verify your email address:</p>
      <a href="${verifyUrl}">${verifyUrl}</a>
      <p>This link expires in 24 hours.</p>
    `,
  });

  if (error) {
    console.error("Resend error:", error);
    throw new Error("Failed to send verification email");
  }
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;

  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM || "Tech Alchemy CRM <onboarding@resend.dev>",
    to: email,
    subject: "Reset your password — Tech Alchemy CRM",
    html: `
      <h2>Password Reset</h2>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>This link expires in 1 hour. If you did not request this, ignore this email.</p>
    `,
  });

  if (error) {
    console.error("Resend error:", error);
    throw new Error("Failed to send password reset email");
  }
}
