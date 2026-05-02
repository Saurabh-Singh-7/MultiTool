import { Metadata } from 'next'
import PDFCompressClient from './client'
import Link from 'next/link'
import { FileText, FileUp, Scissors, Image as ImageIcon, CheckCircle2, ShieldCheck, Layers, FileDigit, HelpCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: "Compress PDF Online Free - Reduce PDF File Size | ToolHive",
  description: "Compress PDF files online for free. Reduce PDF size up to 90% without losing quality. No signup, no watermark, works in browser instantly.",
  keywords: "compress pdf online free, reduce pdf size, pdf compressor, shrink pdf file, pdf size reducer, make pdf smaller free",
  openGraph: {
    title: "Compress PDF Online Free - Reduce PDF File Size | ToolHive",
    description: "Compress PDF files online for free. Reduce PDF size up to 90% without losing quality. No signup, no watermark, works in browser instantly.",
    type: "website",
  }
}

export default function PDFCompressPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <PDFCompressClient />
        
        {/* SEO Content Section */}
        <div className="mt-24 space-y-20">
          
          {/* How to compress */}
          <section className="scroll-mt-20">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold mb-4 font-heading">How to Compress a PDF Online</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Shrink your PDF files in three simple steps without losing readability.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-card p-8 rounded-2xl border border-border shadow-sm text-center relative overflow-hidden group hover:border-brand-orange/50 transition-colors">
                <div className="absolute top-0 right-0 p-6 text-9xl font-black text-muted/10 -z-10 group-hover:text-brand-orange/5 transition-colors">1</div>
                <div className="size-16 bg-brand-orange/10 rounded-full flex items-center justify-center mx-auto mb-6 text-brand-orange">
                  <FileUp className="size-8" />
                </div>
                <h3 className="text-xl font-bold mb-3">Upload your PDF file</h3>
                <p className="text-muted-foreground">Drag and drop your PDF document into the upload zone. You can also compress multiple files at once using our batch mode.</p>
              </div>
              
              <div className="bg-card p-8 rounded-2xl border border-border shadow-sm text-center relative overflow-hidden group hover:border-brand-orange/50 transition-colors">
                <div className="absolute top-0 right-0 p-6 text-9xl font-black text-muted/10 -z-10 group-hover:text-brand-orange/5 transition-colors">2</div>
                <div className="size-16 bg-brand-orange/10 rounded-full flex items-center justify-center mx-auto mb-6 text-brand-orange">
                  <FileDigit className="size-8" />
                </div>
                <h3 className="text-xl font-bold mb-3">Choose compression level</h3>
                <p className="text-muted-foreground">Select Low, Medium, High, or Max compression based on your quality needs, or set an exact target file size.</p>
              </div>
              
              <div className="bg-card p-8 rounded-2xl border border-border shadow-sm text-center relative overflow-hidden group hover:border-brand-orange/50 transition-colors">
                <div className="absolute top-0 right-0 p-6 text-9xl font-black text-muted/10 -z-10 group-hover:text-brand-orange/5 transition-colors">3</div>
                <div className="size-16 bg-brand-orange/10 rounded-full flex items-center justify-center mx-auto mb-6 text-brand-orange">
                  <CheckCircle2 className="size-8" />
                </div>
                <h3 className="text-xl font-bold mb-3">Click Compress & Download</h3>
                <p className="text-muted-foreground">Hit compress and watch your file size shrink instantly. Your newly compressed PDF is ready to download securely.</p>
              </div>
            </div>
          </section>

          {/* Compression Levels */}
          <section className="bg-muted/30 rounded-3xl p-8 md:p-12 border border-border">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold mb-8 font-heading text-center">Which Compression Level Should I Use?</h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="mt-1 size-4 rounded-full bg-blue-500 shrink-0"></div>
                  <div>
                    <h3 className="text-xl font-bold">Low <span className="text-muted-foreground font-normal text-base">(95% quality)</span></h3>
                    <p className="text-muted-foreground">Ideal for print-quality documents where visual perfection matters. Best when you only need to trim a little bit of file size.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="mt-1 size-4 rounded-full bg-green-500 shrink-0"></div>
                  <div>
                    <h3 className="text-xl font-bold">Medium <span className="text-muted-foreground font-normal text-base">(80% quality)</span></h3>
                    <p className="text-muted-foreground">Great for office documents, reports, and presentations. Retains excellent readability with significant file size savings.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="mt-1 size-4 rounded-full bg-brand-orange shrink-0"></div>
                  <div>
                    <h3 className="text-xl font-bold">High <span className="text-muted-foreground font-normal text-base">(65% quality)</span></h3>
                    <p className="text-muted-foreground">The best balance of size and quality. This is our <strong className="text-foreground">recommendation for most users</strong> to get dramatic savings without noticeable visual loss.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="mt-1 size-4 rounded-full bg-red-500 shrink-0"></div>
                  <div>
                    <h3 className="text-xl font-bold">Max <span className="text-muted-foreground font-normal text-base">(40% quality)</span></h3>
                    <p className="text-muted-foreground">Strictly for archiving or when file size is absolutely critical (e.g., rigid email attachment limits under 5MB). Images may become visibly compressed.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Why is my PDF so large? */}
          <section className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 font-heading text-center">Why is My PDF So Large?</h2>
            <div className="grid md:grid-cols-2 gap-x-12 gap-y-6">
              <div className="flex gap-3">
                <CheckCircle2 className="size-6 text-brand-orange shrink-0" />
                <p className="text-muted-foreground"><strong className="text-foreground">High-resolution images</strong> embedded in the document are the #1 cause of massive PDF files.</p>
              </div>
              <div className="flex gap-3">
                <CheckCircle2 className="size-6 text-brand-orange shrink-0" />
                <p className="text-muted-foreground"><strong className="text-foreground">Uncompressed scanned pages</strong> from office scanners often default to giant, unoptimized TIFF images.</p>
              </div>
              <div className="flex gap-3">
                <CheckCircle2 className="size-6 text-brand-orange shrink-0" />
                <p className="text-muted-foreground"><strong className="text-foreground">Multiple embedded fonts</strong>. Every custom font used adds hundreds of kilobytes to the final file size.</p>
              </div>
              <div className="flex gap-3">
                <CheckCircle2 className="size-6 text-brand-orange shrink-0" />
                <p className="text-muted-foreground"><strong className="text-foreground">Hidden metadata and annotations</strong>. Edit histories, comments, and extensive metadata can silently bloat files.</p>
              </div>
              <div className="flex gap-3">
                <CheckCircle2 className="size-6 text-brand-orange shrink-0" />
                <p className="text-muted-foreground"><strong className="text-foreground">Duplicate resources</strong>. If the same logo is used on 100 pages, inefficient PDFs save it 100 times.</p>
              </div>
            </div>
          </section>

          {/* Security */}
          <section className="bg-brand-orange/5 rounded-3xl p-8 md:p-12 border border-brand-orange/10 text-center max-w-4xl mx-auto">
            <ShieldCheck className="size-16 text-brand-orange mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4 font-heading">Is It Safe to Compress PDFs Online?</h2>
            <p className="text-muted-foreground text-lg mb-6">
              Unlike other online tools, your PDF <strong>never leaves your browser</strong>. Everything runs locally on your device using advanced JavaScript processing. We cannot see, upload, or store your documents. It is 100% private and completely secure.
            </p>
          </section>

          {/* FAQ */}
          <section className="max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-10">
              <HelpCircle className="size-8 text-muted-foreground" />
              <h2 className="text-3xl font-bold font-heading text-center">Frequently Asked Questions</h2>
            </div>
            
            <div className="space-y-6">
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-bold text-lg mb-2">How much can I compress a PDF?</h3>
                <p className="text-muted-foreground">It depends entirely on the content. Image-heavy PDFs or scanned documents can often shrink by 60-85%. Text-only PDFs are already quite efficient and generally shrink by 10-30%.</p>
              </div>
              
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-bold text-lg mb-2">Will compression reduce text quality?</h3>
                <p className="text-muted-foreground">Our compression works by converting complex PDF pages into highly optimized, high-fidelity images. Text remains perfectly readable, but it may not be selectable after compression.</p>
              </div>
              
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-bold text-lg mb-2">Can I compress a password protected PDF?</h3>
                <p className="text-muted-foreground">Yes! Our tool will prompt you for the password to unlock the file securely in your browser before performing the compression.</p>
              </div>

              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-bold text-lg mb-2">Is there a file size limit?</h3>
                <p className="text-muted-foreground">Because everything is processed in your local memory, we recommend a maximum file size of 200MB per PDF to prevent your browser from crashing or lagging.</p>
              </div>

              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-bold text-lg mb-2">My PDF got larger after compression — why?</h3>
                <p className="text-muted-foreground">This is a rare edge case that occurs when your PDF was already perfectly optimized (usually vector-based). Converting it to rasterized images can sometimes increase size. If this happens, try the Low compression level, or keep your original file.</p>
              </div>

              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-bold text-lg mb-2">How long does compression take?</h3>
                <p className="text-muted-foreground">It takes about 0.5 to 1 second per page depending on your device's speed. A 48-page PDF will typically take about 25 seconds to fully process.</p>
              </div>
            </div>
          </section>

          {/* Related Tools */}
          <section className="pt-10 border-t border-border">
            <h2 className="text-2xl font-bold mb-8 font-heading text-center">Related Tools</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/pdf-merge" className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:bg-muted/50 hover:border-brand-orange/50 transition-all group">
                <div className="size-10 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Layers className="size-5" />
                </div>
                <div className="font-bold">Merge PDF</div>
              </Link>
              <Link href="/pdf-split" className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:bg-muted/50 hover:border-brand-orange/50 transition-all group">
                <div className="size-10 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Scissors className="size-5" />
                </div>
                <div className="font-bold">Split PDF</div>
              </Link>
              <Link href="/image-to-pdf" className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:bg-muted/50 hover:border-brand-orange/50 transition-all group">
                <div className="size-10 rounded-lg bg-green-500/10 text-green-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ImageIcon className="size-5" />
                </div>
                <div className="font-bold">Image to PDF</div>
              </Link>
              <Link href="#" className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:bg-muted/50 hover:border-brand-orange/50 transition-all group">
                <div className="size-10 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileText className="size-5" />
                </div>
                <div className="font-bold">PDF to Image</div>
              </Link>
            </div>
          </section>

        </div>
      </main>
    </div>
  )
}
