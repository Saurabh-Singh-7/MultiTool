import { Metadata } from 'next'
import ExcelToPDFClient from './client'

export const metadata: Metadata = {
  title: "Excel to PDF Converter Free Online - Convert XLSX to PDF | ToolHive",
  description: "Convert Excel spreadsheets to PDF online for free. Fast, secure, and private browser-based conversion for XLS and XLSX files. No file limits, no signup, works on any device.",
  keywords: "excel to pdf, convert excel to pdf, xlsx to pdf, xls to pdf, free online excel converter, spreadsheet to pdf"
}

export default function ExcelToPDFPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1">
        <ExcelToPDFClient />
        
        {/* SEO Content Section */}
        <div className="container mx-auto px-4 py-16 max-w-5xl">
          <section className="grid md:grid-cols-2 gap-12 items-center mb-24">
            <div>
              <h2 className="text-3xl font-bold mb-6 font-syne">Why Convert Excel to PDF?</h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Excel files are powerful for data manipulation, but they aren't ideal for sharing final reports. Converting a spreadsheet to PDF ensures that your data tables, charts, and formatting remain locked and look professional on any screen.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Our free Excel to PDF converter allows you to instantly transform these files into clean, readable PDFs without uploading them to any server. Your privacy is 100% guaranteed as the conversion happens right in your browser.
              </p>
            </div>
            <div className="bg-card rounded-3xl p-8 border border-border shadow-sm">
              <h3 className="text-xl font-bold mb-4">Key Benefits</h3>
              <ul className="space-y-3">
                {[
                  "Table Alignment: Preserves column and row layout",
                  "100% Private: Spreadsheets never leave your computer",
                  "High Compatibility: Works on all devices and OS",
                  "Fast & Free: No subscriptions or watermarks",
                  "Batch Support: Convert multiple sheets at once"
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

          <section className="mb-24">
            <h2 className="text-3xl font-bold mb-10 font-syne text-center">How to Convert Excel to PDF</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { t: "Upload Excel Files", d: "Drag and drop your .xlsx or .xls files into the upload zone above." },
                { t: "Automatic Processing", d: "Our tool processes the sheets locally using your browser's power." },
                { t: "Download PDF", d: "Click convert and download your professional PDF document instantly." }
              ].map((step, i) => (
                <div key={i} className="text-center">
                  <div className="size-12 rounded-2xl bg-brand-orange text-white font-bold text-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand-orange/20">
                    {i + 1}
                  </div>
                  <h3 className="font-bold mb-2">{step.t}</h3>
                  <p className="text-sm text-muted-foreground">{step.d}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-muted/30 rounded-3xl p-8 md:p-12 border border-border">
            <h2 className="text-3xl font-bold mb-10 font-syne text-center">Frequently Asked Questions</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {[
                { q: "Is it safe to use ToolHive?", a: "Yes. All conversion logic runs locally on your device. We do not store, view, or upload your spreadsheets to any server." },
                { q: "Can I convert multiple sheets?", a: "Yes. By default, our tool converts the entire workbook into a single PDF document with each sheet on a new page." },
                { q: "Will the data be accurate?", a: "We aim for 100% data accuracy. All text and numbers in your tables will be preserved exactly as they appear in Excel." },
                { q: "Is there a file size limit?", a: "No. Since it runs on your machine, you are only limited by your browser's memory capacity." }
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
