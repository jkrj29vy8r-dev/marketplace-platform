import { sql } from "@vercel/postgres";

// Lazily creates the tables on first use so there's no separate migration
// step to run manually after wiring up Vercel Postgres. Safe to call
// repeatedly — every statement is idempotent.
export async function ensureSchema() {
  await sql`
    CREATE TABLE IF NOT EXISTS service_requests (
      id SERIAL PRIMARY KEY,
      client_name TEXT NOT NULL,
      category TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      budget_min INTEGER NOT NULL DEFAULT 0,
      budget_max INTEGER NOT NULL DEFAULT 0,
      image_url TEXT,
      status TEXT NOT NULL DEFAULT 'open',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS service_offers (
      id SERIAL PRIMARY KEY,
      provider_name TEXT NOT NULL,
      category TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      price_from INTEGER NOT NULL DEFAULT 0,
      image_url TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'client',
      blocked BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `;

  // Single-row table holding platform-wide settings an operator can tune
  // from the admin dashboard, e.g. an override for the tiered commission.
  await sql`
    CREATE TABLE IF NOT EXISTS platform_settings (
      id INTEGER PRIMARY KEY DEFAULT 1,
      commission_override NUMERIC,
      CONSTRAINT single_row CHECK (id = 1)
    );
  `;

  await sql`
    INSERT INTO platform_settings (id, commission_override)
    VALUES (1, NULL)
    ON CONFLICT (id) DO NOTHING;
  `;
}
