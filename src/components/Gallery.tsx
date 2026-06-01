"use client"

import Image from "next/image"
import { useState, useEffect } from "react"

const FALLBACK_photos = [
  "/gallery/g01.png", "/gallery/g02.png", "/gallery/g03.png", "/gallery/g04.png",
  "/gallery/g05.png", "/gallery/g06.png", "/gallery/g07.png", "/gallery/g08.png",
  "/gallery/g09.png", "/gallery/g10.png", "/gallery/g11.png", "/gallery/g12.png",
  "/gallery/g13.png", "/gallery/g14.png", "/gallery/g15.png", "/gallery/g16.png",
]

export default function Gallery() {
  const [photos, setPhotos] = useState<string[]>(FALLBACK_photos)
  const [lightbox, setLightbox] = useState<number | null>(null)

  useEffect(() => {
    fetch("/api/gallery-images")
      .then((r) => r.ok ? r.json() : [])
      .then((d) => {
        if (Array.isArray(d) && d.length > 0) {
          setPhotos(d.map((img: { url: string }) => img.url))
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (lightbox === null || photos.length === 0) return
    const preload = [
      (lightbox + 1) % photos.length,
      lightbox > 0 ? lightbox - 1 : photos.length - 1,
    ]
    preload.forEach((i) => {
      const img = new window.Image()
      img.src = photos[i]
    })
  }, [lightbox, photos])

  return (
    <section
      id="gallery"
      className="section-pad"
      style={{ borderBottom: "1px solid var(--color-line)" }}
    >
      {/* Lightbox */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-[900] flex items-center justify-center"
          style={{ background: "oklch(0 0 0 / 0.92)" }}
          onClick={() => setLightbox(null)}
        >
          <button
            style={{ position: "absolute", left: 24, top: "50%", transform: "translateY(-50%)", background: "transparent", border: "1px solid var(--color-line)", color: "var(--color-txt)", padding: "12px 18px", cursor: "pointer", fontSize: "1.2rem", zIndex: 10 }}
            onClick={(e) => { e.stopPropagation(); setLightbox((p) => p! > 0 ? p! - 1 : photos.length - 1) }}
          >‹</button>
          <div
            style={{ position: "relative", width: "min(90vw, 1200px)", aspectRatio: "16/9" }}
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              key={lightbox}
              src={photos[lightbox]}
              alt={`Saha görüntüsü ${lightbox + 1}`}
              fill
              style={{ objectFit: "contain", animation: "lb-fade 0.18s ease" }}
              quality={95}
              sizes="90vw"
            />
          </div>
          <button
            style={{ position: "absolute", right: 24, top: "50%", transform: "translateY(-50%)", background: "transparent", border: "1px solid var(--color-line)", color: "var(--color-txt)", padding: "12px 18px", cursor: "pointer", fontSize: "1.2rem", zIndex: 10 }}
            onClick={(e) => { e.stopPropagation(); setLightbox((p) => p! < photos.length - 1 ? p! + 1 : 0) }}
          >›</button>
          <button
            style={{ position: "absolute", top: 20, right: 20, background: "transparent", border: "1px solid var(--color-line)", color: "var(--color-txt)", padding: "8px 14px", cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: "0.7rem" }}
            onClick={(e) => { e.stopPropagation(); setLightbox(null) }}
          >✕ Kapat</button>
          <div style={{ position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)", fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--color-faint)", letterSpacing: "0.14em" }}>
            {lightbox + 1} / {photos.length}
          </div>
        </div>
      )}

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
          {photos.map((src, i) => (
            <div
              key={i}
              className="gallery-item relative cursor-pointer group"
              style={{
                aspectRatio: "16/9",
                background: "var(--color-bg-3)",
                border: "1px solid var(--color-line)",
              }}
              onClick={() => setLightbox(i)}
            >
              <Image
                src={src}
                alt={`Saha görüntüsü ${i + 1}`}
                fill
                sizes="25vw"
                style={{ objectFit: "cover", transition: "opacity 0.2s" }}
                quality={85}
              />
              <div
                className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: "oklch(0 0 0 / 0.4)" }}
              >
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.18em", color: "#fff", textTransform: "uppercase" }}>
                  Büyüt
                </span>
              </div>
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
