import { type NextRequest } from "next/server"
import { isAnyAdmin, isAtLeastModerator } from "@/lib/adminAuth"

function getBotToken() {
  return process.env.DISCORD_MESAI_BOT_TOKEN || process.env.DISCORD_BOT_TOKEN
}

async function giveRole(userId: string, roleId: string) {
  const token = getBotToken()
  const guildId = process.env.DISCORD_GUILD_ID
  if (!token || !guildId || !roleId || !userId) return
  const res = await fetch(`https://discord.com/api/v10/guilds/${guildId}/members/${userId}/roles/${roleId}`, {
    method: "PUT",
    headers: { Authorization: `Bot ${token}`, "Content-Type": "application/json" },
  })
  if (!res.ok) console.error(`[Discord] Rol verme hatası ${userId} → ${roleId}:`, await res.json().catch(() => ({})))
  else console.log(`[Discord] ✅ Rol verildi: ${userId} → ${roleId}`)
}

async function removeRole(userId: string, roleId: string) {
  const token = getBotToken()
  const guildId = process.env.DISCORD_GUILD_ID
  if (!token || !guildId || !roleId || !userId) return
  await fetch(`https://discord.com/api/v10/guilds/${guildId}/members/${userId}/roles/${roleId}`, {
    method: "DELETE",
    headers: { Authorization: `Bot ${token}` },
  }).catch(() => {})
}

async function updateNickname(userId: string, nick: string) {
  const token = getBotToken()
  const guildId = process.env.DISCORD_GUILD_ID
  if (!token || !guildId || !userId || !nick) return
  const res = await fetch(`https://discord.com/api/v10/guilds/${guildId}/members/${userId}`, {
    method: "PATCH",
    headers: { Authorization: `Bot ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ nick: nick.slice(0, 32) }),
  })
  if (!res.ok) console.error(`[Discord] Nickname hatası ${userId}:`, await res.json().catch(() => ({})))
  else console.log(`[Discord] ✅ Nickname güncellendi: ${userId} → ${nick}`)
}

async function postToChannel(channelId: string, payload: Record<string, unknown>) {
  const token = process.env.DISCORD_MESAI_BOT_TOKEN || process.env.DISCORD_BOT_TOKEN
  if (!token) { console.warn("[Discord] Bot token eksik"); return }
  if (!channelId) { console.warn("[Discord] Channel ID eksik"); return }
  try {
    const res = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
      method: "POST",
      headers: { Authorization: `Bot ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      console.error(`[Discord] Kanal ${channelId} mesaj hatası ${res.status}:`, data)
    } else {
      console.log(`[Discord] ✅ Kanal ${channelId} mesaj gönderildi`)
    }
  } catch (e) {
    console.error("[Discord] Fetch hatası:", e)
  }
}

async function sendDiscordNotification(
  discordId: string,
  status: string,
  characterName?: string,
  reason?: string,
  rejectedBy?: string,
) {
  const mulakatChannelId = process.env.DISCORD_MULAKAT_CHANNEL_ID
  const sonucChannelId = process.env.DISCORD_SONUC_CHANNEL_ID
  const mulakatRoleId = process.env.DISCORD_MULAKAT_ROLE_ID
  const gorevliRoleId = process.env.DISCORD_GOREVLI_ROLE_ID
  const cadetRoleId = process.env.DISCORD_CADET_ROLE_ID
  const tag = discordId ? `<@${discordId}>` : "Başvuru Sahibi"

  if (status === "interview") {
    // Mülakat rolü ver
    if (discordId && mulakatRoleId) await giveRole(discordId, mulakatRoleId)
    // Kanala bildirim
    if (mulakatChannelId) {
      await postToChannel(mulakatChannelId, {
        content: tag,
        embeds: [{
          title: "📋 Mülakat Çağrısı",
          color: 0x3b82f6,
          description: `${tag} — Başvurunuz **mülakat** aşamasına alındı. Lütfen mülakat kanalına geçin.`,
          footer: { text: "23rd Street Department" },
          timestamp: new Date().toISOString(),
        }],
      })
    }
  } else if (status === "accepted") {
    // Mülakat rolü kaldır, görevli + cadet ver
    if (discordId) {
      if (mulakatRoleId) await removeRole(discordId, mulakatRoleId)
      if (gorevliRoleId) await giveRole(discordId, gorevliRoleId)
      if (cadetRoleId) await giveRole(discordId, cadetRoleId)
      if (characterName) await updateNickname(discordId, `[S-23---] ${characterName}`)
    }
    if (sonucChannelId) {
      await postToChannel(sonucChannelId, {
        embeds: [{
          title: "✅ Başvuru Kabul",
          color: 0x22c55e,
          description: `${tag} — Başvurusu **kabul** edildi.${characterName ? ` Karakter: **${characterName}**` : ""}`,
          footer: { text: "23rd Street Department" },
          timestamp: new Date().toISOString(),
        }],
      })
    }
  } else if (status === "completed") {
    if (sonucChannelId) {
      await postToChannel(sonucChannelId, {
        embeds: [{
          title: "🏁 Süreç Tamamlandı",
          color: 0x6366f1,
          description: `${tag} — Mülakat süreci tamamlandı.`,
          footer: { text: "23rd Street Department" },
          timestamp: new Date().toISOString(),
        }],
      })
    }
  } else if (status === "rejected") {
    // Mülakat rolü kaldır
    if (discordId && mulakatRoleId) await removeRole(discordId, mulakatRoleId)
    if (sonucChannelId) {
      await postToChannel(sonucChannelId, {
        embeds: [{
          title: "❌ Başvuru Reddedildi",
          color: 0xef4444,
          description: `${tag} — Başvurusu **reddedildi**.`,
          fields: [
            ...(reason ? [{ name: "Sebep", value: reason }] : []),
            ...(rejectedBy ? [{ name: "Değerlendiren", value: rejectedBy, inline: true }] : []),
          ],
          footer: { text: "23rd Street Department" },
          timestamp: new Date().toISOString(),
        }],
      })
    }
  }
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
        const rows = await sql`SELECT discord_id, character_name FROM applications WHERE id = ${id} LIMIT 1`
        const row = rows[0] as { discord_id?: string; character_name?: string } | undefined
        const discordId = row?.discord_id ?? ""
        const characterName = row?.character_name ?? ""
        sendDiscordNotification(discordId, status, characterName, rejection_reason, rejected_by).catch((e) =>
          console.error("Discord bildirim hatası:", e)
        )
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
