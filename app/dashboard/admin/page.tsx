import { AdminOverview } from "@/components/dashboard/AdminOverview";
import { computeCommission } from "@/server/services/commission";
import type { Match, PlatformStats } from "@/types/domain";

const stats: PlatformStats = {
  activeUsers: 12480,
  openRequests: 342,
  activeOffers: 1890,
  matchesToday: 215,
  grossVolume: 184320,
  commissionVolume: 11680,
};

// Demo matches priced through the real commission service so the
// numbers shown in the table are never hand-typed and can't drift from
// the actual business logic.
const demoMatches: { gross: number; status: Match["status"]; matchScore: number }[] = [
  { gross: 320, status: "released", matchScore: 92 },
  { gross: 1750, status: "in_escrow", matchScore: 81 },
  { gross: 8200, status: "accepted", matchScore: 76 },
  { gross: 14500, status: "released", matchScore: 95 },
];

const matches: Match[] = demoMatches.map(({ gross, status, matchScore }, i) => ({
  id: `mtc_${1000 + i}`,
  requestId: `req_${i}`,
  offerId: `off_${i}`,
  clientId: `usr_client_${i}`,
  providerId: `usr_provider_${i}`,
  status,
  matchScore,
  ...computeCommission(gross),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}));

export default function AdminDashboardPage() {
  return (
    <main className="min-h-screen bg-base-950 px-6 py-10 sm:px-10">
      <h1 className="font-display text-2xl">Operator console</h1>
      <p className="mt-1 text-sm text-white/50">
        Live view of matching, transactions and platform take-rate.
      </p>
      <div className="mt-8">
        <AdminOverview stats={stats} matches={matches} />
      </div>
    </main>
  );
}
