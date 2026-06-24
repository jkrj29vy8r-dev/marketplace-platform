import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/server/auth/session";
import { createAddress, listAddressesForUser } from "@/server/db/addresses";

const schema = z.object({
  kind: z.enum(["billing", "shipping"]),
  label: z.string().min(1).max(80),
  line1: z.string().min(1).max(200),
  city: z.string().min(1).max(80),
  county: z.string().min(1).max(80),
  postalCode: z.string().min(1).max(20),
  country: z.string().min(2).max(2).default("RO"),
});

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const addresses = await listAddressesForUser(session.userId);
  return NextResponse.json({ addresses });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const address = await createAddress({ ownerUserId: session.userId, ...parsed.data });
  return NextResponse.json({ address }, { status: 201 });
}
