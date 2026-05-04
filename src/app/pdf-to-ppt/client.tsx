"use client"

import React, { useState, useRef } from 'react'
import pptxgen from 'pptxgenjs'
import { UploadCloud, Presentation, CheckCircle2, Download, Loader2 } from 'lucide-react'
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

export default function PDFToPPTClient() {
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progressMsg, setProgressMsg] = useState("")
  const [progressPercent, setProgressPercent] = useState(0)
  
  // Options
  const [slideSize, setSlideSize] = useState('16:9')
  const [quality, setQuality] = useState('web')
  const [background, setBackground] = useState('white')
  const [slideNumbers, setSlideNumbers] = useState(false)
  const [useFilename, setUseFilename] = useState(true)
  
  // Results
  const [completed, setCompleted] = useState(false)
  const [slideCount, setSlideCount] = useState(0)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFiles = (newFiles: FileList | null) => {
    if (!newFiles || newFiles.length === 0) return
    const f = newFiles[0]
    
    if (f.type !== 'application/pdf') {
      alert("Please upload a PDF file")
      return
    }
    if (f.size > 100 * 1024 * 1024) {
      alert("File size exceeds 100MB limit.")
      return
    }
    
    setFile(f)
    setCompleted(false)
  }

  const handleConvert = async () => {
    if (!file) return
    setIsProcessing(true)
    setProgressMsg("Initializing PowerPoint engine...")
    setProgressPercent(5)
    
    try {
      const prs = new pptxgen()

      if (slideSize === '16:9') prs.layout = 'LAYOUT_WIDE'
      else if (slideSize === '4:3') prs.layout = 'LAYOUT_4x3'
      // default is 16:9, pptxgenjs handles custom by default as roughly 10x7.5 unless specified, we stick to built-ins

      const pdfjsLib = await getPdfjs()
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      
      const scale = quality === 'print' ? 4.17 : quality === 'web' ? 2.08 : 1.0
      setSlideCount(pdf.numPages)
      
      for (let i = 1; i <= pdf.numPages; i++) {
        setProgressMsg(`Converting page ${i} of ${pdf.numPages} to slide...`)
        setProgressPercent(5 + Math.round((i / pdf.numPages) * 90))
        
        const page = await pdf.getPage(i)
        const viewport = page.getViewport({ scale })
        
        // Render page to canvas
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(viewport.width)
        canvas.height = Math.round(viewport.height)
        const ctx = canvas.getContext('2d')!
        
        if (background === 'white') {
           ctx.fillStyle = 'white'
           ctx.fillRect(0, 0, canvas.width, canvas.height)
        } else if (background === 'black') {
           ctx.fillStyle = 'black'
           ctx.fillRect(0, 0, canvas.width, canvas.height)
        }
        
        await page.render({ canvasContext: ctx, viewport }).promise
        
        // Quality factor 0.92 is usually optimal for JPEG
        const imgData = canvas.toDataURL(background === 'transparent' ? 'image/png' : 'image/jpeg', 0.92)
        
        // Add slide
        const slide = prs.addSlide()
        
        // Add background color directly to slide if needed, but the image covers it anyway
        if (background !== 'transparent') {
           slide.background = { color: background === 'black' ? '000000' : 'FFFFFF' }
        }

        // Add page image covering entire slide
        slide.addImage({
          data: imgData,
          x: 0, y: 0,
          w: '100%', h: '100%'
        })

        // Add slide number
        if (slideNumbers) {
          slide.addText(`${i}`, {
            x: '90%', y: '93%',
            w: '8%', h: '5%',
            fontSize: 10,
            color: '666666',
            align: 'right'
          })
        }
      }
      
      setProgressMsg("Saving presentation...")
      setProgressPercent(98)
      
      let outName = file.name.replace('.pdf', '')
      if (useFilename) outName = outName + " Presentation"
      
      await prs.writeFile({ fileName: outName + '.pptx' })
      
      setCompleted(true)
      setProgressPercent(100)
      setProgressMsg("Conversion complete!")
      
    } catch (err) {
      console.error(err)
      alert("An error occurred during conversion.")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="bg-card rounded-3xl shadow-2xl overflow-hidden border border-border flex flex-col z-20 relative font-inter">
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
            <h3 className="text-2xl font-bold font-syne mb-2 text-foreground">Upload PDF</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">Drag and drop your file here, or click to browse. Max size: 100MB.</p>
            <Button className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-full px-8 h-12 text-base font-semibold shadow-lg">
              Browse Files
            </Button>
          </div>
        )}

        {file && !completed && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* File Info */}
            <div className="bg-muted rounded-xl p-6 flex items-center justify-between border border-border">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <Presentation className="size-8 text-brand-orange" />
                </div>
                <div>
                  <h4 className="font-semibold text-lg text-foreground truncate max-w-[200px] md:max-w-md">{file.name}</h4>
                  <p className="text-sm text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <Button variant="outline" onClick={() => setFile(null)} disabled={isProcessing}>Change File</Button>
            </div>

            {/* Options */}
            <div className="bg-card border border-border rounded-xl p-6 md:p-8 space-y-6">
              <h3 className="text-xl font-bold font-syne">Slide Options</h3>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium block">Slide Size / Aspect Ratio</label>
                    <select 
                      value={slideSize} 
                      onChange={e => setSlideSize(e.target.value)}
                      className="w-full flex h-10 items-center justify-between rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-brand-orange disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:placeholder:text-zinc-400"
                    >
                      <option value="16:9">16:9 Widescreen (Modern default)</option>
                      <option value="4:3">4:3 Standard (Older displays)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium block">Image Quality</label>
                    <select 
                      value={quality} 
                      onChange={e => setQuality(e.target.value)}
                      className="w-full flex h-10 items-center justify-between rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-brand-orange disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:placeholder:text-zinc-400"
                    >
                      <option value="web">Web (150 DPI) - Good balance</option>
                      <option value="screen">Screen (72 DPI) - Smallest file</option>
                      <option value="print">Print (300 DPI) - Highest quality</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium block">Slide Background</label>
                    <select 
                      value={background} 
                      onChange={e => setBackground(e.target.value)}
                      className="w-full flex h-10 items-center justify-between rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-brand-orange disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:placeholder:text-zinc-400"
                    >
                      <option value="white">White</option>
                      <option value="black">Black</option>
                      <option value="transparent">Transparent (PNG format)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-6 pt-2">
                  <div className="flex items-center space-x-3">
                    <Switch id="slideNumbers" checked={slideNumbers} onCheckedChange={(c: boolean) => setSlideNumbers(c)} />
                    <label htmlFor="slideNumbers" className="text-sm font-medium leading-none">
                      Add slide numbers (bottom right)
                    </label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Switch id="useFilename" checked={useFilename} onCheckedChange={(c: boolean) => setUseFilename(c)} />
                    <label htmlFor="useFilename" className="text-sm font-medium leading-none">
                      Append "Presentation" to exported filename
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Extract Button */}
            <div className="flex justify-center pt-4">
              <Button 
                onClick={handleConvert} 
                disabled={isProcessing}
                className="bg-brand-orange hover:bg-brand-orange/90 text-white rounded-full px-12 h-14 text-lg font-bold shadow-xl shadow-brand-orange/20 w-full md:w-auto min-w-[250px]"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Converting to PPTX...
                  </>
                ) : (
                  "Create PowerPoint"
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
                  <div className="h-full bg-brand-orange rounded-full transition-all duration-300 ease-out" style={{ width: `${progressPercent}%` }} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Results View */}
        {completed && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-8 flex flex-col items-center justify-center gap-6 text-center">
              <div className="size-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400">
                 <CheckCircle2 className="size-8" />
              </div>
              <div>
                <h3 className="text-2xl font-bold font-syne text-zinc-900 dark:text-zinc-50 mb-2">Conversion Successful!</h3>
                <p className="text-zinc-600 dark:text-zinc-400">Created a PowerPoint presentation with {slideCount} slides.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 mt-2">
                 <Button 
                   onClick={handleConvert} // Re-run to download again if they want
                   className="bg-[#D24726] hover:bg-[#D24726]/90 text-white font-bold h-12 px-8 rounded-full shadow-lg" // PowerPoint Orange/Red
                 >
                   <Download className="mr-2 size-5" /> Download PPTX
                 </Button>
                 <Button variant="outline" className="h-12 px-8 rounded-full font-semibold" onClick={() => { setFile(null); setCompleted(false) }}>
                   Convert Another File
                 </Button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
