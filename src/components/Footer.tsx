"use client"

import Link from "next/link"

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer
      style={{
        background: "var(--color-bg-2)",
        borderTop: "1px solid var(--color-line)",
        padding: "40px clamp(20px, 5vw, 64px)",
      }}
    >
      <div className="container-max flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand */}
        <div>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.1rem",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "var(--color-txt)",
            }}
          >
            23rd Street Department
          </div>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.62rem",
              letterSpacing: "0.18em",
              color: "var(--color-accent)",
              textTransform: "uppercase",
              marginTop: 4,
            }}
          >
            San Andreas State Police
          </div>
        </div>

        {/* Links */}
        <div className="flex flex-wrap gap-6 justify-center">
          {[
            { href: "#command", label: "Komuta" },
            { href: "#personel", label: "Personel" },
            { href: "#units", label: "Birimler" },
            { href: "#basvuru", label: "Başvuru" },
          ].map((l) => (
            <a
              key={l.href}
              href={l.href}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.65rem",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--color-faint)",
                textDecoration: "none",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) =>
                ((e.target as HTMLElement).style.color = "var(--color-accent)")
              }
              onMouseLeave={(e) =>
                ((e.target as HTMLElement).style.color = "var(--color-faint)")
              }
            >
              {l.label}
            </a>
          ))}
        </div>

        {/* Admin access badge */}
        <Link
          href="/admin"
          className="flex items-center gap-2 px-4 py-2"
          style={{
            border: "1px solid var(--color-line)",
            background: "var(--color-bg-3)",
            textDecoration: "none",
            transition: "border-color 0.2s",
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLElement).style.borderColor = "var(--color-accent)")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLElement).style.borderColor = "var(--color-line)")
          }
        >
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: "var(--color-status-on)" }}
          />
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.6rem",
              letterSpacing: "0.18em",
              color: "var(--color-faint)",
              textTransform: "uppercase",
            }}
          >
            Yetkili Erişim
          </span>
        </Link>
      </div>

      <div
        className="container-max mt-8 pt-6 text-center"
        style={{ borderTop: "1px solid var(--color-line-soft)" }}
      >
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.6rem",
            letterSpacing: "0.12em",
            color: "var(--color-faint)",
            textTransform: "uppercase",
          }}
        >
          © {year} 23rd Street Department · Tüm hakları saklıdır
        </p>
      </div>
    </footer>
  )
}
