import { GlassCard } from "@/components/ui/GlassCard";
import { StatCounter } from "@/components/ui/StatCounter";
import type { PlatformStats } from "@/types/domain";

export function LiveStats({ stats }: { stats: PlatformStats }) {
  return (
    <section id="live-stats" className="px-6 pb-24">
      <GlassCard className="mx-auto grid max-w-4xl grid-cols-2 gap-8 p-8 sm:grid-cols-4" glow="cyan">
        <StatCounter label="Active users" value={stats.activeUsers} />
        <StatCounter label="Open requests" value={stats.openRequests} />
        <StatCounter label="Matches today" value={stats.matchesToday} />
        <StatCounter label="Gross volume" value={stats.grossVolume} prefix="$" />
      </GlassCard>
    </section>
  );
}
