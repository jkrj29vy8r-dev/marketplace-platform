import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/server/auth/session";
import { createRfq, listRfqsForBuyer, listRfqsForVendor } from "@/server/db/rfq";
import { getProductById } from "@/server/db/products";
import { getCompanyByOwner } from "@/server/db/companies";

const createRfqSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive(),
  message: z.string().max(2000).default(""),
});

// RFQ ("cerere de oferta") is a B2B-only negotiation channel: a buyer
// with an approved company profile asks the vendor for a custom price
// on a quantity, and the vendor can counter with a price + terms.
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const company = await getCompanyByOwner(session.userId);
  if (!company?.approved) {
    return NextResponse.json({ error: "RFQ is only available to approved B2B accounts" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = createRfqSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const product = await getProductById(parsed.data.productId);
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const rfq = await createRfq({
    productId: parsed.data.productId,
    buyerId: session.userId,
    vendorId: product.vendorId,
    quantity: parsed.data.quantity,
    message: parsed.data.message,
  });

  return NextResponse.json({ rfq }, { status: 201 });
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rfqs =
    session.role === "vendor"
      ? await listRfqsForVendor(session.userId)
      : await listRfqsForBuyer(session.userId);

  return NextResponse.json({ rfqs });
}
