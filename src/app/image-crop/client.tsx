"use client"

import React, { useState, useRef, useEffect, useCallback } from "react"
import Link from "next/link"
import type CropperJS from "cropperjs"
import type { ReactCropperElement } from "react-cropper"
import dynamic from "next/dynamic"
const Cropper = dynamic(() => import("react-cropper"), { ssr: false })
import "cropperjs/dist/cropper.css"
import { ChevronRight, Upload, RotateCcw, RotateCw, FlipHorizontal, FlipVertical, ZoomIn, ZoomOut, CheckCircle2, AlertTriangle, Download, X, RefreshCw, Scissors, Image as ImageIcon, Link as LinkIcon, Link2Off } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"

const RATIOS = [
  { label: 'Free', value: NaN },
  { label: '1:1', value: 1 },
  { label: '4:3', value: 4/3 },
  { label: '3:4', value: 3/4 },
  { label: '16:9', value: 16/9 },
  { label: '9:16', value: 9/16 },
  { label: '3:2', value: 3/2 },
  { label: '2:3', value: 2/3 },
  { label: '5:4', value: 5/4 },
  { label: '4:5', value: 4/5 },
]

const SOCIAL_RATIOS = [
  { label: '📷 Instagram Post 1:1', value: 1 },
  { label: '📱 Instagram Story 9:16', value: 9/16 },
  { label: '📘 Facebook Cover 820:312', value: 820/312 },
  { label: '▶ YouTube Thumb 16:9', value: 16/9 },
  { label: '🐦 Twitter Header 3:1', value: 3 },
  { label: '💼 LinkedIn Banner 4:1', value: 4 },
  { label: '⊙ Profile Picture 1:1', value: 1 },
]

// 35x45mm is standard for many passports
const PASSPORT_RATIO = 35/45

