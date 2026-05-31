"use client"

import { useEffect, useRef, useState } from "react"
import type { SiteStats } from "@/lib/types"

interface Props {
  stats: SiteStats
}

function Counter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true
          const duration = 1400
          const steps = 40
          const step = target / steps
          let current = 0
          const interval = setInterval(() => {
            current = Math.min(current + step, target)
            setCount(Math.round(current))
            if (current >= target) clearInterval(interval)
          }, duration / steps)
        }
      },
      { threshold: 0.4 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target])

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  )
}

const STAT_ITEMS = (s: SiteStats) => [
  { value: s.yearsActive, suffix: "+", label: "Yıllık Deneyim", mono: "01" },
  { value: s.totalPersonnel, suffix: "", label: "Toplam Personel", mono: "02" },
  { value: s.activeTroopers, suffix: "", label: "Aktif Trooper", mono: "03" },
  { value: s.sectors, suffix: "", label: "Aktif Sektör", mono: "04" },
]

export default function Stats({ stats }: Props) {
  return (
    <section
      id="stats"
      style={{
        background: "var(--color-bg-2)",
        borderBlock: "1px solid var(--color-line)",
        padding: "clamp(48px, 8vh, 80px) clamp(20px, 5vw, 64px)",
      }}
    >
      <div className="container-max grid grid-cols-2 md:grid-cols-4 gap-px">
        {STAT_ITEMS(stats).map((item, i) => (
          <div
            key={i}
            className="flex flex-col items-center text-center py-8 px-4 relative"
            style={{
              borderRight: i < 3 ? "1px solid var(--color-line)" : "none",
            }}
          >
            <div
              className="absolute top-3 left-4"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.58rem",
                letterSpacing: "0.2em",
                color: "var(--color-faint)",
              }}
            >
              {item.mono}
            </div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(3rem, 6vw, 5rem)",
                fontWeight: 700,
                color: "var(--color-accent)",
                lineHeight: 1,
              }}
            >
              <Counter target={item.value} suffix={item.suffix} />
            </div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.65rem",
                letterSpacing: "0.16em",
                color: "var(--color-muted)",
                textTransform: "uppercase",
                marginTop: 12,
              }}
            >
              {item.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
