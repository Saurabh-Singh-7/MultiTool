import { Metadata } from 'next'
import BackgroundRemoverClient from './client'
import Link from 'next/link'
import { ChevronRight, PackageOpen, ImageIcon, Crop, Droplets } from 'lucide-react'
import Script from 'next/script'

export const metadata: Metadata = {
  title: "Free Background Remover Online - Remove Image Background Instantly | ToolHive",
  description: "Remove background from any image online for free using AI. Download transparent PNG instantly. No signup, no watermark. Works in browser. Perfect for product photos, profile pictures, logos and more.",
  keywords: "background remover, remove background from image, transparent background, remove bg free, ai background remover, photo background eraser, remove background online"
}

export default function BackgroundRemoverPage() {
  return (
    <>
      <Script id="schema-background-remover" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "Background Remover - ToolHive",
        "url": "https://toolhive.in/background-remover",
        "applicationCategory": "MultimediaApplication",
        "operatingSystem": "Any",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        },
        "description": "Remove background from images online free using AI"
      }) }} />
      
      <BackgroundRemoverClient />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-12 py-8 mt-4 border-t border-border">
          
          <section>
            <h2 className="font-heading text-2xl font-bold mb-6">How to Remove Image Background Online</h2>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              {[
                { step: "1", title: "Upload Image", desc: "Upload your JPG, PNG or WebP photo to the drop zone." },
                { step: "2", title: "AI Detects", desc: "AI automatically detects and removes the background." },
                { step: "3", title: "Edit Background", desc: "Choose a new background or keep it transparent." },
                { step: "4", title: "Download", desc: "Download your new image as PNG or JPG instantly." },
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
            <h2 className="font-heading text-2xl font-bold mb-6">What Makes Our Background Remover Different?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: "🎁", title: "100% Free", desc: "No hidden charges ever, completely free to use." },
                { icon: "🤖", title: "AI-Powered", desc: "Handles hair, fur, complex edges flawlessly." },
                { icon: "🔒", title: "Runs in Browser", desc: "Your image is never uploaded to any server." },
                { icon: "✨", title: "No Watermark", desc: "Download the full quality image for free." },
                { icon: "⚡", title: "Instant", desc: "Get results in just 2-5 seconds locally." },
                { icon: "🚀", title: "No Signup", desc: "No account needed, just start using it." },
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
            <h2 className="font-heading text-2xl font-bold mb-6">Best Uses for Background Removal</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="font-heading text-lg font-bold mb-2 flex items-center gap-2">📦 Product Photography</h3>
                <p className="text-muted-foreground text-sm">Remove background from product photos for Amazon, Flipkart, Shopify listings. White background required by most marketplaces.</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="font-heading text-lg font-bold mb-2 flex items-center gap-2">👤 Profile Pictures</h3>
                <p className="text-muted-foreground text-sm">Create professional headshots with clean backgrounds for LinkedIn, company websites, and resumes.</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="font-heading text-lg font-bold mb-2 flex items-center gap-2">🪪 ID & Passport Photos</h3>
                <p className="text-muted-foreground text-sm">Remove background and replace with white or light blue for official documents and applications.</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="font-heading text-lg font-bold mb-2 flex items-center gap-2">🎨 Graphic Design</h3>
                <p className="text-muted-foreground text-sm">Extract subjects from photos to use in posters, banners, social media creatives, and YouTube thumbnails.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                { q: "Is this background remover really free?", a: "Yes, 100% free. No signup, no watermark, no hidden charges." },
                { q: "Is my image uploaded to a server?", a: "No. The AI runs entirely in your browser using WebAssembly. Your image never leaves your device." },
                { q: "What image formats are supported?", a: "JPG, PNG, and WebP images up to 10MB." },
                { q: "How accurate is the background removal?", a: "Very accurate for people, products, animals, and objects with clear edges. Complex backgrounds may need touch-up." },
                { q: "Can I use it on mobile?", a: "Yes, works on Chrome and Safari on Android and iPhone." },
                { q: "Why does it take time on first use?", a: "The AI model (~50MB) downloads once on first use. After that it runs instantly from cache." },
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
                { icon: Droplets, title: "Add Watermark", href: "/#image-tools" },
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
