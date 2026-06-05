"use client"

import { useEffect, useState, useCallback } from "react"
import { useSession, signIn } from "next-auth/react"

interface OfficerRow {
  id: string
  badge_no: string
  name: string
  rank: string
  unit: string
  status: string
  seniority_months: number
  rank_progress: number
  next_rank: string | null
  duty_hours: number
  patrols: number
  commendations: number
  warnings: number
}

interface DutyLog {
  id: string
  clock_in: string
  clock_out: string | null
  duration_minutes: number | null
}

interface Badge {
  license_type: string
  category: string
  color_from: string
  color_to: string | null
}

const CATEGORY_LABELS: Record<string, string> = {
  unit: "🛡️ Birimler",
  license: "📋 Lisanslar",
  certificate: "🎖️ Sertifikalar",
  role: "⭐ Roller",
}
const CATEGORY_ORDER = ["unit", "license", "certificate", "role"]

function StatBox({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col p-4" style={{ background: "var(--color-bg-3)", border: "1px solid var(--color-line)" }}>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", letterSpacing: "0.2em", color: "var(--color-faint)", textTransform: "uppercase", marginBottom: 8 }}>{label}</span>
      <span style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 700, color: "var(--color-accent)", lineHeight: 1 }}>{value}</span>
    </div>
  )
}

function formatDutyTime(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}

function LoginGate() {
  return (
    <div className="flex flex-col items-center justify-center py-28 gap-6" style={{ border: "1px solid var(--color-line)", background: "var(--color-bg-2)" }}>
      <div className="w-16 h-16 flex items-center justify-center" style={{ border: "2px solid var(--color-line)", background: "var(--color-bg-3)" }}>
        <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: "var(--color-faint)" }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </div>
      <div className="text-center">
        <div style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--color-txt)" }}>Personel Girişi</div>
        <div className="mt-2" style={{ fontFamily: "var(--font-body)", fontSize: "0.9rem", color: "var(--color-muted)" }}>Profilinizi görüntülemek ve mesai başlatmak için Discord ile giriş yapın.</div>
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

function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}

function TotalDutyBox({ dutyHours, activeDutyClockIn }: { dutyHours: number; activeDutyClockIn?: string | null }) {
  const [total, setTotal] = useState(dutyHours)
  useEffect(() => {
    if (!activeDutyClockIn) { setTotal(dutyHours); return }
    const update = () => {
      const active = Math.floor((Date.now() - new Date(activeDutyClockIn).getTime()) / 1000)
      setTotal(dutyHours + active)
    }
    update()
    const t = setInterval(update, 1000)
    return () => clearInterval(t)
  }, [dutyHours, activeDutyClockIn])
  return <StatBox label="Toplam Devriye" value={formatDutyTime(total)} />
}

function ElapsedTimer({ clockIn }: { clockIn: string }) {
  const [elapsed, setElapsed] = useState("")
  useEffect(() => {
    const update = () => {
      const diff = Math.floor((Date.now() - new Date(clockIn).getTime()) / 1000)
      const h = Math.floor(diff / 3600)
      const m = Math.floor((diff % 3600) / 60)
      const s = diff % 60
      setElapsed(`${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`)
    }
    update()
    const t = setInterval(update, 1000)
    return () => clearInterval(t)
  }, [clockIn])
  return <span style={{ fontFamily: "var(--font-mono)", fontSize: "1.6rem", fontWeight: 700, color: "var(--color-status-on)", letterSpacing: "0.06em" }}>{elapsed}</span>
}

const LICENSE_TYPES = ["Detective Unit", "Swat Unit", "CCW License", "AR License", "Air License", "HSU License", "Marry License"]
const ROLE_TYPES = ["FTS", "FTO"]

function nameToAvatar(name: string) {
  return `/gallery/${name.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/^-+|-+$/g, "")}.png`
}

function CharacterAvatar({ name, discordImage }: { name: string; discordImage?: string | null }) {
  const [loaded, setLoaded] = useState(false)
  const src = nameToAvatar(name)

  useEffect(() => {
    const img = new window.Image()
    img.onload = () => setLoaded(true)
    img.onerror = () => setLoaded(false)
    img.src = src
  }, [src])

  if (loaded) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={name} className="rounded-full" style={{ width: 60, height: 60, objectFit: "cover", border: "2px solid var(--color-accent)" }} />
    )
  }
  if (discordImage) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={discordImage} alt="Profil" className="rounded-full" style={{ width: 60, height: 60, border: "2px solid var(--color-accent)" }} />
  }
  return (
    <div className="rounded-full flex items-center justify-center" style={{ width: 60, height: 60, background: "var(--color-bg-2)", border: "2px solid var(--color-accent)", fontFamily: "var(--font-display)", fontSize: "1.2rem", color: "var(--color-accent)" }}>
      {name[0]?.toUpperCase() ?? "?"}
    </div>
  )
}

