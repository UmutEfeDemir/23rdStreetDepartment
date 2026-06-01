import { auth } from "@/auth"
import { cookies } from "next/headers"
import { type NextRequest } from "next/server"
import { getDb } from "@/lib/db"

async function isAdmin() {
  const cookieStore = await cookies()
  return cookieStore.get("admin_session")?.value === "1"
}

export async function POST() {
  const session = await auth()
  if (!session?.user) return Response.json({ error: "Giriş gerekli" }, { status: 401 })

  const discordId = (session.user as { discordId?: string }).discordId
  if (!discordId) return Response.json({ error: "Discord ID bulunamadı" }, { status: 400 })

  const sql = getDb()

  const existing = await sql`SELECT id FROM access_requests WHERE discord_id = ${discordId} LIMIT 1`
  if (existing.length) return Response.json({ error: "Zaten talep gönderildi" }, { status: 400 })

  await sql`
    INSERT INTO access_requests (discord_id, discord_name, discord_avatar)
    VALUES (${discordId}, ${session.user.name ?? ""}, ${session.user.image ?? ""})
  `
  return Response.json({ success: true })
}

export async function GET() {
  if (!(await isAdmin())) return Response.json({ error: "Yetkisiz" }, { status: 401 })
  const sql = getDb()
  const rows = await sql`SELECT * FROM access_requests ORDER BY created_at DESC`
  return Response.json(rows)
}

export async function PATCH(req: NextRequest) {
  if (!(await isAdmin())) return Response.json({ error: "Yetkisiz" }, { status: 401 })
  const { id, status } = await req.json()
  if (!id || !status) return Response.json({ error: "Eksik alan" }, { status: 400 })
  const sql = getDb()
  await sql`UPDATE access_requests SET status = ${status} WHERE id = ${id}`
  return Response.json({ success: true })
}

export async function DELETE(req: NextRequest) {
  if (!(await isAdmin())) return Response.json({ error: "Yetkisiz" }, { status: 401 })
  const { id } = await req.json()
  const sql = getDb()
  const rows = await sql`SELECT discord_id FROM access_requests WHERE id = ${id} LIMIT 1`
  if (rows.length > 0) {
    const discordId = (rows[0] as { discord_id: string }).discord_id
    await sql`UPDATE officers_db SET discord_id = NULL WHERE discord_id = ${discordId}`
  }
  await sql`DELETE FROM access_requests WHERE id = ${id}`
  return Response.json({ success: true })
}
