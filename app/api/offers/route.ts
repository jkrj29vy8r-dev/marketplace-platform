import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServiceOffer, listServiceOffers } from "@/server/db/offers";

const createOfferSchema = z.object({
  providerName: z.string().min(1).max(80),
  category: z.string().min(1).max(60),
  title: z.string().min(1).max(120),
  description: z.string().min(1).max(2000),
  priceFrom: z.number().nonnegative(),
  imageUrl: z.string().url().optional(),
});

export async function GET() {
  const offers = await listServiceOffers();
  return NextResponse.json({ offers });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = createOfferSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const created = await createServiceOffer(parsed.data);
  return NextResponse.json({ offer: created }, { status: 201 });
}
