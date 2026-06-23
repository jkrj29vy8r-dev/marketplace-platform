import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/server/auth/session";
import { getCommissionOverride, setCommissionOverride } from "@/server/db/settings";

const settingsSchema = z.object({ commissionOverride: z.number().min(0).max(1).nullable() });

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const commissionOverride = await getCommissionOverride();
  return NextResponse.json({ commissionOverride });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = settingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  await setCommissionOverride(parsed.data.commissionOverride);
  return NextResponse.json({ ok: true });
}
