import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createUser, findUserByEmailWithPassword } from "@/server/db/users";
import { createSessionCookie } from "@/server/auth/session";

const signupSchema = z.object({
  name: z.string().min(1).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(200),
  role: z.enum(["client", "provider"]),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = signupSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const existing = await findUserByEmailWithPassword(parsed.data.email);
  if (existing) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }

  const user = await createUser(parsed.data);
  await createSessionCookie({ userId: user.id, role: user.role });

  return NextResponse.json({ user }, { status: 201 });
}
