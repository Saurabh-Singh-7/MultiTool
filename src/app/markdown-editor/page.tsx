import { Metadata } from 'next'
import MarkdownClient from './client'
export const metadata: Metadata = { title: "Markdown Editor & Previewer Online | ToolHive", description: "Write and preview markdown in real-time. Supports GitHub Flavored Markdown. Free online editor." }
export default function Page() {
  return (
    <div className="min-h-screen bg-background font-inter">
      <main className="max-w-7xl mx-auto px-4 py-12 md:py-24">
        <nav className="flex mb-8 text-sm text-muted-foreground"><ol className="inline-flex items-center space-x-1"><li><a href="/" className="hover:text-brand-orange transition-colors">Home</a></li><li><span className="mx-2 text-zinc-400">/</span><span className="text-brand-orange font-medium">Markdown Editor</span></li></ol></nav>
        <div className="text-center space-y-6 mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight font-syne">Markdown <span className="text-brand-orange">Editor</span></h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Write markdown and see the live preview side by side.</p>
        </div>
        <MarkdownClient />
      </main>
    </div>
  )
}
