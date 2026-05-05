import { Metadata } from 'next'
import LoremClient from './client'
export const metadata: Metadata = { title: "Lorem Ipsum Generator Online Free | ToolHive", description: "Generate lorem ipsum placeholder text for your designs. Paragraphs, sentences, or words. Free online." }
export default function Page() {
  return (
    <div className="min-h-screen bg-background font-inter">
      <main className="max-w-4xl mx-auto px-4 py-12 md:py-24">
        <nav className="flex mb-8 text-sm text-muted-foreground"><ol className="inline-flex items-center space-x-1"><li><a href="/" className="hover:text-brand-orange transition-colors">Home</a></li><li><span className="mx-2 text-zinc-400">/</span><span className="text-brand-orange font-medium">Lorem Ipsum</span></li></ol></nav>
        <div className="text-center space-y-6 mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight font-syne">Lorem Ipsum <span className="text-brand-orange">Generator</span></h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Generate placeholder text for your designs instantly.</p>
        </div>
        <LoremClient />
      </main>
    </div>
  )
}
