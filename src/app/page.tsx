import { SEED_OFFICERS, SEED_STATS, COMMAND_STAFF } from "@/lib/seed"
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

export default async function Home() {
  // In production these would come from the DB via API
  const stats = SEED_STATS
  const officers = SEED_OFFICERS
  const commandStaff = COMMAND_STAFF

  return (
    <div style={{ position: "relative", zIndex: 1 }}>
      <StatusRibbon />
      <Nav />
      <main>
        <Hero />
        <Stats stats={stats} />
        <Mission />
        <CommandSection officers={commandStaff} />
        <PersonnelSection officers={officers} />
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
