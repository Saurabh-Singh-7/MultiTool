import { Metadata } from 'next'
import CSVToJSONClient from './client'

export const metadata: Metadata = {
  title: "CSV to JSON Converter Free Online - Data Format Converter | ToolHive",
  description: "Convert CSV to JSON and JSON to CSV online for free. Fast, secure, and private browser-based data conversion. Perfect for developers and data analysts.",
  keywords: "csv to json, json to csv, convert csv to json online, convert json to csv free, data converter, developer tools"
}

export default function CSVToJSONPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1">
        <CSVToJSONClient />
        
        {/* SEO Content Section */}
        <div className="container mx-auto px-4 py-16 max-w-5xl">
          <section className="grid md:grid-cols-2 gap-12 items-center mb-24">
            <div>
              <h2 className="text-3xl font-bold mb-6 font-syne">Why Convert Data Formats?</h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                CSV (Comma Separated Values) is a common format for spreadsheets and data export, while JSON (JavaScript Object Notation) is the standard for modern web applications and APIs. Being able to quickly toggle between these formats is essential for developers, researchers, and data analysts.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Our free Data Converter allows you to instantly transform your data without uploading it to any server. Your information remains 100% private as all processing happens locally in your browser.
              </p>
            </div>
            <div className="bg-card rounded-3xl p-8 border border-border shadow-sm">
              <h3 className="text-xl font-bold mb-4">Key Features</h3>
              <ul className="space-y-3">
                {[
                  "Bi-directional: Convert CSV to JSON and JSON to CSV",
                  "100% Private: Data stays in your browser",
                  "Instant Preview: See your converted data immediately",
                  "Developer Friendly: Clean, formatted output",
                  "Fast & Free: No signup or limitations"
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

          <section className="bg-muted/30 rounded-3xl p-8 md:p-12 border border-border">
            <h2 className="text-3xl font-bold mb-10 font-syne text-center">Frequently Asked Questions</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {[
                { q: "Is my data secure?", a: "Yes. ToolHive processes everything locally. Your data is never sent to a server, ensuring total privacy." },
                { q: "Can I convert large CSV files?", a: "Yes. Our tool is optimized to handle large datasets efficiently using your browser's memory." },
                { q: "Does it support custom delimiters?", a: "Yes. You can specify the delimiter (comma, semicolon, tab) for CSV conversion." },
                { q: "Is the JSON formatted?", a: "Yes. We provide beautifully formatted JSON with indentation for easy reading." }
              ].map((faq, i) => (
                <div key={i}>
                  <h3 className="font-bold mb-2">{faq.q}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
