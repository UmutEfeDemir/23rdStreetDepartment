import { auth } from "@/auth"
import { getDb } from "@/lib/db"

export async function GET() {
  const session = await auth()
  if (!session?.user) return Response.json({ error: "Giriş gerekli" }, { status: 401 })

  const discordId = (session.user as { discordId?: string }).discordId
  if (!discordId) return Response.json({ error: "Discord ID bulunamadı" }, { status: 400 })

  const sql = getDb()

  const accessReq = await sql`SELECT status FROM access_requests WHERE discord_id = ${discordId} LIMIT 1`
  const accessStatus: string | null = (accessReq[0] as { status?: string } | undefined)?.status ?? null

  const officers = await sql`SELECT * FROM officers_db WHERE discord_id = ${discordId} LIMIT 1`
  if (!officers.length) return Response.json({ officer: null, activeDuty: null, logs: [], accessStatus })

  const officer = officers[0]
  const activeDuty = await sql`
    SELECT * FROM duty_logs WHERE officer_id = ${officer.id} AND clock_out IS NULL ORDER BY clock_in DESC LIMIT 1
  `
  const logs = await sql`
    SELECT * FROM duty_logs WHERE officer_id = ${officer.id} AND clock_out IS NOT NULL
    ORDER BY clock_in DESC LIMIT 10
  `
  const licenses = await sql`SELECT license_type FROM officer_licenses WHERE officer_id = ${officer.id} ORDER BY granted_at ASC`
  return Response.json({ officer, activeDuty: activeDuty[0] ?? null, logs, licenses: licenses.map((l) => (l as { license_type: string }).license_type) })
}

export async function POST() {
  const session = await auth()
  if (!session?.user) return Response.json({ error: "Giriş gerekli" }, { status: 401 })

  const discordId = (session.user as { discordId?: string }).discordId
  if (!discordId) return Response.json({ error: "Discord ID bulunamadı" }, { status: 400 })

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
  const session = await auth()
  if (!session?.user) return Response.json({ error: "Giriş gerekli" }, { status: 401 })

  const discordId = (session.user as { discordId?: string }).discordId
  if (!discordId) return Response.json({ error: "Discord ID bulunamadı" }, { status: 400 })

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
