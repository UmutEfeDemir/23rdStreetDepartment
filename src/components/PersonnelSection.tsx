"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"

type UnitFilter = "TÜM" | "High Command" | "Sup. Command" | "Supervisor" | "Polis"

interface OfficerRow {
  id: string
  badge_no: string
  name: string
  rank: string
  unit: string
  status: string
  discord_avatar?: string | null
  seniority_months?: number
  rank_progress?: number
  next_rank?: string | null
  duty_hours?: number
}

const UNITS: UnitFilter[] = ["TÜM", "High Command", "Sup. Command", "Supervisor", "Polis"]

function nameToAvatar(name: string) {
  return `/gallery/${name.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/^-+|-+$/g, "")}.png`
}

function OfficerAvatar({ name }: { name: string }) {
  const initials = name.split(/[\s.]/).filter(Boolean).map((p) => p[0]).join("").slice(0, 2).toUpperCase()
  const [loaded, setLoaded] = useState(false)
  const src = nameToAvatar(name)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    const img = new window.Image()
    img.onload = () => { if (mountedRef.current) setLoaded(true) }
    img.onerror = () => { if (mountedRef.current) setLoaded(false) }
    img.src = src
    return () => { mountedRef.current = false }
  }, [src])

  if (loaded) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={name} className="rounded-full flex-shrink-0" style={{ width: 32, height: 32, objectFit: "cover", border: "1px solid var(--color-line)" }} />
    )
  }
  return (
    <div className="rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ width: 32, height: 32, background: "var(--color-bg-3)", border: "1px solid var(--color-line)", fontFamily: "var(--font-mono)", color: "var(--color-accent)" }}>
      {initials}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const color = status === "Görevde" ? "var(--color-status-on)" : status === "Aktif" ? "var(--color-accent)" : "var(--color-faint)"
  return (
    <span className="flex items-center gap-1.5" style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.14em", textTransform: "uppercase", color }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
      {status}
    </span>
  )
}

function statusColor(s: string) {
  if (s === "Görevde") return "var(--color-status-on)"
  if (s === "Aktif") return "var(--color-accent)"
  if (s === "İzinli") return "oklch(0.72 0.16 230)"
  return "var(--color-faint)"
}

