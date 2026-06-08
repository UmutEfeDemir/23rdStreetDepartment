import { cookies } from "next/headers"

export type AdminRole = "founder" | "moderator" | "interview"
export type AdminPermission = "announce" | "images" | "forum" | "accounts" | "officers"

// Default permissions by role. Founder always has everything.
const ROLE_DEFAULTS: Record<Exclude<AdminRole, "founder">, Record<AdminPermission, boolean>> = {
  moderator: { announce: true, images: true, forum: true, accounts: false, officers: false },
  interview: { announce: false, images: false, forum: false, accounts: false, officers: false },
}

interface SessionResult {
  role: AdminRole
  accountId?: string
  permissions?: Partial<Record<AdminPermission, boolean>>
}

async function getSession(): Promise<SessionResult | null> {
  const cookieStore = await cookies()
  const session = cookieStore.get("admin_session")?.value
  if (!session) return null
  if (session === "founder" || session === "1") return { role: "founder" }
  if (session.startsWith("acc_")) {
    const id = session.slice(4)
    try {
      const { getDb } = await import("@/lib/db")
      const sql = getDb()
      const rows = await sql`
        SELECT a.role, a.is_active, a.permissions, a.role_id, r.permissions AS role_permissions
        FROM admin_accounts a
        LEFT JOIN admin_roles r ON r.id = a.role_id
        WHERE a.id = ${id} LIMIT 1
      `
      const acc = rows[0] as {
        role: AdminRole; is_active: boolean;
        permissions?: Record<string, boolean>;
        role_id?: number;
        role_permissions?: Record<string, boolean>;
      } | undefined
      if (!acc?.is_active) return null
      // If a custom role is assigned, its permissions take precedence
      const perms = acc.role_id && acc.role_permissions ? acc.role_permissions : (acc.permissions ?? {})
      return { role: acc.role, accountId: id, permissions: perms }
    } catch {}
    return null
  }
  return null
}

export async function getAdminRole(): Promise<AdminRole | null> {
  const s = await getSession()
  return s?.role ?? null
}

export async function isAnyAdmin(): Promise<boolean> {
  return (await getAdminRole()) !== null
}

export async function isAtLeastModerator(): Promise<boolean> {
  const role = await getAdminRole()
  return role === "founder" || role === "moderator"
}

export async function isFounder(): Promise<boolean> {
  return (await getAdminRole()) === "founder"
}

/** Check a granular feature permission. Founder always passes. Others use role defaults + per-account overrides. */
export async function canDo(permission: AdminPermission): Promise<boolean> {
  const s = await getSession()
  if (!s) return false
  if (s.role === "founder") return true
  const base = ROLE_DEFAULTS[s.role][permission]
  if (s.permissions && permission in s.permissions) return s.permissions[permission] as boolean
  return base
}
