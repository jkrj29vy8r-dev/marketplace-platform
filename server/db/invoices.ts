import { sql } from "@vercel/postgres";
import { ensureSchema } from "@/server/db/schema";
import type { Invoice } from "@/types/domain";

interface InvoiceRow {
  id: number;
  order_id: number;
  series: string;
  number: number;
  buyer_tax_id: string;
  buyer_name: string;
  total: string;
  vat_amount: string;
  issued_at: string;
}

function toInvoice(row: InvoiceRow): Invoice {
  return {
    id: String(row.id),
    orderId: String(row.order_id),
    series: row.series,
    number: row.number,
    buyerTaxId: row.buyer_tax_id,
    buyerName: row.buyer_name,
    total: Number(row.total),
    vatAmount: Number(row.vat_amount),
    issuedAt: row.issued_at,
  };
}

// Issues a proforma/invoice document for an order. Buyers without a CUI
// (individuals) are invoiced on their CNP/personal identifier instead;
// the `buyerTaxId` field is structured so a future RO e-Factura export
// can populate either the "Persoana fizica" or "Persoana juridica" block.
export async function issueInvoice(input: {
  orderId: string;
  buyerTaxId: string;
  buyerName: string;
  total: number;
  vatAmount: number;
}): Promise<Invoice> {
  await ensureSchema();
  const { rows } = await sql<InvoiceRow>`
    INSERT INTO invoices (order_id, buyer_tax_id, buyer_name, total, vat_amount)
    VALUES (${input.orderId}, ${input.buyerTaxId}, ${input.buyerName}, ${input.total}, ${input.vatAmount})
    RETURNING *;
  `;
  const row = rows[0];
  if (!row) throw new Error("Insert returned no row");
  return toInvoice(row);
}

export async function getInvoiceByOrder(orderId: string): Promise<Invoice | null> {
  await ensureSchema();
  const { rows } = await sql<InvoiceRow>`SELECT * FROM invoices WHERE order_id = ${orderId} LIMIT 1;`;
  const row = rows[0];
  return row ? toInvoice(row) : null;
}
