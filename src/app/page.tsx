import { SEED_STATS } from "@/lib/seed"
import { getDiscordRoleMemberCount } from "@/lib/discord"
import { getDb } from "@/lib/db"
import IntroAnimation from "@/components/IntroAnimation"
import StatusRibbon from "@/components/StatusRibbon"
import AnnouncementBanner from "@/components/AnnouncementBanner"
import Nav from "@/components/Nav"
import Hero from "@/components/Hero"
import Stats from "@/components/Stats"
import Mission from "@/components/Mission"
import CommandSection from "@/components/CommandSection"
import PersonnelSection from "@/components/PersonnelSection"
import PersonnelPanel from "@/components/PersonnelPanel"
import UnitsSection from "@/components/UnitsSection"
import Gallery from "@/components/Gallery"
import ApplicationForm from "@/components/ApplicationForm"
import JoinCTA from "@/components/JoinCTA"
import Footer from "@/components/Footer"

export const revalidate = 300

interface DbOfficer {
  id: string
  badge_no: string
  name: string
  rank: string
  unit: string
  status: string
  seniority_months: number
  rank_progress: number
  next_rank: string | null
  is_command: boolean
  discord_avatar: string | null
}

export default async function Home() {
  const discordCount = await getDiscordRoleMemberCount()

  let totalPersonnel = SEED_STATS.totalPersonnel
  let commandOfficers: DbOfficer[] = []

  try {
    const sql = getDb()
    const [countRow] = await sql`SELECT COUNT(*)::int AS total FROM officers_db`
    totalPersonnel = (countRow as { total: number }).total || SEED_STATS.totalPersonnel

    const rows = await sql`
      SELECT id, badge_no, name, rank, unit, status, seniority_months, rank_progress, next_rank, is_command, discord_avatar
      FROM officers_db
      WHERE is_command = true
      ORDER BY badge_no::integer ASC
    `
    commandOfficers = rows as DbOfficer[]
  } catch {
    // DB unavailable — fall back to seed
  }

  const stats = {
    ...SEED_STATS,
    totalPersonnel,
    activeTroopers: discordCount ?? SEED_STATS.activeTroopers,
  }

  return (
    <div style={{ position: "relative", zIndex: 1 }}>
      <IntroAnimation />
      <StatusRibbon />
      <AnnouncementBanner />
      <Nav />
      <main>
        <Hero />
        <Stats stats={stats} />
        <Mission />
        <CommandSection officers={commandOfficers} />
        <PersonnelSection />
        <PersonnelPanel />
        <UnitsSection />
        <Gallery />
        <ApplicationForm />
        <JoinCTA />
      </main>
      <Footer />
    </div>
  )
}
