import { Metadata } from 'next'
import AddWatermarkClient from './client'
import Link from 'next/link'
import { ChevronRight, PackageOpen, ImageIcon, Scissors, RefreshCw, FileText } from 'lucide-react'
import Script from 'next/script'

export const metadata: Metadata = {
  title: "Add Watermark to Image Free Online - Text & Logo Watermark | ToolHive",
  description: "Add text or logo watermark to your images online for free. Customize position, opacity, font, size and color. Protect your photos instantly. No signup, no watermark on our end. Works in browser.",
  keywords: "add watermark to image, watermark photo online, text watermark, logo watermark, protect images online, image watermark free, watermark remover, add copyright to photo"
}

export default function AddWatermarkPage() {
  return (
    <>
      <Script id="schema-add-watermark" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "Add Watermark to Image - ToolHive",
        "url": "https://toolhive.in/add-watermark",
        "applicationCategory": "MultimediaApplication",
        "operatingSystem": "Any",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        },
        "description": "Add text or logo watermark to your images online for free. Protect your photos instantly."
      }) }} />
      
      <AddWatermarkClient />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-12 py-8 mt-4 border-t border-border">
          
          <section>
            <h2 className="font-heading text-2xl font-bold mb-6">How to Add Watermark to Image Online</h2>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              {[
                { step: "1", title: "Upload", desc: "Upload your JPG, PNG or WebP images." },
                { step: "2", title: "Choose Type", desc: "Select a custom text watermark or upload your own brand logo." },
                { step: "3", title: "Customize", desc: "Adjust position, tile pattern, size, and opacity on the live canvas." },
                { step: "4", title: "Download", desc: "Download instantly. Use batch mode to watermark multiple files." },
              ].map((item) => (
                <div key={item.step} className="rounded-xl border border-border bg-card p-5 text-center">
                  <div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-full bg-brand-orange/10 text-brand-orange font-heading font-bold text-lg">{item.step}</div>
                  <h3 className="font-heading font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <section>
              <h2 className="font-heading text-2xl font-bold mb-6">Text Watermark vs Logo Watermark</h2>
              <div className="rounded-xl border border-border bg-card p-6 space-y-6">
                <div>
                  <h3 className="font-bold text-foreground mb-2 flex items-center gap-2">📝 Text Watermark</h3>
                  <p className="text-sm text-muted-foreground mb-2"><strong>Best for:</strong> Copyright notices, photographer credits, simple text protection.</p>
                  <p className="text-sm text-muted-foreground mb-2"><strong>Examples:</strong> "© John Photography 2025", "Confidential"</p>
                  <p className="text-sm text-muted-foreground"><strong>Pros:</strong> No extra file needed, always readable, customizable fonts and colors.</p>
                </div>
                <div className="border-t border-border pt-4">
                  <h3 className="font-bold text-foreground mb-2 flex items-center gap-2">🖼️ Logo Watermark</h3>
                  <p className="text-sm text-muted-foreground mb-2"><strong>Best for:</strong> Brands, businesses, professional studios.</p>
                  <p className="text-sm text-muted-foreground mb-2"><strong>Examples:</strong> Company logo, signature graphic, custom artwork.</p>
                  <p className="text-sm text-muted-foreground mb-2"><strong>Pros:</strong> Highly professional, increases brand recognition.</p>
                  <p className="text-xs bg-brand-orange/10 text-brand-orange p-2 rounded border border-brand-orange/20 mt-2"><strong>Tip:</strong> Use a PNG with a transparent background for your logo to ensure it overlays cleanly without a white box.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-bold mb-6">Why Add a Watermark?</h2>
              <div className="rounded-xl border border-border bg-card p-6 space-y-4">
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="size-6 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 mt-0.5">✓</div>
                    <div>
                      <strong className="text-foreground block">Protect Copyright</strong>
                      <span className="text-sm text-muted-foreground">Prevent unauthorized use and scraping of your original photos.</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="size-6 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 mt-0.5">✓</div>
                    <div>
                      <strong className="text-foreground block">Brand Awareness</strong>
                      <span className="text-sm text-muted-foreground">Help people find your business when your images are shared on social media.</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="size-6 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 mt-0.5">✓</div>
                    <div>
                      <strong className="text-foreground block">Deter Theft</strong>
                      <span className="text-sm text-muted-foreground">Visible, tiled watermarks make it extremely difficult for thieves to claim the work as their own.</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="size-6 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 mt-0.5">✓</div>
                    <div>
                      <strong className="text-foreground block">Professional Look</strong>
                      <span className="text-sm text-muted-foreground">A subtle watermark shows that your work is original, protected, and valuable.</span>
                    </div>
                  </li>
                </ul>
              </div>
            </section>
          </div>

          <section>
            <h2 className="font-heading text-2xl font-bold mb-6">Watermark Opacity Guide</h2>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="font-bold text-foreground mb-1">10% - 30%</div>
                <p className="text-sm text-muted-foreground">Very subtle, barely visible. Perfect when combined with Tile Mode for a background pattern.</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="font-bold text-foreground mb-1">40% - 60%</div>
                <p className="text-sm text-muted-foreground">Subtle but visible. The sweet spot for casual photo protection without ruining the image.</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="font-bold text-brand-orange mb-1">70% - 80%</div>
                <p className="text-sm text-muted-foreground">Clearly visible. The industry standard for most use cases, copyright notices, and logos.</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="font-bold text-foreground mb-1">90% - 100%</div>
                <p className="text-sm text-muted-foreground">Very prominent and opaque. Provides maximum protection and visibility.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                { q: "Is this watermark tool really free?", a: "Yes, it is 100% free. There are no signups required, and we never add our own watermark to your images." },
                { q: "Is my image uploaded to a server?", a: "No. Everything runs right in your browser securely using HTML5 Canvas. Your images never leave your device." },
                { q: "Can I add a watermark to multiple images?", a: "Yes! Use the 'Batch Mode' toggle to upload up to 20 images at once. Your watermark settings will be applied to all of them, and you can download them all inside a single ZIP file." },
                { q: "What format should my logo be?", a: "A PNG file with a transparent background works best. This ensures only your logo graphic is visible, without any ugly white or black boxes around it." },
                { q: "Can I save my watermark settings for next time?", a: "Yes! Click 'Save as Preset' in the editor to save your exact configuration (text, font, size, position, etc.) to your browser's local storage for easy reuse." },
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
                { icon: ImageIcon, title: "Background Remover", href: "/background-remover" }
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
