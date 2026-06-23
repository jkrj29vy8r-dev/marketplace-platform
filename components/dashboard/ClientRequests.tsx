import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import type { MatchCandidate } from "@/server/services/matching";
import type { ServiceRequest } from "@/types/domain";

export function ClientRequests({
  request,
  candidates,
}: {
  request: ServiceRequest;
  candidates: MatchCandidate[];
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
      <GlassCard className="p-6">
        <p className="text-xs uppercase text-white/40">Your request</p>
        <h2 className="mt-2 font-display text-xl">{request.title}</h2>
        <p className="mt-2 text-sm text-white/60">{request.description}</p>
        <div className="mt-4 flex items-center gap-2 text-sm">
          <span className="rounded-full border border-white/10 px-3 py-1 text-white/60">
            {request.category}
          </span>
          <span className="rounded-full border border-accent-cyan/30 px-3 py-1 text-accent-cyan">
            ${request.budgetMin}–${request.budgetMax}
          </span>
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <p className="text-xs uppercase text-white/40">Suggested providers</p>
        <div className="mt-4 space-y-3">
          {candidates.map((c) => (
            <div
              key={c.offer.id}
              className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] p-4"
            >
              <div>
                <p className="font-medium">{c.offer.title}</p>
                <p className="mt-1 text-xs text-white/40">{c.reasons.join(" · ")}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-display text-accent-violet">{c.score}%</span>
                <Button variant="outline" className="px-4 py-1.5 text-xs">
                  Connect
                </Button>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
