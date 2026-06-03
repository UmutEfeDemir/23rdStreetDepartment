import { cookies } from "next/headers"
import { getAdminRole } from "@/lib/adminAuth"

export async function GET() {
  const role = await getAdminRole()
  if (!role) return Response.json({ role: null }, { status: 401 })

  const cookieStore = await cookies()
  const session = cookieStore.get("admin_session")?.value ?? ""

  let displayName = "Developer"
  let customRoleName: string | null = null
  let customRoleColor: string | null = null
  let customRoleColorTo: string | null = null

  if (session.startsWith("acc_")) {
    try {
      const { getDb } = await import("@/lib/db")
      const sql = getDb()
      const id = session.slice(4)
      const rows = await sql`
        SELECT a.username, r.name AS role_name, r.color AS role_color, r.color_to AS role_color_to
        FROM admin_accounts a
        LEFT JOIN admin_roles r ON r.id = a.role_id
        WHERE a.id = ${id} LIMIT 1
      `
      const acc = rows[0] as { username?: string; role_name?: string; role_color?: string; role_color_to?: string } | undefined
      if (acc?.username) displayName = acc.username
      if (acc?.role_name) { customRoleName = acc.role_name; customRoleColor = acc.role_color ?? null; customRoleColorTo = acc.role_color_to ?? null }
    } catch {}
  }

  return Response.json({ role, displayName, customRoleName, customRoleColor, customRoleColorTo })
}
