import { Metadata } from 'next'
import ImageMetadataClient from './client'
import Link from 'next/link'
import { ChevronRight, PackageOpen, ImageIcon, Scissors, RefreshCw } from 'lucide-react'
import Script from 'next/script'

export const metadata: Metadata = {
  title: "Image Metadata Viewer - View & Remove EXIF Data Online | ToolHive",
  description: "View hidden EXIF metadata from photos online free. See camera settings, GPS location, date taken. Remove metadata for privacy. No upload.",
  keywords: "exif viewer online, image metadata viewer, remove exif data, photo metadata reader, gps location from photo, exif remover free"
}

export default function ImageMetadataPage() {
  return (
    <>
      <Script id="schema-image-metadata" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "Image Metadata Viewer - ToolHive",
        "url": "https://toolhive.in/image-metadata",
        "applicationCategory": "UtilitiesApplication",
        "operatingSystem": "Any",
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
        "description": "View hidden EXIF metadata from photos online free. See camera settings, GPS location, date taken. Remove metadata for privacy."
      }) }} />

      <ImageMetadataClient />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-12 py-8 mt-4 border-t border-border">

          <section>
            <h2 className="font-heading text-2xl font-bold mb-6">What is EXIF Data?</h2>
            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
              <p className="text-muted-foreground mb-4">EXIF stands for Exchangeable Image File Format. Every time you take a picture with a digital camera or smartphone, a massive amount of hidden data is embedded directly into the image file itself. This data typically includes:</p>
              <ul className="space-y-4">
                {[
                  { title: "Technical Specifications", desc: "Shutter speed, aperture, ISO, focal length, flash status, and lens type." },
                  { title: "Hardware Information", desc: "The exact make and model of the camera or smartphone used." },
                  { title: "Time and Date", desc: "The precise timestamp of when the original photo was captured." },
                  { title: "Location (GPS)", desc: "The exact latitude, longitude, and sometimes altitude where you were standing when you took the photo." },
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
            <h2 className="font-heading text-2xl font-bold mb-6">How to View Photo Metadata</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { step: "1", title: "Select Image", desc: "Upload a JPG, PNG, WebP, TIFF, or HEIC file. We process everything in your browser." },
                { step: "2", title: "Analyze", desc: "Our tool extracts EXIF, XMP, IPTC, and ICC profiles instantly without uploading." },
                { step: "3", title: "View Data", desc: "Read the camera settings, view the GPS location on Google Maps, and export to JSON." },
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
            <h2 className="font-heading text-2xl font-bold mb-6">What GPS Data in Photos Means</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="font-heading font-bold text-lg mb-2 text-brand-orange">The Privacy Risk</div>
                <p className="text-sm text-muted-foreground">If you take a photo of your pet inside your house with location services enabled, the exact GPS coordinates of your home are embedded in that file. If you email or upload that original file to certain websites, anyone who downloads it can see exactly where you live down to a few meters.</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="font-heading font-bold text-lg mb-2 text-blue-500">Social Media Stripping</div>
                <p className="text-sm text-muted-foreground">Major platforms like Instagram, Twitter, and Facebook automatically strip EXIF data when you upload photos, protecting your privacy. However, sending photos via email, iMessage (as original), Discord, or personal blogs often leaves the GPS data intact.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold mb-6">How to Remove Metadata for Privacy</h2>
            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
              <p className="text-muted-foreground mb-4">Removing metadata ensures that no one can track your location or camera equipment when you share a photo. To clean your image using our tool:</p>
              <ul className="space-y-4">
                {[
                  { title: "Upload your photo", desc: "Our tool will highlight if there are any high-risk privacy concerns like GPS tags." },
                  { title: "Click 'Remove All Metadata'", desc: "We use HTML5 Canvas to repaint your image pixel-by-pixel, inherently destroying all hidden text data while keeping the image looking identical." },
                  { title: "Download the Clean Image", desc: "You'll receive a fresh, sanitized JPG or PNG file that is 100% safe to share anywhere." },
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
            <h2 className="font-heading text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                { q: "Is it safe to upload my private photos here?", a: "Yes! Your photos are never 'uploaded' to a server. The EXIF extraction and the metadata removal both happen entirely locally within your web browser using Javascript." },
                { q: "Why doesn't my image have any metadata?", a: "If you downloaded the image from social media (like Instagram or Twitter), or if it was edited/compressed by another tool, the metadata was likely already stripped out." },
                { q: "Can I edit the metadata instead of removing it?", a: "Currently, our tool is designed for viewing and removing metadata for privacy purposes. Editing or spoofing EXIF data is not supported." },
                { q: "Does removing EXIF data reduce image quality?", a: "The visual quality remains virtually identical, but because the image is re-encoded into a clean file, there may be an extremely minor (often imperceptible) shift in compression. For privacy purposes, it is highly recommended." },
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
                { icon: Scissors, title: "Image Cropper", href: "/image-crop" },
                { icon: RefreshCw, title: "Image Converter", href: "/image-converter" },
                { icon: ImageIcon, title: "Image Blur", href: "/image-blur" }
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
