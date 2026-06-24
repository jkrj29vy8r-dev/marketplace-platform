"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { addToCart } from "@/lib/cart";
import type { Product } from "@/types/domain";

interface ProductCardProps {
  product: Product;
  isB2B: boolean;
  canRfq: boolean;
}

export function ProductCard({ product, isB2B, canRfq }: ProductCardProps) {
  const [quantity, setQuantity] = useState(product.moq > 1 ? product.moq : 1);
  const [rfqOpen, setRfqOpen] = useState(false);
  const [rfqMessage, setRfqMessage] = useState("");
  const [rfqSent, setRfqSent] = useState(false);

  const tieredPrice = product.priceTiers
    .filter((t) => quantity >= t.minQty)
    .sort((a, b) => b.minQty - a.minQty)[0]?.pricePerUnit;
  const b2bUnitPrice = tieredPrice ?? product.priceB2B;

  function addLine() {
    addToCart(product.vendorId, product.id, product.name, quantity);
  }

  async function sendRfq() {
    await fetch("/api/rfq", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: product.id, quantity, message: rfqMessage }),
    });
    setRfqSent(true);
  }

  return (
    <GlassCard className="overflow-hidden">
      {product.imageUrl && <img src={product.imageUrl} alt={product.name} className="h-40 w-full object-cover" />}
      <div className="p-4">
        <p className="text-xs uppercase tracking-wide text-accent-cyan">{product.category}</p>
        <h3 className="mt-1 font-display text-lg">{product.name}</h3>
        <p className="mt-1 text-sm text-white/50">{product.description}</p>

        {isB2B ? (
          <div className="mt-3 text-sm">
            <p>
              {b2bUnitPrice.toFixed(2)} lei/buc <span className="text-white/40">fără TVA</span>
            </p>
            <p className="text-white/40">{(b2bUnitPrice * (1 + product.vatRate)).toFixed(2)} lei cu TVA</p>
            {product.moq > 1 && <p className="text-xs text-accent-violet">MOQ: {product.moq} buc</p>}
            {product.priceTiers.length > 0 && (
              <ul className="mt-1 text-xs text-white/40">
                {product.priceTiers.map((t) => (
                  <li key={t.minQty}>
                    {t.minQty}+ buc → {t.pricePerUnit.toFixed(2)} lei/buc
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <p className="mt-3 text-lg font-display">{product.priceRetail.toFixed(2)} lei</p>
        )}

        {product.type === "physical" && <p className="mt-1 text-xs text-white/40">Stoc: {product.stock}</p>}
        {product.type === "service" && <p className="mt-1 text-xs text-white/40">Locuri: {product.capacity}</p>}

        <div className="mt-3 flex items-center gap-2">
          <input
            type="number"
            min={product.moq > 1 ? product.moq : 1}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="w-20 rounded-lg border border-white/10 bg-white/[0.02] px-2 py-1.5 text-sm"
          />
          <Button className="flex-1" onClick={addLine}>
            Adaugă în coș
          </Button>
        </div>

        {canRfq && (
          <div className="mt-2">
            {!rfqOpen ? (
              <Button variant="outline" className="w-full text-xs" onClick={() => setRfqOpen(true)}>
                Cere ofertă personalizată
              </Button>
            ) : rfqSent ? (
              <p className="text-xs text-accent-cyan">Cererea a fost trimisă către vânzător.</p>
            ) : (
              <div className="space-y-2">
                <textarea
                  value={rfqMessage}
                  onChange={(e) => setRfqMessage(e.target.value)}
                  placeholder="Detalii cerere (cantitate, termen livrare etc.)"
                  className="w-full rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-xs"
                  rows={2}
                />
                <Button className="w-full text-xs" onClick={sendRfq}>
                  Trimite cererea
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </GlassCard>
  );
}
