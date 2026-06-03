import { isFounder } from "@/lib/adminAuth"
import { getDb } from "@/lib/db"

export async function POST() {
  try {
    if (!(await isFounder())) return Response.json({ error: "Yetkisiz" }, { status: 403 })

    const token = process.env.DISCORD_BOT_TOKEN
    if (!token) return Response.json({ error: "DISCORD_BOT_TOKEN eksik" }, { status: 500 })

    const sql = getDb()
    const officers = await sql`
      SELECT id, discord_id FROM officers_db
      WHERE discord_id IS NOT NULL AND discord_id != ''
    `

    let updated = 0
    let failed = 0

    for (const row of officers) {
      const o = row as { id: string; discord_id: string }
      try {
        const res = await fetch(`https://discord.com/api/v10/users/${o.discord_id}`, {
          headers: { Authorization: `Bot ${token}` },
          cache: "no-store",
        })

        if (!res.ok) {
          console.warn(`Discord API ${res.status} for user ${o.discord_id}`)
          failed++
          continue
        }

        const data = await res.json() as { id: string; avatar: string | null }
        if (data.avatar) {
          const avatarUrl = `https://cdn.discordapp.com/avatars/${data.id}/${data.avatar}.png?size=256`
          await sql`UPDATE officers_db SET discord_avatar = ${avatarUrl} WHERE id = ${o.id}`
          updated++
        } else {
          failed++
        }
      } catch (err) {
        console.error(`Avatar fetch failed for ${o.discord_id}:`, err)
        failed++
      }
    }

    return Response.json({ updated, failed, total: officers.length })
  } catch (err) {
    console.error("sync-avatars fatal:", err)
    return Response.json({ error: "Sunucu hatası", detail: String(err) }, { status: 500 })
  }
}
