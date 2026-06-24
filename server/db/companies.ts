import { sql } from "@vercel/postgres";
import { ensureSchema } from "@/server/db/schema";
import type { CompanyProfile } from "@/types/domain";

interface CompanyRow {
  id: number;
  owner_user_id: number;
  legal_name: string;
  cui: string;
  reg_com: string;
  registered_address: string;
  vat_payer: boolean;
  approved: boolean;
  created_at: string;
}

function toCompanyProfile(row: CompanyRow): CompanyProfile {
  return {
    id: String(row.id),
    ownerUserId: String(row.owner_user_id),
    legalName: row.legal_name,
    cui: row.cui,
    regCom: row.reg_com,
    registeredAddress: row.registered_address,
    vatPayer: row.vat_payer,
    approved: row.approved,
    createdAt: row.created_at,
  };
}

export async function createCompanyProfile(input: {
  ownerUserId: string;
  legalName: string;
  cui: string;
  regCom: string;
  registeredAddress: string;
  vatPayer: boolean;
}): Promise<CompanyProfile> {
  await ensureSchema();
  const { rows } = await sql<CompanyRow>`
    INSERT INTO companies (owner_user_id, legal_name, cui, reg_com, registered_address, vat_payer)
    VALUES (${input.ownerUserId}, ${input.legalName}, ${input.cui}, ${input.regCom}, ${input.registeredAddress}, ${input.vatPayer})
    RETURNING *;
  `;
  const row = rows[0];
  if (!row) throw new Error("Insert returned no row");
  return toCompanyProfile(row);
}

export async function getCompanyByOwner(ownerUserId: string): Promise<CompanyProfile | null> {
  await ensureSchema();
  const { rows } = await sql<CompanyRow>`
    SELECT * FROM companies WHERE owner_user_id = ${ownerUserId} LIMIT 1;
  `;
  const row = rows[0];
  return row ? toCompanyProfile(row) : null;
}

export async function listCompanies(): Promise<CompanyProfile[]> {
  await ensureSchema();
  const { rows } = await sql<CompanyRow>`SELECT * FROM companies ORDER BY created_at DESC;`;
  return rows.map(toCompanyProfile);
}

export async function setCompanyApproved(id: string, approved: boolean): Promise<void> {
  await sql`UPDATE companies SET approved = ${approved} WHERE id = ${id};`;
}
