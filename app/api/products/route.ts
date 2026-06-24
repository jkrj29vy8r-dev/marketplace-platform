import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/server/auth/session";
import { createProduct, listProducts } from "@/server/db/products";
import { getCompanyByOwner } from "@/server/db/companies";

const priceTierSchema = z.object({
  minQty: z.number().int().positive(),
  pricePerUnit: z.number().nonnegative(),
});

const createProductSchema = z.object({
  type: z.enum(["physical", "service"]),
  name: z.string().min(1).max(150),
  description: z.string().min(1).max(4000),
  imageUrl: z.string().url().optional(),
  category: z.string().min(1).max(60),
  priceRetail: z.number().nonnegative(),
  priceB2B: z.number().nonnegative(),
  vatRate: z.number().min(0).max(1),
  moq: z.number().int().positive().default(1),
  priceTiers: z.array(priceTierSchema).default([]),
  stock: z.number().int().nonnegative().optional(),
  weightKg: z.number().nonnegative().optional(),
  dimensionsCm: z.string().max(60).optional(),
  capacity: z.number().int().nonnegative().optional(),
  scheduleType: z.enum(["calendar", "fixed_slots"]).optional(),
});

export async function GET(req: NextRequest) {
  const vendorId = req.nextUrl.searchParams.get("vendorId") ?? undefined;
  const products = await listProducts({ vendorId, activeOnly: !vendorId });
  return NextResponse.json({ products });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || (session.role !== "vendor" && session.role !== "admin")) {
    return NextResponse.json({ error: "Only vendor accounts can list products" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = createProductSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  if (parsed.data.priceTiers.length > 0) {
    const company = await getCompanyByOwner(session.userId);
    if (!company?.approved) {
      return NextResponse.json(
        { error: "Volume pricing requires an approved B2B vendor profile" },
        { status: 403 }
      );
    }
  }

  if (parsed.data.type === "physical" && parsed.data.stock === undefined) {
    return NextResponse.json({ error: "Physical products require a stock quantity" }, { status: 400 });
  }
  if (parsed.data.type === "service" && parsed.data.capacity === undefined) {
    return NextResponse.json({ error: "Services require a capacity/slot count" }, { status: 400 });
  }

  const product = await createProduct({ vendorId: session.userId, ...parsed.data });
  return NextResponse.json({ product }, { status: 201 });
}
