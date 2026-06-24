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

  // --- B2B / B2C hybrid model -------------------------------------------

  await sql`
    CREATE TABLE IF NOT EXISTS companies (
      id SERIAL PRIMARY KEY,
      owner_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      legal_name TEXT NOT NULL,
      cui TEXT NOT NULL,
      reg_com TEXT NOT NULL,
      registered_address TEXT NOT NULL,
      vat_payer BOOLEAN NOT NULL DEFAULT false,
      approved BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS addresses (
      id SERIAL PRIMARY KEY,
      owner_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      kind TEXT NOT NULL,
      label TEXT NOT NULL,
      line1 TEXT NOT NULL,
      city TEXT NOT NULL,
      county TEXT NOT NULL,
      postal_code TEXT NOT NULL,
      country TEXT NOT NULL DEFAULT 'RO',
      is_default BOOLEAN NOT NULL DEFAULT false
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS sub_accounts (
      id SERIAL PRIMARY KEY,
      company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      monthly_budget NUMERIC NOT NULL DEFAULT 0,
      requires_approval_above NUMERIC NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `;

  // --- Catalog: physical products + bookable services --------------------

  await sql`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      vendor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type TEXT NOT NULL DEFAULT 'physical',
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      image_url TEXT,
      category TEXT NOT NULL,
      price_retail NUMERIC NOT NULL DEFAULT 0,
      price_b2b NUMERIC NOT NULL DEFAULT 0,
      vat_rate NUMERIC NOT NULL DEFAULT 0.19,
      moq INTEGER NOT NULL DEFAULT 1,
      stock INTEGER,
      weight_kg NUMERIC,
      dimensions_cm TEXT,
      capacity INTEGER,
      schedule_type TEXT,
      active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS price_tiers (
      id SERIAL PRIMARY KEY,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      min_qty INTEGER NOT NULL,
      price_per_unit NUMERIC NOT NULL
    );
  `;

  // --- RFQ: B2B-only negotiated pricing -----------------------------------

  await sql`
    CREATE TABLE IF NOT EXISTS rfq_requests (
      id SERIAL PRIMARY KEY,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      buyer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      vendor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      quantity INTEGER NOT NULL,
      message TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'pending',
      counter_price_per_unit NUMERIC,
      counter_terms TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `;

  // --- Orders, payments, invoicing ---------------------------------------

  await sql`
    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      buyer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      vendor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      items JSONB NOT NULL,
      subtotal NUMERIC NOT NULL,
      vat_amount NUMERIC NOT NULL,
      total NUMERIC NOT NULL,
      commission_rate NUMERIC NOT NULL,
      commission_amount NUMERIC NOT NULL,
      net_amount_to_vendor NUMERIC NOT NULL,
      payment_method TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending_payment',
      transfer_proof_url TEXT,
      shipping_address_id INTEGER REFERENCES addresses(id),
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS invoices (
      id SERIAL PRIMARY KEY,
      order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      series TEXT NOT NULL DEFAULT 'NX',
      number SERIAL,
      buyer_tax_id TEXT NOT NULL,
      buyer_name TEXT NOT NULL,
      total NUMERIC NOT NULL,
      vat_amount NUMERIC NOT NULL,
      issued_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS payouts (
      id SERIAL PRIMARY KEY,
      vendor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      amount NUMERIC NOT NULL,
      status TEXT NOT NULL DEFAULT 'requested',
      requested_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `;
}
