import { Metadata } from 'next'
import EmojiClient from './client'
export const metadata: Metadata = { title: "Emoji Picker & Search Online | ToolHive", description: "Search and copy emojis instantly. Browse by category or search by name. Free emoji keyboard online." }
export default function Page() {
  return (
    <div className="min-h-screen bg-background font-inter">
      <main className="max-w-5xl mx-auto px-4 py-12 md:py-24">
        <nav className="flex mb-8 text-sm text-muted-foreground"><ol className="inline-flex items-center space-x-1"><li><a href="/" className="hover:text-brand-orange transition-colors">Home</a></li><li><span className="mx-2 text-zinc-400">/</span><span className="text-brand-orange font-medium">Emoji Picker</span></li></ol></nav>
        <div className="text-center space-y-6 mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight font-syne">Emoji <span className="text-brand-orange">Picker</span></h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Search, browse, and copy emojis instantly. Click any emoji to copy it.</p>
        </div>
        <EmojiClient />
      </main>
    </div>
  )
}
