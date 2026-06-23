import { AuthForm } from "@/components/auth/AuthForm";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-base-950 px-6">
      <AuthForm mode="login" />
    </main>
  );
}
