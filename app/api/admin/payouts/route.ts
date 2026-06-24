import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/server/auth/session";
import { listAllPayouts, setPayoutStatus } from "@/server/db/payouts";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const payouts = await listAllPayouts();
  return NextResponse.json({ payouts });
}

const schema = z.object({ payoutId: z.string().min(1), status: z.enum(["paid", "rejected"]) });

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  await setPayoutStatus(parsed.data.payoutId, parsed.data.status);
  return NextResponse.json({ ok: true });
}
