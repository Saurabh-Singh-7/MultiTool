import { Metadata } from 'next'
import UrlEncoderClient from './client'
export const metadata: Metadata = { title: "URL Encoder / Decoder Online Free | ToolHive", description: "Encode and decode URLs, Base64 strings, and HTML entities. Free online URL encoder decoder tool." }
export default function Page() {
  return (
    <div className="min-h-screen bg-background font-inter">
      <main className="max-w-4xl mx-auto px-4 py-12 md:py-24">
        <nav className="flex mb-8 text-sm text-muted-foreground"><ol className="inline-flex items-center space-x-1"><li><a href="/" className="hover:text-brand-orange transition-colors">Home</a></li><li><span className="mx-2 text-zinc-400">/</span><span className="text-brand-orange font-medium">URL Encoder</span></li></ol></nav>
        <div className="text-center space-y-6 mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight font-syne">URL Encoder / <span className="text-brand-orange">Decoder</span></h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Encode and decode URLs, Base64, and HTML entities instantly.</p>
        </div>
        <UrlEncoderClient />
      </main>
    </div>
  )
}
