import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import type { ServiceOffer } from "@/types/domain";

interface IncomingLead {
  request: { title: string; budgetMax: number };
  score: number;
}

export function ProviderPipeline({
  offer,
  leads,
}: {
  offer: ServiceOffer;
  leads: IncomingLead[];
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
      <GlassCard className="p-6">
        <p className="text-xs uppercase text-white/40">Your offer</p>
        <h2 className="mt-2 font-display text-xl">{offer.title}</h2>
        <p className="mt-2 text-sm text-white/60">{offer.description}</p>
        <div className="mt-4 flex items-center gap-2 text-sm">
          <span className="rounded-full border border-white/10 px-3 py-1 text-white/60">
            {offer.category}
          </span>
          <span className="rounded-full border border-accent-green/30 px-3 py-1 text-accent-green">
            From ${offer.priceFrom}
          </span>
          <span className="rounded-full border border-accent-amber/30 px-3 py-1 text-accent-amber">
            ★ {offer.rating}
          </span>
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <p className="text-xs uppercase text-white/40">Incoming leads</p>
        <div className="mt-4 space-y-3">
          {leads.map((lead, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] p-4"
            >
              <div>
                <p className="font-medium">{lead.request.title}</p>
                <p className="mt-1 text-xs text-white/40">Budget up to ${lead.request.budgetMax}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-display text-accent-violet">{lead.score}%</span>
                <Button className="px-4 py-1.5 text-xs">Accept</Button>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
