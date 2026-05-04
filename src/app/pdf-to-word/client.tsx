"use client"

import React, { useState, useRef, useEffect } from 'react'
import { Document, Paragraph, TextRun, HeadingLevel, PageBreak, Packer } from 'docx'
import { saveAs } from 'file-saver'
import { UploadCloud, FileText, CheckCircle2, Download, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'

// Dynamic load pdfjs
async function getPdfjs() {
  const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf')
  if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
  }
  return pdfjsLib
}

// ─── Extraction Logic ───
function groupIntoLines(items: any[]) {
  const lines: any[] = []
  let currentLine: any[] = []
  let lastY: number | null = null

  items.forEach(item => {
    const y = Math.round(item.transform[5])
    if (lastY === null || Math.abs(y - lastY) < 3) {
      currentLine.push(item)
    } else {
      if (currentLine.length > 0) {
        lines.push({
          y: lastY,
          text: currentLine
            .sort((a, b) => a.transform[4] - b.transform[4])
            .reduce((acc, curr, idx, arr) => {
              if (idx === 0) return curr.str;
              const prev = arr[idx - 1];
              const gap = curr.transform[4] - (prev.transform[4] + (prev.width || 0));
              const charWidth = curr.height * 0.4; // Rough estimate of char width
              let spaces = " ";
              if (gap > charWidth * 2) {
                 spaces = " ".repeat(Math.min(30, Math.max(2, Math.ceil(gap / charWidth))));
              }
              return acc + spaces + curr.str;
            }, ''),
          fontSize: currentLine[0].height
        })
      }
      currentLine = [item]
    }
    lastY = y
  })
  if (currentLine.length > 0) {
    lines.push({
      y: lastY,
      text: currentLine
        .sort((a, b) => a.transform[4] - b.transform[4])
        .reduce((acc, curr, idx, arr) => {
          if (idx === 0) return curr.str;
          const prev = arr[idx - 1];
          const gap = curr.transform[4] - (prev.transform[4] + (prev.width || 0));
          const charWidth = curr.height * 0.4;
          let spaces = " ";
          if (gap > charWidth * 2) {
             spaces = " ".repeat(Math.min(30, Math.max(2, Math.ceil(gap / charWidth))));
          }
          return acc + spaces + curr.str;
        }, ''),
      fontSize: currentLine[0].height
    })
  }
  
  // Sort lines by Y descending (PDF coordinates usually start from bottom left)
  return lines.sort((a, b) => b.y - a.y)
}

function groupIntoParagraphs(lines: any[]) {
  const paragraphs: any[] = []
  let currentPara: any[] = []

  lines.forEach((line, i) => {
    currentPara.push(line)
    const nextLine = lines[i + 1]
    // New paragraph if gap > 1.5x line height
    if (!nextLine || Math.abs(line.y - nextLine.y) > line.fontSize * 1.5) {
      paragraphs.push({
        text: currentPara.map(l => l.text).join(' '),
        fontSize: currentPara[0].fontSize,
        isHeading: currentPara[0].fontSize > 14
      })
      currentPara = []
    }
  })
  return paragraphs
}

