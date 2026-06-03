import { type NextRequest } from "next/server"
import { isFounder } from "@/lib/adminAuth"
import { getDb } from "@/lib/db"

export async function GET() {
  if (!(await isFounder())) return Response.json({ error: "Yetkisiz" }, { status: 403 })
  const sql = getDb()
  const rows = await sql`SELECT * FROM admin_roles ORDER BY is_builtin DESC, id ASC`
  return Response.json(rows)
}

export async function POST(req: NextRequest) {
  if (!(await isFounder())) return Response.json({ error: "Yetkisiz" }, { status: 403 })
  const { name, color, color_to, permissions } = await req.json()
  if (!name?.trim()) return Response.json({ error: "İsim gerekli" }, { status: 400 })
  const sql = getDb()
  try {
    const rows = await sql`
      INSERT INTO admin_roles (name, color, color_to, permissions)
      VALUES (${name.trim()}, ${color ?? "#5865f2"}, ${color_to ?? null}, ${JSON.stringify(permissions ?? {})}::jsonb)
      RETURNING *
    `
    return Response.json(rows[0])
  } catch (e: unknown) {
    const err = e as { code?: string }
    if (err.code === "23505") return Response.json({ error: "Bu isim zaten mevcut" }, { status: 409 })
    return Response.json({ error: "DB hatası" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  if (!(await isFounder())) return Response.json({ error: "Yetkisiz" }, { status: 403 })
  const { id, name, color, color_to, permissions } = await req.json()
  if (!id) return Response.json({ error: "ID gerekli" }, { status: 400 })
  const sql = getDb()
  if (name) await sql`UPDATE admin_roles SET name = ${name} WHERE id = ${id} AND is_builtin = FALSE`
  if (color) await sql`UPDATE admin_roles SET color = ${color} WHERE id = ${id}`
  if (color_to !== undefined) await sql`UPDATE admin_roles SET color_to = ${color_to ?? null} WHERE id = ${id}`
  if (permissions !== undefined) {
    await sql`UPDATE admin_roles SET permissions = ${JSON.stringify(permissions)}::jsonb WHERE id = ${id}`
  }
  const rows = await sql`SELECT * FROM admin_roles WHERE id = ${id} LIMIT 1`
  return Response.json(rows[0])
}

export async function DELETE(req: NextRequest) {
  if (!(await isFounder())) return Response.json({ error: "Yetkisiz" }, { status: 403 })
  const { id } = await req.json()
  const sql = getDb()
  const check = await sql`SELECT is_builtin FROM admin_roles WHERE id = ${id} LIMIT 1`
  if ((check[0] as { is_builtin: boolean } | undefined)?.is_builtin) {
    return Response.json({ error: "Yerleşik roller silinemez" }, { status: 400 })
  }
  await sql`UPDATE admin_accounts SET role_id = NULL WHERE role_id = ${id}`
  await sql`DELETE FROM admin_roles WHERE id = ${id}`
  return Response.json({ success: true })
}
