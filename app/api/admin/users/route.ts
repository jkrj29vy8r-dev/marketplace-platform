import { NextResponse } from "next/server";
import { getSession } from "@/server/auth/session";
import { listUsers } from "@/server/db/users";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const users = await listUsers();
  return NextResponse.json({ users });
}
