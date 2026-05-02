import { Metadata } from 'next'
import ImageBase64Client from './client'
import Link from 'next/link'
import { ChevronRight, PackageOpen, ImageIcon, Scissors, RefreshCw, Braces } from 'lucide-react'
import Script from 'next/script'

export const metadata: Metadata = {
  title: "Image to Base64 Converter Online Free | ToolHive",
  description: "Convert images to Base64 encoded string online free. Convert Base64 back to image. Copy base64 for HTML, CSS, JSON embedding instantly.",
  keywords: "image to base64, base64 to image, convert image base64 online, base64 encoder decoder, embed image html css, base64 string converter"
}

export default function ImageBase64Page() {
  return (
    <>
      <Script id="schema-image-base64" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "Image Base64 Converter - ToolHive",
        "url": "https://toolhive.in/image-base64",
        "applicationCategory": "DeveloperApplication",
        "operatingSystem": "Any",
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
        "description": "Convert images to Base64 encoded string online free. Convert Base64 back to image."
      }) }} />

      <ImageBase64Client />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-12 py-8 mt-4 border-t border-border">

          <section>
            <h2 className="font-heading text-2xl font-bold mb-6">What is Base64 Image Encoding?</h2>
            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
              <p className="text-muted-foreground mb-4">Base64 is a way to convert binary data (like an image file) into an ASCII text format. Instead of having a physical file like <code className="bg-muted px-1 rounded">logo.png</code>, the entire image is represented as a long string of letters and numbers.</p>
              <p className="text-muted-foreground mb-4">A Base64 string for an image usually looks like this:</p>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs font-mono text-muted-foreground">
                data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==
              </pre>
            </div>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold mb-6">When to Use Base64 Images</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-6">
                <div className="font-heading font-bold text-lg mb-2 text-green-600 dark:text-green-400">When it's Good ✓</div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Very small icons or logos (under 10KB)</li>
                  <li>• Embedding tiny graphics inside a single HTML or CSS file (no external HTTP requests)</li>
                  <li>• Storing images inside a JSON database payload</li>
                  <li>• Creating standalone, single-file HTML documents</li>
                </ul>
              </div>
              <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6">
                <div className="font-heading font-bold text-lg mb-2 text-red-600 dark:text-red-400">When it's Bad ✗</div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Large photographs or detailed images</li>
                  <li>• Base64 encoding increases file size by roughly 33%</li>
                  <li>• Very long text strings will completely block the browser from parsing CSS/HTML until the string is read</li>
                  <li>• It prevents the browser from caching the image separately</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold mb-6">How to Embed Image in HTML Using Base64</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="font-bold mb-3">HTML <code>&lt;img&gt;</code> Tag</h3>
                <p className="text-sm text-muted-foreground mb-3">Place the full Data URI directly inside the <code>src</code> attribute:</p>
                <code className="block bg-muted p-3 rounded text-xs break-all text-brand-orange">
                  &lt;img src="data:image/jpeg;base64,/9j/4AAQSkZ..." alt="Base64 Image" /&gt;
                </code>
              </div>
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="font-bold mb-3">CSS Background</h3>
                <p className="text-sm text-muted-foreground mb-3">Use the Data URI inside the <code>url()</code> function:</p>
                <code className="block bg-muted p-3 rounded text-xs break-all text-blue-500">
                  .my-div {'{\n'}
                  {'  '}background-image: url('data:image/png;base64,iVBORw0KGg...');
                  {'\n}'}
                </code>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                { q: "Is my image uploaded to your server?", a: "No! The conversion to Base64 happens entirely locally in your web browser. Your images remain private and are never uploaded." },
                { q: "Why did my file size increase?", a: "Base64 uses 4 ASCII characters to represent 3 bytes of binary data. This mathematical conversion intrinsically increases the data size by approximately 33%. This is why Base64 should only be used for small files." },
                { q: "My Base64 string isn't rendering an image. Why?", a: "Ensure you have the correct Data URI prefix. A raw Base64 string (e.g., 'iVBORw0KG...') will not render in HTML/CSS without the MIME type prefix (e.g., 'data:image/png;base64,'). Our tool provides buttons to copy the fully formatted strings." },
                { q: "Can I convert Base64 back to an image?", a: "Yes! Just switch to the 'Base64 → Image' tab on this page, paste your string, and you can preview and download the actual image file." },
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
                { icon: Braces, title: "EXIF Viewer", href: "/image-metadata" }
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
