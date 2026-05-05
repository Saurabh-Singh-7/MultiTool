import { Metadata } from 'next'
import MemeClient from './client'
export const metadata: Metadata = { title: "Meme Generator Online Free | ToolHive", description: "Create memes instantly. Upload images, add text, customize fonts and colors. Download and share. Free online meme maker." }
export default function Page() {
  return (
    <div className="min-h-screen bg-background font-inter">
      <main className="max-w-5xl mx-auto px-4 py-12 md:py-24">
        <nav className="flex mb-8 text-sm text-muted-foreground"><ol className="inline-flex items-center space-x-1"><li><a href="/" className="hover:text-brand-orange transition-colors">Home</a></li><li><span className="mx-2 text-zinc-400">/</span><span className="text-brand-orange font-medium">Meme Generator</span></li></ol></nav>
        <div className="text-center space-y-6 mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight font-syne">Meme <span className="text-brand-orange">Generator</span></h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Upload an image, add top and bottom text, customize and download your meme.</p>
        </div>
        <MemeClient />
      </main>
    </div>
  )
}
