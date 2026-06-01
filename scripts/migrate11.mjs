import { neon } from "@neondatabase/serverless"
import { readFileSync } from "fs"

const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8")
const match = env.match(/DATABASE_URL=(.+)/)
const DATABASE_URL = match[1].trim()
const sql = neon(DATABASE_URL)

// Granular permissions for admin sub-accounts
await sql`ALTER TABLE admin_accounts ADD COLUMN IF NOT EXISTS permissions JSONB NOT NULL DEFAULT '{}'`
console.log("✓ admin_accounts.permissions eklendi")

// Admin notes on access requests (per-user notes from admin)
await sql`ALTER TABLE access_requests ADD COLUMN IF NOT EXISTS admin_notes TEXT DEFAULT NULL`
console.log("✓ access_requests.admin_notes eklendi")
