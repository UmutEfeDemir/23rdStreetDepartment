import type { Officer } from "@/lib/types"
import { UNIT_LABELS } from "@/lib/types"

interface Props {
  officers: Officer[]
}

function Monogram({ name }: { name: string }) {
  const initials = name
    .split(/[\s.]/)
    .filter(Boolean)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <div
      className="rounded-full flex items-center justify-center text-lg font-bold"
      style={{
        width: 88,
        height: 88,
        background: "var(--color-bg-3)",
        border: "2px solid var(--color-accent)",
        fontFamily: "var(--font-display)",
        color: "var(--color-accent)",
        letterSpacing: "0.04em",
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  )
}

export default function CommandSection({ officers }: Props) {
  return (
    <section
      id="command"
      className="section-pad"
      style={{ borderBottom: "1px solid var(--color-line)" }}
    >
      <div className="container-max">
        <div className="kicker mb-4">01 / Komuta Kademesi</div>
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
          Üst Komuta
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {officers.map((officer) => (
            <div
              key={officer.id}
              className="relative flex flex-col items-center text-center p-6"
              style={{
                background: "var(--color-bg-2)",
                border: "1px solid var(--color-line)",
              }}
            >
              {/* Corner accent */}
              <div
                className="absolute top-0 left-0 w-4 h-4"
                style={{
                  borderTop: "2px solid var(--color-accent)",
                  borderLeft: "2px solid var(--color-accent)",
                }}
              />
              <div
                className="absolute bottom-0 right-0 w-4 h-4"
                style={{
                  borderBottom: "2px solid var(--color-line)",
                  borderRight: "2px solid var(--color-line)",
                }}
              />

              <Monogram name={officer.name} />

              {/* Badge */}
              <div
                className="mt-4 px-2 py-1"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.58rem",
                  letterSpacing: "0.2em",
                  color: "var(--color-accent-ink)",
                  background: "var(--color-accent)",
                  textTransform: "uppercase",
                }}
              >
                {officer.badgeNo}
              </div>

              <div
                className="mt-3"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  color: "var(--color-txt)",
                }}
              >
                {officer.name}
              </div>

              <div
                className="mt-1"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.65rem",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "var(--color-accent)",
                }}
              >
                {officer.rank}
              </div>

              <div
                className="mt-1"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.58rem",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "var(--color-faint)",
                }}
              >
                {UNIT_LABELS[officer.unit] ?? officer.unit}
              </div>

              {/* Status indicator */}
              <div className="mt-4 flex items-center gap-1.5">
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    background:
                      officer.status === "Görevde"
                        ? "var(--color-status-on)"
                        : officer.status === "Aktif"
                        ? "var(--color-accent)"
                        : "var(--color-faint)",
                  }}
                />
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.58rem",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color:
                      officer.status === "Görevde"
                        ? "var(--color-status-on)"
                        : officer.status === "Aktif"
                        ? "var(--color-accent)"
                        : "var(--color-faint)",
                  }}
                >
                  {officer.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
