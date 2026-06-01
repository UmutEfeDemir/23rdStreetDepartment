"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession, signIn, signOut } from "next-auth/react"
import Image from "next/image"
import Link from "next/link"

type AppStatus = "pending" | "interview" | "accepted" | "rejected"
type Tab = "applications" | "officers" | "access"

interface AccessRequest {
  id: string
  discord_id: string
  discord_name: string
  discord_avatar: string
  status: string
  created_at: string
}

interface Application {
  id: string
  full_name: string
  age: number
  discord: string
  character_name: string
  unit: string
  experience: string
  motivation: string
  status: AppStatus
  created_at: string
}

interface OfficerRow {
  id: string
  discord_id: string | null
  badge_no: string
  name: string
  rank: string
  unit: string
  status: string
  is_command: boolean
  duty_hours: number
  seniority_months: number
  rank_progress: number
  next_rank: string | null
}

const LICENSE_TYPES = ["Detective Unit", "Swat Unit", "CCW License", "AR License", "Air License", "HSU License", "Marry License"]
const ROLE_TYPES = ["FTS", "FTO"]
const ALL_LICENSE_TYPES = [...LICENSE_TYPES, ...ROLE_TYPES]

const STATUS_LABELS: Record<AppStatus, string> = { pending: "Beklemede", interview: "Mülakat", accepted: "Kabul", rejected: "Red" }
const STATUS_COLORS: Record<AppStatus, string> = { pending: "var(--color-accent)", interview: "oklch(0.72 0.16 230)", accepted: "var(--color-status-on)", rejected: "var(--color-warn)" }
const UNITS = ["High Command", "Sup. Command", "Supervisor", "Polis"]
const RANKS = ["Captain", "Senior Lieutenant", "Lieutenant", "Senior Sergeant", "Sergeant", "Corporal", "Master Trooper", "Senior Trooper", "Trooper", "Cadet"]
const STATUSES = ["Görevde", "Aktif", "İzinli", "Eğitimde"]

const emptyForm = { discord_id: "", badge_no: "", name: "", rank: "Officer", unit: "HPD", status: "Aktif", seniority_months: 0, rank_progress: 0, next_rank: "", is_command: false }
type OfficerForm = typeof emptyForm

const mono: React.CSSProperties = { fontFamily: "var(--font-mono)", letterSpacing: "0.12em", textTransform: "uppercase" as const }

function OfficerFormFields({ form, setForm }: { form: OfficerForm; setForm: (f: OfficerForm) => void }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {([
        { key: "badge_no", label: "Rozet No", placeholder: "#101" },
        { key: "name", label: "İsim Soyisim", placeholder: "John Doe" },
        { key: "discord_id", label: "Discord ID", placeholder: "123456789012345678" },
        { key: "seniority_months", label: "Kıdem (ay)", placeholder: "0", type: "number" },
        { key: "rank_progress", label: "Rütbe İlerlemesi (%)", placeholder: "0", type: "number" },
        { key: "next_rank", label: "Sonraki Rütbe", placeholder: "Opsiyonel" },
      ] as { key: keyof OfficerForm; label: string; placeholder: string; type?: string }[]).map(({ key, label, placeholder, type }) => (
        <label key={key} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ ...mono, fontSize: "0.55rem", color: "var(--color-faint)" }}>{label}</span>
          <input
            type={type ?? "text"}
            placeholder={placeholder}
            value={form[key] as string}
            onChange={(e) => setForm({ ...form, [key]: type === "number" ? Number(e.target.value) : e.target.value })}
            style={{ background: "var(--color-bg)", border: "1px solid var(--color-line)", color: "var(--color-txt)", padding: "8px 12px", fontFamily: "var(--font-mono)", fontSize: "0.75rem", outline: "none", width: "100%" }}
          />
        </label>
      ))}
      {([
        { key: "rank", label: "Rütbe", options: RANKS },
        { key: "unit", label: "Birim", options: UNITS },
        { key: "status", label: "Durum", options: STATUSES },
      ] as { key: keyof OfficerForm; label: string; options: string[] }[]).map(({ key, label, options }) => (
        <label key={key} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ ...mono, fontSize: "0.55rem", color: "var(--color-faint)" }}>{label}</span>
          <select value={form[key] as string} onChange={(e) => setForm({ ...form, [key]: e.target.value })} style={{ background: "var(--color-bg)", border: "1px solid var(--color-line)", color: "var(--color-txt)", padding: "8px 12px", fontFamily: "var(--font-mono)", fontSize: "0.75rem", outline: "none" }}>
            {options.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </label>
      ))}
      <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <input type="checkbox" checked={form.is_command} onChange={(e) => setForm({ ...form, is_command: e.target.checked })} />
        <span style={{ ...mono, fontSize: "0.6rem", color: "var(--color-muted)" }}>Komuta Kademesi</span>
      </label>
    </div>
  )
}

