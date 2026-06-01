import { cookies } from "next/headers"
import { type NextRequest } from "next/server"
import { getDb } from "@/lib/db"

async function isAdmin() {
  const cookieStore = await cookies()
  return cookieStore.get("admin_session")?.value === "1"
}

export async function GET() {
  const sql = getDb()
  try {
    const rows = await sql`SELECT * FROM announcements WHERE is_active = true ORDER BY created_at DESC`
    return Response.json(rows)
  } catch {
    return Response.json([])
  }
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return Response.json({ error: "Yetkisiz" }, { status: 401 })
  const { message, type } = await req.json()
  if (!message?.trim()) return Response.json({ error: "Mesaj boş olamaz" }, { status: 400 })
  const sql = getDb()
  const rows = await sql`
    INSERT INTO announcements (message, type) VALUES (${message.trim()}, ${type ?? "normal"}) RETURNING *
  `
  return Response.json(rows[0])
}

export async function DELETE(req: NextRequest) {
  if (!(await isAdmin())) return Response.json({ error: "Yetkisiz" }, { status: 401 })
  const { id } = await req.json()
  const sql = getDb()
  await sql`DELETE FROM announcements WHERE id = ${id}`
  return Response.json({ success: true })
}
