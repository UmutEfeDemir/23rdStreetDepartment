"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"

export default function AdminLoginPage() {
  const [username, setUsername] = useState("")
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
      body: JSON.stringify({ username: username.trim() || undefined, password }),
    })

    if (res.ok) {
      router.push("/admin")
    } else {
      const data = await res.json().catch(() => ({}))
      setError(data.error ?? "Giriş başarısız")
    }
    setLoading(false)
  }

  const mono: React.CSSProperties = {
    fontFamily: "var(--font-mono)",
    letterSpacing: "0.18em",
    textTransform: "uppercase",
  }

  const fieldStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 14px",
    background: "var(--color-bg-3)",
    border: "1px solid var(--color-line)",
    color: "var(--color-txt)",
    fontFamily: "var(--font-mono)",
    fontSize: "0.9rem",
    outline: "none",
  }

  const labelStyle: React.CSSProperties = {
    ...mono,
    fontSize: "0.6rem",
    color: "var(--color-muted)",
    display: "block",
    marginBottom: 6,
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
          <div style={{ ...mono, fontSize: "0.6rem", color: "var(--color-accent)" }}>
            23rd Street Department
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label style={labelStyle}>Kullanıcı Adı</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Kurucu girişi için boş bırakın"
              style={fieldStyle}
              autoComplete="username"
            />
            <p style={{ ...mono, fontSize: "0.52rem", color: "var(--color-faint)", marginTop: 5, textTransform: "none", letterSpacing: "0.06em" }}>
              Alt hesap için kullanıcı adı girin. Kurucu girişi için boş bırakın.
            </p>
          </div>

          <div>
            <label style={labelStyle}>Şifre</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus={false}
              style={fieldStyle}
              autoComplete="current-password"
            />
            {error && (
              <p style={{ ...mono, fontSize: "0.6rem", color: "var(--color-warn)", marginTop: 6, textTransform: "none", letterSpacing: "0.08em" }}>
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
