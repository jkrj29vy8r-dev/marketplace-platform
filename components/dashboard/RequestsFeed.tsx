import { GlassCard } from "@/components/ui/GlassCard";
import { rankCandidates } from "@/server/services/matching";
import type { ServiceOffer, ServiceRequest } from "@/types/domain";

export function RequestsFeed({
  requests,
  offers,
}: {
  requests: ServiceRequest[];
  offers: ServiceOffer[];
}) {
  if (requests.length === 0) {
    return (
      <GlassCard className="p-6 text-center text-sm text-white/40">
        No requests posted yet — be the first.
      </GlassCard>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => {
        const candidates = rankCandidates(request, offers, 3);
        return (
          <GlassCard key={request.id} className="overflow-hidden p-0">
            <div className="flex gap-4 p-5">
              {request.imageUrl && (
                <img
                  src={request.imageUrl}
                  alt={request.title}
                  className="h-20 w-20 flex-none rounded-lg object-cover"
                />
              )}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{request.title}</h3>
                  <span className="rounded-full border border-accent-cyan/30 px-3 py-0.5 text-xs text-accent-cyan">
                    ${request.budgetMin}–${request.budgetMax}
                  </span>
                </div>
                <p className="mt-1 text-sm text-white/50">{request.description}</p>
                <p className="mt-1 text-xs text-white/30">{request.category} · by {request.clientId}</p>
              </div>
            </div>
            {candidates.length > 0 && (
              <div className="border-t border-white/5 bg-white/[0.02] px-5 py-3">
                <p className="text-xs uppercase text-white/30">Best matches</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {candidates.map((c) => (
                    <span
                      key={c.offer.id}
                      className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/70"
                    >
                      {c.offer.title} · <span className="text-accent-violet">{c.score}%</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </GlassCard>
        );
      })}
    </div>
  );
}
