import { cookies } from "next/headers"

export type AdminRole = "founder" | "moderator" | "interview"

export async function getAdminRole(): Promise<AdminRole | null> {
  const cookieStore = await cookies()
  const session = cookieStore.get("admin_session")?.value
  if (!session) return null
  if (session === "founder" || session === "1") return "founder"
  if (session.startsWith("acc_")) {
    const id = session.slice(4)
    try {
      const { getDb } = await import("@/lib/db")
      const sql = getDb()
      const rows = await sql`SELECT role, is_active FROM admin_accounts WHERE id = ${id} LIMIT 1`
      const acc = rows[0] as { role: AdminRole; is_active: boolean } | undefined
      if (acc?.is_active) return acc.role
    } catch {}
    return null
  }
  return null
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
