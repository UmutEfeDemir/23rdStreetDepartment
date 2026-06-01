import { cookies } from "next/headers"
import { getAdminRole } from "@/lib/adminAuth"

export async function GET() {
  const role = await getAdminRole()
  if (!role) return Response.json({ role: null }, { status: 401 })

  const cookieStore = await cookies()
  const session = cookieStore.get("admin_session")?.value ?? ""

  let displayName = "Kurucu"
  if (session.startsWith("acc_")) {
    try {
      const { getDb } = await import("@/lib/db")
      const sql = getDb()
      const id = session.slice(4)
      const rows = await sql`SELECT username FROM admin_accounts WHERE id = ${id} LIMIT 1`
      const acc = rows[0] as { username?: string } | undefined
      if (acc?.username) displayName = acc.username
    } catch {}
  }

  return Response.json({ role, displayName })
}