export default function PDFToWordClient() {
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progressMsg, setProgressMsg] = useState("")
  const [progressPercent, setProgressPercent] = useState(0)
  
  // Options
  const [preserveParagraphs, setPreserveParagraphs] = useState(true)
  const [includePageBreaks, setIncludePageBreaks] = useState(true)
  const [extractImages, setExtractImages] = useState(false)
  const [fontFamily, setFontFamily] = useState("Arial")
  const [fontSize, setFontSize] = useState("auto")
  
  // Results
  const [resultPages, setResultPages] = useState<any[] | null>(null)
  const [wordCount, setWordCount] = useState(0)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFiles = (newFiles: FileList | null) => {
    if (!newFiles || newFiles.length === 0) return
    const f = newFiles[0]
    
    if (f.type !== 'application/pdf') {
      alert("Please upload a PDF file")
      return
    }
    if (f.size > 50 * 1024 * 1024) {
      alert("File size exceeds 50MB limit.")
      return
    }
    
    setFile(f)
    setResultPages(null)
    setWordCount(0)
  }

  const handleConvert = async () => {
    if (!file) return
    setIsProcessing(true)
    setProgressMsg("Initializing PDF parser...")
    setProgressPercent(10)
    
    try {
      const pdfjsLib = await getPdfjs()
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      
      const pages = []
      let totalWords = 0
      
      for (let i = 1; i <= pdf.numPages; i++) {
        setProgressMsg(`Extracting text from page ${i} of ${pdf.numPages}...`)
        setProgressPercent(10 + Math.round((i / pdf.numPages) * 40)) // Progress up to 50%
        
        const page = await pdf.getPage(i)
        const textContent = await page.getTextContent()
        
        let paragraphs = []
        if (preserveParagraphs) {
          const lines = groupIntoLines(textContent.items)
          paragraphs = groupIntoParagraphs(lines)
        } else {
          // If not preserving paragraphs, just dump all text items sequentially
          const fullText = textContent.items.map((i: any) => i.str).join(' ')
          if (fullText.trim()) {
            paragraphs.push({ text: fullText, fontSize: 12, isHeading: false })
          }
        }
        
        // Count words
        paragraphs.forEach(p => {
          totalWords += p.text.split(/\s+/).filter((word: string) => word.length > 0).length
        })
        
        pages.push({ pageNum: i, paragraphs })
      }
      
      setResultPages(pages)
      setWordCount(totalWords)
      setProgressPercent(100)
      setProgressMsg("Extraction complete!")
      
      // Auto-trigger word doc creation
      await createWordDoc(pages, file.name.replace('.pdf', ''), {
        preserveParagraphs,
        includePageBreaks,
        extractImages,
        font: fontFamily === 'auto' ? undefined : fontFamily,
        fontSize: fontSize === 'auto' ? undefined : Number(fontSize)
      })
      
    } catch (err) {
      console.error(err)
      alert("An error occurred during conversion.")
    } finally {
      setIsProcessing(false)
    }
  }

  const createWordDoc = async (pages: any[], filename: string, options: any) => {
    setProgressMsg("Generating Word document...")
    const children: any[] = []

    pages.forEach((page, pageIndex) => {
      page.paragraphs.forEach((para: any) => {
        if (!para.text.trim()) return

        let size = options.fontSize ? options.fontSize * 2 : Math.max(16, Math.round(para.fontSize * 1.5))
        
        children.push(new Paragraph({
          heading: para.isHeading ? HeadingLevel.HEADING_1 : undefined,
          children: [
            new TextRun({
              text: para.text,
              size: size,
              font: options.font || 'Arial',
            })
          ],
          spacing: { after: 200 }
        }))
      })

      // Page break between PDF pages
      if (options.includePageBreaks && pageIndex < pages.length - 1) {
        children.push(new Paragraph({
          children: [new PageBreak()]
        }))
      }
    })

    const doc = new Document({
      sections: [{
        properties: {},
        children
      }]
    })

    const blob = await Packer.toBlob(doc)
    saveAs(blob, filename + '.docx')
  }

  return (
    <div className="bg-card rounded-3xl shadow-2xl overflow-hidden border border-border flex flex-col z-20 relative font-inter">
      
      {/* Honest Note Banner */}
      <div className="bg-brand-orange/10 border-b border-brand-orange/20 px-6 py-4 flex items-start gap-3">
        <AlertCircle className="size-5 text-brand-orange shrink-0 mt-0.5" />
        <p className="text-sm text-muted-foreground">
          <strong>ℹ Honest Note:</strong> Our converter extracts text and basic formatting locally for maximum privacy. Complex layouts, tables, and special fonts may not be perfectly preserved like they would in server-side AI solutions.
        </p>
      </div>

      <div className="p-8 md:p-12 space-y-8">
        
        {!file && (
          <div 
            className={`border-3 border-dashed rounded-2xl p-16 flex flex-col items-center justify-center transition-all duration-200 ease-in-out cursor-pointer min-h-[300px]
              ${isDragging ? 'border-brand-orange bg-brand-orange/5 scale-[1.02]' : 'border-border hover:border-brand-orange/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'}
            `}
            onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={e => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files) }}
            onClick={() => fileInputRef.current?.click()}
          >
            <input type="file" ref={fileInputRef} className="hidden" accept="application/pdf" onChange={e => handleFiles(e.target.files)} />
            <div className="w-20 h-20 bg-brand-orange/10 rounded-full flex items-center justify-center mb-6">
              <UploadCloud className="size-10 text-brand-orange" />
            </div>
            <h3 className="text-2xl font-bold font-syne mb-2 text-foreground">Upload your PDF</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">Drag and drop your file here, or click to browse. Maximum file size: 50MB.</p>
            <Button className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-full px-8 h-12 text-base font-semibold shadow-lg">
              Browse Files
            </Button>
          </div>
        )}

        {file && !resultPages && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* File Info */}
            <div className="bg-muted rounded-xl p-6 flex items-center justify-between border border-zinc-200 dark:border-zinc-700">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <FileText className="size-8 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-lg text-foreground truncate max-w-[200px] md:max-w-md">{file.name}</h4>
                  <p className="text-sm text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <Button variant="outline" onClick={() => setFile(null)}>Change File</Button>
            </div>

            {/* Options */}
            <div className="bg-card border border-border rounded-xl p-6 md:p-8 space-y-6">
              <h3 className="text-xl font-bold font-syne">Conversion Options</h3>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Switch id="preserve" checked={preserveParagraphs} onCheckedChange={(c: boolean) => setPreserveParagraphs(c)} />
                    <label htmlFor="preserve" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Preserve paragraph breaks
                    </label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Switch id="pageBreaks" checked={includePageBreaks} onCheckedChange={(c: boolean) => setIncludePageBreaks(c)} />
                    <label htmlFor="pageBreaks" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Include page breaks between PDF pages
                    </label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Switch id="extractImages" checked={extractImages} onCheckedChange={(c: boolean) => setExtractImages(c)} disabled />
                    <label htmlFor="extractImages" className="text-sm font-medium leading-none opacity-50">
                      Extract images (Coming Soon)
                    </label>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium block">Font Family</label>
                    <select 
                      value={fontFamily} 
                      onChange={e => setFontFamily(e.target.value)}
                      className="w-full flex h-10 items-center justify-between rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-brand-orange disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:placeholder:text-zinc-400"
                    >
                      <option value="auto">Auto-detect (Keep original)</option>
                      <option value="Arial">Arial</option>
                      <option value="Times New Roman">Times New Roman</option>
                      <option value="Courier New">Courier New</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium block">Font Size</label>
                    <select 
                      value={fontSize} 
                      onChange={e => setFontSize(e.target.value)}
                      className="w-full flex h-10 items-center justify-between rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-brand-orange disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:placeholder:text-zinc-400"
                    >
                      <option value="auto">Auto-detect</option>
                      <option value="10">10 pt</option>
                      <option value="11">11 pt</option>
                      <option value="12">12 pt</option>
                      <option value="14">14 pt</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Convert Button */}
            <div className="flex justify-center pt-4">
              <Button 
                onClick={handleConvert} 
                disabled={isProcessing}
                className="bg-brand-orange hover:bg-brand-orange/90 text-white rounded-full px-12 h-14 text-lg font-bold shadow-xl shadow-brand-orange/20 w-full md:w-auto min-w-[250px]"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Converting...
                  </>
                ) : (
                  "Convert to Word"
                )}
              </Button>
            </div>

            {/* Progress */}
            {isProcessing && (
              <div className="space-y-3 mt-8">
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-muted-foreground">{progressMsg}</span>
                  <span className="text-brand-orange">{progressPercent}%</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-brand-orange rounded-full transition-all duration-300 ease-out" 
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Results View */}
        {resultPages && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-green-700 dark:text-green-400 font-medium">
                <CheckCircle2 className="size-6" />
                <span>Conversion Successful! Extracted {wordCount.toLocaleString()} words.</span>
              </div>
              <Button 
                onClick={() => createWordDoc(resultPages, file!.name.replace('.pdf', ''), { preserveParagraphs, includePageBreaks, extractImages, font: fontFamily === 'auto' ? undefined : fontFamily, fontSize: fontSize === 'auto' ? undefined : Number(fontSize) })}
                className="bg-brand-orange hover:bg-brand-orange/90 text-white font-bold whitespace-nowrap"
              >
                <Download className="mr-2 size-4" /> Download DOCX
              </Button>
            </div>

            <div className="space-y-4">
              <h3 className="font-syne font-bold text-xl">Extracted Text Preview</h3>
              <div className="bg-muted border border-border rounded-xl p-6 h-[400px] overflow-y-auto font-serif space-y-6 shadow-inner text-sm md:text-base leading-relaxed">
                {resultPages.map((page, i) => (
                  <div key={i} className="space-y-4">
                    <div className="text-xs text-brand-orange font-bold font-inter tracking-widest uppercase mb-2">Page {page.pageNum}</div>
                    {page.paragraphs.map((p: any, j: number) => (
                      <p key={j} className={`${p.isHeading ? 'font-bold text-lg' : 'text-muted-foreground'}`}>
                        {p.text}
                      </p>
                    ))}
                    {i < resultPages.length - 1 && includePageBreaks && (
                      <hr className="my-8 border-t-2 border-dashed border-border" />
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-center">
               <Button variant="outline" onClick={() => { setFile(null); setResultPages(null); setWordCount(0) }}>
                 Convert Another File
               </Button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
