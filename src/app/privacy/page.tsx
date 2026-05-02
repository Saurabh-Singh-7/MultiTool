import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "ToolHive privacy policy. Learn how we handle your data — spoiler: we don't collect any.",
}

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-8">
        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
        <span>/</span>
        <span className="text-foreground font-medium">Privacy Policy</span>
      </nav>

      <h1 className="font-heading text-3xl font-bold mb-6">Privacy Policy</h1>

      <div className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-muted-foreground">
        <p>
          <strong className="text-foreground">Last updated:</strong> January 1, 2025
        </p>

        <h2 className="font-heading text-xl font-semibold text-foreground">Your Privacy Matters</h2>
        <p>
          ToolHive is built with privacy at its core. All tools run entirely in your browser. 
          We do not upload, store, or process any files you use with our tools. Your data never 
          leaves your device.
        </p>

        <h2 className="font-heading text-xl font-semibold text-foreground">Data We Collect</h2>
        <p>
          We collect minimal anonymous analytics data (page views, general location) to improve 
          our service. We do not use cookies for tracking, and we do not share any data with 
          third parties.
        </p>

        <h2 className="font-heading text-xl font-semibold text-foreground">Third-Party Services</h2>
        <p>
          We may use privacy-respecting analytics services. No advertising networks or 
          tracking scripts are used on this website.
        </p>

        <h2 className="font-heading text-xl font-semibold text-foreground">Contact</h2>
        <p>
          If you have questions about this policy, please reach out via our{" "}
          <Link href="/contact" className="text-brand-orange hover:underline">contact page</Link>.
        </p>
      </div>
    </div>
  )
}
