import { Metadata } from 'next'
import PDFMergeClient from './client'
import Link from 'next/link'
import { ChevronRight, PackageOpen, ImageIcon, Scissors, Braces } from 'lucide-react'
import Script from 'next/script'

export const metadata: Metadata = {
  title: "Merge PDF Files Online Free - Combine PDF into One | ToolHive",
  description: "Merge multiple PDF files into one online for free. Drag and drop to reorder pages. No signup, no watermark, works in browser. Fast and secure.",
  keywords: "merge pdf online free, combine pdf files, join pdf online, merge pdf into one, pdf merger free, combine multiple pdf"
}

export default function PDFMergePage() {
  return (
    <>
      <Script id="schema-pdf-merge" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "Merge PDF - ToolHive",
        "url": "https://toolhive.in/pdf-merge",
        "applicationCategory": "ProductivityApplication",
        "operatingSystem": "Any",
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
        "description": "Combine multiple PDF files into one online for free. Drag and drop to reorder pages."
      }) }} />

      <PDFMergeClient />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-12 py-8 mt-4 border-t border-border">

          <section>
            <h2 className="font-heading text-2xl font-bold mb-6">How to Merge PDF Files Online</h2>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              {[
                { step: "1", title: "Upload Files", desc: "Select two or more PDF files. You can upload up to 20 files at once." },
                { step: "2", title: "Reorder", desc: "Drag and drop the files to arrange them in the exact order you want them merged." },
                { step: "3", title: "Select Pages", desc: "Need only a few pages? Expand a file and select a custom page range." },
                { step: "4", title: "Merge & Download", desc: "Click Merge and download your newly combined PDF file instantly." },
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
            <h2 className="font-heading text-2xl font-bold mb-6">Why Merge PDF Files?</h2>
            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  "Combine multiple monthly reports into one annual document",
                  "Merge separately scanned pages into a single digital PDF",
                  "Join multiple chapters or sections of a book or manual",
                  "Combine invoices and receipts for easier accounting",
                  "Send one clean file instead of confusing people with many attachments"
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
            <h2 className="font-heading text-2xl font-bold mb-6">Is It Safe to Merge PDFs Online?</h2>
            <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-6 space-y-4">
              <p className="font-bold text-green-700 dark:text-green-400 text-lg mb-2">100% Private and Secure.</p>
              <p className="text-muted-foreground">Your files never leave your device. Our PDF Merge tool utilizes the powerful <code>pdf-lib</code> library to process everything locally directly within your web browser. We do not store, upload, or have any access to your private PDF documents. Once you close the tab, the data is gone forever.</p>
            </div>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                { q: "How many PDFs can I merge at once?", a: "You can merge up to 20 PDF files at one time using this tool." },
                { q: "Is there a file size limit?", a: "Each individual file can be up to 100MB. There is no hard limit on the total combined size, but extremely large merges may take a few seconds longer." },
                { q: "Can I merge password protected PDFs?", a: "Yes! If a PDF is encrypted, our tool will prompt you for the password. Once unlocked locally, it can be merged seamlessly." },
                { q: "Will the quality of my PDF change?", a: "No. We copy pages exactly as-is. Original images, embedded fonts, vector graphics, and formatting are perfectly preserved." },
                { q: "Can I choose specific pages from each PDF?", a: "Yes! Expand each file in the list and enter a custom page range like '1-5, 8, 10-12' to include only specific pages in the final document." },
                { q: "Are my PDFs uploaded to a server?", a: "No. This tool runs entirely in your browser. Your files are never uploaded or sent over the internet." },
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
                { icon: PackageOpen, title: "PDF Split", href: "#" },
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
