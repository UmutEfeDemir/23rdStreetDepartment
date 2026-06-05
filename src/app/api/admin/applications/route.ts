import { type NextRequest } from "next/server"
import { isAnyAdmin, isAtLeastModerator } from "@/lib/adminAuth"

async function sendDiscordNotification(discordId: string, status: string, reason?: string, rejectedBy?: string) {
  const mulakatWebhook = process.env.DISCORD_MULAKAT_WEBHOOK_URL
  const sonucWebhook = process.env.DISCORD_SONUC_WEBHOOK_URL
  // Eski tek webhook'u fallback olarak kullan
  const fallback = process.env.DISCORD_NOTIFY_WEBHOOK_URL

  const tag = discordId ? `<@${discordId}>` : "Başvuru Sahibi"
  let embed: Record<string, unknown>
  let webhookUrl: string | undefined

  if (status === "interview") {
    webhookUrl = mulakatWebhook || fallback
    if (!webhookUrl || webhookUrl === "...") return
    embed = {
      title: "📋 Mülakat Çağrısı",
      color: 0x3b82f6,
      description: `${tag} — Başvurunuz **mülakat** aşamasına alındı.\nLütfen mülakat kanalına geçin.`,
      footer: { text: "23rd Street Department" },
      timestamp: new Date().toISOString(),
    }
  } else if (status === "accepted") {
    webhookUrl = sonucWebhook || fallback
    if (!webhookUrl || webhookUrl === "...") return
    embed = {
      title: "✅ Başvuru Kabul Edildi",
      color: 0x22c55e,
      description: `${tag} — Başvurunuz **kabul** edilmiştir. Hoş geldiniz!`,
      footer: { text: "23rd Street Department" },
      timestamp: new Date().toISOString(),
    }
  } else if (status === "completed") {
    webhookUrl = sonucWebhook || fallback
    if (!webhookUrl || webhookUrl === "...") return
    embed = {
      title: "🏁 Süreç Tamamlandı",
      color: 0x6366f1,
      description: `${tag} — Mülakat süreci tamamlandı.`,
      footer: { text: "23rd Street Department" },
      timestamp: new Date().toISOString(),
    }
  } else if (status === "rejected") {
    webhookUrl = sonucWebhook || fallback
    if (!webhookUrl || webhookUrl === "...") return
    embed = {
      title: "❌ Başvuru Reddedildi",
      color: 0xef4444,
      description: `${tag} — Başvurunuz **reddedildi**.`,
      fields: [
        ...(reason ? [{ name: "Sebep", value: reason }] : []),
        ...(rejectedBy ? [{ name: "Değerlendiren", value: rejectedBy, inline: true }] : []),
      ],
      footer: { text: "23rd Street Department" },
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

export async function GET(req: Request) {
  if (!(await isAnyAdmin())) {
    return Response.json({ error: "Yetkisiz" }, { status: 401 })
  }

  const url = new URL(req.url)
  const deleted = url.searchParams.get("deleted") === "1"

  if (process.env.DATABASE_URL) {
    try {
      const { getDb } = await import("@/lib/db")
      const sql = getDb()
      const rows = deleted
        ? await sql`SELECT * FROM applications WHERE deleted_at IS NOT NULL ORDER BY deleted_at DESC`
        : await sql`SELECT * FROM applications WHERE deleted_at IS NULL ORDER BY created_at DESC`
      return Response.json(rows)
    } catch (e) {
      console.error(e)
    }
  }

  return Response.json([])
}

export async function PATCH(req: NextRequest) {
  if (!(await isAnyAdmin())) {
    return Response.json({ error: "Yetkisiz" }, { status: 401 })
  }

  const { id, status, rejection_reason, rejected_by } = await req.json()
  const validStatuses = ["pending", "interview", "accepted", "rejected", "completed"]
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

      if (["interview", "accepted", "rejected", "completed"].includes(status)) {
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
  if (!(await isAtLeastModerator())) {
    return Response.json({ error: "Yetkisiz" }, { status: 403 })
  }

  const body = await req.json()
  const { id, permanent, cleanup } = body

  if (process.env.DATABASE_URL) {
    try {
      const { getDb } = await import("@/lib/db")
      const sql = getDb()
      // Bulk cleanup: hard-delete archive entries older than 15 days
      if (cleanup) {
        const result = await sql`
          DELETE FROM applications
          WHERE deleted_at IS NOT NULL AND deleted_at < NOW() - INTERVAL '15 days'
          RETURNING id
        `
        return Response.json({ deleted: result.length })
      }
      if (!id) return Response.json({ error: "ID gerekli" }, { status: 400 })
      if (permanent) {
        await sql`DELETE FROM applications WHERE id = ${id}`
      } else {
        await sql`UPDATE applications SET deleted_at = NOW() WHERE id = ${id}`
      }
      return Response.json({ success: true })
    } catch (e) {
      console.error(e)
      return Response.json({ error: "DB hatası" }, { status: 500 })
    }
  }

  return Response.json({ success: true })
}

export async function PUT(req: NextRequest) {
  // Restore from archive back to interview
  if (!(await isAtLeastModerator())) {
    return Response.json({ error: "Yetkisiz" }, { status: 403 })
  }
  const { id } = await req.json()
  if (!id) return Response.json({ error: "ID gerekli" }, { status: 400 })
  if (process.env.DATABASE_URL) {
    try {
      const { getDb } = await import("@/lib/db")
      const sql = getDb()
      await sql`UPDATE applications SET deleted_at = NULL, status = 'interview' WHERE id = ${id}`
      return Response.json({ success: true })
    } catch (e) {
      console.error(e)
      return Response.json({ error: "DB hatası" }, { status: 500 })
    }
  }
  return Response.json({ success: true })
}
