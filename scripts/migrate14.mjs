import { neon } from "@neondatabase/serverless"
import { readFileSync } from "fs"

const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8")
const match = env.match(/DATABASE_URL=(.+)/)
const DATABASE_URL = match[1].trim()
const sql = neon(DATABASE_URL)

// Link a Discord account to each admin sub-account for 2FA-style verification
await sql`ALTER TABLE admin_accounts ADD COLUMN IF NOT EXISTS discord_id TEXT DEFAULT NULL`
console.log("✓ admin_accounts.discord_id eklendi")
