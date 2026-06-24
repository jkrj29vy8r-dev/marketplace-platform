import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/server/auth/session";
import { listCompanies, setCompanyApproved } from "@/server/db/companies";

// KYB (Know Your Business) queue: every company profile created at
// signup starts unapproved, which blocks RFQ, tiered pricing and
// net-terms checkout until an admin reviews and approves it here.
export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const companies = await listCompanies();
  return NextResponse.json({ companies });
}

const patchSchema = z.object({ companyId: z.string().min(1), approved: z.boolean() });

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  await setCompanyApproved(parsed.data.companyId, parsed.data.approved);
  return NextResponse.json({ ok: true });
}
