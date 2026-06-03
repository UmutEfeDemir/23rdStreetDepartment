import { neon } from "@neondatabase/serverless"
import { readFileSync } from "fs"

const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8")
const match = env.match(/DATABASE_URL=(.+)/)
const DATABASE_URL = match[1].trim()
const sql = neon(DATABASE_URL)

// Gradient support for custom admin roles
await sql`ALTER TABLE admin_roles ADD COLUMN IF NOT EXISTS color_to TEXT DEFAULT NULL`
console.log("✓ admin_roles.color_to eklendi")
