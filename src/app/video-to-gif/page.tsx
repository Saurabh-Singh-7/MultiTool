import { Metadata } from 'next'
import VideoToGifClient from './client'

export const metadata: Metadata = {
  title: "Video to GIF Converter Free Online - MP4 to GIF | ToolHive",
  description: "Convert any video to GIF online for free. MP4 to GIF, MOV to GIF, WebM to GIF. Set custom size, speed, quality and frame rate. No signup, works in browser instantly.",
  keywords: "video to gif, mp4 to gif online free, convert video to gif, make gif from video, gif maker online free, mp4 to animated gif, video to gif converter, create gif from video",
}

export default function VideoToGifPage() {
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
                <span className="text-brand-orange font-medium">Video to GIF</span>
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
            Instant GIF Maker
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight font-syne text-foreground drop-shadow-sm">
            Video to <span className="text-brand-orange relative inline-block">GIF Converter<div className="absolute -bottom-2 left-0 w-full h-1 bg-brand-orange rounded-full opacity-50 blur-[2px]"></div></span> — Make GIF Free
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-inter leading-relaxed">
            Convert any video clip to an animated GIF instantly. Trim to exact seconds, control frame rate, resize and optimize — free, private, no signup needed.
          </p>
        </div>

        <VideoToGifClient />

        {/* SEO Content Section */}
        <div className="mt-24 space-y-16 border-t border-border pt-16">
          <section className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold font-syne">How to Convert Video to GIF Online</h2>
              <ul className="space-y-4">
                <li className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-orange text-white flex items-center justify-center font-bold">1</span>
                  <p className="pt-1 text-muted-foreground"><strong className="text-foreground">Upload:</strong> Select your MP4, MOV, WebM or other video file from your device.</p>
                </li>
                <li className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-orange text-white flex items-center justify-center font-bold">2</span>
                  <p className="pt-1 text-muted-foreground"><strong className="text-foreground">Trim:</strong> Select the exact clip you want by setting the start and end time.</p>
                </li>
                <li className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-orange text-white flex items-center justify-center font-bold">3</span>
                  <p className="pt-1 text-muted-foreground"><strong className="text-foreground">Customize:</strong> Set your preferred resolution, frame rate, and quality level.</p>
                </li>
                <li className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-orange text-white flex items-center justify-center font-bold">4</span>
                  <p className="pt-1 text-muted-foreground"><strong className="text-foreground">Convert:</strong> Click "Convert to GIF" and download your finished animation instantly.</p>
                </li>
              </ul>
            </div>
            <div className="bg-muted/50 rounded-3xl p-8 border border-border">
               <h3 className="text-xl font-bold mb-4 flex items-center gap-2">💡 GIF Settings Guide</h3>
               <div className="space-y-4 text-sm text-muted-foreground">
                  <p><strong className="text-foreground">Resolution:</strong> Use 480px for social media sharing and 240px for chat messages.</p>
                  <p><strong className="text-foreground">Frame Rate:</strong> 10fps is the sweet spot. 15fps+ is smoother but creates much larger files.</p>
                  <p><strong className="text-foreground">Duration:</strong> Keep your GIFs under 10 seconds for the best compatibility and loading speed.</p>
                  <p><strong className="text-foreground">Colors:</strong> 128 colors is perfect for most content. High (256) is best for cinematic clips.</p>
               </div>
            </div>
          </section>

          <section className="space-y-8">
            <h2 className="text-3xl font-bold font-syne text-center">Best GIF Sizes for Different Platforms</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
               {[
                 { platform: "Twitter/X", specs: "Max 15MB, < 15s" },
                 { platform: "WhatsApp", specs: "Max 16MB, < 30s" },
                 { platform: "Discord", specs: "Max 8MB, 480px" },
                 { platform: "Slack", specs: "Max 4MB, 480px" },
                 { platform: "Giphy", specs: "Max 100MB, 480px" },
                 { platform: "Reddit", specs: "Max 20MB, 640px" }
               ].map(p => (
                 <div key={p.platform} className="bg-card border border-border p-4 rounded-2xl text-center">
                    <p className="font-bold text-foreground">{p.platform}</p>
                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mt-1">{p.specs}</p>
                 </div>
               ))}
            </div>
          </section>

          <div className="grid md:grid-cols-2 gap-12">
            <section className="space-y-6">
              <h2 className="text-2xl font-bold font-syne">Video to GIF vs Video to WebP</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  While GIF is the most universally supported animated format, WebP is a newer alternative that offers significantly better quality at smaller file sizes.
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>GIF:</strong> Universal support everywhere. Large file size. Limited to 256 colors. Best for maximum compatibility.</li>
                  <li><strong>WebP:</strong> 30-50% smaller than GIF. Supports millions of colors. Best for web performance but not supported on all legacy platforms.</li>
                </ul>
              </div>
            </section>

            <section className="space-y-6">
              <h2 className="text-2xl font-bold font-syne">Frequently Asked Questions</h2>
              <div className="space-y-4">
                <details className="group border-b border-border pb-4 cursor-pointer">
                  <summary className="font-bold hover:text-brand-orange transition-colors">What video formats can I convert?</summary>
                  <p className="text-sm text-muted-foreground mt-2">MP4, MOV, AVI, MKV, WebM and most other common video formats work perfectly with our browser-based engine.</p>
                </details>
                <details className="group border-b border-border pb-4 cursor-pointer">
                  <summary className="font-bold hover:text-brand-orange transition-colors">Why is my GIF so large?</summary>
                  <p className="text-sm text-muted-foreground mt-2">GIFs are uncompressed per frame. To reduce size, try lowering the duration, resolution, or frame rate in the settings panel.</p>
                </details>
                <details className="group border-b border-border pb-4 cursor-pointer">
                  <summary className="font-bold hover:text-brand-orange transition-colors">Are my files uploaded to a server?</summary>
                  <p className="text-sm text-muted-foreground mt-2">No. All processing happens locally in your browser using WebAssembly. Your video never leaves your device.</p>
                </details>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
