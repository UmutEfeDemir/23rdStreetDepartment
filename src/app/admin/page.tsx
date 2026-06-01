import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import AdminDashboard from "./AdminDashboard"

export default async function AdminPage() {
  const cookieStore = await cookies()
  const session = cookieStore.get("admin_session")?.value

  const isLoggedIn =
    session === "founder" ||
    session === "1" ||
    (typeof session === "string" && session.startsWith("acc_"))

  if (!isLoggedIn) {
    redirect("/admin/login")
  }

  return <AdminDashboard />
}
