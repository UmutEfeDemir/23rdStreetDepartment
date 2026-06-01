import { SEED_STATS, SEED_OFFICERS } from "@/lib/seed"
import { getDiscordRoleMemberCount } from "@/lib/discord"

export const revalidate = 300

export async function GET() {
  let base = { ...SEED_STATS, activeTroopers: SEED_OFFICERS.filter(o => o.status === "Görevde" || o.status === "Aktif").length, totalPersonnel: SEED_OFFICERS.length }

  if (process.env.DATABASE_URL) {
    try {
      const { getDb } = await import("@/lib/db")
      const sql = getDb()
      const rows = await sql`SELECT * FROM site_stats LIMIT 1`
      if (rows.length) base = { ...base, ...rows[0] }
    } catch (e) {
      console.error("DB stats error:", e)
    }
  }

  const discordCount = await getDiscordRoleMemberCount()
  return Response.json({
    ...base,
    activeTroopers: discordCount ?? base.activeTroopers,
  })
}
