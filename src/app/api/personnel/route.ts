import { SEED_OFFICERS } from "@/lib/seed"

export async function GET() {
  if (process.env.DATABASE_URL) {
    try {
      const { getDb } = await import("@/lib/db")
      const sql = getDb()
      const rows = await sql`
        SELECT * FROM officers ORDER BY rank_order ASC
      `
      if (rows.length) return Response.json(rows)
    } catch (e) {
      console.error("DB personnel error:", e)
    }
  }
  return Response.json(SEED_OFFICERS)
}
