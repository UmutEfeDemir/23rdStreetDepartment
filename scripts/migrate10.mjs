import { neon } from "@neondatabase/serverless"
import { readFileSync } from "fs"

const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8")
const match = env.match(/DATABASE_URL=(.+)/)
const DATABASE_URL = match[1].trim()
const sql = neon(DATABASE_URL)

// Soft delete on applications
await sql`ALTER TABLE applications ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL`
console.log("✓ applications.deleted_at eklendi")

// Ribbon messages table (separate from announcements)
await sql`
  CREATE TABLE IF NOT EXISTS ribbon_messages (
    id SERIAL PRIMARY KEY,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'normal',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )
`
console.log("✓ ribbon_messages tablosu oluşturuldu")
