"use client"

import { useEffect, useState } from "react"

interface Announcement {
  id: number
  message: string
  type: string
  created_at: string
}

const mono: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  letterSpacing: "0.14em",
  textTransform: "uppercase" as const,
}

export default function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [dismissed, setDismissed] = useState<Set<number>>(new Set())

  useEffect(() => {
    const load = () =>
      fetch("/api/announcements")
        .then((r) => (r.ok ? r.json() : []))
        .then((d) => setAnnouncements(Array.isArray(d) ? d : []))
        .catch(() => {})
    load()
    const t = setInterval(load, 10_000)
    return () => clearInterval(t)
  }, [])

  const visible = announcements.filter((a) => !dismissed.has(a.id))
  if (visible.length === 0) return null

  return (
    <div>
      {visible.map((ann) => {
        const isAlert = ann.type === "alert"
        const color = isAlert ? "#ef4444" : "var(--color-accent)"
        return (
          <div
            key={ann.id}
            style={{
              background: isAlert ? "oklch(0.14 0.07 25)" : "oklch(0.12 0.04 80)",
              borderBottom: `1px solid ${color}`,
              padding: "11px clamp(20px,4vw,48px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
            }}
          >
            <span
              style={{
                ...mono,
                fontSize: "0.65rem",
                color,
                fontWeight: 700,
              }}
            >
              {isAlert ? "⚠ " : "● "}{ann.message}
            </span>
            <button
              onClick={() => setDismissed((p) => new Set([...p, ann.id]))}
              style={{
                background: "transparent",
                border: `1px solid ${color}`,
                color,
                cursor: "pointer",
                ...mono,
                fontSize: "0.55rem",
                padding: "3px 8px",
                flexShrink: 0,
                opacity: 0.7,
              }}
            >
              ✕
            </button>
          </div>
        )
      })}
    </div>
  )
}
