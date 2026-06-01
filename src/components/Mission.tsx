export default function Mission() {
  return (
    <section
      id="mission"
      className="section-pad"
      style={{ borderBottom: "1px solid var(--color-line)" }}
    >
      <div className="container-max" style={{ maxWidth: 720 }}>
        <div className="kicker mb-5">02 / Görev & Vizyon</div>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(2rem, 4vw, 3.2rem)",
            fontWeight: 700,
            textTransform: "uppercase",
            lineHeight: 1.05,
            color: "var(--color-txt)",
            marginBottom: 24,
          }}
        >
          Koru ve
          <br />
          <span style={{ color: "var(--color-accent)" }}>Hizmet Et</span>
        </h2>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "1rem",
            color: "var(--color-muted)",
            lineHeight: 1.8,
            marginBottom: 20,
            fontWeight: 300,
          }}
        >
          23rd Street Department olarak San Andreas eyaletinin her köşesinde düzeni
          sağlamak, vatandaşları korumak ve hukuku üstün kılmak için çalışıyoruz.
          Troopers kadromuz en yüksek standartlarda eğitim almış, göreve adanmış
          profesyonellerden oluşmaktadır.
        </p>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "1rem",
            color: "var(--color-muted)",
            lineHeight: 1.8,
            fontWeight: 300,
          }}
        >
          Karayolu devriyeleri, suç soruşturmaları, özel harekat operasyonları ve
          hava desteğiyle eyaletin güvenliğini 7/24 güvence altına alıyoruz.
        </p>

        <div className="flex gap-6 mt-8 flex-wrap">
          {["Disiplin", "Dürüstlük", "Kararlılık"].map((v) => (
            <div
              key={v}
              className="flex items-center gap-2"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.65rem",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "var(--color-accent)",
              }}
            >
              <span
                className="w-1 h-1 rounded-full"
                style={{ background: "var(--color-accent)" }}
              />
              {v}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
