import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/server/auth/session";
import { getRfqById, respondToRfq } from "@/server/db/rfq";

const respondSchema = z.object({
  status: z.enum(["countered", "accepted", "declined"]),
  counterPricePerUnit: z.number().nonnegative().optional(),
  counterTerms: z.string().max(2000).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rfq = await getRfqById(params.id);
  if (!rfq) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isVendor = session.userId === rfq.vendorId;
  const isBuyer = session.userId === rfq.buyerId;
  if (!isVendor && !isBuyer && session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = respondSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // Only the vendor can counter; only the buyer can accept/decline a counter.
  if (parsed.data.status === "countered" && !isVendor && session.role !== "admin") {
    return NextResponse.json({ error: "Only the vendor can send a counter offer" }, { status: 403 });
  }
  if ((parsed.data.status === "accepted" || parsed.data.status === "declined") && !isBuyer && session.role !== "admin") {
    return NextResponse.json({ error: "Only the buyer can accept or decline" }, { status: 403 });
  }

  await respondToRfq(params.id, parsed.data);
  return NextResponse.json({ ok: true });
}
