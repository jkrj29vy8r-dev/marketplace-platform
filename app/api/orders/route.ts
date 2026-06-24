import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/server/auth/session";
import { createOrder, listOrdersForBuyer, listOrdersForVendor } from "@/server/db/orders";
import { decrementStock, getProductById, resolveUnitPrice } from "@/server/db/products";
import { getCompanyByOwner } from "@/server/db/companies";
import { getCommissionOverride } from "@/server/db/settings";
import { computeCommission } from "@/server/services/commission";
import { issueInvoice } from "@/server/db/invoices";
import { getUserById } from "@/server/db/users";
import type { OrderItem } from "@/types/domain";

const checkoutSchema = z.object({
  vendorId: z.string().min(1),
  items: z.array(z.object({ productId: z.string().min(1), quantity: z.number().int().positive() })).min(1),
  paymentMethod: z.enum(["card", "cod", "bank_transfer", "net_terms"]),
  shippingAddressId: z.string().optional(),
  buyerTaxId: z.string().min(1).max(20),
});

const B2C_METHODS = new Set(["card", "cod"]);
const B2B_METHODS = new Set(["card", "bank_transfer", "net_terms"]);

// Checkout is per-vendor: a cart spanning multiple vendors must be split
// into one order per vendor before calling this endpoint. Pricing,
// VAT and the marketplace commission are all recomputed server-side
// from the catalog — the client never gets to dictate the charged price.
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const company = await getCompanyByOwner(session.userId);
  const isB2B = Boolean(company?.approved);

  const allowedMethods = isB2B ? B2B_METHODS : B2C_METHODS;
  if (!allowedMethods.has(parsed.data.paymentMethod)) {
    return NextResponse.json(
      { error: `Payment method "${parsed.data.paymentMethod}" is not available for this account type` },
      { status: 400 }
    );
  }

  const orderItems: OrderItem[] = [];
  let subtotal = 0;
  let vatAmount = 0;
  let needsShipping = false;

  for (const line of parsed.data.items) {
    const product = await getProductById(line.productId);
    if (!product || !product.active || product.vendorId !== parsed.data.vendorId) {
      return NextResponse.json({ error: `Invalid product ${line.productId}` }, { status: 400 });
    }
    if (isB2B && line.quantity < product.moq) {
      return NextResponse.json(
        { error: `${product.name} has a minimum order quantity of ${product.moq}` },
        { status: 400 }
      );
    }
    if (product.type === "physical" && (product.stock ?? 0) < line.quantity) {
      return NextResponse.json({ error: `${product.name} is out of stock` }, { status: 400 });
    }
    if (product.type === "physical") needsShipping = true;

    const unitPrice = resolveUnitPrice(product, line.quantity, isB2B);
    const lineExclVat = isB2B ? unitPrice * line.quantity : (unitPrice / (1 + product.vatRate)) * line.quantity;
    const lineVat = lineExclVat * product.vatRate;

    subtotal += lineExclVat;
    vatAmount += lineVat;
    orderItems.push({ productId: product.id, name: product.name, quantity: line.quantity, unitPrice, vatRate: product.vatRate });

    if (product.type === "physical") {
      await decrementStock(product.id, line.quantity);
    }
  }

  if (needsShipping && !parsed.data.shippingAddressId) {
    return NextResponse.json({ error: "Shipping address is required for physical items" }, { status: 400 });
  }

  const overrideRate = await getCommissionOverride();
  const { commissionRate, commissionAmount, netAmountToProvider } = computeCommission(
    Math.round(subtotal * 100) / 100,
    overrideRate
  );
  const total = Math.round((subtotal + vatAmount) * 100) / 100;

  const order = await createOrder({
    buyerId: session.userId,
    vendorId: parsed.data.vendorId,
    items: orderItems,
    subtotal: Math.round(subtotal * 100) / 100,
    vatAmount: Math.round(vatAmount * 100) / 100,
    total,
    commissionRate,
    commissionAmount,
    netAmountToVendor: netAmountToProvider,
    paymentMethod: parsed.data.paymentMethod,
    shippingAddressId: needsShipping ? parsed.data.shippingAddressId : undefined,
  });

  const buyer = await getUserById(session.userId);
  await issueInvoice({
    orderId: order.id,
    buyerTaxId: parsed.data.buyerTaxId,
    buyerName: company?.legalName ?? buyer?.name ?? "Unknown",
    total: order.total,
    vatAmount: order.vatAmount,
  });

  return NextResponse.json({ order }, { status: 201 });
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orders =
    session.role === "vendor" ? await listOrdersForVendor(session.userId) : await listOrdersForBuyer(session.userId);

  return NextResponse.json({ orders });
}
