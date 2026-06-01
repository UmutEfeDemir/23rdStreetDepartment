"use client"

import { useEffect, useState } from "react"
import Image from "next/image"

export default function IntroAnimation() {
  const [done, setDone] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    document.documentElement.classList.add("intro-lock")

    const timer = setTimeout(finish, 3300)
    return () => clearTimeout(timer)
  }, [])

  function finish() {
    setDone(true)
    document.documentElement.classList.remove("intro-lock")
  }

  if (!mounted) return null

  return (
    <div
      role="presentation"
      onClick={finish}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "grid",
        placeItems: "center",
        background:
          "radial-gradient(120% 90% at 50% 42%, oklch(0.215 0.008 70) 0%, oklch(0.13 0.006 70) 60%, oklch(0.10 0.005 70) 100%)",
        overflow: "hidden",
        transition: "opacity .7s ease, visibility .7s ease",
        opacity: done ? 0 : 1,
        visibility: done ? "hidden" : "visible",
        pointerEvents: done ? "none" : "auto",
      }}
    >
      {/* Tactical grid */}
      <div className="intro-grid" />

      {/* Scan line */}
      <div className="intro-scan" />

      {/* Core — logo + rings */}
      <div
        className="intro-core"
        style={{
          position: "relative",
          display: "grid",
          placeItems: "center",
          width: "min(46vw, 360px)",
          aspectRatio: "1",
        }}
      >
        <span className="intro-ring intro-ring-1" />
        <span className="intro-ring intro-ring-2" />
        <Image
          className="intro-logo-img"
          src="/logo.png"
          alt="23rd Street Department"
          width={280}
          height={280}
          priority
        />
      </div>

      {/* Meta — title + bar + status */}
      <div className="intro-meta-wrap">
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.42em",
            fontSize: "clamp(14px, 2.4vw, 22px)",
            color: "oklch(0.96 0.004 80)",
            paddingLeft: "0.42em",
          }}
        >
          23rd Street Department
        </div>

        <div
          style={{
            width: "min(62vw, 320px)",
            height: 2,
            background: "oklch(0.34 0.012 75 / 0.45)",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <span className="intro-bar-fill" />
        </div>

        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "oklch(0.70 0.01 80)",
          }}
        >
          <b style={{ color: "oklch(0.80 0.13 82)", fontWeight: 500 }}>//</b>
          &nbsp; Komuta merkezi bağlanıyor…
        </div>
      </div>

      {/* Skip */}
      <div
        className="intro-skip-btn"
        style={{
          position: "absolute",
          right: "clamp(18px, 4vw, 40px)",
          bottom: 24,
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          letterSpacing: "0.26em",
          textTransform: "uppercase",
          color: "oklch(0.56 0.008 80)",
          cursor: "pointer",
        }}
      >
        Atlamak için tıkla →
      </div>
    </div>
  )
}
