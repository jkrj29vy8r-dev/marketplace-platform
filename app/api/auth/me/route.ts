import { NextResponse } from "next/server";
import { getSession } from "@/server/auth/session";
import { getUserById } from "@/server/db/users";
import { getCompanyByOwner } from "@/server/db/companies";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ user: null });

  const user = await getUserById(session.userId);
  const company = await getCompanyByOwner(session.userId);
  const isB2B = Boolean(company?.approved);

  return NextResponse.json({ user, company, isB2B });
}
