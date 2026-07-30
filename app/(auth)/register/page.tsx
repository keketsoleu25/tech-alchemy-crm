import { AuthForm } from "@/components/auth-form";

export default function RegisterPage() {
  return (
    <div className="flex justify-center py-12">
      <AuthForm mode="register" />
    </div>
  );
}
