"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import type { RfqRequest } from "@/types/domain";

interface RfqInboxProps {
  rfqs: RfqRequest[];
  role: "vendor" | "buyer";
  onChanged: () => void;
}

export function RfqInbox({ rfqs, role, onChanged }: RfqInboxProps) {
  const [drafts, setDrafts] = useState<Record<string, { price: string; terms: string }>>({});

  function draftFor(id: string) {
    return drafts[id] ?? { price: "", terms: "" };
  }

  async function respond(rfq: RfqRequest, status: "countered" | "accepted" | "declined") {
    const draft = draftFor(rfq.id);
    await fetch(`/api/rfq/${rfq.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status,
        counterPricePerUnit: status === "countered" ? Number(draft.price) : undefined,
        counterTerms: status === "countered" ? draft.terms : undefined,
      }),
    });
    onChanged();
  }

  return (
    <GlassCard className="p-6">
      <h2 className="font-display text-lg">Cereri de ofertă (RFQ)</h2>
      <div className="mt-4 space-y-3">
        {rfqs.map((rfq) => (
          <div key={rfq.id} className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
            <p className="text-sm">
              {rfq.quantity} buc · <span className="text-white/40">status: {rfq.status}</span>
            </p>
            <p className="mt-1 text-xs text-white/50">{rfq.message}</p>
            {rfq.counterPricePerUnit !== undefined && (
              <p className="mt-1 text-xs text-accent-cyan">
                Contraofertă: {rfq.counterPricePerUnit} lei/buc — {rfq.counterTerms}
              </p>
            )}

            {role === "vendor" && rfq.status === "pending" && (
              <div className="mt-3 flex flex-wrap gap-2">
                <input
                  className="rounded-lg border border-white/10 bg-white/[0.02] px-3 py-1.5 text-xs"
                  placeholder="Preț/buc"
                  value={draftFor(rfq.id).price}
                  onChange={(e) => setDrafts({ ...drafts, [rfq.id]: { ...draftFor(rfq.id), price: e.target.value } })}
                />
                <input
                  className="rounded-lg border border-white/10 bg-white/[0.02] px-3 py-1.5 text-xs"
                  placeholder="Termeni"
                  value={draftFor(rfq.id).terms}
                  onChange={(e) => setDrafts({ ...drafts, [rfq.id]: { ...draftFor(rfq.id), terms: e.target.value } })}
                />
                <Button className="px-3 py-1 text-xs" onClick={() => respond(rfq, "countered")}>
                  Trimite contraofertă
                </Button>
                <Button variant="ghost" className="px-3 py-1 text-xs text-accent-danger" onClick={() => respond(rfq, "declined")}>
                  Refuză
                </Button>
              </div>
            )}

            {role === "buyer" && rfq.status === "countered" && (
              <div className="mt-3 flex gap-2">
                <Button className="px-3 py-1 text-xs" onClick={() => respond(rfq, "accepted")}>
                  Acceptă
                </Button>
                <Button variant="ghost" className="px-3 py-1 text-xs text-accent-danger" onClick={() => respond(rfq, "declined")}>
                  Refuză
                </Button>
              </div>
            )}
          </div>
        ))}
        {rfqs.length === 0 && <p className="text-sm text-white/40">Nicio cerere de ofertă.</p>}
      </div>
    </GlassCard>
  );
}
