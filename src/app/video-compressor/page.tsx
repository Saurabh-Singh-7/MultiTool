import { Metadata } from 'next'
import VideoCompressorClient from './client'

export const metadata: Metadata = {
  title: "Compress Video Online Free - Reduce Video File Size | ToolHive",
  description: "Compress video files online for free. Reduce MP4, AVI, MOV video size without losing quality. No signup, no watermark, works in browser.",
  keywords: "compress video online free, reduce video file size, video compressor, shrink video file, mp4 compressor online, video size reducer, compress mp4 free, reduce video size without losing quality",
}

export default function VideoCompressorPage() {
  return (
    <div className="min-h-screen bg-background font-inter">
      <main className="max-w-6xl mx-auto px-4 py-12 md:py-24">
        {/* Breadcrumb */}
        <nav className="flex mb-8 text-sm text-muted-foreground" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <a href="/" className="hover:text-brand-orange transition-colors">Home</a>
            </li>
            <li>
              <div className="flex items-center">
                <span className="mx-2 text-zinc-400">/</span>
                <span className="cursor-default">Video Tools</span>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <span className="mx-2 text-zinc-400">/</span>
                <span className="text-brand-orange font-medium">Video Compressor</span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Header Section */}
        <div className="text-center space-y-6 mb-16 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-orange/10 text-brand-orange text-sm font-semibold tracking-wide uppercase mb-4 shadow-sm border border-brand-orange/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-orange opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-orange"></span>
            </span>
            Privacy-First Compression
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight font-syne text-foreground drop-shadow-sm">
            Video <span className="text-brand-orange relative inline-block">Compressor<div className="absolute -bottom-2 left-0 w-full h-1 bg-brand-orange rounded-full opacity-50 blur-[2px]"></div></span> — Reduce Size Free
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-inter leading-relaxed">
            Compress any video file instantly in your browser. Reduce MP4, MOV, AVI size by up to 90% without visible quality loss. Free, private, no signup.
          </p>
        </div>

        <VideoCompressorClient />

        {/* SEO Content Section */}
        <div className="mt-32 max-w-4xl mx-auto space-y-16 border-t border-border pt-16">
          <section className="space-y-6">
            <h2 className="text-3xl font-bold font-syne text-foreground">How to Compress a Video Online</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { step: 1, title: "Upload Video", desc: "Select or drag and drop your video file (MP4, AVI, MOV, etc.)." },
                { step: 2, title: "Select Mode", desc: "Choose a compression level or set a specific target file size." },
                { step: 3, title: "Apply Settings", desc: "Click Compress and wait for our engine to process your file." },
                { step: 4, title: "Download", desc: "Preview the result and download your optimized video instantly." }
              ].map((item) => (
                <div key={item.step} className="bg-card p-6 rounded-2xl border border-border hover:border-brand-orange/50 transition-all group">
                  <div className="w-10 h-10 rounded-full bg-brand-orange/10 flex items-center justify-center text-brand-orange font-bold text-xl mb-4 group-hover:bg-brand-orange group-hover:text-white transition-colors">
                    {item.step}
                  </div>
                  <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="grid md:grid-cols-2 gap-12">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold font-syne">Which Compression Level Should I Use?</h2>
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-xl border border-border hover:border-brand-orange/30 transition-colors">
                   <strong className="text-brand-orange block mb-1">Low (Near Lossless):</strong>
                   <span className="text-muted-foreground text-sm">Best for professional use where quality matters most. Archiving and source files.</span>
                </div>
                <div className="p-4 bg-muted rounded-xl border border-border hover:border-brand-orange/30 transition-colors">
                   <strong className="text-brand-orange block mb-1">Medium (Good Quality):</strong>
                   <span className="text-muted-foreground text-sm">Recommended for sharing online. Perfect for YouTube or Vimeo uploads.</span>
                </div>
                <div className="p-4 bg-brand-orange/5 rounded-xl border border-brand-orange/20">
                   <strong className="text-brand-orange block mb-1">High (Recommended):</strong>
                   <span className="text-muted-foreground text-sm">Best for WhatsApp, email, and social media. Great balance of size and quality.</span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h2 className="text-2xl font-bold font-syne">Video Codec Comparison</h2>
              <ul className="space-y-4">
                <li>
                  <strong className="block mb-1">H.264:</strong>
                  <span className="text-muted-foreground text-sm">Most compatible. Works on all devices. Recommended for broad sharing.</span>
                </li>
                <li>
                  <strong className="block mb-1">H.265/HEVC:</strong>
                  <span className="text-muted-foreground text-sm">50% smaller than H.264 for the same quality. Great for newer mobile devices.</span>
                </li>
                <li>
                  <strong className="block mb-1">AV1:</strong>
                  <span className="text-muted-foreground text-sm">Latest format. Best compression but very slow to encode in browser.</span>
                </li>
              </ul>
            </div>
          </section>

          <section className="bg-card p-8 rounded-3xl border border-border shadow-xl space-y-6">
             <h2 className="text-2xl font-bold font-syne text-center">Frequently Asked Questions</h2>
             <div className="grid md:grid-cols-2 gap-6">
               {[
                 { q: "How much can I compress a video?", a: "Typically 50-85% size reduction. A 248MB video can often become 50-70MB depending on settings." },
                 { q: "Will the video quality be affected?", a: "At 'High' compression, the quality remains excellent. Use 'Low' for professional archiving." },
                 { q: "Is my video uploaded to a server?", a: "No. FFmpeg.wasm runs directly in your browser. Your video never leaves your device." },
                 { q: "Can I compress 4K video?", a: "Yes! We can also downscale 4K to 1080p for massive size savings." }
               ].map((faq) => (
                 <div key={faq.q} className="p-6 bg-muted/50 rounded-2xl border border-border">
                   <h4 className="font-bold mb-2">{faq.q}</h4>
                   <p className="text-muted-foreground text-sm">{faq.a}</p>
                 </div>
               ))}
             </div>
          </section>

          {/* Related Tools */}
          <section className="pb-12 border-t border-border pt-16 text-center">
            <h2 className="text-2xl font-bold font-syne mb-8">Related Video Tools</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['Extract Audio', 'Audio Converter', 'Video Trimmer', 'Image Compressor'].map((tool) => (
                <div key={tool} className="p-4 bg-card rounded-xl border border-border hover:border-brand-orange transition-colors cursor-pointer group">
                  <p className="text-sm font-semibold group-hover:text-brand-orange">{tool}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
