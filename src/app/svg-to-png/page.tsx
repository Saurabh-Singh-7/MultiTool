import { Metadata } from 'next'
import SVGToPNGClient from './client'

export const metadata: Metadata = {
  title: "SVG to PNG Converter Free Online - High Quality Export | ToolHive",
  description: "Convert SVG to PNG online for free. Fast, secure, and private browser-based conversion. Set custom resolution and transparent background. No signup, no watermark.",
  keywords: "svg to png, convert svg to png, svg converter, vector to png, high quality svg export, free online svg to png"
}

export default function SVGToPNGPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1">
        <SVGToPNGClient />
        
        {/* SEO Content Section */}
        <div className="container mx-auto px-4 py-16 max-w-5xl">
          <section className="grid md:grid-cols-2 gap-12 items-center mb-24">
            <div>
              <h2 className="text-3xl font-bold mb-6 font-syne">Why Convert SVG to PNG?</h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                SVG (Scalable Vector Graphics) is perfect for logos and icons because it doesn't lose quality when scaled. However, many applications, social media platforms, and legacy software require raster formats like PNG. 
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Our free SVG to PNG converter allows you to instantly transform these vectors into high-resolution PNGs while maintaining transparency. Your privacy is 100% guaranteed as the conversion happens right in your browser.
              </p>
            </div>
            <div className="bg-card rounded-3xl p-8 border border-border shadow-sm">
              <h3 className="text-xl font-bold mb-4">Key Features</h3>
              <ul className="space-y-3">
                {[
                  "High Resolution: Export at any size without blur",
                  "Transparency Support: Maintains transparent backgrounds",
                  "100% Private: Files never leave your browser",
                  "Fast & Free: No signup or file size limits",
                  "Batch Conversion: Convert multiple SVGs at once"
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

          <section className="bg-muted/30 rounded-3xl p-8 md:p-12 border border-border">
            <h2 className="text-3xl font-bold mb-10 font-syne text-center">Frequently Asked Questions</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {[
                { q: "Is it safe to use ToolHive?", a: "Yes. ToolHive uses your browser's local processing power. Your SVGs are never uploaded to our servers, making it 100% private." },
                { q: "Can I set a custom size?", a: "Yes. You can specify the exact width or height for your PNG export, and we will scale the vector perfectly." },
                { q: "Does it support transparency?", a: "Yes. PNGs exported from our tool will preserve any transparency present in the original SVG file." },
                { q: "Is there a limit on conversions?", a: "No. You can convert as many SVG files as you need, completely free of charge." }
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
