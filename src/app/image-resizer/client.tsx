"use client"

import { useState, useCallback, useRef, useEffect, MouseEvent as ReactMouseEvent, TouchEvent as ReactTouchEvent } from "react"
import Link from "next/link"
import Script from "next/script"
import { Upload, Download, RotateCcw, ChevronRight, ImageIcon, Trash2, PackageOpen, Settings2, Info, CheckCircle2, Link as LinkIcon, Unlink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { 
  resizeImage, generatePreview, formatBytes, getAspectRatio, 
  getLockedHeight, getLockedWidth, cmToPixels, mmToPixels, inchToPixels,
  pixelsToCm, pixelsToMm, pixelsToInch, SOCIAL_PRESETS, PRINT_PRESETS, 
  type ResizeResult, type ResizeOptions
} from "@/lib/resize"

// --- TYPES ---
interface ImageItem {
  id: string
  file: File
  imgElement?: HTMLImageElement
  preview: string // original preview URL
  afterPreviewUrl?: string // resized live preview URL
  result: ResizeResult | null
  status: "pending" | "processing" | "done" | "error"
  error?: string
  dimensions: { width: number, height: number }
  estimatedSize?: number
}

type TabMode = "custom" | "percentage" | "social" | "print"

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
      <img src={originalSrc} alt="Original" className="absolute top-0 left-0 w-full h-full object-contain bg-black/5" draggable={false} />
      <img 
        src={compressedSrc} 
        alt="Resized" 
        className="absolute top-0 left-0 w-full h-full object-contain bg-black/5" 
        style={{ clipPath: `inset(0 0 0 ${sliderPosition}%)` }}
        draggable={false}
      />
      <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-md text-white text-xs px-2 py-1 rounded font-medium shadow-sm">
        {originalLabel}
      </div>
      <div className="absolute top-4 right-4 bg-brand-orange/90 backdrop-blur-md text-white text-xs px-2 py-1 rounded font-medium shadow-sm z-10">
        {compressedLabel}
      </div>
      <div 
        className="absolute top-0 bottom-0 w-[3px] bg-white cursor-col-resize z-20"
        style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
        onMouseDown={() => setIsDragging(true)}
        onTouchStart={() => setIsDragging(true)}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-10 rounded-full bg-white flex items-center justify-center shadow-[0_2px_10px_rgba(0,0,0,0.3)] border border-border transition-transform hover:scale-110 active:scale-95">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-foreground"><path d="m9 18-6-6 6-6"/><path d="m15 18 6-6-6-6"/></svg>
        </div>
      </div>
    </div>
  )
}

