import type { Metadata } from "next"
import { DM_Sans } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/sonner"
import { SessionProvider } from "next-auth/react"
import { TooltipProvider } from "@/components/ui/tooltip"

const dmSans = DM_Sans({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-dm-sans"
})

export const metadata: Metadata = {
  title: "PLM Intelligence Platform",
  description: "Enterprise Product Lifecycle Management",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} font-['DM_Sans'] bg-gradient-to-br from-slate-50 via-white to-[#e6c6ed]/20`}>
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