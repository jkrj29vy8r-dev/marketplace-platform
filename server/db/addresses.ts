import { sql } from "@vercel/postgres";
import { ensureSchema } from "@/server/db/schema";
import type { Address, AddressKind } from "@/types/domain";

interface AddressRow {
  id: number;
  owner_user_id: number;
  kind: AddressKind;
  label: string;
  line1: string;
  city: string;
  county: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}

function toAddress(row: AddressRow): Address {
  return {
    id: String(row.id),
    ownerUserId: String(row.owner_user_id),
    kind: row.kind,
    label: row.label,
    line1: row.line1,
    city: row.city,
    county: row.county,
    postalCode: row.postal_code,
    country: row.country,
    isDefault: row.is_default,
  };
}

export async function createAddress(input: {
  ownerUserId: string;
  kind: AddressKind;
  label: string;
  line1: string;
  city: string;
  county: string;
  postalCode: string;
  country?: string;
}): Promise<Address> {
  await ensureSchema();
  const { rows } = await sql<AddressRow>`
    INSERT INTO addresses (owner_user_id, kind, label, line1, city, county, postal_code, country)
    VALUES (${input.ownerUserId}, ${input.kind}, ${input.label}, ${input.line1}, ${input.city}, ${input.county}, ${input.postalCode}, ${input.country ?? "RO"})
    RETURNING *;
  `;
  const row = rows[0];
  if (!row) throw new Error("Insert returned no row");
  return toAddress(row);
}

export async function listAddressesForUser(ownerUserId: string): Promise<Address[]> {
  await ensureSchema();
  const { rows } = await sql<AddressRow>`SELECT * FROM addresses WHERE owner_user_id = ${ownerUserId} ORDER BY id DESC;`;
  return rows.map(toAddress);
}
