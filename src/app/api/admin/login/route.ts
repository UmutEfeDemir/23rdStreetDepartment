import { cookies } from "next/headers"
import { type NextRequest } from "next/server"
import crypto from "crypto"

function verifyPassword(password: string, stored: string): boolean {
  try {
    const [salt, hash] = stored.split(":")
    const testHash = crypto.scryptSync(password, salt, 64).toString("hex")
    return hash === testHash
  } catch {
    return false
  }
}

export async function POST(req: NextRequest) {
  const { password, username } = await req.json()
  const cookieStore = await cookies()
  const cookieOpts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 8,
    path: "/",
    sameSite: "lax" as const,
  }

  // Master password login (no username = founder)
  if (!username?.trim()) {
    const correct = process.env.ADMIN_PASSWORD ?? "23rdhc1@"
    if (password !== correct) {
      return Response.json({ error: "Şifre hatalı" }, { status: 401 })
    }
    cookieStore.set("admin_session", "founder", cookieOpts)
    return Response.json({ success: true, role: "founder" })
  }

  // Username/password login for sub-accounts
  try {
    const { getDb } = await import("@/lib/db")
    const sql = getDb()
    const rows = await sql`
      SELECT id, password_hash, role, is_active
      FROM admin_accounts
      WHERE username = ${username.trim()}
      LIMIT 1
    `
    const acc = rows[0] as { id: string; password_hash: string; role: string; is_active: boolean } | undefined
    if (!acc || !acc.is_active || !verifyPassword(password, acc.password_hash)) {
      return Response.json({ error: "Kullanıcı adı veya şifre hatalı" }, { status: 401 })
    }
    cookieStore.set("admin_session", `acc_${acc.id}`, cookieOpts)
    return Response.json({ success: true, role: acc.role })
  } catch (e) {
    console.error(e)
    return Response.json({ error: "Sunucu hatası" }, { status: 500 })
  }
}

export async function DELETE() {
  const cookieStore = await cookies()
  cookieStore.delete("admin_session")
  return Response.json({ success: true })
}
