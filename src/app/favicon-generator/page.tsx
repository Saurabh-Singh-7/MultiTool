import { Metadata } from 'next'
import FaviconClient from './client'
export const metadata: Metadata = { title: "Favicon Generator Online Free | ToolHive", description: "Convert any image to favicon .ico format. Generate all sizes for web, iOS, and Android. Free online tool." }
export default function Page() {
  return (
    <div className="min-h-screen bg-background font-inter">
      <main className="max-w-4xl mx-auto px-4 py-12 md:py-24">
        <nav className="flex mb-8 text-sm text-muted-foreground"><ol className="inline-flex items-center space-x-1"><li><a href="/" className="hover:text-brand-orange transition-colors">Home</a></li><li><span className="mx-2 text-zinc-400">/</span><span className="text-brand-orange font-medium">Favicon Generator</span></li></ol></nav>
        <div className="text-center space-y-6 mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight font-syne">Favicon <span className="text-brand-orange">Generator</span></h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Upload an image and generate favicons for web, iOS, and Android in all required sizes.</p>
        </div>
        <FaviconClient />
      </main>
    </div>
  )
}