export default function ImageResizerClient() {
  const [images, setImages] = useState<ImageItem[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [jsZipLoaded, setJsZipLoaded] = useState(false)
  const [toastMessage, setToastMessage] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  // Settings
  const [activeTab, setActiveTab] = useState<TabMode>("custom")
  const [lockAspectRatio, setLockAspectRatio] = useState(true)
  
  // Custom Tab
  const [customWidth, setCustomWidth] = useState<number>(0)
  const [customHeight, setCustomHeight] = useState<number>(0)
  const [customUnit, setCustomUnit] = useState<"px" | "cm" | "mm" | "inch">("px")
  const [dpi, setDpi] = useState<number>(72)

  // Percentage Tab
  const [percentage, setPercentage] = useState<number>(100)

  // Presets
  const [selectedSocial, setSelectedSocial] = useState<SocialPreset | null>(null)
  const [selectedPrint, setSelectedPrint] = useState<PrintPreset | null>(null)
  
  // Output Settings
  const [outputFormat, setOutputFormat] = useState<string>("same")
  const [outputQuality, setOutputQuality] = useState<number>(92)
  const [compressWhileResizing, setCompressWhileResizing] = useState(false)
  
  // History
  const [recentSizes, setRecentSizes] = useState<{w: number, h: number}[]>([])

  const ACCEPTED = "image/jpeg,image/png,image/webp,image/gif,image/bmp"

  const showToast = (msg: string) => setToastMessage(msg)

  useEffect(() => {
    const saved = localStorage.getItem("toolhive_resize_history")
    if (saved) {
      try { setRecentSizes(JSON.parse(saved)) } catch(e) {}
    }
    const savedTab = localStorage.getItem("toolhive_resize_tab")
    if (savedTab) setActiveTab(savedTab as TabMode)
  }, [])

  useEffect(() => {
    localStorage.setItem("toolhive_resize_tab", activeTab)
  }, [activeTab])

  // Get target dimensions in pixels based on current active tab
  const getTargetDimensions = useCallback((originalW: number, originalH: number) => {
    let targetW = originalW
    let targetH = originalH

    if (activeTab === "custom") {
      targetW = customUnit === "px" ? customWidth : 
                customUnit === "cm" ? cmToPixels(customWidth, dpi) :
                customUnit === "mm" ? mmToPixels(customWidth, dpi) : 
                inchToPixels(customWidth, dpi)
      targetH = customUnit === "px" ? customHeight :
                customUnit === "cm" ? cmToPixels(customHeight, dpi) :
                customUnit === "mm" ? mmToPixels(customHeight, dpi) :
                inchToPixels(customHeight, dpi)
    } else if (activeTab === "percentage") {
      targetW = Math.round(originalW * (percentage / 100))
      targetH = Math.round(originalH * (percentage / 100))
    } else if (activeTab === "social" && selectedSocial) {
      targetW = selectedSocial.width
      targetH = selectedSocial.height
    } else if (activeTab === "print" && selectedPrint) {
      targetW = cmToPixels(selectedPrint.widthCm, dpi)
      targetH = cmToPixels(selectedPrint.heightCm, dpi)
    }
    
    // Fallback if NaN or 0
    if (!targetW || isNaN(targetW)) targetW = originalW
    if (!targetH || isNaN(targetH)) targetH = originalH

    return { targetW, targetH }
  }, [activeTab, customWidth, customHeight, customUnit, dpi, percentage, selectedSocial, selectedPrint])

  // Handlers for inputs to respect aspect ratio lock
  const handleWidthChange = (val: number, origW: number, origH: number) => {
    setCustomWidth(val)
    if (lockAspectRatio && origW && origH) {
      setCustomHeight(Math.round((val / origW) * origH))
    }
  }

  const handleHeightChange = (val: number, origW: number, origH: number) => {
    setCustomHeight(val)
    if (lockAspectRatio && origW && origH) {
      setCustomWidth(Math.round((val / origH) * origW))
    }
  }

  // File loading
  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files).slice(0, 20 - images.length)
    if (fileArray.length === 0) return

    const newItems: ImageItem[] = []
    
    for (const file of fileArray) {
      if (!file.type.startsWith("image/")) continue
      if (file.size > 50 * 1024 * 1024) {
        showToast(`File ${file.name} is too large! Max 50MB.`)
        continue
      }
      
      const imgURL = URL.createObjectURL(file)
      
      const imgElement = new Image()
      await new Promise(resolve => {
        imgElement.onload = resolve
        imgElement.src = imgURL
      })

      newItems.push({
        id: crypto.randomUUID(),
        file,
        imgElement,
        preview: imgURL,
        result: null,
        status: "pending",
        dimensions: { width: imgElement.width, height: imgElement.height }
      })

      if (images.length === 0 && newItems.length === 1 && customWidth === 0) {
        setCustomWidth(imgElement.width)
        setCustomHeight(imgElement.height)
      }
    }

    setImages(prev => [...prev, ...newItems])
  }, [images, customWidth])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFiles(e.dataTransfer.files)
  }, [handleFiles])

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(i => i.id !== id))
  }

  const resetAll = () => setImages([])

  // Live Preview Debounce logic
  useEffect(() => {
    if (images.length === 0) return
    const timer = setTimeout(() => {
      setImages(prev => {
        return [...prev].map(img => {
          if (img.status !== "pending") return img
          const { targetW, targetH } = getTargetDimensions(img.dimensions.width, img.dimensions.height)
          
          if (img.imgElement && (targetW !== img.dimensions.width || targetH !== img.dimensions.height)) {
             // We can't do async inside setImages directly, so we'll fire async updates instead
             // In a real robust app, we'd manage this state better. For now we will update previewURL manually
             generatePreview(img.imgElement, targetW, targetH, outputFormat === "same" ? img.file.type : `image/${outputFormat}`, outputQuality / 100)
               .then(res => {
                  setImages(current => {
                    const idx = current.findIndex(c => c.id === img.id)
                    if (idx === -1) return current
                    const copy = [...current]
                    // revoke old
                    if (copy[idx].afterPreviewUrl) URL.revokeObjectURL(copy[idx].afterPreviewUrl!)
                    copy[idx] = { ...copy[idx], afterPreviewUrl: res.url, estimatedSize: res.estimatedSize }
                    return copy
                  })
               }).catch(e => {})
          }
          return img
        })
      })
    }, 300)
    return () => clearTimeout(timer)
  }, [images.length, activeTab, customWidth, customHeight, customUnit, dpi, percentage, selectedSocial, selectedPrint, outputFormat, outputQuality, getTargetDimensions])

  // Processing
  const processImages = async () => {
    const toProcess = images.filter(i => i.status === "pending")
    if (toProcess.length === 0) return

    // Update history if custom
    if (activeTab === "custom" && customUnit === "px") {
      const newHistory = [{w: customWidth, h: customHeight}, ...recentSizes.filter(s => s.w !== customWidth || s.h !== customHeight)].slice(0, 5)
      setRecentSizes(newHistory)
      localStorage.setItem("toolhive_resize_history", JSON.stringify(newHistory))
    }

    setImages(prev => prev.map(i => i.status === "pending" ? { ...i, status: "processing", result: null } : i))

    for (const item of toProcess) {
      const { targetW, targetH } = getTargetDimensions(item.dimensions.width, item.dimensions.height)
      
      let mime = item.file.type
      if (outputFormat !== "same") {
        mime = `image/${outputFormat}`
      }

      // Convert format "jpeg" etc to actual mime
      let formatParam = mime
      if (outputFormat === "jpeg") formatParam = "image/jpeg"
      else if (outputFormat === "png") formatParam = "image/png"
      else if (outputFormat === "webp") formatParam = "image/webp"

      try {
        const result = await resizeImage(item.file, {
          width: targetW,
          height: targetH,
          format: formatParam,
          quality: compressWhileResizing ? outputQuality / 100 : 0.92
        })

        setImages(prev => {
          const arr = [...prev]
          const idx = arr.findIndex(i => i.id === item.id)
          if (idx !== -1) arr[idx] = { ...arr[idx], status: "done", result }
          return arr
        })
      } catch (err: any) {
        setImages(prev => {
          const arr = [...prev]
          const idx = arr.findIndex(i => i.id === item.id)
          if (idx !== -1) arr[idx] = { ...arr[idx], status: "error", error: err.message }
          return arr
        })
      }
    }
    showToast("✓ All images processed!")
  }

  const downloadSingle = (result: ResizeResult) => {
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
    a.download = "toolhive_resized_images.zip"
    a.click()
    URL.revokeObjectURL(url)
    showToast("✓ ZIP Download started!")
  }

  // --- Rendering Helpers ---
  const firstImage = images.length > 0 ? images[0] : null
  const targetDims = firstImage ? getTargetDimensions(firstImage.dimensions.width, firstImage.dimensions.height) : { targetW: 0, targetH: 0 }
  
  const originalAspect = firstImage ? getAspectRatio(firstImage.dimensions.width, firstImage.dimensions.height) : "-"
  const newAspect = getAspectRatio(targetDims.targetW, targetDims.targetH)
  const aspectChanged = originalAspect !== newAspect

  const doneCount = images.filter((i) => i.status === "done").length
  const processingCount = images.filter((i) => i.status === "processing").length
  const allDone = images.length > 0 && doneCount === images.length

  const handleShortcut = useCallback((e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "s") {
      e.preventDefault()
      if (allDone) {
        if (images.length === 1) downloadSingle(images[0].result!)
        else downloadAllZip()
      } else if (images.length > 0 && processingCount === 0) {
        processImages()
      }
    }
  }, [allDone, images, processingCount])

  useEffect(() => {
    window.addEventListener("keydown", handleShortcut)
    return () => window.removeEventListener("keydown", handleShortcut)
  }, [handleShortcut])

  return (
    <>
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"
        onLoad={() => setJsZipLoaded(true)}
      />
      <Toast message={toastMessage} visible={!!toastMessage} onClose={() => setToastMessage("")} />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight className="size-3.5" />
          <Link href="/#image-tools" className="hover:text-foreground transition-colors">Image Tools</Link>
          <ChevronRight className="size-3.5" />
          <span className="text-foreground font-medium">Image Resizer</span>
        </nav>

        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold sm:text-4xl mb-3">
            Image Resizer — <span className="text-gradient">Resize Any Image Free</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Resize your images to exact pixel dimensions or percentage. Perfect for social media, websites, printing and more. Works 100% in your browser — your images never leave your device.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          
          {/* LEFT COLUMN */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Upload Zone */}
            <div
              className={`relative rounded-xl border-2 border-dashed transition-all duration-300 cursor-pointer ${
                isDragging ? "border-brand-orange bg-brand-orange/5 scale-[1.01]" : "border-border hover:border-brand-orange/50 hover:bg-muted/50 bg-card"
              }`}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
            >
              <input ref={inputRef} type="file" accept={ACCEPTED} multiple className="hidden" onChange={(e) => e.target.files && handleFiles(e.target.files)} />
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-brand-orange/10">
                  <Upload className="size-6 text-brand-orange" />
                </div>
                <p className="font-medium text-foreground mb-1">{isDragging ? "Drop images here!" : "Drag & drop images"}</p>
                <p className="text-sm text-muted-foreground mb-2">or click to browse</p>
                <Badge variant="secondary" className="text-[10px] font-normal">JPG, PNG, WebP, GIF, BMP • Max 50MB</Badge>
              </div>
            </div>

            {/* Resize Settings Panel */}
            <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
              <div className="flex overflow-x-auto hide-scrollbar border-b border-border bg-muted/30">
                {["custom", "percentage", "social", "print"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as TabMode)}
                    className={`flex-1 min-w-[90px] py-3 text-xs font-semibold uppercase tracking-wider transition-colors ${
                      activeTab === tab ? "border-b-2 border-brand-orange text-brand-orange bg-card" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="p-5">
                {/* Custom Tab */}
                {activeTab === "custom" && (
                  <div className="space-y-5 animate-in fade-in">
                    <div className="flex gap-4">
                      <div className="flex-1 space-y-1">
                        <label className="text-xs font-semibold text-muted-foreground uppercase">Width</label>
                        <div className="relative">
                          <input type="number" value={customWidth || ""} onChange={(e) => handleWidthChange(parseFloat(e.target.value)||0, firstImage?.dimensions.width||0, firstImage?.dimensions.height||0)} className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/50" />
                          <span className="absolute right-3 top-2 text-sm text-muted-foreground">{customUnit}</span>
                        </div>
                      </div>
                      
                      <button onClick={() => setLockAspectRatio(!lockAspectRatio)} className="mt-6 flex shrink-0 items-center justify-center size-9 rounded-md bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Lock Aspect Ratio">
                        {lockAspectRatio ? <LinkIcon className="size-4" /> : <Unlink className="size-4 opacity-50" />}
                      </button>

                      <div className="flex-1 space-y-1">
                        <label className="text-xs font-semibold text-muted-foreground uppercase">Height</label>
                        <div className="relative">
                          <input type="number" value={customHeight || ""} onChange={(e) => handleHeightChange(parseFloat(e.target.value)||0, firstImage?.dimensions.width||0, firstImage?.dimensions.height||0)} className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/50" />
                          <span className="absolute right-3 top-2 text-sm text-muted-foreground">{customUnit}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4 items-center">
                      <div className="flex bg-muted rounded-lg p-1">
                        {["px", "cm", "mm", "inch"].map(u => (
                          <button key={u} onClick={() => setCustomUnit(u as any)} className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${customUnit === u ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>{u}</button>
                        ))}
                      </div>
                      {customUnit !== "px" && (
                        <div className="flex items-center gap-2">
                          <label className="text-xs font-medium text-muted-foreground">DPI:</label>
                          <input type="number" value={dpi} onChange={(e) => setDpi(parseInt(e.target.value)||72)} className="w-16 bg-background border border-input rounded text-xs px-2 py-1 focus:outline-none focus:ring-1 focus:ring-brand-orange" />
                        </div>
                      )}
                    </div>

                    {recentSizes.length > 0 && (
                      <div className="pt-3 border-t border-border">
                        <p className="text-[10px] text-muted-foreground mb-2 uppercase tracking-wider">Recent Sizes</p>
                        <div className="flex flex-wrap gap-2">
                          {recentSizes.map((s, i) => (
                            <Badge key={i} variant="outline" className="cursor-pointer hover:border-brand-orange hover:text-brand-orange font-normal" onClick={() => {setCustomWidth(s.w); setCustomHeight(s.h); setCustomUnit("px")}}>
                              {s.w} × {s.h}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Percentage Tab */}
                {activeTab === "percentage" && (
                  <div className="space-y-6 animate-in fade-in">
                    <div className="flex items-end justify-between">
                      <span className="text-sm font-medium">Scale: <span className="text-brand-orange font-bold">{percentage}%</span></span>
                      <input type="number" value={percentage} onChange={(e) => setPercentage(Math.max(1, Math.min(500, parseInt(e.target.value)||100)))} className="w-20 bg-background border border-input rounded text-sm px-2 py-1 text-right" />
                    </div>
                    <Slider value={[percentage]} onValueChange={(v) => setPercentage(v[0])} min={1} max={200} step={1} />
                    <div className="flex flex-wrap gap-2">
                      {[25, 50, 75, 100, 150, 200].map(p => (
                        <Badge key={p} variant="outline" className="cursor-pointer hover:bg-brand-orange/10 hover:text-brand-orange hover:border-brand-orange/30 font-normal" onClick={() => setPercentage(p)}>{p}%</Badge>
                      ))}
                    </div>
                    {percentage > 100 && (
                      <div className="p-3 text-xs text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-900/50 flex gap-2">
                        <Info className="size-4 shrink-0" />
                        <span>Enlarging images may result in reduced quality or blurriness.</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Social Tab */}
                {activeTab === "social" && (
                  <div className="space-y-4 max-h-[300px] overflow-y-auto hide-scrollbar pr-2 animate-in fade-in">
                    {Array.from(new Set(SOCIAL_PRESETS.map(p => p.platform))).map(platform => (
                      <div key={platform} className="space-y-2">
                        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider sticky top-0 bg-card py-1 z-10">{SOCIAL_PRESETS.find(p=>p.platform===platform)?.emoji} {platform}</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {SOCIAL_PRESETS.filter(p => p.platform === platform).map(preset => {
                            const isSelected = selectedSocial?.name === preset.name && selectedSocial?.platform === preset.platform;
                            return (
                              <div key={preset.name} onClick={() => setSelectedSocial(preset)} className={`p-2 rounded-lg border text-sm cursor-pointer transition-colors ${isSelected ? "border-brand-orange bg-brand-orange/10 text-brand-orange" : "border-border hover:bg-muted"}`}>
                                <p className="font-medium truncate" title={preset.name}>{preset.name}</p>
                                <p className="text-xs opacity-80">{preset.width} × {preset.height} px</p>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Print Tab */}
                {activeTab === "print" && (
                  <div className="space-y-4 animate-in fade-in">
                    <div className="flex items-center gap-3 bg-muted/50 p-3 rounded-lg">
                      <label className="text-sm font-medium">Target DPI:</label>
                      <select value={dpi} onChange={(e) => setDpi(parseInt(e.target.value))} className="bg-background border border-input rounded text-sm px-2 py-1 focus:outline-none">
                        <option value="72">72 (Screen/Draft)</option>
                        <option value="150">150 (Good)</option>
                        <option value="300">300 (High Quality Print)</option>
                        <option value="600">600 (Pro Print)</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[250px] overflow-y-auto hide-scrollbar pr-2">
                      {PRINT_PRESETS.map(preset => {
                        const isSelected = selectedPrint?.name === preset.name;
                        return (
                          <div key={preset.name} onClick={() => setSelectedPrint(preset)} className={`p-2 rounded-lg border text-sm cursor-pointer transition-colors ${isSelected ? "border-brand-orange bg-brand-orange/10 text-brand-orange" : "border-border hover:bg-muted"}`}>
                            <p className="font-medium truncate">{preset.name}</p>
                            <p className="text-xs opacity-80">{preset.widthCm} × {preset.heightCm} cm</p>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Main Action Button */}
                <div className="pt-6 mt-4 border-t border-border">
                  <Button 
                    className="w-full h-12 text-base font-bold bg-brand-orange hover:bg-brand-orange-hover text-white cursor-pointer"
                    onClick={processImages}
                    disabled={images.length === 0 || processingCount > 0 || (images.length === 1 && firstImage?.dimensions.width === targetDims.targetW && firstImage?.dimensions.height === targetDims.targetH)}
                  >
                    {processingCount > 0 ? "Resizing..." : images.length > 0 ? `Resize ${images.length} Image${images.length>1?'s':''}` : "Upload an Image First"}
                  </Button>
                </div>
              </div>
            </div>

            {/* Output Settings */}
            <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
              <details className="group">
                <summary className="p-4 flex items-center justify-between cursor-pointer font-semibold text-sm bg-muted/20 hover:bg-muted/40 transition-colors list-none">
                  <span className="flex items-center gap-2"><Settings2 className="size-4 text-brand-orange" /> Output Settings</span>
                  <ChevronRight className="size-4 text-muted-foreground transition-transform group-open:rotate-90" />
                </summary>
                <div className="p-5 border-t border-border space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs font-medium">Output Format</label>
                    <div className="flex flex-wrap gap-2">
                      {[{v: "same", l: "Same as Input"}, {v: "jpeg", l: "JPEG"}, {v: "png", l: "PNG"}, {v: "webp", l: "WebP"}].map(f => (
                        <button key={f.v} onClick={() => setOutputFormat(f.v)} className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-all ${outputFormat === f.v ? 'border-brand-orange bg-brand-orange/10 text-brand-orange' : 'border-border bg-background hover:bg-muted'}`}>{f.l}</button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                      <input type="checkbox" checked={compressWhileResizing} onChange={e => setCompressWhileResizing(e.target.checked)} className="rounded border-border text-brand-orange focus:ring-brand-orange size-4" />
                      Compress Output Image
                    </label>
                    {compressWhileResizing && (
                      <div className="pl-6 space-y-3">
                        <div className="flex justify-between text-xs font-medium"><span>Quality</span><span>{outputQuality}%</span></div>
                        <Slider value={[outputQuality]} onValueChange={v => setOutputQuality(v[0])} min={40} max={100} step={1} />
                      </div>
                    )}
                  </div>
                </div>
              </details>
            </div>

            {/* Cross-link to Image Compressor */}
            <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
              <Link href="/image-compressor" className="flex items-center justify-between p-4 hover:bg-muted/40 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-lg bg-brand-orange/10 flex items-center justify-center">
                    <PackageOpen className="size-4 text-brand-orange" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold group-hover:text-brand-orange transition-colors">Need to compress?</p>
                    <p className="text-[10px] text-muted-foreground">Reduce file size with our Image Compressor →</p>
                  </div>
                </div>
                <ChevronRight className="size-4 text-muted-foreground group-hover:text-brand-orange group-hover:translate-x-0.5 transition-all" />
              </Link>
            </div>
            

          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-7">
            {images.length === 0 ? (
              <div className="h-full min-h-[500px] rounded-2xl border border-dashed border-border flex flex-col items-center justify-center text-muted-foreground bg-card/50">
                <ImageIcon className="size-16 mb-4 opacity-20" />
                <p>Upload an image to preview and resize</p>
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* Global Batch Controls */}
                {images.length > 1 && (
                  <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-card border border-border p-4 shadow-sm">
                    <div className="text-sm">
                      <span className="font-bold">{doneCount}/{images.length}</span> images resized
                    </div>
                    <div className="flex gap-2">
                      {doneCount > 1 && jsZipLoaded && (
                        <Button onClick={downloadAllZip} className="bg-brand-orange hover:bg-brand-orange-hover text-white h-9 px-4 text-sm cursor-pointer">
                          <PackageOpen className="size-4 mr-2" /> Download ZIP
                        </Button>
                      )}
                      <Button variant="outline" size="sm" onClick={resetAll} className="h-9 px-3 hover:text-destructive cursor-pointer">
                        Reset All
                      </Button>
                    </div>
                  </div>
                )}

                {/* Items List */}
                <div className="space-y-6">
                  {images.map((img) => (
                    <div key={img.id} className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
                      
                      {/* Header */}
                      <div className="p-3 sm:p-4 border-b border-border bg-muted/20 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="size-10 rounded overflow-hidden shrink-0 bg-muted">
                            <img src={img.preview} alt="" className="size-full object-cover" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold truncate">{img.file.name}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {img.dimensions.width} × {img.dimensions.height} px • {formatBytes(img.file.size)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 shrink-0">
                          {img.status === "done" && img.result && (
                            <Button size="sm" onClick={() => downloadSingle(img.result!)} className="bg-green-600 hover:bg-green-700 text-white h-8 px-3 cursor-pointer">
                              <Download className="size-3.5 mr-1.5" /> Download
                            </Button>
                          )}
                          <button onClick={() => removeImage(img.id)} className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors cursor-pointer" title="Remove">
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </div>

                      {/* Smart Estimator (Pre-process) */}
                      {img.status === "pending" && (
                        <div className="p-5 bg-card">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                            <div className="p-3 rounded-lg bg-muted/30 border border-border">
                              <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Target Size</p>
                              <p className="text-lg font-bold text-foreground">{targetDims.targetW} × {targetDims.targetH} <span className="text-xs font-normal text-muted-foreground">px</span></p>
                              <p className="text-xs mt-1 text-muted-foreground">Scale: {Math.round((targetDims.targetW / img.dimensions.width)*100)}%</p>
                            </div>
                            <div className="p-3 rounded-lg bg-muted/30 border border-border">
                              <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Estimated File Size</p>
                              <p className="text-lg font-bold text-brand-orange">{img.estimatedSize ? formatBytes(img.estimatedSize) : "~ Calculating..."}</p>
                              {img.estimatedSize && <p className="text-xs mt-1 text-muted-foreground">Was {formatBytes(img.file.size)}</p>}
                            </div>
                          </div>
                          
                          {aspectChanged && (
                            <div className="p-3 text-xs text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/10 rounded-lg border border-orange-200 dark:border-orange-900/30 mb-4 flex gap-2">
                              <Info className="size-4 shrink-0" />
                              <span>Aspect ratio changing from {originalAspect} to {newAspect}. Image will be stretched.</span>
                            </div>
                          )}

                          {images.length === 1 && img.afterPreviewUrl && (
                            <BeforeAfterSlider 
                              originalSrc={img.preview} 
                              compressedSrc={img.afterPreviewUrl} 
                              originalLabel="ORIGINAL" 
                              compressedLabel="PREVIEW" 
                            />
                          )}
                        </div>
                      )}

                      {/* Result State */}
                      {img.status === "done" && img.result && (
                        <div className="p-5">
                          <BeforeAfterSlider 
                            originalSrc={img.preview} 
                            compressedSrc={img.result.url} 
                            originalLabel="ORIGINAL" 
                            compressedLabel="RESIZED" 
                          />
                          <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900/30 rounded-lg flex flex-wrap items-center justify-between gap-3">
                            <span className="text-sm font-medium text-green-700 dark:text-green-400 flex items-center gap-2">
                              <CheckCircle2 className="size-4" /> Successfully resized to {img.result.newWidth} × {img.result.newHeight} px
                            </span>
                            <span className="text-xs font-medium text-muted-foreground">
                              Final size: {formatBytes(img.result.newSize)}
                            </span>
                          </div>
                        </div>
                      )}

                    </div>
                  ))}
                </div>
                
              </div>
            )}
          </div>
        </div>
        
        {/* SEO Content Section */}
        <div className="space-y-12 py-8 mt-12 border-t border-border">
          <section>
            <h2 className="font-heading text-2xl font-bold mb-6">How to Resize an Image Online</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { step: "1", title: "Upload Image", desc: "Drag and drop your JPG, PNG, or WebP image into the upload zone." },
                { step: "2", title: "Set Dimensions", desc: "Enter custom pixel dimensions, pick a percentage, or choose a social preset." },
                { step: "3", title: "Resize & Download", desc: "Click resize and instantly download your properly formatted image." },
              ].map((item) => (
                <div key={item.step} className="rounded-xl border border-border bg-card p-5 text-center">
                  <div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-full bg-brand-orange/10 text-brand-orange font-heading font-bold text-lg">{item.step}</div>
                  <h3 className="font-heading font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
             <h2 className="font-heading text-2xl font-bold mb-6">Frequently Asked Questions</h2>
             <div className="space-y-4">
               {[
                 { q: "Does resizing reduce image quality?", a: "Shrinking images maintains quality very well. However, enlarging an image beyond its original size (upscaling) may cause blurriness or pixelation as the browser uses bilinear interpolation." },
                 { q: "Is my image uploaded to any server?", a: "No. Everything runs entirely in your browser using HTML5 Canvas. Your image never leaves your device, ensuring 100% privacy." },
                 { q: "Can I resize without losing aspect ratio?", a: "Yes. Make sure the 'Lock Aspect Ratio' (chain link icon) is toggled on. When you change the width, we will automatically calculate the correct height to prevent stretching." },
                 { q: "What is DPI and when does it matter?", a: "DPI (Dots Per Inch) matters primarily for printing physical copies. Standard screens use 72 DPI, while high-quality prints require 300 DPI." },
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
