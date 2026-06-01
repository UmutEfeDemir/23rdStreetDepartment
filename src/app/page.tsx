import { SEED_STATS, COMMAND_STAFF } from "@/lib/seed"
import { getDiscordRoleMemberCount } from "@/lib/discord"
import IntroAnimation from "@/components/IntroAnimation"
import StatusRibbon from "@/components/StatusRibbon"
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

export default async function Home() {
  const discordCount = await getDiscordRoleMemberCount()
  const stats = { ...SEED_STATS, activeTroopers: discordCount ?? SEED_STATS.activeTroopers }
  const commandStaff = COMMAND_STAFF

  return (
    <div style={{ position: "relative", zIndex: 1 }}>
      <IntroAnimation />
      <StatusRibbon />
      <Nav />
      <main>
        <Hero />
        <Stats stats={stats} />
        <Mission />
        <CommandSection officers={commandStaff} />
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
