"use client"

import Link from "next/link"
import { motion } from "framer-motion"

interface ToolCardProps {
  icon: string
  name: string
  description: string
  href: string
}

export function ToolCard({ icon, name, description, href }: ToolCardProps) {
  return (
    <Link href={href} scroll={false} className="group block h-full">
      <motion.div
        whileHover={{ y: -5, scale: 1.02 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className="relative h-full rounded-2xl border border-border bg-card p-6 transition-colors duration-300 hover:border-brand-orange/40 hover:bg-card/80 group-hover:glow-orange-sm flex flex-col"
      >
        {/* Icon */}
        <div className="mb-5 flex size-14 items-center justify-center rounded-xl bg-gradient-to-br from-brand-orange/20 to-brand-orange/5 text-3xl shadow-inner border border-white/5 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
          {icon}
        </div>

        {/* Content */}
        <h3 className="mb-2 text-lg font-heading font-bold text-foreground transition-colors group-hover:text-brand-orange">
          {name}
        </h3>
        <p className="mb-6 text-sm leading-relaxed text-muted-foreground flex-1">
          {description}
        </p>

        {/* CTA */}
        <div className="mt-auto flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 text-sm font-bold text-muted-foreground transition-all group-hover:text-brand-orange group-hover:gap-2.5">
            Launch Tool
            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </span>
          <div className="size-8 rounded-full bg-muted/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:bg-brand-orange/10">
            <span className="text-brand-orange text-xs">↗</span>
          </div>
        </div>
      </motion.div>
    </Link>
  )
}
