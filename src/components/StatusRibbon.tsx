"use client"

const MESSAGES = [
  "● TÜM BİRİMLER AKTIF — KANAL 1 AÇIK",
  "● KARAYOLU DEVRİYE: BÖLGE 1-4 KONTROL ALTINDA",
  "● ÖZEL HAREKAT: HAZIR BEKLEMEDE",
  "● SUÇ SORUŞTURMA: AKTİF OPERASYon DEVAM EDİYOR",
  "● K9 BİRİMİ: SAHA GÖREVİNDE",
  "● HAVA DESTEK: MESAİDE",
  "● 23RD STREET DEPARTMENT — KORU VE HİZMET ET",
]

export default function StatusRibbon() {
  const text = MESSAGES.join("          ")

  return (
    <div
      className="relative overflow-hidden h-8 flex items-center"
      style={{ background: "var(--color-accent)", borderBottom: "1px solid rgba(0,0,0,0.3)" }}
    >
      <div className="animate-marquee flex whitespace-nowrap">
        {[text, text].map((t, i) => (
          <span
            key={i}
            className="px-8"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.65rem",
              letterSpacing: "0.18em",
              color: "var(--color-accent-ink)",
              fontWeight: 700,
              textTransform: "uppercase",
            }}
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  )
}
