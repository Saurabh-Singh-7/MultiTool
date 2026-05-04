import { Metadata } from 'next'
import PDFToImageClient from './client'
import Link from 'next/link'
import { FileText, Layers, Scissors, Image as ImageIcon, FileImage, ShieldCheck, HelpCircle, CheckCircle2 } from 'lucide-react'

export const metadata: Metadata = {
  title: "PDF to Image Converter Free Online - PDF to JPG PNG | ToolHive",
  description: "Convert PDF pages to JPG, PNG or WebP images online for free. Extract all pages or specific pages as high quality images. No signup needed.",
  keywords: "pdf to image, pdf to jpg online free, pdf to png converter, convert pdf to image, extract pages as images, pdf page to jpg free"
}

export default function PDFToImagePage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <PDFToImageClient />
        
        {/* SEO Content Section */}
        <div className="mt-24 space-y-20">
          
          <section className="scroll-mt-20">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold mb-4 font-heading">How to Convert PDF to Image Online</h2>
            </div>
            
            <div className="grid md:grid-cols-4 gap-6">
              <div className="bg-card p-6 rounded-2xl border border-border shadow-sm text-center relative overflow-hidden group hover:border-brand-orange/50 transition-colors">
                <div className="absolute top-0 right-0 p-4 text-8xl font-black text-muted/10 -z-10">1</div>
                <h3 className="text-lg font-bold mb-2">Upload your PDF file</h3>
                <p className="text-sm text-muted-foreground">Select or drag and drop your PDF file into the upload zone above.</p>
              </div>
              <div className="bg-card p-6 rounded-2xl border border-border shadow-sm text-center relative overflow-hidden group hover:border-brand-orange/50 transition-colors">
                <div className="absolute top-0 right-0 p-4 text-8xl font-black text-muted/10 -z-10">2</div>
                <h3 className="text-lg font-bold mb-2">Select pages to convert</h3>
                <p className="text-sm text-muted-foreground">Choose to convert all pages or select specific ones from the visual grid.</p>
              </div>
              <div className="bg-card p-6 rounded-2xl border border-border shadow-sm text-center relative overflow-hidden group hover:border-brand-orange/50 transition-colors">
                <div className="absolute top-0 right-0 p-4 text-8xl font-black text-muted/10 -z-10">3</div>
                <h3 className="text-lg font-bold mb-2">Choose format and quality</h3>
                <p className="text-sm text-muted-foreground">Select JPG, PNG, or WebP. Adjust the image resolution (DPI) if needed.</p>
              </div>
              <div className="bg-card p-6 rounded-2xl border border-border shadow-sm text-center relative overflow-hidden group hover:border-brand-orange/50 transition-colors">
                <div className="absolute top-0 right-0 p-4 text-8xl font-black text-muted/10 -z-10">4</div>
                <h3 className="text-lg font-bold mb-2">Convert and download</h3>
                <p className="text-sm text-muted-foreground">Click Convert and download your images individually or as a single ZIP file.</p>
              </div>
            </div>
          </section>

          <section className="bg-muted/30 rounded-3xl p-8 md:p-12 border border-border">
            <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6 font-heading">Which Format Should I Choose?</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-brand-orange">JPG (JPEG)</h3>
                    <p className="text-muted-foreground">Best for most use cases. Produces smaller files with excellent quality. Great for sharing, email attachments, and web use. Does not support transparency.</p>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-blue-500">PNG</h3>
                    <p className="text-muted-foreground">Lossless quality. Results in larger files but guarantees perfect visual accuracy with no compression artifacts. Supports transparent backgrounds.</p>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-green-500">WebP</h3>
                    <p className="text-muted-foreground">Provides the smallest files at the same visual quality. Best for web developers and usage in modern browsers.</p>
                  </div>
                </div>
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-6 font-heading">Which DPI Should I Use?</h2>
                <div className="space-y-4">
                  <div className="bg-card p-4 rounded-xl border border-border">
                    <h3 className="font-bold">72 DPI</h3>
                    <p className="text-sm text-muted-foreground">Screen viewing only. Produces the smallest file sizes.</p>
                  </div>
                  <div className="bg-card p-4 rounded-xl border-2 border-brand-orange shadow-sm">
                    <h3 className="font-bold text-brand-orange">150 DPI (Recommended)</h3>
                    <p className="text-sm text-muted-foreground">Web use and general sharing. Offers the best balance of quality and file size.</p>
                  </div>
                  <div className="bg-card p-4 rounded-xl border border-border">
                    <h3 className="font-bold">300 DPI</h3>
                    <p className="text-sm text-muted-foreground">Professional print quality. Essential if you plan to print the resulting images.</p>
                  </div>
                  <div className="bg-card p-4 rounded-xl border border-border">
                    <h3 className="font-bold">600 DPI</h3>
                    <p className="text-sm text-muted-foreground">High-end printing and archiving. Produces very large files.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-8 font-heading">Why Convert PDF to Image?</h2>
            <div className="grid sm:grid-cols-2 gap-4 text-left">
              <div className="flex items-start gap-3 bg-card p-4 rounded-xl border border-border">
                <CheckCircle2 className="size-5 text-brand-orange shrink-0 mt-0.5" />
                <span>Share PDF content easily on social media platforms like Instagram or Twitter.</span>
              </div>
              <div className="flex items-start gap-3 bg-card p-4 rounded-xl border border-border">
                <CheckCircle2 className="size-5 text-brand-orange shrink-0 mt-0.5" />
                <span>Use individual PDF pages seamlessly in PowerPoint or Keynote presentations.</span>
              </div>
              <div className="flex items-start gap-3 bg-card p-4 rounded-xl border border-border">
                <CheckCircle2 className="size-5 text-brand-orange shrink-0 mt-0.5" />
                <span>Preview PDF content directly without requiring users to install a PDF reader.</span>
              </div>
              <div className="flex items-start gap-3 bg-card p-4 rounded-xl border border-border">
                <CheckCircle2 className="size-5 text-brand-orange shrink-0 mt-0.5" />
                <span>Extract high-quality graphics, charts, or illustrations from a document.</span>
              </div>
              <div className="flex items-start gap-3 bg-card p-4 rounded-xl border border-border sm:col-span-2">
                <CheckCircle2 className="size-5 text-brand-orange shrink-0 mt-0.5" />
                <span>Create engaging thumbnail previews for your downloadable PDF files.</span>
              </div>
            </div>
          </section>

          <section className="bg-brand-orange/5 rounded-3xl p-8 md:p-12 border border-brand-orange/10 text-center max-w-4xl mx-auto">
            <ShieldCheck className="size-16 text-brand-orange mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4 font-heading">Is It Safe to Convert PDFs Online?</h2>
            <p className="text-muted-foreground text-lg">
              Your PDF <strong>never leaves your device</strong>. The entire conversion process is powered by `pdfjs-dist` running securely inside your web browser. We cannot see, access, or store your documents. It is 100% private and completely secure.
            </p>
          </section>

          <section className="max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-10">
              <HelpCircle className="size-8 text-muted-foreground" />
              <h2 className="text-3xl font-bold font-heading text-center">Frequently Asked Questions</h2>
            </div>
            
            <div className="space-y-6">
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-bold text-lg mb-2">Can I convert specific pages only?</h3>
                <p className="text-muted-foreground">Yes! Click individual page thumbnails to select exactly which pages you want to convert, or use the page range input.</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-bold text-lg mb-2">What resolution should I use?</h3>
                <p className="text-muted-foreground">150 DPI is recommended for most digital uses and sharing. If you plan to print the images, use 300 DPI for print-quality clarity.</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-bold text-lg mb-2">Is there a page limit?</h3>
                <p className="text-muted-foreground">There is no page limit. The tool works entirely in your browser with any PDF size up to 200MB.</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-bold text-lg mb-2">Can I convert a password protected PDF?</h3>
                <p className="text-muted-foreground">Yes! You will be prompted to enter the password to unlock the file locally before the conversion starts.</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-bold text-lg mb-2">Will the image quality match the original?</h3>
                <p className="text-muted-foreground">At 300 DPI or higher, the quality is near-perfect and indistinguishable from the original PDF. At 72 DPI, some fine detail in small text may be lost.</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-bold text-lg mb-2">Can I get all pages as separate images?</h3>
                <p className="text-muted-foreground">Yes! Just select all pages and use the "Download All as ZIP" button. The ZIP file will contain each page as its own separate image file.</p>
              </div>
            </div>
          </section>

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
              <Link href="/pdf-compress" className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:bg-muted/50 hover:border-brand-orange/50 transition-all group">
                <div className="size-10 rounded-lg bg-green-500/10 text-green-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileText className="size-5" />
                </div>
                <div className="font-bold">Compress PDF</div>
              </Link>
              <Link href="/image-to-pdf" className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:bg-muted/50 hover:border-brand-orange/50 transition-all group">
                <div className="size-10 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ImageIcon className="size-5" />
                </div>
                <div className="font-bold">Image to PDF</div>
              </Link>
            </div>
          </section>

        </div>
      </main>
    </div>
  )
}
