import { getAdminRole } from "@/lib/adminAuth"

export async function GET() {
  const role = await getAdminRole()
  if (!role) return Response.json({ role: null }, { status: 401 })
  return Response.json({ role })
}
