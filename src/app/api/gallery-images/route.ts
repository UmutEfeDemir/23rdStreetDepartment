import { type NextRequest } from "next/server"
import { getDb } from "@/lib/db"
import { canDo } from "@/lib/adminAuth"

export async function GET() {
  try {
    const sql = getDb()
    const rows = await sql`SELECT * FROM gallery_images ORDER BY order_num ASC, id ASC`
    return Response.json(rows)
  } catch {
    return Response.json([])
  }
}

export async function POST(req: NextRequest) {
  if (!(await canDo("images"))) return Response.json({ error: "Yetkisiz" }, { status: 403 })
  const { url, caption } = await req.json()
  if (!url?.trim()) return Response.json({ error: "URL boş olamaz" }, { status: 400 })
  const sql = getDb()
  const rows = await sql`
    INSERT INTO gallery_images (url, caption)
    VALUES (${url.trim()}, ${caption?.trim() ?? null})
    RETURNING *
  `
  return Response.json(rows[0])
}

export async function DELETE(req: NextRequest) {
  if (!(await canDo("images"))) return Response.json({ error: "Yetkisiz" }, { status: 403 })
  const { id } = await req.json()
  const sql = getDb()
  await sql`DELETE FROM gallery_images WHERE id = ${id}`
  return Response.json({ success: true })
}

export async function PATCH(req: NextRequest) {
  if (!(await canDo("images"))) return Response.json({ error: "Yetkisiz" }, { status: 403 })
  const { id, order_num } = await req.json()
  if (!id) return Response.json({ error: "ID gerekli" }, { status: 400 })
  const sql = getDb()
  await sql`UPDATE gallery_images SET order_num = ${order_num ?? 0} WHERE id = ${id}`
  return Response.json({ success: true })
}
