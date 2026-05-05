import { Metadata } from 'next'
import PomodoroClient from './client'
export const metadata: Metadata = { title: "Pomodoro Timer Online Free | ToolHive", description: "Focus timer using the Pomodoro technique. 25 min work, 5 min break cycles. Track sessions and stay productive. Free online." }
export default function Page() {
  return (
    <div className="min-h-screen bg-background font-inter">
      <main className="max-w-3xl mx-auto px-4 py-12 md:py-24">
        <nav className="flex mb-8 text-sm text-muted-foreground"><ol className="inline-flex items-center space-x-1"><li><a href="/" className="hover:text-brand-orange transition-colors">Home</a></li><li><span className="mx-2 text-zinc-400">/</span><span className="text-brand-orange font-medium">Pomodoro Timer</span></li></ol></nav>
        <div className="text-center space-y-6 mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight font-syne">Pomodoro <span className="text-brand-orange">Timer</span></h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Stay focused with the Pomodoro technique. Work 25 minutes, rest 5 minutes, repeat.</p>
        </div>
        <PomodoroClient />
      </main>
    </div>
  )
}
