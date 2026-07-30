import { AuthForm } from "@/components/auth-form";

export default function ForgotPasswordPage() {
  return (
    <div className="flex justify-center py-12">
      <AuthForm mode="forgot" />
    </div>
  );
}
