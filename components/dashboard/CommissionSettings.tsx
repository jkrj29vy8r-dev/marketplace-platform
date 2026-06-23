"use client";

import { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";

export function CommissionSettings() {
  const [override, setOverride] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        setOverride(data.commissionOverride != null ? String(data.commissionOverride * 100) : "");
        setLoading(false);
      });
  }, []);

  async function save() {
    setSaving(true);
    const commissionOverride = override.trim() === "" ? null : Number(override) / 100;
    await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commissionOverride }),
    });
    setSaving(false);
  }

  if (loading) return null;

  return (
    <GlassCard className="p-6">
      <h2 className="font-display text-lg">Commission</h2>
      <p className="mt-1 text-sm text-white/50">
        Leave empty to use the default tiered rate (12% → 4% as deal size grows). Set a value to
        apply a single flat rate to every new match instead.
      </p>
      <div className="mt-4 flex items-center gap-3">
        <input
          value={override}
          onChange={(e) => setOverride(e.target.value)}
          placeholder="e.g. 8"
          inputMode="decimal"
          className="w-32 rounded-lg border border-white/10 bg-white/[0.02] px-4 py-2 text-sm outline-none focus:border-accent-cyan/50"
        />
        <span className="text-sm text-white/40">%</span>
        <Button onClick={save} disabled={saving} className="ml-auto">
          {saving ? "Saving…" : "Save"}
        </Button>
      </div>
    </GlassCard>
  );
}
