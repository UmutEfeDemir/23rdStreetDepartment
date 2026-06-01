import { neon } from "@neondatabase/serverless"
import { readFileSync } from "fs"

const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8")
const match = env.match(/DATABASE_URL=(.+)/)
const DATABASE_URL = match?.[1]?.trim()
if (!DATABASE_URL) { console.error("DATABASE_URL not found"); process.exit(1) }

const sql = neon(DATABASE_URL)

await sql`
  CREATE TABLE IF NOT EXISTS officers_db (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    discord_id TEXT UNIQUE,
    badge_no TEXT NOT NULL,
    name TEXT NOT NULL,
    rank TEXT NOT NULL,
    unit TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Aktif',
    seniority_months INTEGER DEFAULT 0,
    rank_progress INTEGER DEFAULT 0,
    next_rank TEXT,
    is_command BOOLEAN DEFAULT false,
    duty_hours INTEGER DEFAULT 0,
    patrols INTEGER DEFAULT 0,
    commendations INTEGER DEFAULT 0,
    warnings INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
  )
`
console.log("✓ officers_db table ready")

await sql`
  CREATE TABLE IF NOT EXISTS duty_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    officer_id UUID REFERENCES officers_db(id) ON DELETE CASCADE,
    clock_in TIMESTAMPTZ NOT NULL DEFAULT now(),
    clock_out TIMESTAMPTZ,
    duration_minutes INTEGER,
    created_at TIMESTAMPTZ DEFAULT now()
  )
`
console.log("✓ duty_logs table ready")
console.log("Migration complete.")
