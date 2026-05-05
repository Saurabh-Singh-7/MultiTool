import { Metadata } from 'next'
import WordToPDFClient from './client'

export const metadata: Metadata = {
  title: "Word to PDF Converter Free Online - Convert DOCX to PDF | ToolHive",
  description: "Convert Word documents to PDF online for free. Fast, secure, and private browser-based conversion for DOC and DOCX files. No file limits, no signup, works on any device.",
  keywords: "word to pdf, convert word to pdf, doc to pdf, docx to pdf, free online word converter, docx to pdf converter"
}

export default function WordToPDFPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1">
        <WordToPDFClient />
        
        {/* SEO Content Section */}
        <div className="container mx-auto px-4 py-16 max-w-5xl">
          <section className="grid md:grid-cols-2 gap-12 items-center mb-24">
            <div>
              <h2 className="text-3xl font-bold mb-6 font-syne">Why Convert Word to PDF?</h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Word documents are great for editing, but they can look different depending on the device or software used to open them. Converting to PDF (Portable Document Format) ensures that your layout, fonts, and images remain exactly as you intended, regardless of where the file is viewed.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Our free Word to PDF converter allows you to instantly transform these files into professional PDFs without uploading them to any server. Your privacy is 100% guaranteed as the conversion happens right in your browser.
              </p>
            </div>
            <div className="bg-card rounded-3xl p-8 border border-border shadow-sm">
              <h3 className="text-xl font-bold mb-4">Key Benefits</h3>
              <ul className="space-y-3">
                {[
                  "Layout Preservation: Fonts and formatting stay fixed",
                  "100% Private: Documents never leave your computer",
                  "High Compatibility: Works on all devices and OS",
                  "Fast & Free: No subscriptions or watermarks",
                  "Batch Support: Convert multiple documents at once"
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
            <h2 className="text-3xl font-bold mb-10 font-syne text-center">How to Convert Word to PDF</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { t: "Upload Word Docs", d: "Drag and drop your .docx or .doc files into the upload zone above." },
                { t: "Automatic Processing", d: "Our tool processes the file locally using your browser's power." },
                { t: "Download PDF", d: "Click convert and download your high-quality PDF document instantly." }
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
                { q: "Is it safe to use ToolHive?", a: "Yes. All conversion logic runs locally on your device. We do not store, view, or upload your documents to any server." },
                { q: "Can I convert old .doc files?", a: "Currently, our tool excels at converting modern .docx files. Support for older .doc formats is continuously being improved." },
                { q: "Will the formatting change?", a: "We aim for 100% accuracy. Most text, tables, and images will be preserved exactly as they appear in Word." },
                { q: "Is there a file size limit?", a: "No. Since it runs on your machine, you are only limited by your browser's memory capacity." }
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
