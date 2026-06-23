import { AuthForm } from "@/components/auth/AuthForm";

export default function SignupPage() {
  return (
    <main className="min-h-screen bg-base-950 px-6">
      <AuthForm mode="signup" />
    </main>
  );
}
