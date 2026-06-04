import { neon } from "@neondatabase/serverless"
import { readFileSync } from "fs"

const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8")
const match = env.match(/DATABASE_URL=(.+)/)
const DATABASE_URL = match[1].trim()
const sql = neon(DATABASE_URL)

// Key-value store for bot panel config (panel channel/message IDs etc.)
await sql`
  CREATE TABLE IF NOT EXISTS bot_config (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
  )
`
console.log("✓ bot_config tablosu oluşturuldu")
