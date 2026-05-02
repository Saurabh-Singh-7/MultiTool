import { Metadata } from 'next'
import ImageEnlargerClient from './client'
import Link from 'next/link'
import { ChevronRight, PackageOpen, ImageIcon, Scissors, RefreshCw } from 'lucide-react'
import Script from 'next/script'

export const metadata: Metadata = {
  title: "AI Image Enlarger Online Free - Upscale Image Without Losing Quality",
  description: "Enlarge and upscale images online for free using AI. Increase image resolution 2x, 4x without blurry results. Works in browser instantly.",
  keywords: "image enlarger, upscale image online, increase image resolution, ai image upscaler, enhance image quality, enlarge photo without blur"
}

export default function ImageEnlargerPage() {
  return (
    <>
      <Script id="schema-image-enlarger" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "AI Image Enlarger - ToolHive",
        "url": "https://toolhive.in/image-enlarger",
        "applicationCategory": "MultimediaApplication",
        "operatingSystem": "Any",
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
        "description": "Enlarge and upscale images online for free using AI. Increase image resolution 2x, 4x without blurry results."
      }) }} />

      <ImageEnlargerClient />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-12 py-8 mt-4 border-t border-border">

          <section>
            <h2 className="font-heading text-2xl font-bold mb-6">How to Enlarge an Image Without Losing Quality</h2>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              {[
                { step: "1", title: "Upload", desc: "Select a JPG, PNG, or WebP image under 10MB." },
                { step: "2", title: "Choose Scale", desc: "Select 2x, 4x, or 8x resolution increase." },
                { step: "3", title: "Select Mode", desc: "Pick AI Upscale for best quality or Fast for instant results." },
                { step: "4", title: "Download", desc: "Compare the before/after and save your enhanced image." },
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
            <h2 className="font-heading text-2xl font-bold mb-6">AI Upscaling vs Regular Upscaling</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="font-heading font-bold text-lg mb-2 text-brand-orange">AI Upscale (UpscalerJS)</div>
                <p className="text-sm text-muted-foreground mb-4">Uses a deep learning neural network model loaded directly in your browser. The AI analyzes the image context and literally "hallucinates" missing pixels to reconstruct edges, textures, and details that didn't exist in the original.</p>
                <ul className="text-sm space-y-2">
                  <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Extremely sharp results</li>
                  <li className="flex items-center gap-2"><span className="text-green-500">✓</span> No pixelation or blur</li>
                  <li className="flex items-center gap-2"><span className="text-muted-foreground">⏳</span> Takes 10-40 seconds</li>
                </ul>
              </div>
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="font-heading font-bold text-lg mb-2 text-blue-500">Fast Upscale (Bicubic)</div>
                <p className="text-sm text-muted-foreground mb-4">Uses progressive HTML5 Canvas bicubic interpolation. Instead of analyzing context, it mathematically calculates smooth transitions between existing pixels to scale the image up gracefully.</p>
                <ul className="text-sm space-y-2">
                  <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Instant processing</li>
                  <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Perfect for graphics & logos</li>
                  <li className="flex items-center gap-2"><span className="text-muted-foreground">⚠</span> Can look slightly soft/blurry</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold mb-6">Best Use Cases for Image Upscaling</h2>
            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
              <ul className="space-y-4">
                {[
                  { title: "Old Photos", desc: "Restore clarity to small digital photos from the early 2000s or low-res scans." },
                  { title: "AI Generation", desc: "Midjourney and DALL-E output 1024x1024 images. Upscale them to 4K for print or desktop wallpapers." },
                  { title: "E-Commerce", desc: "Make product photos meet the minimum dimension requirements for Amazon, Shopify, or eBay." },
                  { title: "Print Media", desc: "Convert 72 DPI web images into high-resolution 300 DPI files suitable for posters and canvas prints." },
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
            <h2 className="font-heading text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                { q: "Is this really free?", a: "Yes. Many AI upscalers charge per image because they run expensive GPUs on servers. Our tool runs the AI model directly on YOUR device's processor using WebGL, making it 100% free and private." },
                { q: "Why is the AI mode taking so long?", a: "AI upscaling is extremely computationally heavy. Depending on your device's graphics card (GPU) or processor (CPU), a 4x upscale could take anywhere from 5 seconds to over a minute." },
                { q: "Why is my file size so large after upscaling?", a: "A 4x upscale increases the total number of pixels by 16 times (4x width * 4x height). More pixels inherently means a larger file size. You can use our Image Compressor tool afterwards if you need a smaller file." },
                { q: "Is my image uploaded anywhere?", a: "No. Everything happens locally inside your web browser. Your images never leave your computer." },
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
