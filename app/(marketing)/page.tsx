import { Hero } from "@/components/marketing/Hero";
import { LiveStats } from "@/components/marketing/LiveStats";
import type { PlatformStats } from "@/types/domain";

// Stand-in live stats. In production this is fetched server-side from
// the platform aggregate (see server/services) on a short revalidate
// window so the landing page feels "live" without hammering the DB.
const mockStats: PlatformStats = {
  activeUsers: 12480,
  openRequests: 342,
  activeOffers: 1890,
  matchesToday: 215,
  grossVolume: 184320,
  commissionVolume: 11680,
};

export default function LandingPage() {
  return (
    <main>
      <Hero />
      <LiveStats stats={mockStats} />
    </main>
  );
}
