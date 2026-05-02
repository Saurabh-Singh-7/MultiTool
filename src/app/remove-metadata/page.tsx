import { Metadata } from 'next'
import RemoveMetadataClient from './client'
import Link from 'next/link'
import { ChevronRight, PackageOpen, ImageIcon, Scissors, Braces } from 'lucide-react'
import Script from 'next/script'

export const metadata: Metadata = {
  title: "Remove EXIF Data from Photo Online Free - Privacy Tool | ToolHive",
  description: "Remove hidden metadata and EXIF data from photos before sharing online. Protect your GPS location and privacy. Batch process up to 20 images.",
  keywords: "remove exif data, strip metadata from image, remove gps from photo, photo privacy tool, clean image metadata, remove location from photo free"
}

export default function RemoveMetadataPage() {
  return (
    <>
      <Script id="schema-remove-metadata" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "Remove EXIF Data Tool - ToolHive",
        "url": "https://toolhive.in/remove-metadata",
        "applicationCategory": "SecurityApplication",
        "operatingSystem": "Any",
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
        "description": "Remove hidden metadata and EXIF data from photos before sharing online. Protect your GPS location and privacy."
      }) }} />

      <RemoveMetadataClient />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-12 py-8 mt-4 border-t border-border">

          <section>
            <h2 className="font-heading text-2xl font-bold mb-6">Why Remove Photo Metadata?</h2>
            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
              <p className="text-muted-foreground mb-4">Every time you take a picture with a modern smartphone or digital camera, the device embeds hidden text data into the image file. This is called EXIF (Exchangeable Image File Format) data. Removing it is crucial for protecting your privacy online.</p>
              <ul className="space-y-4">
                {[
                  { title: "Hide Your Home Address", desc: "If you take a photo at home with location services enabled, the exact GPS coordinates are saved in the photo. Anyone who downloads the original file can find where you live." },
                  { title: "Protect Your Daily Routine", desc: "Photos contain precise timestamps. Sharing original photos can reveal exactly when you are away from home or at specific locations." },
                  { title: "Anonymity", desc: "EXIF data reveals the exact make and model of your smartphone, software version, and sometimes even a unique device serial number." },
                ].map(item => (
                  <li key={item.title} className="flex items-start gap-3">
                    <div className="size-6 rounded-full bg-brand-orange/10 text-brand-orange flex items-center justify-center shrink-0 mt-0.5">✓</div>
                    <div>
                      <strong className="text-foreground block">{item.title}</strong>
                      <span className="text-sm text-muted-foreground">{item.desc}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold mb-6">What EXIF Data Reveals About You</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="font-heading font-bold text-lg mb-2 text-brand-orange">The Technical Profile</div>
                <p className="text-sm text-muted-foreground">Beyond just the date and time, EXIF data includes detailed technical specifications: Exposure time, focal length, ISO, whether the flash fired, the color profile, and the exact lens used. For professional photographers, this is useful. For casual users, it's unnecessary baggage.</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="font-heading font-bold text-lg mb-2 text-blue-500">The Social Graph</div>
                <p className="text-sm text-muted-foreground">Some devices embed author names, copyright notices, or even face tags directly into the XMP or IPTC metadata sections of the file. Our tool strips all of these formats out simultaneously.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold mb-6">How to Remove GPS from Photos</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { step: "1", title: "Batch Upload", desc: "Drag and drop up to 20 images at once. Our tool works with JPG, PNG, WebP, and TIFF files." },
                { step: "2", title: "Quick Scan", desc: "The tool instantly scans your images locally to highlight which ones contain risky GPS data." },
                { step: "3", title: "Strip & Download", desc: "Click remove and download the clean ZIP file. Your images are now 100% untraceable." },
              ].map((item) => (
                <div key={item.step} className="rounded-xl border border-border bg-card p-5 text-center">
                  <div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-full bg-brand-orange/10 text-brand-orange font-heading font-bold text-lg">{item.step}</div>
                  <h3 className="font-heading font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold mb-6">Is It Safe to Share Photos Online?</h2>
            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
              <p className="text-muted-foreground mb-4">It depends on where you share them. Different platforms handle metadata differently:</p>
              <ul className="space-y-4">
                {[
                  { title: "Safe Platforms (They Strip Data)", desc: "Instagram, Twitter/X, Facebook, and WhatsApp (in standard compressed mode) automatically strip EXIF data to protect user privacy." },
                  { title: "Unsafe Platforms (They Keep Data)", desc: "Sending photos via Email, uploading to personal blogs, Discord, Reddit, iMessage (as original), or file sharing services (Google Drive/Dropbox) preserves the hidden data." },
                ].map(item => (
                  <li key={item.title} className="flex items-start gap-3">
                    <div className="size-6 rounded-full bg-brand-orange/10 text-brand-orange flex items-center justify-center shrink-0 mt-0.5">✓</div>
                    <div>
                      <strong className="text-foreground block">{item.title}</strong>
                      <span className="text-sm text-muted-foreground">{item.desc}</span>
                    </div>
                  </li>
                ))}
              </ul>
              <p className="text-sm font-medium mt-4 pt-4 border-t border-border">Rule of thumb: Always strip metadata using our tool before sending an image to a stranger or uploading it to a public forum.</p>
            </div>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                { q: "How does the removal process work?", a: "We use your browser's HTML5 Canvas. We draw your image onto a digital canvas, and then export the pixels back out into a new image file. This process naturally leaves behind all hidden text data, resulting in a completely clean file." },
                { q: "Are my photos uploaded to a server?", a: "Absolutely not. The entire scanning and removal process happens locally on your device via Javascript. We never see your images." },
                { q: "Does removing EXIF data ruin image quality?", a: "No. The visual appearance of the image remains identical. We export the cleaned image at 95% JPEG quality to ensure no perceptible loss in detail." },
                { q: "Can I just view the metadata without removing it?", a: "Yes! If you want a detailed breakdown of all the metadata fields, you can use our dedicated EXIF Viewer tool." },
              ].map((item) => (
                <details key={item.q} className="group rounded-xl border border-border bg-card overflow-hidden">
                  <summary className="flex items-center justify-between cursor-pointer p-5 font-medium hover:bg-muted/50 transition-colors list-none">
                    {item.q}
                    <ChevronRight className="size-4 text-muted-foreground transition-transform duration-200 group-open:rotate-90" />
                  </summary>
                  <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">{item.a}</div>
                </details>
              ))}
            </div>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold mb-6">Related Tools</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: PackageOpen, title: "Image Compressor", href: "/image-compressor" },
                { icon: Braces, title: "EXIF Viewer", href: "/image-metadata" },
                { icon: ImageIcon, title: "Image Blur", href: "/image-blur" },
                { icon: Scissors, title: "Image Cropper", href: "/image-crop" }
              ].map((tool) => (
                <Link key={tool.title} href={tool.href} className="flex flex-col items-center p-4 rounded-xl border border-border bg-card hover:border-brand-orange/50 hover:bg-muted/30 transition-all group">
                  <tool.icon className="size-8 mb-3 text-muted-foreground group-hover:text-brand-orange transition-colors" />
                  <span className="font-medium text-sm text-center">{tool.title}</span>
                </Link>
              ))}
            </div>
          </section>

        </div>
      </div>
    </>
  )
}
