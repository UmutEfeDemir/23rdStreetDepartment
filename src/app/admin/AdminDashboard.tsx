"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession, signIn, signOut } from "next-auth/react"
import Image from "next/image"
import Link from "next/link"

type AppStatus = "pending" | "interview" | "accepted" | "rejected"
type Tab = "applications" | "officers" | "access" | "badges" | "announcements" | "ribbon" | "gallery" | "rules" | "accounts" | "archive" | "roles"
type AdminRole = "founder" | "moderator" | "interview"

interface AccessRequest {
  id: string
  discord_id: string
  discord_name: string
  discord_avatar: string
  status: string
  created_at: string
  admin_notes?: string
  user_permissions?: Record<string, boolean>
}

interface Application {
  id: string
  full_name: string
  age: number
  discord: string
  discord_id: string
  character_name: string
  unit: string
  experience: string
  motivation: string
  status: AppStatus
  created_at: string
  rejection_reason: string | null
  rejected_by: string | null
}

interface OfficerRow {
  id: string
  discord_id: string | null
  discord_avatar: string | null
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

interface BadgeType {
  id: number
  name: string
  category: string
  color_from: string
  color_to: string | null
}

const CATEGORY_LABELS: Record<string, string> = {
  unit: "Birimler",
  license: "Lisanslar",
  certificate: "Sertifikalar",
  role: "Roller",
}
const CATEGORY_ORDER = ["unit", "license", "certificate", "role"]

const COLOR_PRESETS = [
  { label: "Gece Mavisi",         from: "#0f172a", to: "#3b82f6" },
  { label: "Altın Ateş",          from: "#78350f", to: "#f59e0b" },
  { label: "Orman Yeşili",        from: "#14532d", to: "#22c55e" },
  { label: "Mor Nebula",          from: "#4c1d95", to: "#a855f7" },
  { label: "Kan Kırmızı",         from: "#7f1d1d", to: "#ef4444" },
  { label: "Buz Mavisi",          from: "#164e63", to: "#22d3ee" },
  { label: "Gümüş",               from: "#374151", to: "#9ca3af" },
  { label: "Gün Batımı",          from: "#7c2d12", to: "#fb923c" },
  { label: "Okyanus",             from: "#0c4a6e", to: "#38bdf8" },
  { label: "Pembe Altın",         from: "#831843", to: "#f472b6" },
  { label: "Zümrüt",              from: "#064e3b", to: "#34d399" },
  { label: "Elektrik Mor",        from: "#2e1065", to: "#c084fc" },
  { label: "Lav",                 from: "#450a0a", to: "#f97316" },
  { label: "Kutup",               from: "#1e3a5f", to: "#67e8f9" },
]

const STATUS_LABELS: Record<AppStatus, string> = { pending: "Beklemede", interview: "Mülakat", accepted: "Kabul", rejected: "Red" }
const STATUS_COLORS: Record<AppStatus, string> = { pending: "var(--color-accent)", interview: "oklch(0.72 0.16 230)", accepted: "var(--color-status-on)", rejected: "var(--color-warn)" }
const UNITS = ["High Command", "Sup. Command", "Supervisor", "Detective Supervisor", "Polis"]
const RANKS = ["Captain", "Senior Lieutenant", "Lieutenant", "Senior Sergeant", "Sergeant", "Corporal", "Master Trooper", "Senior Trooper", "Trooper", "Cadet"]
const STATUSES = ["Görevde", "Aktif", "İzinli", "Eğitimde"]

const emptyForm = { discord_id: "", discord_avatar: "", badge_no: "", name: "", rank: "Officer", unit: "HPD", status: "Aktif", seniority_months: 0, rank_progress: 0, next_rank: "", is_command: false }
type OfficerForm = typeof emptyForm

const mono: React.CSSProperties = { fontFamily: "var(--font-mono)", letterSpacing: "0.12em", textTransform: "uppercase" as const }

function roleGradient(color: string, colorTo?: string | null) {
  return colorTo ? `linear-gradient(135deg, ${color}, ${colorTo})` : color
}

const PERM_OPTIONS = [
  { key: "announce", label: "Duyuru Gönder" },
  { key: "images", label: "Galeri Yönet" },
  { key: "forum", label: "Forum Oku" },
  { key: "accounts", label: "Hesap Oluştur" },
] as const

function OfficerFormFields({ form, setForm }: { form: OfficerForm; setForm: (f: OfficerForm) => void }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {([
        { key: "badge_no", label: "Rozet No", placeholder: "#101" },
        { key: "name", label: "İsim Soyisim", placeholder: "John Doe" },
        { key: "discord_id", label: "Discord ID", placeholder: "123456789012345678" },
        { key: "discord_avatar", label: "Discord Avatar URL", placeholder: "https://cdn.discordapp.com/avatars/…" },
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

interface AdminRoleDbProp {
  id: number; name: string; color: string; color_to?: string | null
  permissions: Record<string, boolean>; is_builtin: boolean; created_at: string
}

function RoleCard({ role: r, onUpdatePermissions, onUpdateColors, onDelete, mono }: {
  role: AdminRoleDbProp
  onUpdatePermissions: (p: Record<string, boolean>) => void
  onUpdateColors: (c: string, ct: string | null) => void
  onDelete: () => void
  mono: React.CSSProperties
}) {
  const [color, setColor] = useState(r.color)
  const [colorTo, setColorTo] = useState(r.color_to ?? r.color)

  const saveColors = () => onUpdateColors(color, colorTo !== color ? colorTo : null)

  return (
    <div style={{ background: "var(--color-bg-2)", borderLeft: `3px solid ${r.color}`, padding: "16px 20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
        <span style={{ fontFamily: "var(--font-body)", fontSize: "0.95rem", fontWeight: 700, background: roleGradient(r.color, r.color_to), WebkitBackgroundClip: r.color_to ? "text" : undefined, WebkitTextFillColor: r.color_to ? "transparent" : undefined, color: r.color_to ? undefined : r.color, flex: 1 }}>
          {r.name}
        </span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", padding: "3px 12px", background: roleGradient(r.color, r.color_to), color: "#fff", fontWeight: 700, letterSpacing: "0.08em" }}>
          {r.name}
        </span>
        {r.is_builtin && (
          <span style={{ ...mono, fontSize: "0.5rem", color: "var(--color-faint)", border: "1px solid var(--color-line)", padding: "2px 7px" }}>Yerleşik</span>
        )}
        {!r.is_builtin && (
          <button onClick={onDelete} style={{ ...mono, fontSize: "0.55rem", padding: "5px 10px", background: "transparent", color: "var(--color-warn)", border: "1px solid var(--color-warn)", cursor: "pointer" }}>Sil</button>
        )}
      </div>

      {!r.is_builtin && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ ...mono, fontSize: "0.5rem", color: "var(--color-faint)", marginBottom: 8, letterSpacing: "0.18em" }}>Renk Geçişi</div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1">
              <input type="color" value={color} onChange={(e) => setColor(e.target.value)} style={{ width: 30, height: 30, border: "1px solid var(--color-line)", background: "transparent", cursor: "pointer", padding: 2 }} />
              <span style={{ ...mono, fontSize: "0.55rem", color: "var(--color-faint)" }}>→</span>
              <input type="color" value={colorTo} onChange={(e) => setColorTo(e.target.value)} style={{ width: 30, height: 30, border: "1px solid var(--color-line)", background: "transparent", cursor: "pointer", padding: 2 }} />
            </div>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", padding: "3px 12px", background: roleGradient(color, colorTo !== color ? colorTo : null), color: "#fff", fontWeight: 700 }}>
              {r.name}
            </span>
            <button onClick={saveColors} style={{ ...mono, fontSize: "0.55rem", padding: "5px 12px", background: "transparent", border: "1px solid var(--color-accent)", color: "var(--color-accent)", cursor: "pointer" }}>
              Rengi Kaydet
            </button>
          </div>
        </div>
      )}

      <div>
        <div style={{ ...mono, fontSize: "0.5rem", color: "var(--color-faint)", marginBottom: 10, letterSpacing: "0.18em" }}>Yetkiler</div>
        <div className="flex gap-4 flex-wrap">
          {PERM_OPTIONS.map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={r.permissions[key] ?? false}
                onChange={(e) => onUpdatePermissions({ ...r.permissions, [key]: e.target.checked })}
              />
              <span style={{ ...mono, fontSize: "0.58rem", color: r.permissions[key] ? r.color : "var(--color-faint)", fontWeight: r.permissions[key] ? 700 : 400 }}>{label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}

function DiscordIdInput({ initialValue, onSave }: { initialValue: string; onSave: (val: string) => void }) {
  const [value, setValue] = useState(initialValue)
  const [saved, setSaved] = useState(false)
  const save = () => { onSave(value.trim()); setSaved(true); setTimeout(() => setSaved(false), 1500) }
  return (
    <div className="flex items-center gap-2" style={{ flex: 1 }}>
      <input
        value={value}
        onChange={(e) => { setValue(e.target.value); setSaved(false) }}
        onKeyDown={(e) => e.key === "Enter" && save()}
        placeholder="Discord User ID (örn. 123456789012345678)"
        style={{ flex: 1, background: "var(--color-bg)", border: "1px solid var(--color-line)", color: "var(--color-txt)", padding: "5px 10px", fontFamily: "var(--font-mono)", fontSize: "0.62rem", outline: "none" }}
      />
      <button onClick={save} style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", letterSpacing: "0.1em", textTransform: "uppercase", padding: "5px 12px", background: "transparent", border: "1px solid var(--color-line)", color: saved ? "var(--color-status-on)" : "var(--color-faint)", cursor: "pointer" }}>
        {saved ? "✓" : "Kaydet"}
      </button>
    </div>
  )
}

function NoteInput({ initialValue, onSave }: { initialValue: string; onSave: (val: string) => void }) {
  const [value, setValue] = useState(initialValue)
  const [saved, setSaved] = useState(false)
  const save = () => { onSave(value); setSaved(true); setTimeout(() => setSaved(false), 1500) }
  return (
    <div className="flex items-center gap-2" style={{ flex: 1 }}>
      <input
        value={value}
        onChange={(e) => { setValue(e.target.value); setSaved(false) }}
        onKeyDown={(e) => e.key === "Enter" && save()}
        placeholder="Admin notu ekle…"
        style={{ flex: 1, background: "var(--color-bg)", border: "1px solid var(--color-line)", color: "var(--color-txt)", padding: "5px 10px", fontFamily: "var(--font-mono)", fontSize: "0.65rem", outline: "none" }}
      />
      <button onClick={save} style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", letterSpacing: "0.1em", textTransform: "uppercase", padding: "5px 12px", background: "transparent", border: "1px solid var(--color-line)", color: saved ? "var(--color-status-on)" : "var(--color-faint)", cursor: "pointer" }}>
        {saved ? "✓" : "Kaydet"}
      </button>
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
  const [linkError, setLinkError] = useState<string>("")
  const [linkIsApproval, setLinkIsApproval] = useState(false)

  const [rejModal, setRejModal] = useState<Application | null>(null)
  const [rejReason, setRejReason] = useState("")
  const [rejBy, setRejBy] = useState("")
  const [rejSaving, setRejSaving] = useState(false)

  const [badgeTypes, setBadgeTypes] = useState<BadgeType[]>([])
  const [newBadgeName, setNewBadgeName] = useState("")
  const [newBadgeCategory, setNewBadgeCategory] = useState("unit")
  const [newBadgePreset, setNewBadgePreset] = useState(0)
  const [badgeSaving, setBadgeSaving] = useState(false)

  interface Announcement { id: number; message: string; type: string; created_at: string }
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [newAnnMsg, setNewAnnMsg] = useState("")
  const [newAnnType, setNewAnnType] = useState<"normal" | "alert">("normal")
  const [annSaving, setAnnSaving] = useState(false)

  interface RibbonMessage { id: number; message: string; type: string; created_at: string }
  const [ribbonMessages, setRibbonMessages] = useState<RibbonMessage[]>([])
  const [newRibbonMsg, setNewRibbonMsg] = useState("")
  const [newRibbonType, setNewRibbonType] = useState<"normal" | "alert">("normal")
  const [ribbonSaving, setRibbonSaving] = useState(false)

  interface GalleryImage { id: number; url: string; caption: string | null; order_num: number; created_at: string }
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([])
  const [newGalleryUrl, setNewGalleryUrl] = useState("")
  const [newGalleryCaption, setNewGalleryCaption] = useState("")
  const [gallerySaving, setGallerySaving] = useState(false)

  interface ArchivedApp {
    id: string; full_name: string; discord: string; status: string; deleted_at: string; created_at: string
  }
  const [archivedApps, setArchivedApps] = useState<ArchivedApp[]>([])
  const [archiveLoading, setArchiveLoading] = useState(false)

  const [rulesContent, setRulesContent] = useState("")
  const [rulesLoaded, setRulesLoaded] = useState(false)
  const [rulesSaving, setRulesSaving] = useState(false)
  const [rulesSaved, setRulesSaved] = useState(false)

  // Role / multi-admin
  const [adminRole, setAdminRole] = useState<AdminRole | null>(null)
  const [adminDisplayName, setAdminDisplayName] = useState("")
  const [adminCustomRoleName, setAdminCustomRoleName] = useState<string | null>(null)
  const [adminCustomRoleColor, setAdminCustomRoleColor] = useState<string | null>(null)
  const [adminCustomRoleColorTo, setAdminCustomRoleColorTo] = useState<string | null>(null)

  interface AdminAccount {
    id: string
    username: string
    role: string
    created_by: string
    created_at: string
    is_active: boolean
    permissions: Record<string, boolean>
    role_id?: number | null
    discord_id?: string | null
  }
  const [accounts, setAccounts] = useState<AdminAccount[]>([])
  const [newAccUsername, setNewAccUsername] = useState("")
  const [newAccPassword, setNewAccPassword] = useState("")
  const [newAccRole, setNewAccRole] = useState<"moderator" | "interview">("moderator")
  const [accSaving, setAccSaving] = useState(false)
  const [accError, setAccError] = useState("")

  interface AdminRoleDb {
    id: number
    name: string
    color: string
    color_to?: string | null
    permissions: Record<string, boolean>
    is_builtin: boolean
    created_at: string
  }
  const [adminRoles, setAdminRoles] = useState<AdminRoleDb[]>([])
  const [newRoleName, setNewRoleName] = useState("")
  const [newRoleColor, setNewRoleColor] = useState("#5865f2")
  const [newRoleColorTo, setNewRoleColorTo] = useState("#a855f7")
  const [newRolePerms, setNewRolePerms] = useState<Record<string, boolean>>({ announce: false, images: false, forum: false, accounts: false })
  const [roleSaving, setRoleSaving] = useState(false)

  const router = useRouter()

  useEffect(() => {
    fetch("/api/admin/me")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        if (d?.role) {
          setAdminRole(d.role as AdminRole)
          if (d.displayName) setAdminDisplayName(d.displayName)
          if (d.customRoleName) setAdminCustomRoleName(d.customRoleName)
          if (d.customRoleColor) setAdminCustomRoleColor(d.customRoleColor)
          if (d.customRoleColorTo) setAdminCustomRoleColorTo(d.customRoleColorTo)
          if (d.role === "interview") setTab("applications")
        }
      })
      .catch(() => {})
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
    fetch("/api/badge-types")
      .then((r) => r.json())
      .then((d) => { setBadgeTypes(Array.isArray(d) ? d : []) })
      .catch(() => {})
    fetch("/api/announcements")
      .then((r) => r.json())
      .then((d) => { setAnnouncements(Array.isArray(d) ? d : []) })
      .catch(() => {})
    fetch("/api/rules")
      .then((r) => r.json())
      .then((d) => { if (d?.content) { setRulesContent(d.content); setRulesLoaded(true) } })
      .catch(() => {})
    fetch("/api/ribbon-messages")
      .then((r) => r.ok ? r.json() : [])
      .then((d) => { setRibbonMessages(Array.isArray(d) ? d : []) })
      .catch(() => {})
    fetch("/api/gallery-images")
      .then((r) => r.ok ? r.json() : [])
      .then((d) => { setGalleryImages(Array.isArray(d) ? d : []) })
      .catch(() => {})
    fetch("/api/admin/accounts")
      .then((r) => r.ok ? r.json() : [])
      .then((d) => { setAccounts(Array.isArray(d) ? d : []) })
      .catch(() => {})
    fetch("/api/admin/roles")
      .then((r) => r.ok ? r.json() : [])
      .then((d) => { setAdminRoles(Array.isArray(d) ? d : []) })
      .catch(() => {})
  }, [])

  const updateStatus = async (id: string, status: AppStatus) => {
    await fetch("/api/admin/applications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) })
    setApps((p) => p.map((a) => a.id === id ? { ...a, status } : a))
    if (selected?.id === id) setSelected((s) => s ? { ...s, status } : s)
  }

  const confirmReject = async () => {
    if (!rejModal) return
    setRejSaving(true)
    await fetch("/api/admin/applications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: rejModal.id, status: "rejected", rejection_reason: rejReason, rejected_by: rejBy }) })
    setApps((p) => p.map((a) => a.id === rejModal.id ? { ...a, status: "rejected" as AppStatus, rejection_reason: rejReason, rejected_by: rejBy } : a))
    if (selected?.id === rejModal.id) setSelected((s) => s ? { ...s, status: "rejected" as AppStatus, rejection_reason: rejReason, rejected_by: rejBy } : s)
    setRejModal(null); setRejReason(""); setRejBy("")
    setRejSaving(false)
  }

  const deleteApplication = async (id: string) => {
    if (!confirm("Bu başvuruyu arşive taşımak istediğinizden emin misiniz?")) return
    await fetch("/api/admin/applications", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) })
    setApps((p) => p.filter((a) => a.id !== id))
    if (selected?.id === id) setSelected(null)
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
    setEditForm({ discord_id: o.discord_id ?? "", discord_avatar: o.discord_avatar ?? "", badge_no: o.badge_no, name: o.name, rank: o.rank, unit: validUnit, status: o.status, seniority_months: o.seniority_months, rank_progress: o.rank_progress, next_rank: o.next_rank ?? "", is_command: o.is_command })
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

  const addBadgeType = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newBadgeName.trim()) return
    setBadgeSaving(true)
    const preset = COLOR_PRESETS[newBadgePreset]
    const res = await fetch("/api/badge-types", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newBadgeName.trim(), category: newBadgeCategory, color_from: preset.from, color_to: preset.to }),
    })
    if (res.ok) {
      const created = await res.json()
      setBadgeTypes(p => [...p, created])
      setNewBadgeName("")
    }
    setBadgeSaving(false)
  }

  const deleteBadgeType = async (id: number) => {
    await fetch("/api/badge-types", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) })
    setBadgeTypes(p => p.filter(b => b.id !== id))
  }

