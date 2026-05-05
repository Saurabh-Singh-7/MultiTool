import { Metadata } from 'next'
import WebMToMP4Client from './client'

export const metadata: Metadata = {
  title: "WebM to MP4 Converter Free Online - High Quality | ToolHive",
  description: "Convert WebM to MP4 online for free. Fast, secure, and private browser-based conversion. Support for high-quality MP4 export. No signup, no watermark.",
  keywords: "webm to mp4, convert webm to mp4, webm converter, webm to mp4 free, online video converter, free webm to mp4"
}

export default function WebMToMP4Page() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1">
        <WebMToMP4Client />
        
        {/* SEO Content Section */}
        <div className="container mx-auto px-4 py-16 max-w-5xl">
          <section className="grid md:grid-cols-2 gap-12 items-center mb-24">
            <div>
              <h2 className="text-3xl font-bold mb-6 font-syne">Why Convert WebM to MP4?</h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                WebM is a modern, open-source video format designed for the web, but it isn't supported by all devices and platforms (like older iPhones or some video editing software). MP4 (H.264) is the most universally compatible video format in existence.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Our free WebM to MP4 tool allows you to instantly transform your videos into the highly compatible MP4 format without uploading them to any server. Your privacy is 100% guaranteed as the conversion happens right in your browser.
              </p>
            </div>
            <div className="bg-card rounded-3xl p-8 border border-border shadow-sm">
              <h3 className="text-xl font-bold mb-4">Key Features</h3>
              <ul className="space-y-3">
                {[
                  "High Quality: Preserves original video resolution",
                  "100% Private: Videos never leave your browser",
                  "Fast Processing: Uses hardware acceleration where available",
                  "Fast & Free: No signup or file size limits",
                  "Universal: Works on Windows, Mac, and Linux"
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
