import { neon } from "@neondatabase/serverless"
import { readFileSync } from "fs"

const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8")
const match = env.match(/DATABASE_URL=(.+)/)
const DATABASE_URL = match[1].trim()
const sql = neon(DATABASE_URL)

await sql`
  CREATE TABLE IF NOT EXISTS site_rules (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now()
  )
`

const existing = await sql`SELECT id FROM site_rules LIMIT 1`
if (existing.length === 0) {
  await sql`
    INSERT INTO site_rules (content) VALUES (
      ${'• Tüm oyun içi talimatlara uyulması zorunludur.\n• Saygısızlık ve kuraldışı davranış tolere edilmez.\n• Üniforma ve ekipman yönetmeliğine uyulacaktır.\n• Gizlilik anlaşması imzalanacaktır.\n• Deneme sürecinde görev başarısı değerlendirilir.'}
    )
  `
}

console.log("✓ site_rules table created and seeded")
console.log("Migration complete.")
