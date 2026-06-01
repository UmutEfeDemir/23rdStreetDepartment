import { cookies } from "next/headers"
import { type NextRequest } from "next/server"
import { getDb } from "@/lib/db"

async function isAdmin() {
  const cookieStore = await cookies()
  return cookieStore.get("admin_session")?.value === "1"
}

export async function GET() {
  const sql = getDb()
  const rows = await sql`SELECT * FROM badge_types ORDER BY category, name ASC`
  return Response.json(rows)
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return Response.json({ error: "Yetkisiz" }, { status: 401 })
  const { name, category, color_from, color_to } = await req.json()
  if (!name?.trim() || !category) return Response.json({ error: "Eksik alan" }, { status: 400 })
  const sql = getDb()
  const rows = await sql`
    INSERT INTO badge_types (name, category, color_from, color_to)
    VALUES (${name.trim()}, ${category}, ${color_from || "#b8972a"}, ${color_to || null})
    RETURNING *
  `
  return Response.json(rows[0])
}

export async function DELETE(req: NextRequest) {
  if (!(await isAdmin())) return Response.json({ error: "Yetkisiz" }, { status: 401 })
  const { id } = await req.json()
  const sql = getDb()
  await sql`DELETE FROM badge_types WHERE id = ${id}`
  return Response.json({ success: true })
}
