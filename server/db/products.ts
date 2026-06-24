import { sql } from "@vercel/postgres";
import { ensureSchema } from "@/server/db/schema";
import type { PriceTier, Product, ProductType } from "@/types/domain";

interface ProductRow {
  id: number;
  vendor_id: number;
  type: ProductType;
  name: string;
  description: string;
  image_url: string | null;
  category: string;
  price_retail: string;
  price_b2b: string;
  vat_rate: string;
  moq: number;
  stock: number | null;
  weight_kg: string | null;
  dimensions_cm: string | null;
  capacity: number | null;
  schedule_type: "calendar" | "fixed_slots" | null;
  active: boolean;
  created_at: string;
}

interface PriceTierRow {
  id: number;
  product_id: number;
  min_qty: number;
  price_per_unit: string;
}

function toPriceTier(row: PriceTierRow): PriceTier {
  return { minQty: row.min_qty, pricePerUnit: Number(row.price_per_unit) };
}

function toProduct(row: ProductRow, tiers: PriceTier[]): Product {
  return {
    id: String(row.id),
    vendorId: String(row.vendor_id),
    type: row.type,
    name: row.name,
    description: row.description,
    imageUrl: row.image_url ?? undefined,
    category: row.category,
    priceRetail: Number(row.price_retail),
    priceB2B: Number(row.price_b2b),
    vatRate: Number(row.vat_rate),
    priceTiers: tiers,
    moq: row.moq,
    stock: row.stock ?? undefined,
    weightKg: row.weight_kg ? Number(row.weight_kg) : undefined,
    dimensionsCm: row.dimensions_cm ?? undefined,
    capacity: row.capacity ?? undefined,
    scheduleType: row.schedule_type ?? undefined,
    active: row.active,
    createdAt: row.created_at,
  };
}

async function tiersForProduct(productId: number): Promise<PriceTier[]> {
  const { rows } = await sql<PriceTierRow>`
    SELECT * FROM price_tiers WHERE product_id = ${productId} ORDER BY min_qty ASC;
  `;
  return rows.map(toPriceTier);
}

export interface CreateProductInput {
  vendorId: string;
  type: ProductType;
  name: string;
  description: string;
  imageUrl?: string;
  category: string;
  priceRetail: number;
  priceB2B: number;
  vatRate: number;
  moq: number;
  priceTiers: PriceTier[];
  stock?: number;
  weightKg?: number;
  dimensionsCm?: string;
  capacity?: number;
  scheduleType?: "calendar" | "fixed_slots";
}

export async function createProduct(input: CreateProductInput): Promise<Product> {
  await ensureSchema();
  const { rows } = await sql<ProductRow>`
    INSERT INTO products (
      vendor_id, type, name, description, image_url, category,
      price_retail, price_b2b, vat_rate, moq, stock, weight_kg,
      dimensions_cm, capacity, schedule_type
    ) VALUES (
      ${input.vendorId}, ${input.type}, ${input.name}, ${input.description}, ${input.imageUrl ?? null}, ${input.category},
      ${input.priceRetail}, ${input.priceB2B}, ${input.vatRate}, ${input.moq}, ${input.stock ?? null}, ${input.weightKg ?? null},
      ${input.dimensionsCm ?? null}, ${input.capacity ?? null}, ${input.scheduleType ?? null}
    )
    RETURNING *;
  `;
  const row = rows[0];
  if (!row) throw new Error("Insert returned no row");

  for (const tier of input.priceTiers) {
    await sql`
      INSERT INTO price_tiers (product_id, min_qty, price_per_unit)
      VALUES (${row.id}, ${tier.minQty}, ${tier.pricePerUnit});
    `;
  }

  return toProduct(row, input.priceTiers);
}

export async function listProducts(filters?: { vendorId?: string; activeOnly?: boolean }): Promise<Product[]> {
  await ensureSchema();
  const vendorId = filters?.vendorId;
  const activeOnly = filters?.activeOnly ?? false;

  const { rows } = vendorId
    ? activeOnly
      ? await sql<ProductRow>`SELECT * FROM products WHERE vendor_id = ${vendorId} AND active = true ORDER BY created_at DESC;`
      : await sql<ProductRow>`SELECT * FROM products WHERE vendor_id = ${vendorId} ORDER BY created_at DESC;`
    : activeOnly
      ? await sql<ProductRow>`SELECT * FROM products WHERE active = true ORDER BY created_at DESC;`
      : await sql<ProductRow>`SELECT * FROM products ORDER BY created_at DESC;`;

  const result: Product[] = [];
  for (const row of rows) {
    result.push(toProduct(row, await tiersForProduct(row.id)));
  }
  return result;
}

export async function getProductById(id: string): Promise<Product | null> {
  await ensureSchema();
  const { rows } = await sql<ProductRow>`SELECT * FROM products WHERE id = ${id} LIMIT 1;`;
  const row = rows[0];
  if (!row) return null;
  return toProduct(row, await tiersForProduct(row.id));
}

export async function setProductActive(id: string, active: boolean): Promise<void> {
  await sql`UPDATE products SET active = ${active} WHERE id = ${id};`;
}

export async function decrementStock(id: string, quantity: number): Promise<void> {
  await sql`UPDATE products SET stock = GREATEST(stock - ${quantity}, 0) WHERE id = ${id} AND stock IS NOT NULL;`;
}

export async function deleteProduct(id: string): Promise<void> {
  await sql`DELETE FROM products WHERE id = ${id};`;
}

// Resolves the unit price a specific buyer pays: B2B buyers get the
// excl.-VAT base price overridden by the highest volume tier they
// qualify for; everyone else pays the flat retail (incl.-VAT) price.
export function resolveUnitPrice(product: Product, quantity: number, isB2B: boolean): number {
  if (!isB2B) return product.priceRetail;
  const applicable = product.priceTiers
    .filter((t) => quantity >= t.minQty)
    .sort((a, b) => b.minQty - a.minQty)[0];
  return applicable?.pricePerUnit ?? product.priceB2B;
}