const DEFAULT_PERMS = { duty: true, stats: true, logs: true, badges: true }

export default function PersonnelPanel() {
  const { data: session, status } = useSession()
  const [officer, setOfficer] = useState<OfficerRow | null>(null)
  const [activeDuty, setActiveDuty] = useState<{ id: string; clock_in: string } | null>(null)
  const [logs, setLogs] = useState<DutyLog[]>([])
  const [licenses, setLicenses] = useState<Badge[]>([])
  const [loading, setLoading] = useState(false)
  const [dutyLoading, setDutyLoading] = useState(false)
  const [requestStatus, setRequestStatus] = useState<"idle" | "sending" | "sent" | "exists">("idle")
  const [accessStatus, setAccessStatus] = useState<string | null>(null)
  const [userPermissions, setUserPermissions] = useState<Record<string, boolean>>(DEFAULT_PERMS)

  const fetchDuty = useCallback(async () => {
    setLoading(true)
    const res = await fetch("/api/duty")
    if (res.ok) {
      const data = await res.json()
      setOfficer(data.officer)
      setActiveDuty(data.activeDuty)
      setLogs(data.logs ?? [])
      setLicenses(data.licenses ?? [])
      setAccessStatus(data.accessStatus ?? null)
      if (data.userPermissions) setUserPermissions({ ...DEFAULT_PERMS, ...data.userPermissions })
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (!session) return
    fetchDuty()
    // Discord bot'tan gelen mesai değişikliklerini yakalamak için polling
    const interval = setInterval(fetchDuty, 30_000)
    return () => clearInterval(interval)
  }, [session, fetchDuty])

  const clockIn = async () => {
    setDutyLoading(true)
    const res = await fetch("/api/duty", { method: "POST" })
    if (res.ok) await fetchDuty()
    setDutyLoading(false)
  }

  const clockOut = async () => {
    setDutyLoading(true)
    const res = await fetch("/api/duty", { method: "PATCH" })
    if (res.ok) await fetchDuty()
    setDutyLoading(false)
  }

  const mono: React.CSSProperties = { fontFamily: "var(--font-mono)", letterSpacing: "0.12em", textTransform: "uppercase" as const }

  return (
    <section id="panel" className="section-pad" style={{ background: "var(--color-bg-2)", borderBottom: "1px solid var(--color-line)" }}>
      <div className="container-max">
        <div className="kicker mb-4">04 / Personel Paneli</div>
        <h2 className="mb-8" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", fontWeight: 700, textTransform: "uppercase", color: "var(--color-txt)" }}>
          Memur Profili
        </h2>

        {status === "loading" || loading ? (
          <div className="flex items-center justify-center py-24" style={{ ...mono, fontSize: "0.7rem", color: "var(--color-faint)" }}>YÜKLENİYOR…</div>
        ) : !session ? (
          <LoginGate />
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Profile card */}
            <div className="lg:col-span-1 p-6 flex flex-col gap-5" style={{ background: "var(--color-bg-3)", border: "1px solid var(--color-line)" }}>
              <div className="flex items-center gap-4">
                {officer ? (
                  <CharacterAvatar name={officer.name} discordImage={session.user?.image} />
                ) : session.user?.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={session.user.image} alt="Profil" className="rounded-full" style={{ width: 60, height: 60, border: "2px solid var(--color-accent)" }} />
                ) : (
                  <div className="rounded-full flex items-center justify-center" style={{ width: 60, height: 60, background: "var(--color-bg-2)", border: "2px solid var(--color-accent)", fontFamily: "var(--font-display)", fontSize: "1.2rem", color: "var(--color-accent)" }}>
                    {session.user?.name?.[0]?.toUpperCase() ?? "?"}
                  </div>
                )}
                <div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--color-txt)" }}>
                    {officer?.name ?? session.user?.name ?? "Bilinmiyor"}
                  </div>
                  <div style={{ ...mono, fontSize: "0.6rem", color: "var(--color-accent)", marginTop: 2 }}>{officer?.badge_no ?? "—"}</div>
                </div>
              </div>

              {officer ? (
                <>
                  <div style={{ borderTop: "1px solid var(--color-line)", paddingTop: 16 }}>
                    {[
                      { label: "Rütbe", value: officer.rank },
                      { label: "Birim", value: officer.unit },
                      { label: "Durum", value: officer.status },
                      { label: "Kıdem", value: `${Math.floor(officer.seniority_months / 12)} yıl ${officer.seniority_months % 12} ay` },
                    ].map((item) => (
                      <div key={item.label} className="flex justify-between py-2" style={{ borderBottom: "1px solid var(--color-line-soft)" }}>
                        <span style={{ ...mono, fontSize: "0.6rem", color: "var(--color-faint)" }}>{item.label}</span>
                        <span style={{ ...mono, fontSize: "0.65rem", color: "var(--color-txt)" }}>{item.value}</span>
                      </div>
                    ))}
                  </div>

                  {officer.next_rank && (
                    <div>
                      <div className="flex justify-between mb-2">
                        <span style={{ ...mono, fontSize: "0.58rem", color: "var(--color-faint)" }}>Rütbe İlerlemesi</span>
                        <span style={{ ...mono, fontSize: "0.58rem", color: "var(--color-accent)" }}>{officer.rank_progress}%</span>
                      </div>
                      <div className="h-1 w-full" style={{ background: "var(--color-bg-2)", border: "1px solid var(--color-line)" }}>
                        <div style={{ height: "100%", width: `${officer.rank_progress}%`, background: "var(--color-accent)", transition: "width 1s ease" }} />
                      </div>
                      <div className="mt-1 text-right" style={{ ...mono, fontSize: "0.55rem", color: "var(--color-faint)" }}>Sonraki: {officer.next_rank}</div>
                    </div>
                  )}

                  {/* Mesai butonu */}
                  {userPermissions.duty ? (
                    <div style={{ borderTop: "1px solid var(--color-line)", paddingTop: 16 }}>
                      {activeDuty ? (
                        <div className="flex flex-col items-center gap-3">
                          <div style={{ ...mono, fontSize: "0.58rem", color: "var(--color-status-on)" }}>● Mesai Aktif</div>
                          <ElapsedTimer clockIn={activeDuty.clock_in} />
                          <button onClick={clockOut} disabled={dutyLoading} style={{ ...mono, fontSize: "0.65rem", padding: "10px 24px", background: "var(--color-warn)", color: "var(--color-accent-ink)", border: "none", cursor: "pointer", fontWeight: 700, width: "100%" }}>
                            {dutyLoading ? "…" : "Mesaiden Çık"}
                          </button>
                        </div>
                      ) : (
                        <button onClick={clockIn} disabled={dutyLoading} style={{ ...mono, fontSize: "0.65rem", padding: "10px 24px", background: "var(--color-status-on)", color: "#000", border: "none", cursor: "pointer", fontWeight: 700, width: "100%" }}>
                          {dutyLoading ? "…" : "Mesaiye Gir"}
                        </button>
                      )}
                    </div>
                  ) : (
                    <div style={{ borderTop: "1px solid var(--color-line)", paddingTop: 16 }}>
                      <div style={{ ...mono, fontSize: "0.6rem", color: "var(--color-faint)", textAlign: "center", padding: "10px", border: "1px solid var(--color-line)" }}>
                        Mesai izniniz yok
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="py-4 flex flex-col gap-3">
                  <div style={{ ...mono, fontSize: "0.6rem", color: "var(--color-faint)", textAlign: "center" }}>
                    Discord hesabınız henüz yetkilendirilmedi.
                  </div>
                  {accessStatus === "approved" ? (
                    <div style={{ ...mono, fontSize: "0.6rem", color: "var(--color-status-on)", textAlign: "center", padding: "10px", border: "1px solid var(--color-status-on)" }}>
                      ✓ Erişiminiz onaylandı. Admin profil bağlantısını tamamlıyor.
                    </div>
                  ) : accessStatus === "pending" || requestStatus === "sent" ? (
                    <div style={{ ...mono, fontSize: "0.6rem", color: "var(--color-accent)", textAlign: "center", padding: "10px", border: "1px solid var(--color-accent)" }}>
                      ● Talebiniz inceleniyor. Admin onayını bekleyin.
                    </div>
                  ) : accessStatus === "rejected" ? (
                    <div style={{ ...mono, fontSize: "0.6rem", color: "var(--color-warn)", textAlign: "center", padding: "10px", border: "1px solid var(--color-warn)" }}>
                      Erişim talebiniz reddedildi. Yönetici ile iletişime geçin.
                    </div>
                  ) : requestStatus === "exists" ? (
                    <div style={{ ...mono, fontSize: "0.6rem", color: "var(--color-accent)", textAlign: "center", padding: "10px", border: "1px solid var(--color-line)" }}>
                      Daha önce talep gönderdiniz. Admin onayını bekleyin.
                    </div>
                  ) : (
                    <button
                      onClick={async () => {
                        setRequestStatus("sending")
                        const res = await fetch("/api/access-request", { method: "POST" })
                        const data = await res.json()
                        if (res.ok) setRequestStatus("sent")
                        else if (data.error === "Zaten talep gönderildi") setRequestStatus("exists")
                        else setRequestStatus("idle")
                      }}
                      disabled={requestStatus === "sending"}
                      style={{ ...mono, fontSize: "0.62rem", padding: "10px 20px", background: "var(--color-accent)", color: "var(--color-accent-ink)", border: "none", cursor: "pointer", fontWeight: 700 }}
                    >
                      {requestStatus === "sending" ? "Gönderiliyor…" : "Erişim Talebi Gönder"}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Right side */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              {officer && userPermissions.stats && (() => {
                const validLogs = logs.filter(l => l.duration_minutes != null && l.duration_minutes >= 1800)
                return (
                  <div className="grid grid-cols-3 gap-3">
                    <TotalDutyBox dutyHours={officer.duty_hours} activeDutyClockIn={activeDuty?.clock_in} />
                    <StatBox label="TAMAMLANAN DEVRİYE" value={validLogs.length} />
                    <StatBox label="SON GÖREV" value={validLogs.length > 0 ? new Date(validLogs[0].clock_in).toLocaleDateString("tr-TR") : "—"} />
                  </div>
                )
              })()}

              {/* Badges by category */}
              {officer && userPermissions.badges && licenses.length > 0 && (() => {
                const grouped = licenses.reduce<Record<string, Badge[]>>((acc, b) => {
                  const cat = b.category || "license"
                  if (!acc[cat]) acc[cat] = []
                  acc[cat].push(b)
                  return acc
                }, {})
                const activeCats = CATEGORY_ORDER.filter(c => grouped[c]?.length > 0)
                if (activeCats.length === 0) return null
                return (
                  <div style={{ background: "var(--color-bg-3)", border: "1px solid var(--color-line)" }}>
                    <div className="px-5 py-3" style={{ borderBottom: "1px solid var(--color-line)" }}>
                      <span style={{ ...mono, fontSize: "0.62rem", color: "var(--color-faint)" }}>Rozetler</span>
                    </div>
                    <div className="px-5 py-4 flex flex-col gap-5">
                      {activeCats.map(cat => (
                        <div key={cat}>
                          <div style={{ ...mono, fontSize: "0.5rem", color: "var(--color-faint)", marginBottom: 8, letterSpacing: "0.2em" }}>
                            {CATEGORY_LABELS[cat] ?? cat}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {grouped[cat].map(b => (
                              <span
                                key={b.license_type}
                                style={{
                                  ...mono,
                                  fontSize: "0.58rem",
                                  fontWeight: 700,
                                  padding: "5px 12px",
                                  color: "#fff",
                                  background: b.color_to
                                    ? `linear-gradient(135deg, ${b.color_from}, ${b.color_to})`
                                    : b.color_from,
                                  letterSpacing: "0.12em",
                                  textTransform: "uppercase",
                                  boxShadow: b.color_to ? `0 0 8px ${b.color_to}40` : undefined,
                                }}
                              >
                                {b.license_type}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })()}

              {/* Duty log */}
              {officer && !userPermissions.logs ? null : (
              <div style={{ background: "var(--color-bg-3)", border: "1px solid var(--color-line)" }}>
                <div className="px-5 py-3" style={{ borderBottom: "1px solid var(--color-line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ ...mono, fontSize: "0.62rem", color: "var(--color-faint)" }}>Mesai Geçmişi</span>
                  {logs.length > 0 && <span style={{ ...mono, fontSize: "0.52rem", color: "var(--color-faint)" }}>{logs.length} kayıt</span>}
                </div>
                {logs.length === 0 ? (
                  <div className="py-10 text-center" style={{ ...mono, fontSize: "0.62rem", color: "var(--color-faint)" }}>
                    {officer ? "Henüz tamamlanan mesai yok" : "Kayıtlı profil bulunamadı"}
                  </div>
                ) : (
                  <div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", padding: "8px 20px", borderBottom: "1px solid var(--color-line-soft)" }}>
                      {["Giriş", "Çıkış", "Süre"].map((h) => (
                        <span key={h} style={{ ...mono, fontSize: "0.55rem", color: "var(--color-faint)" }}>{h}</span>
                      ))}
                    </div>
                    {/* First 10 always visible; rest in scrollable overflow */}
                    <div style={{ maxHeight: "calc(10 * 45px)", overflowY: "auto" }}>
                      {logs.map((log) => (
                        <div key={log.id} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", padding: "10px 20px", borderBottom: "1px solid var(--color-line-soft)" }}>
                          <span style={{ ...mono, fontSize: "0.62rem", color: "var(--color-txt)" }}>{new Date(log.clock_in).toLocaleString("tr-TR", { dateStyle: "short", timeStyle: "short" })}</span>
                          <span style={{ ...mono, fontSize: "0.62rem", color: "var(--color-txt)" }}>{log.clock_out ? new Date(log.clock_out).toLocaleString("tr-TR", { dateStyle: "short", timeStyle: "short" }) : "—"}</span>
                          <span style={{ ...mono, fontSize: "0.62rem", color: "var(--color-accent)" }}>{log.duration_minutes != null ? formatDuration(log.duration_minutes) : "—"}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
