import { sql } from "@vercel/postgres";
import { ensureSchema } from "@/server/db/schema";
import type { ServiceOffer } from "@/types/domain";

interface OfferRow {
  id: number;
  provider_name: string;
  category: string;
  title: string;
  description: string;
  price_from: number;
  image_url: string | null;
  status: ServiceOffer["status"];
  created_at: string;
}

function toServiceOffer(row: OfferRow): ServiceOffer {
  return {
    id: String(row.id),
    providerId: row.provider_name,
    category: row.category,
    title: row.title,
    description: row.description,
    priceFrom: row.price_from,
    rating: 5,
    imageUrl: row.image_url ?? undefined,
    status: row.status,
    createdAt: row.created_at,
  };
}

export interface CreateOfferInput {
  providerName: string;
  category: string;
  title: string;
  description: string;
  priceFrom: number;
  imageUrl?: string;
}

export async function createServiceOffer(input: CreateOfferInput): Promise<ServiceOffer> {
  await ensureSchema();
  const { rows } = await sql<OfferRow>`
    INSERT INTO service_offers (provider_name, category, title, description, price_from, image_url)
    VALUES (${input.providerName}, ${input.category}, ${input.title}, ${input.description}, ${input.priceFrom}, ${input.imageUrl ?? null})
    RETURNING *;
  `;
  const row = rows[0];
  if (!row) throw new Error("Insert returned no row");
  return toServiceOffer(row);
}

export async function listServiceOffers(limit = 20): Promise<ServiceOffer[]> {
  await ensureSchema();
  const { rows } = await sql<OfferRow>`
    SELECT * FROM service_offers ORDER BY created_at DESC LIMIT ${limit};
  `;
  return rows.map(toServiceOffer);
}
