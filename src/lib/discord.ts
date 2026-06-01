export async function getDiscordRoleMemberCount(): Promise<number | null> {
  const token = process.env.DISCORD_BOT_TOKEN
  const guildId = process.env.DISCORD_GUILD_ID
  const roleId = process.env.DISCORD_ROLE_ID
  if (!token || !guildId || !roleId) return null

  try {
    const res = await fetch(
      `https://discord.com/api/v10/guilds/${guildId}/members?limit=1000`,
      {
        headers: { Authorization: `Bot ${token}` },
        next: { revalidate: 300 },
      }
    )
    if (!res.ok) {
      console.error("Discord API error:", res.status, await res.text())
      return null
    }
    const members: { roles: string[] }[] = await res.json()
    return members.filter((m) => m.roles.includes(roleId)).length
  } catch (e) {
    console.error("Discord fetch failed:", e)
    return null
  }
}
