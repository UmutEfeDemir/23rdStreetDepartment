const SLOTS = Array.from({ length: 6 }, (_, i) => i + 1)

export default function Gallery() {
  return (
    <section
      id="gallery"
      className="section-pad"
      style={{ borderBottom: "1px solid var(--color-line)" }}
    >
      <div className="container-max">
        <div className="kicker mb-4">06 / Galeri</div>
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
          Saha Görüntüleri
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {SLOTS.map((n) => (
            <div
              key={n}
              className="relative overflow-hidden"
              style={{
                aspectRatio: n === 1 || n === 6 ? "16/9" : "4/3",
                gridColumn: n === 1 || n === 6 ? "span 2" : "span 1",
                background: "var(--color-bg-3)",
                border: "1px solid var(--color-line)",
                borderRadius: 4,
              }}
            >
              {/* Corner decorations */}
              <div
                className="absolute top-0 left-0 w-4 h-4 z-10"
                style={{
                  borderTop: "1.5px solid var(--color-accent)",
                  borderLeft: "1.5px solid var(--color-accent)",
                }}
              />
              <div
                className="absolute bottom-0 right-0 w-4 h-4 z-10"
                style={{
                  borderBottom: "1.5px solid var(--color-line)",
                  borderRight: "1.5px solid var(--color-line)",
                }}
              />

              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                <svg
                  width="28"
                  height="28"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  style={{ color: "oklch(0.34 0.012 75 / 0.4)" }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.55rem",
                    letterSpacing: "0.18em",
                    color: "oklch(0.34 0.012 75 / 0.35)",
                    textTransform: "uppercase",
                  }}
                >
                  Görsel {n.toString().padStart(2, "0")}
                </span>
              </div>
            </div>
          ))}
        </div>

        <p
          className="mt-4 text-center"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.6rem",
            letterSpacing: "0.14em",
            color: "var(--color-faint)",
            textTransform: "uppercase",
          }}
        >
          Görseller admin panelden yüklenebilir
        </p>
      </div>
    </section>
  )
}
