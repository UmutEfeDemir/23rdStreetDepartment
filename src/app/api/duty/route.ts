import { auth } from "@/auth"
import { getDb } from "@/lib/db"

async function syncDiscordPanel(sql: ReturnType<typeof getDb>, type: "gir" | "cik", discordId: string, name: string) {
  const token = process.env.DISCORD_BOT_TOKEN
  if (!token) return
  try {
    const cfg = await sql`SELECT key, value FROM bot_config WHERE key IN ('panel_channel_id','panel_message_id','check_channel_id')`
    const c = Object.fromEntries((cfg as { key: string; value: string }[]).map(r => [r.key, r.value]))

    // Bildirim kanalına mesaj
    if (c.check_channel_id) {
      await fetch(`https://discord.com/api/v10/channels/${c.check_channel_id}/messages`, {
        method: "POST",
        headers: { Authorization: `Bot ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          embeds: [{
            color: type === "gir" ? 0x2ecc71 : 0xe74c3c,
            description: `${type === "gir" ? "✅" : "🔴"} <@${discordId}> **${type === "gir" ? "mesaiye girdi" : "mesaiden çıktı"}** *(web sitesi)*`,
            timestamp: new Date().toISOString(),
          }],
        }),
      }).catch(() => {})
    }

    // Panel mesajını güncelle
    if (c.panel_channel_id && c.panel_message_id) {
      const active = await sql`
        SELECT o.discord_id, d.clock_in FROM duty_logs d
        JOIN officers_db o ON o.id = d.officer_id
        WHERE d.clock_out IS NULL AND o.discord_id IS NOT NULL
      `
      const rows = active as { discord_id: string; clock_in: string }[]
      const desc = rows.length
        ? rows.map(r => `• <@${r.discord_id}> — <t:${Math.floor(new Date(r.clock_in).getTime() / 1000)}:R> başladı`).join("\n")
        : "Şu an aktif mesai yok."

      await fetch(`https://discord.com/api/v10/channels/${c.panel_channel_id}/messages/${c.panel_message_id}`, {
        method: "PATCH",
        headers: { Authorization: `Bot ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          embeds: [{
            color: 0x3498db,
            title: "23rd Mesai Paneli",
            description: desc,
            fields: [{ name: "Aktif mesai", value: `${rows.length}`, inline: true }],
            footer: { text: "Son güncelleme" },
            timestamp: new Date().toISOString(),
          }],
        }),
      }).catch(() => {})
    }
  } catch { /* Discord sync hatası kritik değil */ }
}

async function getDiscordIdAndAccess(): Promise<{ discordId: string; accessStatus: string | null } | null> {
  const session = await auth()
  if (!session?.user) return null

  const discordId = (session.user as { discordId?: string }).discordId
  if (!discordId) return null

  const sql = getDb()
  let accessStatus: string | null = null
  try {
    const accessReq = await sql`SELECT status FROM access_requests WHERE discord_id = ${discordId} LIMIT 1`
    accessStatus = (accessReq[0] as { status?: string } | undefined)?.status ?? null
  } catch {
    // table may not exist yet
  }

  return { discordId, accessStatus }
}

export async function GET() {
  const session = await auth()
  if (!session?.user) return Response.json({ error: "Giriş gerekli" }, { status: 401 })

  const discordId = (session.user as { discordId?: string }).discordId
  if (!discordId) return Response.json({ error: "Discord ID bulunamadı" }, { status: 400 })

  const sql = getDb()

  let accessStatus: string | null = null
  let userPermissions: Record<string, boolean> = { duty: true, stats: true, logs: true, badges: true }
  try {
    const accessReq = await sql`SELECT status, user_permissions FROM access_requests WHERE discord_id = ${discordId} LIMIT 1`
    const ar = accessReq[0] as { status?: string; user_permissions?: Record<string, boolean> } | undefined
    accessStatus = ar?.status ?? null
    if (ar?.user_permissions) userPermissions = { ...userPermissions, ...ar.user_permissions }
  } catch {
    // table may not exist yet
  }

  // Block access if not approved
  if (accessStatus !== "approved") {
    return Response.json({ officer: null, activeDuty: null, logs: [], licenses: [], accessStatus, userPermissions })
  }

  const officers = await sql`SELECT * FROM officers_db WHERE discord_id = ${discordId} LIMIT 1`
  if (!officers.length) return Response.json({ officer: null, activeDuty: null, logs: [], licenses: [], accessStatus, userPermissions })

  const officer = officers[0]
  sql`UPDATE officers_db SET last_seen = NOW() WHERE id = ${officer.id}`.catch(() => {})
  const activeDuty = await sql`
    SELECT * FROM duty_logs WHERE officer_id = ${officer.id} AND clock_out IS NULL ORDER BY clock_in DESC LIMIT 1
  `
  const logs = await sql`
    SELECT * FROM duty_logs WHERE officer_id = ${officer.id} AND clock_out IS NOT NULL
    ORDER BY clock_in DESC
  `
  const licenses = await sql`
    SELECT ol.license_type,
      COALESCE(bt.category, 'license') AS category,
      COALESCE(bt.color_from, '#b8972a') AS color_from,
      bt.color_to
    FROM officer_licenses ol
    LEFT JOIN badge_types bt ON bt.name = ol.license_type
    WHERE ol.officer_id = ${officer.id}
    ORDER BY COALESCE(bt.category, 'license'), ol.granted_at ASC
  `
  return Response.json({ officer, activeDuty: activeDuty[0] ?? null, logs, licenses, accessStatus, userPermissions })
}

export async function POST() {
  const auth_data = await getDiscordIdAndAccess()
  if (!auth_data) return Response.json({ error: "Giriş gerekli" }, { status: 401 })
  const { discordId, accessStatus } = auth_data

  if (accessStatus !== "approved") return Response.json({ error: "Erişim izniniz yok" }, { status: 403 })

  const sql = getDb()
  const officers = await sql`SELECT * FROM officers_db WHERE discord_id = ${discordId} LIMIT 1`
  if (!officers.length) return Response.json({ error: "Kayıtlı memur değil" }, { status: 403 })

  const officer = officers[0]
  const existing = await sql`SELECT * FROM duty_logs WHERE officer_id = ${officer.id} AND clock_out IS NULL LIMIT 1`
  if (existing.length) return Response.json({ error: "Zaten mesaidessiniz" }, { status: 400 })

  const log = await sql`
    INSERT INTO duty_logs (officer_id, clock_in) VALUES (${officer.id}, now()) RETURNING *
  `
  await sql`UPDATE officers_db SET status = 'Görevde' WHERE id = ${officer.id}`
  syncDiscordPanel(sql, "gir", discordId, String((officer as { name?: string }).name ?? "")).catch(() => {})
  return Response.json({ log: log[0] })
}

export async function PATCH() {
  const auth_data = await getDiscordIdAndAccess()
  if (!auth_data) return Response.json({ error: "Giriş gerekli" }, { status: 401 })
  const { discordId, accessStatus } = auth_data

  if (accessStatus !== "approved") return Response.json({ error: "Erişim izniniz yok" }, { status: 403 })

  const sql = getDb()
  const officers = await sql`SELECT * FROM officers_db WHERE discord_id = ${discordId} LIMIT 1`
  if (!officers.length) return Response.json({ error: "Kayıtlı memur değil" }, { status: 403 })

  const officer = officers[0]
  const active = await sql`SELECT * FROM duty_logs WHERE officer_id = ${officer.id} AND clock_out IS NULL ORDER BY clock_in DESC LIMIT 1`
  if (!active.length) return Response.json({ error: "Aktif mesai yok" }, { status: 400 })

  const log = active[0]
  const durationSeconds = Math.floor((Date.now() - new Date(log.clock_in).getTime()) / 1000)

  await sql`
    UPDATE duty_logs SET clock_out = now(), duration_minutes = ${durationSeconds} WHERE id = ${log.id}
  `
  const newTotalSeconds = officer.duty_hours + durationSeconds
  await sql`UPDATE officers_db SET status = 'Aktif', duty_hours = ${newTotalSeconds} WHERE id = ${officer.id}`
  syncDiscordPanel(sql, "cik", discordId, "").catch(() => {})
  return Response.json({ durationSeconds })
}
