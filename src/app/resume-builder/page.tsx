import { Metadata } from 'next'
import ResumeClient from './client'
export const metadata: Metadata = { title: "Resume Builder Online Free | ToolHive", description: "Build a professional resume in minutes. Choose a template, fill in your details, and download as PDF. Free resume maker." }
export default function Page() {
  return (
    <div className="min-h-screen bg-background font-inter">
      <main className="max-w-6xl mx-auto px-4 py-12 md:py-24">
        <nav className="flex mb-8 text-sm text-muted-foreground"><ol className="inline-flex items-center space-x-1"><li><a href="/" className="hover:text-brand-orange transition-colors">Home</a></li><li><span className="mx-2 text-zinc-400">/</span><span className="text-brand-orange font-medium">Resume Builder</span></li></ol></nav>
        <div className="text-center space-y-6 mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight font-syne">Resume <span className="text-brand-orange">Builder</span></h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Build a professional resume and download as PDF. Free, no signup required.</p>
        </div>
        <ResumeClient />
      </main>
    </div>
  )
}
