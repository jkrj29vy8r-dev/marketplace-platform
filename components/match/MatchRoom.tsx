"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import type { ChatMessage, Match } from "@/types/domain";

const STEPS: { key: Match["status"]; label: string }[] = [
  { key: "accepted", label: "Accepted" },
  { key: "in_escrow", label: "Escrow funded" },
  { key: "released", label: "Released" },
];

function EscrowTimeline({ status }: { status: Match["status"] }) {
  const currentIndex = STEPS.findIndex((s) => s.key === status);

  return (
    <div className="flex items-center gap-3">
      {STEPS.map((step, i) => (
        <div key={step.key} className="flex items-center gap-3">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs ${
              i <= currentIndex
                ? "border-accent-cyan bg-accent-cyan/10 text-accent-cyan"
                : "border-white/15 text-white/30"
            }`}
          >
            {i + 1}
          </div>
          <span className={i <= currentIndex ? "text-white" : "text-white/30"}>{step.label}</span>
          {i < STEPS.length - 1 && <div className="h-px w-8 bg-white/10" />}
        </div>
      ))}
    </div>
  );
}

export function MatchRoom({
  match,
  currentUserId,
  initialMessages,
}: {
  match: Match;
  currentUserId: string;
  initialMessages: ChatMessage[];
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");

  function sendMessage() {
    if (!draft.trim()) return;
    // Client-side optimistic append only — wiring this to a real-time
    // transport (websocket / server action) is the next integration step.
    setMessages((prev) => [
      ...prev,
      {
        id: `tmp_${prev.length}`,
        matchId: match.id,
        senderId: currentUserId,
        body: draft.trim(),
        sentAt: new Date().toISOString(),
      },
    ]);
    setDraft("");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
      <GlassCard className="flex h-[520px] flex-col p-6">
        <h2 className="font-display text-lg">Deal room</h2>
        <div className="mt-4 flex-1 space-y-3 overflow-y-auto pr-2">
          {messages.map((m) => {
            const mine = m.senderId === currentUserId;
            return (
              <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-xs rounded-2xl px-4 py-2 text-sm ${
                    mine ? "bg-accent-cyan/15 text-accent-cyan" : "bg-white/5 text-white/80"
                  }`}
                >
                  {m.body}
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Write a message…"
            className="flex-1 rounded-full border border-white/10 bg-white/[0.02] px-4 py-2 text-sm outline-none focus:border-accent-cyan/50"
          />
          <Button onClick={sendMessage} className="px-5">
            Send
          </Button>
        </div>
      </GlassCard>

      <div className="space-y-6">
        <GlassCard className="p-6" glow="violet">
          <p className="text-xs uppercase text-white/40">Transaction status</p>
          <div className="mt-4">
            <EscrowTimeline status={match.status} />
          </div>
          <dl className="mt-6 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-white/50">Gross amount</dt>
              <dd>${match.grossAmount.toLocaleString()}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-white/50">Platform commission ({Math.round(match.commissionRate * 100)}%)</dt>
              <dd className="text-accent-cyan">-${match.commissionAmount.toLocaleString()}</dd>
            </div>
            <div className="flex justify-between border-t border-white/10 pt-2 font-medium">
              <dt>Net to provider</dt>
              <dd>${match.netAmountToProvider.toLocaleString()}</dd>
            </div>
          </dl>
        </GlassCard>

        <GlassCard className="p-6">
          <p className="text-xs uppercase text-white/40">Match score</p>
          <p className="mt-2 font-display text-3xl text-accent-violet">{match.matchScore}%</p>
          <p className="mt-1 text-xs text-white/40">Computed by the Nexar matching engine</p>
        </GlassCard>
      </div>
    </div>
  );
}
