"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ProductCard } from "@/components/marketplace/ProductCard";
import { Button } from "@/components/ui/Button";
import type { Product } from "@/types/domain";

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isB2B, setIsB2B] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const [productsRes, meRes] = await Promise.all([fetch("/api/products"), fetch("/api/auth/me")]);
    setProducts((await productsRes.json()).products);
    const me = await meRes.json();
    setLoggedIn(Boolean(me.user));
    setIsB2B(Boolean(me.isB2B));
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <main className="min-h-screen bg-base-950 px-6 py-10 sm:px-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl">Catalog</h1>
          <p className="mt-1 text-sm text-white/50">
            {isB2B ? "Prețuri B2B, fără TVA, cu reduceri pe volum." : "Prețuri standard, cu TVA inclus."}
          </p>
        </div>
        <Link href="/checkout">
          <Button variant="outline">Coș / Checkout</Button>
        </Link>
      </div>

      {loading ? (
        <p className="mt-8 text-sm text-white/40">Se încarcă…</p>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} isB2B={isB2B} canRfq={isB2B && loggedIn} />
          ))}
          {products.length === 0 && <p className="text-sm text-white/40">Niciun produs listat încă.</p>}
        </div>
      )}
    </main>
  );
}
