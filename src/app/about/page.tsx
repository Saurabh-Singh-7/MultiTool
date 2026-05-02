import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "About ToolHive",
  description: "Learn about ToolHive — free online tools for images, PDFs, videos and more.",
}

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-8">
        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
        <span>/</span>
        <span className="text-foreground font-medium">About</span>
      </nav>

      <h1 className="font-heading text-3xl font-bold mb-6">About ToolHive</h1>

      <div className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-muted-foreground">
        <p className="text-lg">
          ToolHive is a collection of <strong className="text-foreground">50+ free online tools</strong> designed 
          to help you work with images, PDFs, videos, audio, and calculations — all without 
          creating an account or installing software.
        </p>

        <h2 className="font-heading text-xl font-semibold text-foreground">Our Mission</h2>
        <p>
          We believe essential tools should be free and accessible to everyone. Every tool on 
          ToolHive runs in your browser, ensuring your files stay private and secure on your device.
        </p>

        <h2 className="font-heading text-xl font-semibold text-foreground">No Signup, No Catch</h2>
        <p>
          There&apos;s no account required, no watermarks on your output, and no hidden premium 
          tiers. ToolHive is and will always be free to use.
        </p>

        <h2 className="font-heading text-xl font-semibold text-foreground">Built for Speed & Privacy</h2>
        <p>
          Our tools leverage modern browser APIs like Canvas, Web Workers, and WebAssembly to 
          deliver desktop-grade performance without sending a single byte to our servers.
        </p>
      </div>
    </div>
  )
}
