"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import type { PriceTier, ProductType } from "@/types/domain";

const inputClass =
  "w-full rounded-lg border border-white/10 bg-white/[0.02] px-4 py-2 text-sm outline-none focus:border-accent-cyan/50";

interface ProductFormProps {
  onPosted: () => void;
}

export function ProductForm({ onPosted }: ProductFormProps) {
  const [type, setType] = useState<ProductType>("physical");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [priceRetail, setPriceRetail] = useState("");
  const [priceB2B, setPriceB2B] = useState("");
  const [vatRate, setVatRate] = useState("0.19");
  const [moq, setMoq] = useState("1");
  const [tiers, setTiers] = useState<PriceTier[]>([]);
  const [stock, setStock] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [dimensionsCm, setDimensionsCm] = useState("");
  const [capacity, setCapacity] = useState("");
  const [scheduleType, setScheduleType] = useState<"calendar" | "fixed_slots">("calendar");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function addTier() {
    setTiers([...tiers, { minQty: 1, pricePerUnit: 0 }]);
  }

  function updateTier(index: number, patch: Partial<PriceTier>) {
    setTiers(tiers.map((t, i) => (i === index ? { ...t, ...patch } : t)));
  }

  function removeTier(index: number) {
    setTiers(tiers.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      let imageUrl: string | undefined;
      if (file) {
        const form = new FormData();
        form.append("file", file);
        const uploadRes = await fetch("/api/upload", { method: "POST", body: form });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.error ?? "Upload failed");
        imageUrl = uploadData.url;
      }

      const payload = {
        type,
        name,
        description,
        category,
        imageUrl,
        priceRetail: Number(priceRetail),
        priceB2B: Number(priceB2B),
        vatRate: Number(vatRate),
        moq: Number(moq),
        priceTiers: tiers,
        stock: type === "physical" ? Number(stock) : undefined,
        weightKg: type === "physical" && weightKg ? Number(weightKg) : undefined,
        dimensionsCm: type === "physical" ? dimensionsCm || undefined : undefined,
        capacity: type === "service" ? Number(capacity) : undefined,
        scheduleType: type === "service" ? scheduleType : undefined,
      };

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.formErrors?.[0] ?? data.error ?? "Failed to post product");

      setName("");
      setDescription("");
      setCategory("");
      setPriceRetail("");
      setPriceB2B("");
      setTiers([]);
      setStock("");
      setFile(null);
      onPosted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post product");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <GlassCard className="p-6">
      <h2 className="font-display text-lg">Listează produs / serviciu</h2>
      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <div className="flex gap-3 text-sm">
          <label className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-white/10 px-3 py-2">
            <input type="radio" checked={type === "physical"} onChange={() => setType("physical")} />
            Produs fizic
          </label>
          <label className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-white/10 px-3 py-2">
            <input type="radio" checked={type === "service"} onChange={() => setType("service")} />
            Serviciu / rezervare
          </label>
        </div>

        <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Nume" className={inputClass} />
        <textarea
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descriere"
          className={inputClass}
          rows={3}
        />
        <input required value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Categorie" className={inputClass} />

        <div className="grid grid-cols-2 gap-3">
          <input
            required
            type="number"
            min={0}
            step="0.01"
            value={priceRetail}
            onChange={(e) => setPriceRetail(e.target.value)}
            placeholder="Preț retail (cu TVA)"
            className={inputClass}
          />
          <input
            required
            type="number"
            min={0}
            step="0.01"
            value={priceB2B}
            onChange={(e) => setPriceB2B(e.target.value)}
            placeholder="Preț B2B (fără TVA)"
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <input
            type="number"
            min={0}
            max={1}
            step="0.01"
            value={vatRate}
            onChange={(e) => setVatRate(e.target.value)}
            placeholder="Cotă TVA (0.19)"
            className={inputClass}
          />
          <input
            type="number"
            min={1}
            value={moq}
            onChange={(e) => setMoq(e.target.value)}
            placeholder="MOQ (B2B)"
            className={inputClass}
          />
        </div>

        <div className="space-y-2">
          <p className="text-xs text-white/50">Preț pe volum (B2B, opțional)</p>
          {tiers.map((tier, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="number"
                min={1}
                value={tier.minQty}
                onChange={(e) => updateTier(i, { minQty: Number(e.target.value) })}
                placeholder="Cantitate minimă"
                className={inputClass}
              />
              <input
                type="number"
                min={0}
                step="0.01"
                value={tier.pricePerUnit}
                onChange={(e) => updateTier(i, { pricePerUnit: Number(e.target.value) })}
                placeholder="Preț/unitate"
                className={inputClass}
              />
              <Button type="button" variant="ghost" onClick={() => removeTier(i)}>
                ×
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addTier} className="text-xs">
            + Adaugă prag de preț
          </Button>
        </div>

        {type === "physical" ? (
          <div className="grid grid-cols-3 gap-3">
            <input
              required
              type="number"
              min={0}
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              placeholder="Stoc (buc)"
              className={inputClass}
            />
            <input
              type="number"
              min={0}
              step="0.01"
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
              placeholder="Greutate (kg)"
              className={inputClass}
            />
            <input
              value={dimensionsCm}
              onChange={(e) => setDimensionsCm(e.target.value)}
              placeholder="Dimensiuni (cm)"
              className={inputClass}
            />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <input
              required
              type="number"
              min={1}
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              placeholder="Locuri disponibile"
              className={inputClass}
            />
            <select
              value={scheduleType}
              onChange={(e) => setScheduleType(e.target.value as "calendar" | "fixed_slots")}
              className={inputClass}
            >
              <option value="calendar">Disponibilitate calendar</option>
              <option value="fixed_slots">Intervale orare fixe</option>
            </select>
          </div>
        )}

        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="text-sm text-white/60" />

        {error && <p className="text-sm text-accent-danger">{error}</p>}
        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? "Se publică…" : "Publică"}
        </Button>
      </form>
    </GlassCard>
  );
}
