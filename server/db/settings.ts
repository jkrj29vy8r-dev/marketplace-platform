import { sql } from "@vercel/postgres";
import { ensureSchema } from "@/server/db/schema";

export async function getCommissionOverride(): Promise<number | null> {
  await ensureSchema();
  const { rows } = await sql<{ commission_override: string | null }>`
    SELECT commission_override FROM platform_settings WHERE id = 1;
  `;
  const value = rows[0]?.commission_override;
  return value === null || value === undefined ? null : Number(value);
}

export async function setCommissionOverride(rate: number | null): Promise<void> {
  await ensureSchema();
  await sql`
    UPDATE platform_settings SET commission_override = ${rate} WHERE id = 1;
  `;
}
