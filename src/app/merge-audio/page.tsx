import { Metadata } from 'next'
import MergeAudioClient from './client'

export const metadata: Metadata = {
  title: "Merge Audio Files Online Free - Join MP3 WAV Files | ToolHive",
  description: "Merge and join multiple audio files into one online for free. Combine MP3, WAV, AAC, OGG files. Drag to reorder. No signup needed.",
  keywords: "merge audio files online free, join mp3 files, combine audio files, merge mp3 online, join audio files, audio joiner online free, combine mp3 files into one, audio merger",
}

export default function MergeAudioPage() {
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
                <span className="text-brand-orange font-medium">Merge Audio</span>
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
            Browser-Side Merging
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight font-syne text-foreground drop-shadow-sm">
            Merge Audio <span className="text-brand-orange relative inline-block">Files<div className="absolute -bottom-2 left-0 w-full h-1 bg-brand-orange rounded-full opacity-50 blur-[2px]"></div></span> — Join Free Online
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-inter leading-relaxed">
            Combine multiple audio files into one seamlessly. Drag to reorder, add silence between tracks, or crossfade for smooth transitions — free, private, no signup.
          </p>
        </div>

        <MergeAudioClient />

        {/* SEO Content Section */}
        <div className="mt-32 max-w-4xl mx-auto space-y-16 border-t border-border pt-16">
          <section className="space-y-6">
            <h2 className="text-3xl font-bold font-syne text-foreground text-center">How to Merge Audio Files Online</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { step: 1, title: "Upload Files", desc: "Drag and drop up to 20 audio files in any format (MP3, WAV, etc.)." },
                { step: 2, title: "Reorder Tracks", desc: "Drag and drop files to arrange them in your preferred sequence." },
                { step: 3, title: "Adjust Effects", desc: "Add silence gaps or enable crossfades for smooth transitions." },
                { step: 4, title: "Download", desc: "Click Merge and download your joined audio file instantly." }
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
              <h2 className="text-2xl font-bold font-syne">Why Merge Audio Files?</h2>
              <ul className="space-y-4">
                {[
                  { t: "Podcasts:", d: "Join intros, main segments, and outros into one seamless episode." },
                  { t: "Playlists:", d: "Combine multiple songs into a single continuous mix for events." },
                  { t: "Audiobooks:", d: "Join separate chapters into a single audio file for easier listening." },
                  { t: "Recordings:", d: "Merge multiple voice memos or interview parts into a single track." }
                ].map(u => (
                  <li key={u.t} className="flex gap-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-orange mt-2 shrink-0" />
                    <div>
                      <strong className="text-foreground">{u.t}</strong>
                      <p className="text-sm text-muted-foreground">{u.d}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-4">
              <h2 className="text-2xl font-bold font-syne">Crossfade vs Silence</h2>
              <div className="space-y-4">
                 <div className="p-4 bg-muted rounded-xl border border-border">
                    <h4 className="font-bold text-brand-orange text-sm mb-1">Crossfade:</h4>
                    <p className="text-xs text-muted-foreground">Creates a smooth overlap where one track fades out while the next fades in. Perfect for music transitions.</p>
                 </div>
                 <div className="p-4 bg-muted rounded-xl border border-border">
                    <h4 className="font-bold text-brand-orange text-sm mb-1">Silence:</h4>
                    <p className="text-xs text-muted-foreground">Adds a distinct pause between tracks. Best for podcasts or educational content to separate topics.</p>
                 </div>
              </div>
            </div>
          </section>

          <section className="bg-card p-8 rounded-3xl border border-border shadow-xl space-y-8">
             <h2 className="text-2xl font-bold font-syne text-center">Frequently Asked Questions</h2>
             <div className="grid md:grid-cols-2 gap-6">
               {[
                 { q: "Can I merge different audio formats?", a: "Yes! You can mix MP3, WAV, AAC, and OGG files. They will all be joined into your chosen output format." },
                 { q: "How many files can I join at once?", a: "You can upload and merge up to 20 files in a single operation." },
                 { q: "Is there a limit on total length?", a: "There's no hard limit, but very long merges (3+ hours) may take several minutes to process." },
                 { q: "Is it safe to use ToolHive?", a: "100%. Processing happens locally in your browser via WebAssembly. Your audio files are never uploaded to our servers." }
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
            <h2 className="text-2xl font-bold font-syne mb-8 text-center">Related Tools</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['Audio Converter', 'Extract Audio', 'Video Compressor', 'PDF Merge'].map((tool) => (
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
