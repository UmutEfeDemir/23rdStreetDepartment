import { type NextRequest } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { fullName, age, discord, characterName, unit, experience, motivation } = body

    if (!fullName || !age || !discord || !characterName || !unit || !experience || !motivation) {
      return Response.json({ error: "Eksik alanlar" }, { status: 400 })
    }
    if (Number(age) < 18) {
      return Response.json({ error: "18 yaşından küçükler başvuramaz" }, { status: 400 })
    }

    // Save to Neon if configured
    if (process.env.DATABASE_URL) {
      try {
        const { getDb } = await import("@/lib/db")
        const sql = getDb()
        await sql`
          INSERT INTO applications
            (full_name, age, discord, character_name, unit, experience, motivation, accepted_rules, status)
          VALUES
            (${fullName}, ${Number(age)}, ${discord}, ${characterName}, ${unit},
             ${experience}, ${motivation}, true, 'pending')
        `
      } catch (e) {
        console.error("DB insert error:", e)
      }
    }

    // Discord webhook notification
    if (process.env.DISCORD_WEBHOOK_URL) {
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
                { name: "Karakter", value: characterName, inline: true },
                { name: "Birim", value: unit, inline: true },
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
