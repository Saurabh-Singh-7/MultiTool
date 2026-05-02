import Link from "next/link"

interface ToolCardProps {
  icon: string
  name: string
  description: string
  href: string
}

export function ToolCard({ icon, name, description, href }: ToolCardProps) {
  return (
    <Link href={href} className="group block">
      <div className="relative h-full rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand-orange/50 hover:shadow-lg hover:shadow-brand-orange/5 group-hover:glow-orange-sm">
        {/* Icon */}
        <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-brand-orange/10 text-2xl transition-transform duration-300 group-hover:scale-110">
          {icon}
        </div>

        {/* Content */}
        <h3 className="mb-2 font-heading font-semibold text-foreground transition-colors group-hover:text-brand-orange">
          {name}
        </h3>
        <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>

        {/* CTA */}
        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-orange transition-all group-hover:gap-2.5">
          Use Tool
          <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
        </span>
      </div>
    </Link>
  )
}
