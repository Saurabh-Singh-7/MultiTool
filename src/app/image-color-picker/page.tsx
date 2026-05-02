import { Metadata } from 'next'
import ImageColorPickerClient from './client'
import Link from 'next/link'
import { ChevronRight, PackageOpen, ImageIcon, Scissors, RefreshCw } from 'lucide-react'
import Script from 'next/script'

export const metadata: Metadata = {
  title: "Image Color Picker - Pick Any Color from Image Online | ToolHive",
  description: "Upload any image and pick colors from it. Get HEX, RGB, HSL, CMYK color codes instantly. Extract color palette from image. Free online.",
  keywords: "image color picker, pick color from image, color dropper online, extract color from image, color palette extractor, eyedropper tool online"
}

export default function ImageColorPickerPage() {
  return (
    <>
      <Script id="schema-image-color-picker" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "Image Color Picker - ToolHive",
        "url": "https://toolhive.in/image-color-picker",
        "applicationCategory": "DesignApplication",
        "operatingSystem": "Any",
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
        "description": "Upload any image and pick colors from it. Get HEX, RGB, HSL, CMYK color codes instantly. Extract color palette from image. Free online."
      }) }} />

      <ImageColorPickerClient />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-12 py-8 mt-4 border-t border-border">

          <section>
            <h2 className="font-heading text-2xl font-bold mb-6">How to Pick a Color from an Image</h2>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              {[
                { step: "1", title: "Upload Image", desc: "Drag and drop any JPG, PNG or WebP image." },
                { step: "2", title: "Hover", desc: "Move your cursor to preview zoomed pixels." },
                { step: "3", title: "Click", desc: "Click exactly on the pixel you want to extract." },
                { step: "4", title: "Copy Code", desc: "Copy the HEX, RGB, HSL, or CMYK values instantly." },
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
            <h2 className="font-heading text-2xl font-bold mb-6">How to Extract a Color Palette</h2>
            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
              <ul className="space-y-4">
                {[
                  { title: "One-Click Extraction", desc: "Click 'Extract Color Palette' to instantly generate a palette of the 8 most dominant colors in your image." },
                  { title: "Smart Algorithm", desc: "Our tool uses ColorThief to analyze pixel density and grouping to find true representative colors." },
                  { title: "Export Options", desc: "You can download the palette as a PNG image, or copy all the HEX codes as a comma-separated list." },
                  { title: "Design Inspiration", desc: "Perfect for web designers, illustrators, and UI/UX professionals building mood boards." },
                ].map(item => (
                  <li key={item.title} className="flex items-start gap-3">
                    <div className="size-6 rounded-full bg-brand-orange/10 text-brand-orange flex items-center justify-center shrink-0 mt-0.5">✓</div>
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
            <h2 className="font-heading text-2xl font-bold mb-6">Understanding Color Codes HEX vs RGB vs HSL</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { format: "HEX", desc: "Hexadecimal format (e.g. #F97316). The standard for web design (HTML/CSS) and most digital design tools.", color: "text-blue-500" },
                { format: "RGB", desc: "Red, Green, Blue (e.g. 249, 115, 22). Best for screens and digital displays. Used heavily in programmatic graphics.", color: "text-green-500" },
                { format: "HSL", desc: "Hue, Saturation, Lightness. The most intuitive way for humans to adjust colors (make it lighter or more vibrant).", color: "text-purple-500" },
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
                { q: "Is my image uploaded to your servers?", a: "No! The color picker runs entirely in your browser using HTML5 Canvas. Your images are never uploaded or stored, ensuring complete privacy." },
                { q: "Can I pick colors from a tiny detail?", a: "Yes, our tool features an 8x magnifying zoom lens that follows your cursor, allowing you to pick colors from a single, specific pixel." },
                { q: "What is the CMYK color code?", a: "CMYK stands for Cyan, Magenta, Yellow, and Key (Black). It is the color model used for physical printing, unlike RGB which is used for screens." },
                { q: "Can I save the colors I pick?", a: "Yes, the tool keeps a history of the last 20 colors you've picked so you can easily reference them." },
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
