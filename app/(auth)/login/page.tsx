import { AuthForm } from "@/components/auth-form";

export default function LoginPage() {
  return (
    <div className="flex justify-center py-12">
      <AuthForm mode="login" />
    </div>
  );
}
