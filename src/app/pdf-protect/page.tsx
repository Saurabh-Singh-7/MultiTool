import { Metadata } from 'next'
import PDFProtectClient from './client'

export const metadata: Metadata = {
  title: "Protect PDF with Password Free Online | ToolHive",
  description: "Add password protection to PDF files online for free. Set open password and permissions. Encrypt PDF instantly in browser.",
  keywords: "protect pdf with password, pdf password protect online free, encrypt pdf, add password to pdf, secure pdf online",
}

export default function PDFProtectPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-6xl mx-auto px-4 py-12 md:py-24">
        <div className="text-center space-y-6 mb-16 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-orange/10 text-brand-orange text-sm font-semibold tracking-wide uppercase mb-4 shadow-sm border border-brand-orange/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-orange opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-orange"></span>
            </span>
            Encrypt PDF Online
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight font-syne text-foreground drop-shadow-sm">
            Password Protect Your <span className="text-brand-orange relative inline-block">PDF<div className="absolute -bottom-2 left-0 w-full h-1 bg-brand-orange rounded-full opacity-50 blur-[2px]"></div></span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-inter">
            Secure your PDF files with strong encryption directly in your browser. Your files never leave your device.
          </p>
        </div>

        <PDFProtectClient />

        <div className="mt-32 max-w-4xl mx-auto space-y-16">
          <section className="bg-card rounded-2xl p-8 md:p-12 shadow-xl border border-border">
            <h2 className="text-3xl font-bold font-syne mb-6 text-foreground">How to Password Protect a PDF</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-full bg-brand-orange/10 flex items-center justify-center text-brand-orange font-bold text-xl">1</div>
                <h3 className="font-bold text-lg">Upload Your PDF</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">Drag and drop or browse to upload your PDF file. We support documents up to 100MB.</p>
              </div>
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-full bg-brand-orange/10 flex items-center justify-center text-brand-orange font-bold text-xl">2</div>
                <h3 className="font-bold text-lg">Set Your Password</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">Enter a strong password and configure permissions. Use our password generator for maximum security.</p>
              </div>
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-full bg-brand-orange/10 flex items-center justify-center text-brand-orange font-bold text-xl">3</div>
                <h3 className="font-bold text-lg">Download Secured PDF</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">Your PDF is encrypted instantly in the browser. Download and share confidently.</p>
              </div>
            </div>
          </section>

          <section className="bg-card rounded-2xl p-8 md:p-12 shadow-xl border border-border">
            <h2 className="text-3xl font-bold font-syne mb-6 text-foreground">Open Password vs Owner Password</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-muted rounded-xl p-6 border border-border">
                <h3 className="font-bold text-lg mb-3 text-brand-orange">🔐 Open Password (User)</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">Required to open and view the PDF. Without this password, the document cannot be read at all. This is the most common type of PDF protection.</p>
              </div>
              <div className="bg-muted rounded-xl p-6 border border-border">
                <h3 className="font-bold text-lg mb-3 text-brand-orange">🛡️ Owner Password (Permissions)</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">Controls what actions users can perform — printing, copying text, editing, etc. Users can still open the PDF, but their actions are restricted.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold font-syne mb-6 text-foreground">PDF Encryption Levels Explained</h2>
            <div className="bg-brand-orange/5 border border-brand-orange/20 rounded-xl p-6 md:p-8 space-y-4">
              <p className="text-muted-foreground">Understanding encryption helps you choose the right level of security for your documents:</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-2">
                <li><strong>128-bit RC4:</strong> Older encryption standard. Compatible with virtually all PDF readers including very old versions of Acrobat (v5+). Adequate for basic protection.</li>
                <li><strong>256-bit AES (Recommended):</strong> Modern, military-grade encryption. Requires Acrobat 10+ or any modern PDF reader. Significantly harder to crack and the current industry standard.</li>
              </ul>
            </div>
          </section>

          <section className="pb-12">
            <h2 className="text-3xl font-bold font-syne mb-8 text-foreground text-center">FAQs</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-card p-6 rounded-xl border border-border hover:border-brand-orange/50 transition-colors">
                <h3 className="font-bold text-lg mb-3">Can you recover my password if I forget it?</h3>
                <p className="text-muted-foreground text-sm">No. Since all encryption happens locally in your browser, we never see or store your password. Please save it in a secure password manager.</p>
              </div>
              <div className="bg-card p-6 rounded-xl border border-border hover:border-brand-orange/50 transition-colors">
                <h3 className="font-bold text-lg mb-3">Is my PDF uploaded to a server?</h3>
                <p className="text-muted-foreground text-sm">No. The entire encryption process runs 100% locally in your web browser using the pdf-lib library. Your file never leaves your device.</p>
              </div>
              <div className="bg-card p-6 rounded-xl border border-border hover:border-brand-orange/50 transition-colors">
                <h3 className="font-bold text-lg mb-3">Which encryption level should I choose?</h3>
                <p className="text-muted-foreground text-sm">We recommend 256-bit AES for all modern use cases. Only choose 128-bit RC4 if you need compatibility with very old PDF readers.</p>
              </div>
              <div className="bg-card p-6 rounded-xl border border-border hover:border-brand-orange/50 transition-colors">
                <h3 className="font-bold text-lg mb-3">Will the file size increase?</h3>
                <p className="text-muted-foreground text-sm">Encryption adds minimal overhead. Your protected PDF will be roughly the same size as the original, typically within 1-2% difference.</p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
