import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/server/auth/session";
import { attachTransferProof, getOrderById } from "@/server/db/orders";

const schema = z.object({ url: z.string().url() });

// B2B buyers paying by "Ordin de Plata" attach proof of the bank
// transfer here; the order moves from awaiting_transfer_proof to
// confirmed once the vendor/admin can verify it against the bank feed.
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const order = await getOrderById(params.id);
  if (!order || order.buyerId !== session.userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (order.paymentMethod !== "bank_transfer") {
    return NextResponse.json({ error: "This order is not paid by bank transfer" }, { status: 400 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  await attachTransferProof(params.id, parsed.data.url);
  return NextResponse.json({ ok: true });
}
