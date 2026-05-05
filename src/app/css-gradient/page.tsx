import { Metadata } from 'next'
import GradientClient from './client'
export const metadata: Metadata = { title: "CSS Gradient Generator Online Free | ToolHive", description: "Create beautiful CSS gradients visually. Linear, radial, and conic gradients. Copy CSS code instantly. Free online tool." }
export default function Page() {
  return (
    <div className="min-h-screen bg-background font-inter">
      <main className="max-w-5xl mx-auto px-4 py-12 md:py-24">
        <nav className="flex mb-8 text-sm text-muted-foreground"><ol className="inline-flex items-center space-x-1"><li><a href="/" className="hover:text-brand-orange transition-colors">Home</a></li><li><span className="mx-2 text-zinc-400">/</span><span className="text-brand-orange font-medium">CSS Gradient</span></li></ol></nav>
        <div className="text-center space-y-6 mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight font-syne">CSS Gradient <span className="text-brand-orange">Generator</span></h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Create stunning gradients visually and copy the CSS code with one click.</p>
        </div>
        <GradientClient />
      </main>
    </div>
  )
}
