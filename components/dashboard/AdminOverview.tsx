import { GlassCard } from "@/components/ui/GlassCard";
import type { Match, PlatformStats } from "@/types/domain";

function statusColor(status: Match["status"]) {
  switch (status) {
    case "released":
      return "text-accent-green";
    case "in_escrow":
      return "text-accent-amber";
    case "disputed":
      return "text-accent-danger";
    default:
      return "text-white/60";
  }
}

export function AdminOverview({ stats, matches }: { stats: PlatformStats; matches: Match[] }) {
  return (
    <div className="grid gap-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <GlassCard className="p-5">
          <p className="text-xs uppercase text-white/40">Active users</p>
          <p className="mt-2 font-display text-2xl">{stats.activeUsers.toLocaleString()}</p>
        </GlassCard>
        <GlassCard className="p-5">
          <p className="text-xs uppercase text-white/40">Gross volume</p>
          <p className="mt-2 font-display text-2xl">${stats.grossVolume.toLocaleString()}</p>
        </GlassCard>
        <GlassCard className="p-5" glow="cyan">
          <p className="text-xs uppercase text-white/40">Commission earned</p>
          <p className="mt-2 font-display text-2xl text-accent-cyan">
            ${stats.commissionVolume.toLocaleString()}
          </p>
        </GlassCard>
        <GlassCard className="p-5">
          <p className="text-xs uppercase text-white/40">Matches today</p>
          <p className="mt-2 font-display text-2xl">{stats.matchesToday}</p>
        </GlassCard>
      </div>

      <GlassCard className="p-6">
        <h2 className="font-display text-lg">Transaction flow</h2>
        <p className="mt-1 text-sm text-white/50">
          Every match the engine produced, with commission already applied.
        </p>
        <div className="mt-6 overflow-hidden rounded-lg border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/[0.03] text-white/40">
              <tr>
                <th className="px-4 py-3">Match</th>
                <th className="px-4 py-3">Score</th>
                <th className="px-4 py-3">Gross</th>
                <th className="px-4 py-3">Commission</th>
                <th className="px-4 py-3">Net to provider</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {matches.map((m) => (
                <tr key={m.id} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-3 font-mono text-xs text-white/60">{m.id}</td>
                  <td className="px-4 py-3 text-accent-violet">{m.matchScore}%</td>
                  <td className="px-4 py-3">${m.grossAmount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-accent-cyan">
                    ${m.commissionAmount.toLocaleString()} ({Math.round(m.commissionRate * 100)}%)
                  </td>
                  <td className="px-4 py-3">${m.netAmountToProvider.toLocaleString()}</td>
                  <td className={`px-4 py-3 font-medium ${statusColor(m.status)}`}>{m.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
