"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import type { Unit } from "@/lib/types"
import { UNIT_LABELS } from "@/lib/types"

const schema = z.object({
  fullName: z.string().min(3, "En az 3 karakter"),
  age: z.number().min(18, "18 yaşından küçükler başvuramaz").max(80, "Geçersiz yaş"),
  discord: z.string().min(2, "Discord adı gerekli"),
  characterName: z.string().min(3, "Karakter adı gerekli"),
  unit: z.enum(["HPD", "CID", "SWAT", "TFD", "K9", "ASD"] as const),
  experience: z.string().min(20, "En az 20 karakter"),
  motivation: z.string().min(30, "En az 30 karakter"),
  acceptedRules: z.literal(true, "Kuralları kabul etmelisiniz"),
})

type FormData = z.infer<typeof schema>

const STEPS = [
  "Kişisel Bilgiler",
  "Karakter & Birim",
  "Deneyim",
  "Gönder",
]

export default function ApplicationForm() {
  const [step, setStep] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useForm<FormData, any, FormData>({
    resolver: zodResolver(schema) as any,
  })

  const fieldStyle = {
    fontFamily: "var(--font-body)",
    fontSize: "0.9rem",
    padding: "10px 14px",
    background: "var(--color-bg-3)",
    border: "1px solid var(--color-line)",
    color: "var(--color-txt)",
    outline: "none",
    width: "100%",
    transition: "border-color 0.2s",
  } as React.CSSProperties

  const labelStyle = {
    fontFamily: "var(--font-mono)",
    fontSize: "0.6rem",
    letterSpacing: "0.18em",
    textTransform: "uppercase" as const,
    color: "var(--color-muted)",
    display: "block",
    marginBottom: 6,
  }

  const errorStyle = {
    fontFamily: "var(--font-mono)",
    fontSize: "0.58rem",
    letterSpacing: "0.1em",
    color: "var(--color-warn)",
    marginTop: 4,
  }

  const STEP_FIELDS: Record<number, (keyof FormData)[]> = {
    0: ["fullName", "age", "discord"],
    1: ["characterName", "unit"],
    2: ["experience", "motivation"],
    3: ["acceptedRules"],
  }

  const handleNext = async () => {
    const valid = await trigger(STEP_FIELDS[step])
    if (valid) setStep((s) => s + 1)
  }

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(json.error ?? "Gönderim başarısız")
      }
      setSubmitted(true)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Bir hata oluştu")
    } finally {
      setLoading(false)
    }
  }

  return (
    <section
      id="basvuru"
      className="section-pad"
      style={{ borderBottom: "1px solid var(--color-line)" }}
    >
      <div className="container-max">
        <div className="kicker mb-4">07 / Başvuru</div>
        <h2
          className="mb-12"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)",
            fontWeight: 700,
            textTransform: "uppercase",
            color: "var(--color-txt)",
          }}
        >
          Kadromuza Katıl
        </h2>

        {submitted ? (
          <div
            className="flex flex-col items-center py-20 gap-4"
            style={{
              border: "1px solid var(--color-status-on)",
              background: "oklch(0.72 0.16 150 / 0.05)",
            }}
          >
            <div
              className="w-12 h-12 flex items-center justify-center"
              style={{
                border: "2px solid var(--color-status-on)",
                color: "var(--color-status-on)",
              }}
            >
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.4rem",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                color: "var(--color-txt)",
              }}
            >
              Başvuru Alındı
            </div>
            <div
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.95rem",
                color: "var(--color-muted)",
                textAlign: "center",
                maxWidth: 440,
              }}
            >
              Başvurunuz incelemeye alınmıştır. Discord sunucumuzdan bildirim alacaksınız.
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-5 gap-8">
            {/* Steps */}
            <div className="lg:col-span-1 flex lg:flex-col gap-2">
              {STEPS.map((s, i) => (
                <div
                  key={s}
                  className="flex items-center gap-3"
                  style={{ opacity: i > step ? 0.4 : 1 }}
                >
                  <div
                    className="flex-shrink-0 w-7 h-7 flex items-center justify-center text-xs"
                    style={{
                      background:
                        i < step
                          ? "var(--color-status-on)"
                          : i === step
                          ? "var(--color-accent)"
                          : "var(--color-bg-3)",
                      border: `1px solid ${
                        i <= step ? "transparent" : "var(--color-line)"
                      }`,
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.6rem",
                      color:
                        i < step
                          ? "#fff"
                          : i === step
                          ? "var(--color-accent-ink)"
                          : "var(--color-faint)",
                    }}
                  >
                    {i < step ? "✓" : (i + 1).toString().padStart(2, "0")}
                  </div>
                  <span
                    className="hidden lg:block"
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.6rem",
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color:
                        i === step ? "var(--color-txt)" : "var(--color-faint)",
                    }}
                  >
                    {s}
                  </span>
                </div>
              ))}
            </div>

            {/* Form */}
            <div
              className="lg:col-span-4 p-8"
              style={{
                background: "var(--color-bg-2)",
                border: "1px solid var(--color-line)",
              }}
            >
              <form onSubmit={handleSubmit(onSubmit)}>
                {/* Step 0 */}
                {step === 0 && (
                  <div className="flex flex-col gap-5">
                    <div>
                      <label style={labelStyle}>Ad Soyad</label>
                      <input {...register("fullName")} style={fieldStyle} placeholder="John Doe" />
                      {errors.fullName && <p style={errorStyle}>{errors.fullName.message}</p>}
                    </div>
                    <div>
                      <label style={labelStyle}>Yaş</label>
                      <input
                        type="number"
                        {...register("age", { valueAsNumber: true })}
                        style={fieldStyle}
                        placeholder="18"
                        min={18}
                      />
                      {errors.age && <p style={errorStyle}>{errors.age.message}</p>}
                    </div>
                    <div>
                      <label style={labelStyle}>Discord Adı</label>
                      <input {...register("discord")} style={fieldStyle} placeholder="username#0000" />
                      {errors.discord && <p style={errorStyle}>{errors.discord.message}</p>}
                    </div>
                  </div>
                )}

                {/* Step 1 */}
                {step === 1 && (
                  <div className="flex flex-col gap-5">
                    <div>
                      <label style={labelStyle}>Karakter Adı</label>
                      <input {...register("characterName")} style={fieldStyle} placeholder="Karakter adınız" />
                      {errors.characterName && <p style={errorStyle}>{errors.characterName.message}</p>}
                    </div>
                    <div>
                      <label style={labelStyle}>Başvurmak İstediğiniz Birim</label>
                      <select {...register("unit")} style={{ ...fieldStyle, cursor: "pointer" }}>
                        <option value="">Birim seçin…</option>
                        {(Object.keys(UNIT_LABELS) as Unit[]).map((u) => (
                          <option key={u} value={u}>
                            {u} — {UNIT_LABELS[u]}
                          </option>
                        ))}
                      </select>
                      {errors.unit && <p style={errorStyle}>{errors.unit.message}</p>}
                    </div>
                  </div>
                )}

                {/* Step 2 */}
                {step === 2 && (
                  <div className="flex flex-col gap-5">
                    <div>
                      <label style={labelStyle}>RP Tecrübesi</label>
                      <textarea
                        {...register("experience")}
                        rows={4}
                        style={{ ...fieldStyle, resize: "vertical" }}
                        placeholder="Önceki sunucu deneyimlerinizi, oynadığınız rolleri ve sahip olduğunuz yeterlilikleri açıklayın."
                      />
                      {errors.experience && <p style={errorStyle}>{errors.experience.message}</p>}
                    </div>
                    <div>
                      <label style={labelStyle}>Motivasyon</label>
                      <textarea
                        {...register("motivation")}
                        rows={4}
                        style={{ ...fieldStyle, resize: "vertical" }}
                        placeholder="Neden 23rd Street Department'a katılmak istiyorsunuz?"
                      />
                      {errors.motivation && <p style={errorStyle}>{errors.motivation.message}</p>}
                    </div>
                  </div>
                )}

                {/* Step 3 */}
                {step === 3 && (
                  <div className="flex flex-col gap-6">
                    <div
                      className="p-4"
                      style={{
                        background: "var(--color-bg-3)",
                        border: "1px solid var(--color-line)",
                        fontFamily: "var(--font-body)",
                        fontSize: "0.88rem",
                        color: "var(--color-muted)",
                        lineHeight: 1.7,
                      }}
                    >
                      <strong style={{ color: "var(--color-accent)", fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.14em", textTransform: "uppercase" }}>
                        Teşkilat Kuralları
                      </strong>
                      <ul className="mt-3 list-disc list-inside flex flex-col gap-1.5">
                        <li>Tüm oyun içi talimatlara uyulması zorunludur.</li>
                        <li>Saygısızlık ve kuraldışı davranış tolere edilmez.</li>
                        <li>Üniforma ve ekipman yönetmeliğine uyulacaktır.</li>
                        <li>Gizlilik anlaşması imzalanacaktır.</li>
                        <li>Deneme sürecinde görev başarısı değerlendirilir.</li>
                      </ul>
                    </div>

                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        {...register("acceptedRules")}
                        style={{
                          width: 16,
                          height: 16,
                          marginTop: 2,
                          accentColor: "var(--color-accent)",
                          flexShrink: 0,
                        }}
                      />
                      <span
                        style={{
                          fontFamily: "var(--font-body)",
                          fontSize: "0.9rem",
                          color: "var(--color-muted)",
                          lineHeight: 1.6,
                        }}
                      >
                        Teşkilat kurallarını okudum, anladım ve kabul ediyorum.
                      </span>
                    </label>
                    {errors.acceptedRules && (
                      <p style={errorStyle}>{errors.acceptedRules.message}</p>
                    )}

                    {error && (
                      <div
                        className="p-3"
                        style={{
                          background: "oklch(0.80 0.135 75 / 0.1)",
                          border: "1px solid var(--color-warn)",
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.65rem",
                          letterSpacing: "0.1em",
                          color: "var(--color-warn)",
                        }}
                      >
                        {error}
                      </div>
                    )}
                  </div>
                )}

                {/* Buttons */}
                <div className="flex gap-4 mt-8">
                  {step > 0 && (
                    <button
                      type="button"
                      onClick={() => setStep((s) => s - 1)}
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.65rem",
                        letterSpacing: "0.16em",
                        textTransform: "uppercase",
                        padding: "12px 24px",
                        border: "1px solid var(--color-line)",
                        background: "transparent",
                        color: "var(--color-muted)",
                        cursor: "pointer",
                      }}
                    >
                      Geri
                    </button>
                  )}

                  {step < 3 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="btn-clip"
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.65rem",
                        letterSpacing: "0.16em",
                        textTransform: "uppercase",
                        padding: "12px 28px",
                        background: "var(--color-accent)",
                        color: "var(--color-accent-ink)",
                        border: "none",
                        cursor: "pointer",
                        fontWeight: 700,
                      }}
                    >
                      Devam Et →
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-clip"
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.65rem",
                        letterSpacing: "0.16em",
                        textTransform: "uppercase",
                        padding: "12px 28px",
                        background: loading ? "var(--color-bg-3)" : "var(--color-accent)",
                        color: loading ? "var(--color-faint)" : "var(--color-accent-ink)",
                        border: "none",
                        cursor: loading ? "not-allowed" : "pointer",
                        fontWeight: 700,
                        transition: "all 0.2s",
                      }}
                    >
                      {loading ? "Gönderiliyor…" : "Başvuruyu Gönder"}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
