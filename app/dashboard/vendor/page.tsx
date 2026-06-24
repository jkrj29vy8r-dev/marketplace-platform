"use client";

import { useCallback, useEffect, useState } from "react";
import { ProductForm } from "@/components/dashboard/ProductForm";
import { VendorCatalog } from "@/components/dashboard/VendorCatalog";
import { RfqInbox } from "@/components/dashboard/RfqInbox";
import { PayoutPanel } from "@/components/dashboard/PayoutPanel";
import { LogoutButton } from "@/components/auth/LogoutButton";
import type { Order, Product, RfqRequest } from "@/types/domain";

export default function VendorDashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [rfqs, setRfqs] = useState<RfqRequest[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [payouts, setPayouts] = useState<{ id: string; amount: number; status: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const me = await fetch("/api/auth/me").then((r) => r.json());
    const vendorId = me.user?.id;
    const [productsRes, rfqsRes, ordersRes, payoutsRes] = await Promise.all([
      fetch(`/api/products?vendorId=${vendorId}`),
      fetch("/api/rfq"),
      fetch("/api/orders"),
      fetch("/api/vendor/payouts"),
    ]);
    setProducts((await productsRes.json()).products);
    setRfqs((await rfqsRes.json()).rfqs);
    setOrders((await ordersRes.json()).orders);
    setPayouts((await payoutsRes.json()).payouts);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <main className="min-h-screen bg-base-950 px-6 py-10 sm:px-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl">Panou vânzător</h1>
          <p className="mt-1 text-sm text-white/50">Produse, servicii, stocuri, comenzi și retrageri.</p>
        </div>
        <LogoutButton />
      </div>

      {loading ? (
        <p className="mt-8 text-sm text-white/40">Se încarcă…</p>
      ) : (
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
          <div className="space-y-6">
            <ProductForm onPosted={refresh} />
            <PayoutPanel orders={orders} payouts={payouts} onRequested={refresh} />
          </div>
          <div className="space-y-6">
            <VendorCatalog products={products} onChanged={refresh} />
            <RfqInbox rfqs={rfqs} role="vendor" onChanged={refresh} />

            <div>
              <h2 className="font-display text-lg">Comenzi</h2>
              <div className="mt-3 space-y-2">
                {orders.map((order) => (
                  <div key={order.id} className="rounded-lg border border-white/10 bg-white/[0.02] px-4 py-3 text-sm">
                    <span className="font-medium">{order.total.toFixed(2)} lei</span>{" "}
                    <span className="text-white/40">
                      · {order.status} · comision {(order.commissionRate * 100).toFixed(0)}% · net{" "}
                      {order.netAmountToVendor.toFixed(2)} lei
                    </span>
                  </div>
                ))}
                {orders.length === 0 && <p className="text-sm text-white/40">Nicio comandă încă.</p>}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
