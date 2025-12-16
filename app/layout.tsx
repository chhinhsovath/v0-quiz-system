import type React from "react"
import type { Metadata } from "next"
import { Hanuman } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { AuthProvider } from "@/lib/auth-context"
import { I18nProvider } from "@/lib/i18n-context"
import "./globals.css"

const hanuman = Hanuman({
  subsets: ["khmer", "latin"],
  weight: ["100", "300", "400", "700", "900"],
  variable: "--font-hanuman",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Quiz System - Advanced Testing Platform for Cambodia",
  description: "Professional quiz and testing platform with Khmer language support",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${hanuman.variable} font-sans antialiased`}>
        <I18nProvider>
          <AuthProvider>{children}</AuthProvider>
        </I18nProvider>
        <Analytics />
      </body>
    </html>
  )
}
