import type { ServiceOffer, ServiceRequest } from "@/types/domain";

// Matching engine: scores every active offer against an open request and
// returns the ranked candidates. Kept as pure functions (no I/O) so it can
// be unit-tested in isolation and later swapped for a smarter model
// (embeddings, ML ranking) without touching the calling code.

export interface MatchCandidate {
  offer: ServiceOffer;
  score: number; // 0-100
  reasons: string[];
}

const WEIGHTS = {
  category: 50,
  budgetFit: 35,
  rating: 15,
};

function scoreCategory(request: ServiceRequest, offer: ServiceOffer): number {
  return request.category === offer.category ? WEIGHTS.category : 0;
}

// Rewards offers priced inside the client's stated budget range; offers
// priced above budgetMax are penalized proportionally rather than
// disqualified outright, since a slightly-over-budget provider may still
// be worth surfacing.
function scoreBudgetFit(request: ServiceRequest, offer: ServiceOffer): number {
  if (offer.priceFrom <= request.budgetMax && offer.priceFrom >= request.budgetMin) {
    return WEIGHTS.budgetFit;
  }
  if (offer.priceFrom < request.budgetMin) {
    return WEIGHTS.budgetFit * 0.85;
  }
  const overBudgetRatio = offer.priceFrom / request.budgetMax;
  const penalty = Math.min(1, (overBudgetRatio - 1) * 1.5);
  return Math.max(0, WEIGHTS.budgetFit * (1 - penalty));
}

function scoreRating(offer: ServiceOffer): number {
  return (offer.rating / 5) * WEIGHTS.rating;
}

export function scoreOffer(request: ServiceRequest, offer: ServiceOffer): MatchCandidate {
  const reasons: string[] = [];
  const categoryScore = scoreCategory(request, offer);
  const budgetScore = scoreBudgetFit(request, offer);
  const ratingScore = scoreRating(offer);

  if (categoryScore > 0) reasons.push("Category match");
  if (budgetScore >= WEIGHTS.budgetFit * 0.8) reasons.push("Within budget");
  if (offer.rating >= 4.5) reasons.push("Highly rated provider");

  const score = Math.round(categoryScore + budgetScore + ratingScore);

  return { offer, score, reasons };
}

export function rankCandidates(
  request: ServiceRequest,
  offers: ServiceOffer[],
  limit = 5
): MatchCandidate[] {
  return offers
    .filter((offer) => offer.status === "active")
    .map((offer) => scoreOffer(request, offer))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
