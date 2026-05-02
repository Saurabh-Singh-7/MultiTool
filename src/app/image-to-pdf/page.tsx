import { Metadata } from 'next'
import ImageToPdfClient from './client'
import Link from 'next/link'
import { ChevronRight, PackageOpen, ImageIcon, Scissors, RefreshCw } from 'lucide-react'
import Script from 'next/script'

export const metadata: Metadata = {
  title: "Image to PDF Converter Free Online - JPG to PDF | ToolHive",
  description: "Convert JPG, PNG, WebP images to PDF online free. Combine multiple images into one PDF. Choose page size and orientation. No watermark.",
  keywords: "image to pdf, jpg to pdf, png to pdf, convert image to pdf free, multiple images to pdf online, combine images into pdf"
}

export default function ImageToPdfPage() {
  return (
    <>
      <Script id="schema-image-to-pdf" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "Image to PDF Converter - ToolHive",
        "url": "https://toolhive.in/image-to-pdf",
        "applicationCategory": "MultimediaApplication",
        "operatingSystem": "Any",
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
        "description": "Convert JPG, PNG, WebP images to PDF online for free. Combine multiple images into one PDF."
      }) }} />

      <ImageToPdfClient />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-12 py-8 mt-4 border-t border-border">

          <section>
            <h2 className="font-heading text-2xl font-bold mb-6">How to Convert Images to PDF</h2>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              {[
                { step: "1", title: "Upload Images", desc: "Drop or browse up to 30 JPG, PNG or WebP images." },
                { step: "2", title: "Arrange Order", desc: "Drag and drop thumbnails to set your desired page order." },
                { step: "3", title: "Choose Settings", desc: "Pick page size, orientation, margins, and layout." },
                { step: "4", title: "Download PDF", desc: "Click convert and download your PDF instantly." },
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
            <h2 className="font-heading text-2xl font-bold mb-6">Why Convert Images to PDF?</h2>
            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
              <ul className="space-y-4">
                {[
                  { title: "Easy Sharing", desc: "Combine multiple photos into a single file that anyone can open." },
                  { title: "Print-Ready", desc: "PDFs maintain exact dimensions and quality for professional printing." },
                  { title: "Universal Format", desc: "PDF works on every device and operating system without extra software." },
                  { title: "Document Archival", desc: "Preserve scanned documents, receipts, and notes in an organized format." },
                ].map(item => (
                  <li key={item.title} className="flex items-start gap-3">
                    <div className="size-6 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 mt-0.5">✓</div>
                    <div>
                      <strong className="text-foreground block">{item.title}</strong>
                      <span className="text-sm text-muted-foreground">{item.desc}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold mb-6">Supported Image Formats</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { format: "JPG / JPEG", desc: "The most common photo format. Best for photographs and complex images.", color: "text-blue-500" },
                { format: "PNG", desc: "Supports transparency. Ideal for screenshots, graphics, and logos.", color: "text-green-500" },
                { format: "WebP", desc: "Modern format with superior compression. Works great for web images.", color: "text-purple-500" },
              ].map(item => (
                <div key={item.format} className="rounded-xl border border-border bg-card p-5">
                  <div className={`font-heading font-bold text-lg mb-1 ${item.color}`}>{item.format}</div>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                { q: "Is this image to PDF converter free?", a: "Yes, 100% free with no signup or watermark. Your files never leave your browser." },
                { q: "How many images can I combine?", a: "You can combine up to 30 images into a single PDF document." },
                { q: "Can I choose the page order?", a: "Yes! Simply drag and drop the image thumbnails to arrange pages in your desired order." },
                { q: "What page sizes are supported?", a: "A3, A4, A5, US Letter, US Legal, and custom dimensions in millimeters." },
                { q: "Will the image quality be reduced?", a: "You can choose quality settings from Screen (72 DPI) to High (300 DPI) for maximum fidelity." },
                { q: "Can I put multiple images on one page?", a: "Yes! Choose 1, 2, or 4 images per page in the layout settings." },
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
                { icon: PackageOpen, title: "Image Compressor", href: "/image-compressor" },
                { icon: Scissors, title: "Image Cropper", href: "/image-crop" },
                { icon: RefreshCw, title: "Image Converter", href: "/image-converter" },
                { icon: ImageIcon, title: "Add Watermark", href: "/add-watermark" }
              ].map((tool) => (
                <Link key={tool.title} href={tool.href} className="flex flex-col items-center p-4 rounded-xl border border-border bg-card hover:border-brand-orange/50 hover:bg-muted/30 transition-all group">
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
