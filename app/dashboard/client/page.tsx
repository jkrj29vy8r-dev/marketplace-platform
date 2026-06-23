import { ClientRequests } from "@/components/dashboard/ClientRequests";
import { rankCandidates } from "@/server/services/matching";
import type { ServiceOffer, ServiceRequest } from "@/types/domain";

const request: ServiceRequest = {
  id: "req_1",
  clientId: "usr_client_1",
  category: "Logistics",
  title: "Refrigerated freight, Bucharest → Cluj, weekly",
  description: "Need a recurring weekly route for perishable goods, 2-ton capacity.",
  budgetMin: 400,
  budgetMax: 700,
  status: "open",
  createdAt: new Date().toISOString(),
};

const offers: ServiceOffer[] = [
  {
    id: "off_1",
    providerId: "usr_provider_1",
    category: "Logistics",
    title: "ColdChain Express — refrigerated fleet",
    description: "Dedicated reefer trucks, weekly slots available.",
    priceFrom: 580,
    rating: 4.8,
    status: "active",
    createdAt: new Date().toISOString(),
  },
  {
    id: "off_2",
    providerId: "usr_provider_2",
    category: "Logistics",
    title: "FastHaul Romania",
    description: "General freight, can add refrigeration on request.",
    priceFrom: 720,
    rating: 4.2,
    status: "active",
    createdAt: new Date().toISOString(),
  },
  {
    id: "off_3",
    providerId: "usr_provider_3",
    category: "Warehousing",
    title: "ColdStore Hub",
    description: "Cold storage facility, not a carrier.",
    priceFrom: 450,
    rating: 4.6,
    status: "active",
    createdAt: new Date().toISOString(),
  },
];

export default function ClientDashboardPage() {
  const candidates = rankCandidates(request, offers);

  return (
    <main className="min-h-screen bg-base-950 px-6 py-10 sm:px-10">
      <h1 className="font-display text-2xl">Your demand</h1>
      <p className="mt-1 text-sm text-white/50">Track your request and review matched providers.</p>
      <div className="mt-8">
        <ClientRequests request={request} candidates={candidates} />
      </div>
    </main>
  );
}
