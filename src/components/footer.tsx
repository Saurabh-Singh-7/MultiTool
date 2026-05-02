import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/50 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-3">
            <Link href="/" className="flex items-center gap-1 text-xl font-heading font-bold">
              <span className="text-foreground">Tool</span>
              <span className="text-2xl">🔥</span>
              <span className="text-brand-orange">Hive</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              Your all-in-one toolbox for images, PDFs, videos, and more. 
              100% free, no signup required.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold font-heading uppercase tracking-wider text-foreground">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {[
                { href: "/#image-tools", label: "Image Tools" },
                { href: "/#pdf-tools", label: "PDF Tools" },
                { href: "/#video-tools", label: "Video Tools" },
                { href: "/#calculators", label: "Calculators" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-brand-orange"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold font-heading uppercase tracking-wider text-foreground">
              Company
            </h3>
            <ul className="space-y-2">
              {[
                { href: "/about", label: "About" },
                { href: "/contact", label: "Contact" },
                { href: "/privacy", label: "Privacy Policy" },
                { href: "/terms", label: "Terms of Service" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-brand-orange"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            © 2025 ToolHive. All tools are free to use.
          </p>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            Made with <span className="text-brand-orange animate-pulse">♥</span> for the web
          </div>
        </div>
      </div>
    </footer>
  )
}
