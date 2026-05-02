"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import JSZip from "jszip"
import { Upload, ChevronRight, Image as ImageIcon, RefreshCw, AlertTriangle, Trash2, Download, CheckCircle2, ChevronDown, Info, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"

type SupportedFormat = 'JPG' | 'PNG' | 'WebP' | 'GIF' | 'BMP'

const formatMap: Record<SupportedFormat, string> = {
  'JPG':  'image/jpeg',
  'PNG':  'image/png',
  'WebP': 'image/webp',
  'GIF':  'image/gif',
  'BMP':  'image/bmp',
}

const extMap: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png':  'png',
  'image/webp': 'webp',
  'image/gif':  'gif',
  'image/bmp':  'bmp',
}

interface ImageItem {
  id: string
  file: File
  name: string
  size: number
  format: string
  previewUrl: string
  dimensions?: { w: number, h: number }
  outputFormat: SupportedFormat
  hasTransparency?: boolean
  isAnimatedGif?: boolean
}

interface ConversionResult {
  id: string
  success: boolean
  originalName: string
  outputFormat: SupportedFormat
  originalSize: number
  newSize?: number
  blob?: Blob
  error?: string
  resultUrl?: string
}

function formatBytes(bytes: number, decimals = 1) {
  if (!+bytes) return '0 B'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

function Toast({ message, visible, onClose }: { message: string, visible: boolean, onClose: () => void }) {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(onClose, 2500)
      return () => clearTimeout(timer)
    }
  }, [visible, onClose])

  if (!visible) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300 flex items-center gap-2 bg-card border border-border shadow-lg rounded-lg px-4 py-3">
      <CheckCircle2 className="size-5 text-green-500" />
      <span className="text-sm font-medium">{message}</span>
    </div>
  )
}

function hasTransparency(file: File): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = Math.min(img.width, 100) // sample only to be fast
      canvas.height = Math.min(img.height, 100)
      const ctx = canvas.getContext('2d')
      if (!ctx) { resolve(false); return }
      
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      try {
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data
        for (let i = 3; i < data.length; i += 4) {
          if (data[i] < 255) {
            resolve(true)
            return
          }
        }
      } catch (e) {
        // Handle cross-origin or canvas taint issues gracefully
      }
      resolve(false)
    }
    img.onerror = () => resolve(false)
    img.src = URL.createObjectURL(file)
  })
}

async function convertImage(file: File, targetFormat: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)
    
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error("Could not initialize canvas context"))
        return
      }

      // Fill background for formats that don't support transparency
      if (targetFormat === 'image/jpeg' || targetFormat === 'image/bmp') {
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }

      ctx.drawImage(img, 0, 0)
      URL.revokeObjectURL(objectUrl)

      // Always use maximum quality 1.0 to prevent quality loss
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error(`Conversion to ${targetFormat} failed. Format might not be supported in this browser.`))
        }
      }, targetFormat, 1.0)
    }

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('Could not load image'))
    }

    img.src = objectUrl
  })
}

