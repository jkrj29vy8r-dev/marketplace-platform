import { sql } from "@vercel/postgres";
import { ensureSchema } from "@/server/db/schema";
import type { RfqRequest, RfqStatus } from "@/types/domain";

interface RfqRow {
  id: number;
  product_id: number;
  buyer_id: number;
  vendor_id: number;
  quantity: number;
  message: string;
  status: RfqStatus;
  counter_price_per_unit: string | null;
  counter_terms: string | null;
  created_at: string;
  updated_at: string;
}

function toRfq(row: RfqRow): RfqRequest {
  return {
    id: String(row.id),
    productId: String(row.product_id),
    buyerId: String(row.buyer_id),
    vendorId: String(row.vendor_id),
    quantity: row.quantity,
    message: row.message,
    status: row.status,
    counterPricePerUnit: row.counter_price_per_unit ? Number(row.counter_price_per_unit) : undefined,
    counterTerms: row.counter_terms ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function createRfq(input: {
  productId: string;
  buyerId: string;
  vendorId: string;
  quantity: number;
  message: string;
}): Promise<RfqRequest> {
  await ensureSchema();
  const { rows } = await sql<RfqRow>`
    INSERT INTO rfq_requests (product_id, buyer_id, vendor_id, quantity, message)
    VALUES (${input.productId}, ${input.buyerId}, ${input.vendorId}, ${input.quantity}, ${input.message})
    RETURNING *;
  `;
  const row = rows[0];
  if (!row) throw new Error("Insert returned no row");
  return toRfq(row);
}

export async function listRfqsForVendor(vendorId: string): Promise<RfqRequest[]> {
  await ensureSchema();
  const { rows } = await sql<RfqRow>`
    SELECT * FROM rfq_requests WHERE vendor_id = ${vendorId} ORDER BY created_at DESC;
  `;
  return rows.map(toRfq);
}

export async function listRfqsForBuyer(buyerId: string): Promise<RfqRequest[]> {
  await ensureSchema();
  const { rows } = await sql<RfqRow>`
    SELECT * FROM rfq_requests WHERE buyer_id = ${buyerId} ORDER BY created_at DESC;
  `;
  return rows.map(toRfq);
}

export async function getRfqById(id: string): Promise<RfqRequest | null> {
  await ensureSchema();
  const { rows } = await sql<RfqRow>`SELECT * FROM rfq_requests WHERE id = ${id} LIMIT 1;`;
  const row = rows[0];
  return row ? toRfq(row) : null;
}

export async function respondToRfq(
  id: string,
  input: { status: RfqStatus; counterPricePerUnit?: number; counterTerms?: string }
): Promise<void> {
  await sql`
    UPDATE rfq_requests
    SET status = ${input.status},
        counter_price_per_unit = ${input.counterPricePerUnit ?? null},
        counter_terms = ${input.counterTerms ?? null},
        updated_at = now()
    WHERE id = ${id};
  `;
}
