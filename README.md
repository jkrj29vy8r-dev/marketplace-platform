# Nexar

A B2B/B2B2C intermediation marketplace: matches demand (`ServiceRequest`)
with supply (`ServiceOffer`), brokers a `Match`, escrows funds, and settles
with a transparent platform commission.

## Stack

Next.js 14 (App Router) + TypeScript + Tailwind CSS. No external UI
library — all primitives live in `components/ui` so the glassmorphic
visual language stays consistent everywhere.

## Brand

- **Name:** Nexar
- **Palette:** ultra-dark base (`#05060a`–`#1a1e2c`) with neon accents —
  cyan `#4DF0FF`, violet `#8B5CF6`, atomic green `#39FFB0`. See
  `tailwind.config.ts`.
- **Type:** Space Grotesk (display) / Inter (body).

## Structure

```
app/
  (marketing)/page.tsx        Landing page (hero + live stats)
  dashboard/admin/page.tsx    Operator console (transactions, commissions, matching)
  dashboard/client/page.tsx   Demand-side dashboard
  dashboard/provider/page.tsx Supply-side dashboard
  match/[matchId]/page.tsx    Secure deal room (chat + escrow status)
components/
  ui/          Shared primitives (GlassCard, Button, StatCounter)
  marketing/   Landing page sections
  dashboard/   Admin / client / provider widgets
  match/       Deal room UI
server/services/
  matching.ts     Scores offers against a request (category, budget, rating)
  commission.ts   Single source of truth for the platform's take-rate
types/domain.ts   Shared domain model (User, ServiceRequest, ServiceOffer, Match)
```

## How the money flows

1. `rankCandidates()` scores active offers against an open request.
2. Once a client accepts, a `Match` is created and priced via
   `computeCommission()`, which resolves a tiered commission rate and
   splits gross amount into `commissionAmount` / `netAmountToProvider`.
3. Funds sit `in_escrow` until both sides confirm; the same commission
   breakdown is reused at payout time so the numbers can never drift.

## Getting started

```bash
npm install
npm run dev
```
