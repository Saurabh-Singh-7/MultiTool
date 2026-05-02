import { Metadata } from 'next'
import ImageBlurClient from './client'
import Link from 'next/link'
import { ChevronRight, PackageOpen, ImageIcon, Scissors, RefreshCw } from 'lucide-react'
import Script from 'next/script'

export const metadata: Metadata = {
  title: "Blur Image Online Free - Blur Background & Faces | ToolHive",
  description: "Blur images, faces, backgrounds or specific areas online free. Pixelate sensitive info, blur photo backgrounds. No signup required.",
  keywords: "blur image online, blur background photo, blur face online, pixelate image, blur part of image, censor image online free"
}

export default function ImageBlurPage() {
  return (
    <>
      <Script id="schema-image-blur" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "Image Blur Tool - ToolHive",
        "url": "https://toolhive.in/image-blur",
        "applicationCategory": "MultimediaApplication",
        "operatingSystem": "Any",
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
        "description": "Blur images, faces, backgrounds or specific areas online free. Pixelate sensitive info, blur photo backgrounds."
      }) }} />

      <ImageBlurClient />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-12 py-8 mt-4 border-t border-border">

          <section>
            <h2 className="font-heading text-2xl font-bold mb-6">How to Blur an Image Online</h2>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              {[
                { step: "1", title: "Upload", desc: "Select any JPG, PNG, or WebP image up to 50MB." },
                { step: "2", title: "Select Mode", desc: "Choose Full Blur, Region Blur, Background Blur, or Face Blur." },
                { step: "3", title: "Adjust Settings", desc: "Select Gaussian or Pixelate and adjust the blur strength." },
                { step: "4", title: "Download", desc: "Compare the before/after and save your censored image." },
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
            <h2 className="font-heading text-2xl font-bold mb-6">How to Blur a Face in a Photo</h2>
            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
              <p className="text-muted-foreground mb-4">Protecting the privacy of people in your photos is easy with our AI-powered Face Blur tool.</p>
              <ul className="space-y-4">
                {[
                  { title: "Auto-Detection", desc: "Navigate to the 'Face Blur' tab. Our tool uses a local neural network to automatically detect all human faces in the image." },
                  { title: "One-Click Censoring", desc: "Detected faces are instantly blurred or pixelated based on your selected settings." },
                  { title: "Manual Override", desc: "If the AI misses a face (e.g., if they are turned away), you can switch to the 'Area Blur' tab and manually draw a blur region over them." },
                  { title: "Client-Side Processing", desc: "The facial recognition happens entirely in your browser. No biometric data or images are ever sent to a server." },
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
            <h2 className="font-heading text-2xl font-bold mb-6">How to Blur Image Background</h2>
            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
              <p className="text-muted-foreground mb-4">Simulate a DSLR 'bokeh' depth-of-field effect or hide a messy background in seconds.</p>
              <ul className="space-y-4">
                {[
                  { title: "Subject Isolation", desc: "Go to the 'Background Blur' tab. We use AI to perfectly cut out the main subject (person, product, or animal)." },
                  { title: "Background Processing", desc: "The remaining background is heavily blurred using a high-quality Gaussian blur." },
                  { title: "Seamless Compositing", desc: "The sharp subject is layered back over the blurred background, creating a professional portrait effect." },
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
            <h2 className="font-heading text-2xl font-bold mb-6">Privacy and Censoring Images</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="font-heading font-bold text-lg mb-2 text-brand-orange">Pixelation vs Blurring</div>
                <p className="text-sm text-muted-foreground">Gaussian Blur creates a smooth, frosted-glass effect which is aesthetically pleasing. Pixelation creates large blocky squares, which is universally recognized as a censorship method and is often considered more secure for hiding highly sensitive text or faces.</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="font-heading font-bold text-lg mb-2 text-blue-500">Document Security</div>
                <p className="text-sm text-muted-foreground">When sharing screenshots of documents, always use the 'Area Blur' tool to censor passwords, addresses, bank details, and license plates. Make sure the blur strength is high enough that the text cannot be un-blurred.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                { q: "Can a blurred image be un-blurred?", a: "If you apply a very weak blur, sophisticated AI tools might be able to reconstruct the image. For highly sensitive information (like passwords or credit cards), we recommend using the Pixelate mode at a high strength or simply drawing a solid black box over it." },
                { q: "Is the background blur AI free?", a: "Yes. Our background blur tool uses the @imgly/background-removal library which runs a machine learning model locally on your device for free." },
                { q: "Why didn't it detect all faces?", a: "The lightweight face detector works best on faces looking directly at the camera. Profiles, obscured faces, or very small faces might be missed. You can always use the 'Area Blur' tab to manually censor them." },
                { q: "Is my photo uploaded to your servers?", a: "No! All blurring, face detection, and background removal happens entirely inside your web browser. Your images never leave your computer." },
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
                { icon: ImageIcon, title: "Remove Background", href: "/background-remover" },
                { icon: RefreshCw, title: "Noise Remover", href: "/image-denoise" }
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
