import { type NextRequest } from "next/server"
import { isFounder, canDo } from "@/lib/adminAuth"
import { getDb } from "@/lib/db"
import crypto from "crypto"

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex")
  const hash = crypto.scryptSync(password, salt, 64).toString("hex")
  return `${salt}:${hash}`
}

export async function GET() {
  if (!(await isFounder())) return Response.json({ error: "Yetkisiz" }, { status: 403 })
  const sql = getDb()
  const rows = await sql`
    SELECT id, username, role, created_by, created_at, is_active, permissions
    FROM admin_accounts
    ORDER BY created_at ASC
  `
  return Response.json(rows)
}

export async function POST(req: NextRequest) {
  const founderUser = await isFounder()
  if (!founderUser && !(await canDo("accounts"))) return Response.json({ error: "Yetkisiz" }, { status: 403 })
  const { username, password, role } = await req.json()
  if (!username?.trim() || !password || !["moderator", "interview"].includes(role)) {
    return Response.json({ error: "Geçersiz veri" }, { status: 400 })
  }
  // Non-founders can only create interview-level accounts
  if (!founderUser && role !== "interview") {
    return Response.json({ error: "Yalnızca mülakat seviyesinde hesap oluşturabilirsiniz" }, { status: 403 })
  }
  const sql = getDb()
  try {
    const rows = await sql`
      INSERT INTO admin_accounts (username, password_hash, role)
      VALUES (${username.trim()}, ${hashPassword(password)}, ${role})
      RETURNING id, username, role, created_by, created_at, is_active, permissions
    `
    return Response.json(rows[0])
  } catch (e: unknown) {
    const err = e as { code?: string }
    if (err.code === "23505") return Response.json({ error: "Bu kullanıcı adı zaten mevcut" }, { status: 409 })
    return Response.json({ error: "DB hatası" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  if (!(await isFounder())) return Response.json({ error: "Yetkisiz" }, { status: 403 })
  const { id, is_active, role, password, permissions } = await req.json()
  if (!id) return Response.json({ error: "ID gerekli" }, { status: 400 })
  const sql = getDb()
  if (typeof password === "string" && password.length >= 6) {
    await sql`UPDATE admin_accounts SET password_hash = ${hashPassword(password)} WHERE id = ${id}`
  }
  if (typeof is_active === "boolean") {
    await sql`UPDATE admin_accounts SET is_active = ${is_active} WHERE id = ${id}`
  }
  if (role && ["moderator", "interview"].includes(role)) {
    await sql`UPDATE admin_accounts SET role = ${role} WHERE id = ${id}`
  }
  if (permissions !== undefined) {
    await sql`UPDATE admin_accounts SET permissions = ${JSON.stringify(permissions)}::jsonb WHERE id = ${id}`
  }
  const rows = await sql`
    SELECT id, username, role, created_by, created_at, is_active, permissions
    FROM admin_accounts WHERE id = ${id} LIMIT 1
  `
  return Response.json(rows[0])
}

export async function DELETE(req: NextRequest) {
  if (!(await isFounder())) return Response.json({ error: "Yetkisiz" }, { status: 403 })
  const { id } = await req.json()
  if (!id) return Response.json({ error: "ID gerekli" }, { status: 400 })
  const sql = getDb()
  await sql`DELETE FROM admin_accounts WHERE id = ${id}`
  return Response.json({ success: true })
}
