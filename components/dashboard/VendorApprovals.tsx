"use client";

import { useCallback, useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";

interface CompanyRecord {
  id: string;
  legalName: string;
  cui: string;
  regCom: string;
  registeredAddress: string;
  vatPayer: boolean;
  approved: boolean;
  createdAt: string;
}

export function VendorApprovals() {
  const [companies, setCompanies] = useState<CompanyRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/admin/vendors");
    if (res.ok) setCompanies((await res.json()).companies);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function setApproved(companyId: string, approved: boolean) {
    await fetch("/api/admin/vendors", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyId, approved }),
    });
    refresh();
  }

  if (loading) return <p className="text-sm text-white/40">Se încarcă…</p>;

  return (
    <GlassCard className="p-6">
      <h2 className="font-display text-lg">Onboarding companii (KYB)</h2>
      <div className="mt-4 space-y-2">
        {companies.map((c) => (
          <div key={c.id} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] px-4 py-3">
            <div>
              <p className="text-sm font-medium">{c.legalName}</p>
              <p className="text-xs text-white/40">
                CUI {c.cui} · Reg. Com. {c.regCom} · {c.vatPayer ? "plătitor TVA" : "neplătitor TVA"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {c.approved ? (
                <span className="text-xs text-accent-cyan">Aprobat</span>
              ) : (
                <span className="text-xs text-accent-amber">În așteptare</span>
              )}
              <Button variant="outline" className="px-3 py-1 text-xs" onClick={() => setApproved(c.id, !c.approved)}>
                {c.approved ? "Revocă" : "Aprobă"}
              </Button>
            </div>
          </div>
        ))}
        {companies.length === 0 && <p className="text-sm text-white/40">Nicio companie înregistrată.</p>}
      </div>
    </GlassCard>
  );
}
