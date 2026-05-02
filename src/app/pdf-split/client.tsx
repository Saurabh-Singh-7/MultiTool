"use client"

import React, { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { ChevronRight, Upload, Trash2, CheckCircle2, AlertTriangle, FileText, Lock, Scissors, Copy, Layers, ListChecks, Download, RefreshCw, X, Archive } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"

import { PDFDocument } from 'pdf-lib'
import * as pdfjsLib from 'pdfjs-dist'
import JSZip from 'jszip'

// Configure pdfjs worker
if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
}

type SplitMode = 'extract' | 'range' | 'every-n' | 'all'

interface PageThumb {
  pageNum: number
  dataUrl: string
  width: number
  height: number
  selected: boolean
}

interface SplitResult {
  blob: Blob
  filename: string
  pageCount: number
}

interface PageGroup {
  label: string
  pages: number[] // 1-indexed
}

const formatBytes = (bytes: number) => {
  if (bytes === 0) return "0 B"
  const k = 1024, sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export default function PDFSplitClient() {
  const [file, setFile] = useState<File | null>(null)
  const [fileBuffer, setFileBuffer] = useState<ArrayBuffer | null>(null)
  
  // PDF Data
  const [pageCount, setPageCount] = useState(0)
  const [isEncrypted, setIsEncrypted] = useState(false)
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [password, setPassword] = useState("")
  const [isCorrupted, setIsCorrupted] = useState(false)
  
  // Thumbnails
  const [thumbnails, setThumbnails] = useState<PageThumb[]>([])
  const [isGeneratingThumbs, setIsGeneratingThumbs] = useState(false)
  const [thumbsGenerated, setThumbsGenerated] = useState(0)
  
  // UI State
  const [isDragging, setIsDragging] = useState(false)
  const [toastMsg, setToastMsg] = useState("")
  const [mode, setMode] = useState<SplitMode>('extract')
  
  // Mode States
  const [rangeInput, setRangeInput] = useState("")
  const [everyN, setEveryN] = useState(5)
  const [outputPrefix, setOutputPrefix] = useState("document")
  
  // Process State
  const [isSplitting, setIsSplitting] = useState(false)
  const [splitProgress, setSplitProgress] = useState(0)
  const [currentFileStr, setCurrentFileStr] = useState("")
  
  // Result
  const [results, setResults] = useState<SplitResult[]>([])
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (toastMsg) {
      const t = setTimeout(() => setToastMsg(""), 3000)
      return () => clearTimeout(t)
    }
  }, [toastMsg])

  const showToast = (msg: string) => setToastMsg(msg)

  // -- UPLOAD --
  const handleFiles = async (newFiles: FileList | null) => {
    if (!newFiles || newFiles.length === 0) return
    const f = newFiles[0]
    if (f.type !== 'application/pdf') {
      showToast("⚠ Only PDF files are supported")
      return
    }
    if (f.size > 200 * 1024 * 1024) {
      showToast("⚠ File too large. Max 200MB.")
      return
    }
    
    setFile(f)
    setOutputPrefix(f.name.replace(/\.pdf$/i, ''))
    setThumbnails([])
    setResults([])
    setThumbsGenerated(0)
    setRangeInput("")
    
    try {
      const buffer = await f.arrayBuffer()
      setFileBuffer(buffer)
      
      const pdf = await PDFDocument.load(buffer, { ignoreEncryption: true })
      setPageCount(pdf.getPageCount())
      setIsEncrypted(pdf.isEncrypted)
      setIsUnlocked(!pdf.isEncrypted)
      setIsCorrupted(false)
      
      if (!pdf.isEncrypted) {
        generateThumbnails(buffer, pdf.getPageCount())
      }
    } catch (err: any) {
      if (err.message?.includes('encrypted')) {
         setIsEncrypted(true)
         setIsUnlocked(false)
      } else {
         setIsCorrupted(true)
      }
    }
  }

  const unlockPdf = async (pwd: string) => {
    if (!fileBuffer) return
    try {
      const pdf = await PDFDocument.load(fileBuffer, { password: pwd } as any)
      setIsUnlocked(true)
      setPassword(pwd)
      setPageCount(pdf.getPageCount())
      showToast("✓ PDF unlocked!")
      generateThumbnails(fileBuffer, pdf.getPageCount(), pwd)
    } catch {
      showToast("⚠ Incorrect password. Try again.")
    }
  }

  // -- THUMBNAILS --
  const generateThumbnails = async (buffer: ArrayBuffer, totalPages: number, pwd?: string) => {
    setIsGeneratingThumbs(true)
    try {
      const loadingTask = pdfjsLib.getDocument({ data: buffer, password: pwd })
      const pdf = await loadingTask.promise
      
      const newThumbs: PageThumb[] = []
      
      // We will render in chunks to avoid UI freeze
      const chunkSize = 5
      for (let i = 1; i <= totalPages; i += chunkSize) {
         const chunk = []
         for (let j = i; j < i + chunkSize && j <= totalPages; j++) {
           const page = await pdf.getPage(j)
           const viewport = page.getViewport({ scale: 0.3 })
           
           const canvas = document.createElement('canvas')
           canvas.width = viewport.width
           canvas.height = viewport.height
           const ctx = canvas.getContext('2d')!
           
           await page.render({ canvasContext: ctx, viewport } as any).promise
           
           chunk.push({
             pageNum: j,
             dataUrl: canvas.toDataURL('image/jpeg', 0.8),
             width: viewport.width,
             height: viewport.height,
             selected: false
           })
         }
         newThumbs.push(...chunk)
         setThumbnails([...newThumbs])
         setThumbsGenerated(newThumbs.length)
         // Small delay to yield to UI
         await new Promise(r => setTimeout(r, 10))
      }
    } catch (e) {
      console.error(e)
      // It's ok if thumbnails fail, we can still split
    } finally {
      setIsGeneratingThumbs(false)
    }
  }

  // -- SELECTION INTERACTION --
  const toggleThumbSelection = (pageNum: number) => {
    setThumbnails(prev => prev.map(t => t.pageNum === pageNum ? { ...t, selected: !t.selected } : t))
  }
  const selectAll = () => setThumbnails(prev => prev.map(t => ({ ...t, selected: true })))
  const deselectAll = () => setThumbnails(prev => prev.map(t => ({ ...t, selected: false })))

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!file || results.length > 0) return
      if (mode === 'extract') {
        if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
          e.preventDefault()
          selectAll()
        }
        if (e.key === 'Escape') {
          e.preventDefault()
          deselectAll()
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [file, results.length, mode])

  // -- PARSERS & PREVIEWS --
  const getSelectedPagesCount = () => thumbnails.filter(t => t.selected).length

  const parseRanges = (rangeStr: string, maxPages: number): PageGroup[] => {
    if (!rangeStr.trim()) return []
    return rangeStr.split(',').map(range => {
      const cleanRange = range.trim()
      if (cleanRange.includes('-')) {
        const parts = cleanRange.split('-').map(Number)
        if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1]) && parts[0] <= parts[1]) {
           const pages = Array.from({ length: parts[1] - parts[0] + 1 }, (_, i) => parts[0] + i).filter(p => p >= 1 && p <= maxPages)
           return { label: `pages_${parts[0]}-${parts[1]}`, pages }
        }
      } else {
        const n = parseInt(cleanRange)
        if (!isNaN(n) && n >= 1 && n <= maxPages) {
          return { label: `page_${n}`, pages: [n] }
        }
      }
      return { label: 'invalid', pages: [] }
    }).filter(g => g.pages.length > 0)
  }

  const rangeGroups = mode === 'range' ? parseRanges(rangeInput, pageCount) : []
  
  const getEveryNGroups = (): PageGroup[] => {
    const groups: PageGroup[] = []
    let currentPart = 1
    for (let i = 1; i <= pageCount; i += everyN) {
      const end = Math.min(i + everyN - 1, pageCount)
      const pages = Array.from({ length: end - i + 1 }, (_, idx) => i + idx)
      groups.push({ label: `part_${currentPart}`, pages })
      currentPart++
    }
    return groups
  }
  const everyNGroups = mode === 'every-n' ? getEveryNGroups() : []

  const getAllGroups = (): PageGroup[] => {
    return Array.from({ length: pageCount }, (_, i) => ({ label: `page_${i + 1}`, pages: [i + 1] }))
  }

  // Determine what we are splitting
  let finalGroupsToSplit: PageGroup[] = []
  let btnLabel = "Split PDF"
  let btnDisabled = false
  
  if (pageCount === 1) {
    btnDisabled = true
    btnLabel = "⚠ PDF has only 1 page"
  } else if (mode === 'extract') {
    const sel = getSelectedPagesCount()
    btnLabel = sel > 0 ? `Extract ${sel} Pages` : "Select pages to extract"
    btnDisabled = sel === 0
    if (sel > 0) {
      finalGroupsToSplit = [{ label: 'extracted_pages', pages: thumbnails.filter(t => t.selected).map(t => t.pageNum) }]
    }
  } else if (mode === 'range') {
    btnLabel = rangeGroups.length > 0 ? `Split → ${rangeGroups.length} Files` : "Enter valid page ranges"
    btnDisabled = rangeGroups.length === 0
    finalGroupsToSplit = rangeGroups
  } else if (mode === 'every-n') {
    btnLabel = `Split → ${everyNGroups.length} Files`
    finalGroupsToSplit = everyNGroups
  } else if (mode === 'all') {
    btnLabel = `Split into ${pageCount} Files`
    finalGroupsToSplit = getAllGroups()
  }

  // -- SPLIT EXECUTION --
  const executeSplit = async () => {
    if (btnDisabled || !fileBuffer || finalGroupsToSplit.length === 0) return
    
    setIsSplitting(true)
    setSplitProgress(5)
    setCurrentFileStr("Loading original document...")
    
    try {
      const sourcePdf = await PDFDocument.load(fileBuffer, { password, ignoreEncryption: !password } as any)
      const newResults: SplitResult[] = []
      
      for (let g = 0; g < finalGroupsToSplit.length; g++) {
        const group = finalGroupsToSplit[g]
        setCurrentFileStr(`Creating file ${g+1} of ${finalGroupsToSplit.length}...`)
        setSplitProgress(10 + Math.round((g / finalGroupsToSplit.length) * 80))
        
        const newPdf = await PDFDocument.create()
        const indices = group.pages.map(p => p - 1)
        
        const copiedPages = await newPdf.copyPages(sourcePdf, indices)
        for (const page of copiedPages) {
          newPdf.addPage(page)
        }
        
        const bytes = await newPdf.save()
        newResults.push({
          blob: new Blob([bytes as unknown as BlobPart], { type: 'application/pdf' }),
          filename: `${outputPrefix}_${group.label}`,
          pageCount: group.pages.length
        })
      }
      
      setSplitProgress(95)
      setCurrentFileStr("Finalizing...")
      
      setResults(newResults)
      showToast("✓ Split completed successfully!")
      
    } catch (err) {
      console.error(err)
      showToast("⚠ Error during split process.")
    } finally {
      setIsSplitting(false)
      setSplitProgress(0)
    }
  }

  // -- DOWNLOADS --
  const downloadSingle = (result: SplitResult) => {
    const url = URL.createObjectURL(result.blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${result.filename}.pdf`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const downloadAllZip = async () => {
    if (results.length === 0) return
    showToast("Preparing ZIP file...")
    try {
      const zip = new JSZip()
      results.forEach(res => {
        zip.file(`${res.filename}.pdf`, res.blob)
      })
      const zipBlob = await zip.generateAsync({ type: 'blob' })
      const url = URL.createObjectURL(zipBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${outputPrefix}_split.zip`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      showToast("✓ Download started!")
    } catch (e) {
      console.error(e)
      showToast("⚠ Failed to create ZIP")
    }
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's' && results.length > 0) {
        e.preventDefault()
        if (results.length === 1) downloadSingle(results[0])
        else downloadAllZip()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [results, outputPrefix])

  return (
    <>
      {toastMsg && (
        <div className="fixed bottom-4 right-4 z-50 animate-in fade-in slide-in-from-bottom-4 flex items-center gap-2 bg-card border border-border shadow-lg rounded-lg px-4 py-3">
          {toastMsg.startsWith('✓') ? <CheckCircle2 className="size-5 text-green-500" /> : <AlertTriangle className="size-5 text-amber-500" />}
          <span className="text-sm font-medium">{toastMsg.replace(/^[✓⚠]\s*/, '')}</span>
        </div>
      )}

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight className="size-3.5" />
          <Link href="/#pdf-tools" className="hover:text-foreground transition-colors">PDF Tools</Link>
          <ChevronRight className="size-3.5" />
          <span className="text-foreground font-medium">Split PDF</span>
        </nav>

        <div className="mb-8 text-center max-w-2xl mx-auto">
          <h1 className="font-heading text-3xl font-bold sm:text-4xl sm:leading-[1.1] mb-3">
            Split PDF Files — <span className="text-gradient">Extract Pages</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Split your PDF into multiple documents, extract specific pages, or separate by page ranges.
          </p>
        </div>

        {/* State 1: Upload */}
        {!file && (
          <div className="animate-in fade-in zoom-in-95 max-w-3xl mx-auto">
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
                  <Scissors className="size-12" />
                </div>
                <h3 className="font-heading text-2xl font-bold mb-2">Drop your PDF here to split</h3>
                <p className="text-muted-foreground mb-6">Click to browse or drag and drop</p>
                <div className="flex gap-4 text-xs font-medium text-muted-foreground">
                  <span className="bg-muted px-3 py-1.5 rounded-full border border-border">PDF only</span>
                  <span className="bg-muted px-3 py-1.5 rounded-full border border-border">Max 200MB</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* State 2: Active Workspace */}
        {file && results.length === 0 && (
          <div className="animate-in fade-in space-y-8">
            
            {/* Header info */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card p-4 rounded-xl border border-border shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-500">
                  <FileText className="size-6" />
                </div>
                <div>
                  <h3 className="font-bold truncate max-w-[200px] sm:max-w-md">{file.name}</h3>
                  <div className="text-sm text-muted-foreground">
                    {pageCount > 0 ? `${pageCount} pages` : 'Loading...'} • {formatBytes(file.size)}
                  </div>
                </div>
              </div>
              <Button variant="outline" onClick={() => setFile(null)} className="shrink-0 text-muted-foreground hover:text-red-500">
                <Trash2 className="size-4 mr-2" /> Start Over
              </Button>
            </div>

            {/* Error States */}
            {isCorrupted && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl flex items-center gap-3">
                 <AlertTriangle className="size-5 shrink-0" />
                 <div className="font-medium">⚠ This PDF appears corrupted or invalid. Please try another file.</div>
              </div>
            )}
            
            {isEncrypted && !isUnlocked && (
               <div className="bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 p-6 rounded-xl space-y-4">
                 <div className="flex items-center gap-3">
                   <Lock className="size-6 shrink-0" />
                   <div className="font-bold text-lg">🔒 This PDF is password protected</div>
                 </div>
                 <div className="flex gap-3 max-w-sm">
                   <Input type="password" placeholder="Enter password to unlock" value={password} onChange={e => setPassword(e.target.value)} />
                   <Button onClick={() => unlockPdf(password)} className="bg-amber-500 hover:bg-amber-600 text-white">Unlock</Button>
                 </div>
               </div>
            )}

            {isUnlocked && !isCorrupted && (
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">
                
                {/* LEFT: Thumbnails */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-heading font-bold text-lg">Pages Preview</h3>
                    {isGeneratingThumbs && (
                      <span className="text-xs text-muted-foreground animate-pulse">Generating previews... {thumbsGenerated} / {pageCount}</span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[60vh] overflow-y-auto p-2 border border-border bg-muted/10 rounded-xl">
                    {thumbnails.map(thumb => (
                      <div 
                        key={thumb.pageNum}
                        onClick={() => { if (mode === 'extract') toggleThumbSelection(thumb.pageNum) }}
                        className={`relative rounded-lg overflow-hidden border-2 transition-all cursor-pointer group ${thumb.selected && mode === 'extract' ? 'border-brand-orange shadow-[0_0_15px_rgba(249,115,22,0.3)] scale-[0.98]' : 'border-transparent hover:border-border hover:shadow-md'}`}
                      >
                        <div className="aspect-[1/1.4] bg-white relative">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={thumb.dataUrl} alt={`Page ${thumb.pageNum}`} className="absolute inset-0 w-full h-full object-contain p-1" />
                        </div>
                        <div className={`p-2 text-center text-xs font-medium border-t ${thumb.selected && mode === 'extract' ? 'bg-brand-orange text-white border-brand-orange' : 'bg-card text-muted-foreground border-border'}`}>
                          Page {thumb.pageNum}
                        </div>
                        {mode === 'extract' && (
                          <div className={`absolute top-2 left-2 size-5 rounded-full border-2 flex items-center justify-center transition-colors ${thumb.selected ? 'bg-brand-orange border-brand-orange text-white' : 'border-muted-foreground/30 text-transparent bg-white/50'}`}>
                            ✓
                          </div>
                        )}
                      </div>
                    ))}
                    {thumbnails.length === 0 && !isGeneratingThumbs && (
                       <div className="col-span-full py-12 text-center text-muted-foreground text-sm">No preview available.</div>
                    )}
                  </div>
                </div>

                {/* RIGHT: Controls */}
                <div className="space-y-6 sticky top-6">
                  
                  {/* Tabs */}
                  <div className="flex flex-col gap-2 p-1 bg-muted rounded-xl">
                    <button onClick={() => setMode('extract')} className={`flex items-center gap-3 p-3 rounded-lg text-sm font-bold transition-all ${mode === 'extract' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:bg-background/50'}`}>
                      <Copy className="size-4" /> Extract Pages
                    </button>
                    <button onClick={() => setMode('range')} className={`flex items-center gap-3 p-3 rounded-lg text-sm font-bold transition-all ${mode === 'range' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:bg-background/50'}`}>
                      <Layers className="size-4" /> Split by Range
                    </button>
                    <button onClick={() => setMode('every-n')} className={`flex items-center gap-3 p-3 rounded-lg text-sm font-bold transition-all ${mode === 'every-n' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:bg-background/50'}`}>
                      <ListChecks className="size-4" /> Split Every N Pages
                    </button>
                    <button onClick={() => setMode('all')} className={`flex items-center gap-3 p-3 rounded-lg text-sm font-bold transition-all ${mode === 'all' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:bg-background/50'}`}>
                      <Archive className="size-4" /> Extract All Pages
                    </button>
                  </div>

                  {/* Mode Content */}
                  <div className="p-5 rounded-xl border border-border bg-card shadow-sm space-y-4">
                    
                    {mode === 'extract' && (
                      <div className="space-y-4 animate-in fade-in">
                        <p className="text-sm text-muted-foreground">Click on thumbnails to select pages to extract into a single new PDF.</p>
                        <div className="flex gap-3">
                          <Button variant="outline" size="sm" onClick={selectAll} className="flex-1">Select All</Button>
                          <Button variant="outline" size="sm" onClick={deselectAll} className="flex-1">Deselect</Button>
                        </div>
                        <div className="bg-brand-orange/10 text-brand-orange font-bold text-sm p-3 rounded-lg text-center border border-brand-orange/20">
                          {getSelectedPagesCount()} pages selected
                        </div>
                      </div>
                    )}

                    {mode === 'range' && (
                      <div className="space-y-4 animate-in fade-in">
                        <p className="text-sm text-muted-foreground">Enter page ranges. Each range creates one PDF.</p>
                        <Input 
                          placeholder="e.g. 1-5, 6-10, 15, 20-24" 
                          value={rangeInput} 
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRangeInput(e.target.value)} 
                        />
                        {rangeGroups.length > 0 ? (
                          <div className="bg-muted p-3 rounded-lg border border-border text-sm max-h-[150px] overflow-y-auto space-y-2">
                            {rangeGroups.map((g, i) => (
                              <div key={i} className="flex justify-between text-xs">
                                <span className="font-medium">PDF {i+1}: Pages {g.label.replace('pages_','').replace('page_','')}</span>
                                <span className="text-muted-foreground">{g.pages.length} pages</span>
                              </div>
                            ))}
                            <div className="pt-2 mt-2 border-t border-border font-bold text-center text-xs">
                              {rangeGroups.length} PDF files will be created
                            </div>
                          </div>
                        ) : rangeInput ? (
                           <div className="text-xs text-red-500 font-medium">Invalid range entered.</div>
                        ) : null}
                      </div>
                    )}

                    {mode === 'every-n' && (
                      <div className="space-y-4 animate-in fade-in">
                        <p className="text-sm text-muted-foreground">Divide document into chunks of N pages.</p>
                        <div className="flex items-center justify-between font-bold text-sm">
                          <span>Split every</span>
                          <span className="bg-muted px-2 py-1 rounded font-mono text-brand-orange">{everyN} pages</span>
                        </div>
                        <Slider value={[everyN]} onValueChange={v => setEveryN(Array.isArray(v) ? v[0] : v as number)} min={1} max={Math.min(50, pageCount-1 || 1)} step={1} />
                        <div className="flex gap-2">
                          {[1, 2, 5, 10].map(n => (
                            <Button key={n} variant="outline" size="sm" className="flex-1 text-xs" onClick={() => setEveryN(n)}>{n}</Button>
                          ))}
                        </div>
                        <div className="bg-muted p-3 rounded-lg border border-border text-xs text-center font-medium">
                          Will create {everyNGroups.length} PDF files.
                        </div>
                      </div>
                    )}

                    {mode === 'all' && (
                      <div className="space-y-4 animate-in fade-in text-center">
                        <div className="mx-auto size-12 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center mb-2">
                          <Layers className="size-6" />
                        </div>
                        <p className="text-sm font-bold">Split into {pageCount} individual files</p>
                        <p className="text-xs text-muted-foreground">Every single page will become its own 1-page PDF document.</p>
                        {pageCount > 50 && (
                          <div className="bg-amber-500/10 border border-amber-500/20 text-amber-600 p-3 rounded-lg text-xs font-medium text-left">
                            ⚠ This will create a large number of files. They will be downloaded securely as a ZIP archive.
                          </div>
                        )}
                      </div>
                    )}

                    <div className="h-px bg-border my-4" />
                    
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted-foreground uppercase">Output Prefix</label>
                      <div className="flex items-center gap-2">
                        <Input value={outputPrefix} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOutputPrefix(e.target.value)} className="h-8 text-sm" />
                      </div>
                    </div>

                    <Button 
                      onClick={executeSplit} 
                      disabled={btnDisabled || isSplitting}
                      className="w-full h-14 text-lg font-bold bg-brand-orange hover:bg-brand-orange-hover text-white shadow-xl shadow-brand-orange/20 relative overflow-hidden mt-4"
                    >
                      {isSplitting ? (
                        <div className="flex flex-col items-center justify-center relative z-10 w-full">
                          <div className="flex items-center"><RefreshCw className="size-5 mr-2 animate-spin" /> Splitting... {splitProgress}%</div>
                          <div className="text-[10px] uppercase tracking-widest font-medium opacity-80 mt-1">{currentFileStr}</div>
                        </div>
                      ) : (
                        <span className="relative z-10 flex items-center">
                          <Scissors className="size-5 mr-2" /> 
                          {btnLabel}
                        </span>
                      )}
                      {isSplitting && (
                         <div className="absolute left-0 top-0 bottom-0 bg-black/20 transition-all duration-300" style={{ width: `${splitProgress}%` }}></div>
                      )}
                    </Button>
                  </div>

                </div>
              </div>
            )}
          </div>
        )}

        {/* State 3: Results */}
        {results.length > 0 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 max-w-4xl mx-auto space-y-6">
             <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="p-6 sm:p-8 bg-green-500/10 border-b border-green-500/20 text-center">
                  <div className="mx-auto size-16 bg-green-500 rounded-full flex items-center justify-center text-white mb-4 shadow-lg shadow-green-500/20">
                    <CheckCircle2 className="size-8" />
                  </div>
                  <h2 className="text-2xl font-bold text-green-700 dark:text-green-400 mb-2">Split Complete!</h2>
                  <p className="text-green-600/80 dark:text-green-500/80 font-medium">Successfully created {results.length} PDF {results.length === 1 ? 'file' : 'files'}.</p>
                </div>
                
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
                    <h3 className="font-bold text-lg">Output Files</h3>
                    {results.length > 1 && (
                      <Button onClick={downloadAllZip} className="bg-brand-orange hover:bg-brand-orange-hover text-white font-bold w-full sm:w-auto">
                        <Archive className="size-4 mr-2" /> Download All as ZIP
                      </Button>
                    )}
                  </div>
                  
                  <div className="max-h-[400px] overflow-y-auto space-y-2 pr-2">
                    {results.map((res, i) => (
                      <div key={i} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-xl border border-border bg-muted/30 hover:bg-muted/50 transition-colors gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="size-10 rounded bg-red-500/10 text-red-500 flex items-center justify-center shrink-0">
                            <FileText className="size-5" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-sm truncate">{res.filename}.pdf</div>
                            <div className="text-xs text-muted-foreground">{res.pageCount} pages • {formatBytes(res.blob.size)}</div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => downloadSingle(res)} className="w-full sm:w-auto shrink-0">
                           <Download className="size-4 mr-2" /> Download
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
             </div>

             <div className="text-center">
               <Button variant="outline" onClick={() => { setResults([]); setFile(null) }} className="h-12 border-border hover:bg-muted bg-card">
                 <RefreshCw className="size-4 mr-2" /> Split Another PDF
               </Button>
             </div>
          </div>
        )}
        
      </div>
    </>
  )
}
