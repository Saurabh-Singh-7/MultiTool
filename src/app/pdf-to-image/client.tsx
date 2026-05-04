"use client"

import React, { useState, useRef, useEffect, useCallback } from "react"
import Link from "next/link"
import { ChevronRight, Upload, Trash2, CheckCircle2, AlertTriangle, FileText, Lock, Download, RefreshCw, X, ArrowRight, Image as ImageIcon, Settings, SlidersHorizontal, DownloadCloud, MousePointerSquareDashed, ArrowLeft, ArrowRight as ArrowRightIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import JSZip from 'jszip'

// Dynamically load legacy pdfjs-dist
async function getPdfjs() {
  const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf')
  if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
  }
  return pdfjsLib
}

const formatBytes = (bytes: number) => {
  if (bytes === 0) return "0 B"
  const k = 1024, sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

type OutputFormat = 'JPG' | 'PNG' | 'WebP'
type AppState = 'upload' | 'processing_thumbs' | 'settings' | 'converting' | 'results'

interface PageThumbnail {
  pageNum: number
  thumbnailUrl: string
  width: number
  height: number
  pageRef: any
}

interface ConversionResult {
  blob: Blob
  filename: string
  pageNum: number
  width: number
  height: number
  size: number
  url: string
}

export default function PDFToImageClient() {
  const [appState, setAppState] = useState<AppState>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [fileBuffer, setFileBuffer] = useState<ArrayBuffer | null>(null)
  const [pdfDoc, setPdfDoc] = useState<any>(null)
  
  // Thumbnails & Selection
  const [thumbnails, setThumbnails] = useState<PageThumbnail[]>([])
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set())
  const [pageRangeInput, setPageRangeInput] = useState("")
  
  // Settings
  const [format, setFormat] = useState<OutputFormat>('JPG')
  const [quality, setQuality] = useState(90)
  const [dpi, setDpi] = useState(150)
  const [bgColor, setBgColor] = useState<'white' | 'transparent'>('white')
  
  // Processing
  const [progressMsg, setProgressMsg] = useState("")
  const [progressPct, setProgressPct] = useState(0)
  
  // Results
  const [results, setResults] = useState<ConversionResult[]>([])
  
  // UI
  const [isDragging, setIsDragging] = useState(false)
  const [toastMsg, setToastMsg] = useState("")
  const [previewPage, setPreviewPage] = useState<number | null>(null)
  const [isPasswordProtected, setIsPasswordProtected] = useState(false)
  const [password, setPassword] = useState("")
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  useEffect(() => {
    if (toastMsg) {
      const t = setTimeout(() => setToastMsg(""), 4000)
      return () => clearTimeout(t)
    }
  }, [toastMsg])
  const showToast = (msg: string) => setToastMsg(msg)

  // --- UPLOAD & THUMBNAILS ---
  const handleFiles = async (newFiles: FileList | null) => {
    if (!newFiles || newFiles.length === 0) return
    const f = newFiles[0]
    
    if (f.type !== 'application/pdf') {
      showToast("⚠ Please upload a PDF file")
      return
    }
    if (f.size > 200 * 1024 * 1024) {
      showToast("⚠ File too large. Max 200MB supported.")
      return
    }
    
    setFile(f)
    setAppState('processing_thumbs')
    setProgressMsg("Reading PDF file...")
    setProgressPct(0)
    
    try {
      const buffer = await f.arrayBuffer()
      setFileBuffer(buffer)
      await loadPdf(buffer)
    } catch (e: any) {
      console.error(e)
      if (e.name === 'PasswordException') {
         setIsPasswordProtected(true)
         setAppState('upload')
      } else {
         showToast("⚠ Could not read this PDF. The file may be corrupted.")
         setAppState('upload')
      }
    }
  }

  const loadPdf = async (buffer: ArrayBuffer, pwd?: string) => {
    const pdfjsLib = await getPdfjs()
    const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer.slice(0)), password: pwd })
    
    const pdf = await loadingTask.promise
    setPdfDoc(pdf)
    setIsPasswordProtected(false)
    
    const numPages = pdf.numPages
    const newThumbnails: PageThumbnail[] = []
    
    for (let i = 1; i <= numPages; i++) {
      setProgressPct(Math.round((i / numPages) * 100))
      setProgressMsg(`Loading pages... ${i} / ${numPages}`)
      
      const page = await pdf.getPage(i)
      const viewport = page.getViewport({ scale: 0.4 })
      const canvas = document.createElement('canvas')
      canvas.width = viewport.width
      canvas.height = viewport.height
      const ctx = canvas.getContext('2d')
      
      if (ctx) {
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        await page.render({ canvasContext: ctx, viewport }).promise
        
        newThumbnails.push({
          pageNum: i,
          thumbnailUrl: canvas.toDataURL('image/jpeg', 0.7),
          width: viewport.width,
          height: viewport.height,
          pageRef: page
        })
      }
      // Yield
      if (i % 5 === 0) await new Promise(r => setTimeout(r, 10))
    }
    
    setThumbnails(newThumbnails)
    setSelectedPages(new Set(newThumbnails.map(t => t.pageNum)))
    setAppState('settings')
  }

  const handlePasswordSubmit = async () => {
    if (!password || !fileBuffer) return
    setAppState('processing_thumbs')
    setProgressMsg("Unlocking PDF...")
    try {
      await loadPdf(fileBuffer, password)
      showToast("✓ PDF unlocked!")
    } catch (e) {
      setIsPasswordProtected(true)
      setAppState('upload')
      showToast("⚠ Incorrect password. Try again.")
    }
  }

  // --- SELECTION LOGIC ---
  const togglePage = (pageNum: number) => {
    const newSet = new Set(selectedPages)
    if (newSet.has(pageNum)) {
      newSet.delete(pageNum)
    } else {
      newSet.add(pageNum)
    }
    setSelectedPages(newSet)
    updatePageRangeInput(newSet)
  }

  const selectAll = () => {
    const newSet = new Set(thumbnails.map(t => t.pageNum))
    setSelectedPages(newSet)
    updatePageRangeInput(newSet)
  }
  
  const deselectAll = () => {
    setSelectedPages(new Set())
    setPageRangeInput("")
  }

  const updatePageRangeInput = (set: Set<number>) => {
    const arr = Array.from(set).sort((a,b) => a-b)
    if (arr.length === 0) {
      setPageRangeInput("")
      return
    }
    if (arr.length === thumbnails.length) {
       setPageRangeInput(`1-${thumbnails.length}`)
       return
    }
    
    // Group into ranges
    let ranges = []
    let start = arr[0]
    let prev = start
    for (let i = 1; i < arr.length; i++) {
      if (arr[i] === prev + 1) {
        prev = arr[i]
      } else {
        ranges.push(start === prev ? `${start}` : `${start}-${prev}`)
        start = arr[i]
        prev = start
      }
    }
    ranges.push(start === prev ? `${start}` : `${start}-${prev}`)
    setPageRangeInput(ranges.join(', '))
  }

  const handlePageRangeInput = (val: string) => {
    setPageRangeInput(val)
    const newSet = new Set<number>()
    const parts = val.split(',')
    
    for (let p of parts) {
      p = p.trim()
      if (!p) continue
      if (p.includes('-')) {
        const [startStr, endStr] = p.split('-')
        const start = parseInt(startStr)
        const end = parseInt(endStr)
        if (!isNaN(start) && !isNaN(end) && start > 0 && end <= thumbnails.length && start <= end) {
          for (let i = start; i <= end; i++) newSet.add(i)
        }
      } else {
        const num = parseInt(p)
        if (!isNaN(num) && num > 0 && num <= thumbnails.length) {
          newSet.add(num)
        }
      }
    }
    setSelectedPages(newSet)
  }

  // Handle Ctrl+A and Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (appState === 'settings') {
        if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
          e.preventDefault()
          selectAll()
        }
        if (e.key === 'Escape') {
          if (previewPage !== null) {
            setPreviewPage(null)
          } else {
            deselectAll()
          }
        }
      }
      if (appState === 'results') {
         if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault()
            downloadAllAsZip()
         }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [appState, thumbnails, previewPage])

  // --- CONVERSION ENGINE ---
  const convertPages = async (pageNumsToConvert: number[]) => {
    if (pageNumsToConvert.length === 0) {
      showToast("⚠ Select at least one page to convert")
      return
    }
    
    setAppState('converting')
    const total = pageNumsToConvert.length
    const scale = dpi / 72
    const mimeType = format === 'JPG' ? 'image/jpeg' : format === 'PNG' ? 'image/png' : 'image/webp'
    
    const newResults: ConversionResult[] = []
    
    for (let i = 0; i < total; i++) {
      const pageNum = pageNumsToConvert[i]
      setProgressPct(Math.round((i / total) * 100))
      setProgressMsg(`Converting page ${pageNum} to ${format}...`)
      
      const thumb = thumbnails.find(t => t.pageNum === pageNum)
      if (!thumb) continue
      
      const page = thumb.pageRef
      const viewport = page.getViewport({ scale })
      
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(viewport.width)
      canvas.height = Math.round(viewport.height)
      const ctx = canvas.getContext('2d')!
      
      // Background logic
      if (format === 'JPG' || bgColor === 'white') {
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }
      
      await page.render({
        canvasContext: ctx,
        viewport,
        background: bgColor === 'transparent' && format !== 'JPG' ? 'transparent' : 'white'
      }).promise
      
      // To Blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob(
          b => resolve(b!),
          mimeType,
          format === 'PNG' ? undefined : quality / 100
        )
      })
      
      const ext = format.toLowerCase()
      newResults.push({
        blob,
        filename: `page_${pageNum}.${ext}`,
        pageNum,
        width: canvas.width,
        height: canvas.height,
        size: blob.size,
        url: URL.createObjectURL(blob)
      })
    }
    
    setProgressPct(100)
    setResults(newResults)
    setAppState('results')
    showToast(`✓ Converted ${total} pages to ${format}`)
  }

  // --- DOWNLOADS ---
  const downloadResult = (res: ConversionResult) => {
    const baseName = file?.name.replace(/\.pdf$/i, '') || 'document'
    const a = document.createElement('a')
    a.href = res.url
    a.download = `${baseName}_${res.filename}`
    a.click()
  }

  const downloadAllAsZip = async () => {
    if (results.length === 1) {
      downloadResult(results[0])
      return
    }
    
    showToast("Preparing ZIP file...")
    try {
      const zip = new JSZip()
      const baseName = file?.name.replace(/\.pdf$/i, '') || 'document'
      
      results.forEach(r => {
        zip.file(`${baseName}_${r.filename}`, r.blob)
      })
      
      const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'STORE' })
      const url = URL.createObjectURL(zipBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${baseName}_images.zip`
      a.click()
      URL.revokeObjectURL(url)
      showToast("✓ Download started!")
    } catch (e) {
      console.error(e)
      showToast("⚠ Failed to create ZIP")
    }
  }

  const quickConvert = async (pageNum: number) => {
    // Save state
    const oldResults = [...results]
    const oldAppState = appState
    
    setAppState('converting')
    setProgressPct(0)
    setProgressMsg(`Converting page ${pageNum} to ${format}...`)
    
    const scale = dpi / 72
    const mimeType = format === 'JPG' ? 'image/jpeg' : format === 'PNG' ? 'image/png' : 'image/webp'
    
    const thumb = thumbnails.find(t => t.pageNum === pageNum)
    if (!thumb) return
    const page = thumb.pageRef
    const viewport = page.getViewport({ scale })
    
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(viewport.width)
    canvas.height = Math.round(viewport.height)
    const ctx = canvas.getContext('2d')!
    
    if (format === 'JPG' || bgColor === 'white') {
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }
    
    await page.render({
      canvasContext: ctx,
      viewport,
      background: bgColor === 'transparent' && format !== 'JPG' ? 'transparent' : 'white'
    }).promise
    
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob(
        b => resolve(b!),
        mimeType,
        format === 'PNG' ? undefined : quality / 100
      )
    })
    
    const ext = format.toLowerCase()
    const res: ConversionResult = {
      blob,
      filename: `page_${pageNum}.${ext}`,
      pageNum,
      width: canvas.width,
      height: canvas.height,
      size: blob.size,
      url: URL.createObjectURL(blob)
    }
    
    downloadResult(res)
    setAppState(oldAppState)
    setResults(oldResults)
  }

  // Reset
  const resetAll = () => {
    setAppState('upload')
    setFile(null)
    setFileBuffer(null)
    setPdfDoc(null)
    setThumbnails([])
    setSelectedPages(new Set())
    setResults([])
    setIsPasswordProtected(false)
    setPassword("")
  }

  const getQualityColor = (q: number) => {
    if (q <= 40) return "text-amber-500 bg-amber-500/10 border-amber-500/20"
    if (q <= 70) return "text-blue-500 bg-blue-500/10 border-blue-500/20"
    if (q <= 90) return "text-green-500 bg-green-500/10 border-green-500/20"
    return "text-brand-orange bg-brand-orange/10 border-brand-orange/20"
  }

  return (
    <>
      {toastMsg && (
        <div className="fixed bottom-4 right-4 z-50 animate-in fade-in slide-in-from-bottom-4 flex items-center gap-2 bg-card border border-border shadow-lg rounded-lg px-4 py-3">
          {toastMsg.startsWith('✓') ? <CheckCircle2 className="size-5 text-green-500" /> : <AlertTriangle className="size-5 text-amber-500" />}
          <span className="text-sm font-medium">{toastMsg.replace(/^[✓⚠ℹ]\s*/, '')}</span>
        </div>
      )}

      {previewPage !== null && (
        <div className="fixed inset-0 z-50 bg-background/90 backdrop-blur-sm flex items-center justify-center animate-in fade-in p-4" onClick={() => setPreviewPage(null)}>
           <div className="relative max-w-5xl w-full max-h-[90vh] flex flex-col bg-card border border-border rounded-2xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between p-4 border-b border-border bg-muted/50">
                 <div className="font-bold">Page {previewPage} of {thumbnails.length}</div>
                 <div className="flex items-center gap-2">
                    <Button variant="default" size="sm" onClick={() => quickConvert(previewPage)} className="bg-brand-orange hover:bg-brand-orange/90 text-white">
                      <Download className="size-4 mr-2" /> Convert this page
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setPreviewPage(null)}><X className="size-5" /></Button>
                 </div>
              </div>
              <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-muted/20 relative group">
                 <button 
                   className="absolute left-4 top-1/2 -translate-y-1/2 size-10 rounded-full bg-background/80 shadow border border-border flex items-center justify-center hover:bg-brand-orange hover:text-white transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50 disabled:hover:bg-background disabled:hover:text-foreground"
                   onClick={(e) => { e.stopPropagation(); if (previewPage > 1) setPreviewPage(previewPage - 1) }}
                   disabled={previewPage <= 1}
                 >
                   <ArrowLeft className="size-5" />
                 </button>
                 <img src={thumbnails.find(t => t.pageNum === previewPage)?.thumbnailUrl} alt={`Page ${previewPage}`} className="max-w-full max-h-[70vh] object-contain shadow-md border border-border" />
                 <button 
                   className="absolute right-4 top-1/2 -translate-y-1/2 size-10 rounded-full bg-background/80 shadow border border-border flex items-center justify-center hover:bg-brand-orange hover:text-white transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50 disabled:hover:bg-background disabled:hover:text-foreground"
                   onClick={(e) => { e.stopPropagation(); if (previewPage < thumbnails.length) setPreviewPage(previewPage + 1) }}
                   disabled={previewPage >= thumbnails.length}
                 >
                   <ArrowRightIcon className="size-5" />
                 </button>
              </div>
           </div>
        </div>
      )}

      <div className="mb-8 text-center">
        <nav className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight className="size-3.5" />
          <Link href="/#pdf-tools" className="hover:text-foreground transition-colors">PDF Tools</Link>
          <ChevronRight className="size-3.5" />
          <span className="text-foreground font-medium">PDF to Image</span>
        </nav>
        <h1 className="font-heading text-3xl font-bold sm:text-4xl sm:leading-[1.1] mb-3">
          PDF to Image — <span className="text-gradient">Convert PDF Pages to JPG PNG Free</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Convert any PDF page to a high quality image instantly. Extract all pages or select specific ones — download as JPG, PNG or WebP. Free, private, no signup needed.
        </p>
      </div>

      {/* STATE 1: UPLOAD */}
      {appState === 'upload' && (
        <div className="animate-in fade-in zoom-in-95 max-w-3xl mx-auto">
          {isPasswordProtected ? (
            <div className="bg-card border border-border rounded-2xl p-10 text-center shadow-sm max-w-md mx-auto">
               <div className="size-16 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                 <Lock className="size-8" />
               </div>
               <h3 className="text-xl font-bold mb-2">🔒 This PDF is password protected</h3>
               <p className="text-muted-foreground mb-6">Enter the password to unlock and convert.</p>
               <div className="flex gap-2">
                 <Input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => { if(e.key === 'Enter') handlePasswordSubmit() }} className="h-12" />
                 <Button className="h-12 bg-brand-orange hover:bg-brand-orange/90 text-white" onClick={handlePasswordSubmit}>Unlock</Button>
               </div>
               <Button variant="ghost" className="mt-4 text-muted-foreground" onClick={resetAll}>Cancel</Button>
            </div>
          ) : (
            <div 
              className={`rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer overflow-hidden bg-card ${isDragging ? "border-brand-orange bg-brand-orange/5 scale-[1.01]" : "border-border hover:border-brand-orange/50 hover:bg-muted/50"}`}
              style={{ minHeight: '350px' }}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files) }}
              onClick={() => fileInputRef.current?.click()}
            >
              <input ref={fileInputRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => handleFiles(e.target.files)} />
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <div className="mb-6 flex size-24 items-center justify-center rounded-full bg-brand-orange/10 text-brand-orange">
                  <ImageIcon className="size-12" />
                </div>
                <h3 className="font-heading text-2xl font-bold mb-2">Drop your PDF here to convert to images</h3>
                <p className="text-muted-foreground mb-6">Click to browse or drag and drop</p>
                <div className="flex gap-4 text-xs font-medium text-muted-foreground">
                  <span className="bg-muted px-3 py-1.5 rounded-full border border-border">PDF files only</span>
                  <span className="bg-muted px-3 py-1.5 rounded-full border border-border">Max 200MB</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* STATE 2: LOADING THUMBNAILS OR CONVERTING */}
      {(appState === 'processing_thumbs' || appState === 'converting') && (
        <div className="animate-in fade-in zoom-in-95 max-w-xl mx-auto">
          <div className="bg-card border border-border rounded-2xl p-8 text-center shadow-sm">
            <div className="size-16 bg-brand-orange/10 text-brand-orange rounded-full flex items-center justify-center mx-auto mb-6">
              {appState === 'processing_thumbs' ? <FileText className="size-8 animate-pulse" /> : <ImageIcon className="size-8 animate-pulse" />}
            </div>
            <h3 className="text-xl font-bold mb-2">{appState === 'processing_thumbs' ? 'Reading PDF...' : '🖼️ Converting pages...'}</h3>
            <p className="text-muted-foreground mb-6">{progressMsg}</p>
            
            <div className="h-3 bg-muted rounded-full overflow-hidden mb-2">
              <div className="h-full bg-brand-orange transition-all duration-300" style={{ width: `${progressPct}%` }}></div>
            </div>
            <div className="text-sm font-bold text-brand-orange text-right">{progressPct}%</div>
            
            {appState === 'converting' && (
              <div className="mt-4 text-sm text-muted-foreground">
                Resolution: {dpi} DPI • Format: {format}
              </div>
            )}
          </div>
        </div>
      )}

      {/* STATE 3: SETTINGS & THUMBNAILS GRID */}
      {appState === 'settings' && (
        <div className="animate-in fade-in">
          
          <div className="flex flex-col md:flex-row items-center justify-between mb-6 bg-card border border-border p-4 rounded-xl shadow-sm gap-4">
             <div className="flex items-center gap-4">
                <div className="size-10 bg-brand-orange/10 text-brand-orange rounded-lg flex items-center justify-center">
                   <FileText className="size-5" />
                </div>
                <div>
                   <div className="font-bold truncate max-w-[200px] sm:max-w-xs">{file?.name}</div>
                   <div className="text-xs text-muted-foreground">{formatBytes(file?.size || 0)} • {thumbnails.length} pages</div>
                </div>
             </div>
             <Button variant="ghost" size="sm" onClick={resetAll} className="text-muted-foreground hover:text-red-500">
                <Trash2 className="size-4 mr-2" /> Cancel
             </Button>
          </div>

          <div className="grid lg:grid-cols-[1fr_350px] gap-8 items-start">
             
             {/* LEFT: THUMBNAILS */}
             <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-muted/30 p-3 rounded-lg border border-border">
                   <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={selectAll} className="h-8">☑ Select All</Button>
                      <Button variant="outline" size="sm" onClick={deselectAll} className="h-8">☐ Deselect All</Button>
                      <span className="text-sm font-medium ml-2 text-muted-foreground">
                        {selectedPages.size} of {thumbnails.length} selected
                      </span>
                   </div>
                   <div className="flex items-center gap-2 max-w-xs w-full sm:w-auto">
                      <span className="text-xs font-bold text-muted-foreground whitespace-nowrap">Pages:</span>
                      <Input 
                        value={pageRangeInput} 
                        onChange={e => handlePageRangeInput(e.target.value)} 
                        placeholder="e.g. 1-5, 8, 11-13" 
                        className="h-8 text-xs bg-background"
                      />
                   </div>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                   {thumbnails.map(t => {
                      const isSelected = selectedPages.has(t.pageNum)
                      return (
                        <div 
                          key={t.pageNum} 
                          className={`group relative bg-card border-2 rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-md ${isSelected ? 'border-brand-orange shadow-sm scale-[0.98]' : 'border-border hover:border-brand-orange/50'}`}
                          onClick={() => togglePage(t.pageNum)}
                        >
                           <div className="aspect-[1/1.4] bg-muted/20 relative flex items-center justify-center p-2">
                             <img src={t.thumbnailUrl} alt={`Page ${t.pageNum}`} className="max-w-full max-h-full object-contain shadow-sm border border-border/50 group-hover:scale-105 transition-transform" />
                             
                             <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Button 
                                  size="sm" 
                                  variant="secondary" 
                                  className="scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all shadow-lg"
                                  onClick={(e) => { e.stopPropagation(); setPreviewPage(t.pageNum) }}
                                >
                                  Preview
                                </Button>
                             </div>
                             
                             <div className="absolute top-2 left-2 size-5 rounded-full border-2 flex items-center justify-center bg-white shadow-sm transition-colors z-10" style={{ borderColor: isSelected ? '#F97316' : '#E5E7EB' }}>
                                {isSelected && <div className="size-2.5 bg-brand-orange rounded-full" />}
                             </div>
                             
                             <button 
                               className="absolute top-2 right-2 p-1.5 bg-white text-muted-foreground hover:text-brand-orange rounded-md shadow-sm border border-border opacity-0 group-hover:opacity-100 transition-opacity z-10"
                               onClick={(e) => { e.stopPropagation(); quickConvert(t.pageNum) }}
                               title="Quick Extract this page"
                             >
                               <DownloadCloud className="size-4" />
                             </button>
                           </div>
                           <div className="p-2 border-t border-border bg-card text-center relative z-10">
                              <div className="font-bold text-sm">Page {t.pageNum}</div>
                              <div className="text-xs text-muted-foreground">{Math.round(t.width)} × {Math.round(t.height)} px</div>
                           </div>
                        </div>
                      )
                   })}
                </div>
             </div>

             {/* RIGHT: SETTINGS */}
             <div className="space-y-6 sticky top-6">
                <div className="bg-card p-6 rounded-2xl border border-border shadow-sm space-y-6">
                   <div className="flex items-center gap-2 font-bold mb-2 pb-4 border-b border-border">
                     <SlidersHorizontal className="size-5 text-brand-orange" /> Output Settings
                   </div>
                   
                   <div className="space-y-3">
                      <label className="text-sm font-bold uppercase text-muted-foreground">Output Format</label>
                      <div className="grid grid-cols-3 gap-2">
                         <button onClick={() => setFormat('JPG')} className={`py-2 rounded-lg text-sm font-bold border transition-colors ${format === 'JPG' ? 'bg-brand-orange text-white border-brand-orange shadow' : 'border-border hover:bg-muted'}`}>JPG</button>
                         <button onClick={() => setFormat('PNG')} className={`py-2 rounded-lg text-sm font-bold border transition-colors ${format === 'PNG' ? 'bg-blue-500 text-white border-blue-500 shadow' : 'border-border hover:bg-muted'}`}>PNG</button>
                         <button onClick={() => setFormat('WebP')} className={`py-2 rounded-lg text-sm font-bold border transition-colors ${format === 'WebP' ? 'bg-green-500 text-white border-green-500 shadow' : 'border-border hover:bg-muted'}`}>WebP</button>
                      </div>
                      {format === 'PNG' && <p className="text-xs text-blue-500 font-medium">PNG is lossless — larger files but perfect quality.</p>}
                      {format === 'WebP' && <p className="text-xs text-green-500 font-medium">WebP: best quality-to-size ratio for web use.</p>}
                   </div>

                   {(format === 'JPG' || format === 'WebP') && (
                     <div className="space-y-4 pt-2">
                        <div className="flex justify-between items-center text-sm font-bold">
                           <span>Image Quality</span>
                           <span className={`px-2 py-1 rounded border ${getQualityColor(quality)} text-xs`}>{quality}%</span>
                        </div>
                        <Slider value={[quality]} onValueChange={(v: any) => setQuality(v[0])} min={10} max={100} step={1} />
                     </div>
                   )}

                   <div className="space-y-3 pt-2">
                      <label className="text-sm font-bold uppercase text-muted-foreground">Output Resolution (DPI)</label>
                      <div className="grid grid-cols-2 gap-2">
                         <button onClick={() => setDpi(72)} className={`py-2 px-2 text-left rounded-lg text-sm font-bold border transition-colors ${dpi === 72 ? 'border-brand-orange bg-brand-orange/5' : 'border-border hover:bg-muted'}`}>
                           72 dpi <span className="text-xs font-normal opacity-70 block">Screen - small files</span>
                         </button>
                         <button onClick={() => setDpi(150)} className={`py-2 px-2 text-left rounded-lg text-sm font-bold border transition-colors relative ${dpi === 150 ? 'border-brand-orange bg-brand-orange/5' : 'border-border hover:bg-muted'}`}>
                           <div className="absolute -top-2 right-2 bg-brand-orange text-white text-[9px] px-1.5 py-0.5 rounded-full">RECOMMENDED</div>
                           150 dpi <span className="text-xs font-normal opacity-70 block">Web - balanced</span>
                         </button>
                         <button onClick={() => setDpi(300)} className={`py-2 px-2 text-left rounded-lg text-sm font-bold border transition-colors ${dpi === 300 ? 'border-brand-orange bg-brand-orange/5' : 'border-border hover:bg-muted'}`}>
                           300 dpi <span className="text-xs font-normal opacity-70 block">Print - high quality</span>
                         </button>
                         <button onClick={() => setDpi(600)} className={`py-2 px-2 text-left rounded-lg text-sm font-bold border transition-colors ${dpi === 600 ? 'border-red-500 bg-red-500/5 text-red-600' : 'border-border hover:bg-muted'}`}>
                           600 dpi <span className="text-xs font-normal opacity-70 block">Pro - very large files</span>
                         </button>
                      </div>
                      <p className="text-xs text-muted-foreground border border-border p-2 rounded bg-muted/50">
                         {thumbnails.length > 0 ? (
                           <>Sample page size at {dpi} DPI: <br/><strong className="text-foreground">{Math.round(thumbnails[0].width * (dpi/72))} × {Math.round(thumbnails[0].height * (dpi/72))} px</strong></>
                         ) : 'Select pages to see size estimate'}
                      </p>
                      {dpi === 600 && <p className="text-xs text-red-500 font-bold">⚠ 600 DPI produces very large files. Recommended for professional printing only.</p>}
                   </div>

                   {format !== 'JPG' && (
                     <div className="space-y-3 pt-2">
                        <label className="text-sm font-bold uppercase text-muted-foreground">Background Color</label>
                        <div className="flex gap-2">
                           <button onClick={() => setBgColor('white')} className={`flex-1 py-2 rounded-lg text-sm font-bold border transition-colors flex items-center justify-center gap-2 ${bgColor === 'white' ? 'border-brand-orange bg-brand-orange/5' : 'border-border hover:bg-muted'}`}>
                             <div className="size-4 border border-border bg-white rounded-sm" /> White
                           </button>
                           <button onClick={() => setBgColor('transparent')} className={`flex-1 py-2 rounded-lg text-sm font-bold border transition-colors flex items-center justify-center gap-2 ${bgColor === 'transparent' ? 'border-brand-orange bg-brand-orange/5' : 'border-border hover:bg-muted'}`}>
                             <div className="size-4 border border-border bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjY2NjIiAvPgo8cmVjdCB4PSI0IiB5PSI0IiB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjY2NjIiAvPgo8L3N2Zz4=')] rounded-sm" /> Transparent
                           </button>
                        </div>
                     </div>
                   )}
                   
                </div>
                
                <Button 
                   className="w-full h-14 text-lg font-bold bg-brand-orange hover:bg-brand-orange/90 text-white shadow-lg"
                   disabled={selectedPages.size === 0}
                   onClick={() => convertPages(Array.from(selectedPages).sort((a,b)=>a-b))}
                >
                   <ImageIcon className="size-5 mr-2" />
                   Convert {selectedPages.size} {selectedPages.size === 1 ? 'Page' : 'Pages'} to {format}
                </Button>
                {selectedPages.size === 0 && <p className="text-sm text-center text-red-500 font-bold">⚠ Select at least one page</p>}
                
             </div>
          </div>
        </div>
      )}

      {/* STATE 4: RESULTS */}
      {appState === 'results' && (
        <div className="animate-in fade-in space-y-8">
           
           <div className="bg-green-500/10 border border-green-500/20 text-green-600 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                 <div className="size-12 bg-green-500 text-white rounded-full flex items-center justify-center shrink-0">
                    <CheckCircle2 className="size-6" />
                 </div>
                 <div>
                    <h2 className="text-2xl font-bold text-green-700">Conversion Complete!</h2>
                    <p className="text-green-600/80 font-medium">
                      {results.length} {results.length === 1 ? 'page' : 'pages'} converted to {format} • Total size: {formatBytes(results.reduce((a,r) => a + r.size, 0))} • {dpi} DPI
                    </p>
                 </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                 <Button variant="outline" className="border-green-500/30 text-green-700 hover:bg-green-500/10" onClick={() => setAppState('settings')}>
                   <ArrowLeft className="size-4 mr-2" /> Back
                 </Button>
                 <Button className="bg-green-500 hover:bg-green-600 text-white shadow-lg" onClick={downloadAllAsZip}>
                   <DownloadCloud className="size-4 mr-2" /> Download All as ZIP
                 </Button>
              </div>
           </div>

           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {results.map(r => (
                 <div key={r.pageNum} className="bg-card border border-border rounded-xl overflow-hidden shadow-sm group">
                    <div className="aspect-[1/1.4] bg-muted/20 relative flex items-center justify-center p-2">
                       <img src={r.url} alt={`Converted Page ${r.pageNum}`} className="max-w-full max-h-full object-contain shadow-sm border border-border/50" />
                       <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button size="sm" className="bg-white text-black hover:bg-gray-100" onClick={() => downloadResult(r)}>
                            <Download className="size-4 mr-2" /> Save
                          </Button>
                       </div>
                    </div>
                    <div className="p-3 border-t border-border text-center">
                       <div className="font-bold text-sm">Page {r.pageNum}</div>
                       <div className="text-xs text-muted-foreground mb-2">{r.width} × {r.height} px • {formatBytes(r.size)}</div>
                       <Button variant="secondary" size="sm" className="w-full text-xs h-7" onClick={() => downloadResult(r)}>Download</Button>
                    </div>
                 </div>
              ))}
           </div>
           
           <div className="flex justify-center pt-8 border-t border-border">
              <Button variant="outline" size="lg" onClick={resetAll} className="rounded-full">
                 <RefreshCw className="size-4 mr-2" /> Convert Another PDF
              </Button>
           </div>
        </div>
      )}

    </>
  )
}
