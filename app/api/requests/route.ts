import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServiceRequest, listServiceRequests } from "@/server/db/requests";

const createRequestSchema = z.object({
  clientName: z.string().min(1).max(80),
  category: z.string().min(1).max(60),
  title: z.string().min(1).max(120),
  description: z.string().min(1).max(2000),
  budgetMin: z.number().nonnegative(),
  budgetMax: z.number().nonnegative(),
  imageUrl: z.string().url().optional(),
});

export async function GET() {
  const requests = await listServiceRequests();
  return NextResponse.json({ requests });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = createRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const created = await createServiceRequest(parsed.data);
  return NextResponse.json({ request: created }, { status: 201 });
}
