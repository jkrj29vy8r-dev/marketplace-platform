import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/server/auth/session";
import { deleteProduct, getProductById, setProductActive } from "@/server/db/products";

const patchSchema = z.object({ active: z.boolean() });

async function requireOwnerOrAdmin(productId: string) {
  const session = await getSession();
  if (!session) return null;
  const product = await getProductById(productId);
  if (!product) return null;
  if (session.role !== "admin" && session.userId !== product.vendorId) return null;
  return session;
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const product = await getProductById(params.id);
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ product });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireOwnerOrAdmin(params.id))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  await setProductActive(params.id, parsed.data.active);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireOwnerOrAdmin(params.id))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await deleteProduct(params.id);
  return NextResponse.json({ ok: true });
}
