import Image from "next/image"

const PHOTOS = [
  { src: "/gallery/g01.png", span: 2, ratio: "16/9" },
  { src: "/gallery/g02.png", span: 1, ratio: "4/3" },
  { src: "/gallery/g03.png", span: 1, ratio: "4/3" },
  { src: "/gallery/g04.png", span: 1, ratio: "4/3" },
  { src: "/gallery/g05.png", span: 1, ratio: "4/3" },
  { src: "/gallery/g06.png", span: 2, ratio: "16/9" },
  { src: "/gallery/g07.png", span: 1, ratio: "4/3" },
  { src: "/gallery/g08.png", span: 1, ratio: "4/3" },
  { src: "/gallery/g09.png", span: 2, ratio: "16/9" },
  { src: "/gallery/g10.png", span: 1, ratio: "4/3" },
  { src: "/gallery/g11.png", span: 1, ratio: "4/3" },
  { src: "/gallery/g12.png", span: 1, ratio: "4/3" },
  { src: "/gallery/g13.png", span: 1, ratio: "4/3" },
  { src: "/gallery/g14.png", span: 2, ratio: "16/9" },
  { src: "/gallery/g15.png", span: 1, ratio: "4/3" },
  { src: "/gallery/g16.png", span: 1, ratio: "4/3" },
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
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 8,
          }}
        >
          {PHOTOS.map((photo, i) => (
            <div
              key={i}
              className="relative overflow-hidden"
              style={{
                gridColumn: `span ${photo.span}`,
                aspectRatio: photo.ratio,
                background: "var(--color-bg-3)",
                border: "1px solid var(--color-line)",
              }}
            >
              <Image
                src={photo.src}
                alt={`Saha görüntüsü ${i + 1}`}
                fill
                sizes={photo.span === 2 ? "100vw" : "50vw"}
                style={{ objectFit: "cover" }}
                quality={85}
              />
              {/* corner accent */}
              <div
                className="absolute top-0 left-0 w-4 h-4 z-10 pointer-events-none"
                style={{
                  borderTop: "1.5px solid var(--color-accent)",
                  borderLeft: "1.5px solid var(--color-accent)",
                }}
              />
              <div
                className="absolute bottom-0 right-0 w-4 h-4 z-10 pointer-events-none"
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
