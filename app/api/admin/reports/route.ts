import { NextResponse } from "next/server";
import { getSession } from "@/server/auth/session";
import { listAllOrders } from "@/server/db/orders";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const orders = await listAllOrders();
  const gmv = orders.reduce((sum, o) => sum + o.total, 0);
  const commissionVolume = orders.reduce((sum, o) => sum + o.commissionAmount, 0);
  const byStatus = orders.reduce<Record<string, number>>((acc, o) => {
    acc[o.status] = (acc[o.status] ?? 0) + 1;
    return acc;
  }, {});

  return NextResponse.json({
    gmv: Math.round(gmv * 100) / 100,
    commissionVolume: Math.round(commissionVolume * 100) / 100,
    orderCount: orders.length,
    byStatus,
  });
}
