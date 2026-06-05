import { type NextRequest } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { fullName, age, discord, discordId, characterName, characterAge, experience, motivation } = body

    if (!fullName || !age || !discord || !characterName || !characterAge || !experience || !motivation) {
      return Response.json({ error: "Eksik alanlar" }, { status: 400 })
    }
    if (Number(age) < 18) {
      return Response.json({ error: "18 yaşından küçükler başvuramaz" }, { status: 400 })
    }

    if (process.env.DATABASE_URL) {
      try {
        const { getDb } = await import("@/lib/db")
        const sql = getDb()

        // Aynı karakter adıyla aktif başvuru var mı?
        const dupName = await sql`
          SELECT id FROM applications
          WHERE LOWER(character_name) = LOWER(${characterName}) AND deleted_at IS NULL LIMIT 1
        `
        if (dupName.length > 0) {
          return Response.json({ error: "Bu karakter adıyla zaten bir başvuru mevcut." }, { status: 409 })
        }

        // Aynı Discord ID ile aktif başvuru var mı?
        if (discordId) {
          const dupDc = await sql`
            SELECT id FROM applications
            WHERE discord_id = ${discordId} AND deleted_at IS NULL
            AND status NOT IN ('rejected','completed') LIMIT 1
          `
          if (dupDc.length > 0) {
            return Response.json({ error: "Bu Discord hesabıyla zaten aktif bir başvurunuz bulunuyor." }, { status: 409 })
          }
        }

        await sql`
          INSERT INTO applications
            (full_name, age, discord, discord_id, character_name, unit, experience, motivation, accepted_rules, status)
          VALUES
            (${fullName}, ${Number(age)}, ${discord}, ${discordId || ""}, ${characterName}, ${String(characterAge)},
             ${experience}, ${motivation}, true, 'pending')
        `
      } catch (e: unknown) {
        const err = e as { status?: number; message?: string }
        if (err.status === 409) throw e
        console.error("DB insert error:", e)
      }
    }

    if (process.env.DISCORD_WEBHOOK_URL && process.env.DISCORD_WEBHOOK_URL !== "...") {
      await fetch(process.env.DISCORD_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          embeds: [
            {
              title: "🚔 Yeni Başvuru Alındı",
              color: 0xe6b450,
              fields: [
                { name: "Ad Soyad", value: fullName, inline: true },
                { name: "Yaş", value: String(age), inline: true },
                { name: "Discord", value: discord, inline: true },
                ...(discordId ? [{ name: "Discord ID", value: discordId, inline: true }] : []),
                { name: "Karakter", value: characterName, inline: true },
                { name: "Karakter Yaşı", value: String(characterAge), inline: true },
                { name: "RP Tecrübesi", value: experience.slice(0, 300) },
                { name: "Motivasyon", value: motivation.slice(0, 300) },
              ],
              timestamp: new Date().toISOString(),
              footer: { text: "23rd Street Department — SASP" },
            },
          ],
        }),
      }).catch((e) => console.error("Webhook error:", e))
    }

    return Response.json({ success: true })
  } catch (e) {
    console.error(e)
    return Response.json({ error: "Sunucu hatası" }, { status: 500 })
  }
}
