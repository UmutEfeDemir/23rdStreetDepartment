"use client"

import { useState, useEffect } from "react"
import { useSession, signIn, signOut } from "next-auth/react"
import Link from "next/link"
import Image from "next/image"

const NAV_LINKS = [
  { href: "#command", label: "Komuta" },
  { href: "#personel", label: "Personel" },
  { href: "#units", label: "Birimler" },
  { href: "#panel", label: "Panel" },
  { href: "#basvuru", label: "Başvuru" },
]

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { data: session } = useSession()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <nav
      className="sticky top-0 z-50 transition-all duration-300"
      style={{
        background: scrolled
          ? "oklch(0.155 0.006 70 / 0.97)"
          : "oklch(0.155 0.006 70 / 0.85)",
        borderBottom: scrolled
          ? "1px solid var(--color-line)"
          : "1px solid transparent",
        backdropFilter: "blur(12px)",
      }}
    >
      <div
        className="container-max flex items-center justify-between h-16"
        style={{ paddingInline: "clamp(20px, 5vw, 64px)" }}
      >
        {/* Logo */}
        <Link href="/admin" className="flex items-center gap-3 group">
          <Image
            src="/logo.png"
            alt="23rd Street Department"
            width={44}
            height={44}
            className="rounded-full"
            style={{ objectFit: "cover" }}
            priority
          />
          <div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "0.95rem",
                letterSpacing: "0.08em",
                color: "var(--color-txt)",
                lineHeight: 1,
                textTransform: "uppercase",
              }}
            >
              23rd Street
            </div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.6rem",
                letterSpacing: "0.2em",
                color: "var(--color-accent)",
                textTransform: "uppercase",
                lineHeight: 1,
                marginTop: 2,
              }}
            >
              Department
            </div>
          </div>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.7rem",
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "var(--color-muted)",
                transition: "color 0.2s",
              }}
              className="hover:text-[var(--color-txt)]"
              onMouseEnter={(e) =>
                ((e.target as HTMLElement).style.color = "var(--color-txt)")
              }
              onMouseLeave={(e) =>
                ((e.target as HTMLElement).style.color = "var(--color-muted)")
              }
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-3">
          {session ? (
            <div className="flex items-center gap-3">
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.65rem",
                  color: "var(--color-muted)",
                  letterSpacing: "0.1em",
                }}
              >
                {session.user?.name}
              </span>
              <button
                onClick={() => signOut()}
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.65rem",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "var(--color-faint)",
                  border: "1px solid var(--color-line)",
                  padding: "6px 14px",
                  background: "transparent",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                Çıkış
              </button>
            </div>
          ) : null}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menü"
        >
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="block w-5 h-0.5 transition-all duration-300"
              style={{
                background: "var(--color-txt)",
                transform:
                  menuOpen
                    ? i === 0
                      ? "rotate(45deg) translate(4px, 4px)"
                      : i === 2
                      ? "rotate(-45deg) translate(4px, -4px)"
                      : "opacity: 0"
                    : "none",
                opacity: menuOpen && i === 1 ? 0 : 1,
              }}
            />
          ))}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          style={{
            background: "var(--color-bg-2)",
            borderTop: "1px solid var(--color-line)",
            padding: "20px clamp(20px, 5vw, 64px)",
          }}
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="block py-3"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.75rem",
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "var(--color-muted)",
                borderBottom: "1px solid var(--color-line-soft)",
              }}
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  )
}
