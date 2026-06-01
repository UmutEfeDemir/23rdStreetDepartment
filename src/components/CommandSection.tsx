"use client"

import { useState } from "react"

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

const mono: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  letterSpacing: "0.12em",
  textTransform: "uppercase" as const,
}

function nameToAvatarPath(name: string) {
  return `/gallery/${name.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/^-+|-+$/g, "")}.png`
}

function OfficerAvatar({ officer, size = 88 }: { officer: DbOfficer; size?: number }) {
  const initials = officer.name
    .split(/[\s.]/)
    .filter(Boolean)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
  const galleryPath = nameToAvatarPath(officer.name)

  const style: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: "50%",
    border: "2px solid var(--color-accent)",
    overflow: "hidden",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }

  const imgStyle: React.CSSProperties = {
    objectFit: "cover",
    width: "100%",
    height: "100%",
  }

  if (officer.discord_avatar) {
    return (
      <div style={style}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={galleryPath}
          alt={officer.name}
          style={imgStyle}
          onError={(e) => {
            const t = e.currentTarget
            if (t.src !== officer.discord_avatar) t.src = officer.discord_avatar!
          }}
        />
      </div>
    )
  }

  return (
    <div style={style}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={galleryPath}
        alt={officer.name}
        style={imgStyle}
        onError={(e) => {
          const t = e.currentTarget
          const p = t.parentElement
          if (p) {
            p.innerHTML = `<div style="width:${size}px;height:${size}px;background:var(--color-bg-3);display:flex;align-items:center;justify-content:center;font-family:var(--font-display);font-size:${size > 80 ? "1.4rem" : "1rem"};color:var(--color-accent);font-weight:700">${initials}</div>`
          }
        }}
      />
    </div>
  )
}

function statusColor(status: string) {
  if (status === "Görevde") return "var(--color-status-on)"
  if (status === "Aktif") return "var(--color-accent)"
  return "var(--color-faint)"
}

