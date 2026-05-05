import { Metadata } from 'next'
import JsonFormatterClient from './client'

export const metadata: Metadata = {
  title: "JSON Formatter & Validator Online Free | ToolHive",
  description: "Format, validate, minify and beautify JSON data online. Syntax highlighting, error detection with line numbers, tree view and more. Free JSON tool.",
  keywords: "json formatter, json validator, json beautifier, json minifier, json viewer online, json parser, json editor online free"
}

export default function JsonFormatterPage() {
  return (
    <div className="min-h-screen bg-background font-inter">
      <main className="max-w-7xl mx-auto px-4 py-12 md:py-24">
        <nav className="flex mb-8 text-sm text-muted-foreground" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center"><a href="/" className="hover:text-brand-orange transition-colors">Home</a></li>
            <li><div className="flex items-center"><span className="mx-2 text-zinc-400">/</span><span>Developer</span></div></li>
            <li aria-current="page"><div className="flex items-center"><span className="mx-2 text-zinc-400">/</span><span className="text-brand-orange font-medium">JSON Formatter</span></div></li>
          </ol>
        </nav>

        <div className="text-center space-y-6 mb-16 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-orange/10 text-brand-orange text-sm font-semibold tracking-wide uppercase mb-4 shadow-sm border border-brand-orange/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-orange opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-orange" />
            </span>
            Developer Tool
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight font-syne text-foreground drop-shadow-sm">
            JSON Formatter & <span className="text-brand-orange relative inline-block">Validator<div className="absolute -bottom-2 left-0 w-full h-1 bg-brand-orange rounded-full opacity-50 blur-[2px]"></div></span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-inter leading-relaxed">
            Format, validate, minify and explore JSON data with syntax highlighting, error detection, and a visual tree view.
          </p>
        </div>

        <JsonFormatterClient />

        {/* SEO Content */}
        <div className="mt-32 max-w-5xl mx-auto space-y-20 border-t border-border pt-20 font-inter text-foreground">
          <section className="space-y-8">
            <h2 className="text-3xl font-bold font-syne">What is JSON?</h2>
            <p className="text-muted-foreground leading-relaxed">JSON (JavaScript Object Notation) is a lightweight data-interchange format. It is easy for humans to read and write and easy for machines to parse and generate. JSON is built on two structures: a collection of key/value pairs (objects) and an ordered list of values (arrays). It is the most common format used in web APIs and configuration files.</p>
          </section>
          <section className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-3xl font-bold font-syne text-center">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                { q: "Does this tool store my JSON data?", a: "No. All processing happens locally in your browser. Your data is never sent to any server." },
                { q: "What does 'Validate' mean?", a: "Validation checks whether your input is syntactically correct JSON. If there are errors like missing commas, unclosed brackets, or invalid values, the tool will highlight the exact error and its position." },
                { q: "What is 'Minify'?", a: "Minifying removes all unnecessary whitespace and newlines from JSON, making it as compact as possible. This is useful for reducing payload size in API responses or config files." },
                { q: "Can I use this for large JSON files?", a: "Yes. The tool handles large JSON payloads well. For extremely large files (10MB+), performance may vary based on your browser and device." },
              ].map(faq => (
                <div key={faq.q} className="p-8 bg-muted/50 rounded-[2.5rem] border border-border hover:border-brand-orange/30 transition-all">
                  <h4 className="font-bold mb-4 text-lg">{faq.q}</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
