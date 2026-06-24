import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createUser, findUserByEmailWithPassword } from "@/server/db/users";
import { createCompanyProfile } from "@/server/db/companies";
import { createSessionCookie } from "@/server/auth/session";

// Public signup never allows "admin" — only client/provider as a B2C
// individual, or "vendor" when the account is registered as a company.
// Vendor accounts additionally require fiscal fields for KYB review.
const signupSchema = z.object({
  name: z.string().min(1).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(200),
  role: z.enum(["client", "provider", "vendor"]),
  accountType: z.enum(["individual", "company"]),
  company: z
    .object({
      legalName: z.string().min(1).max(150),
      cui: z.string().min(2).max(20),
      regCom: z.string().min(2).max(40),
      registeredAddress: z.string().min(3).max(250),
      vatPayer: z.boolean(),
    })
    .optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = signupSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { accountType, company, ...userInput } = parsed.data;

  if (accountType === "company" && !company) {
    return NextResponse.json({ error: "Company fields are required for a B2B account" }, { status: 400 });
  }

  const existing = await findUserByEmailWithPassword(userInput.email);
  if (existing) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }

  const user = await createUser(userInput);

  if (accountType === "company" && company) {
    await createCompanyProfile({ ownerUserId: user.id, ...company });
  }

  await createSessionCookie({ userId: user.id, role: user.role });

  return NextResponse.json({ user }, { status: 201 });
}
