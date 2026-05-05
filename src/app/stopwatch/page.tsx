import { Metadata } from 'next'
import StopwatchClient from './client'
export const metadata: Metadata = { title: "Stopwatch & Timer Online Free | ToolHive", description: "Free online stopwatch and countdown timer. Lap times, full-screen mode, and audio alerts. No download needed." }
export default function Page() {
  return (
    <div className="min-h-screen bg-background font-inter">
      <main className="max-w-3xl mx-auto px-4 py-12 md:py-24">
        <nav className="flex mb-8 text-sm text-muted-foreground"><ol className="inline-flex items-center space-x-1"><li><a href="/" className="hover:text-brand-orange transition-colors">Home</a></li><li><span className="mx-2 text-zinc-400">/</span><span className="text-brand-orange font-medium">Stopwatch</span></li></ol></nav>
        <div className="text-center space-y-6 mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight font-syne">Stopwatch & <span className="text-brand-orange">Timer</span></h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Precise stopwatch with lap times and a countdown timer with audio alerts.</p>
        </div>
        <StopwatchClient />
      </main>
    </div>
  )
}
