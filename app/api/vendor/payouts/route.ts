import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/server/auth/session";
import { listOrdersForVendor } from "@/server/db/orders";
import { listPayoutsForVendor, requestPayout } from "@/server/db/payouts";

const schema = z.object({ amount: z.number().positive() });

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "vendor") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const payouts = await listPayoutsForVendor(session.userId);
  return NextResponse.json({ payouts });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "vendor") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const orders = await listOrdersForVendor(session.userId);
  const availableBalance = orders
    .filter((o) => o.status === "confirmed" || o.status === "fulfilled")
    .reduce((sum, o) => sum + o.netAmountToVendor, 0);
  const previousPayouts = await listPayoutsForVendor(session.userId);
  const alreadyPaidOut = previousPayouts
    .filter((p) => p.status !== "rejected")
    .reduce((sum, p) => sum + p.amount, 0);

  if (parsed.data.amount > availableBalance - alreadyPaidOut) {
    return NextResponse.json({ error: "Requested amount exceeds available balance" }, { status: 400 });
  }

  const payout = await requestPayout(session.userId, parsed.data.amount);
  return NextResponse.json({ payout }, { status: 201 });
}
