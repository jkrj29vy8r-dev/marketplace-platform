"use client";

import { useCallback, useEffect, useState } from "react";
import { PostForm } from "@/components/dashboard/PostForm";
import { RequestsFeed } from "@/components/dashboard/RequestsFeed";
import type { ServiceOffer, ServiceRequest } from "@/types/domain";

export default function ClientDashboardPage() {
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
      <h1 className="font-display text-2xl">Your demand</h1>
      <p className="mt-1 text-sm text-white/50">
        Post what you need, with a photo if it helps, and see who matches.
      </p>
      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <PostForm kind="request" onPosted={refresh} />
        {loading ? (
          <p className="text-sm text-white/40">Loading…</p>
        ) : (
          <RequestsFeed requests={requests} offers={offers} />
        )}
      </div>
    </main>
  );
}
