import { auth } from "@/auth"
import { getDb } from "@/lib/db"

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
  try {
    const accessReq = await sql`SELECT status FROM access_requests WHERE discord_id = ${discordId} LIMIT 1`
    accessStatus = (accessReq[0] as { status?: string } | undefined)?.status ?? null
  } catch {
    // table may not exist yet
  }

  // Block access if not approved
  if (accessStatus !== "approved") {
    return Response.json({ officer: null, activeDuty: null, logs: [], licenses: [], accessStatus })
  }

  const officers = await sql`SELECT * FROM officers_db WHERE discord_id = ${discordId} LIMIT 1`
  if (!officers.length) return Response.json({ officer: null, activeDuty: null, logs: [], licenses: [], accessStatus })

  const officer = officers[0]
  const activeDuty = await sql`
    SELECT * FROM duty_logs WHERE officer_id = ${officer.id} AND clock_out IS NULL ORDER BY clock_in DESC LIMIT 1
  `
  const logs = await sql`
    SELECT * FROM duty_logs WHERE officer_id = ${officer.id} AND clock_out IS NOT NULL
    ORDER BY clock_in DESC LIMIT 10
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
  return Response.json({ officer, activeDuty: activeDuty[0] ?? null, logs, licenses, accessStatus })
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

  return Response.json({ durationSeconds })
}