export default function AdminDashboard() {
  const { data: session } = useSession()
  const [tab, setTab] = useState<Tab>("applications")

  const [apps, setApps] = useState<Application[]>([])
  const [appsLoading, setAppsLoading] = useState(true)
  const [selected, setSelected] = useState<Application | null>(null)
  const [filter, setFilter] = useState<AppStatus | "all">("all")

  const [officers, setOfficers] = useState<OfficerRow[]>([])
  const [officersLoading, setOfficersLoading] = useState(true)
  const [addForm, setAddForm] = useState<OfficerForm>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [editTarget, setEditTarget] = useState<OfficerRow | null>(null)
  const [editForm, setEditForm] = useState<OfficerForm>(emptyForm)
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>([])
  const [accessLoading, setAccessLoading] = useState(true)
  const [editLicenses, setEditLicenses] = useState<string[]>([])
  const [linkingRequest, setLinkingRequest] = useState<AccessRequest | null>(null)
  const [linkOfficerId, setLinkOfficerId] = useState<string>("")
  const [linking, setLinking] = useState(false)

  const router = useRouter()

  useEffect(() => {
    fetch("/api/admin/applications")
      .then((r) => r.json())
      .then((d) => { setApps(Array.isArray(d) ? d : []); setAppsLoading(false) })
      .catch(() => setAppsLoading(false))
    fetch("/api/officers")
      .then((r) => r.json())
      .then((d) => { setOfficers(Array.isArray(d) ? d.sort((a, b) => Number(a.badge_no) - Number(b.badge_no)) : []); setOfficersLoading(false) })
      .catch(() => setOfficersLoading(false))
    fetch("/api/access-request")
      .then((r) => r.json())
      .then((d) => { setAccessRequests(Array.isArray(d) ? d : []); setAccessLoading(false) })
      .catch(() => setAccessLoading(false))
  }, [])

  const updateStatus = async (id: string, status: AppStatus) => {
    await fetch("/api/admin/applications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) })
    setApps((p) => p.map((a) => a.id === id ? { ...a, status } : a))
    if (selected?.id === id) setSelected((s) => s ? { ...s, status } : s)
  }

  const logout = async () => {
    await fetch("/api/admin/login", { method: "DELETE" })
    router.push("/admin/login")
  }

  const addOfficer = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const res = await fetch("/api/officers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(addForm) })
    if (res.ok) { const o = await res.json(); setOfficers((p) => [...p, o]); setAddForm(emptyForm) }
    setSaving(false)
  }

  const deleteOfficer = async (id: string) => {
    if (!confirm("Bu memuru silmek istediğinizden emin misiniz?")) return
    await fetch("/api/officers", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) })
    setOfficers((p) => p.filter((o) => o.id !== id))
    if (editTarget?.id === id) setEditTarget(null)
  }

  const openEdit = async (o: OfficerRow) => {
    const validUnit = UNITS.includes(o.unit) ? o.unit : UNITS[0]
    setEditForm({ discord_id: o.discord_id ?? "", badge_no: o.badge_no, name: o.name, rank: o.rank, unit: validUnit, status: o.status, seniority_months: o.seniority_months, rank_progress: o.rank_progress, next_rank: o.next_rank ?? "", is_command: o.is_command })
    setEditLicenses([])
    setEditTarget(o)
    const res = await fetch(`/api/licenses?officer_id=${o.id}`)
    if (res.ok) {
      const rows = await res.json()
      setEditLicenses(Array.isArray(rows) ? rows.map((r: { license_type: string }) => r.license_type) : [])
    }
  }

  const toggleLicense = async (officerId: string, licenseType: string, checked: boolean) => {
    if (checked) {
      await fetch("/api/licenses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ officer_id: officerId, license_type: licenseType }) })
      setEditLicenses((p) => [...p, licenseType])
    } else {
      await fetch("/api/licenses", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ officer_id: officerId, license_type: licenseType }) })
      setEditLicenses((p) => p.filter((l) => l !== licenseType))
    }
  }

  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editTarget) return
    setSaving(true)
    const res = await fetch("/api/officers", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: editTarget.id, ...editForm }) })
    if (res.ok) {
      const updated = await res.json()
      setOfficers((p) => p.map((o) => o.id === updated.id ? updated : o))
      setEditTarget(null)
    }
    setSaving(false)
  }

  const isLinked = (discordId: string) => officers.some((o) => o.discord_id === discordId)

  const linkToOfficer = async () => {
    if (!linkingRequest || !linkOfficerId) return
    const officer = officers.find((o) => o.id === linkOfficerId)
    if (!officer) return
    setLinking(true)
    const res = await fetch("/api/officers", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: officer.id,
        discord_id: linkingRequest.discord_id,
        badge_no: officer.badge_no,
        name: officer.name,
        rank: officer.rank,
        unit: officer.unit,
        status: officer.status,
        seniority_months: officer.seniority_months,
        rank_progress: officer.rank_progress,
        next_rank: officer.next_rank,
        is_command: officer.is_command,
      }),
    })
    if (res.ok) {
      const updated = await res.json()
      setOfficers((p) => p.map((o) => (o.id === updated.id ? updated : o)))
      setLinkingRequest(null)
      setLinkOfficerId("")
    }
    setLinking(false)
  }

  const filtered = filter === "all" ? apps : apps.filter((a) => a.status === filter)

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)" }}>

      {/* Link to Officer Modal */}
      {linkingRequest && (
        <div style={{ position: "fixed", inset: 0, background: "oklch(0 0 0 / 0.75)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ background: "var(--color-bg-2)", border: "1px solid var(--color-line)", padding: 32, width: "100%", maxWidth: 480 }}>
            <div className="flex justify-between items-center mb-6">
              <span style={{ ...mono, fontSize: "0.65rem", color: "var(--color-accent)" }}>Memura Bağla</span>
              <button onClick={() => { setLinkingRequest(null); setLinkOfficerId("") }} style={{ ...mono, fontSize: "0.6rem", color: "var(--color-faint)", border: "1px solid var(--color-line)", padding: "5px 12px", background: "transparent", cursor: "pointer" }}>✕ Kapat</button>
            </div>
            <div style={{ background: "var(--color-bg-3)", border: "1px solid var(--color-line)", padding: "12px 16px", marginBottom: 20 }}>
              <div style={{ ...mono, fontSize: "0.55rem", color: "var(--color-faint)", marginBottom: 4 }}>Discord Kullanıcısı</div>
              <div style={{ fontFamily: "var(--font-body)", fontSize: "0.9rem", color: "var(--color-txt)", fontWeight: 600 }}>{linkingRequest.discord_name}</div>
              <div style={{ ...mono, fontSize: "0.58rem", color: "var(--color-faint)", marginTop: 2 }}>{linkingRequest.discord_id}</div>
            </div>
            <label style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <span style={{ ...mono, fontSize: "0.58rem", color: "var(--color-faint)" }}>Hangi Memura Bağlansın?</span>
              <select
                value={linkOfficerId}
                onChange={(e) => setLinkOfficerId(e.target.value)}
                style={{ background: "var(--color-bg)", border: "1px solid var(--color-line)", color: "var(--color-txt)", padding: "10px 12px", fontFamily: "var(--font-mono)", fontSize: "0.75rem", outline: "none" }}
              >
                <option value="">— Memur seçin —</option>
                {officers.filter((o) => !o.discord_id).map((o) => (
                  <option key={o.id} value={o.id}>{o.name} ({o.badge_no}) — {o.rank}</option>
                ))}
              </select>
            </label>
            {officers.filter((o) => !o.discord_id).length === 0 && (
              <div style={{ ...mono, fontSize: "0.6rem", color: "var(--color-warn)", marginTop: 10 }}>Tüm memurlar zaten Discord'a bağlı. Önce Personel sekmesinden bağlantısız memur ekleyin.</div>
            )}
            <div className="flex gap-3 mt-6">
              <button onClick={linkToOfficer} disabled={!linkOfficerId || linking} style={{ ...mono, fontSize: "0.65rem", padding: "10px 24px", background: linkOfficerId ? "var(--color-status-on)" : "var(--color-bg-3)", color: linkOfficerId ? "#000" : "var(--color-faint)", border: "none", cursor: linkOfficerId ? "pointer" : "not-allowed", fontWeight: 700 }}>
                {linking ? "Bağlanıyor…" : "Bağla"}
              </button>
              <button onClick={() => { setLinkingRequest(null); setLinkOfficerId("") }} style={{ ...mono, fontSize: "0.65rem", padding: "10px 24px", background: "transparent", color: "var(--color-faint)", border: "1px solid var(--color-line)", cursor: "pointer" }}>İptal</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editTarget && (
        <div style={{ position: "fixed", inset: 0, background: "oklch(0 0 0 / 0.75)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ background: "var(--color-bg-2)", border: "1px solid var(--color-line)", padding: 32, width: "100%", maxWidth: 720, maxHeight: "90vh", overflowY: "auto" }}>
            <div className="flex justify-between items-center mb-6">
              <span style={{ ...mono, fontSize: "0.65rem", color: "var(--color-accent)" }}>Memur Düzenle — {editTarget.name}</span>
              <button onClick={() => setEditTarget(null)} style={{ ...mono, fontSize: "0.6rem", color: "var(--color-faint)", border: "1px solid var(--color-line)", padding: "5px 12px", background: "transparent", cursor: "pointer" }}>✕ Kapat</button>
            </div>
            <form onSubmit={saveEdit}>
              <OfficerFormFields form={editForm} setForm={setEditForm} />

              {/* License management */}
              <div style={{ marginTop: 24, borderTop: "1px solid var(--color-line)", paddingTop: 20 }}>
                <div style={{ ...mono, fontSize: "0.6rem", color: "var(--color-faint)", marginBottom: 14 }}>Lisanslar ve Roller</div>
                <div style={{ marginBottom: 10 }}>
                  <div style={{ ...mono, fontSize: "0.55rem", color: "var(--color-faint)", marginBottom: 8 }}>Lisanslar</div>
                  <div className="flex flex-wrap gap-3">
                    {LICENSE_TYPES.map((lt) => (
                      <label key={lt} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editLicenses.includes(lt)}
                          onChange={(e) => editTarget && toggleLicense(editTarget.id, lt, e.target.checked)}
                        />
                        <span style={{ ...mono, fontSize: "0.6rem", color: editLicenses.includes(lt) ? "var(--color-accent)" : "var(--color-muted)" }}>{lt}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{ ...mono, fontSize: "0.55rem", color: "var(--color-faint)", marginBottom: 8 }}>Roller</div>
                  <div className="flex flex-wrap gap-3">
                    {ROLE_TYPES.map((rt) => (
                      <label key={rt} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editLicenses.includes(rt)}
                          onChange={(e) => editTarget && toggleLicense(editTarget.id, rt, e.target.checked)}
                        />
                        <span style={{ ...mono, fontSize: "0.6rem", color: editLicenses.includes(rt) ? "var(--color-status-on)" : "var(--color-muted)" }}>{rt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button type="submit" disabled={saving} style={{ ...mono, fontSize: "0.65rem", padding: "10px 24px", background: "var(--color-accent)", color: "var(--color-accent-ink)", border: "none", cursor: "pointer", fontWeight: 700 }}>
                  {saving ? "Kaydediliyor…" : "Kaydet"}
                </button>
                <button type="button" onClick={() => deleteOfficer(editTarget.id)} style={{ ...mono, fontSize: "0.65rem", padding: "10px 24px", background: "transparent", color: "var(--color-warn)", border: "1px solid var(--color-warn)", cursor: "pointer" }}>Memuru Sil</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <header style={{ background: "var(--color-bg-2)", borderBottom: "1px solid var(--color-line)", padding: "0 clamp(20px,4vw,48px)", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
        <div className="flex items-center gap-4">
          <Link href="/" style={{ ...mono, fontSize: "0.58rem", color: "var(--color-faint)", border: "1px solid var(--color-line)", padding: "5px 12px", background: "transparent", textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}>
            ← Ana Sayfa
          </Link>
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="Logo" width={36} height={36} className="rounded-full" />
            <div>
              <span style={{ fontFamily: "var(--font-display)", fontSize: "0.9rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-txt)" }}>Admin Paneli</span>
              <span style={{ ...mono, fontSize: "0.55rem", color: "var(--color-accent)", marginLeft: 10 }}>23rd Street Dept.</span>
            </div>
          </div>
        </div>

        {/* Discord profile + logout */}
        <div className="flex items-center gap-4">
          {session?.user ? (
            <div className="flex items-center gap-3">
              {session.user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={session.user.image} alt="Profil" className="rounded-full" style={{ width: 34, height: 34, border: "2px solid var(--color-accent)" }} />
              ) : (
                <div className="rounded-full flex items-center justify-center" style={{ width: 34, height: 34, background: "var(--color-bg-3)", border: "2px solid var(--color-accent)", ...mono, fontSize: "0.7rem", color: "var(--color-accent)" }}>
                  {session.user.name?.[0]?.toUpperCase()}
                </div>
              )}
              <div>
                <div style={{ ...mono, fontSize: "0.6rem", color: "var(--color-txt)" }}>{session.user.name}</div>
                <div style={{ ...mono, fontSize: "0.5rem", color: "var(--color-faint)" }}>Discord ile giriş yapıldı</div>
              </div>
              <button onClick={() => signOut()} style={{ ...mono, fontSize: "0.58rem", color: "var(--color-faint)", border: "1px solid var(--color-line)", padding: "5px 12px", background: "transparent", cursor: "pointer" }}>Çıkış</button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button onClick={() => signIn("discord")} style={{ ...mono, fontSize: "0.6rem", color: "#5865F2", border: "1px solid #5865F2", padding: "6px 14px", background: "transparent", cursor: "pointer" }}>Discord Bağla</button>
              <button onClick={logout} style={{ ...mono, fontSize: "0.62rem", color: "var(--color-faint)", border: "1px solid var(--color-line)", padding: "6px 14px", background: "transparent", cursor: "pointer" }}>Çıkış</button>
            </div>
          )}
        </div>
      </header>

      {/* Tabs */}
      <div style={{ background: "var(--color-bg-2)", borderBottom: "1px solid var(--color-line)", padding: "0 clamp(20px,4vw,48px)", display: "flex", gap: 4 }}>
        {(["applications", "officers", "access"] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{ ...mono, fontSize: "0.62rem", padding: "14px 20px", background: "transparent", border: "none", borderBottom: tab === t ? "2px solid var(--color-accent)" : "2px solid transparent", color: tab === t ? "var(--color-accent)" : "var(--color-faint)", cursor: "pointer" }}>
            {t === "applications" ? `Başvurular (${apps.length})` : t === "officers" ? `Personel (${officers.length})` : `Erişim Talepleri (${accessRequests.filter(r => r.status === "pending").length})`}
          </button>
        ))}
      </div>

      {/* ── Applications tab ── */}
      {tab === "applications" && (
        <div className="flex" style={{ minHeight: "calc(100vh - 108px)" }}>
          <div style={{ width: selected ? "380px" : "100%", maxWidth: selected ? 380 : "none", flexShrink: 0, borderRight: selected ? "1px solid var(--color-line)" : "none", overflowY: "auto" }}>
            <div className="flex gap-1 flex-wrap" style={{ padding: "12px 16px", borderBottom: "1px solid var(--color-line)", background: "var(--color-bg-2)" }}>
              {(["all", "pending", "interview", "accepted", "rejected"] as const).map((f) => (
                <button key={f} onClick={() => setFilter(f)} style={{ ...mono, fontSize: "0.58rem", padding: "5px 10px", border: "1px solid", borderColor: filter === f ? "var(--color-accent)" : "var(--color-line)", background: filter === f ? "var(--color-accent)" : "transparent", color: filter === f ? "var(--color-accent-ink)" : "var(--color-muted)", cursor: "pointer" }}>
                  {f === "all" ? `Tümü (${apps.length})` : `${STATUS_LABELS[f]} (${apps.filter(a => a.status === f).length})`}
                </button>
              ))}
            </div>
            {appsLoading ? (
              <div className="p-8 text-center" style={{ ...mono, fontSize: "0.65rem", color: "var(--color-faint)" }}>YÜKLENİYOR…</div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center" style={{ ...mono, fontSize: "0.65rem", color: "var(--color-faint)" }}>Başvuru bulunamadı</div>
            ) : filtered.map((app) => (
              <div key={app.id} onClick={() => setSelected(selected?.id === app.id ? null : app)} className="cursor-pointer" style={{ padding: "14px 16px", borderBottom: "1px solid var(--color-line-soft)", background: selected?.id === app.id ? "var(--color-bg-3)" : "transparent" }}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div style={{ fontFamily: "var(--font-body)", fontSize: "0.9rem", fontWeight: 600, color: "var(--color-txt)" }}>{app.full_name}</div>
                    <div style={{ ...mono, fontSize: "0.58rem", color: "var(--color-faint)", marginTop: 2 }}>{app.discord} · Karakter {app.unit} yaş · {app.age} yaş</div>
                  </div>
                  <span style={{ ...mono, fontSize: "0.55rem", color: STATUS_COLORS[app.status], border: `1px solid ${STATUS_COLORS[app.status]}`, padding: "3px 8px", whiteSpace: "nowrap" }}>{STATUS_LABELS[app.status]}</span>
                </div>
                <div style={{ ...mono, fontSize: "0.55rem", color: "var(--color-faint)", marginTop: 4 }}>{new Date(app.created_at).toLocaleString("tr-TR")}</div>
              </div>
            ))}
          </div>

          {selected && (
            <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
              <button onClick={() => setSelected(null)} style={{ ...mono, fontSize: "0.6rem", color: "var(--color-faint)", border: "1px solid var(--color-line)", padding: "6px 12px", background: "transparent", cursor: "pointer", marginBottom: 20 }}>← Kapat</button>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", fontWeight: 700, textTransform: "uppercase", color: "var(--color-txt)", marginBottom: 4 }}>{selected.full_name}</div>
              <div style={{ ...mono, fontSize: "0.62rem", color: "var(--color-accent)", marginBottom: 20 }}>{selected.character_name} · Karakter Yaşı: {selected.unit} · {selected.age} yaş</div>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {[{ label: "Discord", value: selected.discord }, { label: "Karakter Yaşı", value: selected.unit }, { label: "Oyuncu Yaşı", value: String(selected.age) }, { label: "Başvuru Tarihi", value: new Date(selected.created_at).toLocaleDateString("tr-TR") }].map((item) => (
                  <div key={item.label} style={{ background: "var(--color-bg-2)", border: "1px solid var(--color-line)", padding: "10px 14px" }}>
                    <div style={{ ...mono, fontSize: "0.55rem", color: "var(--color-faint)", marginBottom: 4 }}>{item.label}</div>
                    <div style={{ fontFamily: "var(--font-body)", fontSize: "0.9rem", color: "var(--color-txt)" }}>{item.value}</div>
                  </div>
                ))}
              </div>
              {[{ label: "RP Tecrübesi", value: selected.experience }, { label: "Motivasyon", value: selected.motivation }].map((s) => (
                <div key={s.label} style={{ marginBottom: 16 }}>
                  <div style={{ ...mono, fontSize: "0.58rem", color: "var(--color-faint)", marginBottom: 8 }}>{s.label}</div>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: "0.9rem", color: "var(--color-muted)", lineHeight: 1.7, background: "var(--color-bg-2)", border: "1px solid var(--color-line)", padding: 14 }}>{s.value}</div>
                </div>
              ))}
              <div>
                <div style={{ ...mono, fontSize: "0.58rem", color: "var(--color-faint)", marginBottom: 10 }}>Durum Güncelle</div>
                <div className="flex flex-wrap gap-2">
                  {(["pending", "interview", "accepted", "rejected"] as AppStatus[]).map((s) => (
                    <button key={s} onClick={() => updateStatus(selected.id, s)} style={{ ...mono, fontSize: "0.62rem", padding: "9px 18px", border: `1px solid ${STATUS_COLORS[s]}`, background: selected.status === s ? STATUS_COLORS[s] : "transparent", color: selected.status === s ? "#fff" : STATUS_COLORS[s], cursor: "pointer", fontWeight: selected.status === s ? 700 : 400 }}>{STATUS_LABELS[s]}</button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Officers tab ── */}
      {tab === "officers" && (
        <div style={{ padding: "24px clamp(20px,4vw,48px)" }}>
          {/* Add form */}
          <div style={{ background: "var(--color-bg-2)", border: "1px solid var(--color-line)", padding: 24, marginBottom: 32 }}>
            <div style={{ ...mono, fontSize: "0.65rem", color: "var(--color-accent)", marginBottom: 20 }}>Yeni Memur Ekle</div>
            <form onSubmit={addOfficer}>
              <OfficerFormFields form={addForm} setForm={setAddForm} />
              <button type="submit" disabled={saving} style={{ ...mono, fontSize: "0.65rem", padding: "10px 24px", background: "var(--color-accent)", color: "var(--color-accent-ink)", border: "none", cursor: saving ? "not-allowed" : "pointer", fontWeight: 700, marginTop: 20 }}>
                {saving ? "Kaydediliyor…" : "Memur Ekle"}
              </button>
            </form>
          </div>

          {/* Officers list */}
          {officersLoading ? (
            <div style={{ ...mono, fontSize: "0.65rem", color: "var(--color-faint)", padding: 32, textAlign: "center" }}>YÜKLENİYOR…</div>
          ) : officers.length === 0 ? (
            <div style={{ ...mono, fontSize: "0.65rem", color: "var(--color-faint)", padding: 32, textAlign: "center" }}>Henüz memur eklenmedi</div>
          ) : (
            <div style={{ border: "1px solid var(--color-line)" }}>
              {/* Table header */}
              <div style={{ display: "grid", gridTemplateColumns: "50px 90px 1fr 160px 80px 80px 100px 60px", background: "var(--color-bg-3)", borderBottom: "1px solid var(--color-line)", padding: "10px 16px", gap: 8 }}>
                {["", "Rozet", "İsim", "Discord ID", "Rütbe", "Birim", "Durum", ""].map((h, i) => (
                  <span key={i} style={{ ...mono, fontSize: "0.55rem", color: "var(--color-faint)" }}>{h}</span>
                ))}
              </div>
              {officers.map((o) => (
                <div key={o.id} style={{ display: "grid", gridTemplateColumns: "50px 90px 1fr 160px 80px 80px 100px 60px", padding: "12px 16px", borderBottom: "1px solid var(--color-line-soft)", alignItems: "center", gap: 8 }}>
                  {/* Discord avatar */}
                  <div>
                    {o.discord_id ? (
                      <div className="rounded-full flex items-center justify-center" style={{ width: 32, height: 32, background: "#5865F2", ...mono, fontSize: "0.55rem", color: "#fff" }}>
                        DC
                      </div>
                    ) : (
                      <div className="rounded-full flex items-center justify-center" style={{ width: 32, height: 32, background: "var(--color-bg-3)", border: "1px solid var(--color-line)", ...mono, fontSize: "0.55rem", color: "var(--color-faint)" }}>
                        —
                      </div>
                    )}
                  </div>
                  <span style={{ ...mono, fontSize: "0.7rem", color: "var(--color-accent)" }}>{o.badge_no}</span>
                  <div>
                    <span style={{ fontFamily: "var(--font-body)", fontSize: "0.9rem", color: "var(--color-txt)", fontWeight: 500 }}>{o.name}</span>
                    {o.is_command && <span style={{ ...mono, fontSize: "0.5rem", color: "var(--color-status-on)", marginLeft: 8 }}>HC</span>}
                  </div>
                  <span style={{ ...mono, fontSize: "0.58rem", color: "var(--color-faint)" }}>{o.discord_id ?? "—"}</span>
                  <span style={{ ...mono, fontSize: "0.58rem", color: "var(--color-muted)" }}>{o.rank}</span>
                  <span style={{ ...mono, fontSize: "0.58rem", color: "var(--color-muted)" }}>{o.unit}</span>
                  <span style={{ ...mono, fontSize: "0.6rem", color: o.status === "Görevde" ? "var(--color-status-on)" : "var(--color-muted)" }}>{o.status}</span>
                  <button onClick={() => openEdit(o)} style={{ ...mono, fontSize: "0.55rem", padding: "5px 10px", border: "1px solid var(--color-accent)", color: "var(--color-accent)", background: "transparent", cursor: "pointer" }}>Düzenle</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Access Requests tab ── */}
      {tab === "access" && (
        <div style={{ padding: "24px clamp(20px,4vw,48px)" }}>
          {accessLoading ? (
            <div style={{ ...mono, fontSize: "0.65rem", color: "var(--color-faint)", padding: 32, textAlign: "center" }}>YÜKLENİYOR…</div>
          ) : accessRequests.length === 0 ? (
            <div style={{ ...mono, fontSize: "0.65rem", color: "var(--color-faint)", padding: 32, textAlign: "center" }}>Bekleyen erişim talebi yok</div>
          ) : (
            <div style={{ border: "1px solid var(--color-line)" }}>
              <div style={{ display: "grid", gridTemplateColumns: "48px 1fr 200px 130px 220px", background: "var(--color-bg-3)", borderBottom: "1px solid var(--color-line)", padding: "10px 16px", gap: 8 }}>
                {["", "Discord", "ID", "Tarih", ""].map((h, i) => (
                  <span key={i} style={{ ...mono, fontSize: "0.55rem", color: "var(--color-faint)" }}>{h}</span>
                ))}
              </div>
              {accessRequests.map((r) => (
                <div key={r.id} style={{ display: "grid", gridTemplateColumns: "48px 1fr 200px 130px 220px", padding: "12px 16px", borderBottom: "1px solid var(--color-line-soft)", alignItems: "center", gap: 8 }}>
                  {r.discord_avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={r.discord_avatar} alt="" className="rounded-full" style={{ width: 36, height: 36 }} />
                  ) : (
                    <div className="rounded-full flex items-center justify-center" style={{ width: 36, height: 36, background: "#5865F2", ...mono, fontSize: "0.6rem", color: "#fff" }}>
                      {r.discord_name?.[0]?.toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div style={{ fontFamily: "var(--font-body)", fontSize: "0.9rem", color: "var(--color-txt)", fontWeight: 500 }}>{r.discord_name}</div>
                    <div style={{ ...mono, fontSize: "0.55rem", color: r.status === "pending" ? "var(--color-accent)" : r.status === "approved" ? "var(--color-status-on)" : "var(--color-warn)", marginTop: 2 }}>
                      {r.status === "pending" ? "● Beklemede" : r.status === "approved" ? "● Onaylandı" : "● Reddedildi"}
                    </div>
                    {r.status === "approved" && isLinked(r.discord_id) && (
                      <div style={{ ...mono, fontSize: "0.5rem", color: "var(--color-status-on)", marginTop: 2 }}>✓ Memura bağlandı</div>
                    )}
                  </div>
                  <span style={{ ...mono, fontSize: "0.58rem", color: "var(--color-faint)" }}>{r.discord_id}</span>
                  <span style={{ ...mono, fontSize: "0.58rem", color: "var(--color-faint)" }}>{new Date(r.created_at).toLocaleDateString("tr-TR")}</span>
                  <div className="flex gap-2 flex-wrap">
                    {r.status === "pending" && (
                      <>
                        <button onClick={async () => {
                          await fetch("/api/access-request", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: r.id, status: "approved" }) })
                          setAccessRequests(p => p.map(x => x.id === r.id ? { ...x, status: "approved" } : x))
                        }} style={{ ...mono, fontSize: "0.55rem", padding: "5px 10px", background: "var(--color-status-on)", color: "#000", border: "none", cursor: "pointer", fontWeight: 700 }}>Onayla</button>
                        <button onClick={async () => {
                          await fetch("/api/access-request", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: r.id, status: "rejected" }) })
                          setAccessRequests(p => p.map(x => x.id === r.id ? { ...x, status: "rejected" } : x))
                        }} style={{ ...mono, fontSize: "0.55rem", padding: "5px 10px", background: "transparent", color: "var(--color-warn)", border: "1px solid var(--color-warn)", cursor: "pointer" }}>Reddet</button>
                      </>
                    )}
                    {r.status === "approved" && !isLinked(r.discord_id) && (
                      <button onClick={() => setLinkingRequest(r)} style={{ ...mono, fontSize: "0.55rem", padding: "5px 10px", background: "var(--color-accent)", color: "var(--color-accent-ink)", border: "none", cursor: "pointer", fontWeight: 700 }}>Memura Bağla</button>
                    )}
                    {r.status !== "pending" && (
                      <button onClick={async () => {
                        await fetch("/api/access-request", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: r.id }) })
                        setAccessRequests(p => p.filter(x => x.id !== r.id))
                      }} style={{ ...mono, fontSize: "0.55rem", padding: "5px 10px", background: "transparent", color: "var(--color-faint)", border: "1px solid var(--color-line)", cursor: "pointer" }}>Sil</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
