import { Metadata } from 'next'
import ImageToSVGClient from './client'

export const metadata: Metadata = {
  title: "Image to SVG Converter Free Online - Vectorizer | ToolHive",
  description: "Convert PNG, JPG, and WebP images to SVG vectors online for free. High-quality image tracing, secure, and private browser-based conversion. No signup required.",
  keywords: "image to svg, convert png to svg, jpg to svg converter, vectorizer online free, image tracing tool, free online vectorizer"
}

export default function ImageToSVGPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1">
        <ImageToSVGClient />
        
        {/* SEO Content Section */}
        <div className="container mx-auto px-4 py-16 max-w-5xl">
          <section className="grid md:grid-cols-2 gap-12 items-center mb-24">
            <div>
              <h2 className="text-3xl font-bold mb-6 font-syne">What is an Image Vectorizer?</h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Vectorization is the process of converting raster images (made of pixels like PNG and JPG) into vector graphics (made of paths like SVG). Unlike raster images, vectors can be scaled to any size without losing quality or becoming blurry.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Our free Image to SVG tool uses advanced browser-based tracing to turn your photos, logos, and icons into clean, scalable vectors. Everything happens locally, ensuring your images stay private.
              </p>
            </div>
            <div className="bg-card rounded-3xl p-8 border border-border shadow-sm">
              <h3 className="text-xl font-bold mb-4">Key Benefits</h3>
              <ul className="space-y-3">
                {[
                  "Infinite Scaling: Vectors stay crisp at any resolution",
                  "100% Private: Images never leave your computer",
                  "Easy Editing: Vectors are easy to modify in tools like Figma or AI",
                  "Clean Output: Optimized SVG code for web use",
                  "Fast & Free: Instant tracing without subscriptions"
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
        </div>
      </main>
    </div>
  )
}
