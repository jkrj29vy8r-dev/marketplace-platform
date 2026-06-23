import { MatchRoom } from "@/components/match/MatchRoom";
import { computeCommission } from "@/server/services/commission";
import type { ChatMessage, Match } from "@/types/domain";

export default function MatchPage({ params }: { params: { matchId: string } }) {
  const breakdown = computeCommission(580);

  const match: Match = {
    id: params.matchId,
    requestId: "req_1",
    offerId: "off_1",
    clientId: "usr_client_1",
    providerId: "usr_provider_1",
    status: "in_escrow",
    matchScore: 91,
    ...breakdown,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const messages: ChatMessage[] = [
    {
      id: "msg_1",
      matchId: match.id,
      senderId: "usr_provider_1",
      body: "Hi! I can confirm the weekly Tuesday slot for the reefer route.",
      sentAt: new Date().toISOString(),
    },
    {
      id: "msg_2",
      matchId: match.id,
      senderId: "usr_client_1",
      body: "Perfect, funding escrow now.",
      sentAt: new Date().toISOString(),
    },
  ];

  return (
    <main className="min-h-screen bg-base-950 px-6 py-10 sm:px-10">
      <h1 className="font-display text-2xl">Match {match.id}</h1>
      <p className="mt-1 text-sm text-white/50">
        Secure room for the client and provider to finalize the deal.
      </p>
      <div className="mt-8">
        <MatchRoom match={match} currentUserId="usr_client_1" initialMessages={messages} />
      </div>
    </main>
  );
}
