/**
 * Neon (serverless Postgres) data access layer.
 *
 * Uses the HTTP-based @neondatabase/serverless driver, which is well suited to
 * Next.js Server Components and Route Handlers (no long-lived connections to manage).
 * The connection string is read lazily from DATABASE_URL so importing this module
 * before the env is loaded (e.g. in scripts) is safe.
 */
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import type { Template, User } from "./types";

let _sql: NeonQueryFunction<false, false> | null = null;

export function sql(): NeonQueryFunction<false, false> {
  if (_sql) return _sql;
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  _sql = neon(url);
  return _sql;
}

/** Create the tables if they don't exist. Idempotent. */
export async function ensureSchema(): Promise<void> {
  const q = sql();
  await q`
    CREATE TABLE IF NOT EXISTS users (
      id          SERIAL PRIMARY KEY,
      full_name   TEXT NOT NULL,
      job_title   TEXT,
      email       TEXT,
      data        JSONB NOT NULL,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    )`;
  await q`
    CREATE TABLE IF NOT EXISTS templates (
      id          SERIAL PRIMARY KEY,
      name        TEXT NOT NULL,
      html        TEXT NOT NULL,
      keys        JSONB NOT NULL,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    )`;
}

/** All users with their full resume data, ordered by id. */
export async function getUsers(): Promise<User[]> {
  const rows = await sql()`
    SELECT id, full_name, job_title, email, data
    FROM users ORDER BY id ASC`;
  return rows as User[];
}

/** The most recently uploaded template, or null if none has been stored yet. */
export async function getActiveTemplate(): Promise<Template | null> {
  const rows = await sql()`
    SELECT id, name, html, keys, created_at
    FROM templates ORDER BY id DESC LIMIT 1`;
  return (rows[0] as Template) ?? null;
}

/** Insert a converted template and return it. */
export async function saveTemplate(name: string, html: string, keys: string[]): Promise<Template> {
  const rows = await sql()`
    INSERT INTO templates (name, html, keys)
    VALUES (${name}, ${html}, ${JSON.stringify(keys)}::jsonb)
    RETURNING id, name, html, keys, created_at`;
  return rows[0] as Template;
}

/** Insert or replace a user by full_name (used by the seed script). */
export async function upsertUser(user: Omit<User, "id">): Promise<void> {
  await sql()`
    INSERT INTO users (full_name, job_title, email, data)
    VALUES (${user.full_name}, ${user.job_title}, ${user.email}, ${JSON.stringify(user.data)}::jsonb)`;
}
