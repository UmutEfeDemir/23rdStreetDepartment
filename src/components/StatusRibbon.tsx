"use client"

import { useEffect, useState } from "react"

interface RibbonSegment {
  text: string
  type: "normal" | "alert"
}

const STATIC_MESSAGES: RibbonSegment[] = [
  { text: "● TÜM BİRİMLER AKTİF — KANAL 1 AÇIK", type: "normal" },
  { text: "● 23RD STREET DEPARTMENT — KORU VE HİZMET ET", type: "normal" },
]

export default function StatusRibbon() {
  const [segments, setSegments] = useState<RibbonSegment[]>(STATIC_MESSAGES)

  useEffect(() => {
    const load = () => {
      fetch("/api/status-ribbon")
        .then((r) => r.ok ? r.json() : null)
        .then((data) => {
          if (!data) return
          const segs: RibbonSegment[] = []

          for (const ann of data.announcements ?? []) {
            segs.push({ text: `⚠ ${ann.message}`, type: "alert" })
          }

          for (const o of data.activeDuty ?? []) {
            segs.push({ text: `● ${o.rank} ${o.name} (${o.badge_no}) — MESAİDE`, type: "normal" })
          }

          if (segs.length === 0) {
            setSegments(STATIC_MESSAGES)
          } else {
            setSegments([...segs, ...STATIC_MESSAGES])
          }
        })
        .catch(() => {})
    }

    load()
    const interval = setInterval(load, 60_000)
    return () => clearInterval(interval)
  }, [])

  if (segments.length === 0) return null

  const SegmentGroup = ({ prefix }: { prefix: string }) => (
    <>
      {segments.map((seg, i) => (
        <span
          key={`${prefix}-${i}`}
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.65rem",
            letterSpacing: "0.18em",
            color: seg.type === "alert" ? "#ff4444" : "var(--color-accent)",
            fontWeight: 700,
            textTransform: "uppercase" as const,
            padding: "0 28px",
          }}
        >
          {seg.text}
        </span>
      ))}
    </>
  )

  return (
    <div
      className="relative overflow-hidden h-8 flex items-center"
      style={{ background: "oklch(0.10 0.006 70)", borderBottom: "1px solid var(--color-line)" }}
    >
      <div className="animate-marquee flex whitespace-nowrap">
        <SegmentGroup prefix="a" />
        <SegmentGroup prefix="b" />
      </div>
    </div>
  )
}