function OfficerModal({ officer, onClose }: { officer: OfficerRow; onClose: () => void }) {
  const seniority = officer.seniority_months ?? 0
  const seniorityText = seniority >= 12
    ? `${Math.floor(seniority / 12)} yıl ${seniority % 12} ay`
    : `${seniority} ay`
  const progress = Math.min(100, Math.max(0, officer.rank_progress ?? 0))

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "oklch(0 0 0 / 0.82)", zIndex: 800, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
      onClick={onClose}
    >
      <div
        style={{ background: "var(--color-bg-2)", border: "1px solid var(--color-line)", width: "100%", maxWidth: 480 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: "1px solid var(--color-line)", background: "var(--color-bg-3)" }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--color-accent)" }}>● Personel Kaydı</span>
          <button onClick={onClose} style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", letterSpacing: "0.1em", color: "var(--color-faint)", border: "1px solid var(--color-line)", padding: "4px 10px", background: "transparent", cursor: "pointer" }}>✕</button>
        </div>

        <div style={{ padding: 24 }}>
          {/* Avatar + identity */}
          <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 20 }}>
            <div style={{ position: "relative", width: 72, height: 72, flexShrink: 0 }}>
              {officer.discord_avatar ? (
                <Image src={officer.discord_avatar} alt={officer.name} fill className="rounded-full" style={{ objectFit: "cover", border: "2px solid #5865F2" }} />
              ) : (
                <div className="rounded-full flex items-center justify-center" style={{ width: 72, height: 72, background: "var(--color-bg-3)", border: "2px solid var(--color-line)", fontFamily: "var(--font-mono)", fontSize: "1.1rem", color: "var(--color-accent)", fontWeight: 700 }}>
                  {officer.name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()}
                </div>
              )}
              <span style={{ position: "absolute", bottom: 2, right: 2, width: 12, height: 12, borderRadius: "50%", background: statusColor(officer.status), border: "2px solid var(--color-bg-2)" }} />
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", fontWeight: 700, textTransform: "uppercase", color: "var(--color-txt)", lineHeight: 1.1 }}>{officer.name}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.12em", color: "var(--color-accent)", marginTop: 4 }}>{officer.badge_no} · {officer.rank}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", letterSpacing: "0.1em", color: "var(--color-faint)", marginTop: 2 }}>{officer.unit}</div>
            </div>
          </div>

          {/* Stats grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
            {[
              { label: "Durum", value: officer.status, color: statusColor(officer.status) },
              { label: "Kıdem", value: seniorityText },
              { label: "Devriye", value: officer.duty_hours ? `${Math.floor((officer.duty_hours ?? 0) / 3600)}s` : "—" },
              { label: "Sonraki Rütbe", value: officer.next_rank || "—" },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ background: "var(--color-bg-3)", border: "1px solid var(--color-line)", padding: "10px 14px" }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.5rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--color-faint)", marginBottom: 4 }}>{label}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", fontWeight: 700, color: color ?? "var(--color-txt)" }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Rank progress */}
          {officer.next_rank && (
            <div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.5rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--color-faint)", marginBottom: 6 }}>
                Rütbe İlerlemesi — {progress}%
              </div>
              <div style={{ height: 4, background: "var(--color-bg-3)", border: "1px solid var(--color-line)", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${progress}%`, background: "var(--color-accent)", transition: "width 0.4s ease" }} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function PersonnelSection() {
  const [officers, setOfficers] = useState<OfficerRow[]>([])
  const [loading, setLoading] = useState(true)
  const [activeUnit, setActiveUnit] = useState<UnitFilter>("TÜM")
  const [search, setSearch] = useState("")
  const [modalOfficer, setModalOfficer] = useState<OfficerRow | null>(null)

  useEffect(() => {
    fetch("/api/officers")
      .then((r) => r.json())
      .then((data) => setOfficers(Array.isArray(data) ? data.sort((a, b) => Number(a.badge_no) - Number(b.badge_no)) : []))
      .finally(() => setLoading(false))
  }, [])

  const filtered = officers.filter((o) => {
    const matchUnit = activeUnit === "TÜM" || o.unit === activeUnit
    const q = search.toLowerCase()
    const matchSearch = !q || o.name.toLowerCase().includes(q) || o.badge_no.toLowerCase().includes(q) || o.rank.toLowerCase().includes(q)
    return matchUnit && matchSearch
  })

  return (
    <section id="personel" className="section-pad" style={{ borderBottom: "1px solid var(--color-line)" }}>
      {modalOfficer && <OfficerModal officer={modalOfficer} onClose={() => setModalOfficer(null)} />}
      <div className="container-max">
        <div className="kicker mb-4">03 / Personel Kadrosu</div>
        <h2 className="mb-8" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", fontWeight: 700, textTransform: "uppercase", color: "var(--color-txt)" }}>
          Trooper Kadrosu
        </h2>

        {loading ? (
          <div className="flex items-center justify-center py-24" style={{ color: "var(--color-faint)", fontFamily: "var(--font-mono)", fontSize: "0.7rem", letterSpacing: "0.16em" }}>YÜKLENİYOR…</div>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex flex-wrap gap-2">
                {UNITS.map((u) => (
                  <button key={u} onClick={() => setActiveUnit(u)} style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", letterSpacing: "0.16em", textTransform: "uppercase", padding: "6px 14px", border: "1px solid", borderColor: activeUnit === u ? "var(--color-accent)" : "var(--color-line)", background: activeUnit === u ? "var(--color-accent)" : "transparent", color: activeUnit === u ? "var(--color-accent-ink)" : "var(--color-muted)", cursor: "pointer" }}>
                    {u === "TÜM" ? "Tümü" : u}
                  </button>
                ))}
              </div>
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rozet kodu, isim veya rütbe ara…" style={{ fontFamily: "var(--font-mono)", fontSize: "0.68rem", letterSpacing: "0.1em", padding: "8px 14px", background: "var(--color-bg-2)", border: "1px solid var(--color-line)", color: "var(--color-txt)", outline: "none", flex: "1", minWidth: 200 }} />
            </div>

            <div style={{ border: "1px solid var(--color-line)", overflow: "hidden" }}>
              <div className="grid" style={{ gridTemplateColumns: "100px 1fr 180px 140px 120px", background: "var(--color-bg-3)", borderBottom: "1px solid var(--color-line)", padding: "10px 16px" }}>
                {["ROZET KOD", "PERSONEL", "RÜTBE", "EMİR KOMUTA", "DURUM"].map((h) => (
                  <span key={h} style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--color-faint)" }}>{h}</span>
                ))}
              </div>

              {filtered.length === 0 ? (
                <div className="py-12 text-center" style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.14em", color: "var(--color-faint)", textTransform: "uppercase" }}>
                  {officers.length === 0 ? "Henüz kayıtlı personel yok" : "Kayıt bulunamadı"}
                </div>
              ) : (
                filtered.map((o, i) => (
                  <div key={o.id} className="grid table-row-hover cursor-pointer" onClick={() => setModalOfficer(o)} style={{ gridTemplateColumns: "100px 1fr 180px 140px 120px", padding: "12px 16px", borderBottom: i < filtered.length - 1 ? "1px solid var(--color-line-soft)" : "none", alignItems: "center" }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.12em", color: "var(--color-accent)" }}>{o.badge_no}</span>
                    <div className="flex items-center gap-3">
                      <OfficerAvatar name={o.name} />
                      <span style={{ fontFamily: "var(--font-body)", fontSize: "0.9rem", color: "var(--color-txt)", fontWeight: 500 }}>{o.name}</span>
                    </div>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", letterSpacing: "0.1em", color: "var(--color-muted)", textTransform: "uppercase" }}>{o.rank}</span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", letterSpacing: "0.14em", color: "var(--color-faint)", textTransform: "uppercase" }}>{o.unit}</span>
                    <StatusBadge status={o.status} />
                  </div>
                ))
              )}
            </div>

            <div className="mt-3 text-right" style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.14em", color: "var(--color-faint)", textTransform: "uppercase" }}>
              {filtered.length} kayıt
            </div>
          </>
        )}
      </div>
    </section>
  )
}
