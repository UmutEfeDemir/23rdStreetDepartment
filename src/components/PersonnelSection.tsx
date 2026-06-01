"use client"

import { useState, useEffect } from "react"
import { useSession, signIn } from "next-auth/react"

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

function LockedState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-6" style={{ border: "1px solid var(--color-line)", background: "var(--color-bg-2)" }}>
      <div className="w-16 h-16 flex items-center justify-center" style={{ border: "2px solid var(--color-line)", background: "var(--color-bg-3)" }}>
        <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: "var(--color-faint)" }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>
      <div className="text-center">
        <div style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", fontWeight: 600, textTransform: "uppercase", color: "var(--color-txt)", letterSpacing: "0.04em" }}>Erişim Kısıtlı</div>
        <div className="mt-2" style={{ fontFamily: "var(--font-body)", fontSize: "0.9rem", color: "var(--color-muted)" }}>Personel listesini görüntülemek için Discord ile giriş yapın.</div>
      </div>
      <button onClick={() => signIn("discord")} className="btn-clip flex items-center gap-3" style={{ background: "#5865F2", color: "#fff", padding: "12px 28px", fontFamily: "var(--font-mono)", fontSize: "0.7rem", letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: 700, border: "none", cursor: "pointer" }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028 14.09 14.09 0 001.226-1.994.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03z" />
        </svg>
        Discord ile Giriş Yap
      </button>
    </div>
  )
}

export default function PersonnelSection() {
  const { data: session, status } = useSession()
  const [officers, setOfficers] = useState<OfficerRow[]>([])
  const [loading, setLoading] = useState(false)
  const [activeUnit, setActiveUnit] = useState<UnitFilter>("TÜM")
  const [search, setSearch] = useState("")

  useEffect(() => {
    if (!session) return
    setLoading(true)
    fetch("/api/officers")
      .then((r) => r.json())
      .then((data) => setOfficers(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false))
  }, [session])

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

        {status === "loading" || loading ? (
          <div className="flex items-center justify-center py-24" style={{ color: "var(--color-faint)", fontFamily: "var(--font-mono)", fontSize: "0.7rem", letterSpacing: "0.16em" }}>YÜKLENİYOR…</div>
        ) : !session ? (
          <LockedState />
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
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Sicil, isim veya rütbe ara…" style={{ fontFamily: "var(--font-mono)", fontSize: "0.68rem", letterSpacing: "0.1em", padding: "8px 14px", background: "var(--color-bg-2)", border: "1px solid var(--color-line)", color: "var(--color-txt)", outline: "none", flex: "1", minWidth: 200 }} />
            </div>

            <div style={{ border: "1px solid var(--color-line)", overflow: "hidden" }}>
              <div className="grid" style={{ gridTemplateColumns: "80px 1fr 160px 80px 120px", background: "var(--color-bg-3)", borderBottom: "1px solid var(--color-line)", padding: "10px 16px" }}>
                {["SİCİL", "PERSONEL", "RÜTBE", "BİRİM", "DURUM"].map((h) => (
                  <span key={h} style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--color-faint)" }}>{h}</span>
                ))}
              </div>

              {filtered.length === 0 ? (
                <div className="py-12 text-center" style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.14em", color: "var(--color-faint)", textTransform: "uppercase" }}>
                  {officers.length === 0 ? "Henüz kayıtlı personel yok" : "Kayıt bulunamadı"}
                </div>
              ) : (
                filtered.map((o, i) => (
                  <div key={o.id} className="grid table-row-hover cursor-default" style={{ gridTemplateColumns: "80px 1fr 160px 80px 120px", padding: "12px 16px", borderBottom: i < filtered.length - 1 ? "1px solid var(--color-line-soft)" : "none", alignItems: "center" }}>
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
