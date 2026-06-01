import { Car, Search, Crosshair, AlertOctagon, PawPrint, Plane } from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface Unit {
  code: string
  name: string
  desc: string
  Icon: LucideIcon
}

const UNITS: Unit[] = [
  {
    code: "HPD",
    name: "Karayolu Devriye Birimi",
    desc: "Eyalet yollarında trafik denetimi, sürücü güvenliği ve karayolu devriyesi.",
    Icon: Car,
  },
  {
    code: "CID",
    name: "Suç Soruşturma Birimi",
    desc: "Ağır suç soruşturmaları, dedektif görevi ve delil toplama operasyonları.",
    Icon: Search,
  },
  {
    code: "SWAT",
    name: "Özel Harekat Timi",
    desc: "Yüksek riskli operasyonlar, rehine müzakeresi ve taktiksel müdahale.",
    Icon: Crosshair,
  },
  {
    code: "TFD",
    name: "Trafik Denetleme Birimi",
    desc: "Trafik ihlalleri, kaza soruşturması ve karayolu güvenlik kampanyaları.",
    Icon: AlertOctagon,
  },
  {
    code: "K9",
    name: "K9 Köpek Birimi",
    desc: "Arama-kurtarma operasyonları, uyuşturucu ve patlayıcı tespiti.",
    Icon: PawPrint,
  },
  {
    code: "ASD",
    name: "Hava Destek Birimi",
    desc: "Helikopter desteği, hava gözetleme ve uzaktan takip operasyonları.",
    Icon: Plane,
  },
]

export default function UnitsSection() {
  return (
    <section
      id="units"
      className="section-pad"
      style={{ borderBottom: "1px solid var(--color-line)" }}
    >
      <div className="container-max">
        <div className="kicker mb-4">05 / Birimler</div>
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
          Aktif Birimler
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {UNITS.map((unit) => (
            <div
              key={unit.code}
              className="relative p-6 group"
              style={{
                background: "var(--color-bg-2)",
                border: "1px solid var(--color-line)",
                transition: "border-color 0.2s",
              }}
            >
              {/* Top accent line */}
              <div
                className="absolute top-0 left-0 right-0 h-0.5"
                style={{ background: "var(--color-accent)", opacity: 0.4 }}
              />

              <div className="flex items-start gap-4">
                <div
                  className="flex-shrink-0 w-10 h-10 flex items-center justify-center"
                  style={{
                    background: "var(--color-bg-3)",
                    border: "1px solid var(--color-accent)",
                    color: "var(--color-accent)",
                  }}
                >
                  <unit.Icon size={18} strokeWidth={1.5} />
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.6rem",
                      letterSpacing: "0.2em",
                      color: "var(--color-accent)",
                      textTransform: "uppercase",
                      marginBottom: 4,
                    }}
                  >
                    {unit.code}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "1rem",
                      fontWeight: 600,
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                      color: "var(--color-txt)",
                      marginBottom: 8,
                    }}
                  >
                    {unit.name}
                  </div>
                  <p
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "0.88rem",
                      color: "var(--color-muted)",
                      lineHeight: 1.7,
                      fontWeight: 300,
                    }}
                  >
                    {unit.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