export default function ImageConverterClient() {
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  
  const [status, setStatus] = useState<'idle' | 'selected' | 'converting' | 'done'>('idle')
  const [items, setItems] = useState<ImageItem[]>([])
  const [results, setResults] = useState<ConversionResult[]>([])
  const [toastMessage, setToastMessage] = useState("")
  
  // Settings
  const [globalOutputFormat, setGlobalOutputFormat] = useState<SupportedFormat>('PNG')
  
  // Progress
  const [overallProgress, setOverallProgress] = useState(0)
  const [currentIndex, setCurrentIndex] = useState(0)

  const ACCEPTED = "image/jpeg,image/png,image/webp,image/gif,image/bmp,image/*"

  // Sync format changes to all items
  useEffect(() => {
    if (status === 'selected') {
      setItems(prev => prev.map(item => ({ ...item, outputFormat: globalOutputFormat })))
    }
  }, [globalOutputFormat, status])

  // Handle Ctrl+S
  useEffect(() => {
    const handleShortcut = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s" && status === 'done' && results.some(r => r.success)) {
        e.preventDefault()
        downloadAllAsZip()
      }
    }
    window.addEventListener("keydown", handleShortcut)
    return () => window.removeEventListener("keydown", handleShortcut)
  }, [status, results])

  // Tab Title
  useEffect(() => {
    if (status === 'converting') {
      document.title = `Converting ${currentIndex + 1}/${items.length}... | ToolHive`
    } else {
      document.title = "Free Image Converter Online - Convert JPG, PNG, WebP, GIF | ToolHive"
    }
  }, [status, currentIndex, items.length])

  const handleFiles = async (fileList: FileList | File[]) => {
    const newFiles = Array.from(fileList).filter(f => f.type.startsWith('image/'))
    
    if (newFiles.length === 0) return

    const remainingSlots = 20 - items.length
    if (remainingSlots <= 0) {
      setToastMessage("⚠ Maximum 20 files allowed")
      return
    }

    const filesToProcess = newFiles.slice(0, remainingSlots)
    if (filesToProcess.length < newFiles.length) {
      setToastMessage(`⚠ Maximum 20 files. First ${filesToProcess.length} selected.`)
    }

    const newItems: ImageItem[] = []

    for (const file of filesToProcess) {
      if (file.size > 50 * 1024 * 1024) continue // Skip > 50MB
      
      const id = crypto.randomUUID()
      const url = URL.createObjectURL(file)
      
      let dimensions = { w: 0, h: 0 }
      let hasTransp = false
      let isAnimated = false

      // Check GIF animation (simple check based on extension/type)
      if (file.type === 'image/gif') {
        isAnimated = true // Assume all GIFs are animated to be safe with the warning
      }
      
      // Load image to get dimensions and transparency
      try {
        const img = new Image()
        await new Promise((resolve) => {
          img.onload = resolve
          img.onerror = resolve
          img.src = url
        })
        dimensions = { w: img.naturalWidth, h: img.naturalHeight }
        
        if (file.type === 'image/png' || file.type === 'image/webp' || file.type === 'image/gif') {
          hasTransp = await hasTransparency(file)
        }
      } catch (e) {
        console.error("Error analyzing image", e)
      }

      let ext = file.name.split('.').pop()?.toUpperCase() || ''
      if (ext === 'JPEG') ext = 'JPG'

      newItems.push({
        id,
        file,
        name: file.name,
        size: file.size,
        format: ext,
        previewUrl: url,
        dimensions,
        outputFormat: globalOutputFormat,
        hasTransparency: hasTransp,
        isAnimatedGif: isAnimated
      })
    }

    setItems(prev => [...prev, ...newItems])
    setStatus('selected')
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  const removeItem = (id: string) => {
    setItems(prev => {
      const next = prev.filter(item => item.id !== id)
      if (next.length === 0) setStatus('idle')
      return next
    })
  }

  const updateItemFormat = (id: string, format: SupportedFormat) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, outputFormat: format } : item))
  }

  const clearAll = () => {
    items.forEach(item => URL.revokeObjectURL(item.previewUrl))
    setItems([])
    setStatus('idle')
  }

  const convertAll = async () => {
    setStatus('converting')
    setOverallProgress(0)
    const newResults: ConversionResult[] = []
    
    for (let i = 0; i < items.length; i++) {
      setCurrentIndex(i)
      const item = items[i]
      
      try {
        const targetMime = formatMap[item.outputFormat]
        const blob = await convertImage(item.file, targetMime)
        const resultUrl = URL.createObjectURL(blob)
        
        newResults.push({
          id: item.id,
          success: true,
          originalName: item.name,
          outputFormat: item.outputFormat,
          originalSize: item.size,
          newSize: blob.size,
          blob,
          resultUrl
        })
      } catch (err: any) {
        newResults.push({
          id: item.id,
          success: false,
          originalName: item.name,
          outputFormat: item.outputFormat,
          originalSize: item.size,
          error: err.message
        })
      }
      
      setOverallProgress(Math.round(((i + 1) / items.length) * 100))
    }
    
    setResults(newResults)
    setStatus('done')
  }

  const downloadAllAsZip = async () => {
    try {
      const zip = new JSZip()
      const folder = zip.folder('converted_images')
      
      results.forEach((result) => {
        if (result.success && result.blob && folder) {
          const baseName = result.originalName.replace(/\.[^/.]+$/, '')
          const ext = extMap[formatMap[result.outputFormat]]
          // Handle name collisions
          let filename = `${baseName}.${ext}`
          folder.file(filename, result.blob)
        }
      })
      
      const zipBlob = await zip.generateAsync({ 
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 1 } 
      })
      
      const url = URL.createObjectURL(zipBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'converted_images.zip'
      a.click()
      URL.revokeObjectURL(url)
      
      setToastMessage("✓ Download started!")
    } catch (e) {
      console.error("ZIP Generation Failed", e)
      setToastMessage("⚠ Failed to create ZIP file.")
    }
  }

  const downloadSingle = (result: ConversionResult) => {
    if (!result.blob) return
    const baseName = result.originalName.replace(/\.[^/.]+$/, '')
    const ext = extMap[formatMap[result.outputFormat]]
    const filename = `${baseName}.${ext}`
    
    const url = URL.createObjectURL(result.blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const resetTool = () => {
    items.forEach(item => URL.revokeObjectURL(item.previewUrl))
    results.forEach(res => { if (res.resultUrl) URL.revokeObjectURL(res.resultUrl) })
    setItems([])
    setResults([])
    setStatus('idle')
  }


  return (
    <>
      <Toast message={toastMessage} visible={!!toastMessage} onClose={() => setToastMessage("")} />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight className="size-3.5" />
          <Link href="/#image-tools" className="hover:text-foreground transition-colors">Image Tools</Link>
          <ChevronRight className="size-3.5" />
          <span className="text-foreground font-medium">Image Converter</span>
        </nav>

        <div className="mb-8 text-center max-w-3xl mx-auto">
          <h1 className="font-heading text-3xl font-bold sm:text-4xl sm:leading-[1.1] mb-3">
            Image Converter — <span className="text-gradient">Convert Any Image Format Free</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Convert JPG, PNG, WebP, GIF and BMP images instantly in your browser. Batch convert up to 20 images at once — no signup, no watermark, your files never leave your device.
          </p>
        </div>

        {/* INFO PANEL */}
        {status === 'idle' && (
          <details className="max-w-4xl mx-auto mb-8 group rounded-xl border border-border bg-card overflow-hidden">
            <summary className="flex items-center gap-2 cursor-pointer p-4 font-medium hover:bg-muted/50 transition-colors list-none select-none text-sm">
              <ChevronRight className="size-4 text-muted-foreground transition-transform duration-200 group-open:rotate-90" />
              Which format should I choose?
            </summary>
            <div className="px-5 pb-5 pt-2 border-t border-border/50 text-sm grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <strong className="text-blue-500 block mb-1">JPG/JPEG</strong>
                <p className="text-muted-foreground text-xs leading-relaxed">Best for: Photos<br/>Transparency: No<br/>Use when: Sharing photos on social media</p>
              </div>
              <div>
                <strong className="text-green-500 block mb-1">PNG</strong>
                <p className="text-muted-foreground text-xs leading-relaxed">Best for: Logos, graphics<br/>Transparency: Yes ✓<br/>Use when: Need transparency, sharp edges</p>
              </div>
              <div>
                <strong className="text-purple-500 block mb-1">WebP</strong>
                <p className="text-muted-foreground text-xs leading-relaxed">Best for: Websites<br/>Transparency: Yes ✓<br/>Use when: Website optimization</p>
              </div>
              <div>
                <strong className="text-orange-500 block mb-1">GIF</strong>
                <p className="text-muted-foreground text-xs leading-relaxed">Best for: Animations<br/>Transparency: Yes (1-bit)<br/>Use when: Simple animated icons</p>
              </div>
            </div>
          </details>
        )}

        <div className="max-w-4xl mx-auto">
          
          {/* STATE: IDLE */}
          {status === 'idle' && (
            <div
              className={`relative rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer overflow-hidden ${
                isDragging ? "border-brand-orange bg-brand-orange/5 scale-[1.01]" : "border-border hover:border-brand-orange/50 hover:bg-muted/50 bg-card"
              }`}
              style={{ minHeight: '350px' }}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
            >
              <input ref={inputRef} type="file" multiple accept={ACCEPTED} className="hidden" onChange={(e) => e.target.files && handleFiles(e.target.files)} />
              
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10 pointer-events-none">
                <div className="mb-6 flex size-20 items-center justify-center rounded-3xl bg-brand-orange/10 text-brand-orange shadow-inner">
                  <RefreshCw className="size-10" />
                </div>
                <h3 className="font-heading text-2xl font-bold mb-2">Drop images here to convert</h3>
                <p className="text-muted-foreground mb-6">or click to browse from your device</p>
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground bg-background/50 px-3 py-1.5 rounded-full border border-border">
                  <span>JPG, PNG, WebP, GIF, BMP</span>
                  <span className="w-1 h-1 rounded-full bg-border"></span>
                  <span>Up to 20 files</span>
                  <span className="w-1 h-1 rounded-full bg-border"></span>
                  <span>Max 50MB each</span>
                </div>
              </div>
            </div>
          )}

          {/* STATE: SELECTED */}
          {status === 'selected' && (
            <div className="space-y-6 animate-in fade-in">
              
              {/* GLOBAL SETTINGS */}
              <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <div className="flex flex-col md:flex-row gap-6 md:items-start">
                  
                  {/* Format Selector */}
                  <div className="flex-1">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 block">Convert All To:</label>
                    <div className="flex flex-wrap gap-2">
                      {(['JPG', 'PNG', 'WebP', 'GIF', 'BMP'] as SupportedFormat[]).map(fmt => (
                        <button
                          key={fmt}
                          onClick={() => setGlobalOutputFormat(fmt)}
                          className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all border ${globalOutputFormat === fmt ? 'border-brand-orange bg-brand-orange/10 text-brand-orange shadow-sm' : 'border-border bg-background hover:bg-muted text-foreground'}`}
                        >
                          {fmt}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>
              </div>

              {/* ACTION ROW */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">{items.length} image{items.length !== 1 && 's'} selected</span>
                  <Button variant="ghost" size="sm" onClick={clearAll} className="text-muted-foreground h-8">Clear All</Button>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button variant="outline" onClick={() => inputRef.current?.click()} className="flex-1 sm:flex-none">
                    + Add More
                  </Button>
                  <Button onClick={convertAll} className="flex-1 sm:flex-none bg-brand-orange hover:bg-brand-orange-hover text-white shadow-md shadow-brand-orange/20">
                    <RefreshCw className="size-4 mr-2" />
                    Convert {items.length} Image{items.length !== 1 && 's'} to {globalOutputFormat}
                  </Button>
                </div>
                <input ref={inputRef} type="file" multiple accept={ACCEPTED} className="hidden" onChange={(e) => e.target.files && handleFiles(e.target.files)} />
              </div>

              {/* FILE LIST */}
              <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm divide-y divide-border">
                {items.map(item => {
                  const isSameFormat = item.format === item.outputFormat
                  const lossOfTransp = item.hasTransparency && (item.outputFormat === 'JPG' || item.outputFormat === 'BMP')
                  const lossOfAnim = item.isAnimatedGif && item.outputFormat !== 'GIF'

                  return (
                    <div key={item.id} className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/30 transition-colors group">
                      
                      {/* Left: Info */}
                      <div className="flex items-center gap-4 overflow-hidden">
                        <div className="size-12 rounded-md bg-muted flex-shrink-0 border border-border overflow-hidden relative checkered-bg">
                          <img src={item.previewUrl} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm truncate" title={item.name}>{item.name}</p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <Badge variant="secondary" className="px-1.5 py-0 text-[10px] font-mono">{item.format}</Badge>
                            <span>{formatBytes(item.size)}</span>
                            <span className="hidden sm:inline">•</span>
                            <span className="hidden sm:inline">{item.dimensions?.w} × {item.dimensions?.h}</span>
                          </div>
                        </div>
                      </div>

                      {/* Middle: Warnings */}
                      <div className="flex flex-col gap-1 w-full sm:w-auto sm:max-w-[200px]">
                        {lossOfTransp && (
                          <span className="text-[10px] flex items-center text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-1 rounded">
                            <AlertTriangle className="size-3 mr-1 flex-shrink-0" /> Has transparency. Will fill with White
                          </span>
                        )}
                        {lossOfAnim && (
                          <span className="text-[10px] flex items-center text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-1 rounded">
                            <AlertTriangle className="size-3 mr-1 flex-shrink-0" /> Converting GIF keeps first frame only
                          </span>
                        )}
                        {isSameFormat && !lossOfAnim && !lossOfTransp && (
                          <span className="text-[10px] flex items-center text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-1 rounded">
                            <Info className="size-3 mr-1 flex-shrink-0" /> Same format — will re-encode
                          </span>
                        )}
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-3 self-end sm:self-auto">
                        <ArrowRight className="size-4 text-muted-foreground hidden sm:block" />
                        <div className="relative">
                          <select 
                            value={item.outputFormat}
                            onChange={(e) => updateItemFormat(item.id, e.target.value as SupportedFormat)}
                            className="appearance-none bg-background border border-input rounded-md text-sm font-medium pl-3 pr-8 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-orange cursor-pointer"
                          >
                            {(['JPG', 'PNG', 'WebP', 'GIF', 'BMP'] as SupportedFormat[]).map(fmt => (
                              <option key={fmt} value={fmt}>{fmt}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
                        </div>
                        <button 
                          onClick={() => removeItem(item.id)} 
                          className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                          title="Remove image"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>

                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* STATE: CONVERTING */}
          {status === 'converting' && (
            <div className="rounded-2xl border border-border bg-card p-10 text-center shadow-sm animate-in fade-in zoom-in-95">
              <div className="mb-6 flex size-20 items-center justify-center rounded-3xl bg-brand-orange/10 text-brand-orange shadow-inner mx-auto animate-pulse">
                <RefreshCw className="size-10 animate-spin" style={{ animationDuration: '3s' }} />
              </div>
              <h3 className="font-heading text-2xl font-bold mb-2">Converting images...</h3>
              <p className="text-muted-foreground mb-8">Image {currentIndex + 1} of {items.length}</p>
              
              <div className="max-w-md mx-auto">
                <div className="w-full bg-muted rounded-full h-3 mb-2 overflow-hidden border border-border">
                  <div className="bg-brand-orange h-3 rounded-full transition-all duration-300 relative overflow-hidden" style={{width: `${overallProgress}%`}}>
                    <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]"></div>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground font-mono mb-4">
                  <span>Progress</span>
                  <span>{overallProgress}%</span>
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  Processing: {items[currentIndex]?.name} → {items[currentIndex]?.outputFormat}
                </p>
              </div>
            </div>
          )}

          {/* STATE: DONE */}
          {status === 'done' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-500">
              
              {/* SUMMARY BAR */}
              <div className="rounded-xl border border-border bg-card p-5 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {results.every(r => r.success) ? (
                    <div className="size-10 rounded-full bg-green-500/10 flex items-center justify-center">
                      <CheckCircle2 className="size-5 text-green-500" />
                    </div>
                  ) : (
                    <div className="size-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                      <AlertTriangle className="size-5 text-amber-500" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold">
                      {results.every(r => r.success) 
                        ? `Successfully converted ${results.length} images` 
                        : `Converted ${results.filter(r=>r.success).length}, Failed ${results.filter(r=>!r.success).length}`
                      }
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Total size: {formatBytes(results.reduce((acc, r) => acc + r.originalSize, 0))} → {formatBytes(results.reduce((acc, r) => acc + (r.newSize || 0), 0))}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3 w-full md:w-auto">
                  <Button variant="outline" onClick={resetTool} className="flex-1 md:flex-none">
                    <RefreshCw className="size-4 mr-2" /> Convert More
                  </Button>
                  <Button onClick={downloadAllAsZip} className="flex-1 md:flex-none bg-brand-orange hover:bg-brand-orange-hover text-white shadow-md shadow-brand-orange/20" disabled={!results.some(r => r.success)}>
                    <Download className="size-4 mr-2" /> Download All as ZIP
                  </Button>
                </div>
              </div>

              {/* RESULTS LIST */}
              <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm divide-y divide-border">
                {results.map(result => {
                  const sizeDiff = result.newSize ? ((result.newSize - result.originalSize) / result.originalSize) * 100 : 0
                  const isSmaller = sizeDiff < 0
                  
                  return (
                    <div key={result.id} className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/30 transition-colors">
                      
                      <div className="flex items-center gap-4 overflow-hidden flex-1">
                        <div className="size-12 rounded-md bg-muted flex-shrink-0 border border-border overflow-hidden relative checkered-bg">
                          {result.success && result.resultUrl ? (
                            <img src={result.resultUrl} alt={result.originalName} className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="size-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-muted-foreground/50" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate flex items-center gap-2" title={result.originalName}>
                            {result.originalName} 
                            <ArrowRight className="size-3 text-muted-foreground flex-shrink-0" />
                            {result.originalName.replace(/\.[^/.]+$/, '')}.{extMap[formatMap[result.outputFormat]]}
                          </p>
                          {result.success ? (
                            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                              <span>{formatBytes(result.originalSize)} → <strong className="text-foreground">{formatBytes(result.newSize!)}</strong></span>
                              <Badge variant="outline" className={`px-1.5 py-0 text-[9px] border-transparent ${isSmaller ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'}`}>
                                {Math.abs(sizeDiff).toFixed(1)}% {isSmaller ? 'smaller' : 'larger'}
                              </Badge>
                            </div>
                          ) : (
                            <p className="text-xs text-destructive mt-1 flex items-center"><AlertTriangle className="size-3 mr-1" /> {result.error}</p>
                          )}
                        </div>
                      </div>

                      {result.success && (
                        <div className="self-end sm:self-auto flex-shrink-0">
                          <Button size="sm" variant="secondary" onClick={() => downloadSingle(result)} className="h-8 text-xs font-medium bg-brand-orange/10 text-brand-orange hover:bg-brand-orange hover:text-white border border-brand-orange/20">
                            <Download className="size-3.5 mr-1.5" /> Download
                          </Button>
                        </div>
                      )}
                      
                    </div>
                  )
                })}
              </div>

            </div>
          )}

        </div>
      </div>
    </>
  )
}
