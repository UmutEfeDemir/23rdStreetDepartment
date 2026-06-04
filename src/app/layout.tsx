import type { Metadata } from "next"
import { Oswald, Barlow, JetBrains_Mono } from "next/font/google"
import Providers from "@/components/Providers"
import "./globals.css"

const oswald = Oswald({
  subsets: ["latin"],
  variable: "--font-oswald",
  weight: ["400", "500", "600", "700"],
})

const barlow = Barlow({
  subsets: ["latin"],
  variable: "--font-barlow",
  weight: ["300", "400", "500", "600", "700"],
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  weight: ["400", "500", "700"],
})

export const metadata: Metadata = {
  title: "23rd Street Department",
  description: "23rd Street Departmanı. Koru ve Hizmet Et.",
  keywords: "FiveM, GTA RP, SASP, San Andreas, polis, roleplay",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="tr"
      className={`${oswald.variable} ${barlow.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
