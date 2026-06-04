import { type NextRequest } from "next/server"
import { getDb } from "@/lib/db"

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({})) as Record<string, unknown>
  const { action, discordId, key } = body as { action?: string; discordId?: string; key?: string }

  if (!key || key !== process.env.BOT_SYNC_KEY) {
    return Response.json({ error: "Yetkisiz" }, { status: 403 })
  }

  const sql = getDb()

  // ── Bot panel config kaydet ──────────────────────────────────────────────
  if (action === "config") {
    const { panelChannelId, panelMessageId, checkChannelId } = body as Record<string, string>
    const entries = [
      ["panel_channel_id", panelChannelId],
      ["panel_message_id", panelMessageId],
      ["check_channel_id", checkChannelId],
    ].filter(([, v]) => v != null)

    for (const [k, v] of entries) {
      await sql`INSERT INTO bot_config (key, value) VALUES (${k}, ${v!}) ON CONFLICT (key) DO UPDATE SET value = ${v!}`
    }
    return Response.json({ success: true })
  }

  // ── Mesai başlat / bitir ─────────────────────────────────────────────────
  if (!discordId) return Response.json({ error: "discordId gerekli" }, { status: 400 })

  const officers = await sql`SELECT * FROM officers_db WHERE discord_id = ${discordId} LIMIT 1`
  if (!officers.length) return Response.json({ error: "Memur bulunamadı" }, { status: 404 })
  const officer = officers[0] as { id: string; duty_hours: number }

  if (action === "start") {
    const existing = await sql`SELECT id FROM duty_logs WHERE officer_id = ${officer.id} AND clock_out IS NULL LIMIT 1`
    if (existing.length) return Response.json({ error: "Zaten mesaide" }, { status: 400 })
    await sql`INSERT INTO duty_logs (officer_id, clock_in) VALUES (${officer.id}, NOW())`
    await sql`UPDATE officers_db SET status = 'Görevde', last_seen = NOW() WHERE id = ${officer.id}`
    return Response.json({ success: true })
  }

  if (action === "stop") {
    const active = await sql`
      SELECT * FROM duty_logs WHERE officer_id = ${officer.id} AND clock_out IS NULL
      ORDER BY clock_in DESC LIMIT 1
    `
    if (!active.length) return Response.json({ error: "Aktif mesai yok" }, { status: 400 })
    const log = active[0] as { id: string; clock_in: string }
    const durationSeconds = Math.floor((Date.now() - new Date(log.clock_in).getTime()) / 1000)
    await sql`UPDATE duty_logs SET clock_out = NOW(), duration_minutes = ${durationSeconds} WHERE id = ${log.id}`
    const newTotal = officer.duty_hours + durationSeconds
    await sql`UPDATE officers_db SET status = 'Aktif', duty_hours = ${newTotal} WHERE id = ${officer.id}`
    return Response.json({ success: true })
  }

  return Response.json({ error: "Geçersiz action" }, { status: 400 })
}
