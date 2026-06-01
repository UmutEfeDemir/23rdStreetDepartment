import { cookies } from "next/headers"
import { type NextRequest } from "next/server"
import { getDb } from "@/lib/db"

async function isAdmin() {
  const cookieStore = await cookies()
  return cookieStore.get("admin_session")?.value === "1"
}

export async function GET() {
  const sql = getDb()
  const rows = await sql`SELECT * FROM officers_db ORDER BY is_command DESC, created_at ASC`
  return Response.json(rows)
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return Response.json({ error: "Yetkisiz" }, { status: 401 })
  const body = await req.json()
  const { discord_id, badge_no, name, rank, unit, status, seniority_months, rank_progress, next_rank, is_command } = body
  if (!badge_no || !name || !rank || !unit) {
    return Response.json({ error: "Eksik alan" }, { status: 400 })
  }
  const sql = getDb()
  const rows = await sql`
    INSERT INTO officers_db (discord_id, badge_no, name, rank, unit, status, seniority_months, rank_progress, next_rank, is_command)
    VALUES (${discord_id || null}, ${badge_no}, ${name}, ${rank}, ${unit}, ${status || "Aktif"},
            ${seniority_months || 0}, ${rank_progress || 0}, ${next_rank || null}, ${is_command || false})
    RETURNING *
  `
  return Response.json(rows[0])
}

export async function PATCH(req: NextRequest) {
  if (!(await isAdmin())) return Response.json({ error: "Yetkisiz" }, { status: 401 })
  const { id, discord_id, badge_no, name, rank, unit, status, seniority_months, rank_progress, next_rank, is_command } = await req.json()
  if (!id) return Response.json({ error: "ID gerekli" }, { status: 400 })
  const sql = getDb()
  const rows = await sql`
    UPDATE officers_db SET
      discord_id = ${discord_id || null},
      badge_no = ${badge_no},
      name = ${name},
      rank = ${rank},
      unit = ${unit},
      status = ${status},
      seniority_months = ${seniority_months || 0},
      rank_progress = ${rank_progress || 0},
      next_rank = ${next_rank || null},
      is_command = ${is_command || false}
    WHERE id = ${id}
    RETURNING *
  `
  return Response.json(rows[0])
}

export async function DELETE(req: NextRequest) {
  if (!(await isAdmin())) return Response.json({ error: "Yetkisiz" }, { status: 401 })
  const { id } = await req.json()
  if (!id) return Response.json({ error: "ID gerekli" }, { status: 400 })
  const sql = getDb()
  await sql`DELETE FROM officers_db WHERE id = ${id}`
  return Response.json({ success: true })
}
