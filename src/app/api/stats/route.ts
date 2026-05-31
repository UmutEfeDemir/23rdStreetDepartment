import { SEED_STATS, SEED_OFFICERS } from "@/lib/seed"

export async function GET() {
  if (process.env.DATABASE_URL) {
    try {
      const { getDb } = await import("@/lib/db")
      const sql = getDb()
      const rows = await sql`SELECT * FROM site_stats LIMIT 1`
      if (rows.length) return Response.json(rows[0])
    } catch (e) {
      console.error("DB stats error:", e)
    }
  }

  const active = SEED_OFFICERS.filter(
    (o) => o.status === "Görevde" || o.status === "Aktif"
  ).length

  return Response.json({
    ...SEED_STATS,
    activeTroopers: active,
    totalPersonnel: SEED_OFFICERS.length,
  })
}
