import type { Metadata } from "next"
import { TooltipProvider } from "@/components/ui/tooltip"
import "./globals.css"

export const metadata: Metadata = {
  title: "OmniPro 220 shop tech — Prox challenge",
  description:
    "Multimodal reasoning agent for the Vulcan OmniPro 220. Duty cycle, polarity, weld diagnosis — with diagrams, not just text.",
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-[#0e0f0c] text-[#f3eee4]">
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  )
}
