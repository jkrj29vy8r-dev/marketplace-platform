"use client";

import { useCallback, useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { clearCart, getCarts, type VendorCart } from "@/lib/cart";
import type { PaymentMethod, Product } from "@/types/domain";

interface VendorCheckout {
  cart: VendorCart;
  products: Product[];
  needsShipping: boolean;
}

const inputClass = "w-full rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-sm";

export default function CheckoutPage() {
  const [isB2B, setIsB2B] = useState(false);
  const [checkouts, setCheckouts] = useState<VendorCheckout[]>([]);
  const [buyerTaxId, setBuyerTaxId] = useState("");
  const [address, setAddress] = useState({ line1: "", city: "", county: "", postalCode: "" });
  const [payment, setPayment] = useState<Record<string, PaymentMethod>>({});
  const [transferUrl, setTransferUrl] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const me = await fetch("/api/auth/me").then((r) => r.json());
    setIsB2B(Boolean(me.isB2B));

    const carts = getCarts();
    const built: VendorCheckout[] = [];
    for (const cart of carts) {
      const products: Product[] = [];
      for (const line of cart.lines) {
        const res = await fetch(`/api/products/${line.productId}`);
        if (res.ok) products.push((await res.json()).product);
      }
      built.push({ cart, products, needsShipping: products.some((p) => p.type === "physical") });
    }
    setCheckouts(built);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function placeOrder(checkout: VendorCheckout) {
    const method = payment[checkout.cart.vendorId] ?? (isB2B ? "card" : "card");

    let shippingAddressId: string | undefined;
    if (checkout.needsShipping) {
      const res = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "shipping", label: "Livrare", ...address }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus((s) => ({ ...s, [checkout.cart.vendorId]: data.error?.formErrors?.[0] ?? data.error }));
        return;
      }
      shippingAddressId = data.address.id;
    }

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vendorId: checkout.cart.vendorId,
        items: checkout.cart.lines.map((l) => ({ productId: l.productId, quantity: l.quantity })),
        paymentMethod: method,
        shippingAddressId,
        buyerTaxId,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setStatus((s) => ({ ...s, [checkout.cart.vendorId]: data.error?.formErrors?.[0] ?? data.error }));
      return;
    }

    if (method === "bank_transfer" && transferUrl[checkout.cart.vendorId]) {
      await fetch(`/api/orders/${data.order.id}/transfer-proof`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: transferUrl[checkout.cart.vendorId] }),
      });
    }

    clearCart(checkout.cart.vendorId);
    setStatus((s) => ({ ...s, [checkout.cart.vendorId]: "Comandă plasată cu succes." }));
    refresh();
  }

  if (loading) return <p className="p-10 text-sm text-white/40">Se încarcă…</p>;

  return (
    <main className="min-h-screen bg-base-950 px-6 py-10 sm:px-10">
      <h1 className="font-display text-2xl">Checkout</h1>
      <p className="mt-1 text-sm text-white/50">
        {isB2B ? "Cont B2B — plată cu cardul, OP cu dovadă, sau termen Net 30/60." : "Plată cu cardul sau ramburs."}
      </p>

      <div className="mt-6 max-w-md space-y-2">
        <input
          value={buyerTaxId}
          onChange={(e) => setBuyerTaxId(e.target.value)}
          placeholder={isB2B ? "CUI companie" : "CNP (pentru factură)"}
          className={inputClass}
        />
      </div>

      <div className="mt-8 space-y-6">
        {checkouts.map((checkout) => (
          <GlassCard key={checkout.cart.vendorId} className="p-6">
            <h2 className="font-display text-lg">Furnizor #{checkout.cart.vendorId}</h2>
            <div className="mt-2 space-y-1">
              {checkout.cart.lines.map((line) => (
                <p key={line.productId} className="text-sm text-white/60">
                  {line.quantity} × {line.name}
                </p>
              ))}
            </div>

            {checkout.needsShipping && (
              <div className="mt-4 grid grid-cols-2 gap-2">
                <input
                  value={address.line1}
                  onChange={(e) => setAddress({ ...address, line1: e.target.value })}
                  placeholder="Adresă"
                  className={inputClass}
                />
                <input
                  value={address.city}
                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  placeholder="Oraș"
                  className={inputClass}
                />
                <input
                  value={address.county}
                  onChange={(e) => setAddress({ ...address, county: e.target.value })}
                  placeholder="Județ"
                  className={inputClass}
                />
                <input
                  value={address.postalCode}
                  onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
                  placeholder="Cod poștal"
                  className={inputClass}
                />
              </div>
            )}
            {!checkout.needsShipping && (
              <p className="mt-3 text-xs text-accent-cyan">Comandă doar cu servicii — fără livrare fizică.</p>
            )}

            <div className="mt-4">
              <p className="text-xs text-white/50">Metodă de plată</p>
              <select
                className={inputClass + " mt-1"}
                value={payment[checkout.cart.vendorId] ?? "card"}
                onChange={(e) => setPayment({ ...payment, [checkout.cart.vendorId]: e.target.value as PaymentMethod })}
              >
                <option value="card">Card online</option>
                {!isB2B && <option value="cod">Ramburs</option>}
                {isB2B && <option value="bank_transfer">Ordin de plată (OP)</option>}
                {isB2B && <option value="net_terms">Plată la termen (Net 30/60)</option>}
              </select>
            </div>

            {payment[checkout.cart.vendorId] === "bank_transfer" && (
              <input
                className={inputClass + " mt-2"}
                placeholder="URL dovadă transfer bancar"
                value={transferUrl[checkout.cart.vendorId] ?? ""}
                onChange={(e) => setTransferUrl({ ...transferUrl, [checkout.cart.vendorId]: e.target.value })}
              />
            )}

            <Button className="mt-4 w-full" onClick={() => placeOrder(checkout)}>
              Plasează comanda
            </Button>
            {status[checkout.cart.vendorId] && (
              <p className="mt-2 text-sm text-accent-cyan">{status[checkout.cart.vendorId]}</p>
            )}
          </GlassCard>
        ))}
        {checkouts.length === 0 && <p className="text-sm text-white/40">Coșul este gol.</p>}
      </div>
    </main>
  );
}
