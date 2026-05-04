import { Metadata } from 'next'
import AudioConverterClient from './client'

export const metadata: Metadata = {
  title: "Free Audio Converter Online - Convert MP3 WAV AAC OGG | ToolHive",
  description: "Convert audio files between MP3, WAV, AAC, OGG, FLAC, M4A formats online for free. Batch convert multiple audio files. No signup needed.",
  keywords: "audio converter online free, mp3 to wav, wav to mp3, convert audio format, mp3 converter, flac to mp3, aac to mp3, ogg converter, m4a to mp3 online free, audio format converter",
}

export default function AudioConverterPage() {
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
                <span className="cursor-default">Audio Tools</span>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <span className="mx-2 text-zinc-400">/</span>
                <span className="text-brand-orange font-medium">Audio Converter</span>
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
            Batch Processing Enabled
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight font-syne text-foreground drop-shadow-sm">
            Audio <span className="text-brand-orange relative inline-block">Converter<div className="absolute -bottom-2 left-0 w-full h-1 bg-brand-orange rounded-full opacity-50 blur-[2px]"></div></span> — Any Format, Free
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-inter leading-relaxed">
             Convert audio files between any format instantly. MP3, WAV, AAC, OGG, FLAC, M4A and more — batch convert up to 10 files. Free, private, no signup.
          </p>
        </div>

        <AudioConverterClient />

        {/* SEO Content Section */}
        <div className="mt-32 max-w-4xl mx-auto space-y-16 border-t border-border pt-16">
          <section className="space-y-6">
            <h2 className="text-3xl font-bold font-syne text-foreground">How to Convert Audio Files Online</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { step: 1, title: "Upload Files", desc: "Drag and drop up to 10 audio files in any format (MP3, WAV, FLAC, etc.)." },
                { step: 2, title: "Select Format", desc: "Choose your desired output format and adjust quality or advanced filters." },
                { step: 3, title: "Process", desc: "Click Convert to start the browser-side conversion engine." },
                { step: 4, title: "Download", desc: "Preview the results with waveforms and download as individual files or a ZIP." }
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
            <div className="space-y-6">
              <h2 className="text-2xl font-bold font-syne">Audio Format Guide</h2>
              <div className="space-y-4">
                {[
                  { name: "MP3", desc: "Most popular format. Best for music, podcasts, and mobile devices." },
                  { name: "WAV", desc: "Uncompressed lossless audio. Maximum quality, very large file size." },
                  { name: "FLAC", desc: "Lossless compression. Audiophile quality, half the size of WAV." },
                  { name: "AAC", desc: "Modern standard. Higher quality than MP3 at the same bitrate." }
                ].map(f => (
                  <div key={f.name} className="flex gap-4 p-4 bg-muted/50 rounded-xl border border-border">
                    <div className="font-black text-brand-orange text-lg min-w-[50px]">{f.name}</div>
                    <p className="text-sm text-muted-foreground">{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <h2 className="text-2xl font-bold font-syne">Audio Bitrate Guide</h2>
              <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
                 <table className="w-full text-sm text-left">
                   <thead className="bg-muted text-[10px] uppercase font-black tracking-widest text-muted-foreground">
                     <tr>
                       <th className="px-4 py-3">Bitrate</th>
                       <th className="px-4 py-3">Use Case</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-border">
                     <tr><td className="px-4 py-3 font-bold">64 kbps</td><td className="px-4 py-3 text-muted-foreground">Voice, Speech, Podcasts</td></tr>
                     <tr><td className="px-4 py-3 font-bold">128 kbps</td><td className="px-4 py-3 text-muted-foreground">Standard Music Quality</td></tr>
                     <tr><td className="px-4 py-3 font-bold">192 kbps</td><td className="px-4 py-3 text-muted-foreground">High Quality Music</td></tr>
                     <tr><td className="px-4 py-3 font-bold">320 kbps</td><td className="px-4 py-3 text-muted-foreground">Audiophile/Pro Quality</td></tr>
                   </tbody>
                 </table>
              </div>
              <p className="text-xs text-muted-foreground italic">Note: Higher bitrates result in better quality but larger file sizes.</p>
            </div>
          </section>

          <section className="bg-card p-8 rounded-3xl border border-border shadow-xl space-y-8">
             <h2 className="text-2xl font-bold font-syne text-center">Frequently Asked Questions</h2>
             <div className="grid md:grid-cols-2 gap-6">
               {[
                 { q: "How many files can I convert at once?", a: "You can upload and convert up to 10 files in a single batch." },
                 { q: "Is there a file size limit?", a: "No hard limit, but browser memory limits apply. Files under 500MB work best." },
                 { q: "Can I adjust volume or normalize?", a: "Yes! Use the 'Advanced Options' panel to adjust volume, normalize to -14 LUFS, or add fades." },
                 { q: "Are my files private?", a: "Absolutely. Conversion happens locally in your browser. Files never touch our servers." }
               ].map((faq) => (
                 <div key={faq.q} className="space-y-2">
                   <h4 className="font-bold">{faq.q}</h4>
                   <p className="text-muted-foreground text-sm leading-relaxed">{faq.a}</p>
                 </div>
               ))}
             </div>
          </section>

          {/* Related Tools */}
          <section className="pb-12 border-t border-border pt-16">
            <h2 className="text-2xl font-bold font-syne mb-8 text-center">Related Audio Tools</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['Extract Audio', 'Video Compressor', 'Merge Audio', 'PDF Compress'].map((tool) => (
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
