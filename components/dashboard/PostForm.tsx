"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";

interface PostFormProps {
  kind: "request" | "offer";
  onPosted?: () => void;
}

// Single text+image posting form shared by the client and provider
// dashboards. Uploads the image first (if any), then submits the
// text fields to the matching endpoint.
export function PostForm({ kind, onPosted }: PostFormProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priceLow, setPriceLow] = useState("");
  const [priceHigh, setPriceHigh] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        if (!uploadRes.ok) throw new Error("Image upload failed");
        imageUrl = (await uploadRes.json()).url;
      }

      const endpoint = kind === "request" ? "/api/requests" : "/api/offers";
      const payload =
        kind === "request"
          ? {
              clientName: name,
              category,
              title,
              description,
              budgetMin: Number(priceLow) || 0,
              budgetMax: Number(priceHigh) || 0,
              imageUrl,
            }
          : {
              providerName: name,
              category,
              title,
              description,
              priceFrom: Number(priceLow) || 0,
              imageUrl,
            };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Could not publish post");

      setName("");
      setCategory("");
      setTitle("");
      setDescription("");
      setPriceLow("");
      setPriceHigh("");
      setFile(null);
      onPosted?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <GlassCard className="p-6">
      <p className="text-xs uppercase text-white/40">
        {kind === "request" ? "Post a new request" : "Post a new offer"}
      </p>
      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="w-full rounded-lg border border-white/10 bg-white/[0.02] px-4 py-2 text-sm outline-none focus:border-accent-cyan/50"
        />
        <input
          required
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Category (e.g. Logistics)"
          className="w-full rounded-lg border border-white/10 bg-white/[0.02] px-4 py-2 text-sm outline-none focus:border-accent-cyan/50"
        />
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="w-full rounded-lg border border-white/10 bg-white/[0.02] px-4 py-2 text-sm outline-none focus:border-accent-cyan/50"
        />
        <textarea
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe what you need or offer…"
          rows={3}
          className="w-full rounded-lg border border-white/10 bg-white/[0.02] px-4 py-2 text-sm outline-none focus:border-accent-cyan/50"
        />
        <div className="flex gap-3">
          <input
            value={priceLow}
            onChange={(e) => setPriceLow(e.target.value)}
            placeholder={kind === "request" ? "Budget min" : "Price from"}
            inputMode="numeric"
            className="w-full rounded-lg border border-white/10 bg-white/[0.02] px-4 py-2 text-sm outline-none focus:border-accent-cyan/50"
          />
          {kind === "request" && (
            <input
              value={priceHigh}
              onChange={(e) => setPriceHigh(e.target.value)}
              placeholder="Budget max"
              inputMode="numeric"
              className="w-full rounded-lg border border-white/10 bg-white/[0.02] px-4 py-2 text-sm outline-none focus:border-accent-cyan/50"
            />
          )}
        </div>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="w-full text-sm text-white/60"
        />
        {error && <p className="text-sm text-accent-danger">{error}</p>}
        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? "Publishing…" : "Publish"}
        </Button>
      </form>
    </GlassCard>
  );
}
