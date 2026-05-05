import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/30 mt-auto backdrop-blur-xl">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          {/* Brand */}
          <div className="md:col-span-5 space-y-4">
            <Link href="/" className="flex items-center gap-1.5 text-2xl font-heading font-bold group">
              <span className="text-foreground">Tool</span>
              <span className="text-3xl transition-transform duration-300 group-hover:rotate-12">🔥</span>
              <span className="text-brand-orange">Hive</span>
            </Link>
            <p className="text-muted-foreground leading-relaxed max-w-sm">
              The ultimate collection of highly-optimized, privacy-first, browser-based utilities for developers, designers, and creators.
            </p>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-4">
            <h3 className="text-sm font-bold font-heading uppercase tracking-widest text-foreground">
              Categories
            </h3>
            <ul className="space-y-3">
              {[
                { href: "/#image-tools", label: "Image Tools" },
                { href: "/#pdf-tools", label: "PDF Utilities" },
                { href: "/#video-tools", label: "Video Converters" },
                { href: "/#calculators", label: "Smart Calculators" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground transition-all hover:text-brand-orange hover:translate-x-1 inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div className="md:col-span-4 space-y-4">
            <h3 className="text-sm font-bold font-heading uppercase tracking-widest text-foreground">
              Company & Legal
            </h3>
            <ul className="space-y-3">
              {[
                { href: "/about", label: "About Us" },
                { href: "/contact", label: "Contact Support" },
                { href: "/privacy", label: "Privacy Policy" },
                { href: "/terms", label: "Terms of Service" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground transition-all hover:text-brand-orange hover:translate-x-1 inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 border-t border-border/50 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} ToolHive. All rights reserved. 100% Free Tools.
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 px-4 py-2 rounded-full border border-border/50">
            Made with <span className="text-brand-orange animate-bounce">♥</span> for the internet
          </div>
        </div>
      </div>
    </footer>
  )
}
