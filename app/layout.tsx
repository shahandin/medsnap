import type React from "react"
import type { Metadata } from "next"
import { Inter, Manrope } from "next/font/google"
import "./globals.css"
import { GlobalAIChat } from "@/components/global-ai-chat"
import { SessionTimeoutProvider } from "@/components/session-timeout-provider"

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${manrope.variable} antialiased`}>
      <body>
        <SessionTimeoutProvider>{children}</SessionTimeoutProvider>
        <GlobalAIChat />
      </body>
    </html>
  )
}
