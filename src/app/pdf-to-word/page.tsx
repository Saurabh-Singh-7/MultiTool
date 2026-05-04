import { Metadata } from 'next'
import PDFToWordClient from './client'

export const metadata: Metadata = {
  title: "PDF to Word Converter Free Online - Convert PDF to DOC | ToolHive",
  description: "Convert PDF files to editable Word documents online for free. Preserve formatting, fonts and layout. No signup, no watermark.",
  keywords: "pdf to word, convert pdf to word online free, pdf to doc, pdf to docx converter, editable word from pdf",
}

export default function PDFToWordPage() {
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
            Free Online PDF to Word
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight font-syne text-foreground drop-shadow-sm">
            Convert PDF to <span className="text-brand-orange relative inline-block">Word<div className="absolute -bottom-2 left-0 w-full h-1 bg-brand-orange rounded-full opacity-50 blur-[2px]"></div></span> Instantly
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-inter">
            Extract text from your PDF files directly in your browser. Fast, free, and completely private—your files never leave your device.
          </p>
        </div>

        {/* Client Application */}
        <PDFToWordClient />

        {/* SEO Content Section */}
        <div className="mt-32 max-w-4xl mx-auto space-y-16">
          <section className="bg-card rounded-2xl p-8 md:p-12 shadow-xl border border-border">
            <h2 className="text-3xl font-bold font-syne mb-6 text-foreground">How to Convert PDF to Word Online</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-full bg-brand-orange/10 flex items-center justify-center text-brand-orange font-bold text-xl">1</div>
                <h3 className="font-bold text-lg">Upload Your PDF</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">Simply drag and drop your PDF file into the upload zone above, or click to browse your device. We support files up to 50MB.</p>
              </div>
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-full bg-brand-orange/10 flex items-center justify-center text-brand-orange font-bold text-xl">2</div>
                <h3 className="font-bold text-lg">Choose Options</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">Customize how the text is extracted. You can choose to preserve paragraph breaks, keep page breaks, and set the default font for your new Word document.</p>
              </div>
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-full bg-brand-orange/10 flex items-center justify-center text-brand-orange font-bold text-xl">3</div>
                <h3 className="font-bold text-lg">Download DOCX</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">Click 'Convert' and our tool will process the file instantly in your browser. Download your editable Word document immediately.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold font-syne mb-6 text-foreground">Tips for Better PDF to Word Conversion</h2>
            <div className="bg-brand-orange/5 border border-brand-orange/20 rounded-xl p-6 md:p-8 space-y-4">
              <p className="text-muted-foreground">
                While our browser-based tool is incredibly fast and secure, it works differently from server-side AI solutions. Here are some tips to get the best results:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-2">
                <li><strong>Text-based PDFs:</strong> This tool works best with PDFs that contain actual text rather than scanned images of text.</li>
                <li><strong>Paragraph Breaks:</strong> Keep the "Preserve paragraph breaks" option enabled to maintain the flow of your document.</li>
                <li><strong>Formatting Limitations:</strong> Complex layouts like multi-column tables or heavily styled magazines may not perfectly translate to Word. The tool focuses on extracting the core text content cleanly.</li>
              </ul>
            </div>
          </section>

          <section className="pb-12">
            <h2 className="text-3xl font-bold font-syne mb-8 text-foreground text-center">FAQs</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-card p-6 rounded-xl border border-border hover:border-brand-orange/50 transition-colors">
                <h3 className="font-bold text-lg mb-3">Is this tool free to use?</h3>
                <p className="text-muted-foreground text-sm">Yes, our PDF to Word converter is 100% free. There are no hidden fees, no subscriptions, and no watermarks added to your documents.</p>
              </div>
              <div className="bg-card p-6 rounded-xl border border-border hover:border-brand-orange/50 transition-colors">
                <h3 className="font-bold text-lg mb-3">Are my files secure?</h3>
                <p className="text-muted-foreground text-sm">Absolutely. All processing happens locally in your web browser. Your files are never uploaded to any external server, ensuring complete privacy.</p>
              </div>
              <div className="bg-card p-6 rounded-xl border border-border hover:border-brand-orange/50 transition-colors">
                <h3 className="font-bold text-lg mb-3">Will the formatting look exactly the same?</h3>
                <p className="text-muted-foreground text-sm">We extract text and attempt to reconstruct basic paragraphs. However, complex layouts, intricate tables, and advanced graphics might not be perfectly preserved. You will get a clean, editable text document.</p>
              </div>
              <div className="bg-card p-6 rounded-xl border border-border hover:border-brand-orange/50 transition-colors">
                <h3 className="font-bold text-lg mb-3">Can I convert scanned PDFs?</h3>
                <p className="text-muted-foreground text-sm">Currently, this tool does not support Optical Character Recognition (OCR). It can only extract text from PDFs that were originally created digitally.</p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
