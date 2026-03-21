import type { Metadata } from "next"
import "./globals.css"
import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap');

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
      <body className={`${DM_Sans.variable} font-['DM_Sans'] bg-gradient-to-br from-slate-50 via-white to-[#e6c6ed]/20`}>
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