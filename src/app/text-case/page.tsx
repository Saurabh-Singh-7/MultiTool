import { Metadata } from 'next'
import TextCaseClient from './client'
export const metadata: Metadata = { title: "Text Case Converter Online Free | ToolHive", description: "Convert text to UPPERCASE, lowercase, Title Case, Sentence case, camelCase, snake_case, and more. Free online." }
export default function Page() {
  return (
    <div className="min-h-screen bg-background font-inter">
      <main className="max-w-4xl mx-auto px-4 py-12 md:py-24">
        <nav className="flex mb-8 text-sm text-muted-foreground"><ol className="inline-flex items-center space-x-1"><li><a href="/" className="hover:text-brand-orange transition-colors">Home</a></li><li><span className="mx-2 text-zinc-400">/</span><span className="text-brand-orange font-medium">Text Case Converter</span></li></ol></nav>
        <div className="text-center space-y-6 mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight font-syne">Text Case <span className="text-brand-orange">Converter</span></h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Convert text between UPPERCASE, lowercase, Title Case, camelCase, and more.</p>
        </div>
        <TextCaseClient />
      </main>
    </div>
  )
}
