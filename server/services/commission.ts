import type { Match } from "@/types/domain";

// Tiered take-rate: higher gross transaction value pays a slightly lower
// percentage. This rewards bigger deals while keeping the platform's
// margin predictable on small ones. Rates are intentionally simple
// (no compounding) so they're easy to audit on a statement.
const COMMISSION_TIERS: { upTo: number; rate: number }[] = [
  { upTo: 500, rate: 0.12 },
  { upTo: 2_000, rate: 0.09 },
  { upTo: 10_000, rate: 0.06 },
  { upTo: Infinity, rate: 0.04 },
];

export function resolveCommissionRate(grossAmount: number): number {
  const tier = COMMISSION_TIERS.find((t) => grossAmount <= t.upTo);
  return tier?.rate ?? 0.04;
}

export interface CommissionBreakdown {
  grossAmount: number;
  commissionRate: number;
  commissionAmount: number;
  netAmountToProvider: number;
}

// Single source of truth for "how much does the platform keep."
// Called both when a match is first priced and again at payout time,
// so the two numbers can never drift apart.
export function computeCommission(grossAmount: number): CommissionBreakdown {
  if (grossAmount < 0) {
    throw new Error("grossAmount must be non-negative");
  }
  const commissionRate = resolveCommissionRate(grossAmount);
  // Round at the cent level only once, at the end, to avoid compounding
  // rounding errors across repeated reads of the same match.
  const commissionAmount = Math.round(grossAmount * commissionRate * 100) / 100;
  const netAmountToProvider = Math.round((grossAmount - commissionAmount) * 100) / 100;

  return { grossAmount, commissionRate, commissionAmount, netAmountToProvider };
}

export function applyCommissionToMatch(
  match: Pick<Match, "grossAmount">
): CommissionBreakdown {
  return computeCommission(match.grossAmount);
}
