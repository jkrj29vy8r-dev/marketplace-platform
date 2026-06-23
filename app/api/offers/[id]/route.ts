import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/server/auth/session";
import { deleteServiceOffer } from "@/server/db/offers";

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await deleteServiceOffer(params.id);
  return NextResponse.json({ ok: true });
}
