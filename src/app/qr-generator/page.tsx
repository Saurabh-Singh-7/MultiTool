import { Metadata } from 'next'
import QRCodeClient from './client'

export const metadata: Metadata = {
  title: "QR Code Generator Free - Custom QR Codes with Logo | ToolHive",
  description: "Create custom QR codes with logo, colors, and design for free. Generate QR codes for URLs, text, WiFi, email, phone, vCard and more. Download as PNG or SVG.",
  keywords: "qr code generator, free qr code maker, qr code with logo, custom qr code, wifi qr code, vcard qr code, url qr code generator"
}

export default function QRCodePage() {
  return (
    <div className="min-h-screen bg-background font-inter">
      <main className="max-w-7xl mx-auto px-4 py-12 md:py-24">
        {/* Breadcrumb */}
        <nav className="flex mb-8 text-sm text-muted-foreground" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center"><a href="/" className="hover:text-brand-orange transition-colors">Home</a></li>
            <li><div className="flex items-center"><span className="mx-2 text-zinc-400">/</span><span>Utilities</span></div></li>
            <li aria-current="page"><div className="flex items-center"><span className="mx-2 text-zinc-400">/</span><span className="text-brand-orange font-medium">QR Code Generator</span></div></li>
          </ol>
        </nav>

        {/* Header Section */}
        <div className="text-center space-y-6 mb-16 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-orange/10 text-brand-orange text-sm font-semibold tracking-wide uppercase mb-4 shadow-sm border border-brand-orange/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-orange opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-orange" />
            </span>
            Free QR Generator
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight font-syne text-foreground drop-shadow-sm">
            QR Code Generator — <span className="text-brand-orange relative inline-block">Custom with Logo<div className="absolute -bottom-2 left-0 w-full h-1 bg-brand-orange rounded-full opacity-50 blur-[2px]"></div></span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-inter leading-relaxed">
            Create custom QR codes with your logo, colors, and unique design. Free forever, unlimited scans.
          </p>
        </div>

        <QRCodeClient />

        {/* SEO Content */}
        <div className="mt-32 max-w-5xl mx-auto space-y-20 border-t border-border pt-20 font-inter text-foreground">
          <section className="space-y-8">
            <h2 className="text-3xl font-bold font-syne">How to Create a QR Code</h2>
            <div className="grid md:grid-cols-4 gap-8">
              {[
                { step: "1", title: "Choose content type", desc: "Select what your QR code should contain — a URL, text, WiFi credentials, email, phone number, or vCard." },
                { step: "2", title: "Enter your data", desc: "Fill in the required fields. For URLs, paste the full link. For WiFi, enter your network name and password." },
                { step: "3", title: "Customize design", desc: "Pick custom colors, adjust dot styles, and upload your own logo to make the QR code uniquely yours." },
                { step: "4", title: "Download & share", desc: "Download your QR code as a high-resolution PNG image. It's free forever with unlimited scans." }
              ].map((item, idx) => (
                <div key={idx} className="p-8 border border-border rounded-3xl hover:border-brand-orange/50 transition-colors relative overflow-hidden group bg-card">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-5xl font-bold text-brand-orange">0{item.step}</div>
                  <h3 className="font-bold text-xl mb-3">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-3xl font-bold font-syne text-center">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                { q: "Are the QR codes free to use commercially?", a: "Yes! All QR codes generated here are 100% free and can be used for any purpose, including commercial use, printing, and marketing." },
                { q: "Do the QR codes expire?", a: "No. The QR codes generated are static and will work forever. There are no scanning limits or expiration dates." },
                { q: "Can I add my company logo?", a: "Yes! Upload any image as a logo. QR codes have built-in error correction, allowing up to 30% of the code to be covered by a logo while remaining scannable." },
                { q: "What content types are supported?", a: "We support URL, plain text, WiFi network credentials, email addresses, phone numbers, SMS, and vCard contact information." },
                { q: "Is my data stored anywhere?", a: "No. Everything runs locally in your browser. Your data never leaves your device. We don't store, track, or transmit any information you enter." }
              ].map((faq) => (
                <div key={faq.q} className="p-8 bg-muted/50 rounded-[2.5rem] border border-border transition-all hover:border-brand-orange/30">
                  <h4 className="font-bold mb-4 text-lg">{faq.q}</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
