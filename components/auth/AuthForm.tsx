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
  const [role, setRole] = useState<"client" | "provider" | "vendor">("client");
  const [accountType, setAccountType] = useState<"individual" | "company">("individual");
  const [legalName, setLegalName] = useState("");
  const [cui, setCui] = useState("");
  const [regCom, setRegCom] = useState("");
  const [registeredAddress, setRegisteredAddress] = useState("");
  const [vatPayer, setVatPayer] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/signup";
    const payload =
      mode === "login"
        ? { email, password }
        : {
            name,
            email,
            password,
            role,
            accountType,
            company:
              accountType === "company"
                ? { legalName, cui, regCom, registeredAddress, vatPayer }
                : undefined,
          };

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
    <GlassCard className="mx-auto mt-24 w-full max-w-md p-8" glow="cyan">
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
          <>
            <div className="flex gap-3 text-sm">
              <label className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-white/10 px-3 py-2">
                <input type="radio" checked={role === "client"} onChange={() => setRole("client")} />
                I need something
              </label>
              <label className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-white/10 px-3 py-2">
                <input type="radio" checked={role === "provider"} onChange={() => setRole("provider")} />
                I offer a service
              </label>
              <label className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-white/10 px-3 py-2">
                <input type="radio" checked={role === "vendor"} onChange={() => setRole("vendor")} />
                I sell products
              </label>
            </div>

            <div className="flex gap-3 text-sm">
              <label className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-white/10 px-3 py-2">
                <input
                  type="radio"
                  checked={accountType === "individual"}
                  onChange={() => setAccountType("individual")}
                />
                Persoană fizică
              </label>
              <label className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-white/10 px-3 py-2">
                <input
                  type="radio"
                  checked={accountType === "company"}
                  onChange={() => setAccountType("company")}
                />
                Companie (B2B)
              </label>
            </div>

            {accountType === "company" && (
              <div className="space-y-2 rounded-lg border border-accent-violet/30 bg-accent-violet/5 p-3">
                <input
                  required
                  value={legalName}
                  onChange={(e) => setLegalName(e.target.value)}
                  placeholder="Denumire companie"
                  className={inputClass}
                />
                <input
                  required
                  value={cui}
                  onChange={(e) => setCui(e.target.value)}
                  placeholder="CUI / CIF"
                  className={inputClass}
                />
                <input
                  required
                  value={regCom}
                  onChange={(e) => setRegCom(e.target.value)}
                  placeholder="Nr. Reg. Comerțului"
                  className={inputClass}
                />
                <input
                  required
                  value={registeredAddress}
                  onChange={(e) => setRegisteredAddress(e.target.value)}
                  placeholder="Sediu social"
                  className={inputClass}
                />
                <label className="flex items-center gap-2 text-xs text-white/60">
                  <input type="checkbox" checked={vatPayer} onChange={(e) => setVatPayer(e.target.checked)} />
                  Plătitor de TVA
                </label>
                <p className="text-xs text-white/40">
                  Contul devine activ pentru RFQ și preț pe volum după aprobarea manuală de către un administrator.
                </p>
              </div>
            )}
          </>
        )}

        {error && <p className="text-sm text-accent-danger">{error}</p>}
        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? "Please wait…" : mode === "login" ? "Log in" : "Sign up"}
        </Button>
      </form>
    </GlassCard>
  );
}
