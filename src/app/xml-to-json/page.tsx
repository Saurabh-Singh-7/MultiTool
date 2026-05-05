import { Metadata } from 'next'
import XMLToJSONClient from './client'

export const metadata: Metadata = {
  title: "XML to JSON Converter Free Online - Data Format Tools | ToolHive",
  description: "Convert XML to JSON and JSON to XML online for free. Fast, secure, and private browser-based data conversion. Ideal for modernizing legacy data formats.",
  keywords: "xml to json, json to xml, convert xml to json online, xml converter, legacy data converter, web development tools"
}

export default function XMLToJSONPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1">
        <XMLToJSONClient />
        
        {/* SEO Content Section */}
        <div className="container mx-auto px-4 py-16 max-w-5xl">
          <section className="grid md:grid-cols-2 gap-12 items-center mb-24">
            <div>
              <h2 className="text-3xl font-bold mb-6 font-syne">XML to JSON: Modernizing Data</h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                XML (Extensible Markup Language) was once the dominant format for web data, but it has largely been replaced by the more lightweight and readable JSON. However, many legacy systems and SOAP APIs still use XML.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Our free XML to JSON converter makes it easy to modernize your data payloads. All processing happens in your browser, so your data stays private and secure.
              </p>
            </div>
            <div className="bg-card rounded-3xl p-8 border border-border shadow-sm">
              <h3 className="text-xl font-bold mb-4">Key Features</h3>
              <ul className="space-y-3">
                {[
                  "Bi-directional: Convert XML to JSON and back",
                  "Privacy First: Files never leave your local machine",
                  "Indented Output: Easy-to-read formatted code",
                  "Fast Processing: Instant results for large datasets",
                  "Universal: Works on all modern web browsers"
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
