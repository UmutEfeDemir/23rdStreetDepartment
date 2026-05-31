"use client"

import { useState, useEffect } from "react"

const LIVE_FEED = [
  "HPD-12 BÖLGE 3'TE DEVRİYEDE…",
  "CID: AKTİF SORUŞTURMA DEVAM EDİYOR…",
  "SWAT: HAZIR DURUMDA BEKLENİYOR…",
  "K9-07 ARAMA GÖREVINDE — SEKTÖR 5…",
  "TFD: İ-5 KARAYOLUNDA TRAFİK DENETİMİ…",
  "ASD: HAVA GÖZETLEMESİ AKTİF…",
]

export default function Hero() {
  const [feedIndex, setFeedIndex] = useState(0)
  const [displayed, setDisplayed] = useState("")
  const [typing, setTyping] = useState(true)

  useEffect(() => {
    const full = LIVE_FEED[feedIndex]
    if (typing) {
      if (displayed.length < full.length) {
        const t = setTimeout(() => setDisplayed(full.slice(0, displayed.length + 1)), 40)
        return () => clearTimeout(t)
      } else {
        const t = setTimeout(() => setTyping(false), 2200)
        return () => clearTimeout(t)
      }
    } else {
      if (displayed.length > 0) {
        const t = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 18)
        return () => clearTimeout(t)
      } else {
        setFeedIndex((i) => (i + 1) % LIVE_FEED.length)
        setTyping(true)
      }
    }
  }, [displayed, typing, feedIndex])

  return (
    <header
      id="hero"
      className="relative overflow-hidden scanlines"
      style={{
        minHeight: "92vh",
        display: "flex",
        alignItems: "center",
        paddingInline: "clamp(20px, 5vw, 64px)",
        paddingBlock: "clamp(80px, 12vh, 140px)",
      }}
    >
      {/* Background gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 70% at 70% 50%, oklch(0.34 0.012 75 / 0.15) 0%, transparent 70%)",
        }}
      />

      {/* Logo watermark */}
      <div
        className="absolute right-0 top-1/2 -translate-y-1/2 select-none pointer-events-none"
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(200px, 28vw, 420px)",
          fontWeight: 700,
          lineHeight: 1,
          color: "oklch(0.34 0.012 75 / 0.07)",
          letterSpacing: "-0.04em",
          userSelect: "none",
          right: "-2%",
        }}
      >
        23
      </div>

      <div className="container-max relative z-10 w-full">
        {/* Kicker */}
        <div className="kicker mb-6">San Andreas State Police</div>

        {/* Main title */}
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(52px, 9vw, 120px)",
            fontWeight: 700,
            textTransform: "uppercase",
            lineHeight: 0.95,
            letterSpacing: "0.01em",
            color: "var(--color-txt)",
            marginBottom: "clamp(16px, 2vw, 32px)",
          }}
        >
          23RD STREET
          <br />
          <span style={{ color: "var(--color-accent)" }}>DEPARTMENT</span>
        </h1>

        {/* Live feed */}
        <div
          className="flex items-center gap-3 mb-8"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "clamp(0.65rem, 1.2vw, 0.8rem)",
            letterSpacing: "0.16em",
            textTransform: "uppercase",
          }}
        >
          <span
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ background: "var(--color-status-on)", flexShrink: 0 }}
          />
          <span style={{ color: "var(--color-status-on)" }}>CANLI SAHA</span>
          <span style={{ color: "var(--color-faint)" }}>—</span>
          <span style={{ color: "var(--color-muted)", minWidth: "24ch" }}>
            {displayed}
            <span
              className="inline-block w-0.5 h-3 ml-0.5 animate-pulse"
              style={{ background: "var(--color-accent)", verticalAlign: "middle" }}
            />
          </span>
        </div>

        {/* Subtitle */}
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "clamp(1rem, 1.8vw, 1.15rem)",
            color: "var(--color-muted)",
            maxWidth: 520,
            lineHeight: 1.7,
            marginBottom: "clamp(32px, 5vw, 52px)",
            fontWeight: 300,
          }}
        >
          San Andreas Eyaleti'nin en seçkin emniyet teşkilatı. Disiplin, dürüstlük ve
          kararlılıkla görev yapan troopers kadronu bekliyor.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap gap-4">
          <a
            href="#basvuru"
            className="btn-clip"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.72rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              background: "var(--color-accent)",
              color: "var(--color-accent-ink)",
              padding: "14px 36px",
              fontWeight: 700,
              textDecoration: "none",
              display: "inline-block",
              transition: "opacity 0.2s",
            }}
          >
            Başvuru Yap
          </a>
          <a
            href="#command"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.72rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--color-txt)",
              padding: "14px 36px",
              fontWeight: 500,
              textDecoration: "none",
              display: "inline-block",
              border: "1px solid var(--color-line)",
              background: "transparent",
              transition: "border-color 0.2s",
            }}
          >
            Teşkilatı Tanı
          </a>
        </div>
      </div>
    </header>
  )
}
