import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { findUserByEmailWithPassword, verifyPassword } from "@/server/db/users";
import { createSessionCookie } from "@/server/auth/session";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const row = await findUserByEmailWithPassword(parsed.data.email);
  if (!row || !(await verifyPassword(parsed.data.password, row.password_hash))) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }
  if (row.blocked) {
    return NextResponse.json({ error: "This account has been suspended" }, { status: 403 });
  }

  await createSessionCookie({ userId: String(row.id), role: row.role });

  return NextResponse.json({
    user: { id: String(row.id), name: row.name, email: row.email, role: row.role },
  });
}
