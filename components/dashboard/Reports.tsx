"use client";

import { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";

interface ReportData {
  gmv: number;
  commissionVolume: number;
  orderCount: number;
  byStatus: Record<string, number>;
}

export function Reports() {
  const [data, setData] = useState<ReportData | null>(null);

  useEffect(() => {
    fetch("/api/admin/reports")
      .then((r) => r.json())
      .then(setData);
  }, []);

  if (!data) return <p className="text-sm text-white/40">Se încarcă…</p>;

  return (
    <GlassCard className="p-6">
      <h2 className="font-display text-lg">Rapoarte vânzări</h2>
      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="font-display text-2xl">{data.gmv.toFixed(0)}</p>
          <p className="text-xs text-white/40">GMV (lei)</p>
        </div>
        <div>
          <p className="font-display text-2xl">{data.commissionVolume.toFixed(0)}</p>
          <p className="text-xs text-white/40">Comision (lei)</p>
        </div>
        <div>
          <p className="font-display text-2xl">{data.orderCount}</p>
          <p className="text-xs text-white/40">Comenzi</p>
        </div>
      </div>
      <div className="mt-4 space-y-1 text-xs text-white/50">
        {Object.entries(data.byStatus).map(([status, count]) => (
          <p key={status}>
            {status}: {count}
          </p>
        ))}
      </div>
    </GlassCard>
  );
}
