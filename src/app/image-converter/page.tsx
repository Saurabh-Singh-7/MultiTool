import { Metadata } from 'next'
import ImageConverterClient from './client'
import Link from 'next/link'
import { ChevronRight, PackageOpen, ImageIcon, Crop, Droplets, ArrowRight, Scissors } from 'lucide-react'
import Script from 'next/script'

export const metadata: Metadata = {
  title: "Free Image Converter Online - Convert JPG, PNG, WebP, GIF | ToolHive",
  description: "Convert images between JPG, PNG, WebP, GIF, BMP formats online for free. Batch convert up to 20 images at once. No signup, no watermark. Works 100% in your browser.",
  keywords: "image converter, convert jpg to png, png to webp, webp to jpg, image format converter online, batch image converter, gif to jpg, bmp converter online free"
}

export default function ImageConverterPage() {
  return (
    <>
      <Script id="schema-image-converter" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "Image Converter - ToolHive",
        "url": "https://toolhive.in/image-converter",
        "applicationCategory": "MultimediaApplication",
        "operatingSystem": "Any",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        },
        "description": "Convert images between JPG, PNG, WebP, GIF, BMP formats online for free."
      }) }} />
      
      <ImageConverterClient />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-12 py-8 mt-4 border-t border-border">
          
          <section>
            <h2 className="font-heading text-2xl font-bold mb-6">How to Convert Image Format Online</h2>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              {[
                { step: "1", title: "Upload Images", desc: "Upload one or multiple images (up to 20 files)." },
                { step: "2", title: "Select Format", desc: "Choose output format — JPG, PNG, WebP, GIF or BMP." },
                { step: "3", title: "Adjust Settings", desc: "Adjust quality or transparency fill if needed." },
                { step: "4", title: "Convert & Save", desc: "Click Convert and download your files individually or as a ZIP." },
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
            <h2 className="font-heading text-2xl font-bold mb-6">Supported Image Conversions</h2>
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="grid grid-cols-2 bg-muted/50 p-4 border-b border-border font-semibold text-sm uppercase tracking-wider">
                <div>From Format</div>
                <div>To Supported Formats</div>
              </div>
              {[
                { from: "JPG", to: "PNG, WebP, GIF, BMP" },
                { from: "PNG", to: "JPG, WebP, GIF, BMP" },
                { from: "WebP", to: "JPG, PNG, GIF, BMP" },
                { from: "GIF", to: "JPG, PNG, WebP, BMP" },
                { from: "BMP", to: "JPG, PNG, WebP, GIF" },
              ].map((row, idx) => (
                <div key={idx} className="grid grid-cols-2 p-4 border-b border-border last:border-b-0 text-sm">
                  <div className="font-medium">{row.from}</div>
                  <div className="text-muted-foreground flex items-center gap-2">
                    <ArrowRight className="size-4" /> {row.to}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold mb-6">JPG vs PNG vs WebP — Which is Best?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="font-heading text-lg font-bold mb-2 text-blue-500">JPG (JPEG)</h3>
                <p className="text-muted-foreground text-sm">Best for photos. Produces smaller file sizes using lossy compression. Does not support transparent backgrounds.</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="font-heading text-lg font-bold mb-2 text-green-500">PNG</h3>
                <p className="text-muted-foreground text-sm">Best for logos and graphics. Uses lossless compression (no quality loss) and fully supports transparent backgrounds.</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="font-heading text-lg font-bold mb-2 text-purple-500">WebP</h3>
                <p className="text-muted-foreground text-sm">Best for web delivery. Offers the smallest file sizes (up to 35% smaller than JPG/PNG) and supports transparency. Modern browsers only.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold mb-6">Why Convert Image Formats?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: "⚡", title: "Website speed", desc: "WebP loads up to 30% faster than JPG." },
                { icon: "🏁", title: "Transparency", desc: "Only PNG/WebP/GIF support transparent backgrounds." },
                { icon: "🔄", title: "Compatibility", desc: "Some legacy software only accepts specific formats like BMP or JPG." },
                { icon: "📉", title: "File size", desc: "Convert PNG to JPG to reduce size by up to 70%." },
                { icon: "🖨️", title: "Print quality", desc: "Some printers require specific formats for best results." },
              ].map((item) => (
                <div key={item.title} className="rounded-xl border border-border bg-card p-5 flex gap-4">
                  <span className="text-2xl flex-shrink-0">{item.icon}</span>
                  <div>
                    <h3 className="font-heading font-semibold mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                { q: "Does converting lose image quality?", a: "PNG to PNG is lossless (no quality loss). Converting to JPG or WebP applies compression — use 90%+ quality to keep it visually identical." },
                { q: "Are my images uploaded to a server?", a: "No. All conversion happens entirely in your browser using the Canvas API. Your images never leave your device, ensuring total privacy." },
                { q: "Can I convert multiple images at once?", a: "Yes! Upload up to 20 images and convert them all at once. Download individually or as a single ZIP file." },
                { q: "Why is PNG bigger than JPG?", a: "PNG is lossless (meaning it has no compression artifacts), so files are naturally larger. Use JPG for complex photos, and PNG for graphics, text, or logos." },
                { q: "Does WebP work everywhere?", a: "WebP works in all modern browsers (Chrome, Firefox, Safari 14+, Edge). Avoid it for older software compatibility or legacy email clients." },
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
                { icon: Scissors, title: "Background Remover", href: "/background-remover" },
                { icon: ImageIcon, title: "Image Resizer", href: "/image-resizer" },
                { icon: Crop, title: "Image Cropper", href: "/#image-tools" }
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
