import { GlassCard } from "@/components/ui/GlassCard";
import type { ServiceOffer } from "@/types/domain";

export function OffersFeed({ offers }: { offers: ServiceOffer[] }) {
  if (offers.length === 0) {
    return (
      <GlassCard className="p-6 text-center text-sm text-white/40">
        No offers posted yet — be the first.
      </GlassCard>
    );
  }

  return (
    <div className="space-y-4">
      {offers.map((offer) => (
        <GlassCard key={offer.id} className="flex gap-4 p-5">
          {offer.imageUrl && (
            <img
              src={offer.imageUrl}
              alt={offer.title}
              className="h-20 w-20 flex-none rounded-lg object-cover"
            />
          )}
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">{offer.title}</h3>
              <span className="rounded-full border border-accent-green/30 px-3 py-0.5 text-xs text-accent-green">
                From ${offer.priceFrom}
              </span>
            </div>
            <p className="mt-1 text-sm text-white/50">{offer.description}</p>
            <p className="mt-1 text-xs text-white/30">{offer.category} · by {offer.providerId}</p>
          </div>
        </GlassCard>
      ))}
    </div>
  );
}
