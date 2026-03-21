import type { Metadata } from "next"
import { DM_Sans } from "next/font/google"
import "./globals.css"
import { SessionProvider } from "next-auth/react"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "sonner"

const DMsans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["400", "500", "600", "700", "800"],
})

export const metadata: Metadata = {
  title: "PLM Intelligence Platform",
  description: "Engineering Change Order Management",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body
        className={`${DMsans.variable} font-['DM_Sans'] bg-gradient-to-br from-slate-50 via-white to-[#e6c6ed]/20`}
      >
        <SessionProvider>
          <TooltipProvider>
            {children}
          </TooltipProvider>
        </SessionProvider>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
