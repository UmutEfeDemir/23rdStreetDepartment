import { neon } from "@neondatabase/serverless"
import { readFileSync } from "fs"

const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8")
const match = env.match(/DATABASE_URL=(.+)/)
const DATABASE_URL = match[1].trim()
const sql = neon(DATABASE_URL)

await sql`
  CREATE TABLE IF NOT EXISTS badge_types (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL DEFAULT 'license',
    color_from TEXT NOT NULL DEFAULT '#b8972a',
    color_to TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
  )
`
console.log("✓ badge_types table created")

const defaults = [
  { name: "Detective Unit",  category: "unit",        color_from: "#0f172a", color_to: "#3b82f6" },
  { name: "Swat Unit",       category: "unit",        color_from: "#0f172a", color_to: "#3b82f6" },
  { name: "CCW License",     category: "license",     color_from: "#78350f", color_to: "#f59e0b" },
  { name: "AR License",      category: "license",     color_from: "#78350f", color_to: "#f59e0b" },
  { name: "Air License",     category: "license",     color_from: "#78350f", color_to: "#f59e0b" },
  { name: "HSU License",     category: "license",     color_from: "#78350f", color_to: "#f59e0b" },
  { name: "Marry License",   category: "license",     color_from: "#78350f", color_to: "#f59e0b" },
  { name: "FTS",             category: "role",        color_from: "#14532d", color_to: "#22c55e" },
  { name: "FTO",             category: "role",        color_from: "#14532d", color_to: "#22c55e" },
]

for (const b of defaults) {
  await sql`
    INSERT INTO badge_types (name, category, color_from, color_to)
    VALUES (${b.name}, ${b.category}, ${b.color_from}, ${b.color_to})
    ON CONFLICT (name) DO NOTHING
  `
}
console.log("✓ Default badge types seeded")
console.log("Migration complete.")
