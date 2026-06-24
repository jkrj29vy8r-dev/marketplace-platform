import { sql } from "@vercel/postgres";
import { ensureSchema } from "@/server/db/schema";
import type { Order, OrderItem, OrderStatus, PaymentMethod } from "@/types/domain";

interface OrderRow {
  id: number;
  buyer_id: number;
  vendor_id: number;
  items: OrderItem[];
  subtotal: string;
  vat_amount: string;
  total: string;
  commission_rate: string;
  commission_amount: string;
  net_amount_to_vendor: string;
  payment_method: PaymentMethod;
  status: OrderStatus;
  transfer_proof_url: string | null;
  shipping_address_id: number | null;
  created_at: string;
}

function toOrder(row: OrderRow): Order {
  return {
    id: String(row.id),
    buyerId: String(row.buyer_id),
    vendorId: String(row.vendor_id),
    items: row.items,
    subtotal: Number(row.subtotal),
    vatAmount: Number(row.vat_amount),
    total: Number(row.total),
    commissionRate: Number(row.commission_rate),
    commissionAmount: Number(row.commission_amount),
    netAmountToVendor: Number(row.net_amount_to_vendor),
    paymentMethod: row.payment_method,
    status: row.status,
    transferProofUrl: row.transfer_proof_url ?? undefined,
    shippingAddressId: row.shipping_address_id ? String(row.shipping_address_id) : undefined,
    createdAt: row.created_at,
  };
}

export interface CreateOrderInput {
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
  shippingAddressId?: string;
}

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  await ensureSchema();
  const initialStatus: OrderStatus =
    input.paymentMethod === "bank_transfer" ? "awaiting_transfer_proof" : "pending_payment";

  const { rows } = await sql<OrderRow>`
    INSERT INTO orders (
      buyer_id, vendor_id, items, subtotal, vat_amount, total,
      commission_rate, commission_amount, net_amount_to_vendor,
      payment_method, status, shipping_address_id
    ) VALUES (
      ${input.buyerId}, ${input.vendorId}, ${JSON.stringify(input.items)}, ${input.subtotal}, ${input.vatAmount}, ${input.total},
      ${input.commissionRate}, ${input.commissionAmount}, ${input.netAmountToVendor},
      ${input.paymentMethod}, ${initialStatus}, ${input.shippingAddressId ?? null}
    )
    RETURNING *;
  `;
  const row = rows[0];
  if (!row) throw new Error("Insert returned no row");
  return toOrder(row);
}

export async function listOrdersForBuyer(buyerId: string): Promise<Order[]> {
  await ensureSchema();
  const { rows } = await sql<OrderRow>`SELECT * FROM orders WHERE buyer_id = ${buyerId} ORDER BY created_at DESC;`;
  return rows.map(toOrder);
}

export async function listOrdersForVendor(vendorId: string): Promise<Order[]> {
  await ensureSchema();
  const { rows } = await sql<OrderRow>`SELECT * FROM orders WHERE vendor_id = ${vendorId} ORDER BY created_at DESC;`;
  return rows.map(toOrder);
}

export async function getOrderById(id: string): Promise<Order | null> {
  await ensureSchema();
  const { rows } = await sql<OrderRow>`SELECT * FROM orders WHERE id = ${id} LIMIT 1;`;
  const row = rows[0];
  return row ? toOrder(row) : null;
}

export async function setOrderStatus(id: string, status: OrderStatus): Promise<void> {
  await sql`UPDATE orders SET status = ${status} WHERE id = ${id};`;
}

export async function attachTransferProof(id: string, url: string): Promise<void> {
  await sql`UPDATE orders SET transfer_proof_url = ${url}, status = 'confirmed' WHERE id = ${id};`;
}

export async function listAllOrders(): Promise<Order[]> {
  await ensureSchema();
  const { rows } = await sql<OrderRow>`SELECT * FROM orders ORDER BY created_at DESC;`;
  return rows.map(toOrder);
}