export default function ImageCropClient() {
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState<string>("")
  const cropperRef = useRef<ReactCropperElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [aspectRatio, setAspectRatio] = useState<number>(NaN)
  const [activePreset, setActivePreset] = useState<string>('Free')
  const [isCircularMode, setIsCircularMode] = useState(false)
  
  const [cropBoxData, setCropBoxData] = useState({ width: 0, height: 0, x: 0, y: 0 })
  const [lockRatio, setLockRatio] = useState(false)
  
  const [rotation, setRotation] = useState(0)
  const [zoomLevel, setZoomLevel] = useState(1.0)
  
  const [previewUrl, setPreviewUrl] = useState<string>("")
  const [outputFormat, setOutputFormat] = useState('Same as input')
  const [outputQuality, setOutputQuality] = useState(92)
  const [outputFilename, setOutputFilename] = useState('')
  
  const [toastMessage, setToastMessage] = useState("")
  const [hasGifWarning, setHasGifWarning] = useState(false)
  const [isDone, setIsDone] = useState(false)
  const [finalSize, setFinalSize] = useState({ kb: 0, w: 0, h: 0 })

  const ACCEPTED = "image/jpeg,image/png,image/webp,image/gif"

  const formatMap: Record<string, string> = {
    'JPG': 'image/jpeg',
    'PNG': 'image/png',
    'WebP': 'image/webp'
  }
  
  const extMap: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif'
  }

  useEffect(() => {
    if (toastMessage) {
      const t = setTimeout(() => setToastMessage(""), 3000)
      return () => clearTimeout(t)
    }
  }, [toastMessage])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const cropper = cropperRef.current?.cropper
      if (!cropper) return
      // Don't trigger if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      
      switch(e.key.toLowerCase()) {
        case 'r': cropper.rotate(90); break;
        case 'l': cropper.rotate(-90); break;
        case 'h': {
          const data = cropper.getData()
          cropper.scaleX(-data.scaleX || -1)
          break;
        }
        case 'v': {
          const data = cropper.getData()
          cropper.scaleY(-data.scaleY || -1)
          break;
        }
        case 'escape': cropper.reset(); break;
        case 'enter': cropAndDownload(); break;
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setToastMessage("⚠ Please upload a valid image file")
      return
    }
    if (file.size > 50 * 1024 * 1024) {
      setToastMessage("⚠ File too large. Max 50MB supported.")
      return
    }

    setHasGifWarning(file.type === 'image/gif')
    setImageFile(file)
    setImageUrl(URL.createObjectURL(file))
    setOutputFilename(file.name.replace(/\.[^/.]+$/, '') + '_cropped')
    
    // Default format logic
    if (file.type === 'image/jpeg') setOutputFormat('JPG')
    else if (file.type === 'image/png') setOutputFormat('PNG')
    else if (file.type === 'image/webp') setOutputFormat('WebP')
    else setOutputFormat('Same as input')

    setIsDone(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const onCrop = () => {
    const cropper = cropperRef.current?.cropper
    if (!cropper) return
    const data = cropper.getData(true) // true = rounded values
    setCropBoxData({
      width: data.width,
      height: data.height,
      x: data.x,
      y: data.y
    })
    
    // Throttle preview updates slightly to keep UI snappy
    const croppedCanvas = cropper.getCroppedCanvas({
      maxWidth: 400,
      maxHeight: 400,
    })
    if (croppedCanvas) {
      setPreviewUrl(croppedCanvas.toDataURL())
    }
  }

  const setRatio = (label: string, value: number) => {
    setActivePreset(label)
    setAspectRatio(value)
    
    const cropper = cropperRef.current?.cropper
    if (label === '⬭ Circular Crop') {
      setIsCircularMode(true)
      if (cropper) cropper.setAspectRatio(1)
    } else if (label === '🪪 Passport Photo') {
      setIsCircularMode(false)
      if (cropper) cropper.setAspectRatio(PASSPORT_RATIO)
    } else {
      setIsCircularMode(false)
      if (cropper) cropper.setAspectRatio(value)
    }
  }

  const handleCustomSizeChange = (key: 'width' | 'height' | 'x' | 'y', value: number) => {
    const cropper = cropperRef.current?.cropper
    if (!cropper || isNaN(value)) return
    
    const data = cropper.getData()
    let newWidth = key === 'width' ? value : data.width
    let newHeight = key === 'height' ? value : data.height
    
    if (lockRatio) {
      const currentRatio = data.width / data.height
      if (key === 'width') {
        newHeight = newWidth / currentRatio
      } else if (key === 'height') {
        newWidth = newHeight * currentRatio
      }
    }
    
    cropper.setData({
      ...data,
      width: newWidth,
      height: newHeight,
      x: key === 'x' ? value : data.x,
      y: key === 'y' ? value : data.y,
    })
  }

  const getCroppedCircle = (cropperInstance: CropperJS) => {
    const canvas = cropperInstance.getCroppedCanvas()
    const size = Math.min(canvas.width, canvas.height)
    
    const circleCanvas = document.createElement('canvas')
    circleCanvas.width = size
    circleCanvas.height = size
    const ctx = circleCanvas.getContext('2d')
    if (!ctx) return canvas
    
    ctx.beginPath()
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2)
    ctx.closePath()
    ctx.clip()
    
    const offsetX = (size - canvas.width) / 2
    const offsetY = (size - canvas.height) / 2
    ctx.drawImage(canvas, offsetX, offsetY)
    
    return circleCanvas
  }

  const createPassportPrintSheet = (croppedCanvas: HTMLCanvasElement) => {
    // 4x6 inch sheet at 300dpi = 1200x1800px
    const sheetCanvas = document.createElement('canvas')
    sheetCanvas.width = 1200
    sheetCanvas.height = 1800
    const ctx = sheetCanvas.getContext('2d')
    if (!ctx) return
    
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, 1200, 1800)
    
    // India passport: 35x45mm at 300dpi approx 413x531px
    const photoW = 413
    const photoH = 531
    // Center the 2x3 grid on the 1200x1800 canvas
    const marginX = (1200 - (photoW * 2 + 50)) / 2
    const marginY = (1800 - (photoH * 3 + 100)) / 2
    const gapX = 50
    const gapY = 50
    
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 2; col++) {
        const x = marginX + col * (photoW + gapX)
        const y = marginY + row * (photoH + gapY)
        
        // Draw slight border around photo to help cutting
        ctx.strokeStyle = '#CCCCCC'
        ctx.lineWidth = 1
        ctx.strokeRect(x - 1, y - 1, photoW + 2, photoH + 2)
        
        ctx.drawImage(croppedCanvas, x, y, photoW, photoH)
      }
    }
    
    sheetCanvas.toBlob((blob) => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'passport_photos_print_4x6.jpg'
      a.click()
      URL.revokeObjectURL(url)
      setToastMessage("✓ Print sheet downloaded!")
    }, 'image/jpeg', 0.95)
  }

  const cropAndDownload = () => {
    const cropper = cropperRef.current?.cropper
    if (!cropper || !imageFile) return
    
    const data = cropper.getData()
    if (data.width < 10 || data.height < 10) {
      setToastMessage("⚠ Crop area too small. Please resize the crop box.")
      return
    }

    let canvas: HTMLCanvasElement
    if (isCircularMode) {
      canvas = getCroppedCircle(cropper)
    } else {
      canvas = cropper.getCroppedCanvas({
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high',
      })
    }

    // Determine final format
    let targetMime = imageFile.type
    if (isCircularMode) {
      targetMime = 'image/png' // Force PNG for circular transparency
    } else if (outputFormat !== 'Same as input') {
      targetMime = formatMap[outputFormat]
    }
    
    const isLossy = targetMime === 'image/jpeg' || targetMime === 'image/webp'
    const qualityValue = isLossy ? outputQuality / 100 : undefined

    canvas.toBlob((blob) => {
      if (!blob) {
        setToastMessage("⚠ Failed to generate image.")
        return
      }
      
      const ext = extMap[targetMime] || 'png'
      const finalName = outputFilename ? `${outputFilename}.${ext}` : `cropped.${ext}`
      
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = finalName
      a.click()
      URL.revokeObjectURL(url)
      
      setFinalSize({ kb: blob.size, w: canvas.width, h: canvas.height })
      setIsDone(true)
      setToastMessage("✓ Image cropped and downloaded!")
      
    }, targetMime, qualityValue)
  }

  const downloadPrintSheet = () => {
    const cropper = cropperRef.current?.cropper
    if (!cropper) return
    const canvas = cropper.getCroppedCanvas({
      imageSmoothingEnabled: true,
      imageSmoothingQuality: 'high',
    })
    createPassportPrintSheet(canvas)
  }

  const resetAll = () => {
    setImageFile(null)
    setImageUrl("")
    setPreviewUrl("")
    setIsDone(false)
  }

  const resetCrop = () => {
    const cropper = cropperRef.current?.cropper
    if (cropper) cropper.reset()
    setIsDone(false)
  }

  return (
    <>
      {/* TOAST */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 z-50 animate-in fade-in slide-in-from-bottom-4 flex items-center gap-2 bg-card border border-border shadow-lg rounded-lg px-4 py-3">
          {toastMessage.startsWith('✓') ? <CheckCircle2 className="size-5 text-green-500" /> : <AlertTriangle className="size-5 text-amber-500" />}
          <span className="text-sm font-medium">{toastMessage.replace(/^[✓⚠]\s*/, '')}</span>
        </div>
      )}

      {/* STYLES FOR CIRCULAR MODE */}
      <style dangerouslySetInnerHTML={{__html: `
        .circular-mode .cropper-view-box,
        .circular-mode .cropper-face {
          border-radius: 50%;
        }
        .cropper-line, .cropper-point {
          background-color: #F97316 !important;
        }
        .cropper-view-box {
          outline-color: #F97316 !important;
        }
      `}} />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        
        {/* BREADCRUMB & HEADER */}
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight className="size-3.5" />
          <Link href="/#image-tools" className="hover:text-foreground transition-colors">Image Tools</Link>
          <ChevronRight className="size-3.5" />
          <span className="text-foreground font-medium">Image Cropper</span>
        </nav>

        <div className="mb-8 text-center max-w-3xl mx-auto">
          <h1 className="font-heading text-3xl font-bold sm:text-4xl sm:leading-[1.1] mb-3">
            Image Cropper — <span className="text-gradient">Crop Any Image Free Online</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Crop your images to any size or shape instantly in your browser. Choose from preset aspect ratios, social media sizes, or circular crop — no signup, no watermark, 100% free.
          </p>
        </div>

        {/* UPLOAD ZONE */}
        {!imageUrl && (
          <div className="max-w-4xl mx-auto animate-in fade-in zoom-in-95">
            <div
              className={`relative rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer overflow-hidden ${
                isDragging ? "border-brand-orange bg-brand-orange/5 scale-[1.01]" : "border-border hover:border-brand-orange/50 hover:bg-muted/50 bg-card"
              }`}
              style={{ minHeight: '400px' }}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input ref={fileInputRef} type="file" accept={ACCEPTED} className="hidden" onChange={(e) => e.target.files && handleFile(e.target.files[0])} />
              
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10 pointer-events-none">
                <div className="mb-6 flex size-20 items-center justify-center rounded-3xl bg-brand-orange/10 text-brand-orange shadow-inner">
                  <Scissors className="size-10" />
                </div>
                <h3 className="font-heading text-2xl font-bold mb-2">Drop your image here to crop</h3>
                <p className="text-muted-foreground mb-6">or click to browse from your device</p>
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground bg-background/50 px-3 py-1.5 rounded-full border border-border">
                  <span>JPG, PNG, WebP, GIF</span>
                  <span className="w-1 h-1 rounded-full bg-border"></span>
                  <span>Max 50MB</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CROPPER WORKSPACE */}
        {imageUrl && (
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-8 animate-in fade-in">
            
            {/* LEFT COLUMN: Cropper & Tools */}
            <div className="space-y-6 min-w-0">
              
              {/* Toolbar Top: Aspect Ratios */}
              <div className="rounded-xl border border-border bg-card shadow-sm p-4 space-y-4 overflow-hidden">
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap mr-2">Standard</span>
                  {RATIOS.map(r => (
                    <button
                      key={r.label}
                      onClick={() => setRatio(r.label, r.value)}
                      className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${activePreset === r.label ? 'bg-brand-orange text-white border-brand-orange shadow-md' : 'bg-background hover:bg-muted text-foreground border-border'}`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap mr-2">Social</span>
                  {SOCIAL_RATIOS.map(r => (
                    <button
                      key={r.label}
                      onClick={() => setRatio(r.label, r.value)}
                      className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${activePreset === r.label ? 'bg-brand-orange text-white border-brand-orange shadow-md' : 'bg-background hover:bg-muted text-foreground border-border'}`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap mr-2">Special</span>
                  <button
                    onClick={() => setRatio('⬭ Circular Crop', 1)}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${activePreset === '⬭ Circular Crop' ? 'bg-brand-orange text-white border-brand-orange shadow-md' : 'bg-background hover:bg-brand-orange/10 text-brand-orange border-brand-orange/30'}`}
                  >
                    ⬭ Circular Crop
                  </button>
                  <button
                    onClick={() => setRatio('🪪 Passport Photo', PASSPORT_RATIO)}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${activePreset === '🪪 Passport Photo' ? 'bg-brand-orange text-white border-brand-orange shadow-md' : 'bg-background hover:bg-brand-orange/10 text-brand-orange border-brand-orange/30'}`}
                  >
                    🪪 Passport Photo
                  </button>
                </div>
              </div>

              {/* Main Cropper Component */}
              <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden relative">
                
                {/* Overlay Badge */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-black/70 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-medium font-mono border border-white/10 shadow-xl pointer-events-none">
                  {Math.round(cropBoxData.width)} × {Math.round(cropBoxData.height)} px
                </div>

                <div className={`w-full bg-[#111] ${isCircularMode ? 'circular-mode' : ''}`}>
                  <Cropper
                    ref={cropperRef}
                    src={imageUrl}
                    style={{ height: 500, width: "100%" }}
                    aspectRatio={aspectRatio}
                    guides={true}
                    background={true}
                    responsive={true}
                    autoCropArea={0.8}
                    checkOrientation={false}
                    viewMode={1}
                    dragMode="move"
                    cropBoxMovable={true}
                    cropBoxResizable={true}
                    toggleDragModeOnDblclick={true}
                    crop={onCrop}
                    zoom={(e) => setZoomLevel(e.detail.ratio)}
                  />
                </div>
                
                {/* Bottom Toolbar: Transform */}
                <div className="bg-muted/30 border-t border-border p-3 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={() => cropperRef.current?.cropper?.rotate(-90)} title="Rotate Left (L)"><RotateCcw className="size-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => cropperRef.current?.cropper?.rotate(90)} title="Rotate Right (R)"><RotateCw className="size-4" /></Button>
                    <div className="w-px h-6 bg-border mx-1"></div>
                    <Button variant="ghost" size="icon" onClick={() => {const c = cropperRef.current?.cropper; const d = c?.getData(); c?.scaleX(-(d?.scaleX || -1))}} title="Flip Horizontal (H)"><FlipHorizontal className="size-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => {const c = cropperRef.current?.cropper; const d = c?.getData(); c?.scaleY(-(d?.scaleY || -1))}} title="Flip Vertical (V)"><FlipVertical className="size-4" /></Button>
                    <div className="w-px h-6 bg-border mx-1"></div>
                    <Button variant="ghost" size="icon" onClick={() => cropperRef.current?.cropper?.reset()} title="Reset All (Esc)"><RefreshCw className="size-4" /></Button>
                  </div>
                  
                  <div className="flex items-center gap-3 min-w-[200px]">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => cropperRef.current?.cropper?.zoom(-0.1)}><ZoomOut className="size-3.5" /></Button>
                    <Slider value={[zoomLevel]} min={0.1} max={3.0} step={0.1} onValueChange={(v) => cropperRef.current?.cropper?.zoomTo((v as number[])[0])} className="flex-1" />
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => cropperRef.current?.cropper?.zoom(0.1)}><ZoomIn className="size-3.5" /></Button>
                    <span className="text-xs font-mono w-10 text-right">{Math.round(zoomLevel * 100)}%</span>
                  </div>
                </div>
              </div>

              {/* Warning Messages */}
              {(hasGifWarning || (cropBoxData.width < 50 && cropBoxData.width > 0)) && (
                <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-4 text-sm text-amber-600 dark:text-amber-400 flex items-start gap-3">
                  <AlertTriangle className="size-5 flex-shrink-0 mt-0.5" />
                  <div>
                    {hasGifWarning && <p className="font-medium">GIF images will be cropped as a static image (first frame only). Animation will not be preserved.</p>}
                    {cropBoxData.width < 50 && cropBoxData.width > 0 && <p className="font-medium">The crop area is very small. The resulting image may appear pixelated.</p>}
                  </div>
                </div>
              )}

              {/* Success State */}
              {isDone && (
                <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-2">
                  <div className="flex items-center gap-3 text-green-600 dark:text-green-400">
                    <CheckCircle2 className="size-5" />
                    <span className="font-medium">Cropped successfully! Size: {Math.round(finalSize.w)} × {Math.round(finalSize.h)} px | {(finalSize.kb / 1024).toFixed(1)} KB</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={resetCrop} className="bg-background">Crop Another Area</Button>
                    <Button variant="outline" size="sm" onClick={resetAll} className="bg-background">Upload New Image</Button>
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: Settings & Preview */}
            <div className="space-y-6">
              
              {/* Preview Box */}
              <div className="rounded-xl border border-border bg-card shadow-sm p-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Live Preview</h3>
                <div className="bg-muted rounded-lg border border-border overflow-hidden checkered-bg flex items-center justify-center p-4 min-h-[200px]">
                  {previewUrl ? (
                    <div style={{
                      width: isCircularMode ? 180 : '100%',
                      height: isCircularMode ? 180 : 'auto',
                      borderRadius: isCircularMode ? '50%' : '0',
                      overflow: 'hidden',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}>
                      <img src={previewUrl} alt="Live Crop Preview" className="w-full h-full object-cover block" />
                    </div>
                  ) : (
                    <ImageIcon className="size-8 text-muted-foreground/30" />
                  )}
                </div>
                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Output Dimensions:</span>
                  <span className="font-mono font-medium text-foreground">{Math.round(cropBoxData.width)} × {Math.round(cropBoxData.height)} px</span>
                </div>
                {activePreset === '🪪 Passport Photo' && (
                  <Button variant="secondary" className="w-full mt-4 text-xs font-semibold h-9 bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white" onClick={downloadPrintSheet}>
                    <Download className="size-3.5 mr-2" /> Download 4×6 Print Sheet
                  </Button>
                )}
              </div>

              {/* Exact Dimensions Input */}
              <div className="rounded-xl border border-border bg-card shadow-sm p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Custom Size (px)</h3>
                  <button onClick={() => setLockRatio(!lockRatio)} className={`p-1.5 rounded-md transition-colors ${lockRatio ? 'bg-brand-orange/10 text-brand-orange' : 'text-muted-foreground hover:bg-muted'}`} title="Lock aspect ratio">
                    {lockRatio ? <LinkIcon className="size-4" /> : <Link2Off className="size-4" />}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className="text-[10px] uppercase text-muted-foreground block mb-1">Width</label>
                    <input type="number" className="w-full bg-background border border-input rounded-md text-sm px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-orange font-mono" value={Math.round(cropBoxData.width)} onChange={(e) => handleCustomSizeChange('width', parseInt(e.target.value))} />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase text-muted-foreground block mb-1">Height</label>
                    <input type="number" className="w-full bg-background border border-input rounded-md text-sm px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-orange font-mono" value={Math.round(cropBoxData.height)} onChange={(e) => handleCustomSizeChange('height', parseInt(e.target.value))} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] uppercase text-muted-foreground block mb-1">X Pos</label>
                    <input type="number" className="w-full bg-background border border-input rounded-md text-sm px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-orange font-mono" value={Math.round(cropBoxData.x)} onChange={(e) => handleCustomSizeChange('x', parseInt(e.target.value))} />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase text-muted-foreground block mb-1">Y Pos</label>
                    <input type="number" className="w-full bg-background border border-input rounded-md text-sm px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-orange font-mono" value={Math.round(cropBoxData.y)} onChange={(e) => handleCustomSizeChange('y', parseInt(e.target.value))} />
                  </div>
                </div>
              </div>

              {/* Output Settings */}
              <div className="rounded-xl border border-border bg-card shadow-sm p-4 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Output Settings</h3>
                
                <div>
                  <label className="text-[10px] uppercase text-muted-foreground block mb-1.5">Format</label>
                  <select 
                    value={outputFormat}
                    onChange={(e) => setOutputFormat(e.target.value)}
                    disabled={isCircularMode}
                    className="w-full bg-background border border-input rounded-md text-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-brand-orange disabled:opacity-50"
                  >
                    <option>Same as input</option>
                    <option>JPG</option>
                    <option>PNG</option>
                    <option>WebP</option>
                  </select>
                  {isCircularMode && <p className="text-[10px] text-brand-orange mt-1">Locked to PNG for transparent corners.</p>}
                </div>

                {(outputFormat === 'JPG' || outputFormat === 'WebP' || (!isCircularMode && outputFormat === 'Same as input' && (imageFile?.type === 'image/jpeg' || imageFile?.type === 'image/webp'))) && (
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-[10px] uppercase text-muted-foreground block">Quality: {outputQuality}%</label>
                    </div>
                    <Slider value={[outputQuality]} min={60} max={100} step={1} onValueChange={(v) => setOutputQuality((v as number[])[0])} />
                  </div>
                )}

                <div>
                  <label className="text-[10px] uppercase text-muted-foreground block mb-1.5">Filename</label>
                  <input 
                    type="text" 
                    className="w-full bg-background border border-input rounded-md text-sm px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-orange" 
                    value={outputFilename} 
                    onChange={(e) => setOutputFilename(e.target.value)} 
                    placeholder="cropped_image"
                  />
                </div>

                <Button 
                  onClick={cropAndDownload} 
                  className="w-full h-12 text-base font-bold bg-brand-orange hover:bg-brand-orange-hover text-white shadow-md shadow-brand-orange/20"
                >
                  <Scissors className="size-5 mr-2" />
                  Crop & Download
                </Button>

              </div>
            </div>

          </div>
        )}

      </div>
    </>
  )
}
