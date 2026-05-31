"use client"

import { useSession, signIn } from "next-auth/react"
import type { Officer, Activity } from "@/lib/types"

interface Props {
  officer?: Officer | null
  activities?: Activity[]
}

function StatBox({
  label,
  value,
  mono,
}: {
  label: string
  value: string | number
  mono: string
}) {
  return (
    <div
      className="flex flex-col p-4"
      style={{
        background: "var(--color-bg-3)",
        border: "1px solid var(--color-line)",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.55rem",
          letterSpacing: "0.2em",
          color: "var(--color-faint)",
          textTransform: "uppercase",
          marginBottom: 8,
        }}
      >
        {mono}
      </span>
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "2rem",
          fontWeight: 700,
          color: "var(--color-accent)",
          lineHeight: 1,
        }}
      >
        {value}
      </span>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.6rem",
          letterSpacing: "0.14em",
          color: "var(--color-muted)",
          textTransform: "uppercase",
          marginTop: 6,
        }}
      >
        {label}
      </span>
    </div>
  )
}

function LoginGate() {
  return (
    <div
      className="flex flex-col items-center justify-center py-28 gap-6"
      style={{
        border: "1px solid var(--color-line)",
        background: "var(--color-bg-2)",
      }}
    >
      <div
        className="w-16 h-16 flex items-center justify-center"
        style={{
          border: "2px solid var(--color-line)",
          background: "var(--color-bg-3)",
        }}
      >
        <svg
          width="28"
          height="28"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          style={{ color: "var(--color-faint)" }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      </div>
      <div className="text-center">
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.3rem",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            color: "var(--color-txt)",
          }}
        >
          Personel Girişi
        </div>
        <div
          className="mt-2"
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.9rem",
            color: "var(--color-muted)",
          }}
        >
          Profilinizi ve istatistiklerinizi görüntülemek için Discord ile giriş yapın.
        </div>
      </div>
      <button
        onClick={() => signIn("discord")}
        className="btn-clip flex items-center gap-3"
        style={{
          background: "#5865F2",
          color: "#fff",
          padding: "12px 28px",
          fontFamily: "var(--font-mono)",
          fontSize: "0.7rem",
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          fontWeight: 700,
          border: "none",
          cursor: "pointer",
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028 14.09 14.09 0 001.226-1.994.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03z" />
        </svg>
        Discord ile Giriş Yap
      </button>
    </div>
  )
}

