import { cookies } from "next/headers"
import { type NextRequest } from "next/server"

async function isAdmin() {
  const cookieStore = await cookies()
  return cookieStore.get("admin_session")?.value === "1"
}

async function sendDiscordNotification(discordId: string, status: string, reason?: string, rejectedBy?: string) {
  const webhookUrl = process.env.DISCORD_NOTIFY_WEBHOOK_URL
  if (!webhookUrl || webhookUrl === "...") return

  const tag = discordId ? `<@${discordId}>` : "Başvuru Sahibi"

  let embed
  if (status === "interview") {
    embed = {
      title: "📋 Mülakat Daveti",
      color: 0x3b82f6,
      description: `${tag} — Başvurunuz **mülakat** aşamasına alınmıştır. Lütfen mülakat kanalına geçin.`,
      footer: { text: "23rd Street Department — SASP" },
      timestamp: new Date().toISOString(),
    }
  } else if (status === "rejected") {
    embed = {
      title: "❌ Başvuru Sonucu",
      color: 0xef4444,
      description: `${tag} — Başvurunuz reddedilmiştir.`,
      fields: [
        ...(reason ? [{ name: "Sebep", value: reason }] : []),
        ...(rejectedBy ? [{ name: "Değerlendiren", value: rejectedBy, inline: true }] : []),
      ],
      footer: { text: "23rd Street Department — SASP" },
      timestamp: new Date().toISOString(),
    }
  } else {
    return
  }

  await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ embeds: [embed] }),
  }).catch((e) => console.error("Notify webhook error:", e))
}

export async function GET() {
  if (!(await isAdmin())) {
    return Response.json({ error: "Yetkisiz" }, { status: 401 })
  }

  if (process.env.DATABASE_URL) {
    try {
      const { getDb } = await import("@/lib/db")
      const sql = getDb()
      const rows = await sql`SELECT * FROM applications ORDER BY created_at DESC`
      return Response.json(rows)
    } catch (e) {
      console.error(e)
    }
  }

  return Response.json([])
}

export async function PATCH(req: NextRequest) {
  if (!(await isAdmin())) {
    return Response.json({ error: "Yetkisiz" }, { status: 401 })
  }

  const { id, status, rejection_reason, rejected_by } = await req.json()
  const validStatuses = ["pending", "interview", "accepted", "rejected"]
  if (!id || !validStatuses.includes(status)) {
    return Response.json({ error: "Geçersiz veri" }, { status: 400 })
  }

  if (process.env.DATABASE_URL) {
    try {
      const { getDb } = await import("@/lib/db")
      const sql = getDb()
      await sql`
        UPDATE applications
        SET status = ${status},
            rejection_reason = ${rejection_reason ?? null},
            rejected_by = ${rejected_by ?? null}
        WHERE id = ${id}
      `

      // Send Discord notification for interview or rejection
      if (status === "interview" || status === "rejected") {
        const rows = await sql`SELECT discord_id FROM applications WHERE id = ${id} LIMIT 1`
        const discordId = (rows[0] as { discord_id?: string } | undefined)?.discord_id ?? ""
        await sendDiscordNotification(discordId, status, rejection_reason, rejected_by)
      }

      return Response.json({ success: true })
    } catch (e) {
      console.error(e)
      return Response.json({ error: "DB hatası" }, { status: 500 })
    }
  }

  return Response.json({ success: true })
}

export async function DELETE(req: NextRequest) {
  if (!(await isAdmin())) {
    return Response.json({ error: "Yetkisiz" }, { status: 401 })
  }

  const { id } = await req.json()
  if (!id) return Response.json({ error: "ID gerekli" }, { status: 400 })

  if (process.env.DATABASE_URL) {
    try {
      const { getDb } = await import("@/lib/db")
      const sql = getDb()
      await sql`DELETE FROM applications WHERE id = ${id}`
      return Response.json({ success: true })
    } catch (e) {
      console.error(e)
      return Response.json({ error: "DB hatası" }, { status: 500 })
    }
  }

  return Response.json({ success: true })
}
