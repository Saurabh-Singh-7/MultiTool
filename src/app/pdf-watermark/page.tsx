import { Metadata } from 'next'
import PDFWatermarkClient from './client'

export const metadata: Metadata = {
  title: "Add Watermark to PDF Online Free - Text & Image Watermark",
  description: "Add text or image watermark to PDF files online for free. Customize position, opacity, font and color. All pages at once.",
  keywords: "add watermark to pdf, pdf watermark online free, text watermark pdf, image watermark pdf, pdf stamp online, watermark pdf free",
}

export default function PDFWatermarkPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-6xl mx-auto px-4 py-12 md:py-24">
        {/* Header Section */}
        <div className="text-center space-y-6 mb-16 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-orange/10 text-brand-orange text-sm font-semibold tracking-wide uppercase mb-4 shadow-sm border border-brand-orange/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-orange opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-orange"></span>
            </span>
            Add Watermark to PDF
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight font-syne text-foreground drop-shadow-sm">
            Stamp & <span className="text-brand-orange relative inline-block">Watermark<div className="absolute -bottom-2 left-0 w-full h-1 bg-brand-orange rounded-full opacity-50 blur-[2px]"></div></span> PDF Free
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-inter">
            Add custom text or image watermarks to your PDF documents instantly. Perfect for protecting confidential files. Runs securely in your browser.
          </p>
        </div>

        <PDFWatermarkClient />

        {/* SEO Content Section */}
        <div className="mt-32 max-w-4xl mx-auto space-y-16">
          <section className="bg-card rounded-2xl p-8 md:p-12 shadow-xl border border-border">
            <h2 className="text-3xl font-bold font-syne mb-6 text-foreground">How to Add a Watermark to a PDF</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-full bg-brand-orange/10 flex items-center justify-center text-brand-orange font-bold text-xl">1</div>
                <h3 className="font-bold text-lg">Upload PDF</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">Drag and drop your PDF file. We support files up to 100MB and process everything locally for your privacy.</p>
              </div>
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-full bg-brand-orange/10 flex items-center justify-center text-brand-orange font-bold text-xl">2</div>
                <h3 className="font-bold text-lg">Customize Watermark</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">Choose text or image. Adjust the opacity, rotation, size, color, and position. Use the live preview to get it perfect.</p>
              </div>
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-full bg-brand-orange/10 flex items-center justify-center text-brand-orange font-bold text-xl">3</div>
                <h3 className="font-bold text-lg">Apply & Download</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">Click apply to stamp your selected pages. Your watermarked PDF will download instantly.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold font-syne mb-6 text-foreground">Text vs Image Watermark</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-muted rounded-xl p-6 border border-border">
                <h3 className="font-bold text-lg mb-3 text-brand-orange">📝 Text Watermarks</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Best for document status markers like "CONFIDENTIAL", "DRAFT", or "DO NOT COPY". You can easily tweak the font size, color, and rotation angle. Text watermarks are incredibly lightweight and won't noticeably increase your file size.
                </p>
              </div>
              <div className="bg-muted rounded-xl p-6 border border-border">
                <h3 className="font-bold text-lg mb-3 text-brand-orange">🖼️ Image Watermarks</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Ideal for corporate branding. Upload your company logo (PNG with transparency recommended) and stamp it across your documents. You can scale the image and adjust its opacity so it doesn't obscure the underlying text.
                </p>
              </div>
            </div>
          </section>

          <section className="pb-12">
            <h2 className="text-3xl font-bold font-syne mb-8 text-foreground text-center">FAQs</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-card p-6 rounded-xl border border-border hover:border-brand-orange/50 transition-colors">
                <h3 className="font-bold text-lg mb-3">Is it safe to upload confidential PDFs?</h3>
                <p className="text-muted-foreground text-sm">Yes, completely safe! Unlike other tools that upload your files to a server, our tool adds the watermark entirely inside your web browser. Your data never leaves your computer.</p>
              </div>
              <div className="bg-card p-6 rounded-xl border border-border hover:border-brand-orange/50 transition-colors">
                <h3 className="font-bold text-lg mb-3">Can I watermark specific pages only?</h3>
                <p className="text-muted-foreground text-sm">Yes. By default, the watermark is applied to all pages, but you can select specific page ranges (e.g., 1-5, 8), or choose only odd/even pages.</p>
              </div>
              <div className="bg-card p-6 rounded-xl border border-border hover:border-brand-orange/50 transition-colors">
                <h3 className="font-bold text-lg mb-3">Can the watermark be removed?</h3>
                <p className="text-muted-foreground text-sm">Because PDFs are structured documents, digital watermarks can sometimes be removed by advanced users using PDF editing software. However, they serve as a strong visual deterrent and claim of ownership.</p>
              </div>
              <div className="bg-card p-6 rounded-xl border border-border hover:border-brand-orange/50 transition-colors">
                <h3 className="font-bold text-lg mb-3">Will the image watermark increase file size?</h3>
                <p className="text-muted-foreground text-sm">If you use an image watermark on a 100-page document, the image is embedded only once and reused, meaning the file size will only increase by the size of the single image you uploaded.</p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
