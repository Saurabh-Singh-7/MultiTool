import { Metadata } from 'next'
import DateCalculatorClient from './client'

export const metadata: Metadata = {
  title: "Date Difference Calculator Online Free | ToolHive",
  description: "Calculate the exact number of days, weeks, months, and working days between two dates. Free online date difference calculator.",
  keywords: "date difference calculator, days between dates, working days calculator, business days calculator online"
}

export default function DateCalculatorPage() {
  return (
    <div className="min-h-screen bg-background font-inter">
      <main className="max-w-4xl mx-auto px-4 py-12 md:py-24">
        <nav className="flex mb-8 text-sm text-muted-foreground" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center"><a href="/" className="hover:text-brand-orange transition-colors">Home</a></li>
            <li><div className="flex items-center"><span className="mx-2 text-zinc-400">/</span><span>Utilities</span></div></li>
            <li aria-current="page"><div className="flex items-center"><span className="mx-2 text-zinc-400">/</span><span className="text-brand-orange font-medium">Date Calculator</span></div></li>
          </ol>
        </nav>

        <div className="text-center space-y-6 mb-16 relative z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight font-syne text-foreground">
            Date Difference <span className="text-brand-orange relative inline-block">Calculator<div className="absolute -bottom-2 left-0 w-full h-1 bg-brand-orange rounded-full opacity-50 blur-[2px]"></div></span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Calculate the exact number of days, weeks, months, and working days between two dates instantly.
          </p>
        </div>

        <DateCalculatorClient />
      </main>
    </div>
  )
}
