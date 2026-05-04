import { Metadata } from 'next'
import ExtractAudioClient from './client'

export const metadata: Metadata = {
  title: "Extract Audio from Video Online Free - MP4 to MP3 | ToolHive",
  description: "Extract audio from any video file online for free. Convert MP4 to MP3, MP4 to WAV, MP4 to AAC instantly in browser. No signup, no watermark, no file size limit.",
  keywords: "extract audio from video, mp4 to mp3 online free, video to audio converter, extract mp3 from mp4, convert video to audio free, youtube audio extractor, mp4 to wav converter",
}

export default function ExtractAudioPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-6xl mx-auto px-4 py-12 md:py-24">
        {/* Breadcrumb */}
        <nav className="flex mb-8 text-sm text-muted-foreground font-inter" aria-label="Breadcrumb">
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
                <span className="text-brand-orange font-medium">Extract Audio</span>
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
            Browser-Based Processing
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight font-syne text-foreground drop-shadow-sm">
            Extract Audio from <span className="text-brand-orange relative inline-block">Video<div className="absolute -bottom-2 left-0 w-full h-1 bg-brand-orange rounded-full opacity-50 blur-[2px]"></div></span> — Free Online Tool
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-inter leading-relaxed">
            Extract audio from any video file instantly in your browser. Convert MP4, AVI, MOV, MKV to MP3, WAV or AAC — free, private, no signup needed. Your files never leave your device.
          </p>
        </div>

        <ExtractAudioClient />

        {/* SEO Content Section */}
        <div className="mt-32 max-w-4xl mx-auto space-y-16 border-t border-border pt-16">
          <section className="space-y-6">
            <h2 className="text-3xl font-bold font-syne text-foreground">How to Extract Audio from Video Online</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { step: 1, title: "Upload Video", desc: "Select or drag and drop your video file (MP4, AVI, MOV, etc.)." },
                { step: 2, title: "Select Format", desc: "Choose your desired audio format: MP3, WAV, AAC, or others." },
                { step: 3, title: "Customize Quality", desc: "Select the bitrate and sample rate, or trim the section you need." },
                { step: 4, title: "Download Audio", desc: "Click Extract and wait a few seconds to download your audio file." }
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
              <h2 className="text-2xl font-bold font-syne">Which Audio Format Should I Choose?</h2>
              <ul className="space-y-4">
                <li>
                  <strong className="text-brand-orange block mb-1">MP3:</strong>
                  <span className="text-muted-foreground text-sm">Best for music, podcasts, general use. Compatible with all devices and players.</span>
                </li>
                <li>
                  <strong className="text-brand-orange block mb-1">WAV:</strong>
                  <span className="text-muted-foreground text-sm">Lossless quality. Best for professional audio editing. Much larger file size.</span>
                </li>
                <li>
                  <strong className="text-brand-orange block mb-1">AAC:</strong>
                  <span className="text-muted-foreground text-sm">Better quality than MP3 at same size. Default for Apple devices and YouTube.</span>
                </li>
                <li>
                  <strong className="text-brand-orange block mb-1">FLAC:</strong>
                  <span className="text-muted-foreground text-sm">Lossless compression. Best quality with smaller size than WAV.</span>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h2 className="text-2xl font-bold font-syne">Which Quality Setting Should I Use?</h2>
              <ul className="space-y-4">
                <li className="bg-muted p-4 rounded-xl border border-border">
                  <strong className="block mb-1 italic">128 kbps:</strong>
                  <span className="text-muted-foreground text-sm italic">Smallest file size. Best for speech, podcasts, and voice notes.</span>
                </li>
                <li className="bg-brand-orange/5 p-4 rounded-xl border border-brand-orange/20">
                  <strong className="block mb-1">192 kbps:</strong>
                  <span className="text-muted-foreground text-sm">Recommended standard. Great balance between quality and file size.</span>
                </li>
                <li className="bg-muted p-4 rounded-xl border border-border">
                  <strong className="block mb-1">320 kbps:</strong>
                  <span className="text-muted-foreground text-sm">Maximum MP3 quality. Ideal for high-fidelity music storage.</span>
                </li>
              </ul>
            </div>
          </section>

          <section className="bg-card p-8 rounded-3xl border border-border shadow-xl">
             <h2 className="text-2xl font-bold font-syne mb-8 text-center">Common Uses for Audio Extraction</h2>
             <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
               {[
                 "Extract background music", "Save podcast from video", "Get audio from lectures",
                 "Extract music video songs", "Save voiceovers", "Create ringtones"
               ].map((use) => (
                 <div key={use} className="flex items-center gap-2 p-3 bg-muted rounded-lg text-sm font-medium">
                   <div className="w-2 h-2 rounded-full bg-brand-orange" />
                   {use}
                 </div>
               ))}
             </div>
          </section>

          <section className="space-y-6 text-center">
            <h2 className="text-3xl font-bold font-syne">Is It Safe to Extract Audio Online?</h2>
            <div className="max-w-2xl mx-auto space-y-4 text-muted-foreground">
              <p>Your video never leaves your device. FFmpeg runs entirely in your browser using WebAssembly technology.</p>
              <p className="font-bold text-foreground">We cannot see, access, or store your files. 100% private and completely secure.</p>
            </div>
          </section>

          <section className="space-y-8">
            <h2 className="text-3xl font-bold font-syne text-center">Frequently Asked Questions</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                { q: "What video formats are supported?", a: "MP4, AVI, MOV, MKV, WebM, FLV, WMV and more. Most common formats work perfectly." },
                { q: "Is there a file size limit?", a: "No hard limit. Large files (1GB+) work but may take several minutes to process based on your device." },
                { q: "Can I extract just part of the audio?", a: "Yes! Use the built-in trim feature to select specific sections of your video." },
                { q: "Is my video uploaded to a server?", a: "No. FFmpeg.wasm runs locally. Your video never leaves your device." }
              ].map((faq) => (
                <div key={faq.q} className="p-6 bg-muted rounded-2xl border border-border">
                  <h3 className="font-bold text-lg mb-2">{faq.q}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Related Tools */}
          <section className="pb-12 border-t border-border pt-16">
            <h2 className="text-2xl font-bold font-syne mb-8 text-center">Related Tools</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['Video Compressor', 'Audio Converter', 'Merge Audio', 'PDF Compress'].map((tool) => (
                <div key={tool} className="p-4 bg-card rounded-xl border border-border text-center hover:border-brand-orange transition-colors cursor-pointer group">
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
