"use client"

import React, { useState, useRef, useEffect, useCallback } from "react"
import Link from "next/link"
import Script from "next/script"
import { ChevronRight, Upload, Download, Settings2, Image as ImageIcon, CheckCircle2, AlertTriangle, RefreshCw, LayoutTemplate, SquareDashed, Users, UserSquare2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { removeBackground } from "@imgly/background-removal"

// Types
type BlurTab = 'full' | 'area' | 'bg' | 'face'
type FullBlurType = 'gaussian' | 'pixelate' | 'motion'

interface Region {
  id: string
  x: number
  y: number
  w: number
  h: number
  strength: number
  type: 'pixelate' | 'gaussian'
}

declare global {
  interface Window {
    faceapi: any
  }
}

// --- ALGORITHMS ---

function applyPixelate(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, strength: number) {
  const blockSize = Math.max(2, strength)
  const imageData = ctx.getImageData(x, y, w, h)
  const data = imageData.data
  
  for (let py = 0; py < h; py += blockSize) {
    for (let px = 0; px < w; px += blockSize) {
      let r = 0, g = 0, b = 0, count = 0
      for (let dy = 0; dy < blockSize && py + dy < h; dy++) {
        for (let dx = 0; dx < blockSize && px + dx < w; dx++) {
          const idx = ((py + dy) * w + (px + dx)) * 4
          r += data[idx]; g += data[idx + 1]; b += data[idx + 2]; count++
        }
      }
      r = Math.round(r / count)
      g = Math.round(g / count)
      b = Math.round(b / count)
      
      for (let dy = 0; dy < blockSize && py + dy < h; dy++) {
        for (let dx = 0; dx < blockSize && px + dx < w; dx++) {
          const idx = ((py + dy) * w + (px + dx)) * 4
          data[idx] = r; data[idx + 1] = g; data[idx + 2] = b
        }
      }
    }
  }
  ctx.putImageData(imageData, x, y)
}

function applyGaussianRegion(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, x: number, y: number, w: number, h: number, strength: number) {
  // Extract region
  const temp = document.createElement('canvas')
  temp.width = w
  temp.height = h
  const tCtx = temp.getContext('2d')
  if (!tCtx) return
  tCtx.putImageData(ctx.getImageData(x, y, w, h), 0, 0)
  
  // Draw back with filter
  ctx.save()
  ctx.beginPath()
  ctx.rect(x, y, w, h)
  ctx.clip()
  ctx.filter = `blur(${strength}px)`
  // We need to draw a bit larger to avoid edge artifacts from the blur
  ctx.drawImage(temp, x - strength, y - strength, w + strength*2, h + strength*2)
  ctx.restore()
}


export default function ImageBlurClient() {
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>("")
  const [originalDims, setOriginalDims] = useState({ w: 0, h: 0 })
  const [baseImg, setBaseImg] = useState<HTMLImageElement | null>(null)
  
  const [activeTab, setActiveTab] = useState<BlurTab>('full')
  
  // Full Blur state
  const [fullBlurType, setFullBlurType] = useState<FullBlurType>('gaussian')
  const [fullBlurStr, setFullBlurStr] = useState(10)
  
  // Area Blur state
  const [regions, setRegions] = useState<Region[]>([])
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawStart, setDrawStart] = useState({ x: 0, y: 0 })
  const [drawCurrent, setDrawCurrent] = useState({ x: 0, y: 0 })
  const [areaStr, setAreaStr] = useState(20)
  const [areaType, setAreaType] = useState<'pixelate' | 'gaussian'>('pixelate')
  
  // Process State
  const [isProcessing, setIsProcessing] = useState(false)
  const [progressMsg, setProgressMsg] = useState("")
  
  const [resultUrl, setResultUrl] = useState<string>("")
  const [resultSize, setResultSize] = useState(0)
  const [outputFormat, setOutputFormat] = useState<'image/jpeg' | 'image/png' | 'image/webp'>('image/jpeg')
  
  const [isDragging, setIsDragging] = useState(false)
  const [toastMsg, setToastMsg] = useState("")
  const [sliderPos, setSliderPos] = useState(50)
  const [isSliding, setIsSliding] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const sliderRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const interactRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (toastMsg) {
      const t = setTimeout(() => setToastMsg(""), 3000)
      return () => clearTimeout(t)
    }
  }, [toastMsg])

  // Slider events
  const handleMove = useCallback((clientX: number) => {
    if (!sliderRef.current) return
    const rect = sliderRef.current.getBoundingClientRect()
    let x = ((clientX - rect.left) / rect.width) * 100
    x = Math.min(Math.max(x, 0), 100)
    setSliderPos(x)
  }, [])

  useEffect(() => {
    if (isSliding) {
      const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX)
      const handleTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientX)
      const handleEnd = () => setIsSliding(false)
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('touchmove', handleTouchMove, { passive: false })
      window.addEventListener('mouseup', handleEnd)
      window.addEventListener('touchend', handleEnd)
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('touchmove', handleTouchMove)
        window.removeEventListener('mouseup', handleEnd)
        window.removeEventListener('touchend', handleEnd)
      }
    }
  }, [isSliding, handleMove])

  const showToast = (msg: string) => setToastMsg(msg)

  const handleFiles = (files: FileList | null) => {
    if (!files || !files.length) return
    const f = files[0]
    if (!f.type.startsWith('image/')) {
      showToast("⚠ Please upload an image file")
      return
    }
    if (f.size > 50 * 1024 * 1024) {
      showToast("⚠ File is too large. Max 50MB.")
      return
    }

    const url = URL.createObjectURL(f)
    const img = new Image()
    img.crossOrigin = "Anonymous"
    img.onload = () => {
      setOriginalDims({ w: img.width, h: img.height })
      setBaseImg(img)
      setFile(f)
      setPreviewUrl(url)
      setResultUrl("") 
      setRegions([])
      setOutputFormat(f.type === 'image/png' ? 'image/png' : 'image/jpeg')
    }
    img.src = url
  }

  // Draw interaction for area blur
  const getCanvasPos = (e: React.MouseEvent | React.TouchEvent) => {
    if (!interactRef.current || !baseImg) return { x: 0, y: 0 }
    const rect = interactRef.current.getBoundingClientRect()
    let clientX, clientY
    if ('touches' in e) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      clientX = (e as React.MouseEvent).clientX
      clientY = (e as React.MouseEvent).clientY
    }
    const scaleX = baseImg.width / rect.width
    const scaleY = baseImg.height / rect.height
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    }
  }

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    if (activeTab !== 'area' || resultUrl) return
    setIsDrawing(true)
    const pos = getCanvasPos(e)
    setDrawStart(pos)
    setDrawCurrent(pos)
  }

  const doDraw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return
    setDrawCurrent(getCanvasPos(e))
  }

  const endDraw = () => {
    if (!isDrawing) return
    setIsDrawing(false)
    const x = Math.min(drawStart.x, drawCurrent.x)
    const y = Math.min(drawStart.y, drawCurrent.y)
    const w = Math.abs(drawCurrent.x - drawStart.x)
    const h = Math.abs(drawCurrent.y - drawStart.y)
    
    if (w > 10 && h > 10) {
      setRegions(prev => [...prev, {
        id: crypto.randomUUID(),
        x, y, w, h, strength: areaStr, type: areaType
      }])
    }
  }

  // PROCESSING

  const processFullBlur = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    if (fullBlurType === 'gaussian') {
      // Two-canvas approach: filter on temp, then draw result to output
      const tmp = document.createElement('canvas')
      tmp.width = canvas.width; tmp.height = canvas.height
      const tmpCtx = tmp.getContext('2d')!
      tmpCtx.filter = `blur(${fullBlurStr}px)`
      tmpCtx.drawImage(baseImg!, 0, 0)
      ctx.drawImage(tmp, 0, 0)
    } else if (fullBlurType === 'pixelate') {
      ctx.drawImage(baseImg!, 0, 0)
      applyPixelate(ctx, 0, 0, canvas.width, canvas.height, fullBlurStr)
    } else if (fullBlurType === 'motion') {
      // Draw base image first, then overlay shifted copies
      ctx.drawImage(baseImg!, 0, 0)
      const passes = Math.max(2, fullBlurStr)
      ctx.globalAlpha = 0.15
      for (let i = 1; i <= passes; i++) {
        ctx.drawImage(baseImg!, i * 2, 0)
      }
      ctx.globalAlpha = 1
    }
  }

  const processAreaBlur = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    ctx.drawImage(baseImg!, 0, 0)
    regions.forEach(r => {
      if (r.type === 'pixelate') {
        applyPixelate(ctx, Math.round(r.x), Math.round(r.y), Math.round(r.w), Math.round(r.h), r.strength)
      } else {
        // Two-canvas: draw original to tmp with blur filter, then clip-paste region
        const src = document.createElement('canvas')
        src.width = canvas.width; src.height = canvas.height
        const srcCtx = src.getContext('2d')!
        srcCtx.drawImage(baseImg!, 0, 0)

        const blurred = document.createElement('canvas')
        blurred.width = canvas.width; blurred.height = canvas.height
        const blurCtx = blurred.getContext('2d')!
        blurCtx.filter = `blur(${r.strength}px)`
        blurCtx.drawImage(src, 0, 0)

        ctx.save()
        ctx.beginPath()
        ctx.rect(r.x, r.y, r.w, r.h)
        ctx.clip()
        ctx.drawImage(blurred, 0, 0)
        ctx.restore()
      }
    })
  }

  const processBgBlur = async (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    if (!file) throw new Error("No file")
    setProgressMsg("Removing background to find subject...")
    
    const bgBlob = await removeBackground(file)
    const subjectImg = new Image()
    subjectImg.src = URL.createObjectURL(bgBlob)
    await new Promise(r => subjectImg.onload = r)
    
    setProgressMsg("Applying heavy blur to background...")
    // Two-canvas gaussian for background
    const tmp = document.createElement('canvas')
    tmp.width = canvas.width; tmp.height = canvas.height
    const tmpCtx = tmp.getContext('2d')!
    tmpCtx.filter = `blur(${fullBlurStr * 2}px)`
    tmpCtx.drawImage(baseImg!, 0, 0)
    ctx.drawImage(tmp, 0, 0)
    
    // Composite sharp subject on top
    ctx.drawImage(subjectImg, 0, 0, canvas.width, canvas.height)
  }

  const processFaceBlur = async (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    if (!window.faceapi) {
      showToast("⚠ Face detection library still loading. Please wait a few seconds and try again.")
      return
    }
    setProgressMsg("Loading face detection models...")
    
    await window.faceapi.nets.tinyFaceDetector.loadFromUri('https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights')
    
    setProgressMsg("Detecting faces...")
    // Draw image to canvas first — faceapi needs a canvas element
    ctx.drawImage(baseImg!, 0, 0)
    
    // faceapi works best with a canvas element as input
    const detections = await window.faceapi.detectAllFaces(canvas, new window.faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.3 }))
    
    if (detections.length === 0) {
      showToast("⚠ No faces detected. Try Area Blur to manually select regions.")
      return
    }
    
    setProgressMsg(`Blurring ${detections.length} face(s)...`)
    
    detections.forEach((det: any) => {
      const { x, y, width, height } = det.box
      const pad = 20
      const rx = Math.max(0, Math.round(x - pad))
      const ry = Math.max(0, Math.round(y - pad))
      const rw = Math.min(canvas.width - rx, Math.round(width + pad * 2))
      const rh = Math.min(canvas.height - ry, Math.round(height + pad * 2))
      
      applyPixelate(ctx, rx, ry, rw, rh, areaStr)
    })
    
    showToast(`✓ Blurred ${detections.length} face(s)`)
  }

  const processImage = async () => {
    if (!baseImg || isProcessing) return
    setIsProcessing(true)
    setProgressMsg("Preparing canvas...")
    
    try {
      const canvas = document.createElement('canvas')
      canvas.width = originalDims.w
      canvas.height = originalDims.h
      const ctx = canvas.getContext('2d', { willReadFrequently: true })!
      
      if (activeTab === 'full') {
        processFullBlur(ctx, canvas)
      } else if (activeTab === 'area') {
        processAreaBlur(ctx, canvas)
      } else if (activeTab === 'bg') {
        await processBgBlur(ctx, canvas)
      } else if (activeTab === 'face') {
        await processFaceBlur(ctx, canvas)
      }
      
      setProgressMsg("Encoding output...")
      const dataUrl = canvas.toDataURL(outputFormat, 0.9)
      setResultUrl(dataUrl)
      
      const strLength = dataUrl.length - `data:${outputFormat};base64,`.length
      setResultSize(4 * Math.ceil((strLength / 3)) * 0.5624896334383812)
      
      if (activeTab !== 'face') showToast("✓ Image processed!")
    } catch (e) {
      console.error(e)
      showToast("⚠ Error processing image.")
    } finally {
      setIsProcessing(false)
      setProgressMsg("")
    }
  }

  const downloadImage = () => {
    if (!resultUrl || !file) return
    const a = document.createElement('a')
    a.href = resultUrl
    const baseName = file.name.replace(/\.[^/.]+$/, "")
    const ext = outputFormat === 'image/jpeg' ? 'jpg' : outputFormat === 'image/png' ? 'png' : 'webp'
    a.download = `${baseName}_blurred.${ext}`
    a.click()
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B"
    const k = 1024, sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
  }

  return (
    <>
      <Script src="https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js" strategy="lazyOnload" />

      {toastMsg && (
        <div className="fixed bottom-4 right-4 z-50 animate-in fade-in slide-in-from-bottom-4 flex items-center gap-2 bg-card border border-border shadow-lg rounded-lg px-4 py-3">
          {toastMsg.startsWith('✓') ? <CheckCircle2 className="size-5 text-green-500" /> : <AlertTriangle className="size-5 text-amber-500" />}
          <span className="text-sm font-medium">{toastMsg.replace(/^[✓⚠]\s*/, '')}</span>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight className="size-3.5" />
          <Link href="/#image-tools" className="hover:text-foreground transition-colors">Image Tools</Link>
          <ChevronRight className="size-3.5" />
          <span className="text-foreground font-medium">Image Blur</span>
        </nav>

        <div className="mb-8 text-center max-w-3xl mx-auto">
          <h1 className="font-heading text-3xl font-bold sm:text-4xl sm:leading-[1.1] mb-3">
            Blur Image & Faces — <span className="text-gradient">Free Online</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Pixelate sensitive info, censor faces, or create depth-of-field background blur effects instantly in your browser.
          </p>
        </div>

        {!previewUrl ? (
          <div className="max-w-3xl mx-auto animate-in fade-in zoom-in-95">
            <div 
              className={`rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer overflow-hidden ${isDragging ? "border-brand-orange bg-brand-orange/5 scale-[1.01]" : "border-border hover:border-brand-orange/50 hover:bg-muted/50 bg-card"}`}
              style={{ minHeight: '300px' }}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files) }}
              onClick={() => fileInputRef.current?.click()}
            >
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => handleFiles(e.target.files)} />
              <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <div className="mb-6 flex size-20 items-center justify-center rounded-3xl bg-brand-orange/10 text-brand-orange">
                  <ImageIcon className="size-10" />
                </div>
                <h3 className="font-heading text-xl font-bold mb-2">Upload Image to Blur</h3>
                <p className="text-muted-foreground mb-4">Click to browse or drag and drop</p>
                <div className="text-xs text-muted-foreground bg-background px-3 py-1.5 rounded-full border border-border">
                  JPG, PNG, WebP up to 50MB
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-8 animate-in fade-in">
            
            {/* LEFT: Controls */}
            <div className="space-y-5">
              
              {/* Tab Selector */}
              <div className="flex p-1 bg-muted rounded-xl border border-border">
                {[
                  { id: 'full', icon: LayoutTemplate, label: 'Full' },
                  { id: 'area', icon: SquareDashed, label: 'Area' },
                  { id: 'bg', icon: Users, label: 'B.G.' },
                  { id: 'face', icon: UserSquare2, label: 'Faces' }
                ].map(t => (
                  <button 
                    key={t.id} 
                    onClick={() => { setActiveTab(t.id as BlurTab); setResultUrl("") }}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg flex flex-col items-center justify-center gap-1 transition-all ${activeTab === t.id ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    <t.icon className="size-4" />
                    {t.label}
                  </button>
                ))}
              </div>

              <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
                  <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-muted-foreground">
                    {activeTab === 'full' && "Full Image Blur"}
                    {activeTab === 'area' && "Area / Region Blur"}
                    {activeTab === 'bg' && "Background Blur"}
                    {activeTab === 'face' && "Auto Face Blur"}
                  </h3>
                  <button onClick={() => { setPreviewUrl(""); setRegions([]); setResultUrl("") }} className="text-xs text-brand-orange hover:underline">Change</button>
                </div>
                
                <div className="p-5 space-y-6">
                  
                  {/* FULL BLUR CONTROLS */}
                  {activeTab === 'full' && (
                    <div className="space-y-5 animate-in fade-in">
                      <div>
                        <label className="text-xs font-bold uppercase text-muted-foreground mb-2 block">Blur Type</label>
                        <div className="grid grid-cols-3 gap-2">
                          {(['gaussian', 'pixelate', 'motion'] as FullBlurType[]).map(t => (
                            <button 
                              key={t} onClick={() => setFullBlurType(t)}
                              className={`py-2 text-xs font-medium rounded-md border transition-colors ${fullBlurType === t ? 'bg-brand-orange text-white border-brand-orange' : 'bg-background border-border hover:bg-muted'}`}
                            >
                              {t.charAt(0).toUpperCase() + t.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm font-bold">
                          <label>Blur Strength</label>
                          <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">{fullBlurStr}</span>
                        </div>
                        <Slider value={[fullBlurStr]} onValueChange={v => setFullBlurStr(Array.isArray(v) ? v[0] : v as number)} min={1} max={fullBlurType==='pixelate'?50:100} step={1} />
                      </div>
                    </div>
                  )}

                  {/* AREA BLUR CONTROLS */}
                  {activeTab === 'area' && (
                    <div className="space-y-5 animate-in fade-in">
                      <div className="bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 p-3 rounded-lg text-xs">
                        <strong>Instructions:</strong> Draw rectangles directly on the image preview to blur specific areas.
                      </div>
                      
                      <div>
                        <label className="text-xs font-bold uppercase text-muted-foreground mb-2 block">Blur Type for Regions</label>
                        <div className="grid grid-cols-2 gap-2">
                          {(['pixelate', 'gaussian'] as const).map(t => (
                            <button 
                              key={t} onClick={() => setAreaType(t)}
                              className={`py-2 text-xs font-medium rounded-md border transition-colors ${areaType === t ? 'bg-brand-orange text-white border-brand-orange' : 'bg-background border-border hover:bg-muted'}`}
                            >
                              {t === 'pixelate' ? 'Pixelate (Censor)' : 'Gaussian Blur'}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm font-bold">
                          <label>Strength</label>
                          <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">{areaStr}</span>
                        </div>
                        <Slider value={[areaStr]} onValueChange={v => setAreaStr(Array.isArray(v) ? v[0] : v as number)} min={5} max={50} step={1} />
                      </div>

                      {regions.length > 0 && (
                        <div className="pt-4 border-t border-border space-y-2">
                          <div className="flex justify-between items-center">
                            <label className="text-xs font-bold uppercase text-muted-foreground">Active Regions</label>
                            <button onClick={() => setRegions([])} className="text-xs text-red-500 hover:underline">Clear All</button>
                          </div>
                          <div className="max-h-32 overflow-y-auto space-y-1">
                            {regions.map((r, i) => (
                              <div key={r.id} className="flex items-center justify-between p-2 rounded bg-muted/50 border border-border text-xs">
                                <span>Region {i+1} ({r.type})</span>
                                <button onClick={() => setRegions(prev => prev.filter(rr => rr.id !== r.id))} className="text-red-500 hover:text-red-600 p-1">
                                  <Trash2 className="size-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* BACKGROUND BLUR CONTROLS */}
                  {activeTab === 'bg' && (
                    <div className="space-y-5 animate-in fade-in">
                      <div className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 p-3 rounded-lg text-xs">
                        AI will automatically detect the main subject, cut it out, and heavily blur the background behind it. Perfect for portraits.
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm font-bold">
                          <label>Background Blur Strength</label>
                          <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">{fullBlurStr}</span>
                        </div>
                        <Slider value={[fullBlurStr]} onValueChange={v => setFullBlurStr(Array.isArray(v) ? v[0] : v as number)} min={5} max={30} step={1} />
                      </div>
                    </div>
                  )}

                  {/* FACE BLUR CONTROLS */}
                  {activeTab === 'face' && (
                    <div className="space-y-5 animate-in fade-in">
                      <div className="bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 p-3 rounded-lg text-xs">
                        Uses on-device AI to detect all faces in the photo and automatically applies pixelation to protect privacy.
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm font-bold">
                          <label>Pixelation Strength</label>
                          <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">{areaStr}</span>
                        </div>
                        <Slider value={[areaStr]} onValueChange={v => setAreaStr(Array.isArray(v) ? v[0] : v as number)} min={5} max={30} step={1} />
                      </div>
                    </div>
                  )}

                  <div className="h-px bg-border my-4" />
                  
                  <Button 
                    onClick={processImage} 
                    disabled={isProcessing || (activeTab === 'area' && regions.length === 0)}
                    className="w-full h-12 text-base font-bold bg-brand-orange hover:bg-brand-orange-hover text-white shadow-lg shadow-brand-orange/20"
                  >
                    {isProcessing ? (
                      <><RefreshCw className="size-4 mr-2 animate-spin" /> Processing...</>
                    ) : (
                      <><Settings2 className="size-4 mr-2" /> Apply Blur</>
                    )}
                  </Button>

                  {isProcessing && progressMsg && (
                    <div className="text-xs text-center text-brand-orange font-medium animate-pulse mt-2">
                      {progressMsg}
                    </div>
                  )}

                </div>
              </div>
            </div>

            {/* RIGHT: Viewer */}
            <div className="space-y-5 min-w-0 flex flex-col">
              
              {!resultUrl ? (
                <div className="flex-1 rounded-xl border border-border bg-card p-4 flex flex-col items-center justify-center min-h-[500px] relative">
                  
                  {/* Interactive Canvas for Area drawing */}
                  <div 
                    ref={interactRef}
                    className="relative inline-block shadow-sm rounded overflow-hidden max-w-full"
                    style={{ cursor: activeTab === 'area' ? 'crosshair' : 'default' }}
                    onMouseDown={startDraw}
                    onMouseMove={doDraw}
                    onMouseUp={endDraw}
                    onMouseLeave={endDraw}
                    onTouchStart={startDraw}
                    onTouchMove={doDraw}
                    onTouchEnd={endDraw}
                  >
                    <img src={previewUrl} alt="Original" className="max-w-full max-h-[60vh] object-contain block pointer-events-none" />
                    
                    {/* Render existing regions */}
                    {activeTab === 'area' && regions.map(r => {
                      // convert from image coordinates back to DOM percentages for overlay
                      const left = (r.x / originalDims.w) * 100
                      const top = (r.y / originalDims.h) * 100
                      const width = (r.w / originalDims.w) * 100
                      const height = (r.h / originalDims.h) * 100
                      return (
                        <div key={r.id} className="absolute border-2 border-brand-orange/70 bg-brand-orange/10 pointer-events-none" style={{ left: `${left}%`, top: `${top}%`, width: `${width}%`, height: `${height}%` }} />
                      )
                    })}

                    {/* Render active drawing region */}
                    {isDrawing && activeTab === 'area' && (
                      <div className="absolute border-2 border-dashed border-blue-500 bg-blue-500/20 pointer-events-none" style={{
                        left: `${(Math.min(drawStart.x, drawCurrent.x) / originalDims.w) * 100}%`,
                        top: `${(Math.min(drawStart.y, drawCurrent.y) / originalDims.h) * 100}%`,
                        width: `${(Math.abs(drawCurrent.x - drawStart.x) / originalDims.w) * 100}%`,
                        height: `${(Math.abs(drawCurrent.y - drawStart.y) / originalDims.h) * 100}%`
                      }} />
                    )}
                  </div>
                  
                  <p className="text-xs text-muted-foreground mt-4 text-center">
                    {activeTab === 'area' ? "Click and drag on the image to draw blur regions." : "Ready to process. Adjust settings and apply."}
                  </p>
                </div>
              ) : (
                <>
                  <div className="rounded-xl border border-border bg-card shadow-sm p-4 animate-in fade-in zoom-in-95">
                    <div className="flex justify-between mb-3 text-xs font-bold uppercase text-muted-foreground px-1">
                      <span>Original</span>
                      <span>Blurred</span>
                    </div>
                    
                    <div 
                      ref={sliderRef}
                      className="relative w-full aspect-[4/3] sm:aspect-video rounded-lg overflow-hidden bg-muted select-none touch-none cursor-ew-resize border border-border"
                      onMouseDown={(e) => { setIsSliding(true); handleMove(e.clientX) }}
                      onTouchStart={(e) => { setIsSliding(true); handleMove(e.touches[0].clientX) }}
                    >
                      {/* Original (Bottom) */}
                      <img src={previewUrl} alt="Original" className="absolute inset-0 w-full h-full object-contain pointer-events-none" />
                      
                      {/* Result (Top with clip-path) */}
                      <div 
                        className="absolute inset-0 w-full h-full border-r-2 border-brand-orange"
                        style={{ clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)` }}
                      >
                        <img src={resultUrl} alt="Blurred" className="absolute inset-0 w-full h-full object-contain pointer-events-none" />
                      </div>
                      
                      {/* Slider Handle */}
                      <div 
                        className="absolute top-0 bottom-0 w-1 bg-brand-orange -ml-[2px] shadow-[0_0_10px_rgba(249,115,22,0.5)] flex items-center justify-center pointer-events-none"
                        style={{ left: `${sliderPos}%` }}
                      >
                        <div className="size-8 rounded-full bg-brand-orange border-2 border-white shadow-md flex items-center justify-center text-white">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl bg-brand-orange/5 border border-brand-orange/20 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <div className="font-bold text-lg text-foreground flex items-center gap-2">
                        <CheckCircle2 className="size-5 text-green-500" /> Image Blurred
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Est. size: <strong>~{formatBytes(resultSize)}</strong>
                      </div>
                    </div>
                    <Button onClick={downloadImage} className="h-12 px-8 text-base font-bold bg-brand-orange hover:bg-brand-orange-hover text-white shadow-lg shadow-brand-orange/20 w-full sm:w-auto shrink-0">
                      <Download className="size-5 mr-2" /> Download Image
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
