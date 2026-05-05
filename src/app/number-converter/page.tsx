import { Metadata } from 'next'
import NumberConverterClient from './client'

export const metadata: Metadata = {
  title: "Number System Converter Online | ToolHive",
  description: "Convert numbers between Decimal, Binary, Octal, and Hexadecimal instantly. Free online number system converter.",
  keywords: "number system converter, binary to decimal, hex to decimal, octal converter, base converter"
}

export default function NumberConverterPage() {
  return (
    <div className="min-h-screen bg-background font-inter">
      <main className="max-w-4xl mx-auto px-4 py-12 md:py-24">
        <nav className="flex mb-8 text-sm text-muted-foreground" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center"><a href="/" className="hover:text-brand-orange transition-colors">Home</a></li>
            <li><div className="flex items-center"><span className="mx-2 text-zinc-400">/</span><span>Utilities</span></div></li>
            <li aria-current="page"><div className="flex items-center"><span className="mx-2 text-zinc-400">/</span><span className="text-brand-orange font-medium">Number Converter</span></div></li>
          </ol>
        </nav>

        <div className="text-center space-y-6 mb-16 relative z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight font-syne text-foreground">
            Number System <span className="text-brand-orange relative inline-block">Converter<div className="absolute -bottom-2 left-0 w-full h-1 bg-brand-orange rounded-full opacity-50 blur-[2px]"></div></span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Convert values between Binary, Octal, Decimal, and Hexadecimal bases in real-time.
          </p>
        </div>

        <NumberConverterClient />
      </main>
    </div>
  )
}
