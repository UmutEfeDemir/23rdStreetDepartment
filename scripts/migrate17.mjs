import { neon } from "@neondatabase/serverless"
import { readFileSync } from "fs"

const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8")
const match = env.match(/DATABASE_URL=(.+)/)
const DATABASE_URL = match[1].trim()
const sql = neon(DATABASE_URL)

// "completed" status için CHECK constraint güncelle
await sql`ALTER TABLE applications DROP CONSTRAINT IF EXISTS applications_status_check`
await sql`
  ALTER TABLE applications
  ADD CONSTRAINT applications_status_check
  CHECK (status IN ('pending', 'interview', 'accepted', 'rejected', 'completed'))
`
console.log("✓ applications.status CHECK constraint güncellendi (completed eklendi)")
