import NextAuth from "next-auth"
import Discord from "next-auth/providers/discord"

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  providers: [
    Discord({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account?.providerAccountId) {
        token.discordId = account.providerAccountId
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string; discordId?: string }).id = token.sub ?? ""
        ;(session.user as { id?: string; discordId?: string }).discordId = token.discordId as string
      }
      return session
    },
  },
})
