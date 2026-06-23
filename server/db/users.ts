import { sql } from "@vercel/postgres";
import bcrypt from "bcryptjs";
import { ensureSchema } from "@/server/db/schema";
import type { UserRole } from "@/types/domain";

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  blocked: boolean;
  createdAt: string;
}

interface UserRow {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  blocked: boolean;
  created_at: string;
}

function toUserRecord(row: UserRow): UserRecord {
  return {
    id: String(row.id),
    name: row.name,
    email: row.email,
    role: row.role,
    blocked: row.blocked,
    createdAt: row.created_at,
  };
}

export async function createUser(input: {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}): Promise<UserRecord> {
  await ensureSchema();
  const passwordHash = await bcrypt.hash(input.password, 10);
  const { rows } = await sql<UserRow>`
    INSERT INTO users (name, email, password_hash, role)
    VALUES (${input.name}, ${input.email.toLowerCase()}, ${passwordHash}, ${input.role})
    RETURNING *;
  `;
  const row = rows[0];
  if (!row) throw new Error("Insert returned no row");
  return toUserRecord(row);
}

// Returns the full row (including password hash) only for login
// verification — never expose this outside the auth layer.
export async function findUserByEmailWithPassword(email: string) {
  await ensureSchema();
  const { rows } = await sql<UserRow>`
    SELECT * FROM users WHERE email = ${email.toLowerCase()} LIMIT 1;
  `;
  return rows[0] ?? null;
}

export async function getUserById(id: string): Promise<UserRecord | null> {
  await ensureSchema();
  const { rows } = await sql<UserRow>`
    SELECT * FROM users WHERE id = ${id} LIMIT 1;
  `;
  const row = rows[0];
  return row ? toUserRecord(row) : null;
}

export async function listUsers(): Promise<UserRecord[]> {
  await ensureSchema();
  const { rows } = await sql<UserRow>`
    SELECT * FROM users ORDER BY created_at DESC;
  `;
  return rows.map(toUserRecord);
}

export async function setUserBlocked(id: string, blocked: boolean): Promise<void> {
  await sql`UPDATE users SET blocked = ${blocked} WHERE id = ${id};`;
}

export async function deleteUser(id: string): Promise<void> {
  await sql`DELETE FROM users WHERE id = ${id};`;
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
