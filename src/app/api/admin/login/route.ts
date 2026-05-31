import { cookies } from "next/headers"
import { type NextRequest } from "next/server"

export async function POST(req: NextRequest) {
  const { password } = await req.json()
  const correct = process.env.ADMIN_PASSWORD ?? "23rdhc1@"

  if (password !== correct) {
    return Response.json({ error: "Şifre hatalı" }, { status: 401 })
  }

  const cookieStore = await cookies()
  cookieStore.set("admin_session", "1", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 8,
    path: "/",
    sameSite: "lax",
  })

  return Response.json({ success: true })
}

export async function DELETE() {
  const cookieStore = await cookies()
  cookieStore.delete("admin_session")
  return Response.json({ success: true })
}
