import { Metadata } from 'next'
import PDFSplitClient from './client'
import Link from 'next/link'
import { ChevronRight, PackageOpen, ImageIcon, AlertTriangle, FileText } from 'lucide-react'
import Script from 'next/script'

export const metadata: Metadata = {
  title: "Split PDF Online Free - Extract Pages from PDF | ToolHive",
  description: "Split PDF files into multiple documents online for free. Extract specific pages, split by range, or save every page separately. No signup, no watermark, works in browser.",
  keywords: "split pdf online free, extract pages from pdf, pdf splitter, separate pdf pages, cut pdf online, pdf page extractor free"
}

export default function PDFSplitPage() {
  return (
    <>
      <Script id="schema-pdf-split" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "Split PDF - ToolHive",
        "url": "https://toolhive.in/pdf-split",
        "applicationCategory": "ProductivityApplication",
        "operatingSystem": "Any",
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
        "description": "Split PDF files into multiple documents online for free. Extract specific pages, split by range, or save every page separately."
      }) }} />

      <PDFSplitClient />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-12 py-8 mt-4 border-t border-border">

          <section>
            <h2 className="font-heading text-2xl font-bold mb-6">How to Split a PDF Online</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { step: "1", title: "Upload PDF", desc: "Select your PDF file. Max 200MB supported." },
                { step: "2", title: "Choose Split Mode", desc: "Select pages visually, enter custom ranges, or split every N pages." },
                { step: "3", title: "Download", desc: "Click Split and download your newly separated PDF files instantly." },
              ].map((item) => (
                <div key={item.step} className="rounded-xl border border-border bg-card p-5 text-center">
                  <div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-full bg-brand-orange/10 text-brand-orange font-heading font-bold text-lg">{item.step}</div>
                  <h3 className="font-heading font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold mb-6">4 Ways to Split a PDF</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="font-heading font-bold text-lg mb-2 text-brand-orange">Extract Pages</div>
                <p className="text-sm text-muted-foreground">Handpick exactly which pages you want by clicking on their visual thumbnails. Perfect for grabbing a few specific pages out of a massive document.</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="font-heading font-bold text-lg mb-2 text-brand-orange">Split by Range</div>
                <p className="text-sm text-muted-foreground">Define custom page ranges (e.g., 1-5, 6-10) for each output file. You can create as many specific chunks as you need.</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="font-heading font-bold text-lg mb-2 text-brand-orange">Split Every N Pages</div>
                <p className="text-sm text-muted-foreground">Divide the document into equal, repeating chunks automatically. For example, turn a 100-page file into 20 documents of 5 pages each.</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="font-heading font-bold text-lg mb-2 text-brand-orange">Split All Pages</div>
                <p className="text-sm text-muted-foreground">Get every single page as its own individual PDF file. A 50-page document will be split into 50 separate files and downloaded as a ZIP.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold mb-6">Why Split PDF Files?</h2>
            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  "Extract one specific chapter from a large book",
                  "Separate individual invoices from a combined monthly statement",
                  "Share only relevant pages with clients instead of the full document",
                  "Reduce file size by removing unnecessary or blank pages",
                  "Extract specific slides or pages for a new presentation"
                ].map(item => (
                  <li key={item} className="flex items-start gap-3">
                    <div className="size-6 rounded-full bg-brand-orange/10 text-brand-orange flex items-center justify-center shrink-0 mt-0.5">✓</div>
                    <span className="text-sm text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold mb-6">Is It Safe to Split PDFs Online?</h2>
            <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-6 space-y-4">
              <p className="font-bold text-green-700 dark:text-green-400 text-lg mb-2">100% Private and Secure.</p>
              <p className="text-muted-foreground">Your PDF never leaves your device. Our tool uses <code>pdf-lib</code> to run the split operation entirely in your web browser. We cannot see, store, or access your documents. Everything happens locally on your machine.</p>
            </div>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                { q: "How many pages can I split?", a: "There is no page limit. The tool works locally with PDFs of any size up to 200MB." },
                { q: "Can I extract non-consecutive pages?", a: "Yes! Use the 'Extract Pages' mode and simply click on the individual page thumbnails to select non-consecutive pages." },
                { q: "Will the split PDFs have the same quality?", a: "Yes. The pages are copied exactly as-is. There is no quality loss, and all original fonts, vector graphics, and images are perfectly preserved." },
                { q: "Can I split a password protected PDF?", a: "Yes! The tool will prompt you to enter the password to unlock the file locally before splitting." },
                { q: "My PDF has 100 pages — will it be slow?", a: "The splitting process itself is extremely fast. However, generating the visual thumbnails for the preview may take 10-20 seconds for very large PDFs depending on your device." },
              ].map((item) => (
                <details key={item.q} className="group rounded-xl border border-border bg-card overflow-hidden">
                  <summary className="flex items-center justify-between cursor-pointer p-5 font-medium hover:bg-muted/50 transition-colors list-none">
                    {item.q}
                    <ChevronRight className="size-4 text-muted-foreground transition-transform duration-200 group-open:rotate-90" />
                  </summary>
                  <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">{item.a}</div>
                </details>
              ))}
            </div>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold mb-6">Related Tools</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: PackageOpen, title: "PDF Merge", href: "/pdf-merge" },
                { icon: PackageOpen, title: "PDF Compress", href: "#" },
                { icon: ImageIcon, title: "PDF to Image", href: "/pdf-to-image" },
                { icon: ImageIcon, title: "Image to PDF", href: "/image-to-pdf" }
              ].map((tool, idx) => (
                <Link key={idx} href={tool.href} className="flex flex-col items-center p-4 rounded-xl border border-border bg-card hover:border-brand-orange/50 hover:bg-muted/30 transition-all group">
                  <tool.icon className="size-8 mb-3 text-muted-foreground group-hover:text-brand-orange transition-colors" />
                  <span className="font-medium text-sm text-center">{tool.title}</span>
                </Link>
              ))}
            </div>
          </section>

        </div>
      </div>
    </>
  )
}
