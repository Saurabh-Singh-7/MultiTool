import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "ToolHive terms of service. Simple, fair terms for using our free online tools.",
}

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-8">
        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
        <span>/</span>
        <span className="text-foreground font-medium">Terms of Service</span>
      </nav>

      <h1 className="font-heading text-3xl font-bold mb-6">Terms of Service</h1>

      <div className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-muted-foreground">
        <p>
          <strong className="text-foreground">Last updated:</strong> January 1, 2025
        </p>

        <h2 className="font-heading text-xl font-semibold text-foreground">Usage</h2>
        <p>
          ToolHive provides free online tools for personal and commercial use. You may use our 
          tools without creating an account. We reserve the right to modify or discontinue 
          any tool at any time.
        </p>

        <h2 className="font-heading text-xl font-semibold text-foreground">Disclaimer</h2>
        <p>
          All tools are provided &ldquo;as is&rdquo; without warranty of any kind. We are not liable 
          for any data loss or damages resulting from the use of our tools.
        </p>

        <h2 className="font-heading text-xl font-semibold text-foreground">Intellectual Property</h2>
        <p>
          Files you process through our tools remain your property. We do not claim any 
          rights to your content. The ToolHive brand, design, and code are protected by 
          copyright.
        </p>

        <h2 className="font-heading text-xl font-semibold text-foreground">Contact</h2>
        <p>
          Questions? Visit our{" "}
          <Link href="/contact" className="text-brand-orange hover:underline">contact page</Link>.
        </p>
      </div>
    </div>
  )
}
