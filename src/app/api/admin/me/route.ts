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
  let permissions: Record<string, boolean> = {}

  if (session.startsWith("acc_")) {
    try {
      const { getDb } = await import("@/lib/db")
      const sql = getDb()
      const id = session.slice(4)
      const rows = await sql`
        SELECT a.username, a.permissions, a.role_id,
               r.name AS role_name, r.color AS role_color, r.color_to AS role_color_to,
               r.permissions AS role_permissions
        FROM admin_accounts a
        LEFT JOIN admin_roles r ON r.id = a.role_id
        WHERE a.id = ${id} LIMIT 1
      `
      const acc = rows[0] as {
        username?: string; permissions?: Record<string, boolean>; role_id?: number
        role_name?: string; role_color?: string; role_color_to?: string; role_permissions?: Record<string, boolean>
      } | undefined
      if (acc?.username) displayName = acc.username
      if (acc?.role_name) { customRoleName = acc.role_name; customRoleColor = acc.role_color ?? null; customRoleColorTo = acc.role_color_to ?? null }
      // effective permissions: custom role takes precedence over account-level
      permissions = (acc?.role_id && acc.role_permissions ? acc.role_permissions : acc?.permissions) ?? {}
    } catch {}
  }

  return Response.json({ role, displayName, customRoleName, customRoleColor, customRoleColorTo, permissions })
}
