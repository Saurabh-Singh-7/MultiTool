import { Metadata } from 'next'
import PDFToExcelClient from './client'

export const metadata: Metadata = {
  title: "PDF to Excel Converter Free Online - Extract Tables from PDF",
  description: "Convert PDF tables to Excel spreadsheets online for free. Extract data from PDF to XLSX. No signup required.",
  keywords: "pdf to excel, convert pdf to excel online free, extract table from pdf, pdf to xlsx, pdf data to spreadsheet",
}

export default function PDFToExcelPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-6xl mx-auto px-4 py-12 md:py-24">
        {/* Header Section */}
        <div className="text-center space-y-6 mb-16 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-orange/10 text-brand-orange text-sm font-semibold tracking-wide uppercase mb-4 shadow-sm border border-brand-orange/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-orange opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-orange"></span>
            </span>
            Extract Tables from PDF
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight font-syne text-foreground drop-shadow-sm">
            Convert PDF to <span className="text-brand-orange relative inline-block">Excel<div className="absolute -bottom-2 left-0 w-full h-1 bg-brand-orange rounded-full opacity-50 blur-[2px]"></div></span> Automatically
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-inter">
            Extract tabular data and spreadsheets directly from your PDF files into editable Excel (.xlsx) formats—100% free and in your browser.
          </p>
        </div>

        {/* Client Application */}
        <PDFToExcelClient />

        {/* SEO Content Section */}
        <div className="mt-32 max-w-4xl mx-auto space-y-16">
          <section className="bg-card rounded-2xl p-8 md:p-12 shadow-xl border border-border">
            <h2 className="text-3xl font-bold font-syne mb-6 text-foreground">How to Convert PDF to Excel</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-full bg-brand-orange/10 flex items-center justify-center text-brand-orange font-bold text-xl">1</div>
                <h3 className="font-bold text-lg">Upload Your PDF</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">Drag and drop your PDF file containing tables into the upload box. We support files up to 50MB.</p>
              </div>
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-full bg-brand-orange/10 flex items-center justify-center text-brand-orange font-bold text-xl">2</div>
                <h3 className="font-bold text-lg">Verify & Edit Data</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">Our tool automatically detects columns and rows. You can review the extracted table right in your browser and fix any misalignment.</p>
              </div>
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-full bg-brand-orange/10 flex items-center justify-center text-brand-orange font-bold text-xl">3</div>
                <h3 className="font-bold text-lg">Export to XLSX</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">Download your organized data directly as an Excel spreadsheet (.xlsx), ready for analysis and formatting.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold font-syne mb-6 text-foreground">How to Extract Tables from PDF</h2>
            <div className="bg-brand-orange/5 border border-brand-orange/20 rounded-xl p-6 md:p-8 space-y-4">
              <p className="text-muted-foreground">
                Extracting structured data from a flat PDF file can be incredibly difficult because PDFs don't natively understand "tables." Here's how to ensure the best results using our tool:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-2">
                <li><strong>Clear Alignments:</strong> Our tool relies on horizontal and vertical spacing to detect columns. PDFs with clear grid lines or consistent spacing yield the best results.</li>
                <li><strong>Review Mode:</strong> Always use the built-in browser preview to check the extracted rows. If a cell spans multiple columns, you can adjust your settings before downloading.</li>
                <li><strong>Native PDFs vs Scans:</strong> Ensure your PDF was generated digitally (like saving a Word or Excel document as a PDF). Scanned images of tables require OCR technology, which is not supported in this browser tool.</li>
              </ul>
            </div>
          </section>

          <section className="pb-12">
            <h2 className="text-3xl font-bold font-syne mb-8 text-foreground text-center">FAQs</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-card p-6 rounded-xl border border-border hover:border-brand-orange/50 transition-colors">
                <h3 className="font-bold text-lg mb-3">Does this tool support merged cells?</h3>
                <p className="text-muted-foreground text-sm">Detecting merged cells in a PDF is notoriously tricky. Our tool splits data based on visual column boundaries, so merged cells might be placed into a single column. We recommend reviewing the preview before exporting.</p>
              </div>
              <div className="bg-card p-6 rounded-xl border border-border hover:border-brand-orange/50 transition-colors">
                <h3 className="font-bold text-lg mb-3">Is it safe to upload confidential financial data?</h3>
                <p className="text-muted-foreground text-sm">Yes! Because our tool runs 100% inside your web browser, your sensitive financial tables and reports are never uploaded to any remote server.</p>
              </div>
              <div className="bg-card p-6 rounded-xl border border-border hover:border-brand-orange/50 transition-colors">
                <h3 className="font-bold text-lg mb-3">Will each PDF page be on a separate Excel sheet?</h3>
                <p className="text-muted-foreground text-sm">Yes, by default, our converter will create a new worksheet (tab) in the Excel file for every page in the PDF that contains tabular data.</p>
              </div>
              <div className="bg-card p-6 rounded-xl border border-border hover:border-brand-orange/50 transition-colors">
                <h3 className="font-bold text-lg mb-3">Can I download the data as a CSV?</h3>
                <p className="text-muted-foreground text-sm">Yes, once the tables are extracted, you'll be given the option to download the data as a fully formatted .xlsx Excel file, or as a raw .csv file.</p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
