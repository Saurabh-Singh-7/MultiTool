import { Metadata } from 'next'
import PDFUnlockClient from './client'

export const metadata: Metadata = {
  title: "Unlock PDF Online Free - Remove PDF Password | ToolHive",
  description: "Remove password from PDF files online for free. Unlock protected PDF documents instantly. No signup required.",
  keywords: "unlock pdf online free, remove pdf password, pdf password remover, decrypt pdf online, unlock protected pdf",
}

export default function PDFUnlockPage() {
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
            Unlock PDF Online
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight font-syne text-foreground drop-shadow-sm">
            Remove Password from <span className="text-brand-orange relative inline-block">PDF<div className="absolute -bottom-2 left-0 w-full h-1 bg-brand-orange rounded-full opacity-50 blur-[2px]"></div></span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-inter">
            Remove passwords and restrictions from your PDF files securely in your browser. Fast, free, and completely private.
          </p>
        </div>

        <PDFUnlockClient />

        {/* SEO Content Section */}
        <div className="mt-32 max-w-4xl mx-auto space-y-16">
          <section className="bg-card rounded-2xl p-8 md:p-12 shadow-xl border border-border">
            <h2 className="text-3xl font-bold font-syne mb-6 text-foreground">How to Remove Password from PDF</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-full bg-brand-orange/10 flex items-center justify-center text-brand-orange font-bold text-xl">1</div>
                <h3 className="font-bold text-lg">Upload Protected PDF</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">Drag and drop your password-protected PDF into the upload zone. We support files up to 100MB.</p>
              </div>
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-full bg-brand-orange/10 flex items-center justify-center text-brand-orange font-bold text-xl">2</div>
                <h3 className="font-bold text-lg">Enter Password</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">If the PDF has an open password, enter it to prove authorization. Permission restrictions are removed automatically.</p>
              </div>
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-full bg-brand-orange/10 flex items-center justify-center text-brand-orange font-bold text-xl">3</div>
                <h3 className="font-bold text-lg">Download Unlocked PDF</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">Instantly download your unlocked PDF file without any passwords or editing/printing restrictions.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold font-syne mb-6 text-foreground">Types of PDF Protection</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-muted rounded-xl p-6 border border-border">
                <h3 className="font-bold text-lg mb-3 text-brand-orange">🔐 Open Password (User)</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  This completely locks the PDF so it cannot be viewed without the correct password. You <strong>must</strong> know this password to unlock the document using our tool.
                </p>
              </div>
              <div className="bg-muted rounded-xl p-6 border border-border">
                <h3 className="font-bold text-lg mb-3 text-brand-orange">🛡️ Permissions Password (Owner)</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  The PDF can be opened and viewed without a password, but printing, copying, or editing is restricted. Our tool can often remove these restrictions automatically without needing the password.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold font-syne mb-6 text-foreground">When You Cannot Unlock a PDF</h2>
            <div className="bg-brand-orange/5 border border-brand-orange/20 rounded-xl p-6 md:p-8 space-y-4">
              <p className="text-muted-foreground">
                Our tool is designed for legitimate users who need to recover or remove passwords from their own documents. There are situations where unlocking is not possible:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-2">
                <li><strong>Forgotten Open Passwords:</strong> If the PDF requires a password just to open it and you don't know it, we cannot unlock it. We do not perform brute-force attacks or hacking.</li>
                <li><strong>Digital Signatures:</strong> PDFs secured with certificate-based digital signatures cannot have their restrictions removed without invalidating the signature.</li>
                <li><strong>Server-Side DRM:</strong> Documents protected by enterprise DRM solutions (like Adobe Experience Manager) require authentication servers and cannot be unlocked here.</li>
              </ul>
            </div>
          </section>

          <section className="pb-12">
            <h2 className="text-3xl font-bold font-syne mb-8 text-foreground text-center">FAQs</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-card p-6 rounded-xl border border-border hover:border-brand-orange/50 transition-colors">
                <h3 className="font-bold text-lg mb-3">Is it legal to remove a PDF password?</h3>
                <p className="text-muted-foreground text-sm">Yes, provided you own the document or have explicit permission from the creator. Removing passwords from copyrighted documents you don't own may violate laws in your jurisdiction.</p>
              </div>
              <div className="bg-card p-6 rounded-xl border border-border hover:border-brand-orange/50 transition-colors">
                <h3 className="font-bold text-lg mb-3">Can I unlock a PDF without the password?</h3>
                <p className="text-muted-foreground text-sm">If it's an Open Password (required to view the file), no. You must enter the password to decrypt it. If it's only a Permissions Password (restricting printing/copying), we can often remove it automatically.</p>
              </div>
              <div className="bg-card p-6 rounded-xl border border-border hover:border-brand-orange/50 transition-colors">
                <h3 className="font-bold text-lg mb-3">Are my unlocked PDFs stored on your server?</h3>
                <p className="text-muted-foreground text-sm">No. The entire decryption process runs locally in your web browser. Your protected documents are never uploaded to our servers, ensuring total privacy.</p>
              </div>
              <div className="bg-card p-6 rounded-xl border border-border hover:border-brand-orange/50 transition-colors">
                <h3 className="font-bold text-lg mb-3">Will the unlocked PDF lose its formatting?</h3>
                <p className="text-muted-foreground text-sm">No. The unlocking process simply removes the encryption wrapper and restrictions. The contents, layout, images, and fonts of the PDF remain exactly the same as the original.</p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
