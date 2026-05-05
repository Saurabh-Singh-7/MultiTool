import { Metadata } from 'next'
import WordCounterClient from './client'

export const metadata: Metadata = {
  title: "Word Counter & Text Analyzer Online | ToolHive",
  description: "Count words, characters, sentences, and paragraphs instantly. Analyze keyword density and reading time. Free online tool.",
  keywords: "word counter, character counter, text analyzer, reading time calculator, keyword density"
}

export default function WordCounterPage() {
  return (
    <div className="min-h-screen bg-background font-inter">
      <main className="max-w-6xl mx-auto px-4 py-12 md:py-24">
        <nav className="flex mb-8 text-sm text-muted-foreground" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center"><a href="/" className="hover:text-brand-orange transition-colors">Home</a></li>
            <li><div className="flex items-center"><span className="mx-2 text-zinc-400">/</span><span>Utilities</span></div></li>
            <li aria-current="page"><div className="flex items-center"><span className="mx-2 text-zinc-400">/</span><span className="text-brand-orange font-medium">Word Counter</span></div></li>
          </ol>
        </nav>

        <div className="text-center space-y-6 mb-16 relative z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight font-syne text-foreground">
            Word Counter & <span className="text-brand-orange relative inline-block">Analyzer<div className="absolute -bottom-2 left-0 w-full h-1 bg-brand-orange rounded-full opacity-50 blur-[2px]"></div></span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get instant live statistics on your text including word count, character count, and keyword density.
          </p>
        </div>

        <WordCounterClient />
      </main>
    </div>
  )
}
