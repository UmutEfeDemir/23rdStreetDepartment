import { neon } from "@neondatabase/serverless"
import { readFileSync } from "fs"

const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8")
const match = env.match(/DATABASE_URL=(.+)/)
const DATABASE_URL = match[1].trim()
const sql = neon(DATABASE_URL)

// Track when officers were last active on site
await sql`ALTER TABLE officers_db ADD COLUMN IF NOT EXISTS last_seen TIMESTAMPTZ DEFAULT NULL`
console.log("✓ officers_db.last_seen eklendi")

// Custom admin roles with permission profiles
await sql`
  CREATE TABLE IF NOT EXISTS admin_roles (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    color TEXT NOT NULL DEFAULT '#5865f2',
    permissions JSONB NOT NULL DEFAULT '{}',
    is_builtin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )
`
console.log("✓ admin_roles tablosu oluşturuldu")

await sql`
  INSERT INTO admin_roles (name, color, permissions, is_builtin) VALUES
    ('Moderatör', '#3b82f6', '{"announce":true,"images":true,"forum":true,"accounts":false}', TRUE),
    ('Mülakat', '#22c55e', '{"announce":false,"images":false,"forum":false,"accounts":false}', TRUE)
  ON CONFLICT (name) DO NOTHING
`
console.log("✓ Yerleşik roller eklendi")

// Link admin accounts to a role (overrides role TEXT if set)
await sql`ALTER TABLE admin_accounts ADD COLUMN IF NOT EXISTS role_id INT REFERENCES admin_roles(id) ON DELETE SET NULL`
console.log("✓ admin_accounts.role_id eklendi")
