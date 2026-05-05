import { Metadata } from 'next'
import InvoiceClient from './client'
export const metadata: Metadata = { title: "Invoice Generator Online Free | ToolHive", description: "Create professional invoices instantly. Add line items, taxes, discounts and download as PDF. Free invoice maker." }
export default function Page() {
  return (
    <div className="min-h-screen bg-background font-inter">
      <main className="max-w-5xl mx-auto px-4 py-12 md:py-24">
        <nav className="flex mb-8 text-sm text-muted-foreground"><ol className="inline-flex items-center space-x-1"><li><a href="/" className="hover:text-brand-orange transition-colors">Home</a></li><li><span className="mx-2 text-zinc-400">/</span><span className="text-brand-orange font-medium">Invoice Generator</span></li></ol></nav>
        <div className="text-center space-y-6 mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight font-syne">Invoice <span className="text-brand-orange">Generator</span></h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Create professional invoices and download as PDF. Free for freelancers and businesses.</p>
        </div>
        <InvoiceClient />
      </main>
    </div>
  )
}
