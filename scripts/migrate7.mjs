import { neon } from "@neondatabase/serverless"
import { readFileSync } from "fs"

const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8")
const match = env.match(/DATABASE_URL=(.+)/)
const DATABASE_URL = match[1].trim()
const sql = neon(DATABASE_URL)

await sql`ALTER TABLE applications ADD COLUMN IF NOT EXISTS discord_id TEXT DEFAULT ''`
await sql`ALTER TABLE applications ADD COLUMN IF NOT EXISTS rejection_reason TEXT`
await sql`ALTER TABLE applications ADD COLUMN IF NOT EXISTS rejected_by TEXT`
await sql`ALTER TABLE officers_db ADD COLUMN IF NOT EXISTS discord_avatar TEXT`

console.log("✓ applications: discord_id, rejection_reason, rejected_by added")
console.log("✓ officers_db: discord_avatar added")
console.log("Migration complete.")