  const addAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newAnnMsg.trim()) return
    setAnnSaving(true)
    const res = await fetch("/api/announcements", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: newAnnMsg.trim(), type: newAnnType }) })
    if (res.ok) { const created = await res.json(); setAnnouncements(p => [created, ...p]); setNewAnnMsg("") }
    setAnnSaving(false)
  }

  const deleteAnnouncement = async (id: number) => {
    await fetch("/api/announcements", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) })
    setAnnouncements(p => p.filter(a => a.id !== id))
  }

  const saveRules = async (e: React.FormEvent) => {
    e.preventDefault()
    setRulesSaving(true)
    setRulesSaved(false)
    const res = await fetch("/api/rules", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content: rulesContent }) })
    if (res.ok) { setRulesSaved(true); setTimeout(() => window.location.reload(), 800) }
    setRulesSaving(false)
  }

  const addRibbonMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newRibbonMsg.trim()) return
    setRibbonSaving(true)
    const res = await fetch("/api/ribbon-messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: newRibbonMsg.trim(), type: newRibbonType }) })
    if (res.ok) { const created = await res.json(); setRibbonMessages(p => [created, ...p]); setNewRibbonMsg("") }
    setRibbonSaving(false)
  }

  const deleteRibbonMessage = async (id: number) => {
    await fetch("/api/ribbon-messages", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) })
    setRibbonMessages(p => p.filter(r => r.id !== id))
  }

  const loadArchive = async () => {
    setArchiveLoading(true)
    const res = await fetch("/api/admin/applications?deleted=1")
    if (res.ok) { const d = await res.json(); setArchivedApps(Array.isArray(d) ? d : []) }
    setArchiveLoading(false)
  }

  const restoreApp = async (id: string) => {
    const res = await fetch("/api/admin/applications", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) })
    if (res.ok) { setArchivedApps(p => p.filter(a => a.id !== id)) }
  }

  const permanentDelete = async (id: string) => {
    if (!confirm("Bu başvuruyu kalıcı olarak silmek istediğinizden emin misiniz?")) return
    await fetch("/api/admin/applications", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, permanent: true }) })
    setArchivedApps(p => p.filter(a => a.id !== id))
  }

  const createAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newAccUsername.trim() || newAccPassword.length < 6) { setAccError("Kullanıcı adı ve en az 6 karakterli şifre gerekli"); return }
    setAccSaving(true); setAccError("")
    const res = await fetch("/api/admin/accounts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username: newAccUsername.trim(), password: newAccPassword, role: newAccRole }) })
    if (res.ok) {
      const created = await res.json()
      setAccounts(p => [...p, created])
      setNewAccUsername(""); setNewAccPassword("")
    } else {
      const d = await res.json().catch(() => ({}))
      setAccError(d.error ?? "Hata oluştu")
    }
    setAccSaving(false)
  }

  const toggleAccount = async (id: string, is_active: boolean) => {
    const res = await fetch("/api/admin/accounts", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, is_active }) })
    if (res.ok) { const updated = await res.json(); setAccounts(p => p.map(a => a.id === id ? updated : a)) }
  }

  const deleteAccount = async (id: string, username: string) => {
    if (!confirm(`"${username}" hesabını silmek istediğinizden emin misiniz?`)) return
    await fetch("/api/admin/accounts", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) })
    setAccounts(p => p.filter(a => a.id !== id))
  }

  const savePermissions = async (id: string, permissions: Record<string, boolean>) => {
    const res = await fetch("/api/admin/accounts", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, permissions }) })
    if (res.ok) { const updated = await res.json(); setAccounts(p => p.map(a => a.id === id ? updated : a)) }
  }

  const saveAccessNote = async (id: string, notes: string) => {
    await fetch("/api/access-request", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, admin_notes: notes }) })
    setAccessRequests(p => p.map(r => r.id === id ? { ...r, admin_notes: notes } : r))
  }

  const saveUserPermissions = async (id: string, user_permissions: Record<string, boolean>) => {
    await fetch("/api/access-request", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, user_permissions }) })
    setAccessRequests(p => p.map(r => r.id === id ? { ...r, user_permissions } : r))
  }

  const cleanupArchive = async () => {
    if (!confirm("15 günden eski tüm arşiv kayıtları kalıcı olarak silinecek. Devam?")) return
    const res = await fetch("/api/admin/applications", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ cleanup: true }) })
    if (res.ok) {
      const d = await res.json()
      alert(`${d.deleted ?? 0} kayıt silindi.`)
      await loadArchive()
    }
  }

  const resetDutyHours = async (officerId: string, officerName: string) => {
    if (!confirm(`${officerName} için toplam devriye saatini sıfırlamak istediğinizden emin misiniz?`)) return
    const res = await fetch("/api/officers", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: officerId, reset_duty_hours: true }) })
    if (res.ok) {
      const updated = await res.json()
      setOfficers(p => p.map(o => o.id === updated.id ? updated : o))
    }
  }

  const createRole = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newRoleName.trim()) return
    setRoleSaving(true)
    const res = await fetch("/api/admin/roles", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: newRoleName.trim(), color: newRoleColor, color_to: newRoleColorTo || null, permissions: newRolePerms }) })
    if (res.ok) {
      const created = await res.json()
      setAdminRoles(p => [...p, created])
      setNewRoleName("")
      setNewRoleColor("#5865f2")
      setNewRoleColorTo("#a855f7")
      setNewRolePerms({ announce: false, images: false, forum: false, accounts: false })
    }
    setRoleSaving(false)
  }

  const updateRolePermissions = async (id: number, permissions: Record<string, boolean>) => {
    const res = await fetch("/api/admin/roles", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, permissions }) })
    if (res.ok) { const updated = await res.json(); setAdminRoles(p => p.map(r => r.id === id ? updated : r)) }
  }

  const updateRoleColors = async (id: number, color: string, color_to: string | null) => {
    const res = await fetch("/api/admin/roles", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, color, color_to }) })
    if (res.ok) { const updated = await res.json(); setAdminRoles(p => p.map(r => r.id === id ? updated : r)) }
  }

  const deleteRole = async (id: number, name: string) => {
    if (!confirm(`"${name}" rolünü silmek istediğinizden emin misiniz? Bu role atanmış hesaplar varsayılan rollerine dönecektir.`)) return
    const res = await fetch("/api/admin/roles", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) })
    if (res.ok) {
      setAdminRoles(p => p.filter(r => r.id !== id))
      setAccounts(p => p.map(a => a.role_id === id ? { ...a, role_id: null } : a))
    }
  }

  const assignRole = async (accountId: string, roleId: number | null) => {
    const res = await fetch("/api/admin/accounts", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: accountId, role_id: roleId }) })
    if (res.ok) { const updated = await res.json(); setAccounts(p => p.map(a => a.id === accountId ? updated : a)) }
  }

  const isLinked = (discordId: string) => officers.some((o) => o.discord_id === discordId)

  const openLinkModal = (r: AccessRequest, isApproval: boolean) => {
    setLinkingRequest(r)
    setLinkIsApproval(isApproval)
    setLinkOfficerId("")
    setLinkError("")
  }

  const closeLinkModal = () => {
    setLinkingRequest(null)
    setLinkOfficerId("")
    setLinkError("")
    setLinkIsApproval(false)
  }

  const linkToOfficer = async () => {
    if (!linkingRequest || !linkOfficerId) return
    const officer = officers.find((o) => o.id === linkOfficerId)
    if (!officer) return
    setLinking(true)
    setLinkError("")

    if (linkIsApproval) {
      const approveRes = await fetch("/api/access-request", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: linkingRequest.id, status: "approved" }),
      })
      if (!approveRes.ok) {
        setLinkError("Onaylama başarısız oldu. Yönetici oturumunu kontrol edin.")
        setLinking(false)
        return
      }
      setAccessRequests((p) => p.map((x) => x.id === linkingRequest.id ? { ...x, status: "approved" } : x))
    }

    const res = await fetch("/api/officers", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: officer.id,
        discord_id: linkingRequest.discord_id,
        discord_avatar: linkingRequest.discord_avatar || null,
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
      closeLinkModal()
    } else {
      const errData = await res.json().catch(() => ({}))
      setLinkError(errData.error ?? "Bağlama başarısız. Yönetici oturumunu kontrol edin ve tekrar deneyin.")
    }
    setLinking(false)
  }

  const filtered = filter === "all" ? apps : apps.filter((a) => a.status === filter)

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)" }}>

      {/* Rejection Modal */}
      {rejModal && (
        <div style={{ position: "fixed", inset: 0, background: "oklch(0 0 0 / 0.75)", zIndex: 400, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ background: "var(--color-bg-2)", border: "1px solid var(--color-warn)", width: "100%", maxWidth: 480 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", borderBottom: "1px solid var(--color-line)", background: "var(--color-bg-3)" }}>
              <span style={{ ...mono, fontSize: "0.62rem", color: "var(--color-warn)" }}>● Başvuruyu Reddet — {rejModal.full_name}</span>
              <button onClick={() => { setRejModal(null); setRejReason(""); setRejBy("") }} style={{ ...mono, fontSize: "0.58rem", color: "var(--color-faint)", border: "1px solid var(--color-line)", padding: "4px 10px", background: "transparent", cursor: "pointer" }}>✕</button>
            </div>
            <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
              <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span style={{ ...mono, fontSize: "0.55rem", color: "var(--color-faint)" }}>Red Sebebi</span>
                <textarea value={rejReason} onChange={(e) => setRejReason(e.target.value)} rows={3} placeholder="Neden reddedildiğini açıklayın..." style={{ background: "var(--color-bg)", border: "1px solid var(--color-line)", color: "var(--color-txt)", padding: "8px 12px", fontFamily: "var(--font-mono)", fontSize: "0.72rem", outline: "none", resize: "vertical", width: "100%" }} />
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span style={{ ...mono, fontSize: "0.55rem", color: "var(--color-faint)" }}>Reddeden (İsim veya Rütbe)</span>
                <input value={rejBy} onChange={(e) => setRejBy(e.target.value)} placeholder="örn. Captain Richye Smoke" style={{ background: "var(--color-bg)", border: "1px solid var(--color-line)", color: "var(--color-txt)", padding: "8px 12px", fontFamily: "var(--font-mono)", fontSize: "0.72rem", outline: "none", width: "100%" }} />
              </label>
              <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                <button onClick={confirmReject} disabled={rejSaving || !rejReason.trim()} style={{ ...mono, fontSize: "0.62rem", padding: "10px 22px", background: rejReason.trim() && !rejSaving ? "var(--color-warn)" : "var(--color-bg-3)", color: rejReason.trim() && !rejSaving ? "#fff" : "var(--color-faint)", border: "none", cursor: rejReason.trim() ? "pointer" : "not-allowed", fontWeight: 700, flex: 1 }}>
                  {rejSaving ? "İşleniyor…" : "Onayla ve Reddet"}
                </button>
                <button onClick={() => { setRejModal(null); setRejReason(""); setRejBy("") }} style={{ ...mono, fontSize: "0.62rem", padding: "10px 18px", background: "transparent", color: "var(--color-faint)", border: "1px solid var(--color-line)", cursor: "pointer" }}>İptal</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Link to Officer Modal */}
      {linkingRequest && (() => {
        const currentlyLinked = officers.find(o => o.discord_id === linkingRequest.discord_id)
        const selectedOfficer = officers.find(o => o.id === linkOfficerId)
        const selectedHasOtherLink = selectedOfficer?.discord_id && selectedOfficer.discord_id !== linkingRequest.discord_id
        const unlinkedOfficers = officers.filter(o => !o.discord_id)
        const otherLinkedOfficers = officers.filter(o => o.discord_id && o.discord_id !== linkingRequest.discord_id)
        return (
          <div style={{ position: "fixed", inset: 0, background: "oklch(0 0 0 / 0.75)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
            <div style={{ background: "var(--color-bg-2)", border: "1px solid var(--color-line)", width: "100%", maxWidth: 520 }}>
              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", borderBottom: "1px solid var(--color-line)", background: "var(--color-bg-3)" }}>
                <span style={{ ...mono, fontSize: "0.62rem", color: "var(--color-accent)" }}>
                  {linkIsApproval ? "● Onayla ve Memura Bağla" : currentlyLinked ? "● Bağlantıyı Güncelle" : "● Memura Bağla"}
                </span>
                <button onClick={closeLinkModal} style={{ ...mono, fontSize: "0.58rem", color: "var(--color-faint)", border: "1px solid var(--color-line)", padding: "4px 10px", background: "transparent", cursor: "pointer" }}>✕</button>
              </div>

              <div style={{ padding: "20px 24px" }}>
                {/* Discord user info */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "var(--color-bg-3)", border: "1px solid var(--color-line)", marginBottom: 16 }}>
                  {linkingRequest.discord_avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={linkingRequest.discord_avatar} alt="" className="rounded-full" style={{ width: 40, height: 40, flexShrink: 0 }} />
                  ) : (
                    <div className="rounded-full flex items-center justify-center" style={{ width: 40, height: 40, background: "#5865F2", ...mono, fontSize: "0.65rem", color: "#fff", flexShrink: 0 }}>
                      {linkingRequest.discord_name?.[0]?.toUpperCase()}
                    </div>
                  )}
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontFamily: "var(--font-body)", fontSize: "0.95rem", fontWeight: 600, color: "var(--color-txt)" }}>{linkingRequest.discord_name}</div>
                    <div style={{ ...mono, fontSize: "0.52rem", color: "var(--color-faint)", marginTop: 2 }}>ID: {linkingRequest.discord_id}</div>
                  </div>
                </div>

                {/* Currently linked officer notice */}
                {currentlyLinked && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "oklch(0.25 0.08 145 / 0.3)", border: "1px solid var(--color-status-on)", marginBottom: 16 }}>
                    <span style={{ color: "var(--color-status-on)", fontSize: "0.8rem" }}>✓</span>
                    <div>
                      <span style={{ ...mono, fontSize: "0.55rem", color: "var(--color-status-on)" }}>Mevcut bağlantı: </span>
                      <span style={{ ...mono, fontSize: "0.6rem", color: "var(--color-txt)", fontWeight: 700 }}>{currentlyLinked.name} ({currentlyLinked.badge_no})</span>
                    </div>
                  </div>
                )}

                {/* Officer select */}
                <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <span style={{ ...mono, fontSize: "0.55rem", color: "var(--color-faint)" }}>Hangi Memura Bağlansın?</span>
                  <select
                    value={linkOfficerId}
                    onChange={(e) => setLinkOfficerId(e.target.value)}
                    style={{ background: "var(--color-bg)", border: "1px solid var(--color-line)", color: "var(--color-txt)", padding: "10px 12px", fontFamily: "var(--font-mono)", fontSize: "0.72rem", outline: "none", width: "100%" }}
                  >
                    <option value="">— Memur seçin —</option>
                    {unlinkedOfficers.length > 0 && (
                      <optgroup label="Bağlantısız Memurlar">
                        {unlinkedOfficers.map(o => (
                          <option key={o.id} value={o.id}>{o.name} ({o.badge_no}) — {o.rank}</option>
                        ))}
                      </optgroup>
                    )}
                    {currentlyLinked && (
                      <optgroup label="Zaten Bu Hesaba Bağlı">
                        <option value={currentlyLinked.id}>{currentlyLinked.name} ({currentlyLinked.badge_no}) — {currentlyLinked.rank} ✓</option>
                      </optgroup>
                    )}
                    {otherLinkedOfficers.length > 0 && (
                      <optgroup label="Başka Hesaba Bağlı (dikkat)">
                        {otherLinkedOfficers.map(o => (
                          <option key={o.id} value={o.id}>{o.name} ({o.badge_no}) — {o.rank}</option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                </label>

                {/* Warnings */}
                {selectedHasOtherLink && (
                  <div style={{ ...mono, fontSize: "0.57rem", color: "var(--color-warn)", marginTop: 10, padding: "8px 12px", border: "1px solid var(--color-warn)", background: "oklch(0.2 0.08 30 / 0.3)" }}>
                    ⚠ Bu memurun mevcut Discord bağlantısı silinecek.
                  </div>
                )}
                {linkError && (
                  <div style={{ ...mono, fontSize: "0.57rem", color: "var(--color-warn)", marginTop: 10, padding: "8px 12px", border: "1px solid var(--color-warn)", background: "oklch(0.2 0.08 30 / 0.3)" }}>
                    ✕ {linkError}
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                  <button
                    onClick={linkToOfficer}
                    disabled={!linkOfficerId || linking}
                    style={{ ...mono, fontSize: "0.62rem", padding: "10px 22px", background: linkOfficerId && !linking ? "var(--color-status-on)" : "var(--color-bg-3)", color: linkOfficerId && !linking ? "#000" : "var(--color-faint)", border: "none", cursor: linkOfficerId ? "pointer" : "not-allowed", fontWeight: 700, flex: 1 }}
                  >
                    {linking ? "İşleniyor…" : linkIsApproval ? "Onayla ve Bağla" : "Bağla"}
                  </button>
                  <button
                    onClick={closeLinkModal}
                    style={{ ...mono, fontSize: "0.62rem", padding: "10px 18px", background: "transparent", color: "var(--color-faint)", border: "1px solid var(--color-line)", cursor: "pointer" }}
                  >
                    İptal
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      })()}

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

              {/* Badge management — dynamic from badge_types */}
              <div style={{ marginTop: 24, borderTop: "1px solid var(--color-line)", paddingTop: 20 }}>
                <div style={{ ...mono, fontSize: "0.6rem", color: "var(--color-faint)", marginBottom: 14 }}>Rozetler</div>
                {CATEGORY_ORDER.map(cat => {
                  const catBadges = badgeTypes.filter(b => b.category === cat)
                  if (catBadges.length === 0) return null
                  return (
                    <div key={cat} style={{ marginBottom: 14 }}>
                      <div style={{ ...mono, fontSize: "0.52rem", color: "var(--color-faint)", marginBottom: 8, letterSpacing: "0.2em" }}>{CATEGORY_LABELS[cat]}</div>
                      <div className="flex flex-wrap gap-3">
                        {catBadges.map((bt) => {
                          const checked = editLicenses.includes(bt.name)
                          return (
                            <label key={bt.id} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={(e) => editTarget && toggleLicense(editTarget.id, bt.name, e.target.checked)}
                              />
                              <span style={{
                                ...mono,
                                fontSize: "0.58rem",
                                fontWeight: checked ? 700 : 400,
                                padding: checked ? "3px 10px" : undefined,
                                background: checked && bt.color_to
                                  ? `linear-gradient(135deg, ${bt.color_from}, ${bt.color_to})`
                                  : checked ? bt.color_from : undefined,
                                color: checked ? "#fff" : "var(--color-muted)",
                                transition: "all 0.15s",
                              }}>
                                {bt.name}
                              </span>
                            </label>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
                {badgeTypes.length === 0 && (
                  <div style={{ ...mono, fontSize: "0.6rem", color: "var(--color-faint)" }}>Rozet tanımı yok. Rozetler sekmesinden ekleyin.</div>
                )}
              </div>

              <div className="flex gap-3 mt-6 flex-wrap">
                <button type="submit" disabled={saving} style={{ ...mono, fontSize: "0.65rem", padding: "10px 24px", background: "var(--color-accent)", color: "var(--color-accent-ink)", border: "none", cursor: "pointer", fontWeight: 700 }}>
                  {saving ? "Kaydediliyor…" : "Kaydet"}
                </button>
                <button type="button" onClick={() => resetDutyHours(editTarget.id, editTarget.name)} style={{ ...mono, fontSize: "0.65rem", padding: "10px 24px", background: "transparent", color: "oklch(0.72 0.16 230)", border: "1px solid oklch(0.72 0.16 230)", cursor: "pointer" }}>⟲ Devriye Saatini Sıfırla</button>
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

        {/* Discord profile + role + logout */}
        <div className="flex items-center gap-4">
          {adminRole && (() => {
            const label = adminRole === "founder"
              ? "● Developer"
              : adminCustomRoleName
                ? `● ${adminCustomRoleName}`
                : adminRole === "moderator" ? "● Moderatör" : "● Mülakat"
            const isFounderRole = adminRole === "founder"
            const hasGradient = !isFounderRole && adminCustomRoleColor && adminCustomRoleColorTo
            const bg = isFounderRole
              ? "linear-gradient(135deg, #94a3b8, #f8fafc)"
              : hasGradient
                ? `linear-gradient(135deg, ${adminCustomRoleColor}, ${adminCustomRoleColorTo})`
                : "transparent"
            const borderColor = isFounderRole
              ? "#94a3b8"
              : adminCustomRoleColor ?? (adminRole === "moderator" ? "oklch(0.72 0.16 230)" : "var(--color-status-on)")
            const textColor = isFounderRole
              ? "#0f172a"
              : hasGradient
                ? "#fff"
                : adminCustomRoleColor ?? (adminRole === "moderator" ? "oklch(0.72 0.16 230)" : "var(--color-status-on)")
            return (
              <span style={{ ...mono, fontSize: "0.52rem", padding: "4px 10px", border: `1px solid ${borderColor}`, color: textColor, background: bg }}>
                {label}
              </span>
            )
          })()}
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

      {/* Tabs — filtered by role */}
      <div style={{ background: "var(--color-bg-2)", borderBottom: "1px solid var(--color-line)", padding: "0 clamp(20px,4vw,48px)", display: "flex", gap: 4, overflowX: "auto" }}>
        {(["applications", "officers", "access", "badges", "announcements", "ribbon", "gallery", "archive", "rules", "accounts", "roles"] as Tab[])
          .filter((t) => {
            if (adminRole === "interview") return t === "applications"
            if (adminRole === "moderator") return ["applications", "access", "badges", "announcements", "ribbon", "gallery", "archive", "rules"].includes(t)
            return true // founder sees all
          })
          .map((t) => (
            <button key={t} onClick={() => { setTab(t); if (t === "archive") loadArchive() }} style={{ ...mono, fontSize: "0.62rem", padding: "14px 20px", background: "transparent", border: "none", borderBottom: tab === t ? "2px solid var(--color-accent)" : "2px solid transparent", color: tab === t ? "var(--color-accent)" : "var(--color-faint)", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>
              {t === "applications" ? `Başvurular (${apps.length})` : t === "officers" ? `Personel (${officers.length})` : t === "access" ? `Erişim (${accessRequests.filter(r => r.status === "pending").length})` : t === "badges" ? `Rozetler (${badgeTypes.length})` : t === "announcements" ? `Duyurular (${announcements.length})` : t === "ribbon" ? `Kayan Mesajlar (${ribbonMessages.length})` : t === "gallery" ? `Galeri (${galleryImages.length})` : t === "archive" ? `Arşiv (${archivedApps.length})` : t === "rules" ? `Kurallar` : t === "accounts" ? `Hesaplar (${accounts.length})` : `Roller (${adminRoles.length})`}
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
                {[{ label: "Discord", value: selected.discord }, { label: "Discord ID", value: selected.discord_id || "—" }, { label: "Karakter Yaşı", value: selected.unit }, { label: "Oyuncu Yaşı", value: String(selected.age) }, { label: "Başvuru Tarihi", value: new Date(selected.created_at).toLocaleDateString("tr-TR") }].map((item) => (
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
                  {(["pending", "interview"] as AppStatus[]).map((s) => (
                    <button key={s} onClick={() => updateStatus(selected.id, s)} style={{ ...mono, fontSize: "0.62rem", padding: "9px 18px", border: `1px solid ${STATUS_COLORS[s]}`, background: selected.status === s ? STATUS_COLORS[s] : "transparent", color: selected.status === s ? "#fff" : STATUS_COLORS[s], cursor: "pointer", fontWeight: selected.status === s ? 700 : 400 }}>{STATUS_LABELS[s]}</button>
                  ))}
                  <button onClick={() => { setRejModal(selected); setRejBy(adminDisplayName) }} style={{ ...mono, fontSize: "0.62rem", padding: "9px 18px", border: "1px solid #ef4444", background: selected.status === "rejected" ? "#ef4444" : "transparent", color: selected.status === "rejected" ? "#fff" : "#ef4444", cursor: "pointer", fontWeight: selected.status === "rejected" ? 700 : 400 }}>Red</button>
                  {adminRole !== "interview" && (
                    <button onClick={() => deleteApplication(selected.id)} style={{ ...mono, fontSize: "0.62rem", padding: "9px 18px", border: "1px solid var(--color-line)", background: "transparent", color: "var(--color-faint)", cursor: "pointer" }}>Sil</button>
                  )}
                </div>
              </div>

              {selected.status === "rejected" && (selected.rejection_reason || selected.rejected_by) && (
                <div style={{ background: "oklch(0.18 0.06 30 / 0.4)", border: "1px solid #ef4444", padding: "12px 16px", marginTop: 8 }}>
                  <div style={{ ...mono, fontSize: "0.55rem", color: "#ef4444", marginBottom: 6 }}>Red Bilgisi</div>
                  {selected.rejection_reason && <div style={{ fontFamily: "var(--font-body)", fontSize: "0.88rem", color: "var(--color-muted)", marginBottom: 4 }}><strong style={{ color: "var(--color-faint)", fontFamily: "var(--font-mono)", fontSize: "0.55rem" }}>SEBEP: </strong>{selected.rejection_reason}</div>}
                  {selected.rejected_by && <div style={{ ...mono, fontSize: "0.6rem", color: "var(--color-faint)" }}>Reddeden: {selected.rejected_by}</div>}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Officers tab ── */}
      {tab === "officers" && (
        <div style={{ padding: "24px clamp(20px,4vw,48px)" }}>
          {/* Avatar sync */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
            <button
              onClick={async () => {
                const res = await fetch("/api/admin/sync-avatars", { method: "POST" })
                if (res.ok) {
                  const d = await res.json()
                  alert(`${d.updated} memur güncellendi, ${d.failed} başarısız (toplam ${d.total})`)
                  const r2 = await fetch("/api/officers")
                  if (r2.ok) { const d2 = await r2.json(); setOfficers(Array.isArray(d2) ? d2.sort((a, b) => Number(a.badge_no) - Number(b.badge_no)) : []) }
                }
              }}
              style={{ ...mono, fontSize: "0.58rem", padding: "7px 16px", background: "transparent", color: "oklch(0.72 0.16 230)", border: "1px solid oklch(0.72 0.16 230)", cursor: "pointer" }}
            >
              ↺ Discord Avatarlarını Senkronize Et
            </button>
          </div>
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
                      o.discord_avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={o.discord_avatar} alt="" className="rounded-full" style={{ width: 32, height: 32, border: "2px solid #5865F2" }} title={o.discord_id} />
                      ) : (
                        <div className="rounded-full flex items-center justify-center" style={{ width: 32, height: 32, background: "#5865F2", ...mono, fontSize: "0.55rem", color: "#fff" }} title={o.discord_id}>
                          DC
                        </div>
                      )
                    ) : (
                      <div className="rounded-full flex items-center justify-center" style={{ width: 32, height: 32, background: "var(--color-bg-3)", border: "1px solid var(--color-line)", ...mono, fontSize: "0.55rem", color: "var(--color-faint)" }}>
                        —
                      </div>
                    )}
                  </div>
                  <span style={{ ...mono, fontSize: "0.7rem", color: "var(--color-accent)" }}>{o.badge_no}</span>
                  <div>
                    <span style={{ fontFamily: "var(--font-body)", fontSize: "0.9rem", color: "var(--color-txt)", fontWeight: 500 }}>{o.name}</span>
                    {o.is_command && <span style={{ ...mono, fontSize: "0.5rem", color: "var(--color-status-on)", marginLeft: 8 }}>High Command</span>}
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

      {/* ── Rules tab ── */}
      {tab === "rules" && (
        <div style={{ padding: "24px clamp(20px,4vw,48px)", maxWidth: 860 }}>
          <div style={{ background: "var(--color-bg-2)", border: "1px solid var(--color-line)", padding: 24 }}>
            <div style={{ ...mono, fontSize: "0.65rem", color: "var(--color-accent)", marginBottom: 8 }}>Teşkilat Kuralları</div>
            <div style={{ ...mono, fontSize: "0.55rem", color: "var(--color-faint)", marginBottom: 20 }}>
              Her satır bir kural. Başvuru formunun son adımında otomatik olarak gösterilir. Kayıt sonrası sayfa yenilenir.
            </div>
            <form onSubmit={saveRules}>
              <textarea
                value={rulesLoaded ? rulesContent : "Yükleniyor…"}
                onChange={(e) => setRulesContent(e.target.value)}
                disabled={!rulesLoaded}
                rows={14}
                style={{ width: "100%", background: "var(--color-bg)", border: "1px solid var(--color-line)", color: "var(--color-txt)", padding: "12px 16px", fontFamily: "var(--font-mono)", fontSize: "0.75rem", outline: "none", resize: "vertical", lineHeight: 1.8 }}
                placeholder="• Kural 1&#10;• Kural 2&#10;• Kural 3"
              />
              <div className="flex items-center gap-4 mt-4">
                <button
                  type="submit"
                  disabled={rulesSaving || !rulesLoaded}
                  style={{ ...mono, fontSize: "0.65rem", padding: "10px 24px", background: rulesLoaded && !rulesSaving ? "var(--color-accent)" : "var(--color-bg-3)", color: rulesLoaded && !rulesSaving ? "var(--color-accent-ink)" : "var(--color-faint)", border: "none", cursor: rulesLoaded ? "pointer" : "not-allowed", fontWeight: 700 }}
                >
                  {rulesSaving ? "Kaydediliyor…" : "Kaydet ve Uygula"}
                </button>
                {rulesSaved && <span style={{ ...mono, fontSize: "0.6rem", color: "var(--color-status-on)" }}>✓ Kaydedildi — yenileniyor…</span>}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Announcements tab ── */}
      {tab === "announcements" && (
        <div style={{ padding: "24px clamp(20px,4vw,48px)" }}>
          {/* Add announcement form */}
          <div style={{ background: "var(--color-bg-2)", border: "1px solid var(--color-line)", padding: 24, marginBottom: 32 }}>
            <div style={{ ...mono, fontSize: "0.65rem", color: "var(--color-accent)", marginBottom: 20 }}>Yeni Duyuru</div>
            <form onSubmit={addAnnouncement}>
              <div className="flex flex-col gap-4 mb-4">
                <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <span style={{ ...mono, fontSize: "0.55rem", color: "var(--color-faint)" }}>Mesaj</span>
                  <input
                    type="text"
                    placeholder="örn. Tüm birimler kanal 2'ye geçin"
                    value={newAnnMsg}
                    onChange={(e) => setNewAnnMsg(e.target.value)}
                    style={{ background: "var(--color-bg)", border: "1px solid var(--color-line)", color: "var(--color-txt)", padding: "10px 14px", fontFamily: "var(--font-mono)", fontSize: "0.75rem", outline: "none" }}
                  />
                </label>
                <div className="flex gap-3">
                  {([["normal", "Normal (Altın)"], ["alert", "Uyarı (Kırmızı)"]] as const).map(([val, lbl]) => (
                    <label key={val} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="ann-type" value={val} checked={newAnnType === val} onChange={() => setNewAnnType(val)} />
                      <span style={{
                        ...mono, fontSize: "0.6rem",
                        color: val === "alert" ? "#ff4444" : "var(--color-accent)",
                        fontWeight: newAnnType === val ? 700 : 400,
                      }}>{lbl}</span>
                    </label>
                  ))}
                </div>
                {/* Preview */}
                <div style={{ background: "oklch(0.10 0.006 70)", padding: "8px 16px", display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ ...mono, fontSize: "0.55rem", color: "var(--color-faint)" }}>Önizleme:</span>
                  <span style={{ ...mono, fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.18em", color: newAnnType === "alert" ? "#ff4444" : "var(--color-accent)", textTransform: "uppercase" }}>
                    {newAnnType === "alert" ? "⚠ " : "● "}{newAnnMsg || "Duyuru metni"}
                  </span>
                </div>
              </div>
              <button
                type="submit"
                disabled={annSaving || !newAnnMsg.trim()}
                style={{ ...mono, fontSize: "0.65rem", padding: "10px 24px", background: newAnnMsg.trim() && !annSaving ? (newAnnType === "alert" ? "#ff4444" : "var(--color-accent)") : "var(--color-bg-3)", color: newAnnMsg.trim() && !annSaving ? "#000" : "var(--color-faint)", border: "none", cursor: newAnnMsg.trim() ? "pointer" : "not-allowed", fontWeight: 700 }}
              >
                {annSaving ? "Yayınlanıyor…" : "Duyuruyu Yayınla"}
              </button>
            </form>
          </div>

          {/* Active announcements list */}
          {announcements.length === 0 ? (
            <div style={{ ...mono, fontSize: "0.65rem", color: "var(--color-faint)", padding: 32, textAlign: "center" }}>Aktif duyuru yok</div>
          ) : (
            <div style={{ border: "1px solid var(--color-line)" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 100px 140px 60px", background: "var(--color-bg-3)", borderBottom: "1px solid var(--color-line)", padding: "10px 16px", gap: 8 }}>
                {["Mesaj", "Tip", "Tarih", ""].map((h, i) => (
                  <span key={i} style={{ ...mono, fontSize: "0.55rem", color: "var(--color-faint)" }}>{h}</span>
                ))}
              </div>
              {announcements.map((ann) => (
                <div key={ann.id} style={{ display: "grid", gridTemplateColumns: "1fr 100px 140px 60px", padding: "12px 16px", borderBottom: "1px solid var(--color-line-soft)", alignItems: "center", gap: 8 }}>
                  <span style={{ ...mono, fontSize: "0.65rem", color: ann.type === "alert" ? "#ff4444" : "var(--color-accent)", fontWeight: 700 }}>
                    {ann.type === "alert" ? "⚠ " : "● "}{ann.message}
                  </span>
                  <span style={{ ...mono, fontSize: "0.58rem", color: ann.type === "alert" ? "#ff4444" : "var(--color-accent)" }}>
                    {ann.type === "alert" ? "Uyarı" : "Normal"}
                  </span>
                  <span style={{ ...mono, fontSize: "0.58rem", color: "var(--color-faint)" }}>{new Date(ann.created_at).toLocaleString("tr-TR")}</span>
                  <button onClick={() => deleteAnnouncement(ann.id)} style={{ ...mono, fontSize: "0.55rem", padding: "5px 10px", background: "transparent", color: "var(--color-warn)", border: "1px solid var(--color-warn)", cursor: "pointer" }}>Sil</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Badges tab ── */}
      {tab === "badges" && (
        <div style={{ padding: "24px clamp(20px,4vw,48px)" }}>
          {/* Add new badge form */}
          <div style={{ background: "var(--color-bg-2)", border: "1px solid var(--color-line)", padding: 24, marginBottom: 32 }}>
            <div style={{ ...mono, fontSize: "0.65rem", color: "var(--color-accent)", marginBottom: 20 }}>Yeni Rozet Ekle</div>
            <form onSubmit={addBadgeType}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <span style={{ ...mono, fontSize: "0.55rem", color: "var(--color-faint)" }}>Rozet Adı</span>
                  <input
                    type="text"
                    placeholder="örn. CCW License"
                    value={newBadgeName}
                    onChange={(e) => setNewBadgeName(e.target.value)}
                    style={{ background: "var(--color-bg)", border: "1px solid var(--color-line)", color: "var(--color-txt)", padding: "8px 12px", fontFamily: "var(--font-mono)", fontSize: "0.75rem", outline: "none" }}
                  />
                </label>
                <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <span style={{ ...mono, fontSize: "0.55rem", color: "var(--color-faint)" }}>Kategori</span>
                  <select
                    value={newBadgeCategory}
                    onChange={(e) => setNewBadgeCategory(e.target.value)}
                    style={{ background: "var(--color-bg)", border: "1px solid var(--color-line)", color: "var(--color-txt)", padding: "8px 12px", fontFamily: "var(--font-mono)", fontSize: "0.75rem", outline: "none" }}
                  >
                    {CATEGORY_ORDER.map(cat => (
                      <option key={cat} value={cat}>{CATEGORY_LABELS[cat]}</option>
                    ))}
                  </select>
                </label>
                <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <span style={{ ...mono, fontSize: "0.55rem", color: "var(--color-faint)" }}>Renk Şeması</span>
                  <select
                    value={newBadgePreset}
                    onChange={(e) => setNewBadgePreset(Number(e.target.value))}
                    style={{ background: "var(--color-bg)", border: "1px solid var(--color-line)", color: "var(--color-txt)", padding: "8px 12px", fontFamily: "var(--font-mono)", fontSize: "0.75rem", outline: "none" }}
                  >
                    {COLOR_PRESETS.map((p, i) => (
                      <option key={i} value={i}>{p.label}</option>
                    ))}
                  </select>
                </label>
              </div>
              {/* Gradient preview */}
              <div className="flex items-center gap-4 mb-4">
                <span style={{ ...mono, fontSize: "0.55rem", color: "var(--color-faint)" }}>Önizleme:</span>
                <span style={{
                  ...mono,
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  padding: "4px 14px",
                  background: COLOR_PRESETS[newBadgePreset].to
                    ? `linear-gradient(135deg, ${COLOR_PRESETS[newBadgePreset].from}, ${COLOR_PRESETS[newBadgePreset].to})`
                    : COLOR_PRESETS[newBadgePreset].from,
                  color: "#fff",
                  letterSpacing: "0.1em",
                }}>
                  {newBadgeName || "Rozet Adı"}
                </span>
              </div>
              <button
                type="submit"
                disabled={badgeSaving || !newBadgeName.trim()}
                style={{ ...mono, fontSize: "0.65rem", padding: "10px 24px", background: newBadgeName.trim() && !badgeSaving ? "var(--color-accent)" : "var(--color-bg-3)", color: newBadgeName.trim() && !badgeSaving ? "var(--color-accent-ink)" : "var(--color-faint)", border: "none", cursor: newBadgeName.trim() ? "pointer" : "not-allowed", fontWeight: 700 }}
              >
                {badgeSaving ? "Kaydediliyor…" : "Rozet Ekle"}
              </button>
            </form>
          </div>

          {/* Badge list grouped by category */}
          {badgeTypes.length === 0 ? (
            <div style={{ ...mono, fontSize: "0.65rem", color: "var(--color-faint)", padding: 32, textAlign: "center" }}>Henüz rozet tanımı yok</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {CATEGORY_ORDER.map(cat => {
                const catBadges = badgeTypes.filter(b => b.category === cat)
                if (catBadges.length === 0) return null
                return (
                  <div key={cat}>
                    <div style={{ ...mono, fontSize: "0.6rem", color: "var(--color-faint)", letterSpacing: "0.2em", marginBottom: 12, display: "flex", alignItems: "center", gap: 10 }}>
                      {CATEGORY_LABELS[cat]}
                      <span style={{ color: "var(--color-line)", fontWeight: 400 }}>({catBadges.length})</span>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {catBadges.map(b => (
                        <div key={b.id} className="flex items-center gap-2 group">
                          <span style={{
                            ...mono,
                            fontSize: "0.65rem",
                            fontWeight: 700,
                            padding: "5px 14px",
                            background: b.color_to
                              ? `linear-gradient(135deg, ${b.color_from}, ${b.color_to})`
                              : b.color_from,
                            color: "#fff",
                            letterSpacing: "0.08em",
                          }}>
                            {b.name}
                          </span>
                          <button
                            onClick={() => deleteBadgeType(b.id)}
                            style={{ ...mono, fontSize: "0.55rem", padding: "4px 8px", background: "transparent", color: "var(--color-warn)", border: "1px solid var(--color-warn)", cursor: "pointer", opacity: 0.6 }}
                            title="Sil"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Accounts tab (founder only) ── */}
      {tab === "accounts" && adminRole === "founder" && (
        <div style={{ padding: "24px clamp(20px,4vw,48px)" }}>
          {/* Create account form */}
          <div style={{ background: "var(--color-bg-2)", border: "1px solid var(--color-line)", padding: 24, marginBottom: 32 }}>
            <div style={{ ...mono, fontSize: "0.65rem", color: "var(--color-accent)", marginBottom: 20 }}>Yeni Admin Hesabı Oluştur</div>
            <form onSubmit={createAccount}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <span style={{ ...mono, fontSize: "0.55rem", color: "var(--color-faint)" }}>Kullanıcı Adı</span>
                  <input
                    type="text"
                    value={newAccUsername}
                    onChange={(e) => setNewAccUsername(e.target.value)}
                    placeholder="örn. john_mod"
                    style={{ background: "var(--color-bg)", border: "1px solid var(--color-line)", color: "var(--color-txt)", padding: "8px 12px", fontFamily: "var(--font-mono)", fontSize: "0.75rem", outline: "none" }}
                  />
                </label>
                <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <span style={{ ...mono, fontSize: "0.55rem", color: "var(--color-faint)" }}>Şifre (en az 6 karakter)</span>
                  <input
                    type="password"
                    value={newAccPassword}
                    onChange={(e) => setNewAccPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{ background: "var(--color-bg)", border: "1px solid var(--color-line)", color: "var(--color-txt)", padding: "8px 12px", fontFamily: "var(--font-mono)", fontSize: "0.75rem", outline: "none" }}
                  />
                </label>
                <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <span style={{ ...mono, fontSize: "0.55rem", color: "var(--color-faint)" }}>Yetki Seviyesi</span>
                  <select
                    value={newAccRole}
                    onChange={(e) => setNewAccRole(e.target.value as "moderator" | "interview")}
                    style={{ background: "var(--color-bg)", border: "1px solid var(--color-line)", color: "var(--color-txt)", padding: "8px 12px", fontFamily: "var(--font-mono)", fontSize: "0.75rem", outline: "none" }}
                  >
                    <option value="moderator">Moderatör — Memur hariç tüm işlemler</option>
                    <option value="interview">Mülakat — Yalnızca başvuru sayfası</option>
                  </select>
                </label>
              </div>
              {accError && (
                <div style={{ ...mono, fontSize: "0.6rem", color: "var(--color-warn)", marginBottom: 12, padding: "8px 12px", border: "1px solid var(--color-warn)", background: "oklch(0.2 0.08 30 / 0.3)" }}>
                  ✕ {accError}
                </div>
              )}
              <button
                type="submit"
                disabled={accSaving}
                style={{ ...mono, fontSize: "0.65rem", padding: "10px 24px", background: !accSaving ? "var(--color-accent)" : "var(--color-bg-3)", color: !accSaving ? "var(--color-accent-ink)" : "var(--color-faint)", border: "none", cursor: "pointer", fontWeight: 700 }}
              >
                {accSaving ? "Oluşturuluyor…" : "Hesap Oluştur"}
              </button>
            </form>
          </div>

          {/* Account list */}
          {accounts.length === 0 ? (
            <div style={{ ...mono, fontSize: "0.65rem", color: "var(--color-faint)", padding: 32, textAlign: "center" }}>
              Henüz alt hesap oluşturulmamış
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {accounts.map((acc) => {
                const assignedRole = acc.role_id ? adminRoles.find(r => r.id === acc.role_id) : null
                return (
                  <div key={acc.id} style={{ background: "var(--color-bg-2)", border: "1px solid var(--color-line)", padding: "16px 20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
                      <span style={{ fontFamily: "var(--font-body)", fontSize: "0.95rem", fontWeight: 600, color: "var(--color-txt)", flex: 1, minWidth: 120 }}>{acc.username}</span>
                      <span style={{
                        ...mono, fontSize: "0.56rem", padding: "3px 8px",
                        background: assignedRole?.color_to ? roleGradient(assignedRole.color, assignedRole.color_to) : "transparent",
                        border: `1px solid ${assignedRole ? assignedRole.color : (acc.role === "moderator" ? "oklch(0.72 0.16 230)" : "var(--color-status-on)")}`,
                        color: assignedRole?.color_to ? "#fff" : (assignedRole ? assignedRole.color : (acc.role === "moderator" ? "oklch(0.72 0.16 230)" : "var(--color-status-on)")),
                      }}>
                        {assignedRole ? assignedRole.name : (acc.role === "moderator" ? "Moderatör" : "Mülakat")}
                      </span>
                      <span style={{ ...mono, fontSize: "0.56rem", color: acc.is_active ? "var(--color-status-on)" : "var(--color-warn)" }}>
                        {acc.is_active ? "● Aktif" : "● Pasif"}
                      </span>
                      <span style={{ ...mono, fontSize: "0.55rem", color: "var(--color-faint)" }}>{new Date(acc.created_at).toLocaleDateString("tr-TR")}</span>
                      <div className="flex gap-2">
                        <button onClick={() => toggleAccount(acc.id, !acc.is_active)} style={{ ...mono, fontSize: "0.55rem", padding: "5px 10px", background: "transparent", color: acc.is_active ? "var(--color-warn)" : "var(--color-status-on)", border: `1px solid ${acc.is_active ? "var(--color-warn)" : "var(--color-status-on)"}`, cursor: "pointer" }}>
                          {acc.is_active ? "Devre Dışı" : "Etkinleştir"}
                        </button>
                        <button onClick={() => deleteAccount(acc.id, acc.username)} style={{ ...mono, fontSize: "0.55rem", padding: "5px 10px", background: "transparent", color: "var(--color-faint)", border: "1px solid var(--color-line)", cursor: "pointer" }}>Sil</button>
                      </div>
                    </div>
                    {/* Role assignment */}
                    <div style={{ borderTop: "1px solid var(--color-line)", paddingTop: 12, marginBottom: 12 }}>
                      <div style={{ ...mono, fontSize: "0.5rem", color: "var(--color-faint)", marginBottom: 10, letterSpacing: "0.18em" }}>Özel Rol Ata</div>
                      <div className="flex items-start gap-4 flex-wrap">
                        <select
                          value={acc.role_id ?? ""}
                          onChange={(e) => assignRole(acc.id, e.target.value ? Number(e.target.value) : null)}
                          style={{ background: "var(--color-bg)", border: "1px solid var(--color-line)", color: "var(--color-txt)", padding: "6px 10px", fontFamily: "var(--font-mono)", fontSize: "0.65rem", outline: "none" }}
                        >
                          <option value="">— Varsayılan ({acc.role === "moderator" ? "Moderatör" : "Mülakat"}) —</option>
                          {adminRoles.map((r) => (
                            <option key={r.id} value={r.id}>{r.name}</option>
                          ))}
                        </select>
                        {assignedRole && (
                          <div className="flex gap-2 flex-wrap">
                            {PERM_OPTIONS.map(({ key, label }) => {
                              const has = assignedRole.permissions[key] ?? false
                              return (
                                <span key={key} style={{ ...mono, fontSize: "0.52rem", padding: "3px 8px", border: `1px solid ${has ? assignedRole.color : "var(--color-line)"}`, color: has ? assignedRole.color : "var(--color-faint)", background: has ? `${assignedRole.color}18` : "transparent" }}>
                                  {label} {has ? "✓" : "✕"}
                                </span>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Discord ID verification */}
                    <div style={{ borderTop: "1px solid var(--color-line)", paddingTop: 12 }}>
                      <div style={{ ...mono, fontSize: "0.5rem", color: "var(--color-faint)", marginBottom: 6, letterSpacing: "0.18em" }}>
                        Discord Doğrulama
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.48rem", letterSpacing: "0.06em", textTransform: "none", color: "var(--color-faint)", marginLeft: 8 }}>
                          — Ayarlanırsa giriş sırasında Discord hesabı eşleşmeli
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {acc.discord_id ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={`https://cdn.discordapp.com/embed/avatars/0.png`} alt="" className="rounded-full" style={{ width: 24, height: 24, border: "1px solid #5865F2", flexShrink: 0 }} />
                        ) : (
                          <div className="rounded-full flex items-center justify-center" style={{ width: 24, height: 24, background: "var(--color-bg-3)", border: "1px solid var(--color-line)", flexShrink: 0, ...mono, fontSize: "0.45rem", color: "var(--color-faint)" }}>DC</div>
                        )}
                        <DiscordIdInput
                          initialValue={acc.discord_id ?? ""}
                          onSave={(val) => {
                            fetch("/api/admin/accounts", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: acc.id, discord_id: val || null }) })
                              .then(r => r.ok ? r.json() : null)
                              .then(d => { if (d) setAccounts(p => p.map(a => a.id === acc.id ? d : a)) })
                          }}
                        />
                        {acc.discord_id && (
                          <span style={{ ...mono, fontSize: "0.52rem", color: "var(--color-status-on)", border: "1px solid var(--color-status-on)", padding: "2px 7px" }}>✓ Bağlı</span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Ribbon Messages tab ── */}
      {tab === "ribbon" && (
        <div style={{ padding: "24px clamp(20px,4vw,48px)" }}>
          <div style={{ background: "var(--color-bg-2)", border: "1px solid var(--color-line)", padding: 24, marginBottom: 32 }}>
            <div style={{ ...mono, fontSize: "0.65rem", color: "var(--color-accent)", marginBottom: 4 }}>Kayan Mesaj Ekle</div>
            <div style={{ ...mono, fontSize: "0.55rem", color: "var(--color-faint)", marginBottom: 20 }}>
              Bu mesajlar alt şeritte döngü halinde gösterilir. Aktif mesaj yoksa şerit otomatik olarak mesai bilgisine döner.
            </div>
            <form onSubmit={addRibbonMessage}>
              <div className="flex flex-col gap-4 mb-4">
                <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <span style={{ ...mono, fontSize: "0.55rem", color: "var(--color-faint)" }}>Mesaj</span>
                  <input
                    type="text"
                    placeholder="örn. Tüm birimler kanal 1'e geçin"
                    value={newRibbonMsg}
                    onChange={(e) => setNewRibbonMsg(e.target.value)}
                    style={{ background: "var(--color-bg)", border: "1px solid var(--color-line)", color: "var(--color-txt)", padding: "10px 14px", fontFamily: "var(--font-mono)", fontSize: "0.75rem", outline: "none" }}
                  />
                </label>
                <div className="flex gap-3">
                  {([["normal", "Normal (Altın)"], ["alert", "Uyarı (Kırmızı)"]] as const).map(([val, lbl]) => (
                    <label key={val} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="ribbon-type" value={val} checked={newRibbonType === val} onChange={() => setNewRibbonType(val)} />
                      <span style={{ ...mono, fontSize: "0.6rem", color: val === "alert" ? "#ff4444" : "var(--color-accent)", fontWeight: newRibbonType === val ? 700 : 400 }}>{lbl}</span>
                    </label>
                  ))}
                </div>
                <div style={{ background: "oklch(0.10 0.006 70)", padding: "8px 16px", display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ ...mono, fontSize: "0.55rem", color: "var(--color-faint)" }}>Önizleme:</span>
                  <span style={{ ...mono, fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.18em", color: newRibbonType === "alert" ? "#ff4444" : "var(--color-accent)", textTransform: "uppercase" }}>
                    {newRibbonType === "alert" ? "⚠ " : "● "}{newRibbonMsg || "Kayan mesaj metni"}
                  </span>
                </div>
              </div>
              <button
                type="submit"
                disabled={ribbonSaving || !newRibbonMsg.trim()}
                style={{ ...mono, fontSize: "0.65rem", padding: "10px 24px", background: newRibbonMsg.trim() && !ribbonSaving ? (newRibbonType === "alert" ? "#ff4444" : "var(--color-accent)") : "var(--color-bg-3)", color: newRibbonMsg.trim() && !ribbonSaving ? "#000" : "var(--color-faint)", border: "none", cursor: newRibbonMsg.trim() ? "pointer" : "not-allowed", fontWeight: 700 }}
              >
                {ribbonSaving ? "Ekleniyor…" : "Mesajı Ekle"}
              </button>
            </form>
          </div>

          {ribbonMessages.length === 0 ? (
            <div style={{ ...mono, fontSize: "0.65rem", color: "var(--color-faint)", padding: 32, textAlign: "center" }}>
              Aktif kayan mesaj yok — şerit mesai bilgisini gösteriyor
            </div>
          ) : (
            <div style={{ border: "1px solid var(--color-line)" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 100px 140px 60px", background: "var(--color-bg-3)", borderBottom: "1px solid var(--color-line)", padding: "10px 16px", gap: 8 }}>
                {["Mesaj", "Tip", "Eklenme", ""].map((h, i) => (
                  <span key={i} style={{ ...mono, fontSize: "0.55rem", color: "var(--color-faint)" }}>{h}</span>
                ))}
              </div>
              {ribbonMessages.map((r) => (
                <div key={r.id} style={{ display: "grid", gridTemplateColumns: "1fr 100px 140px 60px", padding: "12px 16px", borderBottom: "1px solid var(--color-line-soft)", alignItems: "center", gap: 8 }}>
                  <span style={{ ...mono, fontSize: "0.65rem", color: r.type === "alert" ? "#ff4444" : "var(--color-accent)", fontWeight: 700 }}>
                    {r.type === "alert" ? "⚠ " : "● "}{r.message}
                  </span>
                  <span style={{ ...mono, fontSize: "0.58rem", color: r.type === "alert" ? "#ff4444" : "var(--color-accent)" }}>
                    {r.type === "alert" ? "Uyarı" : "Normal"}
                  </span>
                  <span style={{ ...mono, fontSize: "0.58rem", color: "var(--color-faint)" }}>{new Date(r.created_at).toLocaleString("tr-TR")}</span>
                  <button onClick={() => deleteRibbonMessage(r.id)} style={{ ...mono, fontSize: "0.55rem", padding: "5px 10px", background: "transparent", color: "var(--color-warn)", border: "1px solid var(--color-warn)", cursor: "pointer" }}>Sil</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Gallery tab ── */}
      {tab === "gallery" && (
        <div style={{ padding: "24px clamp(20px,4vw,48px)" }}>
          {/* Add image form */}
          <div style={{ background: "var(--color-bg-2)", border: "1px solid var(--color-line)", padding: 24, marginBottom: 32 }}>
            <div style={{ ...mono, fontSize: "0.65rem", color: "var(--color-accent)", marginBottom: 4 }}>Galeriye Görsel Ekle</div>
            <div style={{ ...mono, fontSize: "0.55rem", color: "var(--color-faint)", marginBottom: 20 }}>
              Sunucudaki bir dosya yolunu (/gallery/g17.png) veya tam URL girin.
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault()
              if (!newGalleryUrl.trim()) return
              setGallerySaving(true)
              const res = await fetch("/api/gallery-images", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: newGalleryUrl.trim(), caption: newGalleryCaption.trim() || null }) })
              if (res.ok) { const created = await res.json(); setGalleryImages(p => [...p, created]); setNewGalleryUrl(""); setNewGalleryCaption("") }
              setGallerySaving(false)
            }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <span style={{ ...mono, fontSize: "0.55rem", color: "var(--color-faint)" }}>Görsel URL / Yolu</span>
                  <input type="text" value={newGalleryUrl} onChange={(e) => setNewGalleryUrl(e.target.value)} placeholder="/gallery/g17.png veya https://…" style={{ background: "var(--color-bg)", border: "1px solid var(--color-line)", color: "var(--color-txt)", padding: "10px 14px", fontFamily: "var(--font-mono)", fontSize: "0.75rem", outline: "none" }} />
                </label>
                <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <span style={{ ...mono, fontSize: "0.55rem", color: "var(--color-faint)" }}>Açıklama (opsiyonel)</span>
                  <input type="text" value={newGalleryCaption} onChange={(e) => setNewGalleryCaption(e.target.value)} placeholder="Saha görüntüsü açıklaması" style={{ background: "var(--color-bg)", border: "1px solid var(--color-line)", color: "var(--color-txt)", padding: "10px 14px", fontFamily: "var(--font-mono)", fontSize: "0.75rem", outline: "none" }} />
                </label>
              </div>
              {newGalleryUrl.trim() && (
                <div style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ ...mono, fontSize: "0.55rem", color: "var(--color-faint)" }}>Önizleme:</span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={newGalleryUrl.trim()} alt="önizleme" style={{ height: 60, width: "auto", objectFit: "cover", border: "1px solid var(--color-line)" }} onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none" }} />
                </div>
              )}
              <button type="submit" disabled={gallerySaving || !newGalleryUrl.trim()} style={{ ...mono, fontSize: "0.65rem", padding: "10px 24px", background: newGalleryUrl.trim() && !gallerySaving ? "var(--color-accent)" : "var(--color-bg-3)", color: newGalleryUrl.trim() && !gallerySaving ? "var(--color-accent-ink)" : "var(--color-faint)", border: "none", cursor: newGalleryUrl.trim() ? "pointer" : "not-allowed", fontWeight: 700 }}>
                {gallerySaving ? "Ekleniyor…" : "Ekle"}
              </button>
            </form>
          </div>

          {/* Gallery grid */}
          {galleryImages.length === 0 ? (
            <div style={{ ...mono, fontSize: "0.65rem", color: "var(--color-faint)", padding: 32, textAlign: "center" }}>Henüz galeri görseli eklenmedi</div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
              {galleryImages.map((img) => (
                <div key={img.id} style={{ position: "relative", border: "1px solid var(--color-line)", background: "var(--color-bg-3)" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt={img.caption ?? ""} style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover", display: "block" }} />
                  {img.caption && <div style={{ ...mono, fontSize: "0.52rem", color: "var(--color-faint)", padding: "6px 8px", borderTop: "1px solid var(--color-line)" }}>{img.caption}</div>}
                  <button
                    onClick={async () => {
                      await fetch("/api/gallery-images", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: img.id }) })
                      setGalleryImages(p => p.filter(g => g.id !== img.id))
                    }}
                    style={{ position: "absolute", top: 6, right: 6, ...mono, fontSize: "0.5rem", padding: "3px 7px", background: "oklch(0 0 0 / 0.7)", color: "var(--color-warn)", border: "1px solid var(--color-warn)", cursor: "pointer" }}
                  >✕</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Archive tab ── */}
      {tab === "archive" && (
        <div style={{ padding: "24px clamp(20px,4vw,48px)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
            <span style={{ ...mono, fontSize: "0.55rem", color: "var(--color-faint)" }}>
              Silinen başvurular burada saklanır. 15 günden eski kayıtlar vurgulanır.
            </span>
            <button onClick={cleanupArchive} style={{ ...mono, fontSize: "0.58rem", padding: "7px 16px", background: "transparent", color: "var(--color-warn)", border: "1px solid var(--color-warn)", cursor: "pointer" }}>
              ✕ 15 Günden Eskiyi Temizle
            </button>
          </div>
          {archiveLoading ? (
            <div style={{ ...mono, fontSize: "0.65rem", color: "var(--color-faint)", padding: 32, textAlign: "center" }}>YÜKLENİYOR…</div>
          ) : archivedApps.length === 0 ? (
            <div style={{ ...mono, fontSize: "0.65rem", color: "var(--color-faint)", padding: 32, textAlign: "center" }}>Arşiv boş</div>
          ) : (
            <div style={{ border: "1px solid var(--color-line)" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 140px 120px 140px 220px", background: "var(--color-bg-3)", borderBottom: "1px solid var(--color-line)", padding: "10px 16px", gap: 8 }}>
                {["Ad Soyad", "Discord", "Durum", "Silinme Tarihi", ""].map((h, i) => (
                  <span key={i} style={{ ...mono, fontSize: "0.55rem", color: "var(--color-faint)" }}>{h}</span>
                ))}
              </div>
              {archivedApps.map((a) => {
                const isOld = (Date.now() - new Date(a.deleted_at).getTime()) > 15 * 24 * 60 * 60 * 1000
                return (
                <div key={a.id} style={{ display: "grid", gridTemplateColumns: "1fr 140px 120px 140px 220px", padding: "12px 16px", borderBottom: "1px solid var(--color-line-soft)", alignItems: "center", gap: 8, background: isOld ? "oklch(0.16 0.06 30 / 0.3)" : "transparent" }}>
                  <span style={{ fontFamily: "var(--font-body)", fontSize: "0.9rem", color: "var(--color-txt)", fontWeight: 500 }}>
                    {a.full_name}
                    {isOld && <span style={{ ...mono, fontSize: "0.48rem", color: "var(--color-warn)", marginLeft: 8 }}>⚠ 15+ GÜN</span>}
                  </span>
                  <span style={{ ...mono, fontSize: "0.58rem", color: "var(--color-faint)" }}>{a.discord}</span>
                  <span style={{ ...mono, fontSize: "0.58rem", color: STATUS_COLORS[a.status as AppStatus] ?? "var(--color-faint)" }}>
                    {STATUS_LABELS[a.status as AppStatus] ?? a.status}
                  </span>
                  <span style={{ ...mono, fontSize: "0.58rem", color: isOld ? "var(--color-warn)" : "var(--color-faint)" }}>{new Date(a.deleted_at).toLocaleDateString("tr-TR")}</span>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => restoreApp(a.id)}
                      style={{ ...mono, fontSize: "0.55rem", padding: "5px 10px", background: "var(--color-status-on)", color: "#000", border: "none", cursor: "pointer", fontWeight: 700 }}
                    >
                      Geri Yükle
                    </button>
                    <button
                      onClick={() => permanentDelete(a.id)}
                      style={{ ...mono, fontSize: "0.55rem", padding: "5px 10px", background: "transparent", color: "var(--color-warn)", border: "1px solid var(--color-warn)", cursor: "pointer" }}
                    >
                      Kalıcı Sil
                    </button>
                  </div>
                </div>
              )})}
            </div>
          )}
        </div>
      )}

      {/* ── Roles tab (founder only) ── */}
      {tab === "roles" && adminRole === "founder" && (
        <div style={{ padding: "24px clamp(20px,4vw,48px)" }}>
          {/* Create role form */}
          <div style={{ background: "var(--color-bg-2)", border: "1px solid var(--color-line)", padding: 24, marginBottom: 32 }}>
            <div style={{ ...mono, fontSize: "0.65rem", color: "var(--color-accent)", marginBottom: 4 }}>Yeni Rol Oluştur</div>
            <div style={{ ...mono, fontSize: "0.55rem", color: "var(--color-faint)", marginBottom: 20 }}>
              Özel roller oluşturun, yetkilerini belirleyin ve Hesaplar sekmesinden atayın.
            </div>
            <form onSubmit={createRole}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <span style={{ ...mono, fontSize: "0.55rem", color: "var(--color-faint)" }}>Rol Adı</span>
                  <input
                    type="text"
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                    placeholder="örn. İçerik Yöneticisi"
                    style={{ background: "var(--color-bg)", border: "1px solid var(--color-line)", color: "var(--color-txt)", padding: "8px 12px", fontFamily: "var(--font-mono)", fontSize: "0.75rem", outline: "none" }}
                  />
                </label>
                <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <span style={{ ...mono, fontSize: "0.55rem", color: "var(--color-faint)" }}>Renk Geçişi</span>
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-1">
                      <input type="color" value={newRoleColor} onChange={(e) => setNewRoleColor(e.target.value)} style={{ width: 32, height: 32, border: "1px solid var(--color-line)", background: "transparent", cursor: "pointer", padding: 2 }} />
                      <span style={{ ...mono, fontSize: "0.55rem", color: "var(--color-faint)" }}>→</span>
                      <input type="color" value={newRoleColorTo} onChange={(e) => setNewRoleColorTo(e.target.value)} style={{ width: 32, height: 32, border: "1px solid var(--color-line)", background: "transparent", cursor: "pointer", padding: 2 }} />
                    </div>
                    <span style={{ ...mono, fontSize: "0.7rem", padding: "4px 14px", background: roleGradient(newRoleColor, newRoleColorTo), color: "#fff", fontWeight: 700, letterSpacing: "0.08em" }}>
                      {newRoleName || "Rol Adı"}
                    </span>
                  </div>
                </label>
              </div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ ...mono, fontSize: "0.5rem", color: "var(--color-faint)", marginBottom: 10, letterSpacing: "0.18em" }}>Yetkiler</div>
                <div className="flex gap-4 flex-wrap">
                  {PERM_OPTIONS.map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newRolePerms[key] ?? false}
                        onChange={(e) => setNewRolePerms(p => ({ ...p, [key]: e.target.checked }))}
                      />
                      <span style={{ ...mono, fontSize: "0.58rem", color: newRolePerms[key] ? "var(--color-accent)" : "var(--color-faint)", fontWeight: newRolePerms[key] ? 700 : 400 }}>{label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <button
                type="submit"
                disabled={roleSaving || !newRoleName.trim()}
                style={{ ...mono, fontSize: "0.65rem", padding: "10px 24px", background: newRoleName.trim() && !roleSaving ? "var(--color-accent)" : "var(--color-bg-3)", color: newRoleName.trim() && !roleSaving ? "var(--color-accent-ink)" : "var(--color-faint)", border: "none", cursor: newRoleName.trim() ? "pointer" : "not-allowed", fontWeight: 700 }}
              >
                {roleSaving ? "Oluşturuluyor…" : "Rol Oluştur"}
              </button>
            </form>
          </div>

          {/* Roles list */}
          {adminRoles.length === 0 ? (
            <div style={{ ...mono, fontSize: "0.65rem", color: "var(--color-faint)", padding: 32, textAlign: "center" }}>Henüz özel rol oluşturulmamış</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {adminRoles.map((r) => (
                <RoleCard
                  key={r.id}
                  role={r}
                  onUpdatePermissions={(perms) => updateRolePermissions(r.id, perms)}
                  onUpdateColors={(c, ct) => updateRoleColors(r.id, c, ct)}
                  onDelete={() => deleteRole(r.id, r.name)}
                  mono={mono}
                />
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
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {accessRequests.map((r) => (
                <div key={r.id} style={{ background: "var(--color-bg-2)", border: "1px solid var(--color-line)", padding: "14px 18px" }}>
                  {/* Main row */}
                  <div style={{ display: "grid", gridTemplateColumns: "40px 1fr 180px 120px auto", alignItems: "center", gap: 12 }}>
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
                    <span style={{ ...mono, fontSize: "0.56rem", color: "var(--color-faint)" }}>{r.discord_id}</span>
                    <span style={{ ...mono, fontSize: "0.56rem", color: "var(--color-faint)" }}>{new Date(r.created_at).toLocaleDateString("tr-TR")}</span>
                    <div className="flex gap-2 flex-wrap">
                      {r.status === "pending" && (
                        <>
                          <button onClick={() => openLinkModal(r, true)} style={{ ...mono, fontSize: "0.55rem", padding: "5px 10px", background: "var(--color-status-on)", color: "#000", border: "none", cursor: "pointer", fontWeight: 700 }}>Onayla</button>
                          <button onClick={async () => {
                            await fetch("/api/access-request", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: r.id, status: "rejected" }) })
                            setAccessRequests(p => p.map(x => x.id === r.id ? { ...x, status: "rejected" } : x))
                          }} style={{ ...mono, fontSize: "0.55rem", padding: "5px 10px", background: "transparent", color: "var(--color-warn)", border: "1px solid var(--color-warn)", cursor: "pointer" }}>Reddet</button>
                        </>
                      )}
                      {r.status === "approved" && (
                        <button onClick={() => openLinkModal(r, false)} style={{ ...mono, fontSize: "0.55rem", padding: "5px 10px", background: isLinked(r.discord_id) ? "transparent" : "var(--color-accent)", color: isLinked(r.discord_id) ? "var(--color-accent)" : "var(--color-accent-ink)", border: isLinked(r.discord_id) ? "1px solid var(--color-accent)" : "none", cursor: "pointer", fontWeight: 700 }}>
                          {isLinked(r.discord_id) ? "Yeniden Bağla" : "Memura Bağla"}
                        </button>
                      )}
                      {r.status !== "pending" && (
                        <button onClick={async () => {
                          const res = await fetch("/api/access-request", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: r.id }) })
                          if (res.ok) {
                            setOfficers(p => p.map(o => o.discord_id === r.discord_id ? { ...o, discord_id: null } : o))
                            setAccessRequests(p => p.filter(x => x.id !== r.id))
                          }
                        }} style={{ ...mono, fontSize: "0.55rem", padding: "5px 10px", background: "transparent", color: "var(--color-faint)", border: "1px solid var(--color-line)", cursor: "pointer" }}>Sil</button>
                      )}
                    </div>
                  </div>
                  {/* Admin notes row */}
                  <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--color-line-soft)", display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ ...mono, fontSize: "0.5rem", color: "var(--color-faint)", flexShrink: 0 }}>Not:</span>
                    <NoteInput
                      initialValue={r.admin_notes ?? ""}
                      onSave={(val) => saveAccessNote(r.id, val)}
                    />
                  </div>
                  {/* User panel permissions (only for approved+linked users) */}
                  {r.status === "approved" && isLinked(r.discord_id) && (() => {
                    const UP_LABELS = [
                      { key: "duty", label: "Mesai Başlat/Durdur" },
                      { key: "stats", label: "İstatistikler" },
                      { key: "logs", label: "Mesai Geçmişi" },
                      { key: "badges", label: "Rozetler" },
                    ]
                    const perms = { duty: true, stats: true, logs: true, badges: true, ...(r.user_permissions ?? {}) }
                    return (
                      <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--color-line-soft)" }}>
                        <div style={{ ...mono, fontSize: "0.5rem", color: "var(--color-faint)", marginBottom: 8, letterSpacing: "0.18em" }}>Panel İzinleri</div>
                        <div className="flex gap-4 flex-wrap">
                          {UP_LABELS.map(({ key, label }) => (
                            <label key={key} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={perms[key as keyof typeof perms]}
                                onChange={(e) => saveUserPermissions(r.id, { ...perms, [key]: e.target.checked })}
                              />
                              <span style={{ ...mono, fontSize: "0.58rem", color: perms[key as keyof typeof perms] ? "var(--color-accent)" : "var(--color-faint)", fontWeight: perms[key as keyof typeof perms] ? 700 : 400 }}>{label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )
                  })()}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
