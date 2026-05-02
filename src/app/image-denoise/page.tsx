import { Metadata } from 'next'
import ImageDenoiseClient from './client'
import Link from 'next/link'
import { ChevronRight, PackageOpen, ImageIcon, Scissors, RefreshCw } from 'lucide-react'
import Script from 'next/script'

export const metadata: Metadata = {
  title: "Remove Noise from Image Online Free - Denoise Photo | ToolHive",
  description: "Remove grain and noise from photos online for free. Denoise images, reduce JPEG artifacts, smooth grainy photos. Works in browser.",
  keywords: "remove noise from image, denoise photo online, reduce grain photo, jpeg artifact remover, smooth grainy image, image enhancer online free"
}

export default function ImageDenoisePage() {
  return (
    <>
      <Script id="schema-image-denoise" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "Image Noise Remover - ToolHive",
        "url": "https://toolhive.in/image-denoise",
        "applicationCategory": "MultimediaApplication",
        "operatingSystem": "Any",
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
        "description": "Remove grain and noise from photos online for free. Denoise images, reduce JPEG artifacts, smooth grainy photos."
      }) }} />

      <ImageDenoiseClient />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-12 py-8 mt-4 border-t border-border">

          <section>
            <h2 className="font-heading text-2xl font-bold mb-6">How to Remove Noise from Photos</h2>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              {[
                { step: "1", title: "Upload", desc: "Select a JPG, PNG, or WebP image under 20MB." },
                { step: "2", title: "Select Preset", desc: "Choose 'Light Denoise' or 'Night Photo Fix' to instantly apply settings." },
                { step: "3", title: "Adjust Sliders", desc: "Fine-tune the noise reduction, smoothing, and sharpening strength." },
                { step: "4", title: "Download", desc: "Compare the before/after and save your enhanced, grain-free photo." },
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
            <h2 className="font-heading text-2xl font-bold mb-6">Types of Image Noise</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="font-heading font-bold text-lg mb-2">Luminance Noise</div>
                <p className="text-sm text-muted-foreground">The most common type of noise. It appears as a sandy, grainy texture over the entire image, similar to film grain. Our smoothing filters effectively blend these pixels back into their surrounding colors.</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="font-heading font-bold text-lg mb-2">Color (Chroma) Noise</div>
                <p className="text-sm text-muted-foreground">Appears as random splotches of red, green, and blue pixels, particularly in dark or shadowed areas of a photo. This is usually caused by high ISO settings on digital cameras.</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="font-heading font-bold text-lg mb-2">JPEG Artifacts</div>
                <p className="text-sm text-muted-foreground">Blocky, pixelated squares and "mosquito noise" around sharp edges caused by aggressive image compression. Our artifact remover smooths out these block boundaries.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold mb-6">When to Use Noise Reduction</h2>
            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
              <ul className="space-y-4">
                {[
                  { title: "Night & Low Light Photography", desc: "Cameras boost their sensor sensitivity (ISO) in the dark, which introduces heavy grain. Denoising cleans up the dark skies and shadows." },
                  { title: "Smartphone Zoom Photos", desc: "Digital zoom often results in highly pixelated, noisy images. A combination of smoothing and sharpening helps recover the photo." },
                  { title: "Old Scanned Photos", desc: "Scanners often pick up dust and physical print grain. A light noise reduction pass creates a cleaner digital copy." },
                  { title: "Heavily Compressed Web Images", desc: "Memes, screenshots, and downloaded graphics often suffer from JPEG compression. The artifact remover restores flat color areas." },
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
                { q: "Is this tool completely free?", a: "Yes. Our denoise tool runs completely inside your browser using HTML5 Canvas APIs, meaning it doesn't cost us server compute time, so we offer it to you for free." },
                { q: "Does removing noise make the image blurry?", a: "It can, because noise reduction fundamentally works by blending adjacent pixels. To combat this, we've included an 'Unsharp Mask' (Sharpen) feature. After smoothing out the noise, you can turn up the Sharpening slider to bring back edge clarity." },
                { q: "What does the 'JPEG Fix' preset do?", a: "It applies a targeted blur that specifically breaks down the 8x8 pixel blocks created by standard JPEG compression, and then slightly sharpens the image to maintain edge contrast." },
                { q: "Is my photo uploaded to your servers?", a: "No. Everything happens locally on your device. Your privacy is 100% protected because your files never leave your computer." },
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
                { icon: ImageIcon, title: "Image Enlarger", href: "/image-enlarger" }
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