export default function PersonnelPanel({ officer, activities = [] }: Props) {
  const { data: session, status } = useSession()

  return (
    <section
      id="panel"
      className="section-pad"
      style={{
        background: "var(--color-bg-2)",
        borderBottom: "1px solid var(--color-line)",
      }}
    >
      <div className="container-max">
        <div className="kicker mb-4">04 / Personel Paneli</div>
        <h2
          className="mb-8"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)",
            fontWeight: 700,
            textTransform: "uppercase",
            color: "var(--color-txt)",
          }}
        >
          Memur Profili
        </h2>

        {status === "loading" ? (
          <div
            className="flex items-center justify-center py-24"
            style={{
              color: "var(--color-faint)",
              fontFamily: "var(--font-mono)",
              fontSize: "0.7rem",
              letterSpacing: "0.16em",
            }}
          >
            YÜKLENİYOR…
          </div>
        ) : !session ? (
          <LoginGate />
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Profile card */}
            <div
              className="lg:col-span-1 p-6 flex flex-col gap-5"
              style={{
                background: "var(--color-bg-3)",
                border: "1px solid var(--color-line)",
              }}
            >
              {/* Avatar */}
              <div className="flex items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {session.user?.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={session.user.image}
                    alt="Profil"
                    className="rounded-full"
                    style={{
                      width: 60,
                      height: 60,
                      border: "2px solid var(--color-accent)",
                    }}
                  />
                ) : (
                  <div
                    className="rounded-full flex items-center justify-center"
                    style={{
                      width: 60,
                      height: 60,
                      background: "var(--color-bg-2)",
                      border: "2px solid var(--color-accent)",
                      fontFamily: "var(--font-display)",
                      fontSize: "1.2rem",
                      color: "var(--color-accent)",
                    }}
                  >
                    {session.user?.name?.[0]?.toUpperCase() ?? "?"}
                  </div>
                )}
                <div>
                  <div
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "1rem",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                      color: "var(--color-txt)",
                    }}
                  >
                    {officer?.name ?? session.user?.name ?? "Bilinmiyor"}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.6rem",
                      letterSpacing: "0.16em",
                      color: "var(--color-accent)",
                      textTransform: "uppercase",
                      marginTop: 2,
                    }}
                  >
                    {officer?.badgeNo ?? "—"}
                  </div>
                </div>
              </div>

              {/* Details */}
              {officer && (
                <>
                  <div
                    style={{
                      borderTop: "1px solid var(--color-line)",
                      paddingTop: 16,
                    }}
                  >
                    {[
                      { label: "Rütbe", value: officer.rank },
                      { label: "Birim", value: officer.unit },
                      { label: "Durum", value: officer.status },
                      {
                        label: "Kıdem",
                        value: `${Math.floor(officer.seniorityMonths / 12)} yıl ${officer.seniorityMonths % 12} ay`,
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="flex justify-between py-2"
                        style={{ borderBottom: "1px solid var(--color-line-soft)" }}
                      >
                        <span
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: "0.6rem",
                            letterSpacing: "0.14em",
                            color: "var(--color-faint)",
                            textTransform: "uppercase",
                          }}
                        >
                          {item.label}
                        </span>
                        <span
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: "0.65rem",
                            letterSpacing: "0.1em",
                            color: "var(--color-txt)",
                          }}
                        >
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Rank progress */}
                  {officer.nextRank && (
                    <div>
                      <div className="flex justify-between mb-2">
                        <span
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: "0.58rem",
                            letterSpacing: "0.14em",
                            color: "var(--color-faint)",
                            textTransform: "uppercase",
                          }}
                        >
                          Rütbe İlerlemesi
                        </span>
                        <span
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: "0.58rem",
                            color: "var(--color-accent)",
                          }}
                        >
                          {officer.rankProgress}%
                        </span>
                      </div>
                      <div
                        className="h-1 w-full"
                        style={{
                          background: "var(--color-bg-2)",
                          border: "1px solid var(--color-line)",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: `${officer.rankProgress}%`,
                            background: "var(--color-accent)",
                            transition: "width 1s ease",
                          }}
                        />
                      </div>
                      <div
                        className="mt-1 text-right"
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.55rem",
                          letterSpacing: "0.12em",
                          color: "var(--color-faint)",
                        }}
                      >
                        Sonraki: {officer.nextRank}
                      </div>
                    </div>
                  )}
                </>
              )}

              {!officer && (
                <div
                  className="py-4 text-center"
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.65rem",
                    letterSpacing: "0.12em",
                    color: "var(--color-faint)",
                    textTransform: "uppercase",
                  }}
                >
                  Discord hesabınız sistemde kayıtlı değil.
                  <br />
                  Yetkili ile iletişime geçin.
                </div>
              )}
            </div>

            {/* Right side */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              {/* Stats */}
              {officer && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <StatBox
                    label="Görev Saati"
                    value={officer.stats.dutyHours}
                    mono="G.SAATİ"
                  />
                  <StatBox
                    label="Devriye"
                    value={officer.stats.patrols}
                    mono="DEVRİYE"
                  />
                  <StatBox
                    label="Takdir"
                    value={officer.stats.commendations}
                    mono="TAKDİR"
                  />
                  <StatBox
                    label="İhtar"
                    value={officer.stats.warnings}
                    mono="İHTAR"
                  />
                </div>
              )}

              {/* Activities */}
              <div
                style={{
                  background: "var(--color-bg-3)",
                  border: "1px solid var(--color-line)",
                }}
              >
                <div
                  className="px-5 py-3"
                  style={{ borderBottom: "1px solid var(--color-line)" }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.62rem",
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      color: "var(--color-faint)",
                    }}
                  >
                    Son Aktiviteler
                  </span>
                </div>

                {activities.length === 0 ? (
                  <div
                    className="py-10 text-center"
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.62rem",
                      color: "var(--color-faint)",
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                    }}
                  >
                    {officer
                      ? "Henüz aktivite kaydı yok"
                      : "Kayıtlı profil bulunamadı"}
                  </div>
                ) : (
                  <div className="divide-y" style={{ borderColor: "var(--color-line-soft)" }}>
                    {activities.map((act) => (
                      <div key={act.id} className="flex items-start gap-4 px-5 py-3">
                        <div
                          className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                          style={{ background: "var(--color-accent)" }}
                        />
                        <div className="flex-1">
                          <div
                            style={{
                              fontFamily: "var(--font-body)",
                              fontSize: "0.88rem",
                              color: "var(--color-txt)",
                            }}
                          >
                            {act.title}
                          </div>
                          <div
                            style={{
                              fontFamily: "var(--font-mono)",
                              fontSize: "0.58rem",
                              letterSpacing: "0.1em",
                              color: "var(--color-faint)",
                              marginTop: 2,
                            }}
                          >
                            {act.meta}
                          </div>
                        </div>
                        <div
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: "0.58rem",
                            color: "var(--color-faint)",
                            letterSpacing: "0.08em",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {new Date(act.at).toLocaleDateString("tr-TR")}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
