import { Metadata } from 'next'
import ImageCropClient from './client'
import Link from 'next/link'
import { ChevronRight, PackageOpen, ImageIcon, RefreshCw, Scissors, Droplets } from 'lucide-react'
import Script from 'next/script'

export const metadata: Metadata = {
  title: "Free Image Cropper Online - Crop Images to Any Size | ToolHive",
  description: "Crop images online for free. Choose custom crop area, preset aspect ratios for social media, or circular crop for profile pictures. JPG, PNG, WebP supported. No signup required.",
  keywords: "image cropper, crop image online, crop photo free, circular crop, image crop tool, online photo crop, crop for instagram, crop for passport"
}

export default function ImageCropPage() {
  return (
    <>
      <Script id="schema-image-crop" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "Image Cropper - ToolHive",
        "url": "https://toolhive.in/image-crop",
        "applicationCategory": "MultimediaApplication",
        "operatingSystem": "Any",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        },
        "description": "Crop images online for free. Support for custom sizes, aspect ratios, and circular crop."
      }) }} />
      
      <ImageCropClient />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-12 py-8 mt-4 border-t border-border">
          
          <section>
            <h2 className="font-heading text-2xl font-bold mb-6">How to Crop an Image Online</h2>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              {[
                { step: "1", title: "Upload Image", desc: "Upload your JPG, PNG, GIF or WebP image." },
                { step: "2", title: "Select Ratio", desc: "Select a preset aspect ratio or drag to set a custom crop area." },
                { step: "3", title: "Adjust", desc: "Rotate, flip, zoom, or perfectly align the crop box." },
                { step: "4", title: "Download", desc: "Click Crop & Download to get your new image instantly." },
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
            <h2 className="font-heading text-2xl font-bold mb-6">Crop Sizes for Social Media (2025)</h2>
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="grid grid-cols-4 bg-muted/50 p-4 border-b border-border font-semibold text-sm uppercase tracking-wider">
                <div>Platform</div>
                <div>Type</div>
                <div>Ratio</div>
                <div>Size (px)</div>
              </div>
              {[
                { platform: "Instagram", type: "Square Post", ratio: "1:1", size: "1080×1080" },
                { platform: "Instagram", type: "Portrait Post", ratio: "4:5", size: "1080×1350" },
                { platform: "Instagram", type: "Story / Reel", ratio: "9:16", size: "1080×1920" },
                { platform: "Facebook", type: "Cover Photo", ratio: "~2.7:1", size: "820×312" },
                { platform: "YouTube", type: "Thumbnail", ratio: "16:9", size: "1280×720" },
                { platform: "Twitter / X", type: "Header", ratio: "3:1", size: "1500×500" },
                { platform: "LinkedIn", type: "Banner", ratio: "4:1", size: "1584×396" },
                { platform: "WhatsApp", type: "Profile Pic", ratio: "1:1", size: "500×500" },
              ].map((row, idx) => (
                <div key={idx} className="grid grid-cols-4 p-4 border-b border-border last:border-b-0 text-sm">
                  <div className="font-medium text-foreground">{row.platform}</div>
                  <div className="text-muted-foreground">{row.type}</div>
                  <div className="text-muted-foreground font-mono bg-muted/30 px-2 py-0.5 rounded-md w-max">{row.ratio}</div>
                  <div className="text-muted-foreground">{row.size}</div>
                </div>
              ))}
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <section>
              <h2 className="font-heading text-2xl font-bold mb-6">How to Make a Circular Profile Picture</h2>
              <div className="rounded-xl border border-border bg-card p-6 space-y-4">
                <ol className="list-decimal pl-5 space-y-3 text-muted-foreground">
                  <li><strong className="text-foreground">Upload your photo</strong> to the cropper tool.</li>
                  <li>Click the <strong className="text-foreground border-b border-dashed border-brand-orange">⬭ Circular Crop</strong> button in the shapes menu.</li>
                  <li>Adjust the crop area directly around your face using the resize handles.</li>
                  <li>Click <strong className="text-foreground border-b border-dashed border-brand-orange">Crop & Download</strong>. Your image will automatically be downloaded as a PNG to preserve the transparent corners outside the circle!</li>
                </ol>
              </div>
            </section>

            <section>
              <h2 className="font-heading text-2xl font-bold mb-6">Passport Photo Sizes by Country</h2>
              <div className="rounded-xl border border-border bg-card p-6 grid grid-cols-2 gap-y-4 text-sm">
                <div className="border-b border-border pb-2"><span className="text-muted-foreground">India:</span> <strong className="float-right text-foreground">35 × 45 mm</strong></div>
                <div className="border-b border-border pb-2 ml-4"><span className="text-muted-foreground">USA:</span> <strong className="float-right text-foreground">2 × 2 inch (51×51mm)</strong></div>
                <div className="border-b border-border pb-2"><span className="text-muted-foreground">UK:</span> <strong className="float-right text-foreground">35 × 45 mm</strong></div>
                <div className="border-b border-border pb-2 ml-4"><span className="text-muted-foreground">EU / Schengen:</span> <strong className="float-right text-foreground">35 × 45 mm</strong></div>
                <div className="border-b border-border pb-2"><span className="text-muted-foreground">China:</span> <strong className="float-right text-foreground">33 × 48 mm</strong></div>
                <div className="border-b border-border pb-2 ml-4"><span className="text-muted-foreground">Australia:</span> <strong className="float-right text-foreground">35 × 45 mm</strong></div>
                <div className="col-span-2 mt-2 p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground">
                  <span className="text-brand-orange font-semibold">Pro Tip:</span> Select the <strong className="text-foreground">🪪 Passport Photo</strong> mode to automatically format your crop, and use the "Create Print Sheet" feature to generate a ready-to-print 4×6 sheet with 6 aligned photos.
                </div>
              </div>
            </section>
          </div>

          <section>
            <h2 className="font-heading text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                { q: "Can I crop without losing quality?", a: "Yes. We use a high-quality local Canvas rendering engine. Setting the output quality to 95%+ ensures visually lossless results for JPG and WebP, and PNG is completely lossless natively." },
                { q: "Is my image uploaded to a server?", a: "No. Everything runs right in your browser. Your images never leave your device." },
                { q: "Can I make a circular profile picture?", a: "Absolutely! Click the \"Circular Crop\" option, adjust the area, and we will automatically clip your image and download it as a PNG with perfectly transparent corners." },
                { q: "What is the best size for Instagram?", a: "For Square posts use 1080×1080px (1:1 ratio). For Portrait posts use 1080×1350px (4:5 ratio). For Stories/Reels use 1080×1920px (9:16 ratio)." },
                { q: "Can I crop GIF images?", a: "Yes, but due to browser canvas limitations, only the first frame is kept. Animated GIFs will lose their animation and become a static image after cropping." },
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
                { icon: ImageIcon, title: "Image Resizer", href: "/image-resizer" },
                { icon: Scissors, title: "Background Remover", href: "/background-remover" },
                { icon: RefreshCw, title: "Image Converter", href: "/image-converter" }
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
