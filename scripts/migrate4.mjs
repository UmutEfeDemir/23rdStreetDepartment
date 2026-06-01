import { neon } from "@neondatabase/serverless"
import { readFileSync } from "fs"

const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8")
const match = env.match(/DATABASE_URL=(.+)/)
const DATABASE_URL = match[1].trim()
const sql = neon(DATABASE_URL)

await sql`
  CREATE TABLE IF NOT EXISTS officer_licenses (
    id SERIAL PRIMARY KEY,
    officer_id INTEGER NOT NULL,
    license_type TEXT NOT NULL,
    granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(officer_id, license_type)
  )
`
console.log("officer_licenses table created.")
