"use client";

import { useCallback, useEffect, useState } from "react";
import { PostForm } from "@/components/dashboard/PostForm";
import { OffersFeed } from "@/components/dashboard/OffersFeed";
import type { ServiceOffer } from "@/types/domain";

export default function ProviderDashboardPage() {
  const [offers, setOffers] = useState<ServiceOffer[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/offers");
    const { offers } = await res.json();
    setOffers(offers);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <main className="min-h-screen bg-base-950 px-6 py-10 sm:px-10">
      <h1 className="font-display text-2xl">Your supply</h1>
      <p className="mt-1 text-sm text-white/50">
        Post what you offer, with a photo if it helps, and get matched with leads.
      </p>
      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <PostForm kind="offer" onPosted={refresh} />
        {loading ? (
          <p className="text-sm text-white/40">Loading…</p>
        ) : (
          <OffersFeed offers={offers} />
        )}
      </div>
    </main>
  );
}
