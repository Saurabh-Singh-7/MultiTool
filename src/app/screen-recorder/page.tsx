import { Metadata } from 'next'
import ScreenRecorderClient from './client'

export const metadata: Metadata = {
  title: "Free Online Screen Recorder - Record Screen in Browser | ToolHive",
  description: "Record your screen online for free. No software download needed. Record screen with audio, webcam overlay, and download as MP4.",
  keywords: "screen recorder online free, record screen browser, screen capture online, record screen without software, online screen recording, free screen recorder no download",
}

export default function ScreenRecorderPage() {
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
                <span className="text-brand-orange font-medium">Screen Recorder</span>
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
            No Software Required
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight font-syne text-foreground drop-shadow-sm">
            Screen <span className="text-brand-orange relative inline-block">Recorder<div className="absolute -bottom-2 left-0 w-full h-1 bg-brand-orange rounded-full opacity-50 blur-[2px]"></div></span> — Record Free Online
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-inter leading-relaxed">
            Record your screen directly in the browser. No software download needed. Record with audio, webcam overlay — download as MP4 instantly.
          </p>
        </div>

        <ScreenRecorderClient />

        {/* SEO Content Section */}
        <div className="mt-32 max-w-4xl mx-auto space-y-16 border-t border-border pt-16">
          <section className="space-y-6">
            <h2 className="text-3xl font-bold font-syne text-foreground">How to Record Your Screen Online</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { step: 1, title: "Configure", desc: "Choose your record source, audio options, and webcam settings." },
                { step: 2, title: "Grant Access", desc: "Allow your browser to access the screen, microphone, and camera." },
                { step: 3, title: "Record", desc: "Start your recording with optional drawing and spotlight annotations." },
                { step: 4, title: "Save", desc: "Stop the recording and download your video as WebM or MP4." }
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
              <h2 className="text-2xl font-bold font-syne text-foreground">Record with Webcam & Audio</h2>
              <p className="text-muted-foreground leading-relaxed">
                Enhance your presentations by including a live webcam overlay. You can position the webcam in any corner and choose from small, medium, or large sizes. Our tool also supports capturing both system audio (browser sounds) and your microphone simultaneously.
              </p>
            </div>
            <div className="space-y-4">
              <h2 className="text-2xl font-bold font-syne text-foreground">Real-time Annotations</h2>
              <p className="text-muted-foreground leading-relaxed">
                Need to highlight something important? Use our built-in drawing tools to annotate your screen while recording. We also feature a "Pointer Spotlight" that darkens the rest of the screen to focus your audience's attention on your cursor.
              </p>
            </div>
          </section>

          <section className="bg-card p-8 rounded-3xl border border-border shadow-xl space-y-6">
             <h2 className="text-2xl font-bold font-syne text-center">Frequently Asked Questions</h2>
             <div className="grid md:grid-cols-2 gap-6">
               {[
                 { q: "Is it really free?", a: "Yes! There are no hidden fees, no watermarks, and no sign-up required. Record as many videos as you like." },
                 { q: "Does it work on mobile?", a: "Screen recording is currently only supported on desktop browsers (Chrome, Edge, Firefox, Safari)." },
                 { q: "Where is my video stored?", a: "Nowhere but your computer. All recording and processing happens locally in your browser for total privacy." },
                 { q: "How long can I record?", a: "There is no strict limit, but we recommend keeping recordings under 2 hours to avoid browser memory issues." }
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
