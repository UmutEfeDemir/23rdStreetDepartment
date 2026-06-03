import { isFounder } from "@/lib/adminAuth"
import { getDb } from "@/lib/db"

export async function POST() {
  if (!(await isFounder())) return Response.json({ error: "Yetkisiz" }, { status: 403 })

  const token = process.env.DISCORD_BOT_TOKEN
  if (!token) return Response.json({ error: "Bot token eksik" }, { status: 500 })

  const sql = getDb()
  const officers = await sql`
    SELECT id, discord_id FROM officers_db
    WHERE discord_id IS NOT NULL AND discord_id != ''
  `

  let updated = 0
  let failed = 0

  for (const o of officers as { id: string; discord_id: string }[]) {
    try {
      const res = await fetch(`https://discord.com/api/v10/users/${o.discord_id}`, {
        headers: { Authorization: `Bot ${token}` },
      })
      if (!res.ok) { failed++; continue }

      const data = await res.json() as { id: string; avatar: string | null }
      const avatarUrl = data.avatar
        ? `https://cdn.discordapp.com/avatars/${data.id}/${data.avatar}.png?size=256`
        : null

      if (avatarUrl) {
        await sql`UPDATE officers_db SET discord_avatar = ${avatarUrl} WHERE id = ${o.id}`
        updated++
      }
    } catch {
      failed++
    }
  }

  return Response.json({ updated, failed, total: officers.length })
}
