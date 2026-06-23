import { ProviderPipeline } from "@/components/dashboard/ProviderPipeline";
import type { ServiceOffer } from "@/types/domain";

const offer: ServiceOffer = {
  id: "off_1",
  providerId: "usr_provider_1",
  category: "Logistics",
  title: "ColdChain Express — refrigerated fleet",
  description: "Dedicated reefer trucks, weekly slots available across Romania.",
  priceFrom: 580,
  rating: 4.8,
  status: "active",
  createdAt: new Date().toISOString(),
};

const leads = [
  { request: { title: "Refrigerated freight, Bucharest → Cluj, weekly", budgetMax: 700 }, score: 91 },
  { request: { title: "Perishables run, Iași → Brașov", budgetMax: 620 }, score: 84 },
  { request: { title: "Single-trip cold delivery, Timișoara", budgetMax: 540 }, score: 73 },
];

export default function ProviderDashboardPage() {
  return (
    <main className="min-h-screen bg-base-950 px-6 py-10 sm:px-10">
      <h1 className="font-display text-2xl">Your supply</h1>
      <p className="mt-1 text-sm text-white/50">Manage your offer and respond to matched leads.</p>
      <div className="mt-8">
        <ProviderPipeline offer={offer} leads={leads} />
      </div>
    </main>
  );
}
