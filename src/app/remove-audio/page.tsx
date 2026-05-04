import { Metadata } from 'next'
import RemoveAudioClient from './client'

export const metadata: Metadata = {
  title: "Remove Audio from Video Online Free - Mute Video | ToolHive",
  description: "Remove audio from video online for free. Mute MP4, MOV, AVI videos instantly. Replace audio or add silence. No signup needed.",
  keywords: "remove audio from video, mute video online free, strip audio from mp4, silent video maker, remove sound from video, mute mp4 online",
}

export default function RemoveAudioPage() {
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
                <span className="text-brand-orange font-medium">Remove Audio</span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Header Section */}
        <div className="text-center space-y-6 mb-16 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-orange/10 text-brand-orange text-sm font-semibold tracking-wide uppercase mb-4 shadow-sm border border-brand-orange/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-orange opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-orange" />
            </span>
            WASM Powered • Client Side
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight font-syne text-foreground drop-shadow-sm">
            Remove <span className="text-brand-orange relative inline-block">Audio<div className="absolute -bottom-2 left-0 w-full h-1 bg-brand-orange rounded-full opacity-50 blur-[2px]"></div></span> — Mute Video Free
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-inter leading-relaxed">
            Remove or replace the audio track from any video. Mute completely, add silence, or swap with your own audio — free, private, no signup.
          </p>
        </div>

        <RemoveAudioClient />

        {/* SEO Content Section */}
        <div className="mt-32 max-w-4xl mx-auto space-y-16 border-t border-border pt-16">
          <section className="space-y-6">
            <h2 className="text-3xl font-bold font-syne text-foreground text-center">Master Your Video Sound</h2>
            <div className="grid md:grid-cols-3 gap-8">
               {[
                 { title: "Mute Video", desc: "Completely strip all audio tracks from your video. Uses stream copy technology for near-instant results without quality loss.", icon: "🔇" },
                 { title: "Replace Audio", desc: "Swap out the original audio with a new background track or voiceover. Perfect for making music videos or tutorials.", icon: "🔄" },
                 { title: "Audio Mixing", desc: "Keep the original audio but blend it with a new background track. Adjust volumes for both to get the perfect balance.", icon: "🎚️" }
               ].map((feature) => (
                 <div key={feature.title} className="bg-card p-8 rounded-3xl border border-border shadow-sm hover:shadow-md transition-all text-center">
                   <div className="text-4xl mb-4">{feature.icon}</div>
                   <h3 className="font-bold text-xl mb-3">{feature.title}</h3>
                   <p className="text-muted-foreground text-sm leading-relaxed">{feature.desc}</p>
                 </div>
               ))}
            </div>
          </section>

          <section className="space-y-8 bg-brand-orange/5 p-12 rounded-[3rem] border border-brand-orange/20">
            <h2 className="text-3xl font-bold font-syne text-foreground">How to Use the Mute Tool</h2>
            <div className="space-y-6">
               {[
                 { step: 1, title: "Upload Video", text: "Drag and drop your MP4, MOV, or AVI file into the workspace." },
                 { step: 2, title: "Choose Operation", text: "Select between 'Remove', 'Replace', 'Silence', or 'Mix' modes." },
                 { step: 3, title: "Process & Download", text: "Click the orange button and your silent or modified video will be ready in seconds." }
               ].map((s) => (
                 <div key={s.step} className="flex gap-6">
                   <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-brand-orange text-white flex items-center justify-center font-bold text-xl">
                     {s.step}
                   </div>
                   <div>
                     <h4 className="font-bold text-lg mb-1">{s.title}</h4>
                     <p className="text-muted-foreground">{s.text}</p>
                   </div>
                 </div>
               ))}
            </div>
          </section>

          <section className="grid md:grid-cols-2 gap-12 pt-8">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold font-syne">Why Use Our Video Mutier?</h2>
              <p className="text-muted-foreground leading-relaxed">
                Unlike other tools that re-encode your entire video (causing quality loss and taking forever), our "Mute" mode uses direct stream copying. This means we simply strip the audio packet metadata while leaving the video data untouched. It's the fastest and highest quality way to silence a video online.
              </p>
            </div>
            <div className="space-y-4">
              <h2 className="text-2xl font-bold font-syne">100% Private & Secure</h2>
              <p className="text-muted-foreground leading-relaxed">
                Your videos never leave your browser. We use FFmpeg.wasm technology to process everything locally on your machine. This ensures your data is completely private and your sensitive videos are never uploaded to any server.
              </p>
            </div>
          </section>

          <section className="max-w-3xl mx-auto space-y-6">
             <h2 className="text-2xl font-bold font-syne text-center">Frequently Asked Questions</h2>
             <div className="space-y-4">
               {[
                 { q: "What video formats are supported?", a: "We support all major formats including MP4, MOV, AVI, MKV, and WebM up to 2GB in size." },
                 { q: "Will the video quality decrease?", a: "In 'Mute' mode, there is zero quality loss as we use stream copying. In other modes, we use high-bitrate AAC and H.264 settings to maintain maximum clarity." },
                 { q: "Can I replace audio with a specific volume?", a: "Yes, our 'Mix' and 'Replace' modes include volume adjustment sliders from -20dB to +20dB." },
                 { q: "Is there a watermark?", a: "Never. All ToolHive tools are 100% free with no watermarks and no account requirements." }
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
