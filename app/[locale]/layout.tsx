import type React from "react"
import type { Metadata } from "next"
import { Inter, Manrope } from "next/font/google"
import "../globals.css"
import { GlobalAIChat } from "@/components/global-ai-chat"
import { SessionTimeoutProvider } from "@/components/session-timeout-provider"
import { NextIntlClientProvider } from "next-intl"
import { getMessages } from "next-intl/server"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-manrope",
})

export const metadata: Metadata = {
  title: "Benefit Bridge - Medicaid & SNAP Applications",
  description: "Streamlined applications for Medicaid and SNAP benefits. Access your benefits with confidence.",
  generator: "v0.app",
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: Readonly<{
  children: React.ReactNode
  params: { locale: string }
}>) {
  const messages = await getMessages()

  return (
    <html lang={locale} className={`${inter.variable} ${manrope.variable} antialiased`}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <SessionTimeoutProvider>{children}</SessionTimeoutProvider>
          <GlobalAIChat />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "es" }]
}
