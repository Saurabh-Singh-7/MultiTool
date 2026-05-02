import { Metadata } from 'next'
import WatermarkRemoverClient from './client'
import Link from 'next/link'
import { ChevronRight, PackageOpen, ImageIcon, Scissors, AlertTriangle } from 'lucide-react'
import Script from 'next/script'

export const metadata: Metadata = {
  title: "Remove Watermark from Image Online Free | ToolHive",
  description: "Remove watermarks from images online for free. Erase text, logos and overlays from photos using AI inpainting. No signup required.",
  keywords: "watermark remover, remove watermark from image, erase watermark online free, remove text from image, photo watermark eraser"
}

export default function WatermarkRemoverPage() {
  return (
    <>
      <Script id="schema-watermark-remover" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "Watermark Remover - ToolHive",
        "url": "https://toolhive.in/watermark-remover",
        "applicationCategory": "MultimediaApplication",
        "operatingSystem": "Any",
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
        "description": "Remove watermarks from images online for free. Erase text, logos and overlays from photos."
      }) }} />

      <WatermarkRemoverClient />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 p-5 rounded-xl flex items-start gap-3 mb-12">
          <AlertTriangle className="size-6 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold mb-1">Important Legal Notice</h3>
            <p className="text-sm opacity-90">This tool is designed for removing watermarks from <strong>your own images</strong> only (e.g., recovering an original image after mistakenly flattening a draft). Removing watermarks from copyrighted images you do not own may violate copyright law and intellectual property rights. Use this tool responsibly.</p>
          </div>
        </div>

        <div className="space-y-12 py-8 mt-4 border-t border-border">

          <section>
            <h2 className="font-heading text-2xl font-bold mb-6">How to Remove Watermark from Image</h2>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              {[
                { step: "1", title: "Upload Image", desc: "Select a JPG, PNG, or WebP file. Your image remains private in your browser." },
                { step: "2", title: "Select Watermark", desc: "Use the Brush or Rectangle tools to highlight the watermark or text." },
                { step: "3", title: "Erase", desc: "Click Remove. Our algorithm reconstructs the background." },
                { step: "4", title: "Download", desc: "Compare before and after, then download the clean image." },
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
            <h2 className="font-heading text-2xl font-bold mb-6">Types of Watermarks We Can Remove</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="font-heading font-bold text-lg mb-2 text-brand-orange">Text Overlays & Timestamps</div>
                <p className="text-sm text-muted-foreground">Easily remove digital camera date stamps, website URLs, or custom text placed over images. The algorithm excels at removing thin, sharp lines of text and replacing them with surrounding background colors.</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="font-heading font-bold text-lg mb-2 text-blue-500">Logos & Graphics</div>
                <p className="text-sm text-muted-foreground">Small to medium-sized logos can be erased. The success rate depends heavily on the background behind the logo. If the logo is placed on a simple, consistent background (like a sky or a wall), the result will be seamless.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold mb-6">Limitations of Watermark Removal</h2>
            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
              <p className="text-muted-foreground mb-4">While our inpainting algorithm is powerful, it has physical limitations because it relies on surrounding pixels to "guess" what was behind the watermark:</p>
              <ul className="space-y-4">
                {[
                  { title: "Complex Backgrounds", desc: "If the watermark covers highly detailed textures (like a face, intricate patterns, or readable text), the algorithm cannot reconstruct those missing details. It will likely create a blur or a smudge." },
                  { title: "Massive Watermarks", desc: "Watermarks that cover the entire image or take up a huge percentage of the frame cannot be removed cleanly, as there are not enough clean surrounding pixels to sample from." },
                  { title: "Transparent Gradients", desc: "Faint, semi-transparent watermarks are sometimes harder to select cleanly. Use the Magic Select tool for best results on these." },
                ].map(item => (
                  <li key={item.title} className="flex items-start gap-3">
                    <div className="size-6 rounded-full bg-brand-orange/10 text-brand-orange flex items-center justify-center shrink-0 mt-0.5">⚠</div>
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
            <h2 className="font-heading text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                { q: "Is this tool completely free?", a: "Yes, our watermark remover is 100% free with no daily limits or sign-ups required." },
                { q: "Do you upload my images?", a: "No. All processing and inpainting algorithms run entirely locally in your web browser. Your privacy is guaranteed." },
                { q: "Why is the process taking so long?", a: "Inpainting is mathematically intensive. If you highlight a very large area on a high-resolution image, your browser has to calculate millions of pixel variations. For large images, try processing small parts of the watermark one at a time." },
                { q: "The result looks blurry, how do I fix it?", a: "Blurry results happen when the background is too complex. Try selecting a tighter area exactly around the watermark, rather than a large box, using the Brush tool." },
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
                { icon: ImageIcon, title: "Image Blur", href: "/image-blur" },
                { icon: ImageIcon, title: "Noise Remover", href: "/image-denoise" }
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
