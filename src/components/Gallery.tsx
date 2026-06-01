import Image from "next/image"

const PHOTOS = [
  "/gallery/g01.png",
  "/gallery/g02.png",
  "/gallery/g03.png",
  "/gallery/g04.png",
  "/gallery/g05.png",
  "/gallery/g06.png",
  "/gallery/g07.png",
  "/gallery/g08.png",
  "/gallery/g09.png",
  "/gallery/g10.png",
  "/gallery/g11.png",
  "/gallery/g12.png",
  "/gallery/g13.png",
  "/gallery/g14.png",
  "/gallery/g15.png",
  "/gallery/g16.png",
]

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

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 6,
          }}
        >
          {PHOTOS.map((src, i) => (
            <div
              key={i}
              className="gallery-item relative"
              style={{
                aspectRatio: "16/9",
                background: "var(--color-bg-3)",
                border: "1px solid var(--color-line)",
              }}
            >
              <Image
                src={src}
                alt={`Saha görüntüsü ${i + 1}`}
                fill
                sizes="25vw"
                style={{ objectFit: "cover" }}
                quality={85}
              />
              <div
                className="absolute top-0 left-0 w-3 h-3 z-10 pointer-events-none"
                style={{
                  borderTop: "1.5px solid var(--color-accent)",
                  borderLeft: "1.5px solid var(--color-accent)",
                }}
              />
              <div
                className="absolute bottom-0 right-0 w-3 h-3 z-10 pointer-events-none"
                style={{
                  borderBottom: "1.5px solid var(--color-line)",
                  borderRight: "1.5px solid var(--color-line)",
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
