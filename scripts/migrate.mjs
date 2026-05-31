import { readFileSync } from "fs"
import { Client } from "pg"
import { fileURLToPath } from "url"
import { dirname, join } from "path"

const __dirname = dirname(fileURLToPath(import.meta.url))
const sql = readFileSync(join(__dirname, "../neon/schema.sql"), "utf8")

const client = new Client({ connectionString: process.env.DATABASE_URL })
await client.connect()
await client.query(sql)
await client.end()
console.log("✓ Schema applied to Neon successfully")
