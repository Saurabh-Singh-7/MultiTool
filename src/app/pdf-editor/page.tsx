import { Metadata } from 'next'
import PDFEditorClient from './client'
import Link from 'next/link'
import { FileText, Layers, Scissors, Image as ImageIcon, CheckCircle2, ShieldCheck, HelpCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: "Free Online PDF Editor - Edit PDF Text Images Shapes | ToolHive",
  description: "Edit PDF files online for free. Add and edit text, insert images, add shapes, highlight, whiteout, sign PDF, add links and form fields. No signup, no watermark, works in browser.",
  keywords: "pdf editor online free, edit pdf text online, add text to pdf, fill pdf form online, sign pdf online, annotate pdf, pdf whiteout, edit pdf without adobe acrobat"
}

export default function PDFEditorPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 flex flex-col h-full w-full">
        {/* PDF Editor full-screen client component */}
        <div className="flex-1 min-h-[800px] w-full border-b border-border">
          <PDFEditorClient />
        </div>
        
        {/* SEO Content Section */}
        <div className="container mx-auto px-4 py-24 max-w-6xl space-y-20">
          
          <section className="scroll-mt-20">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold mb-4 font-heading">How to Edit PDF Files Online for Free</h2>
            </div>
            
            <div className="grid md:grid-cols-4 gap-6">
              <div className="bg-card p-6 rounded-2xl border border-border shadow-sm text-center relative overflow-hidden group hover:border-brand-orange/50 transition-colors">
                <div className="absolute top-0 right-0 p-4 text-8xl font-black text-muted/10 -z-10">1</div>
                <h3 className="text-lg font-bold mb-2">Upload your PDF file</h3>
                <p className="text-sm text-muted-foreground">Select or drag and drop your PDF file into the editor upload zone above.</p>
              </div>
              <div className="bg-card p-6 rounded-2xl border border-border shadow-sm text-center relative overflow-hidden group hover:border-brand-orange/50 transition-colors">
                <div className="absolute top-0 right-0 p-4 text-8xl font-black text-muted/10 -z-10">2</div>
                <h3 className="text-lg font-bold mb-2">Use the toolbar</h3>
                <p className="text-sm text-muted-foreground">Add text, images, shapes, or use the drawing tools from the top toolbar.</p>
              </div>
              <div className="bg-card p-6 rounded-2xl border border-border shadow-sm text-center relative overflow-hidden group hover:border-brand-orange/50 transition-colors">
                <div className="absolute top-0 right-0 p-4 text-8xl font-black text-muted/10 -z-10">3</div>
                <h3 className="text-lg font-bold mb-2">Edit and rearrange</h3>
                <p className="text-sm text-muted-foreground">Resize elements, manage pages in the left panel, and apply formatting.</p>
              </div>
              <div className="bg-card p-6 rounded-2xl border border-border shadow-sm text-center relative overflow-hidden group hover:border-brand-orange/50 transition-colors">
                <div className="absolute top-0 right-0 p-4 text-8xl font-black text-muted/10 -z-10">4</div>
                <h3 className="text-lg font-bold mb-2">Save and download</h3>
                <p className="text-sm text-muted-foreground">Click "Apply changes" to save your edits and download the updated document.</p>
              </div>
            </div>
          </section>

          <section className="bg-muted/30 rounded-3xl p-8 md:p-12 border border-border">
            <h2 className="text-3xl font-bold mb-8 font-heading text-center">What Can You Do With Our PDF Editor?</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="font-bold mb-2 text-brand-orange">Text</h3>
                <p className="text-sm text-muted-foreground">Add new text boxes anywhere on the page. Customize font, size, color, and alignment effortlessly.</p>
              </div>
              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="font-bold mb-2 text-brand-orange">Images</h3>
                <p className="text-sm text-muted-foreground">Insert logos, photos, or diagrams. Resize, rotate, and reposition images exactly where you need them.</p>
              </div>
              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="font-bold mb-2 text-brand-orange">Shapes</h3>
                <p className="text-sm text-muted-foreground">Add rectangles, circles, lines, and arrows. Perfect for creating forms or highlighting sections.</p>
              </div>
              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="font-bold mb-2 text-brand-orange">Signatures</h3>
                <p className="text-sm text-muted-foreground">Draw, type, or upload your signature. Sign documents instantly without printing them out.</p>
              </div>
              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="font-bold mb-2 text-brand-orange">Annotations</h3>
                <p className="text-sm text-muted-foreground">Highlight text, add sticky notes, and draw freehand to review or comment on documents.</p>
              </div>
              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="font-bold mb-2 text-brand-orange">Forms</h3>
                <p className="text-sm text-muted-foreground">Fill out interactive PDF forms directly in your browser. Select checkboxes, enter text, and choose from dropdowns.</p>
              </div>
            </div>
          </section>

          <section className="max-w-4xl mx-auto space-y-12">
            <div>
              <h2 className="text-3xl font-bold mb-4 font-heading">How to Sign a PDF Online</h2>
              <p className="text-muted-foreground mb-4">Adding your signature to a PDF is fast and secure. Select the 'Sign' tool from the top toolbar, then choose to draw your signature with your mouse, type it out using our elegant cursive fonts, or upload an image of an existing signature. Once placed on the document, you can resize and reposition it anywhere.</p>
            </div>
            
            <div>
              <h2 className="text-3xl font-bold mb-4 font-heading">How to Fill Out a PDF Form</h2>
              <p className="text-muted-foreground mb-4">You don't need expensive software to complete forms. Use the 'Forms' tool to instantly activate input fields on your PDF. You can type in text boxes, click checkboxes and radio buttons, or use dropdown menus. Your data is kept secure and never leaves your browser.</p>
            </div>

            <div>
              <h2 className="text-3xl font-bold mb-4 font-heading">How to Add Text to a PDF</h2>
              <p className="text-muted-foreground mb-4">Need to fill out a non-interactive form or add some notes? Click the 'Text' tool, then click anywhere on the page to start typing. You have full control over the typography—choose from dozens of Google fonts, change text color, apply bold or italics, and set paragraph alignment.</p>
            </div>
          </section>

          <section className="max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-10">
              <HelpCircle className="size-8 text-muted-foreground" />
              <h2 className="text-3xl font-bold font-heading text-center">Frequently Asked Questions</h2>
            </div>
            
            <div className="space-y-6">
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-bold text-lg mb-2">Can I edit existing text in a PDF?</h3>
                <p className="text-muted-foreground">You can easily add new text on top of existing content, or use our Whiteout tool to cover old text before typing over it. Direct inline editing of embedded PDF text requires the original font files and complex structural changes which are best suited for desktop software.</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-bold text-lg mb-2">Will my PDF quality be affected?</h3>
                <p className="text-muted-foreground">Our editor exports a high-quality PDF at 144 DPI by default, ensuring text remains sharp and images look great. Your original vector text is rasterized to preserve perfect layout accuracy during editing.</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-bold text-lg mb-2">Can I add a signature to my PDF?</h3>
                <p className="text-muted-foreground">Yes! Use the Signature tool in the top toolbar to draw your signature, type it using a cursive font, or upload an image of your signature. You can then place and resize it anywhere on the page.</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-bold text-lg mb-2">Is my PDF uploaded to a server?</h3>
                <p className="text-muted-foreground">No. Our advanced tool uses WebAssembly and JavaScript to run the entire editing engine directly inside your browser. Your PDF never leaves your device, guaranteeing total privacy.</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-bold text-lg mb-2">Can I edit password protected PDFs?</h3>
                <p className="text-muted-foreground">Yes, simply enter the password when prompted. We will securely decrypt the file locally in your browser so you can begin editing.</p>
              </div>
            </div>
          </section>

          <section className="pt-10 border-t border-border">
            <h2 className="text-2xl font-bold mb-8 font-heading text-center">Related Tools</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/pdf-merge" className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:bg-muted/50 hover:border-brand-orange/50 transition-all group">
                <div className="size-10 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Layers className="size-5" />
                </div>
                <div className="font-bold">Merge PDF</div>
              </Link>
              <Link href="/pdf-split" className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:bg-muted/50 hover:border-brand-orange/50 transition-all group">
                <div className="size-10 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Scissors className="size-5" />
                </div>
                <div className="font-bold">Split PDF</div>
              </Link>
              <Link href="/pdf-compress" className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:bg-muted/50 hover:border-brand-orange/50 transition-all group">
                <div className="size-10 rounded-lg bg-green-500/10 text-green-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileText className="size-5" />
                </div>
                <div className="font-bold">Compress PDF</div>
              </Link>
              <Link href="/pdf-to-image" className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:bg-muted/50 hover:border-brand-orange/50 transition-all group">
                <div className="size-10 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ImageIcon className="size-5" />
                </div>
                <div className="font-bold">PDF to Image</div>
              </Link>
            </div>
          </section>

        </div>
      </main>
    </div>
  )
}
