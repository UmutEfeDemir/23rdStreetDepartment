import { getDb } from "@/lib/db"

export const revalidate = 0

export async function GET() {
  const sql = getDb()

  let activeDuty: { name: string; rank: string; badge_no: string }[] = []
  let announcements: { message: string; type: string }[] = []

  try {
    const rows = await sql`
      SELECT o.name, o.rank, o.badge_no
      FROM duty_logs dl
      JOIN officers_db o ON o.id = dl.officer_id
      WHERE dl.clock_out IS NULL
      ORDER BY dl.clock_in ASC
    `
    activeDuty = rows as typeof activeDuty
  } catch { /* table may not exist */ }

  try {
    const rows = await sql`SELECT message, type FROM announcements WHERE is_active = true ORDER BY created_at DESC`
    announcements = rows as typeof announcements
  } catch { /* table may not exist */ }

  return Response.json({ activeDuty, announcements })
}
