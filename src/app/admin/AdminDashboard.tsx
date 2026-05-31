"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"

type AppStatus = "pending" | "interview" | "accepted" | "rejected"

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

const STATUS_LABELS: Record<AppStatus, string> = {
  pending: "Beklemede",
  interview: "Mülakat",
  accepted: "Kabul",
  rejected: "Red",
}

const STATUS_COLORS: Record<AppStatus, string> = {
  pending: "var(--color-accent)",
  interview: "oklch(0.72 0.16 230)",
  accepted: "var(--color-status-on)",
  rejected: "var(--color-warn)",
}

export default function AdminDashboard() {
  const [apps, setApps] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Application | null>(null)
  const [filter, setFilter] = useState<AppStatus | "all">("all")
  const router = useRouter()

  useEffect(() => {
    fetch("/api/admin/applications")
      .then((r) => r.json())
      .then((data) => { setApps(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const updateStatus = async (id: string, status: AppStatus) => {
    await fetch("/api/admin/applications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    })
    setApps((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)))
    if (selected?.id === id) setSelected((s) => s ? { ...s, status } : s)
  }

  const logout = async () => {
    await fetch("/api/admin/login", { method: "DELETE" })
    router.push("/admin/login")
  }

  const filtered = filter === "all" ? apps : apps.filter((a) => a.status === filter)

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)" }}>
      {/* Header */}
      <header
        style={{
          background: "var(--color-bg-2)",
          borderBottom: "1px solid var(--color-line)",
          padding: "0 clamp(20px,4vw,48px)",
          height: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="Logo" width={36} height={36} className="rounded-full" />
          <div>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "0.9rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "var(--color-txt)",
              }}
            >
              Admin Paneli
            </span>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.55rem",
                letterSpacing: "0.14em",
                color: "var(--color-accent)",
                textTransform: "uppercase",
                marginLeft: 10,
              }}
            >
              23rd Street Dept.
            </span>
          </div>
        </div>
        <button
          onClick={logout}
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.62rem",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--color-faint)",
            border: "1px solid var(--color-line)",
            padding: "6px 14px",
            background: "transparent",
            cursor: "pointer",
          }}
        >
          Çıkış
        </button>
      </header>

      <div className="flex" style={{ minHeight: "calc(100vh - 60px)" }}>
        {/* Sidebar / list */}
        <div
          style={{
            width: selected ? "380px" : "100%",
            maxWidth: selected ? 380 : "none",
            flexShrink: 0,
            borderRight: selected ? "1px solid var(--color-line)" : "none",
            overflowY: "auto",
          }}
        >
          {/* Filter tabs */}
          <div
            className="flex gap-1 flex-wrap"
            style={{
              padding: "12px 16px",
              borderBottom: "1px solid var(--color-line)",
              background: "var(--color-bg-2)",
            }}
          >
            {(["all", "pending", "interview", "accepted", "rejected"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.58rem",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  padding: "5px 10px",
                  border: "1px solid",
                  borderColor: filter === f ? "var(--color-accent)" : "var(--color-line)",
                  background: filter === f ? "var(--color-accent)" : "transparent",
                  color: filter === f ? "var(--color-accent-ink)" : "var(--color-muted)",
                  cursor: "pointer",
                }}
              >
                {f === "all" ? `Tümü (${apps.length})` : `${STATUS_LABELS[f]} (${apps.filter(a => a.status === f).length})`}
              </button>
            ))}
          </div>

          {/* Applications list */}
          {loading ? (
            <div
              className="p-8 text-center"
              style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--color-faint)", letterSpacing: "0.14em" }}
            >
              YÜKLENİYOR…
            </div>
          ) : filtered.length === 0 ? (
            <div
              className="p-8 text-center"
              style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--color-faint)", letterSpacing: "0.14em", textTransform: "uppercase" }}
            >
              Başvuru bulunamadı
            </div>
          ) : (
            filtered.map((app) => (
              <div
                key={app.id}
                onClick={() => setSelected(selected?.id === app.id ? null : app)}
                className="cursor-pointer"
                style={{
                  padding: "14px 16px",
                  borderBottom: "1px solid var(--color-line-soft)",
                  background: selected?.id === app.id ? "var(--color-bg-3)" : "transparent",
                  transition: "background 0.15s",
                }}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div
                      style={{
                        fontFamily: "var(--font-body)",
                        fontSize: "0.9rem",
                        fontWeight: 600,
                        color: "var(--color-txt)",
                      }}
                    >
                      {app.full_name}
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.58rem",
                        letterSpacing: "0.1em",
                        color: "var(--color-faint)",
                        marginTop: 2,
                      }}
                    >
                      {app.discord} · {app.unit} · {app.age} yaş
                    </div>
                  </div>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.55rem",
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      color: STATUS_COLORS[app.status],
                      border: `1px solid ${STATUS_COLORS[app.status]}`,
                      padding: "3px 8px",
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                    }}
                  >
                    {STATUS_LABELS[app.status]}
                  </span>
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.55rem",
                    color: "var(--color-faint)",
                    marginTop: 4,
                    letterSpacing: "0.08em",
                  }}
                >
                  {new Date(app.created_at).toLocaleString("tr-TR")}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Detail panel */}
        {selected && (
          <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
            {/* Close */}
            <button
              onClick={() => setSelected(null)}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.6rem",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--color-faint)",
                border: "1px solid var(--color-line)",
                padding: "6px 12px",
                background: "transparent",
                cursor: "pointer",
                marginBottom: 20,
              }}
            >
              ← Kapat
            </button>

            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.4rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                color: "var(--color-txt)",
                marginBottom: 4,
              }}
            >
              {selected.full_name}
            </div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.62rem",
                letterSpacing: "0.12em",
                color: "var(--color-accent)",
                marginBottom: 20,
              }}
            >
              {selected.character_name} · {selected.unit} · {selected.age} yaş
            </div>

            {/* Info grid */}
            <div
              className="grid grid-cols-2 gap-3 mb-6"
            >
              {[
                { label: "Discord", value: selected.discord },
                { label: "Birim Talebi", value: selected.unit },
                { label: "Yaş", value: String(selected.age) },
                { label: "Başvuru Tarihi", value: new Date(selected.created_at).toLocaleDateString("tr-TR") },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    background: "var(--color-bg-2)",
                    border: "1px solid var(--color-line)",
                    padding: "10px 14px",
                  }}
                >
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", letterSpacing: "0.16em", color: "var(--color-faint)", textTransform: "uppercase", marginBottom: 4 }}>
                    {item.label}
                  </div>
                  <div style={{ fontFamily: "var(--font-body)", fontSize: "0.9rem", color: "var(--color-txt)" }}>
                    {item.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Experience */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.16em", color: "var(--color-faint)", textTransform: "uppercase", marginBottom: 8 }}>
                RP Tecrübesi
              </div>
              <div
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.9rem",
                  color: "var(--color-muted)",
                  lineHeight: 1.7,
                  background: "var(--color-bg-2)",
                  border: "1px solid var(--color-line)",
                  padding: "14px",
                }}
              >
                {selected.experience}
              </div>
            </div>

            {/* Motivation */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.16em", color: "var(--color-faint)", textTransform: "uppercase", marginBottom: 8 }}>
                Motivasyon
              </div>
              <div
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.9rem",
                  color: "var(--color-muted)",
                  lineHeight: 1.7,
                  background: "var(--color-bg-2)",
                  border: "1px solid var(--color-line)",
                  padding: "14px",
                }}
              >
                {selected.motivation}
              </div>
            </div>

            {/* Status actions */}
            <div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.16em", color: "var(--color-faint)", textTransform: "uppercase", marginBottom: 10 }}>
                Durum Güncelle
              </div>
              <div className="flex flex-wrap gap-2">
                {(["pending", "interview", "accepted", "rejected"] as AppStatus[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => updateStatus(selected.id, s)}
                    className={s === "accepted" || s === "rejected" ? "btn-clip" : ""}
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.62rem",
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      padding: "9px 18px",
                      border: `1px solid ${STATUS_COLORS[s]}`,
                      background: selected.status === s ? STATUS_COLORS[s] : "transparent",
                      color: selected.status === s ? (s === "accepted" ? "#fff" : "var(--color-accent-ink)") : STATUS_COLORS[s],
                      cursor: "pointer",
                      fontWeight: selected.status === s ? 700 : 400,
                      transition: "all 0.2s",
                    }}
                  >
                    {STATUS_LABELS[s]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
