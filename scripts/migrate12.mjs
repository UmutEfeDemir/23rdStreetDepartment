import { neon } from "@neondatabase/serverless"
import { readFileSync } from "fs"

const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8")
const match = env.match(/DATABASE_URL=(.+)/)
const DATABASE_URL = match[1].trim()
const sql = neon(DATABASE_URL)

// Per-user panel permissions for approved access requests
await sql`
  ALTER TABLE access_requests
  ADD COLUMN IF NOT EXISTS user_permissions JSONB NOT NULL DEFAULT '{"duty":true,"stats":true,"logs":true,"badges":true}'
`
console.log("✓ access_requests.user_permissions eklendi")

// Gallery images managed from admin panel
await sql`
  CREATE TABLE IF NOT EXISTS gallery_images (
    id SERIAL PRIMARY KEY,
    url TEXT NOT NULL,
    caption TEXT DEFAULT NULL,
    order_num INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )
`
console.log("✓ gallery_images tablosu oluşturuldu")
