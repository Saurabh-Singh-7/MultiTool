"use client"

import { useState, useCallback, useRef, useEffect, MouseEvent as ReactMouseEvent, TouchEvent as ReactTouchEvent } from "react"
import Link from "next/link"
import Script from "next/script"
import { Upload, Download, RotateCcw, ChevronRight, ImageIcon, Trash2, PackageOpen, Settings2, Info, Lightbulb, Image as ImageIconLucide, ChevronDown, ChevronUp, Copy, CheckCircle2, Link as LinkIcon, Unlink, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { compressImage, compressToTargetSize, formatBytes, analyzeImage, type CompressResult, type AnalysisResult, type CompressOptions, loadImage } from "@/lib/compress"

// --- TYPES ---
interface ImageItem {
  id: string
  file: File
  imgElement?: HTMLImageElement
  preview: string
  result: CompressResult | null
  status: "pending" | "compressing" | "done" | "error"
  error?: string
  analysis?: AnalysisResult
  attemptInfo?: { attempt: number, quality: number, size: number, targetBytes: number, progress: number }
  attemptLogs?: string[]
  progress?: number
  diffText?: string
  qualityBoost?: boolean
  exactMatch?: boolean
  methodNote?: string
}

type Format = 'auto' | 'jpeg' | 'png' | 'webp'

declare global {
  interface Window {
    JSZip: any
  }
}

// --- HELPER COMPONENTS ---
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

function BeforeAfterSlider({ originalSrc, compressedSrc, originalLabel, compressedLabel }: { originalSrc: string, compressedSrc: string, originalLabel: string, compressedLabel: string }) {
  const [sliderPosition, setSliderPosition] = useState(50)
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    let x = ((clientX - rect.left) / rect.width) * 100
    x = Math.min(Math.max(x, 5), 95)
    setSliderPosition(x)
  }, [])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return
    handleMove(e.clientX)
  }, [isDragging, handleMove])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging) return
    handleMove(e.touches[0].clientX)
  }, [isDragging, handleMove])

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', () => setIsDragging(false))
      window.addEventListener('touchmove', handleTouchMove, { passive: false })
      window.addEventListener('touchend', () => setIsDragging(false))
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', () => setIsDragging(false))
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', () => setIsDragging(false))
    }
  }, [isDragging, handleMouseMove, handleTouchMove])

  return (
    <div 
      ref={containerRef}
      className="relative w-full aspect-video sm:aspect-[16/9] md:aspect-[21/9] lg:aspect-[2.5/1] rounded-xl overflow-hidden bg-muted select-none touch-none"
    >
      {/* Original Image (Full width, underneath) */}
      <img src={originalSrc} alt="Original" className="absolute top-0 left-0 w-full h-full object-contain bg-black/5" draggable={false} />
      
      {/* Compressed Image (Clipped on left) */}
      <img 
        src={compressedSrc} 
        alt="Compressed" 
        className="absolute top-0 left-0 w-full h-full object-contain bg-black/5" 
        style={{ clipPath: `inset(0 0 0 ${sliderPosition}%)` }}
        draggable={false}
      />
      
      {/* Labels */}
      <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-md text-white text-xs px-2 py-1 rounded font-medium shadow-sm">
        {originalLabel}
      </div>
      <div className="absolute top-4 right-4 bg-brand-orange/90 backdrop-blur-md text-white text-xs px-2 py-1 rounded font-medium shadow-sm z-10">
        {compressedLabel}
      </div>

      {/* Divider */}
      <div 
        className="absolute top-0 bottom-0 w-[3px] bg-white cursor-col-resize z-20"
        style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
        onMouseDown={() => setIsDragging(true)}
        onTouchStart={() => setIsDragging(true)}
      >
        {/* Handle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-10 rounded-full bg-white flex items-center justify-center shadow-[0_2px_10px_rgba(0,0,0,0.3)] border border-border transition-transform hover:scale-110 active:scale-95">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-foreground"><path d="m9 18-6-6 6-6"/><path d="m15 18 6-6-6-6"/></svg>
        </div>
      </div>
    </div>
  )
}

// --- MAIN COMPONENT ---
export default function ImageCompressorClient() {
  // Global State
  const [images, setImages] = useState<ImageItem[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [jsZipLoaded, setJsZipLoaded] = useState(false)
  const [toastMessage, setToastMessage] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  // Settings State
  const [targetSizeVal, setTargetSizeVal] = useState("500")
  const [targetSizeUnit, setTargetSizeUnit] = useState<'KB'|'MB'>('KB')
  
  const [outputFormat, setOutputFormat] = useState<Format>('auto')
  
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [resizeEnabled, setResizeEnabled] = useState(true)
  const [maxWidth, setMaxWidth] = useState("1920")
  const [maxHeight, setMaxHeight] = useState("1080")
  const [lockAspectRatio, setLockAspectRatio] = useState(true)
  const [originalAspect, setOriginalAspect] = useState<number | null>(null)

  const ACCEPTED = "image/jpeg,image/png,image/webp,image/gif"

  const showToast = (msg: string) => {
    setToastMessage(msg)
  }

  // Handle Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        const doneImages = images.filter(i => i.status === 'done' && i.result)
        if (doneImages.length === 1) {
          downloadSingle(doneImages[0].result!)
        } else if (doneImages.length > 1) {
          downloadAllZip()
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [images])

  // Get current compress options
  const getOptions = (): Omit<CompressOptions, 'quality'> => ({
    format: outputFormat,
    resize: {
      enabled: resizeEnabled,
      maxWidth: parseInt(maxWidth) || 1920,
      maxHeight: parseInt(maxHeight) || 1080
    }
  })

  // ---- COMPRESSION LOGIC ----

  const triggerTargetCompression = useCallback(async (items: ImageItem[]) => {
    const opts = {
      format: outputFormat,
      resize: {
        enabled: resizeEnabled,
        maxWidth: parseInt(maxWidth) || 1920,
        maxHeight: parseInt(maxHeight) || 1080
      }
    }
    const targetBytes = (parseFloat(targetSizeVal) || 500) * (targetSizeUnit === 'MB' ? 1024 * 1024 : 1024);

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.status === "done" && item.result) continue;

      setImages(prev => {
        const p = [...prev];
        const idx = p.findIndex(img => img.id === item.id);
        if (idx !== -1) p[idx] = { ...p[idx], status: "compressing", result: null, attemptLogs: [], progress: 0 };
        return p;
      });

      try {
        const { result, diffText, qualityBoost, exactMatch, methodNote } = await compressToTargetSize(
          item.file, 
          targetBytes, 
          opts,
          (attempt, q, size, target, prog) => {
            setImages(prev => {
              const p = [...prev];
              const idx = p.findIndex(img => img.id === item.id);
              if (idx !== -1) {
                const currentItem = p[idx];
                const logs = currentItem.attemptLogs || [];
                const attemptLog = attempt > 0 ? `Attempt ${attempt} — Quality ${Math.round(q * 100)}% → ${formatBytes(size)} (target: ${formatBytes(target)}) ${size < target ? '↑ too small' : '↓ too large'}` : '';
                p[idx] = { 
                  ...currentItem, 
                  attemptInfo: { attempt, quality: q, size, targetBytes: target, progress: prog },
                  progress: prog,
                  attemptLogs: attemptLog ? [...logs, attemptLog] : logs
                };
              }
              return p;
            });
          }
        );
        setImages(prev => {
          const p = [...prev];
          const idx = p.findIndex(img => img.id === item.id);
          if (idx !== -1) p[idx] = { ...p[idx], result, status: "done", attemptInfo: undefined, diffText, qualityBoost, exactMatch, methodNote, progress: 100 };
          return p;
        });
      } catch (err: any) {
        setImages(prev => {
          const p = [...prev];
          const idx = p.findIndex(img => img.id === item.id);
          if (idx !== -1) p[idx] = { ...p[idx], status: "error", error: err.message || "Compression failed", attemptInfo: undefined };
          return p;
        });
      }
    }
  }, [targetSizeVal, targetSizeUnit, outputFormat, resizeEnabled, maxWidth, maxHeight]);

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files).slice(0, 10 - images.length)
    if (fileArray.length === 0) return

    // Pre-process to load images for analysis
    const newItems: ImageItem[] = []
    
    for (const file of fileArray) {
      if (!file.type.startsWith("image/")) continue
      
      // Check size limit (50MB)
      if (file.size > 50 * 1024 * 1024) {
        showToast(`File ${file.name} is too large! Max 50MB.`)
        continue
      }

      let imgElement: HTMLImageElement | undefined
      let analysis: AnalysisResult | undefined
      
      try {
        imgElement = await loadImage(file)
        analysis = analyzeImage(file, imgElement)
      } catch (e) {
        console.error("Failed to analyze", e)
      }

      newItems.push({
        id: crypto.randomUUID(),
        file,
        imgElement,
        preview: URL.createObjectURL(file),
        result: null,
        status: "pending" as const,
        analysis
      })
    }

    if (newItems.length === 0) return
    const allItems = [...images, ...newItems]
    setImages(allItems)

    // Initialize aspect ratio from first image if not yet set
    if (images.length === 0 && newItems[0]?.imgElement) {
      const w = newItems[0].imgElement.width;
      const h = newItems[0].imgElement.height;
      if (w && h && !originalAspect) {
        setOriginalAspect(parseInt(maxWidth) / parseInt(maxHeight));
      }
    }

    // Automatically convert PNG/GIF to JPEG if format is auto for compression
    const hasPngGif = fileArray.some(f => f.type === 'image/png' || f.type === 'image/gif')
    if (hasPngGif) {
      showToast("ℹ PNG/GIF converted to JPEG for target size compression.")
    }

    triggerTargetCompression(allItems)
  }, [images, triggerTargetCompression])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFiles(e.dataTransfer.files)
  }, [handleFiles])

  const removeImage = (id: string) => {
    setImages((prev) => {
      const img = prev.find((i) => i.id === id)
      if (img) {
        URL.revokeObjectURL(img.preview)
        if (img.result) URL.revokeObjectURL(img.result.url)
      }
      return prev.filter((i) => i.id !== id)
    })
  }

  const resetAll = () => {
    images.forEach((img) => {
      URL.revokeObjectURL(img.preview)
      if (img.result) URL.revokeObjectURL(img.result.url)
    })
    setImages([])
  }

  const downloadSingle = (result: CompressResult) => {
    const a = document.createElement("a")
    a.href = result.url
    a.download = result.fileName
    a.click()
    showToast("✓ Download started!")
  }

  const downloadAllZip = async () => {
    if (!jsZipLoaded || !window.JSZip) return
    const zip = new window.JSZip()
    const done = images.filter((i) => i.status === "done" && i.result)
    if (done.length === 0) return

    for (const img of done) {
      zip.file(img.result!.fileName, img.result!.blob)
    }
    const content = await zip.generateAsync({ type: "blob" })
    const url = URL.createObjectURL(content)
    const a = document.createElement("a")
    a.href = url
    a.download = "toolhive-compressed-images.zip"
    a.click()
    URL.revokeObjectURL(url)
    showToast("✓ ZIP Download started!")
  }

  // --- DERIVED RENDER DATA ---
  
  const doneCount = images.filter((i) => i.status === "done").length
  const totalSaved = images.reduce(
    (acc, i) => acc + (i.result ? i.result.originalSize - i.result.compressedSize : 0),
    0
  )
  const totalOriginalSize = images.reduce((acc, i) => acc + i.file.size, 0)
  
  const showPNGSuggestion = images.some(i => i.file.type === 'image/png')
  const showWebPSuggestion = images.some(i => i.file.type === 'image/jpeg') && outputFormat !== 'webp'

  return (
    <>
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"
        onLoad={() => setJsZipLoaded(true)}
      />

      <Toast message={toastMessage} visible={!!toastMessage} onClose={() => setToastMessage("")} />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <ChevronRight className="size-3.5" />
          <Link href="/#image-tools" className="hover:text-foreground transition-colors">
            Image Tools
          </Link>
          <ChevronRight className="size-3.5" />
          <span className="text-foreground font-medium">Image Compressor</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold sm:text-4xl mb-3">
            Image Compressor — <span className="text-gradient">Reduce Image Size Free</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Compress your JPG, PNG, WebP, and GIF images up to 90% smaller without visible quality loss. 
            Everything happens in your browser — your files never leave your device.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          
          {/* ===== LEFT COLUMN: UPLOAD & SETTINGS ===== */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Upload zone */}
            <div
              className={`relative rounded-xl border-2 border-dashed transition-all duration-300 cursor-pointer ${
                isDragging
                  ? "border-brand-orange bg-brand-orange/5 scale-[1.01]"
                  : "border-border hover:border-brand-orange/50 hover:bg-muted/50 bg-card"
              } ${images.length >= 10 ? 'opacity-50 pointer-events-none' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
            >
              <input
                ref={inputRef}
                type="file"
                accept={ACCEPTED}
                multiple
                className="hidden"
                onChange={(e) => e.target.files && handleFiles(e.target.files)}
              />
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-brand-orange/10">
                  <Upload className="size-6 text-brand-orange" />
                </div>
                <p className="font-medium text-foreground mb-1">
                  {isDragging ? "Drop images here!" : "Drag & drop images"}
                </p>
                <p className="text-sm text-muted-foreground mb-2">or click to browse</p>
                <Badge variant="secondary" className="text-[10px] font-normal">JPG, PNG, WebP, GIF • Max 50MB</Badge>
              </div>
            </div>

            {/* Settings Panel */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="p-4 border-b border-border bg-muted/30">
                <h3 className="font-heading font-semibold flex items-center gap-2">
                  <Settings2 className="size-4 text-brand-orange" /> Target Size Settings
                </h3>
              </div>
              
              <div className="p-5 space-y-6">
                
                <div className="space-y-4 animate-in fade-in">
                  <div>
                      <label className="text-sm font-medium mb-2 block">Compress to under:</label>
                      <div className="flex gap-2">
                        <input 
                          type="number" 
                          value={targetSizeVal}
                          onChange={(e) => setTargetSizeVal(e.target.value)}
                          className="flex-1 bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/50"
                        />
                        <select 
                          value={targetSizeUnit}
                          onChange={(e) => setTargetSizeUnit(e.target.value as any)}
                          className="w-20 bg-background border border-input rounded-md px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/50"
                        >
                          <option value="KB">KB</option>
                          <option value="MB">MB</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {['50', '100', '200', '500'].map(val => (
                        <Badge 
                          key={val} 
                          variant="outline" 
                          className="cursor-pointer hover:bg-brand-orange/10 hover:text-brand-orange hover:border-brand-orange/30 font-normal"
                          onClick={() => { setTargetSizeVal(val); setTargetSizeUnit('KB') }}
                        >
                          {val} KB
                        </Badge>
                      ))}
                      {['1', '2'].map(val => (
                        <Badge 
                          key={`mb-${val}`}
                          variant="outline" 
                          className="cursor-pointer hover:bg-brand-orange/10 hover:text-brand-orange hover:border-brand-orange/30 font-normal"
                          onClick={() => { setTargetSizeVal(val); setTargetSizeUnit('MB') }}
                        >
                          {val} MB
                        </Badge>
                      ))}
                    </div>

                    {(() => {
                      if (images.length === 0) return null;
                      const firstImg = images[0];
                      const firstImgSizeKB = Math.round(firstImg.file.size / 1024);
                      const currentTargetKB = (parseFloat(targetSizeVal) || 0) * (targetSizeUnit === 'MB' ? 1024 : 1);
                      if (firstImgSizeKB > 0 && currentTargetKB > 0) {
                        const isPng = firstImg.file.type === 'image/png';
                        const isGif = firstImg.file.type === 'image/gif';
                        const needsConversion = isPng || isGif;
                        let hintText: string, colorClass: string;

                        if (needsConversion) {
                          // PNG/GIF: we can't compare target against the original file size
                          // because JPEG conversion changes size drastically
                          hintText = `ℹ ${isPng ? 'PNG' : 'GIF'} will be converted to JPEG for compression. JPEG baseline will be calculated automatically. Target of ${currentTargetKB} KB will be matched against the JPEG version.`;
                          colorClass = "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-900/30";
                        } else if (currentTargetKB > firstImgSizeKB) {
                          hintText = `📈 ${currentTargetKB} KB > original (${firstImgSizeKB} KB) — will INCREASE quality to reach target`;
                          colorClass = "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-900/30";
                        } else if (currentTargetKB < firstImgSizeKB) {
                          hintText = `📉 ${currentTargetKB} KB < original (${firstImgSizeKB} KB) — will COMPRESS to reach target`;
                          colorClass = "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-900/30";
                        } else {
                          hintText = `✓ Same as original size — no changes needed`;
                          colorClass = "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900/30";
                        }
                        return (
                          <div className={`p-3 text-xs rounded-lg border ${colorClass} mt-3`}>
                            {hintText}
                          </div>
                        )
                      }
                      return null;
                    })()}

                    <Button 
                      className="w-full bg-brand-orange hover:bg-brand-orange-hover text-white cursor-pointer mt-2"
                      onClick={() => triggerTargetCompression(images.map(i => ({...i, status: 'pending'})))}
                      disabled={images.length === 0 || images.some(i => i.status === 'compressing')}
                    >
                      Compress to Target Size
                    </Button>
                    <p className="text-[10px] text-muted-foreground text-center mt-2 leading-tight">
                      Note: If the target size is much higher than the original, the file will only grow to the maximum possible size at 100% quality.
                    </p>
                  </div>

                {/* Output Format */}
                <div className="space-y-3 pt-4 border-t border-border">
                  <label className="text-sm font-medium flex items-center gap-2">
                    Output Format
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: 'auto', label: 'Auto' },
                      { id: 'jpeg', label: 'JPEG' },
                      { id: 'png', label: 'PNG' },
                      { id: 'webp', label: 'WebP' },
                    ].map(f => (
                      <button
                        key={f.id}
                        className={`py-1.5 text-xs font-medium rounded-md border transition-all ${outputFormat === f.id ? 'border-brand-orange bg-brand-orange/10 text-brand-orange' : 'border-border bg-background hover:bg-muted'}`}
                        onClick={() => setOutputFormat(f.id as Format)}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                  
                  {/* Format hints */}
                  {outputFormat === 'webp' && (
                    <p className="text-[11px] text-green-500 flex items-center gap-1.5 mt-2">
                      <span className="text-base">🚀</span> WebP is typically 25-35% smaller than JPEG.
                    </p>
                  )}
                  {outputFormat === 'auto' && showWebPSuggestion && (
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-2">
                      <Lightbulb className="size-3 text-brand-orange" /> Try WebP for ~30% extra savings.
                    </p>
                  )}
                  {outputFormat !== 'png' && showPNGSuggestion && (
                    <p className="text-[11px] text-yellow-600 dark:text-yellow-400 flex items-center gap-1 mt-2">
                      <Info className="size-3" /> Warning: Non-PNG formats will lose transparency.
                    </p>
                  )}
                </div>

                {/* Resize Options */}
                <div className="pt-4 border-t border-border">
                  <label className="flex items-center gap-2 text-sm font-medium cursor-pointer mb-3">
                    <input 
                      type="checkbox" 
                      checked={resizeEnabled}
                      onChange={(e) => setResizeEnabled(e.target.checked)}
                      className="rounded border-border text-brand-orange focus:ring-brand-orange size-4"
                    />
                    Resize Image
                  </label>
                  
                  {resizeEnabled && (
                    <div className="bg-muted/50 p-3 rounded-lg space-y-3 animate-in fade-in">
                      <div className="flex items-end gap-2">
                        <div className="flex-1">
                          <label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 block">Width</label>
                          <div className="relative">
                            <input type="number" value={maxWidth} onChange={e => {
                              const val = e.target.value;
                              setMaxWidth(val);
                              if (lockAspectRatio && originalAspect) {
                                setMaxHeight(String(Math.round(parseInt(val) / originalAspect) || ''));
                              }
                            }} className="w-full bg-background border border-input rounded text-sm px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-orange" />
                            <span className="absolute right-2 top-1.5 text-xs text-muted-foreground">px</span>
                          </div>
                        </div>

                        <button 
                          onClick={() => {
                            const newLocked = !lockAspectRatio;
                            setLockAspectRatio(newLocked);
                            if (newLocked && parseInt(maxWidth) > 0 && parseInt(maxHeight) > 0) {
                              setOriginalAspect(parseInt(maxWidth) / parseInt(maxHeight));
                            }
                          }} 
                          className={`flex shrink-0 items-center justify-center size-9 rounded-md transition-colors mb-0.5 ${
                            lockAspectRatio 
                              ? 'bg-brand-orange/10 text-brand-orange border border-brand-orange/30' 
                              : 'bg-muted text-muted-foreground hover:text-foreground border border-border'
                          }`} 
                          title={lockAspectRatio ? 'Aspect Ratio Locked — click to unlock' : 'Aspect Ratio Unlocked — click to lock'}
                        >
                          {lockAspectRatio ? <LinkIcon className="size-4" /> : <Unlink className="size-4 opacity-50" />}
                        </button>

                        <div className="flex-1">
                          <label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 block">Height</label>
                          <div className="relative">
                            <input type="number" value={maxHeight} onChange={e => {
                              const val = e.target.value;
                              setMaxHeight(val);
                              if (lockAspectRatio && originalAspect) {
                                setMaxWidth(String(Math.round(parseInt(val) * originalAspect) || ''));
                              }
                            }} className="w-full bg-background border border-input rounded text-sm px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-orange" />
                            <span className="absolute right-2 top-1.5 text-xs text-muted-foreground">px</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          {l: 'Web', w: '1920', h: '1080'},
                          {l: 'HD', w: '1280', h: '720'},
                          {l: 'Square', w: '800', h: '800'},
                          {l: 'Mobile', w: '1080', h: '1920'}
                        ].map(p => (
                          <Badge key={p.l} variant="outline" className="text-[10px] px-1.5 py-0 cursor-pointer hover:bg-brand-orange/10 hover:text-brand-orange hover:border-brand-orange/30 font-normal transition-colors" onClick={() => {
                            setMaxWidth(p.w); 
                            setMaxHeight(p.h);
                            setOriginalAspect(parseInt(p.w) / parseInt(p.h));
                          }}>
                            {p.l} ({p.w}×{p.h})
                          </Badge>
                        ))}
                      </div>
                      <p className="text-[10px] text-muted-foreground leading-tight">
                        {lockAspectRatio 
                          ? '🔗 Aspect ratio locked. Changing one dimension auto-adjusts the other.' 
                          : '🔓 Aspect ratio unlocked. You can set custom width & height independently.'}
                      </p>
                      <p className="text-[10px] text-muted-foreground leading-tight">
                        Images smaller than these dimensions will not be enlarged.
                      </p>
                    </div>
                  )}
                </div>

                {/* Cross-link to Image Resizer */}
                <div className="pt-4 border-t border-border">
                  <Link href="/image-resizer" className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/60 border border-border hover:border-brand-orange/30 transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-lg bg-brand-orange/10 flex items-center justify-center">
                        <ImageIconLucide className="size-4 text-brand-orange" />
                      </div>
                      <div>
                        <p className="text-sm font-medium group-hover:text-brand-orange transition-colors">Need to resize?</p>
                        <p className="text-[10px] text-muted-foreground">Go to Image Resizer →</p>
                      </div>
                    </div>
                    <ArrowRight className="size-4 text-muted-foreground group-hover:text-brand-orange group-hover:translate-x-0.5 transition-all" />
                  </Link>
                </div>

              </div>
            </div>
          </div>

          {/* ===== RIGHT COLUMN: RESULTS ===== */}
          <div className="lg:col-span-8">
            
            {images.length === 0 ? (
              <div className="h-full min-h-[400px] rounded-2xl border border-dashed border-border flex flex-col items-center justify-center text-muted-foreground">
                <ImageIconLucide className="size-16 mb-4 opacity-20" />
                <p>Upload an image to see results here</p>
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* Batch Actions Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-card border border-border p-3 sm:px-5">
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      {images.slice(0,3).map((img, i) => (
                        <div key={i} className="size-8 rounded bg-muted border border-border overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={img.preview} alt="" className="size-full object-cover" />
                        </div>
                      ))}
                      {images.length > 3 && <div className="size-8 rounded bg-muted border border-border flex items-center justify-center text-[10px] font-bold">+{images.length-3}</div>}
                    </div>
                    <div className="text-sm">
                      <span className="font-semibold">{doneCount}/{images.length}</span> done
                      {totalSaved !== 0 && (
                        <span className="text-muted-foreground ml-2 hidden sm:inline">
                          — {totalSaved > 0 ? "saved" : "increased by"} <span className="text-brand-orange font-bold">{formatBytes(Math.abs(totalSaved))}</span>
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {doneCount > 1 && jsZipLoaded && (
                      <Button onClick={downloadAllZip} className="bg-brand-orange hover:bg-brand-orange-hover text-white h-9 px-3 text-xs sm:text-sm cursor-pointer">
                        <PackageOpen className="size-4 mr-1.5 hidden sm:block" /> Download ZIP
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={resetAll} className="h-9 px-2 sm:px-3 text-muted-foreground hover:text-destructive cursor-pointer">
                      <RotateCcw className="size-4 sm:mr-1.5" /> <span className="hidden sm:inline">Reset</span>
                    </Button>
                  </div>
                </div>

                {/* Image Results */}
                <div className="space-y-8">
                  {images.map((img, index) => {
                    const isSingleMode = images.length === 1

                    return (
                      <div key={img.id} className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
                        
                        {/* Header for list mode */}
                        <div className="p-3 sm:p-4 border-b border-border bg-muted/20 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            {!isSingleMode && (
                              <div className="size-10 rounded overflow-hidden shrink-0 bg-muted">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={img.preview} alt="" className="size-full object-cover" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="text-sm font-semibold truncate" title={img.file.name}>{img.file.name}</p>
                              {img.status === 'done' && img.result && (
                                <p className="text-xs text-muted-foreground truncate">
                                  {formatBytes(img.result.originalSize)} → <span className="font-medium text-foreground">{formatBytes(img.result.compressedSize)}</span>
                                </p>
                              )}
                              {img.status === 'compressing' && (
                                <p className="text-xs text-brand-orange flex items-center gap-1.5">
                                  <span className="size-2.5 rounded-full border border-current border-t-transparent animate-spin" />
                                  Processing...
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 ml-auto shrink-0">
                            {img.status === 'done' && img.result && (
                              <>
                                {(() => {
                                  const targetKBVal = (parseFloat(targetSizeVal) || 500) * (targetSizeUnit === 'MB' ? 1024 : 1);
                                  const finalKB = Math.round(img.result.compressedSize / 1024);
                                  const diffKB = Math.abs(finalKB - targetKBVal);
                                  let badgeText: string;
                                  let badgeClass: string;

                                  if (diffKB <= 5) {
                                    badgeText = '✓ Exact!';
                                    badgeClass = 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20';
                                  } else if (diffKB <= 15) {
                                    badgeText = '~Close';
                                    badgeClass = 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20';
                                  } else {
                                    badgeText = '⚠ Closest possible';
                                    badgeClass = 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';
                                  }

                                  return (
                                    <Badge variant="secondary" className={badgeClass}>
                                      {badgeText}
                                    </Badge>
                                  );
                                })()}
                                <Button size="sm" disabled={img.status === 'compressing'} onClick={() => downloadSingle(img.result!)} className="bg-brand-orange hover:bg-brand-orange-hover text-white h-8 px-3 cursor-pointer">
                                  <Download className="size-3.5 mr-1.5" /> Download ({formatBytes(img.result.compressedSize)})
                                </Button>
                              </>
                            )}
                            <button onClick={() => removeImage(img.id)} className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors cursor-pointer" title="Remove">
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                        </div>

                        {/* Live Attempt Progress for Target Mode */}
                        {img.status === 'compressing' && img.attemptInfo && (
                          <div className="px-4 py-4 border-b border-border bg-card">
                            <div className="flex justify-between text-xs font-semibold mb-2 text-muted-foreground">
                              <span>🔍 Finding optimal quality...</span>
                              <span>Attempt {img.attemptInfo.attempt}/20</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2 mb-3 overflow-hidden">
                              <div className="bg-brand-orange h-2 rounded-full transition-all duration-300" style={{width: `${img.progress || 0}%`}}></div>
                            </div>
                            
                            <div className="h-32 overflow-y-auto bg-muted/30 border border-border rounded p-2 text-xs font-mono space-y-1">
                              {img.attemptLogs?.map((log, i) => (
                                <div key={i} className="text-muted-foreground animate-in fade-in">{log}</div>
                              ))}
                              {/* Keep latest in view by reversing order visually or scrolling to bottom (we just rely on normal render, can be improved to auto-scroll) */}
                            </div>
                          </div>
                        )}

                        {/* Error state */}
                        {img.status === 'error' && (
                          <div className="p-6 text-center text-sm text-destructive bg-destructive/5">
                            {img.error}
                          </div>
                        )}

                        {/* Done State */}
                        {img.status === 'done' && img.result && (
                          <div className="p-4 sm:p-6 space-y-6">
                            
                            {/* Before/After Slider */}
                            {(isSingleMode || img.result.savings > 0) && (
                              <BeforeAfterSlider 
                                originalSrc={img.preview} 
                                compressedSrc={img.result.url} 
                                originalLabel="BEFORE"
                                compressedLabel="AFTER"
                              />
                            )}

                            {/* Detailed Stats Dashboard */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-3">
                                <h4 className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-2">Original</h4>
                                <div className="flex justify-between items-end">
                                  <span className="text-2xl font-light">{formatBytes(img.result.originalSize)}</span>
                                  <span className="text-xs font-mono text-muted-foreground mb-1">{img.imgElement?.width || '-'} × {img.imgElement?.height || '-'} px</span>
                                </div>
                              </div>
                              
                              <div className="p-4 rounded-xl border border-brand-orange/20 bg-brand-orange/5 space-y-3 relative overflow-hidden">
                                <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none">
                                  <PackageOpen className="size-24" />
                                </div>
                                <h4 className="text-[10px] uppercase font-bold text-brand-orange tracking-wider mb-2">Compressed</h4>
                                <div className="flex justify-between items-end relative z-10">
                                  <div>
                                    <span className="text-2xl font-bold text-brand-orange">{formatBytes(img.result.compressedSize)}</span>
                                    <span className="text-xs font-medium text-brand-orange ml-2">{img.diffText}</span>
                                  </div>
                                  <span className="text-xs font-mono text-brand-orange/80 mb-1">{img.result.width} × {img.result.height} px</span>
                                </div>
                              </div>
                            </div>

                            {/* Method note (e.g. upscale info) */}
                            {img.methodNote && (
                              <div className="p-3 text-xs rounded-lg border border-blue-200 dark:border-blue-900/30 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/10">
                                {img.methodNote}
                              </div>
                            )}
                            
                            {/* Meta info footer */}
                            <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-foreground">Format:</span> {img.result.format}
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-foreground">Time:</span> {img.result.timeMs.toFixed(0)}ms
                              </div>
                              <div className="flex items-center gap-1.5" title="Estimated load time on average 4G (9Mbps)">
                                <span className="font-semibold text-foreground">Web Load saved:</span> 
                                ~{Math.max(0, ((img.result.originalSize - img.result.compressedSize) / 1125)).toFixed(1)}s on 4G
                              </div>
                            </div>

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

        {/* ===== SEO CONTENT SECTIONS (Unchanged) ===== */}
        {/* ... keeping the SEO sections below identical to before ... */}
        <div className="space-y-12 py-8 mt-12 border-t border-border">
          {/* How-to */}
          <section>
            <h2 className="font-heading text-2xl font-bold mb-6">How to Compress an Image Online</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { step: "1", title: "Upload Your Image", desc: "Drag and drop your image into the upload zone, or click to browse files from your device." },
                { step: "2", title: "Set Quality or Target Size", desc: "Use the quality slider or enter a specific target file size to find the perfect balance." },
                { step: "3", title: "Download", desc: "Click download to save your compressed image. For multiple images, use Download All as ZIP." },
              ].map((item) => (
                <div key={item.step} className="rounded-xl border border-border bg-card p-5 text-center">
                  <div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-full bg-brand-orange/10 text-brand-orange font-heading font-bold text-lg">{item.step}</div>
                  <h3 className="font-heading font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Benefits */}
          <section>
            <h2 className="font-heading text-2xl font-bold mb-6">Why Use ToolHive Image Compressor?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: "⚡", title: "Lightning Fast In-Browser Tech", desc: "Compression happens right in your browser. No server upload needed — instant results." },
                { icon: "🎯", title: "Target Size Optimization", desc: "Need an image exactly under 200KB? Our smart algorithm automatically finds the perfect quality." },
                { icon: "🔒", title: "Totally Private", desc: "Your images never leave your device. Zero data is uploaded. Complete privacy guaranteed." },
                { icon: "✨", title: "No Watermarks, 100% Free", desc: "No hidden fees, no premium plans, no limits. We never add watermarks to your files." },
              ].map((item) => (
                <div key={item.title} className="rounded-xl border border-border bg-card p-5 flex gap-4">
                  <span className="text-2xl flex-shrink-0">{item.icon}</span>
                  <div>
                    <h3 className="font-heading font-semibold mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* FAQ */}
          <section>
            <h2 className="font-heading text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                { q: "How does the Target Size feature work?", a: "When you enter a target size (e.g., 500 KB), our algorithm performs a rapid binary search, repeatedly compressing the image in the background at different quality levels until it finds the exact setting that gets your file as close to the target size as possible without going over." },
                { q: "Is my image uploaded to a server?", a: "No. Everything happens locally in your browser using the HTML5 Canvas API. Your images never leave your device. We don't store, collect, or process any of your files." },
                { q: "What image formats are supported?", a: "We support JPG/JPEG, PNG, WebP, and GIF formats. You can choose your desired output format, or let 'Auto' select the most efficient one (usually JPEG or WebP)." },
              ].map((item) => (
                <details key={item.q} className="group rounded-xl border border-border bg-card overflow-hidden">
                  <summary className="flex items-center justify-between cursor-pointer p-5 font-medium hover:bg-muted/50 transition-colors list-none">
                    {item.q}
                    <ChevronRight className="size-4 text-muted-foreground transition-transform duration-200 group-open:rotate-90" />
                  </summary>
                  <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">{item.a}</div>
                </details>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  )
}
