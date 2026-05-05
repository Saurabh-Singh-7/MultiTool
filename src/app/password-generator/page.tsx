import { Metadata } from 'next'
import PasswordGeneratorClient from './client'

export const metadata: Metadata = {
  title: "Strong Password Generator Online | ToolHive",
  description: "Generate highly secure, random passwords. Customize length, uppercase, lowercase, numbers, and symbols. Free online tool.",
  keywords: "password generator, strong password creator, random password generator, secure password generator"
}

export default function PasswordGeneratorPage() {
  return (
    <div className="min-h-screen bg-background font-inter">
      <main className="max-w-4xl mx-auto px-4 py-12 md:py-24">
        <nav className="flex mb-8 text-sm text-muted-foreground" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center"><a href="/" className="hover:text-brand-orange transition-colors">Home</a></li>
            <li><div className="flex items-center"><span className="mx-2 text-zinc-400">/</span><span>Utilities</span></div></li>
            <li aria-current="page"><div className="flex items-center"><span className="mx-2 text-zinc-400">/</span><span className="text-brand-orange font-medium">Password Generator</span></div></li>
          </ol>
        </nav>

        <div className="text-center space-y-6 mb-16 relative z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight font-syne text-foreground">
            Strong Password <span className="text-brand-orange relative inline-block">Generator<div className="absolute -bottom-2 left-0 w-full h-1 bg-brand-orange rounded-full opacity-50 blur-[2px]"></div></span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Create completely random, highly secure passwords to protect your online accounts.
          </p>
        </div>

        <PasswordGeneratorClient />
      </main>
    </div>
  )
}
