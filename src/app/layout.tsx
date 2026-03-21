import type { Metadata } from "next"
import "./globals.css"

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