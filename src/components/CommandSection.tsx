import Image from "next/image"

interface DbOfficer {
  id: string
  badge_no: string
  name: string
  rank: string
  unit: string
  status: string
  discord_avatar: string | null
}

function nameToAvatarPath(name: string) {
  return `/gallery/${name.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/^-+|-+$/g, "")}.png`
}

function Avatar({ officer }: { officer: DbOfficer }) {
  const initials = officer.name.split(/[\s.]/).filter(Boolean).map((p) => p[0]).join("").slice(0, 2).toUpperCase()
  const galleryPath = nameToAvatarPath(officer.name)

  // Try gallery image first (character photo), then Discord avatar, then initials
  return (
    <GalleryAvatar
      galleryPath={galleryPath}
      discordAvatar={officer.discord_avatar}
      initials={initials}
      name={officer.name}
    />
  )
}

function GalleryAvatar({ galleryPath, discordAvatar, initials, name }: {
  galleryPath: string
  discordAvatar: string | null
  initials: string
  name: string
}) {
  // Server-side: try gallery image, fallback determined at render time
  // We attempt gallery path; Next.js Image will show placeholder on error
  if (discordAvatar) {
    return (
      <div className="rounded-full overflow-hidden flex-shrink-0" style={{ width: 88, height: 88, border: "2px solid var(--color-accent)" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={galleryPath} alt={name} width={88} height={88}
          style={{ objectFit: "cover", width: "100%", height: "100%" }}
          onError={(e) => {
            const target = e.currentTarget as HTMLImageElement
            if (target.src !== discordAvatar) {
              target.src = discordAvatar!
            }
          }}
        />
      </div>
    )
  }

  return (
    <div className="rounded-full overflow-hidden flex-shrink-0" style={{ width: 88, height: 88, border: "2px solid var(--color-accent)" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={galleryPath} alt={name} width={88} height={88}
        style={{ objectFit: "cover", width: "100%", height: "100%" }}
        onError={(e) => {
          // Replace with initials fallback
          const target = e.currentTarget as HTMLImageElement
          const parent = target.parentElement
          if (parent) {
            parent.innerHTML = `<div style="width:88px;height:88px;background:var(--color-bg-3);border:2px solid var(--color-accent);border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:var(--font-display);font-size:1.3rem;color:var(--color-accent);font-weight:700">${initials}</div>`
          }
        }}
      />
    </div>
  )
}

export default function CommandSection({ officers }: { officers: DbOfficer[] }) {
  if (officers.length === 0) return null

  return (
    <section
      id="command"
      className="section-pad"
      style={{ borderBottom: "1px solid var(--color-line)" }}
    >
      <div className="container-max">
        <div className="kicker mb-4">01 / Komuta Kademesi</div>
        <h2
          className="mb-12"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)",
            fontWeight: 700,
            textTransform: "uppercase",
            color: "var(--color-txt)",
          }}
        >
          Üst Komuta
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {officers.map((officer) => (
            <div
              key={officer.id}
              className="relative flex flex-col items-center text-center p-6"
              style={{
                background: "var(--color-bg-2)",
                border: "1px solid var(--color-line)",
              }}
            >
              <div className="absolute top-0 left-0 w-4 h-4" style={{ borderTop: "2px solid var(--color-accent)", borderLeft: "2px solid var(--color-accent)" }} />
              <div className="absolute bottom-0 right-0 w-4 h-4" style={{ borderBottom: "2px solid var(--color-line)", borderRight: "2px solid var(--color-line)" }} />

              <Avatar officer={officer} />

              <div className="mt-4 px-2 py-1" style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.2em", color: "var(--color-accent-ink)", background: "var(--color-accent)", textTransform: "uppercase" }}>
                {officer.badge_no}
              </div>

              <div className="mt-3" style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--color-txt)" }}>
                {officer.name}
              </div>

              <div className="mt-1" style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--color-accent)" }}>
                {officer.rank}
              </div>

              <div className="mt-1" style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-faint)" }}>
                {officer.unit}
              </div>

              <div className="mt-4 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: officer.status === "Görevde" ? "var(--color-status-on)" : officer.status === "Aktif" ? "var(--color-accent)" : "var(--color-faint)" }} />
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.14em", textTransform: "uppercase", color: officer.status === "Görevde" ? "var(--color-status-on)" : officer.status === "Aktif" ? "var(--color-accent)" : "var(--color-faint)" }}>
                  {officer.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
