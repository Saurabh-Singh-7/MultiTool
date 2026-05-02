import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with the ToolHive team. We'd love to hear from you.",
}

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-8">
        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
        <span>/</span>
        <span className="text-foreground font-medium">Contact</span>
      </nav>

      <h1 className="font-heading text-3xl font-bold mb-6">Contact Us</h1>

      <div className="space-y-6 text-muted-foreground">
        <p>
          Have a suggestion, bug report, or just want to say hello? We&apos;d love to hear from you.
        </p>

        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div>
            <h2 className="font-heading font-semibold text-foreground mb-1">📧 Email</h2>
            <p className="text-sm">hello@toolhive.app</p>
          </div>
          <div>
            <h2 className="font-heading font-semibold text-foreground mb-1">🐛 Bug Reports</h2>
            <p className="text-sm">
              Found a bug? Send us details about what happened, which tool you were using, 
              and your browser/OS — we&apos;ll fix it fast.
            </p>
          </div>
          <div>
            <h2 className="font-heading font-semibold text-foreground mb-1">💡 Feature Requests</h2>
            <p className="text-sm">
              Have an idea for a new tool? We&apos;re always looking to expand our toolkit.
              Share your ideas and we&apos;ll consider building it.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
