"use client";

import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import type { Product } from "@/types/domain";

interface VendorCatalogProps {
  products: Product[];
  onChanged: () => void;
}

export function VendorCatalog({ products, onChanged }: VendorCatalogProps) {
  async function toggleActive(product: Product) {
    await fetch(`/api/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !product.active }),
    });
    onChanged();
  }

  async function remove(product: Product) {
    if (!confirm(`Ștergi "${product.name}"?`)) return;
    await fetch(`/api/products/${product.id}`, { method: "DELETE" });
    onChanged();
  }

  return (
    <GlassCard className="p-6">
      <h2 className="font-display text-lg">Catalogul tău</h2>
      <div className="mt-4 space-y-2">
        {products.map((product) => (
          <div
            key={product.id}
            className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] px-4 py-3"
          >
            <div>
              <p className="text-sm font-medium">
                {product.name}{" "}
                <span className="text-white/30">
                  · {product.type === "physical" ? `stoc ${product.stock}` : `${product.capacity} locuri`}
                </span>
              </p>
              <p className="text-xs text-white/40">
                {product.priceRetail} lei retail · {product.priceB2B} lei B2B (excl. TVA)
                {product.moq > 1 && ` · MOQ ${product.moq}`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {!product.active && <span className="text-xs text-accent-danger">Inactiv</span>}
              <Button variant="outline" className="px-3 py-1 text-xs" onClick={() => toggleActive(product)}>
                {product.active ? "Dezactivează" : "Activează"}
              </Button>
              <Button variant="ghost" className="px-3 py-1 text-xs text-accent-danger" onClick={() => remove(product)}>
                Șterge
              </Button>
            </div>
          </div>
        ))}
        {products.length === 0 && <p className="text-sm text-white/40">Nu ai listat încă nimic.</p>}
      </div>
    </GlassCard>
  );
}
