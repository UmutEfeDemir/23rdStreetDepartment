import { cookies } from "next/headers"
import { type NextRequest } from "next/server"
import { getDb } from "@/lib/db"

async function isAdmin() {
  const cookieStore = await cookies()
  return cookieStore.get("admin_session")?.value === "1"
}

export async function GET(req: NextRequest) {
  const officerId = req.nextUrl.searchParams.get("officer_id")
  const sql = getDb()
  if (officerId) {
    const rows = await sql`SELECT * FROM officer_licenses WHERE officer_id = ${officerId} ORDER BY granted_at ASC`
    return Response.json(rows)
  }
  const rows = await sql`SELECT * FROM officer_licenses ORDER BY officer_id, granted_at ASC`
  return Response.json(rows)
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return Response.json({ error: "Yetkisiz" }, { status: 401 })
  const { officer_id, license_type } = await req.json()
  if (!officer_id || !license_type) return Response.json({ error: "Eksik alan" }, { status: 400 })
  const sql = getDb()
  await sql`INSERT INTO officer_licenses (officer_id, license_type) VALUES (${officer_id}, ${license_type}) ON CONFLICT DO NOTHING`
  return Response.json({ success: true })
}

export async function DELETE(req: NextRequest) {
  if (!(await isAdmin())) return Response.json({ error: "Yetkisiz" }, { status: 401 })
  const { officer_id, license_type } = await req.json()
  const sql = getDb()
  await sql`DELETE FROM officer_licenses WHERE officer_id = ${officer_id} AND license_type = ${license_type}`
  return Response.json({ success: true })
}
