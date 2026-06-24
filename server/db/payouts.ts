import { sql } from "@vercel/postgres";
import { ensureSchema } from "@/server/db/schema";

export type PayoutStatus = "requested" | "paid" | "rejected";

export interface PayoutRecord {
  id: string;
  vendorId: string;
  amount: number;
  status: PayoutStatus;
  requestedAt: string;
}

interface PayoutRow {
  id: number;
  vendor_id: number;
  amount: string;
  status: PayoutStatus;
  requested_at: string;
}

function toPayout(row: PayoutRow): PayoutRecord {
  return {
    id: String(row.id),
    vendorId: String(row.vendor_id),
    amount: Number(row.amount),
    status: row.status,
    requestedAt: row.requested_at,
  };
}

export async function requestPayout(vendorId: string, amount: number): Promise<PayoutRecord> {
  await ensureSchema();
  const { rows } = await sql<PayoutRow>`
    INSERT INTO payouts (vendor_id, amount) VALUES (${vendorId}, ${amount}) RETURNING *;
  `;
  const row = rows[0];
  if (!row) throw new Error("Insert returned no row");
  return toPayout(row);
}

export async function listPayoutsForVendor(vendorId: string): Promise<PayoutRecord[]> {
  await ensureSchema();
  const { rows } = await sql<PayoutRow>`SELECT * FROM payouts WHERE vendor_id = ${vendorId} ORDER BY requested_at DESC;`;
  return rows.map(toPayout);
}

export async function listAllPayouts(): Promise<PayoutRecord[]> {
  await ensureSchema();
  const { rows } = await sql<PayoutRow>`SELECT * FROM payouts ORDER BY requested_at DESC;`;
  return rows.map(toPayout);
}

export async function setPayoutStatus(id: string, status: PayoutStatus): Promise<void> {
  await sql`UPDATE payouts SET status = ${status} WHERE id = ${id};`;
}
