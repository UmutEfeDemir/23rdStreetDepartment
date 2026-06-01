"use client"

import { useSession } from "next-auth/react"

export default function JoinCTA() {
  const { data: session } = useSession()
  if (session) return null

  return (
    <section
      id="join"
      className="section-pad"
      style={{
        background: "var(--color-bg-2)",
        borderBottom: "1px solid var(--color-line)",
      }}
    >
      <div className="container-max text-center">
        <div className="kicker justify-center mb-6">08 / Topluluğa Katıl</div>
        <h2
          className="mb-4"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(2rem, 5vw, 4rem)",
            fontWeight: 700,
            textTransform: "uppercase",
            lineHeight: 1.05,
            color: "var(--color-txt)",
          }}
        >
          Aramıza
          <br />
          <span style={{ color: "var(--color-accent)" }}>Katıl</span>
        </h2>

        <p
          className="mb-10"
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "1rem",
            color: "var(--color-muted)",
            maxWidth: 460,
            margin: "0 auto 40px",
            lineHeight: 1.8,
            fontWeight: 300,
          }}
        >
          Discord sunucumuza katılarak ekibimizle tanışın, duyuruları takip edin ve
          topluluk etkinliklerine katılın.
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <a
            href={process.env.NEXT_PUBLIC_DISCORD_INVITE_URL ?? "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-clip flex items-center gap-3"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.72rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              background: "#5865F2",
              color: "#fff",
              padding: "16px 40px",
              fontWeight: 700,
              textDecoration: "none",
              display: "inline-flex",
              transition: "opacity 0.2s",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028 14.09 14.09 0 001.226-1.994.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03z" />
            </svg>
            Discord'a Katıl
          </a>

          <a
            href="#basvuru"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.72rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--color-txt)",
              padding: "16px 40px",
              fontWeight: 500,
              textDecoration: "none",
              display: "inline-block",
              border: "1px solid var(--color-line)",
              background: "transparent",
            }}
          >
            Başvuru Formu
          </a>
        </div>
      </div>
    </section>
  )
}
