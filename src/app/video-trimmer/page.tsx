import { Metadata } from 'next'
import VideoTrimmerClient from './client'

export const metadata: Metadata = {
  title: "Video Trimmer Online Free - Cut & Trim Video | ToolHive",
  description: "Trim and cut videos online for free. Cut MP4, MOV, AVI to exact seconds. No quality loss, no watermark, works in browser.",
  keywords: "video trimmer online free, cut video online, trim mp4 online, video cutter free, cut video without losing quality, trim video online",
}

export default function VideoTrimmerPage() {
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
                <span className="text-brand-orange font-medium">Video Trimmer</span>
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
            Privacy-First Video Cutting
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight font-syne text-foreground drop-shadow-sm">
            Video <span className="text-brand-orange relative inline-block">Trimmer<div className="absolute -bottom-2 left-0 w-full h-1 bg-brand-orange rounded-full opacity-50 blur-[2px]"></div></span> — Cut & Trim Free
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-inter leading-relaxed">
            Trim your video to exact start and end points. Cut out unwanted parts, split into clips — free, private, no watermark, no signup needed.
          </p>
        </div>

        <VideoTrimmerClient />

        {/* SEO Content Section */}
        <div className="mt-32 max-w-4xl mx-auto space-y-16 border-t border-border pt-16">
          <section className="space-y-6">
            <h2 className="text-3xl font-bold font-syne text-foreground">How to Trim a Video Online</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { step: 1, title: "Upload Video", desc: "Select or drag and drop your video file (MP4, AVI, MOV, etc.)." },
                { step: 2, title: "Set Handles", desc: "Drag the orange handles on the timeline to select your clip." },
                { step: 3, title: "Choose Method", desc: "Select Fast Trim for speed or Precise Trim for frame accuracy." },
                { step: 4, title: "Download", desc: "Process and download your trimmed video instantly." }
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
              <h2 className="text-2xl font-bold font-syne text-foreground">Fast Trim vs Precise Trim</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  <strong>Fast Trim:</strong> Uses stream copying. It doesn't re-encode the video, making it near-instant. However, it can only cut at "keyframes," meaning the result might be off by about a second.
                </p>
                <p>
                  <strong>Precise Trim:</strong> Re-encodes the video frames. This is slower but allows you to cut at the exact millisecond you specify.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <h2 className="text-2xl font-bold font-syne text-foreground">How to Cut Multiple Clips</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our tool supports multi-clip extraction. Simply click the "Add Another Clip" button to select another range from the same video. You can then choose to merge them into one video or save them as separate files.
              </p>
            </div>
          </section>

          <section className="bg-card p-8 rounded-3xl border border-border shadow-xl space-y-6">
             <h2 className="text-2xl font-bold font-syne text-center">Frequently Asked Questions</h2>
             <div className="grid md:grid-cols-2 gap-6">
               {[
                 { q: "Is there a file size limit?", a: "You can upload videos up to 2GB. Larger files may take longer to load thumbnails." },
                 { q: "Will I lose quality?", a: "Fast Trim has zero quality loss. Precise Trim uses high-bitrate encoding to maintain near-lossless quality." },
                 { q: "Are my videos private?", a: "Yes. All processing happens in your browser. We never upload your video to any server." },
                 { q: "What formats are supported?", a: "We support MP4, MOV, WebM, AVI, MKV, and most other modern video formats." }
               ].map((faq) => (
                 <div key={faq.q} className="p-6 bg-muted/50 rounded-2xl border border-border">
                   <h4 className="font-bold mb-2">{faq.q}</h4>
                   <p className="text-muted-foreground text-sm">{faq.a}</p>
                 </div>
               ))}
             </div>
          </section>
        </div>
      </main>
    </div>
  )
}
