"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminOverview } from "@/components/dashboard/AdminOverview";
import { RequestsFeed } from "@/components/dashboard/RequestsFeed";
import { OffersFeed } from "@/components/dashboard/OffersFeed";
import { UsersPanel } from "@/components/dashboard/UsersPanel";
import { CommissionSettings } from "@/components/dashboard/CommissionSettings";
import { VendorApprovals } from "@/components/dashboard/VendorApprovals";
import { Reports } from "@/components/dashboard/Reports";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { computeCommission } from "@/server/services/commission";
import type { Match, PlatformStats, ServiceOffer, ServiceRequest } from "@/types/domain";

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
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [offers, setOffers] = useState<ServiceOffer[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const [requestsRes, offersRes] = await Promise.all([
      fetch("/api/requests"),
      fetch("/api/offers"),
    ]);
    const { requests } = await requestsRes.json();
    const { offers } = await offersRes.json();
    setRequests(requests);
    setOffers(offers);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <main className="min-h-screen bg-base-950 px-6 py-10 sm:px-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl">Operator console</h1>
          <p className="mt-1 text-sm text-white/50">
            Live view of matching, transactions and platform take-rate.
          </p>
        </div>
        <LogoutButton />
      </div>

      <div className="mt-8 grid gap-6">
        <AdminOverview stats={stats} matches={matches} />

        <Reports />

        <div className="grid gap-6 lg:grid-cols-2">
          <CommissionSettings />
          <UsersPanel />
        </div>

        <VendorApprovals />

        <div>
          <h2 className="font-display text-lg">Moderate requests</h2>
          <div className="mt-4">
            {loading ? (
              <p className="text-sm text-white/40">Loading…</p>
            ) : (
              <RequestsFeed requests={requests} offers={offers} onModerated={refresh} />
            )}
          </div>
        </div>

        <div>
          <h2 className="font-display text-lg">Moderate offers</h2>
          <div className="mt-4">
            {loading ? (
              <p className="text-sm text-white/40">Loading…</p>
            ) : (
              <OffersFeed offers={offers} onModerated={refresh} />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
