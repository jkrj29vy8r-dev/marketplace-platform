// Core domain types shared across the marketplace intermediation flow.
// "Request" = demand side (client looking for a service/product).
// "Offer"   = supply side (provider listing a service/product).
// A Match links exactly one Request to one Offer once both sides accept.

export type UserRole = "admin" | "client" | "provider" | "vendor";

export type AccountType = "individual" | "company";

export interface User {
  id: string;
  role: UserRole;
  name: string;
  email: string;
  verified: boolean;
  createdAt: string;
}

// --- B2B / B2C hybrid account model -----------------------------------

export interface CompanyProfile {
  id: string;
  ownerUserId: string;
  legalName: string;
  cui: string; // CUI/CIF fiscal code
  regCom: string; // Registrul Comertului number
  registeredAddress: string;
  vatPayer: boolean; // platitor de TVA
  approved: boolean; // KYB approval gate, set by an admin
  createdAt: string;
}

export type AddressKind = "billing" | "shipping";

export interface Address {
  id: string;
  ownerUserId: string;
  kind: AddressKind;
  label: string;
  line1: string;
  city: string;
  county: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

// A company-mamă can create sub-accounts (e.g. purchasing managers) with a
// spend cap and a requirement that orders above the cap need approval.
export interface SubAccount {
  id: string;
  companyId: string;
  userId: string;
  monthlyBudget: number;
  requiresApprovalAbove: number;
  createdAt: string;
}

// --- Catalog: physical products vs. services/bookable slots -----------

export type ProductType = "physical" | "service";

export interface PriceTier {
  minQty: number;
  pricePerUnit: number; // excl. VAT, B2B-only tiered pricing
}

export interface Product {
  id: string;
  vendorId: string;
  type: ProductType;
  name: string;
  description: string;
  imageUrl?: string;
  category: string;
  priceRetail: number; // incl. VAT, shown to anonymous/B2C buyers
  priceB2B: number; // excl. VAT base price for logged-in B2B buyers
  vatRate: number; // e.g. 0.19
  priceTiers: PriceTier[]; // volume pricing, B2B only
  moq: number; // minimum order quantity, B2B only (1 = no minimum)
  // Physical-product-only fields
  stock?: number;
  weightKg?: number;
  dimensionsCm?: string;
  // Service/booking-only fields
  capacity?: number; // seats/slots available
  scheduleType?: "calendar" | "fixed_slots";
  active: boolean;
  createdAt: string;
}

// --- RFQ: B2B-only negotiated pricing -----------------------------------

export type RfqStatus = "pending" | "countered" | "accepted" | "declined";

export interface RfqRequest {
  id: string;
  productId: string;
  buyerId: string;
  vendorId: string;
  quantity: number;
  message: string;
  status: RfqStatus;
  counterPricePerUnit?: number;
  counterTerms?: string;
  createdAt: string;
  updatedAt: string;
}

// --- Orders, payments, invoicing ---------------------------------------

export type PaymentMethod = "card" | "cod" | "bank_transfer" | "net_terms";

export type OrderStatus =
  | "pending_payment"
  | "awaiting_transfer_proof"
  | "confirmed"
  | "fulfilled"
  | "cancelled";

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number; // price actually charged, after tiering/RFQ
  vatRate: number;
}

export interface Order {
  id: string;
  buyerId: string;
  vendorId: string;
  items: OrderItem[];
  subtotal: number;
  vatAmount: number;
  total: number;
  commissionRate: number;
  commissionAmount: number;
  netAmountToVendor: number;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  transferProofUrl?: string;
  shippingAddressId?: string; // absent when the order is services-only
  createdAt: string;
}

export interface Invoice {
  id: string;
  orderId: string;
  series: string;
  number: number;
  buyerTaxId: string; // CNP for individuals, CUI for companies
  buyerName: string;
  total: number;
  vatAmount: number;
  issuedAt: string;
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
  imageUrl?: string;
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
  imageUrl?: string;
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
