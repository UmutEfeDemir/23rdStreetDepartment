import { cookies } from "next/headers"
import { type NextRequest } from "next/server"
import { getDb } from "@/lib/db"

const DEFAULT_RULES = `• Tüm oyun içi talimatlara uyulması zorunludur.
• Saygısızlık ve kuraldışı davranış tolere edilmez.
• Üniforma ve ekipman yönetmeliğine uyulacaktır.
• Gizlilik anlaşması imzalanacaktır.
• Deneme sürecinde görev başarısı değerlendirilir.`

async function isAdmin() {
  const cookieStore = await cookies()
  return cookieStore.get("admin_session")?.value === "1"
}

export async function GET() {
  try {
    const sql = getDb()
    const rows = await sql`SELECT content FROM site_rules ORDER BY id DESC LIMIT 1`
    return Response.json({ content: (rows[0] as { content: string } | undefined)?.content ?? DEFAULT_RULES })
  } catch {
    return Response.json({ content: DEFAULT_RULES })
  }
}

export async function PATCH(req: NextRequest) {
  if (!(await isAdmin())) return Response.json({ error: "Yetkisiz" }, { status: 401 })
  const { content } = await req.json()
  if (typeof content !== "string") return Response.json({ error: "Geçersiz içerik" }, { status: 400 })
  const sql = getDb()
  try {
    const existing = await sql`SELECT id FROM site_rules LIMIT 1`
    if (existing.length > 0) {
      await sql`UPDATE site_rules SET content = ${content}, updated_at = now() WHERE id = ${(existing[0] as { id: number }).id}`
    } else {
      await sql`INSERT INTO site_rules (content) VALUES (${content})`
    }
    return Response.json({ success: true })
  } catch (e) {
    console.error(e)
    return Response.json({ error: "DB hatası" }, { status: 500 })
  }
}
