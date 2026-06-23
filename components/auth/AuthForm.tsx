"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";

interface AuthFormProps {
  mode: "login" | "signup";
}

const inputClass =
  "w-full rounded-lg border border-white/10 bg-white/[0.02] px-4 py-2 text-sm outline-none focus:border-accent-cyan/50";

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"client" | "provider">("client");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/signup";
    const payload = mode === "login" ? { email, password } : { name, email, password, role };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.formErrors?.[0] ?? data.error ?? "Something went wrong");
      }

      const destination = data.user.role === "admin" ? "/dashboard/admin" : `/dashboard/${data.user.role}`;
      router.push(destination);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <GlassCard className="mx-auto mt-24 w-full max-w-sm p-8" glow="cyan">
      <h1 className="font-display text-2xl">{mode === "login" ? "Log in" : "Create account"}</h1>
      <form onSubmit={handleSubmit} className="mt-6 space-y-3">
        {mode === "signup" && (
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
            className={inputClass}
          />
        )}
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className={inputClass}
        />
        <input
          required
          type="password"
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className={inputClass}
        />
        {mode === "signup" && (
          <div className="flex gap-3 text-sm">
            <label className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-white/10 px-3 py-2">
              <input
                type="radio"
                checked={role === "client"}
                onChange={() => setRole("client")}
              />
              I need something
            </label>
            <label className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-white/10 px-3 py-2">
              <input
                type="radio"
                checked={role === "provider"}
                onChange={() => setRole("provider")}
              />
              I offer something
            </label>
          </div>
        )}
        {error && <p className="text-sm text-accent-danger">{error}</p>}
        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? "Please wait…" : mode === "login" ? "Log in" : "Sign up"}
        </Button>
      </form>
    </GlassCard>
  );
}
