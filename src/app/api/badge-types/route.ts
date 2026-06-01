import { type NextRequest } from "next/server"
import { getDb } from "@/lib/db"
import { isAtLeastModerator } from "@/lib/adminAuth"

export async function GET() {
  const sql = getDb()
  const rows = await sql`SELECT * FROM badge_types ORDER BY category, name ASC`
  return Response.json(rows)
}

export async function POST(req: NextRequest) {
  if (!(await isAtLeastModerator())) return Response.json({ error: "Yetkisiz" }, { status: 403 })
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
  if (!(await isAtLeastModerator())) return Response.json({ error: "Yetkisiz" }, { status: 403 })
  const { id } = await req.json()
  const sql = getDb()
  await sql`DELETE FROM badge_types WHERE id = ${id}`
  return Response.json({ success: true })
}
