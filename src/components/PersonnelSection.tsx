"use client"

import { useState, useEffect } from "react"

type UnitFilter = "TÜM" | "HC" | "Detective" | "HPD" | "CID" | "SWAT" | "TFD" | "K9" | "ASD"

interface OfficerRow {
  id: string
  badge_no: string
  name: string
  rank: string
  unit: string
  status: string
}

const UNITS: UnitFilter[] = ["TÜM", "HC", "Detective", "HPD", "CID", "SWAT", "TFD", "K9", "ASD"]

function Monogram({ name }: { name: string }) {
  const initials = name.split(/[\s.]/).filter(Boolean).map((p) => p[0]).join("").slice(0, 2).toUpperCase()
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

export default function PersonnelSection() {
  const [officers, setOfficers] = useState<OfficerRow[]>([])
  const [loading, setLoading] = useState(true)
  const [activeUnit, setActiveUnit] = useState<UnitFilter>("TÜM")
  const [search, setSearch] = useState("")

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
              <div className="grid" style={{ gridTemplateColumns: "100px 1fr 160px 90px 120px", background: "var(--color-bg-3)", borderBottom: "1px solid var(--color-line)", padding: "10px 16px" }}>
                {["ROZET KOD", "PERSONEL", "RÜTBE", "BİRİM", "DURUM"].map((h) => (
                  <span key={h} style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--color-faint)" }}>{h}</span>
                ))}
              </div>

              {filtered.length === 0 ? (
                <div className="py-12 text-center" style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.14em", color: "var(--color-faint)", textTransform: "uppercase" }}>
                  {officers.length === 0 ? "Henüz kayıtlı personel yok" : "Kayıt bulunamadı"}
                </div>
              ) : (
                filtered.map((o, i) => (
                  <div key={o.id} className="grid table-row-hover cursor-default" style={{ gridTemplateColumns: "100px 1fr 160px 90px 120px", padding: "12px 16px", borderBottom: i < filtered.length - 1 ? "1px solid var(--color-line-soft)" : "none", alignItems: "center" }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.12em", color: "var(--color-accent)" }}>{o.badge_no}</span>
                    <div className="flex items-center gap-3">
                      <Monogram name={o.name} />
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
