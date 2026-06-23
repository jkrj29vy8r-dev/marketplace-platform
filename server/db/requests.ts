import { sql } from "@vercel/postgres";
import { ensureSchema } from "@/server/db/schema";
import type { ServiceRequest } from "@/types/domain";

interface RequestRow {
  id: number;
  client_name: string;
  category: string;
  title: string;
  description: string;
  budget_min: number;
  budget_max: number;
  image_url: string | null;
  status: ServiceRequest["status"];
  created_at: string;
}

function toServiceRequest(row: RequestRow): ServiceRequest {
  return {
    id: String(row.id),
    clientId: row.client_name,
    category: row.category,
    title: row.title,
    description: row.description,
    budgetMin: row.budget_min,
    budgetMax: row.budget_max,
    imageUrl: row.image_url ?? undefined,
    status: row.status,
    createdAt: row.created_at,
  };
}

export interface CreateRequestInput {
  clientName: string;
  category: string;
  title: string;
  description: string;
  budgetMin: number;
  budgetMax: number;
  imageUrl?: string;
}

export async function createServiceRequest(input: CreateRequestInput): Promise<ServiceRequest> {
  await ensureSchema();
  const { rows } = await sql<RequestRow>`
    INSERT INTO service_requests (client_name, category, title, description, budget_min, budget_max, image_url)
    VALUES (${input.clientName}, ${input.category}, ${input.title}, ${input.description}, ${input.budgetMin}, ${input.budgetMax}, ${input.imageUrl ?? null})
    RETURNING *;
  `;
  const row = rows[0];
  if (!row) throw new Error("Insert returned no row");
  return toServiceRequest(row);
}

export async function listServiceRequests(limit = 20): Promise<ServiceRequest[]> {
  await ensureSchema();
  const { rows } = await sql<RequestRow>`
    SELECT * FROM service_requests ORDER BY created_at DESC LIMIT ${limit};
  `;
  return rows.map(toServiceRequest);
}
