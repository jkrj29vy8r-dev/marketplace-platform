// Core domain types shared across the marketplace intermediation flow.
// "Request" = demand side (client looking for a service/product).
// "Offer"   = supply side (provider listing a service/product).
// A Match links exactly one Request to one Offer once both sides accept.

export type UserRole = "admin" | "client" | "provider";

export interface User {
  id: string;
  role: UserRole;
  name: string;
  email: string;
  verified: boolean;
  createdAt: string;
}

export type RequestStatus = "open" | "matched" | "in_transaction" | "completed" | "cancelled";

export interface ServiceRequest {
  id: string;
  clientId: string;
  category: string;
  title: string;
  description: string;
  budgetMin: number;
  budgetMax: number;
  status: RequestStatus;
  createdAt: string;
}

export type OfferStatus = "active" | "paused" | "matched" | "fulfilled";

export interface ServiceOffer {
  id: string;
  providerId: string;
  category: string;
  title: string;
  description: string;
  priceFrom: number;
  rating: number;
  status: OfferStatus;
  createdAt: string;
}

export type MatchStatus =
  | "proposed" // system suggested the pairing
  | "accepted" // both parties confirmed
  | "in_escrow" // funds held, transaction in progress
  | "released" // commission deducted, funds released to provider
  | "disputed"
  | "cancelled";

export interface Match {
  id: string;
  requestId: string;
  offerId: string;
  clientId: string;
  providerId: string;
  status: MatchStatus;
  matchScore: number; // 0-100, output of the matching engine
  grossAmount: number;
  commissionRate: number; // e.g. 0.08 for 8%
  commissionAmount: number;
  netAmountToProvider: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  matchId: string;
  senderId: string;
  body: string;
  sentAt: string;
}

export interface PlatformStats {
  activeUsers: number;
  openRequests: number;
  activeOffers: number;
  matchesToday: number;
  grossVolume: number;
  commissionVolume: number;
}
