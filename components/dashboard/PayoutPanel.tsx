"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import type { Order } from "@/types/domain";

interface PayoutPanelProps {
  orders: Order[];
  payouts: { id: string; amount: number; status: string }[];
  onRequested: () => void;
}

export function PayoutPanel({ orders, payouts, onRequested }: PayoutPanelProps) {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);

  const balance =
    orders
      .filter((o) => o.status === "confirmed" || o.status === "fulfilled")
      .reduce((sum, o) => sum + o.netAmountToVendor, 0) -
    payouts.filter((p) => p.status !== "rejected").reduce((sum, p) => sum + p.amount, 0);

  async function requestPayout(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/vendor/payouts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: Number(amount) }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error?.formErrors?.[0] ?? data.error ?? "Eroare");
      return;
    }
    setAmount("");
    onRequested();
  }

  return (
    <GlassCard className="p-6">
      <h2 className="font-display text-lg">Balanță & retrageri</h2>
      <p className="mt-2 text-2xl font-display">{balance.toFixed(2)} lei</p>
      <p className="text-xs text-white/40">disponibil pentru retragere (după comision)</p>

      <form onSubmit={requestPayout} className="mt-4 flex gap-2">
        <input
          type="number"
          min={0}
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Sumă"
          className="flex-1 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-sm"
        />
        <Button type="submit">Solicită payout</Button>
      </form>
      {error && <p className="mt-2 text-sm text-accent-danger">{error}</p>}

      <div className="mt-4 space-y-1">
        {payouts.map((p) => (
          <p key={p.id} className="text-xs text-white/50">
            {p.amount.toFixed(2)} lei — {p.status}
          </p>
        ))}
      </div>
    </GlassCard>
  );
}
