"use client"

import React, { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { ChevronRight, Upload, Trash2, CheckCircle2, AlertTriangle, FileText, Lock, Settings2, Download, RefreshCw, X, ArrowRight, Gauge, SlidersHorizontal, PackageOpen, Zap, Settings, Target } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"

import { PDFDocument } from 'pdf-lib'
import JSZip from 'jszip'

// Dynamically load legacy pdfjs-dist
async function getPdfjs() {
  const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf')
  if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
  }
  return pdfjsLib
}

// Helpers
const formatBytes = (bytes: number) => {
  if (bytes === 0) return "0 B"
  const k = 1024, sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

const generateId = () => Math.random().toString(36).substring(2, 9)

type AppState = 'upload' | 'settings' | 'processing' | 'results'

interface FileEntry {
  id: string
  file: File
  originalSize: number
  pages: number
  hasImages: boolean
  estimatedSavings: string
  isPasswordProtected: boolean
  password?: string
  
  // processing
  status: 'pending' | 'compressing' | 'success' | 'failed' | 'skipped'
  progress: number
  currentPage: number
  statusText: string
  
  // result
  resultBlob?: Blob
  compressedSize?: number
  savedBytes?: number
  savingPercent?: number
}

type CompLevel = 'low' | 'medium' | 'high' | 'max'

export default function PDFCompressClient() {
  const [appState, setAppState] = useState<AppState>('upload')
  const [files, setFiles] = useState<FileEntry[]>([])
  
  // Settings
  const [mode, setMode] = useState<'preset' | 'target'>('preset')
  const [showCustom, setShowCustom] = useState(false)
  
  // Standard Settings
  const [level, setLevel] = useState<CompLevel>('high')
  const [quality, setQuality] = useState(65)
  const [dpi, setDpi] = useState(150)
  const [grayscale, setGrayscale] = useState(false)
  const [removeMetadata, setRemoveMetadata] = useState(true)
  
  // Target Size
  const [targetSizeMb, setTargetSizeMb] = useState(5)
  const [targetLogs, setTargetLogs] = useState<string[]>([])
  
  // UI
  const [isDragging, setIsDragging] = useState(false)
  const [toastMsg, setToastMsg] = useState("")
  const [globalProgress, setGlobalProgress] = useState(0)
  const [batchMode, setBatchMode] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (toastMsg) {
      const t = setTimeout(() => setToastMsg(""), 4000)
      return () => clearTimeout(t)
    }
  }, [toastMsg])
  const showToast = (msg: string) => setToastMsg(msg)

  // Apply preset
  useEffect(() => {
    if (!showCustom && mode === 'preset') {
      if (level === 'low') { setQuality(95); setDpi(300); }
      if (level === 'medium') { setQuality(80); setDpi(150); }
      if (level === 'high') { setQuality(65); setDpi(150); }
      if (level === 'max') { setQuality(40); setDpi(72); }
    }
  }, [level, showCustom, mode])

  // --- UPLOAD & ANALYZE ---
  const analyzePDF = async (file: File): Promise<Partial<FileEntry>> => {
    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true })
      const pages = pdf.getPageCount()
      
      const hasImages = arrayBuffer.byteLength > pages * 50000
      
      return {
        pages,
        hasImages,
        estimatedSavings: hasImages ? '60-85%' : '10-30%',
        isPasswordProtected: pdf.isEncrypted
      }
    } catch (e: any) {
      if (e.message?.includes('encrypted')) {
         return { pages: 0, hasImages: false, estimatedSavings: 'Unknown', isPasswordProtected: true }
      }
      throw e
    }
  }

  const handleFiles = async (newFiles: FileList | null) => {
    if (!newFiles || newFiles.length === 0) return
    
    let toProcess = Array.from(newFiles).filter(f => f.type === 'application/pdf')
    if (toProcess.length === 0) {
      showToast("⚠ Only PDF files are supported")
      return
    }
    
    if (!batchMode && toProcess.length > 1) {
      toProcess = [toProcess[0]]
      showToast("ℹ Single PDF mode active. Switch to Batch Mode to process multiple files.")
    } else if (batchMode && files.length + toProcess.length > 10) {
      showToast("⚠ Maximum 10 files allowed in batch mode")
      toProcess = toProcess.slice(0, 10 - files.length)
    }
    
    const newEntries: FileEntry[] = []
    
    for (const f of toProcess) {
      if (f.size > 200 * 1024 * 1024) {
        showToast(`⚠ ${f.name} is too large. Max 200MB.`)
        continue
      }
      
      const entry: FileEntry = {
        id: generateId(),
        file: f,
        originalSize: f.size,
        pages: 0,
        hasImages: false,
        estimatedSavings: 'Analyzing...',
        isPasswordProtected: false,
        status: 'pending',
        progress: 0,
        currentPage: 0,
        statusText: 'Waiting...'
      }
      newEntries.push(entry)
    }
    
    if (newEntries.length === 0) return
    
    setFiles(prev => [...prev, ...newEntries])
    setAppState('settings')
    
    // Analyze asynchronously
    for (const entry of newEntries) {
      try {
        const stats = await analyzePDF(entry.file)
        setFiles(prev => prev.map(f => f.id === entry.id ? { ...f, ...stats } : f))
      } catch {
        setFiles(prev => prev.map(f => f.id === entry.id ? { ...f, estimatedSavings: 'Failed to analyze' } : f))
      }
    }
  }

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id))
    if (files.length <= 1) setAppState('upload')
  }

  const unlockPdf = async (id: string, pwd: string) => {
    const entry = files.find(f => f.id === id)
    if (!entry) return
    try {
      const buffer = await entry.file.arrayBuffer()
      const pdf = await PDFDocument.load(buffer, { password: pwd } as any)
      const pages = pdf.getPageCount()
      const hasImages = buffer.byteLength > pages * 50000
      
      setFiles(prev => prev.map(f => f.id === id ? { 
        ...f, 
        isPasswordProtected: false, 
        password: pwd,
        pages,
        hasImages,
        estimatedSavings: hasImages ? '60-85%' : '10-30%'
      } : f))
      showToast("✓ PDF unlocked!")
    } catch {
      showToast("⚠ Incorrect password")
    }
  }

  // --- ENGINE ---
  const compressPDFCore = async (
    fileBuffer: ArrayBuffer, 
    entry: FileEntry, 
    targetQuality: number, 
    targetDpi: number,
    onProgress: (pct: number, page: number, status: string) => void
  ): Promise<Blob> => {
    const pdfjsLib = await getPdfjs()
    const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(fileBuffer.slice(0)), password: entry.password })
    const pdfDoc = await loadingTask.promise
    
    const newPdf = await PDFDocument.create()
    if (removeMetadata) {
      newPdf.setTitle('')
      newPdf.setAuthor('')
      newPdf.setSubject('')
      newPdf.setKeywords([])
      newPdf.setProducer('ToolHive PDF Compressor')
      newPdf.setCreator('ToolHive')
    }
    
    const pageCount = pdfDoc.numPages
    
    for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
      onProgress(Math.round((pageNum / pageCount) * 90), pageNum, `Rasterizing page ${pageNum} of ${pageCount}`)
      
      const page = await pdfDoc.getPage(pageNum)
      const viewport = page.getViewport({ scale: 1.0 })
      
      // Calculate scale based on target DPI (PDF points are 72 per inch)
      const scale = targetDpi / 72
      const scaledViewport = page.getViewport({ scale })
      
      const canvas = document.createElement('canvas')
      canvas.width = scaledViewport.width
      canvas.height = scaledViewport.height
      const ctx = canvas.getContext('2d', { willReadFrequently: grayscale })!
      
      await page.render({ canvasContext: ctx as any, viewport: scaledViewport }).promise
      
      if (grayscale) {
        onProgress(Math.round((pageNum / pageCount) * 90), pageNum, `Applying grayscale to page ${pageNum}`)
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data
        for (let i = 0; i < data.length; i += 4) {
          const gray = 0.299 * data[i] + 0.587 * data[i+1] + 0.114 * data[i+2]
          data[i] = data[i+1] = data[i+2] = gray
        }
        ctx.putImageData(imageData, 0, 0)
      }
      
      onProgress(Math.round((pageNum / pageCount) * 90), pageNum, `Compressing page ${pageNum}`)
      const imgDataUrl = canvas.toDataURL('image/jpeg', targetQuality / 100)
      const base64 = imgDataUrl.split(',')[1]
      
      // Convert base64 to Uint8Array efficiently
      const binaryString = atob(base64)
      const len = binaryString.length
      const imgBytes = new Uint8Array(len)
      for (let i = 0; i < len; i++) {
        imgBytes[i] = binaryString.charCodeAt(i)
      }
      
      const jpgImage = await newPdf.embedJpg(imgBytes)
      const newPage = newPdf.addPage([viewport.width, viewport.height])
      newPage.drawImage(jpgImage, {
        x: 0,
        y: 0,
        width: viewport.width,
        height: viewport.height
      })
      
      // Yield to UI thread to prevent freezing
      await new Promise(r => setTimeout(r, 10))
    }
    
    onProgress(95, pageCount, "Rebuilding PDF structure...")
    const compressedBytes = await newPdf.save()
    return new Blob([compressedBytes as unknown as BlobPart], { type: 'application/pdf' })
  }

  // --- TARGET SIZE MODE ALGORITHM ---
  const compressToTargetSize = async (
    fileBuffer: ArrayBuffer, 
    entry: FileEntry, 
    targetSizeLimit: number,
    onProgress: (pct: number, page: number, status: string) => void
  ): Promise<Blob> => {
    let qLow = 10
    let qHigh = 90
    let bestBlob: Blob | null = null
    let bestDiff = Infinity
    let currentQuality = 60
    
    setTargetLogs([])
    const addLog = (msg: string) => setTargetLogs(prev => [...prev, msg])
    
    addLog(`Target Size: ${formatBytes(targetSizeLimit)}`)
    
    // Max 4 iterations to prevent freezing browser
    for (let attempt = 1; attempt <= 4; attempt++) {
      addLog(`Attempt ${attempt}: Compressing at ${currentQuality}% quality...`)
      const blob = await compressPDFCore(fileBuffer, entry, currentQuality, dpi, (p, page) => {
         onProgress(Math.round(p * (attempt / 4)), page, `Attempt ${attempt}/4: Quality ${currentQuality}% (Page ${page}/${entry.pages})`)
      })
      
      const size = blob.size
      const diff = Math.abs(size - targetSizeLimit)
      
      addLog(`Result: ${formatBytes(size)}`)
      
      if (diff < bestDiff && size <= targetSizeLimit * 1.1) {
        bestDiff = diff
        bestBlob = blob
      }
      
      if (Math.abs(size - targetSizeLimit) / targetSizeLimit < 0.05) {
        addLog(`✓ Within 5% of target. Stopping.`)
        break // Within 5% tolerance
      }
      
      if (size > targetSizeLimit) {
        qHigh = currentQuality - 1
      } else {
        qLow = currentQuality + 1
      }
      
      if (qLow > qHigh) {
        addLog(`Bounds crossed. Using best result.`)
        break
      }
      currentQuality = Math.floor((qLow + qHigh) / 2)
    }
    
    if (!bestBlob) {
      addLog(`Failed to reach target. Returning lowest possible size.`)
      return await compressPDFCore(fileBuffer, entry, 10, 72, onProgress)
    }
    
    return bestBlob
  }

  // --- EXECUTION ---
  const startCompression = async () => {
    const toProcess = files.filter(f => !f.isPasswordProtected)
    if (toProcess.length === 0) return
    
    setAppState('processing')
    setGlobalProgress(0)
    
    for (let i = 0; i < toProcess.length; i++) {
      const entry = toProcess[i]
      
      // Update entry status
      setFiles(prev => prev.map(f => f.id === entry.id ? { ...f, status: 'compressing', progress: 0 } : f))
      
      try {
        const buffer = await entry.file.arrayBuffer()
        let resultBlob: Blob;
        
        if (buffer.byteLength < 50 * 1024) {
          // Edge case: Already tiny PDF, don't compress
          resultBlob = new Blob([buffer], { type: 'application/pdf' })
          setFiles(prev => prev.map(f => f.id === entry.id ? { 
            ...f, status: 'success', progress: 100, statusText: 'Skipped (Already small)', 
            resultBlob, compressedSize: buffer.byteLength, savedBytes: 0, savingPercent: 0 
          } : f))
          setGlobalProgress(Math.round(((i + 1) / toProcess.length) * 100))
          continue
        }

        const onProgress = (pct: number, page: number, txt: string) => {
          setFiles(prev => prev.map(f => f.id === entry.id ? { ...f, progress: pct, currentPage: page, statusText: txt } : f))
          // Calculate global progress
          const baseGlobal = (i / toProcess.length) * 100
          const currentGlobal = (pct / 100) * (100 / toProcess.length)
          setGlobalProgress(Math.round(baseGlobal + currentGlobal))
        }

        if (mode === 'target') {
          resultBlob = await compressToTargetSize(buffer, entry, targetSizeMb * 1024 * 1024, onProgress)
        } else {
          resultBlob = await compressPDFCore(buffer, entry, quality, dpi, onProgress)
        }
        
        // Edge case: Result is larger
        if (resultBlob.size >= buffer.byteLength) {
           resultBlob = new Blob([buffer], { type: 'application/pdf' })
           setFiles(prev => prev.map(f => f.id === entry.id ? { 
             ...f, status: 'success', progress: 100, statusText: 'Kept Original (Optimization failed to reduce size)', 
             resultBlob, compressedSize: buffer.byteLength, savedBytes: 0, savingPercent: 0 
           } : f))
        } else {
           const saved = buffer.byteLength - resultBlob.size
           const pct = (saved / buffer.byteLength) * 100
           setFiles(prev => prev.map(f => f.id === entry.id ? { 
             ...f, status: 'success', progress: 100, statusText: 'Complete', 
             resultBlob, compressedSize: resultBlob.size, savedBytes: saved, savingPercent: pct 
           } : f))
        }
      } catch (err: any) {
        console.error(err)
        setFiles(prev => prev.map(f => f.id === entry.id ? { ...f, status: 'failed', statusText: err.message || 'Failed' } : f))
      }
    }
    
    setGlobalProgress(100)
    setAppState('results')
    showToast("✓ Compression complete!")
  }

  // --- DOWNLOADS ---
  const downloadSingle = (entry: FileEntry) => {
    if (!entry.resultBlob) return
    const url = URL.createObjectURL(entry.resultBlob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${entry.file.name.replace(/\.pdf$/i, '')}_compressed.pdf`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const downloadAll = async () => {
    const successFiles = files.filter(f => f.status === 'success' && f.resultBlob)
    if (successFiles.length === 1) {
      downloadSingle(successFiles[0])
      return
    }
    
    showToast("Preparing ZIP file...")
    try {
      const zip = new JSZip()
      successFiles.forEach(f => {
        zip.file(`${f.file.name.replace(/\.pdf$/i, '')}_compressed.pdf`, f.resultBlob!)
      })
      const zipBlob = await zip.generateAsync({ type: 'blob' })
      const url = URL.createObjectURL(zipBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = `ToolHive_Compressed_PDFs.zip`
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
      if ((e.ctrlKey || e.metaKey) && e.key === 's' && appState === 'results') {
        e.preventDefault()
        downloadAll()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [appState, files])

  // Estimator
  const getQualityColor = (q: number) => {
    if (q <= 40) return "text-red-500 bg-red-500/10 border-red-500/20"
    if (q <= 70) return "text-amber-500 bg-amber-500/10 border-amber-500/20"
    if (q <= 85) return "text-green-500 bg-green-500/10 border-green-500/20"
    return "text-blue-500 bg-blue-500/10 border-blue-500/20"
  }
  const getQualityText = (q: number) => {
    if (q <= 40) return "Low Quality"
    if (q <= 70) return "Balanced"
    if (q <= 85) return "Recommended"
    return "High Quality"
  }

  // Summary logic
  const totalOriginalSize = files.reduce((acc, f) => acc + f.originalSize, 0)
  const estimatedSavingsPct = mode === 'preset' ? (100 - quality) * 0.8 : 0 // Rough math
  const estimatedFinalSize = mode === 'preset' ? totalOriginalSize * (1 - estimatedSavingsPct/100) : targetSizeMb * 1024 * 1024
  
  const totalSavedBytes = files.reduce((acc, f) => acc + (f.savedBytes || 0), 0)
  const totalFinalSize = files.reduce((acc, f) => acc + (f.compressedSize || f.originalSize), 0)
  const actualSavedPct = totalOriginalSize ? (totalSavedBytes / totalOriginalSize) * 100 : 0

  return (
    <>
      {toastMsg && (
        <div className="fixed bottom-4 right-4 z-50 animate-in fade-in slide-in-from-bottom-4 flex items-center gap-2 bg-card border border-border shadow-lg rounded-lg px-4 py-3">
          {toastMsg.startsWith('✓') ? <CheckCircle2 className="size-5 text-green-500" /> : <AlertTriangle className="size-5 text-amber-500" />}
          <span className="text-sm font-medium">{toastMsg.replace(/^[✓⚠ℹ]\s*/, '')}</span>
        </div>
      )}

      <div className="mb-8 text-center">
        <nav className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight className="size-3.5" />
          <Link href="/#pdf-tools" className="hover:text-foreground transition-colors">PDF Tools</Link>
          <ChevronRight className="size-3.5" />
          <span className="text-foreground font-medium">Compress PDF</span>
        </nav>
        <h1 className="font-heading text-3xl font-bold sm:text-4xl sm:leading-[1.1] mb-3">
          Compress PDF — <span className="text-gradient">Reduce Size Free Online</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Reduce your PDF file size instantly without losing readability. Perfect for email attachments, uploads and sharing — free, private, no signup needed.
        </p>
      </div>

      {/* STATE 1: UPLOAD */}
      {appState === 'upload' && (
        <div className="animate-in fade-in zoom-in-95 max-w-3xl mx-auto">
          <div className="flex items-center justify-end mb-4">
            <div className="flex items-center gap-2 bg-muted p-1 rounded-lg">
              <button onClick={() => setBatchMode(false)} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${!batchMode ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>Single PDF</button>
              <button onClick={() => setBatchMode(true)} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${batchMode ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>Batch Mode</button>
            </div>
          </div>
          <div 
            className={`rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer overflow-hidden bg-card ${isDragging ? "border-brand-orange bg-brand-orange/5 scale-[1.01]" : "border-border hover:border-brand-orange/50 hover:bg-muted/50"}`}
            style={{ minHeight: '350px' }}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files) }}
            onClick={() => fileInputRef.current?.click()}
          >
            <input ref={fileInputRef} type="file" accept="application/pdf" multiple={batchMode} className="hidden" onChange={(e) => handleFiles(e.target.files)} />
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <div className="mb-6 flex size-24 items-center justify-center rounded-full bg-brand-orange/10 text-brand-orange">
                <Gauge className="size-12" />
              </div>
              <h3 className="font-heading text-2xl font-bold mb-2">Drop your PDF here to compress</h3>
              <p className="text-muted-foreground mb-6">Click to browse or drag and drop</p>
              <div className="flex gap-4 text-xs font-medium text-muted-foreground">
                <span className="bg-muted px-3 py-1.5 rounded-full border border-border">PDF only</span>
                <span className="bg-muted px-3 py-1.5 rounded-full border border-border">Max 200MB</span>
                {batchMode && <span className="bg-brand-orange/10 text-brand-orange px-3 py-1.5 rounded-full border border-brand-orange/20">Up to 10 files</span>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STATE 2 & 3: SETTINGS / PROCESSING */}
      {(appState === 'settings' || appState === 'processing') && (
        <div className="animate-in fade-in space-y-8">
          
          {/* File List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
               <h3 className="font-bold font-heading text-lg">Selected {files.length === 1 ? 'File' : 'Files'}</h3>
               {appState === 'settings' && (
                 <Button variant="ghost" size="sm" onClick={() => { setFiles([]); setAppState('upload') }} className="text-muted-foreground hover:text-red-500">
                   <Trash2 className="size-4 mr-2" /> Clear All
                 </Button>
               )}
            </div>
            
            <div className="grid gap-3">
              {files.map(f => (
                <div key={f.id} className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div className="flex items-center gap-4 w-full">
                    <div className="size-12 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center shrink-0">
                      <FileText className="size-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold truncate">{f.file.name}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-2 flex-wrap">
                        <span>{formatBytes(f.originalSize)}</span>
                        <span>•</span>
                        <span>{f.pages > 0 ? `${f.pages} pages` : 'Analyzing...'}</span>
                      </div>
                    </div>
                  </div>
                  
                  {appState === 'settings' ? (
                    <div className="w-full sm:w-auto shrink-0 flex items-center justify-between sm:justify-end gap-4">
                      {f.isPasswordProtected ? (
                        <div className="flex items-center gap-2">
                           <Lock className="size-4 text-amber-500" />
                           <Input type="password" placeholder="Password" className="w-28 h-8 text-xs" onKeyDown={e => { if(e.key === 'Enter') unlockPdf(f.id, e.currentTarget.value) }} />
                        </div>
                      ) : (
                        <div className="text-sm font-medium px-3 py-1 bg-muted rounded-full whitespace-nowrap">
                          {f.estimatedSavings.includes('60') ? '🖼️ Image heavy' : '📝 Text heavy'}
                        </div>
                      )}
                      <button onClick={() => removeFile(f.id)} className="text-muted-foreground hover:text-red-500 p-2"><X className="size-4" /></button>
                    </div>
                  ) : (
                    <div className="w-full sm:w-64 shrink-0 space-y-1">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-muted-foreground truncate pr-2">{f.statusText}</span>
                        <span className="text-brand-orange">{f.progress}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-brand-orange transition-all duration-300" style={{ width: `${f.progress}%` }}></div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Notices */}
            {appState === 'settings' && files.some(f => f.originalSize > 50 * 1024 * 1024) && (
              <div className="bg-amber-500/10 border border-amber-500/20 text-amber-600 p-3 rounded-lg text-sm flex gap-3 items-center">
                <AlertTriangle className="size-5 shrink-0" />
                <p><strong>Large PDF detected.</strong> Compression may take a few minutes. Please keep this tab open.</p>
              </div>
            )}
            {appState === 'settings' && files.some(f => !f.hasImages && f.pages > 0 && !f.isPasswordProtected) && (
              <div className="bg-blue-500/10 border border-blue-500/20 text-blue-500 p-3 rounded-lg text-sm flex gap-3 items-center">
                <Target className="size-5 shrink-0" />
                <p><strong>Text-heavy PDF detected.</strong> Savings will be around 10-30%. Our engine converts pages to optimized images, so text may lose selectability.</p>
              </div>
            )}
          </div>

          {appState === 'settings' && (
            <div className="grid lg:grid-cols-[1fr_350px] gap-8 items-start">
              
              {/* LEFT: SETTINGS */}
              <div className="space-y-6">
                
                {/* Mode Toggle */}
                <div className="flex p-1 bg-muted rounded-xl w-fit">
                  <button onClick={() => setMode('preset')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${mode === 'preset' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                    Compression Levels
                  </button>
                  <button onClick={() => setMode('target')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${mode === 'target' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                    Target File Size
                  </button>
                </div>

                {mode === 'preset' && (
                  <div className="space-y-4 animate-in fade-in">
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      
                      <div onClick={() => setLevel('low')} className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${level === 'low' ? 'border-blue-500 bg-blue-500/5 shadow-md' : 'border-border hover:border-blue-500/50 bg-card'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 font-bold text-lg"><div className="size-3 rounded-full bg-blue-500" /> Low</div>
                          {level === 'low' && <CheckCircle2 className="size-5 text-blue-500" />}
                        </div>
                        <p className="text-sm font-medium mb-1">95% quality</p>
                        <p className="text-xs text-muted-foreground">Best quality • ~10-20% smaller</p>
                      </div>

                      <div onClick={() => setLevel('medium')} className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${level === 'medium' ? 'border-green-500 bg-green-500/5 shadow-md' : 'border-border hover:border-green-500/50 bg-card'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 font-bold text-lg"><div className="size-3 rounded-full bg-green-500" /> Medium</div>
                          {level === 'medium' && <CheckCircle2 className="size-5 text-green-500" />}
                        </div>
                        <p className="text-sm font-medium mb-1">80% quality</p>
                        <p className="text-xs text-muted-foreground">Balanced • ~40-60% smaller</p>
                      </div>

                      <div onClick={() => setLevel('high')} className={`p-4 rounded-xl border-2 cursor-pointer transition-all relative ${level === 'high' ? 'border-brand-orange bg-brand-orange/5 shadow-md' : 'border-border hover:border-brand-orange/50 bg-card'}`}>
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-orange text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Recommended</div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 font-bold text-lg"><div className="size-3 rounded-full bg-brand-orange" /> High</div>
                          {level === 'high' && <CheckCircle2 className="size-5 text-brand-orange" />}
                        </div>
                        <p className="text-sm font-medium mb-1">65% quality</p>
                        <p className="text-xs text-muted-foreground">Recommended • ~60-75% smaller</p>
                      </div>

                      <div onClick={() => setLevel('max')} className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${level === 'max' ? 'border-red-500 bg-red-500/5 shadow-md' : 'border-border hover:border-red-500/50 bg-card'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 font-bold text-lg"><div className="size-3 rounded-full bg-red-500" /> Max</div>
                          {level === 'max' && <CheckCircle2 className="size-5 text-red-500" />}
                        </div>
                        <p className="text-sm font-medium mb-1">40% quality</p>
                        <p className="text-xs text-muted-foreground">Smallest • ~75-90% smaller</p>
                      </div>

                    </div>

                    <button onClick={() => setShowCustom(!showCustom)} className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors pt-4">
                      <Settings2 className="size-4" /> {showCustom ? 'Hide Custom Settings' : 'Show Custom Settings'}
                    </button>
                  </div>
                )}

                {mode === 'target' && (
                  <div className="space-y-6 animate-in fade-in bg-card p-6 rounded-2xl border border-border">
                    <div>
                       <h3 className="font-bold text-lg flex items-center gap-2 mb-2"><Target className="size-5 text-brand-orange" /> Set Exact File Size</h3>
                       <p className="text-sm text-muted-foreground">Our smart algorithm will automatically test multiple compression levels to match your exact target file size.</p>
                    </div>
                    
                    <div className="flex items-end gap-4 max-w-sm">
                      <div className="flex-1 space-y-2">
                         <label className="text-xs font-bold text-muted-foreground uppercase">Target Size (MB)</label>
                         <Input type="number" min={0.1} step={0.1} value={targetSizeMb} onChange={e => setTargetSizeMb(Number(e.target.value))} className="h-12 text-lg font-bold" />
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                       <Button variant="outline" size="sm" onClick={() => setTargetSizeMb(1)}>1 MB</Button>
                       <Button variant="outline" size="sm" onClick={() => setTargetSizeMb(2)}>2 MB</Button>
                       <Button variant="outline" size="sm" onClick={() => setTargetSizeMb(5)}>5 MB</Button>
                       <Button variant="outline" size="sm" onClick={() => setTargetSizeMb(10)}>10 MB</Button>
                    </div>

                    <div className="bg-muted p-4 rounded-lg text-sm">
                       Original: <strong>{formatBytes(totalOriginalSize)}</strong> → Target: <strong>{targetSizeMb} MB</strong>
                       <div className="text-muted-foreground mt-1 text-xs">
                          Requires ~{Math.max(0, Math.round(100 - (targetSizeMb * 1024 * 1024 / totalOriginalSize) * 100))}% reduction. 
                          {totalOriginalSize < targetSizeMb * 1024 * 1024 ? " (Original is already smaller than target!)" : ""}
                       </div>
                    </div>
                  </div>
                )}

                {(showCustom || mode === 'target') && (
                  <div className="bg-card p-6 rounded-2xl border border-border space-y-6 animate-in fade-in">
                    <h3 className="font-bold text-lg flex items-center gap-2"><SlidersHorizontal className="size-5" /> Advanced Settings</h3>
                    
                    {mode === 'preset' && (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center text-sm font-bold">
                          <span>Image Quality</span>
                          <span className={`px-2 py-1 rounded border ${getQualityColor(quality)}`}>{quality}% - {getQualityText(quality)}</span>
                        </div>
                        <Slider value={[quality]} onValueChange={(v: any) => setQuality(v[0])} min={10} max={100} step={1} />
                      </div>
                    )}

                    <div className="space-y-3">
                      <label className="text-sm font-bold">Image Resolution (DPI)</label>
                      <div className="grid grid-cols-3 gap-2">
                        <button onClick={() => setDpi(72)} className={`py-2 rounded-lg text-xs font-bold border transition-colors ${dpi === 72 ? 'bg-brand-orange text-white border-brand-orange' : 'border-border hover:bg-muted'}`}>72 dpi<br/><span className="font-normal opacity-80">Screen</span></button>
                        <button onClick={() => setDpi(150)} className={`py-2 rounded-lg text-xs font-bold border transition-colors ${dpi === 150 ? 'bg-brand-orange text-white border-brand-orange' : 'border-border hover:bg-muted'}`}>150 dpi<br/><span className="font-normal opacity-80">Web</span></button>
                        <button onClick={() => setDpi(300)} className={`py-2 rounded-lg text-xs font-bold border transition-colors ${dpi === 300 ? 'bg-brand-orange text-white border-brand-orange' : 'border-border hover:bg-muted'}`}>300 dpi<br/><span className="font-normal opacity-80">Print</span></button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 border border-border rounded-xl">
                      <div>
                        <div className="font-bold text-sm">Convert to Grayscale</div>
                        <div className="text-xs text-muted-foreground">Removes color for extra size reduction</div>
                      </div>
                      <Switch checked={grayscale} onCheckedChange={setGrayscale} />
                    </div>

                    <div className="flex items-center justify-between p-3 border border-border rounded-xl">
                      <div>
                        <div className="font-bold text-sm">Strip Metadata</div>
                        <div className="text-xs text-muted-foreground">Removes authors, dates, hidden tags</div>
                      </div>
                      <Switch checked={removeMetadata} onCheckedChange={setRemoveMetadata} />
                    </div>
                  </div>
                )}
              </div>

              {/* RIGHT: ESTIMATE & BUTTON */}
              <div className="space-y-6 sticky top-6">
                 
                 <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
                   <div className="flex items-center gap-2 font-bold mb-4 border-b border-border pb-4">
                     <Gauge className="size-5 text-brand-orange" /> Compression Estimate
                   </div>
                   
                   <div className="space-y-3 text-sm">
                     <div className="flex justify-between">
                       <span className="text-muted-foreground">Original Size</span>
                       <span className="font-bold">{formatBytes(totalOriginalSize)}</span>
                     </div>
                     <div className="flex justify-between">
                       <span className="text-muted-foreground">Estimated Output</span>
                       <span className="font-bold text-green-500">{formatBytes(estimatedFinalSize)}</span>
                     </div>
                     <div className="flex justify-between font-bold">
                       <span className="text-muted-foreground">Estimated Savings</span>
                       <span className="text-brand-orange">~{Math.round(mode === 'preset' ? estimatedSavingsPct : Math.max(0, (1 - (targetSizeMb*1024*1024)/totalOriginalSize)*100))}%</span>
                     </div>
                     
                     <div className="h-px bg-border my-2" />
                     
                     <div className="flex justify-between text-xs">
                       <span className="text-muted-foreground">Total Pages</span>
                       <span className="font-medium">{files.reduce((a,f) => a + f.pages, 0)}</span>
                     </div>
                     <div className="flex justify-between text-xs">
                       <span className="text-muted-foreground">Est. Time</span>
                       <span className="font-medium">~{Math.max(1, Math.round(files.reduce((a,f) => a + f.pages, 0) * 0.5))}s</span>
                     </div>
                   </div>
                 </div>

                 <Button 
                   onClick={startCompression} 
                   disabled={files.some(f => f.isPasswordProtected)}
                   className="w-full h-16 text-lg font-bold bg-brand-orange hover:bg-brand-orange-hover text-white shadow-xl shadow-brand-orange/20"
                 >
                   <PackageOpen className="size-6 mr-2" /> 
                   Compress {files.length === 1 ? 'PDF' : `All ${files.length} PDFs`}
                 </Button>

                 {files.some(f => f.isPasswordProtected) && (
                   <p className="text-xs text-center text-amber-500 font-medium">Please unlock all PDFs before compressing.</p>
                 )}
              </div>
            </div>
          )}

          {/* PROCESSING OVERLAY */}
          {appState === 'processing' && (
            <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
               <div className="bg-card border border-border shadow-2xl rounded-2xl p-8 max-w-lg w-full text-center space-y-6">
                 <div className="size-20 bg-brand-orange/10 rounded-full flex items-center justify-center mx-auto text-brand-orange">
                   <RefreshCw className="size-10 animate-spin" />
                 </div>
                 
                 <div>
                   <h2 className="text-2xl font-bold font-heading mb-2">Compressing PDF{files.length > 1 ? 's' : ''}...</h2>
                   <p className="text-muted-foreground">Please do not close this tab.</p>
                 </div>
                 
                 <div className="space-y-2">
                   <div className="flex justify-between font-bold text-sm">
                     <span>Global Progress</span>
                     <span className="text-brand-orange">{globalProgress}%</span>
                   </div>
                   <div className="h-3 bg-muted rounded-full overflow-hidden">
                     <div className="h-full bg-brand-orange transition-all duration-300" style={{ width: `${globalProgress}%` }}></div>
                   </div>
                 </div>
                 
                 {mode === 'target' && targetLogs.length > 0 && (
                   <div className="text-left bg-muted p-3 rounded-lg text-xs font-mono h-24 overflow-y-auto space-y-1">
                     {targetLogs.map((log, i) => (
                       <div key={i} className="text-muted-foreground">{log}</div>
                     ))}
                   </div>
                 )}
               </div>
            </div>
          )}
        </div>
      )}

      {/* STATE 4: RESULTS */}
      {appState === 'results' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 space-y-8 max-w-4xl mx-auto">
          
          <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden text-center relative">
             <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-green-400 to-green-600" />
             <div className="p-8 md:p-12 space-y-6">
                <div className="size-20 bg-green-500 rounded-full flex items-center justify-center text-white mx-auto shadow-lg shadow-green-500/20 mb-4">
                  <CheckCircle2 className="size-10" />
                </div>
                <h2 className="text-3xl font-bold font-heading">Compression Complete!</h2>
                
                <div className="flex flex-wrap items-center justify-center gap-4">
                   <div className="px-6 py-3 rounded-2xl bg-muted border border-border">
                     <div className="text-sm text-muted-foreground mb-1">Original Size</div>
                     <div className="text-xl font-bold line-through opacity-70">{formatBytes(totalOriginalSize)}</div>
                   </div>
                   <ArrowRight className="size-6 text-muted-foreground" />
                   <div className="px-6 py-3 rounded-2xl bg-green-500/10 border border-green-500/20">
                     <div className="text-sm text-green-600 dark:text-green-400 mb-1 font-medium">New Size</div>
                     <div className="text-2xl font-bold text-green-700 dark:text-green-500">{formatBytes(totalFinalSize)}</div>
                   </div>
                </div>

                <div className="inline-block px-4 py-2 rounded-full bg-brand-orange/10 text-brand-orange font-bold text-lg border border-brand-orange/20 shadow-inner">
                  🔥 Saved {formatBytes(totalSavedBytes)} ({actualSavedPct.toFixed(1)}%)
                </div>
             </div>
             
             <div className="bg-muted/50 p-6 border-t border-border flex flex-col sm:flex-row items-center justify-center gap-4">
                {files.length === 1 ? (
                  <Button onClick={() => downloadSingle(files[0])} className="w-full sm:w-auto h-14 text-lg font-bold bg-brand-orange hover:bg-brand-orange-hover text-white px-8 shadow-lg shadow-brand-orange/20">
                    <Download className="size-5 mr-2" /> Download PDF
                  </Button>
                ) : (
                  <Button onClick={downloadAll} className="w-full sm:w-auto h-14 text-lg font-bold bg-brand-orange hover:bg-brand-orange-hover text-white px-8 shadow-lg shadow-brand-orange/20">
                    <Download className="size-5 mr-2" /> Download All as ZIP
                  </Button>
                )}
                
                <Button variant="outline" onClick={() => setAppState('settings')} className="w-full sm:w-auto h-14">
                  <Settings className="size-4 mr-2" /> Adjust Settings
                </Button>
             </div>
          </div>

          {/* Result File List (For Batch) */}
          {files.length > 1 && (
            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="font-bold mb-4">Processed Files</h3>
              <div className="space-y-2">
                {files.map(f => (
                  <div key={f.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-muted/50 rounded-xl gap-4">
                     <div className="flex items-center gap-3 min-w-0">
                        <FileText className="size-5 text-brand-orange shrink-0" />
                        <div className="truncate font-medium text-sm">{f.file.name}</div>
                     </div>
                     <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <span className="line-through">{formatBytes(f.originalSize)}</span>
                          <ArrowRight className="size-3" />
                          <span className="font-bold text-foreground">{formatBytes(f.compressedSize || f.originalSize)}</span>
                        </div>
                        <div className={`font-bold w-16 text-right ${f.savingPercent && f.savingPercent > 0 ? 'text-green-500' : 'text-muted-foreground'}`}>
                          -{f.savingPercent?.toFixed(0)}%
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => downloadSingle(f)} className="h-8">
                          <Download className="size-4" />
                        </Button>
                     </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="text-center pt-8">
             <Button variant="ghost" onClick={() => { setFiles([]); setAppState('upload') }} className="text-muted-foreground">
               <RefreshCw className="size-4 mr-2" /> Compress Another PDF
             </Button>
          </div>

        </div>
      )}
    </>
  )
}
