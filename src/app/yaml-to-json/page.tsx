import { Metadata } from 'next'
import YAMLToJSONClient from './client'

export const metadata: Metadata = {
  title: "YAML to JSON Converter Free Online - Dev Data Tools | ToolHive",
  description: "Convert YAML to JSON and JSON to YAML online for free. Fast, secure, and private browser-based data conversion. Essential for DevOps and modern web development.",
  keywords: "yaml to json, json to yaml, convert yaml to json online, yaml converter, devops tools, config converter"
}

export default function YAMLToJSONPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1">
        <YAMLToJSONClient />
        
        {/* SEO Content Section */}
        <div className="container mx-auto px-4 py-16 max-w-5xl">
          <section className="grid md:grid-cols-2 gap-12 items-center mb-24">
            <div>
              <h2 className="text-3xl font-bold mb-6 font-syne">YAML vs JSON: Why Convert?</h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                YAML (YAML Ain't Markup Language) is human-friendly and widely used for configuration files (like Docker, Kubernetes, and GitHub Actions). JSON is the standard for data exchange between servers and web applications.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Converting between these two is a daily task for DevOps engineers and developers. Our tool provides a clean, private way to switch formats without sending your sensitive config data to a server.
              </p>
            </div>
            <div className="bg-card rounded-3xl p-8 border border-border shadow-sm">
              <h3 className="text-xl font-bold mb-4">Why Use ToolHive?</h3>
              <ul className="space-y-3">
                {[
                  "Bi-directional: Convert YAML to JSON and vice versa",
                  "100% Private: Config data never leaves your browser",
                  "Instant Preview: Real-time conversion feedback",
                  "Clean Output: Perfectly formatted and indented code",
                  "Fast & Free: No signup or subscriptions required"
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="size-5 rounded-full bg-brand-orange/10 text-brand-orange flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-xs font-bold">✓</span>
                    </span>
                    <span className="text-sm font-medium">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
