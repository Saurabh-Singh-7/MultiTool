import { Metadata } from 'next'
import HEICToJPGClient from './client'

export const metadata: Metadata = {
  title: "HEIC to JPG Converter Free Online - Convert iPhone Photos | ToolHive",
  description: "Convert HEIC to JPG online for free. Fast, secure, and private browser-based conversion for iPhone (HEIF) photos. No file limits, no signup, works on any device.",
  keywords: "heic to jpg, convert heic to jpg, heif to jpg, iphone photo converter, apple image to jpg, free online heic converter, bulk heic to jpg"
}

export default function HEICToJPGPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1">
        <HEICToJPGClient />
        
        {/* SEO Content Section */}
        <div className="container mx-auto px-4 py-16 max-w-5xl">
          <section className="grid md:grid-cols-2 gap-12 items-center mb-24">
            <div>
              <h2 className="text-3xl font-bold mb-6 font-syne">What is HEIC and Why Convert to JPG?</h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                HEIC (High Efficiency Image Container) is the standard format used by Apple for photos taken on iPhones and iPads. While it offers better compression than JPG, it isn't supported by many older Windows applications, websites, or non-Apple devices.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Our free HEIC to JPG converter allows you to instantly transform these files into the universally supported JPG format without uploading them to any server. Your privacy is 100% guaranteed as the conversion happens right in your browser.
              </p>
            </div>
            <div className="bg-card rounded-3xl p-8 border border-border shadow-sm">
              <h3 className="text-xl font-bold mb-4">Key Features</h3>
              <ul className="space-y-3">
                {[
                  "Bulk Conversion: Convert multiple files at once",
                  "100% Private: Files never leave your browser",
                  "High Quality: Preserves image detail and EXIF data",
                  "Fast & Free: No signup or file size limits",
                  "Universal Compatibility: Works on Windows, Mac, and Android"
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="size-5 rounded-full bg-brand-orange/10 text-brand-orange flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-xs font-bold">✓</span>
                    </span>
                    <span className="text-sm font-medium">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="mb-24">
            <h2 className="text-3xl font-bold mb-10 font-syne text-center">How to Convert HEIC to JPG</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { t: "Upload HEIC Files", d: "Drag and drop your .heic or .heif photos into the upload zone above." },
                { t: "Set Quality (Optional)", d: "Adjust the output quality slider if you need to optimize for file size." },
                { t: "Download JPGs", d: "Click convert and download your JPG files individually or as a ZIP archive." }
              ].map((step, i) => (
                <div key={i} className="text-center">
                  <div className="size-12 rounded-2xl bg-brand-orange text-white font-bold text-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand-orange/20">
                    {i + 1}
                  </div>
                  <h3 className="font-bold mb-2">{step.t}</h3>
                  <p className="text-sm text-muted-foreground">{step.d}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-muted/30 rounded-3xl p-8 md:p-12 border border-border">
            <h2 className="text-3xl font-bold mb-10 font-syne text-center">Frequently Asked Questions</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {[
                { q: "Is it safe to use ToolHive?", a: "Yes. Unlike other websites, ToolHive uses your browser's processing power. Your photos are never uploaded to our servers, making it 100% private." },
                { q: "Can I convert HEIC to JPG on a PC?", a: "Absolutely. Our tool works in any modern web browser (Chrome, Edge, Firefox) on Windows, Linux, or macOS." },
                { q: "Do I lose quality during conversion?", a: "Minimal. By default, we use 90% quality which is visually indistinguishable from the original but offers great compatibility." },
                { q: "Is there a limit to how many files I can convert?", a: "No. You can convert as many files as you like. Since the processing is local, the only limit is your device's memory." }
              ].map((faq, i) => (
                <div key={i}>
                  <h3 className="font-bold mb-2">{faq.q}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
