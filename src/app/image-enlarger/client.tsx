"use client"

import React, { useState, useRef, useEffect, useCallback } from "react"
import Link from "next/link"
import { ChevronRight, Upload, Download, Settings2, Image as ImageIcon, CheckCircle2, AlertTriangle, Cpu, Zap, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

type Scale = 2 | 4 | 8
type Mode = 'ai' | 'fast'
type Format = 'image/png' | 'image/jpeg' | 'image/webp'

const PROGRESS_MESSAGES = [
  "Initializing neural network...",
  "Analyzing image context...",
  "Reconstructing edges...",
  "Enhancing details...",
  "Adding missing textures...",
  "Sharpening output..."
]

export default function ImageEnlargerClient() {
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>("")
  const [originalDims, setOriginalDims] = useState({ w: 0, h: 0 })
  
  const [scale, setScale] = useState<Scale>(4)
  const [mode, setMode] = useState<Mode>('ai')
  const [format, setFormat] = useState<Format>('image/png')
  
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [progressMsgIdx, setProgressMsgIdx] = useState(0)
  
  const [resultUrl, setResultUrl] = useState<string>("")
  const [resultDims, setResultDims] = useState({ w: 0, h: 0 })
  const [resultSize, setResultSize] = useState(0)
  
  const [isDragging, setIsDragging] = useState(false)
  const [toastMsg, setToastMsg] = useState("")

  const [sliderPos, setSliderPos] = useState(50)
  const [isSliding, setIsSliding] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const upscalerRef = useRef<any>(null)
  const sliderRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (toastMsg) {
      const t = setTimeout(() => setToastMsg(""), 3000)
      return () => clearTimeout(t)
    }
  }, [toastMsg])

  // Progress message rotation
  useEffect(() => {
    if (isProcessing && mode === 'ai') {
      const interval = setInterval(() => {
        setProgressMsgIdx(prev => (prev + 1) % PROGRESS_MESSAGES.length)
      }, 2500)
      return () => clearInterval(interval)
    }
  }, [isProcessing, mode])

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
    if (f.size > 10 * 1024 * 1024) {
      showToast("⚠ File is too large. Max 10MB.")
      return
    }

    const url = URL.createObjectURL(f)
    const img = new Image()
    img.onload = () => {
      setOriginalDims({ w: img.width, h: img.height })
      setFile(f)
      setPreviewUrl(url)
      setResultUrl("") // Reset result
    }
    img.src = url
  }

  const getUpscaler = async () => {
    if (!upscalerRef.current) {
      const Upscaler = (await import('upscaler')).default
      const DefaultUpscalerModel = (await import('@upscalerjs/default-model')).default
      upscalerRef.current = new Upscaler({
        model: DefaultUpscalerModel
      })
    }
    return upscalerRef.current
  }

  const fallbackUpscale = async (imgUrl: string, targetScale: number, outputFormat: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        // Progressive scaling (2x passes for 4x/8x)
        let currentImg: HTMLImageElement | HTMLCanvasElement = img
        let currentScale = 1
        
        while (currentScale < targetScale) {
          const nextScale = Math.min(currentScale * 2, targetScale)
          const ratio = nextScale / currentScale
          
          const canvas = document.createElement('canvas')
          canvas.width = currentImg.width * ratio
          canvas.height = currentImg.height * ratio
          const ctx = canvas.getContext('2d')
          if (!ctx) return reject("Canvas error")
          
          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = 'high'
          
          // White background for JPEG
          if (outputFormat === 'image/jpeg') {
            ctx.fillStyle = '#FFFFFF'
            ctx.fillRect(0, 0, canvas.width, canvas.height)
          }
          
          ctx.drawImage(currentImg, 0, 0, canvas.width, canvas.height)
          currentImg = canvas
          currentScale = nextScale
        }
        
        resolve((currentImg as HTMLCanvasElement).toDataURL(outputFormat, 0.95))
      }
      img.onerror = () => reject("Image load error")
      img.src = imgUrl
    })
  }

  const handleUpscale = async () => {
    if (!previewUrl || isProcessing) return
    
    setIsProcessing(true)
    setProgress(0)
    setProgressMsgIdx(0)
    
    try {
      if (mode === 'ai') {
        const upscaler = await getUpscaler()
        const img = new Image()
        img.src = previewUrl
        await new Promise(r => img.onload = r)
        
        // AI model upscales 2x natively. For 4x or 8x we might need multiple passes or just scale the canvas output
        // UpscalerJS default model handles up to 2x usually, but let's see. 
        // We will process with Upscaler, then if target is higher, we scale the result.
        const aiResultB64 = await upscaler.upscale(img, {
          patchSize: 64,
          padding: 4,
          output: 'base64',
          progress: (prog: number) => {
            setProgress(Math.round(prog * 100))
          }
        })
        
        // If they want 4x or 8x, we take the 2x AI result and fast-upscale the rest (or run AI again, but that's very slow)
        let finalDataUrl = aiResultB64
        if (scale > 2) {
           setProgressText("Applying final scaling...")
           finalDataUrl = await fallbackUpscale(aiResultB64, scale / 2, format)
        } else if (format !== 'image/png') {
           // Convert format if necessary
           finalDataUrl = await fallbackUpscale(aiResultB64, 1, format)
        }
        
        finishProcess(finalDataUrl)

      } else {
        // Fast mode (Bicubic)
        setProgress(50)
        setProgressText("Processing canvas interpolation...")
        
        // Timeout to allow UI to update
        await new Promise(r => setTimeout(r, 100))
        const dataUrl = await fallbackUpscale(previewUrl, scale, format)
        setProgress(100)
        finishProcess(dataUrl)
      }
    } catch (e) {
      console.error(e)
      showToast("⚠ Error upscaling image.")
      setIsProcessing(false)
    }
  }

  const finishProcess = (dataUrl: string) => {
    setResultUrl(dataUrl)
    setResultDims({ w: originalDims.w * scale, h: originalDims.h * scale })
    
    // Estimate size
    const strLength = dataUrl.length - 'data:image/png;base64,'.length
    const sizeInBytes = 4 * Math.ceil((strLength / 3)) * 0.5624896334383812
    setResultSize(sizeInBytes)
    
    setIsProcessing(false)
    setToastMsg("✓ Upscale complete!")
  }

  const setProgressText = (text: string) => {
    // hack to show a fixed text overriding the rotation
    const el = document.getElementById("progress-msg")
    if (el) el.innerText = text
  }

  const downloadImage = () => {
    if (!resultUrl || !file) return
    const a = document.createElement('a')
    a.href = resultUrl
    
    const baseName = file.name.replace(/\.[^/.]+$/, "")
    const ext = format === 'image/jpeg' ? 'jpg' : format === 'image/png' ? 'png' : 'webp'
    a.download = `${baseName}_upscaled_${scale}x.${ext}`
    a.click()
    showToast("✓ Image downloaded!")
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B"
    const k = 1024, sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
  }

  return (
    <>
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
          <span className="text-foreground font-medium">Image Enlarger</span>
        </nav>

        <div className="mb-8 text-center max-w-3xl mx-auto">
          <h1 className="font-heading text-3xl font-bold sm:text-4xl sm:leading-[1.1] mb-3">
            AI Image Enlarger — <span className="text-gradient">Upscale Free</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Increase image resolution 2x, 4x, or 8x without losing quality. AI runs completely in your browser for maximum privacy.
          </p>
        </div>

        {!previewUrl ? (
          /* UPLOAD ZONE */
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
                <h3 className="font-heading text-xl font-bold mb-2">Upload Image to Upscale</h3>
                <p className="text-muted-foreground mb-4">Click to browse or drag and drop</p>
                <div className="text-xs text-muted-foreground bg-background px-3 py-1.5 rounded-full border border-border">
                  JPG, PNG, WebP up to 10MB
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* WORKSPACE */
          <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-8 animate-in fade-in">
            
            {/* LEFT: Settings Sidebar */}
            <div className="space-y-5">
              <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
                  <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-muted-foreground">Settings</h3>
                  <button onClick={() => setPreviewUrl("")} className="text-xs text-brand-orange hover:underline">Change Image</button>
                </div>
                
                <div className="p-5 space-y-6">
                  
                  {/* Mode Selector */}
                  <div>
                    <label className="text-xs font-bold uppercase text-muted-foreground mb-2 block">Processing Mode</label>
                    <div className="space-y-2">
                      <button 
                        onClick={() => setMode('ai')} 
                        className={`w-full flex items-center gap-3 p-3 text-left rounded-lg border transition-all ${mode === 'ai' ? 'bg-brand-orange/10 border-brand-orange ring-1 ring-brand-orange' : 'bg-background border-border hover:bg-muted'}`}
                      >
                        <div className={`p-2 rounded-full ${mode === 'ai' ? 'bg-brand-orange text-white' : 'bg-muted text-muted-foreground'}`}>
                          <Cpu className="size-4" />
                        </div>
                        <div>
                          <div className="font-bold text-sm">AI Upscale (Best)</div>
                          <div className="text-[10px] text-muted-foreground">Uses Neural Network (~30s)</div>
                        </div>
                      </button>
                      <button 
                        onClick={() => setMode('fast')} 
                        className={`w-full flex items-center gap-3 p-3 text-left rounded-lg border transition-all ${mode === 'fast' ? 'bg-blue-500/10 border-blue-500 ring-1 ring-blue-500' : 'bg-background border-border hover:bg-muted'}`}
                      >
                        <div className={`p-2 rounded-full ${mode === 'fast' ? 'bg-blue-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                          <Zap className="size-4" />
                        </div>
                        <div>
                          <div className="font-bold text-sm">Fast Upscale</div>
                          <div className="text-[10px] text-muted-foreground">Bicubic interpolation (Instant)</div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Scale */}
                  <div>
                    <label className="text-xs font-bold uppercase text-muted-foreground mb-2 block">Enlarge Scale</label>
                    <div className="flex gap-2">
                      {([2, 4, 8] as Scale[]).map(s => (
                        <button 
                          key={s} 
                          onClick={() => setScale(s)} 
                          className={`flex-1 py-3 text-sm font-bold rounded-md border transition-all ${scale === s ? 'bg-foreground text-background border-foreground shadow-md' : 'bg-background border-border hover:bg-muted text-muted-foreground'}`}
                        >
                          {s}x
                        </button>
                      ))}
                    </div>
                    <div className="mt-2 text-center text-xs font-mono text-muted-foreground bg-muted/50 py-1.5 rounded">
                      {originalDims.w}×{originalDims.h} &nbsp;→&nbsp; <span className="font-bold text-foreground">{originalDims.w * scale}×{originalDims.h * scale} px</span>
                    </div>
                  </div>
                  
                  {/* Output Format */}
                  <div>
                    <label className="text-xs font-bold uppercase text-muted-foreground mb-2 block">Output Format</label>
                    <div className="flex gap-2">
                      {([['image/png', 'PNG'], ['image/jpeg', 'JPG'], ['image/webp', 'WebP']] as [Format, string][]).map(([fmt, lbl]) => (
                        <button 
                          key={fmt} 
                          onClick={() => setFormat(fmt)} 
                          className={`flex-1 py-1.5 text-xs font-medium rounded-md border transition-colors ${format === fmt ? 'bg-muted border-foreground text-foreground' : 'bg-background border-border hover:bg-muted text-muted-foreground'}`}
                        >
                          {lbl} {fmt === 'image/png' && <span className="text-[9px] block opacity-70">Best Qual.</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Action */}
                  <Button 
                    onClick={handleUpscale} 
                    disabled={isProcessing}
                    className="w-full h-12 text-base font-bold bg-brand-orange hover:bg-brand-orange-hover text-white shadow-lg shadow-brand-orange/20"
                  >
                    {isProcessing ? (
                      <><RefreshCw className="size-4 mr-2 animate-spin" /> Processing...</>
                    ) : (
                      <><Settings2 className="size-4 mr-2" /> Start Upscaling</>
                    )}
                  </Button>

                  {isProcessing && (
                    <div className="space-y-2 animate-in fade-in">
                      <div className="flex justify-between text-xs font-bold text-brand-orange">
                        <span id="progress-msg">{PROGRESS_MESSAGES[progressMsgIdx]}</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                        <div className="bg-brand-orange h-full transition-all duration-300" style={{ width: `${progress}%` }} />
                      </div>
                      <div className="text-[10px] text-muted-foreground text-center">Please do not close this tab.</div>
                    </div>
                  )}

                </div>
              </div>
            </div>

            {/* RIGHT: Viewer */}
            <div className="space-y-5 min-w-0 flex flex-col">
              
              {!resultUrl ? (
                <div className="flex-1 rounded-xl border border-border bg-card flex flex-col items-center justify-center p-8 text-center min-h-[500px]">
                  <img src={previewUrl} alt="Original" className="max-w-full max-h-[400px] object-contain rounded shadow-sm opacity-50" />
                  <div className="mt-6 bg-muted/50 px-4 py-2 rounded-lg border border-border inline-block">
                    <p className="text-sm font-medium">Ready to enhance</p>
                    <p className="text-xs text-muted-foreground mt-1">Select your settings and click Start Upscaling.</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Before/After Slider */}
                  <div className="rounded-xl border border-border bg-card shadow-sm p-4 animate-in fade-in zoom-in-95">
                    <div className="flex justify-between mb-3 text-xs font-bold uppercase text-muted-foreground px-1">
                      <span>Original ({originalDims.w}×{originalDims.h})</span>
                      <span>Upscaled ({resultDims.w}×{resultDims.h})</span>
                    </div>
                    
                    <div 
                      ref={sliderRef}
                      className="relative w-full aspect-[4/3] sm:aspect-video rounded-lg overflow-hidden bg-muted select-none touch-none cursor-ew-resize border border-border"
                      onMouseDown={(e) => { setIsSliding(true); handleMove(e.clientX) }}
                      onTouchStart={(e) => { setIsSliding(true); handleMove(e.touches[0].clientX) }}
                    >
                      {/* Original (Bottom) */}
                      <img src={previewUrl} alt="Original" className="absolute inset-0 w-full h-full object-contain pointer-events-none opacity-50 blur-[2px]" style={{ imageRendering: 'pixelated' }} />
                      <img src={previewUrl} alt="Original" className="absolute inset-0 w-full h-full object-contain pointer-events-none" />
                      
                      {/* Result (Top with clip-path) */}
                      <div 
                        className="absolute inset-0 w-full h-full border-r-2 border-brand-orange"
                        style={{ clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)` }}
                      >
                        <img src={resultUrl} alt="Upscaled" className="absolute inset-0 w-full h-full object-contain pointer-events-none" />
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

                  {/* 1:1 Pixel Zoom Comparison */}
                  <div className="grid grid-cols-2 gap-4">
                     <div className="rounded-xl border border-border bg-card p-4 overflow-hidden relative group">
                        <div className="text-xs font-bold uppercase text-muted-foreground mb-2 absolute top-2 left-3 bg-background/80 px-2 py-0.5 rounded backdrop-blur-sm z-10">Original 1:1 Zoom</div>
                        <div className="aspect-square bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                           <img src={previewUrl} className="w-[400%] h-[400%] object-cover object-center" style={{ imageRendering: 'pixelated' }} />
                        </div>
                     </div>
                     <div className="rounded-xl border border-border bg-card p-4 overflow-hidden relative group">
                        <div className="text-xs font-bold uppercase text-brand-orange mb-2 absolute top-2 left-3 bg-background/80 px-2 py-0.5 rounded backdrop-blur-sm z-10">Upscaled 1:1 Zoom</div>
                        <div className="aspect-square bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                           <img src={resultUrl} className="w-[400%] h-[400%] object-cover object-center" />
                        </div>
                     </div>
                  </div>

                  {/* Download Section */}
                  <div className="rounded-xl bg-brand-orange/5 border border-brand-orange/20 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <div className="font-bold text-lg text-foreground flex items-center gap-2">
                        <CheckCircle2 className="size-5 text-green-500" /> Enhancement Complete
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Est. file size: <strong>~{formatBytes(resultSize)}</strong> • Format: <strong>{format.split('/')[1].toUpperCase()}</strong>
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