function OfficerModal({ officer, onClose }: { officer: DbOfficer; onClose: () => void }) {
  return (
    <div
      style={{ position: "fixed", inset: 0, background: "oklch(0 0 0 / 0.82)", zIndex: 900, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
      onClick={onClose}
    >
      <div
        style={{ background: "var(--color-bg-2)", border: "1px solid var(--color-line)", width: "100%", maxWidth: 420, position: "relative" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Corner accents */}
        <div style={{ position: "absolute", top: 0, left: 0, width: 14, height: 14, borderTop: "2px solid var(--color-accent)", borderLeft: "2px solid var(--color-accent)" }} />
        <div style={{ position: "absolute", bottom: 0, right: 0, width: 14, height: 14, borderBottom: "2px solid var(--color-line)", borderRight: "2px solid var(--color-line)" }} />

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: "1px solid var(--color-line)", background: "var(--color-bg-3)" }}>
          <span style={{ ...mono, fontSize: "0.55rem", color: "var(--color-accent)" }}>● Memur Dosyası</span>
          <button
            onClick={onClose}
            style={{ ...mono, fontSize: "0.55rem", color: "var(--color-faint)", border: "1px solid var(--color-line)", padding: "4px 10px", background: "transparent", cursor: "pointer" }}
          >✕</button>
        </div>

        {/* Body */}
        <div style={{ padding: "24px 20px" }}>
          {/* Avatar + identity */}
          <div style={{ display: "flex", gap: 20, alignItems: "flex-start", marginBottom: 20 }}>
            <OfficerAvatar officer={officer} size={90} />
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ ...mono, fontSize: "0.58rem", color: "var(--color-accent-ink)", background: "var(--color-accent)", padding: "3px 10px", display: "inline-block", marginBottom: 8 }}>
                {officer.badge_no}
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 700, textTransform: "uppercase", color: "var(--color-txt)", letterSpacing: "0.04em" }}>
                {officer.name}
              </div>
              <div style={{ ...mono, fontSize: "0.6rem", color: "var(--color-accent)", marginTop: 2 }}>
                {officer.rank}
              </div>
              <div style={{ ...mono, fontSize: "0.55rem", color: "var(--color-faint)", marginTop: 2 }}>
                {officer.unit}
              </div>
            </div>
          </div>

          {/* Status */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 14px", background: "var(--color-bg-3)", border: "1px solid var(--color-line)", marginBottom: 14 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: statusColor(officer.status), flexShrink: 0 }} />
            <span style={{ ...mono, fontSize: "0.6rem", color: statusColor(officer.status), fontWeight: 700 }}>{officer.status}</span>
          </div>

          {/* Stats grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: officer.rank_progress > 0 ? 14 : 0 }}>
            {officer.seniority_months > 0 && (
              <div style={{ background: "var(--color-bg-3)", border: "1px solid var(--color-line)", padding: "10px 12px" }}>
                <div style={{ ...mono, fontSize: "0.5rem", color: "var(--color-faint)", marginBottom: 4 }}>Kıdem</div>
                <div style={{ ...mono, fontSize: "0.72rem", color: "var(--color-txt)", fontWeight: 700 }}>{officer.seniority_months} ay</div>
              </div>
            )}
            {officer.discord_avatar && (
              <div style={{ background: "var(--color-bg-3)", border: "1px solid var(--color-line)", padding: "10px 12px", display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#5865F2", flexShrink: 0 }} />
                <span style={{ ...mono, fontSize: "0.58rem", color: "#5865F2", fontWeight: 700 }}>Discord Bağlı</span>
              </div>
            )}
          </div>

          {/* Rank progress */}
          {officer.rank_progress > 0 && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ ...mono, fontSize: "0.5rem", color: "var(--color-faint)" }}>Rütbe İlerlemesi</span>
                {officer.next_rank && (
                  <span style={{ ...mono, fontSize: "0.5rem", color: "var(--color-faint)" }}>→ {officer.next_rank}</span>
                )}
              </div>
              <div style={{ height: 4, background: "var(--color-bg-3)", border: "1px solid var(--color-line)" }}>
                <div style={{ height: "100%", width: `${Math.min(officer.rank_progress, 100)}%`, background: "var(--color-accent)", transition: "width 0.3s" }} />
              </div>
              <div style={{ ...mono, fontSize: "0.5rem", color: "var(--color-accent)", marginTop: 4, textAlign: "right" }}>{officer.rank_progress}%</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function CommandSection({ officers }: { officers: DbOfficer[] }) {
  const [activeOfficer, setActiveOfficer] = useState<DbOfficer | null>(null)

  if (officers.length === 0) return null

  return (
    <section
      id="command"
      className="section-pad"
      style={{ borderBottom: "1px solid var(--color-line)" }}
    >
      {activeOfficer && (
        <OfficerModal officer={activeOfficer} onClose={() => setActiveOfficer(null)} />
      )}

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
              className="relative flex flex-col items-center text-center p-6 cursor-pointer"
              style={{
                background: "var(--color-bg-2)",
                border: "1px solid var(--color-line)",
                transition: "border-color 0.15s",
              }}
              onClick={() => setActiveOfficer(officer)}
              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "var(--color-accent)" }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "var(--color-line)" }}
            >
              <div className="absolute top-0 left-0 w-4 h-4" style={{ borderTop: "2px solid var(--color-accent)", borderLeft: "2px solid var(--color-accent)" }} />
              <div className="absolute bottom-0 right-0 w-4 h-4" style={{ borderBottom: "2px solid var(--color-line)", borderRight: "2px solid var(--color-line)" }} />

              <OfficerAvatar officer={officer} size={88} />

              <div className="mt-4 px-2 py-1" style={{ ...mono, fontSize: "0.58rem", color: "var(--color-accent-ink)", background: "var(--color-accent)" }}>
                {officer.badge_no}
              </div>

              <div className="mt-3" style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--color-txt)" }}>
                {officer.name}
              </div>

              <div className="mt-1" style={{ ...mono, fontSize: "0.65rem", color: "var(--color-accent)" }}>
                {officer.rank}
              </div>

              <div className="mt-1" style={{ ...mono, fontSize: "0.58rem", color: "var(--color-faint)" }}>
                {officer.unit}
              </div>

              <div className="mt-4 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: statusColor(officer.status) }} />
                <span style={{ ...mono, fontSize: "0.58rem", color: statusColor(officer.status) }}>
                  {officer.status}
                </span>
              </div>

              {/* Hover hint */}
              <div style={{ ...mono, fontSize: "0.5rem", color: "var(--color-faint)", marginTop: 10, opacity: 0.6 }}>
                Detay için tıkla
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
