import { type NextRequest } from "next/server"
import { getDb } from "@/lib/db"
import { isAtLeastModerator } from "@/lib/adminAuth"

export async function GET() {
  const sql = getDb()
  try {
    const rows = await sql`SELECT * FROM ribbon_messages WHERE is_active = true ORDER BY created_at DESC`
    return Response.json(rows)
  } catch {
    return Response.json([])
  }
}

export async function POST(req: NextRequest) {
  if (!(await isAtLeastModerator())) return Response.json({ error: "Yetkisiz" }, { status: 403 })
  const { message, type } = await req.json()
  if (!message?.trim()) return Response.json({ error: "Mesaj boş olamaz" }, { status: 400 })
  const sql = getDb()
  const rows = await sql`
    INSERT INTO ribbon_messages (message, type) VALUES (${message.trim()}, ${type ?? "normal"}) RETURNING *
  `
  return Response.json(rows[0])
}

export async function DELETE(req: NextRequest) {
  if (!(await isAtLeastModerator())) return Response.json({ error: "Yetkisiz" }, { status: 403 })
  const { id } = await req.json()
  const sql = getDb()
  await sql`DELETE FROM ribbon_messages WHERE id = ${id}`
  return Response.json({ success: true })
}
