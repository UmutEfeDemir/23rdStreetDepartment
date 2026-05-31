"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"

export default function AdminLoginPage() {
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    })

    if (res.ok) {
      router.push("/admin")
    } else {
      setError("Şifre hatalı")
    }
    setLoading(false)
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "var(--color-bg)" }}
    >
      <div
        className="w-full max-w-sm p-8"
        style={{
          background: "var(--color-bg-2)",
          border: "1px solid var(--color-line)",
        }}
      >
        {/* Logo + başlık */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <Image src="/logo.png" alt="Logo" width={72} height={72} className="rounded-full" />
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.1rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "var(--color-txt)",
              textAlign: "center",
            }}
          >
            Admin Paneli
          </div>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.6rem",
              letterSpacing: "0.18em",
              color: "var(--color-accent)",
              textTransform: "uppercase",
            }}
          >
            23rd Street Department
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.6rem",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "var(--color-muted)",
                display: "block",
                marginBottom: 6,
              }}
            >
              Şifre
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              style={{
                width: "100%",
                padding: "10px 14px",
                background: "var(--color-bg-3)",
                border: "1px solid var(--color-line)",
                color: "var(--color-txt)",
                fontFamily: "var(--font-mono)",
                fontSize: "0.9rem",
                outline: "none",
              }}
            />
            {error && (
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.6rem",
                  letterSpacing: "0.1em",
                  color: "var(--color-warn)",
                  marginTop: 6,
                }}
              >
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-clip"
            style={{
              width: "100%",
              padding: "12px",
              background: loading ? "var(--color-bg-3)" : "var(--color-accent)",
              color: loading ? "var(--color-faint)" : "var(--color-accent-ink)",
              fontFamily: "var(--font-mono)",
              fontSize: "0.7rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              fontWeight: 700,
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Giriş yapılıyor…" : "Giriş Yap"}
          </button>
        </form>
      </div>
    </div>
  )
}
