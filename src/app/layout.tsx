import type { Metadata } from "next"
import { Inter, Syne } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import "./globals.css"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
})

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
})

export const metadata: Metadata = {
  title: {
    default: "ToolHive - Free Online Tools | Image, PDF, Video & More",
    template: "%s | ToolHive",
  },
  description:
    "Free online tools for images, PDFs, video, audio and calculations. No signup. No watermark. Works in browser.",
  keywords: [
    "free online tools",
    "image compressor",
    "pdf tools",
    "video tools",
    "online calculator",
    "file converter",
  ],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://toolhive.app",
    siteName: "ToolHive",
    title: "ToolHive - Free Online Tools | Image, PDF, Video & More",
    description:
      "Free online tools for images, PDFs, video, audio and calculations. No signup. No watermark. Works in browser.",
  },
  twitter: {
    card: "summary_large_image",
    title: "ToolHive - Free Online Tools",
    description:
      "50+ free browser tools for images, PDFs, video and more. No signup required.",
  },
}

import { Toaster } from "sonner"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${syne.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
          suppressHydrationWarning
        >
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <Toaster position="top-center" richColors />
        </ThemeProvider>
      </body>
    </html>
  )
}
