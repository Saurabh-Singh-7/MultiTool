import { Metadata } from 'next'
import PDFToPPTClient from './client'

export const metadata: Metadata = {
  title: "PDF to PowerPoint Converter Free Online - PDF to PPT | ToolHive",
  description: "Convert PDF to PowerPoint presentations online for free. Each PDF page becomes a slide. Download as PPTX instantly.",
  keywords: "pdf to powerpoint, pdf to ppt online free, convert pdf to pptx, pdf slides converter, pdf presentation converter",
}

export default function PDFToPPTPage() {
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
            PDF to PPT Converter
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight font-syne text-foreground drop-shadow-sm">
            Convert PDF to <span className="text-brand-orange relative inline-block">PowerPoint<div className="absolute -bottom-2 left-0 w-full h-1 bg-brand-orange rounded-full opacity-50 blur-[2px]"></div></span> Instantly
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-inter">
            Turn every page of your PDF into high-quality PowerPoint (.pptx) slides. Maintain 100% visual accuracy directly in your browser.
          </p>
        </div>

        {/* Client Application */}
        <PDFToPPTClient />

        {/* SEO Content Section */}
        <div className="mt-32 max-w-4xl mx-auto space-y-16">
          <section className="bg-card rounded-2xl p-8 md:p-12 shadow-xl border border-border">
            <h2 className="text-3xl font-bold font-syne mb-6 text-foreground">How to Convert PDF to PowerPoint</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-full bg-brand-orange/10 flex items-center justify-center text-brand-orange font-bold text-xl">1</div>
                <h3 className="font-bold text-lg">Upload PDF</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">Drag and drop your PDF document into the upload area above. Files up to 100MB are supported.</p>
              </div>
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-full bg-brand-orange/10 flex items-center justify-center text-brand-orange font-bold text-xl">2</div>
                <h3 className="font-bold text-lg">Customize Slides</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">Select your desired presentation aspect ratio (like 16:9 widescreen or 4:3) and adjust image quality settings.</p>
              </div>
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-full bg-brand-orange/10 flex items-center justify-center text-brand-orange font-bold text-xl">3</div>
                <h3 className="font-bold text-lg">Download PPTX</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">Click convert and our tool will generate a full PowerPoint file instantly without uploading your document to any server.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold font-syne mb-6 text-foreground">Tips for Best Results</h2>
            <div className="bg-brand-orange/5 border border-brand-orange/20 rounded-xl p-6 md:p-8 space-y-4">
              <p className="text-muted-foreground">
                To get the absolute best visual fidelity from your PDF-to-PPT conversion, keep these tips in mind:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-2">
                <li><strong>Aspect Ratio:</strong> Match the slide size to the original PDF. Most modern PDFs look best on 16:9 widescreen, while older documents might prefer A4 or 4:3.</li>
                <li><strong>Quality Settings:</strong> If you plan to present on a large screen or print the slides, select 'Print (300 DPI)'. For email sharing, 'Web (150 DPI)' keeps file sizes low.</li>
                <li><strong>Visual Accuracy:</strong> Our tool renders each PDF page as a high-resolution image to guarantee 100% layout and font accuracy. Note that the text on the resulting slides cannot be edited directly in PowerPoint.</li>
              </ul>
            </div>
          </section>

          <section className="pb-12">
            <h2 className="text-3xl font-bold font-syne mb-8 text-foreground text-center">FAQs</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-card p-6 rounded-xl border border-border hover:border-brand-orange/50 transition-colors">
                <h3 className="font-bold text-lg mb-3">Is the text editable in PowerPoint?</h3>
                <p className="text-muted-foreground text-sm">No. To ensure 100% visual accuracy without missing fonts or broken layouts, we render each PDF page as a high-quality image background on the slide.</p>
              </div>
              <div className="bg-card p-6 rounded-xl border border-border hover:border-brand-orange/50 transition-colors">
                <h3 className="font-bold text-lg mb-3">Are my PDF presentations secure?</h3>
                <p className="text-muted-foreground text-sm">Yes, completely. The entire conversion process runs locally in your web browser. We never upload, store, or view your files.</p>
              </div>
              <div className="bg-card p-6 rounded-xl border border-border hover:border-brand-orange/50 transition-colors">
                <h3 className="font-bold text-lg mb-3">Can I convert a 100-page PDF?</h3>
                <p className="text-muted-foreground text-sm">Yes! While large files take a few seconds longer to process, our tool supports PDFs with hundreds of pages up to a total file size of 100MB.</p>
              </div>
              <div className="bg-card p-6 rounded-xl border border-border hover:border-brand-orange/50 transition-colors">
                <h3 className="font-bold text-lg mb-3">Does it work on Mac and Windows?</h3>
                <p className="text-muted-foreground text-sm">Yes, the tool is fully cross-platform. It works on any modern web browser across Windows, macOS, Linux, and even mobile devices.</p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
