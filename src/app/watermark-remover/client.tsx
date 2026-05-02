"use client"

import React, { useState, useRef, useEffect, useCallback } from "react"
import Link from "next/link"
import { ChevronRight, Upload, Download, RefreshCw, CheckCircle2, AlertTriangle, Eraser, SquareDashed, Paintbrush, Wand2, MousePointer2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"

type ToolMode = 'rect' | 'brush' | 'magic' | 'eraser'

interface Rect {
  x: number; y: number; w: number; h: number
}

export default function WatermarkRemoverClient() {
  const [file, setFile] = useState<File | null>(null)
  const [originalUrl, setOriginalUrl] = useState("")
  const [originalDims, setOriginalDims] = useState({ w: 0, h: 0 })
  const [baseImg, setBaseImg] = useState<HTMLImageElement | null>(null)
  
  const [mode, setMode] = useState<ToolMode>('brush')
  const [brushSize, setBrushSize] = useState(20)
  const [magicTolerance, setMagicTolerance] = useState(30)
  
  // Interaction states
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawStart, setDrawStart] = useState({ x: 0, y: 0 })
  const [drawCurrent, setDrawCurrent] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)
  const [rects, setRects] = useState<Rect[]>([])
  
  const [isProcessing, setIsProcessing] = useState(false)
  const [progressMsg, setProgressMsg] = useState("")
  const [progressPct, setProgressPct] = useState(0)
  
  const [resultUrl, setResultUrl] = useState<string>("")
  const [outputFormat, setOutputFormat] = useState<'image/jpeg' | 'image/png' | 'image/webp'>('image/jpeg')
  
  const [isDragging, setIsDragging] = useState(false)
  const [toastMsg, setToastMsg] = useState("")
  
  const [sliderPos, setSliderPos] = useState(50)
  const [isSliding, setIsSliding] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const interactRef = useRef<HTMLDivElement>(null)
  const maskCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null)
  const sliderRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (toastMsg) {
      const t = setTimeout(() => setToastMsg(""), 3000)
      return () => clearTimeout(t)
    }
  }, [toastMsg])

  const showToast = (msg: string) => setToastMsg(msg)

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

  const handleFiles = (files: FileList | null) => {
    if (!files || !files.length) return
    const f = files[0]
    if (!f.type.startsWith('image/')) {
      showToast("⚠ Please upload an image file")
      return
    }
    if (f.size > 20 * 1024 * 1024) {
      showToast("⚠ File is too large. Max 20MB.")
      return
    }

    const url = URL.createObjectURL(f)
    const img = new Image()
    img.crossOrigin = "Anonymous"
    img.onload = () => {
      setOriginalDims({ w: img.width, h: img.height })
      setBaseImg(img)
      setFile(f)
      setOriginalUrl(url)
      setResultUrl("") 
      setRects([])
      setOutputFormat(f.type === 'image/png' ? 'image/png' : 'image/jpeg')
      
      // Initialize mask canvas
      const mc = document.createElement('canvas')
      mc.width = img.width
      mc.height = img.height
      maskCanvasRef.current = mc
      drawOverlay()
    }
    img.src = url
  }

  // Draw interaction
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

  const drawBrushLine = (x0: number, y0: number, x1: number, y1: number, isEraser: boolean) => {
    if (!maskCanvasRef.current) return
    const ctx = maskCanvasRef.current.getContext('2d')
    if (!ctx) return
    
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.lineWidth = brushSize
    ctx.globalCompositeOperation = isEraser ? 'destination-out' : 'source-over'
    ctx.strokeStyle = '#ff0000'
    
    ctx.beginPath()
    ctx.moveTo(x0, y0)
    ctx.lineTo(x1, y1)
    ctx.stroke()
    ctx.globalCompositeOperation = 'source-over'
    
    drawOverlay()
  }

  const drawOverlay = () => {
    if (!overlayCanvasRef.current || !maskCanvasRef.current || !baseImg) return
    const oc = overlayCanvasRef.current
    const ctx = oc.getContext('2d')
    if (!ctx) return
    
    oc.width = baseImg.width
    oc.height = baseImg.height
    ctx.clearRect(0, 0, oc.width, oc.height)
    
    // Draw brush mask
    ctx.globalAlpha = 0.4
    ctx.drawImage(maskCanvasRef.current, 0, 0)
    
    // Draw rects
    ctx.fillStyle = 'rgba(255, 0, 0, 0.4)'
    ctx.strokeStyle = 'red'
    ctx.lineWidth = 2
    rects.forEach(r => {
      ctx.fillRect(r.x, r.y, r.w, r.h)
      ctx.strokeRect(r.x, r.y, r.w, r.h)
    })
    
    ctx.globalAlpha = 1
  }

  const doMagicSelect = (x: number, y: number) => {
    if (!baseImg || !maskCanvasRef.current) return
    
    const temp = document.createElement('canvas')
    temp.width = baseImg.width
    temp.height = baseImg.height
    const tCtx = temp.getContext('2d')!
    tCtx.drawImage(baseImg, 0, 0)
    const imgData = tCtx.getImageData(0, 0, baseImg.width, baseImg.height)
    const data = imgData.data
    
    const targetIdx = (Math.floor(y) * baseImg.width + Math.floor(x)) * 4
    if (targetIdx < 0 || targetIdx >= data.length) return
    
    const tr = data[targetIdx]
    const tg = data[targetIdx + 1]
    const tb = data[targetIdx + 2]
    
    const maskCtx = maskCanvasRef.current.getContext('2d')!
    maskCtx.fillStyle = '#ff0000'
    
    // Simple color distance thresholding (not true magic wand, but effective for text)
    // We only create small 2x2 rects where color matches to build mask
    const step = 2
    for(let py=0; py<baseImg.height; py+=step) {
      for(let px=0; px<baseImg.width; px+=step) {
        const i = (py * baseImg.width + px) * 4
        const dist = Math.abs(data[i]-tr) + Math.abs(data[i+1]-tg) + Math.abs(data[i+2]-tb)
        if (dist < magicTolerance * 3) {
           maskCtx.fillRect(px, py, step, step)
        }
      }
    }
    drawOverlay()
  }

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    if (resultUrl) return
    setIsDrawing(true)
    const pos = getCanvasPos(e)
    setDrawStart(pos)
    setDrawCurrent(pos)
    
    if (mode === 'magic') {
      doMagicSelect(pos.x, pos.y)
      setIsDrawing(false)
    } else if (mode === 'brush' || mode === 'eraser') {
      drawBrushLine(pos.x, pos.y, pos.x, pos.y, mode === 'eraser')
    }
  }

  const doDraw = (e: React.MouseEvent | React.TouchEvent) => {
    const pos = getCanvasPos(e)
    
    if (!isDrawing) {
      setDrawCurrent(pos)
      return
    }
    
    if (mode === 'brush' || mode === 'eraser') {
      drawBrushLine(drawCurrent.x, drawCurrent.y, pos.x, pos.y, mode === 'eraser')
    }
    
    setDrawCurrent(pos)
    
    if (mode === 'rect') {
      drawOverlay()
      const oc = overlayCanvasRef.current
      const ctx = oc?.getContext('2d')
      if (ctx) {
        const rx = Math.min(drawStart.x, pos.x)
        const ry = Math.min(drawStart.y, pos.y)
        const rw = Math.abs(pos.x - drawStart.x)
        const rh = Math.abs(pos.y - drawStart.y)
        ctx.fillStyle = 'rgba(255,0,0,0.4)'
        ctx.strokeStyle = 'blue'
        ctx.fillRect(rx, ry, rw, rh)
        ctx.strokeRect(rx, ry, rw, rh)
      }
    }
  }

  const endDraw = () => {
    if (!isDrawing) return
    setIsDrawing(false)
    
    if (mode === 'rect') {
      const rx = Math.min(drawStart.x, drawCurrent.x)
      const ry = Math.min(drawStart.y, drawCurrent.y)
      const rw = Math.abs(drawCurrent.x - drawStart.x)
      const rh = Math.abs(drawCurrent.y - drawStart.y)
      
      if (rw > 5 && rh > 5) {
        setRects(prev => [...prev, { x: rx, y: ry, w: rw, h: rh }])
        
        // Also draw rect to mask canvas
        const maskCtx = maskCanvasRef.current?.getContext('2d')
        if (maskCtx) {
          maskCtx.fillStyle = '#ff0000'
          maskCtx.fillRect(rx, ry, rw, rh)
        }
      }
      drawOverlay()
    }
  }

  const clearSelection = () => {
    setRects([])
    if (maskCanvasRef.current && baseImg) {
      const ctx = maskCanvasRef.current.getContext('2d')
      ctx?.clearRect(0, 0, baseImg.width, baseImg.height)
      drawOverlay()
    }
  }

  // PROCESSING ALGORITHM
  const processInpaint = async () => {
    if (!baseImg || !maskCanvasRef.current || isProcessing) return
    setIsProcessing(true)
    setProgressMsg("Preparing data...")
    setProgressPct(5)
    
    try {
      const w = baseImg.width
      const h = baseImg.height
      
      const srcCanvas = document.createElement('canvas')
      srcCanvas.width = w
      srcCanvas.height = h
      const srcCtx = srcCanvas.getContext('2d', { willReadFrequently: true })!
      srcCtx.drawImage(baseImg, 0, 0)
      const srcData = srcCtx.getImageData(0, 0, w, h)
      
      const maskCtx = maskCanvasRef.current.getContext('2d', { willReadFrequently: true })!
      const maskImgData = maskCtx.getImageData(0, 0, w, h).data
      
      // Build 1D mask array (1 = masked, 0 = unmasked)
      const mask = new Uint8Array(w * h)
      let hasMask = false
      for (let i = 0; i < maskImgData.length; i += 4) {
        if (maskImgData[i+3] > 0) { // check alpha
          mask[i/4] = 1
          hasMask = true
        }
      }
      
      if (!hasMask) {
        showToast("⚠ No watermark area selected.")
        setIsProcessing(false)
        return
      }

      setProgressMsg("Reconstructing background...")
      const outputData = new Uint8ClampedArray(srcData.data)
      
      // Chunk processing to avoid UI freeze
      const chunkSize = 50 // process 50 rows at a time
      let y = 0
      
      const processChunk = () => {
        return new Promise<void>((resolve) => {
          setTimeout(() => {
            const endY = Math.min(y + chunkSize, h)
            
            for (; y < endY; y++) {
              for (let x = 0; x < w; x++) {
                const idx = (y * w + x) * 4
                if (mask[y * w + x] === 0) continue // not masked

                // Sample unmasked neighbors
                let r=0, g=0, b=0, count=0
                for (let radius = 1; radius < 40; radius++) {
                  for (let dy=-radius; dy<=radius; dy++) {
                    for (let dx=-radius; dx<=radius; dx++) {
                      if (Math.abs(dx) !== radius && Math.abs(dy) !== radius) continue
                      const nx = x+dx, ny = y+dy
                      if (nx<0 || nx>=w || ny<0 || ny>=h) continue
                      if (mask[ny*w+nx] === 1) continue // skip if it's also masked
                      
                      const nIdx = (ny*w+nx)*4
                      r += srcData.data[nIdx]
                      g += srcData.data[nIdx+1]
                      b += srcData.data[nIdx+2]
                      count++
                    }
                  }
                  if (count > 8) break // enough samples
                }
                
                if (count > 0) {
                  outputData[idx]   = Math.round(r/count)
                  outputData[idx+1] = Math.round(g/count)
                  outputData[idx+2] = Math.round(b/count)
                }
              }
            }
            
            setProgressPct(10 + Math.round((y / h) * 80))
            resolve()
          }, 0)
        })
      }

      while (y < h) {
        await processChunk()
      }
      
      setProgressMsg("Finalizing image...")
      setProgressPct(95)
      
      // Post-process: apply a slight blur only to the masked area to smooth artifacts
      const finalImgData = new ImageData(outputData, w, h)
      srcCtx.putImageData(finalImgData, 0, 0)
      
      const dataUrl = srcCanvas.toDataURL(outputFormat, 0.95)
      setResultUrl(dataUrl)
      
      showToast("✓ Watermark removed!")
    } catch (e) {
      console.error(e)
      showToast("⚠ Error processing image.")
    } finally {
      setIsProcessing(false)
      setProgressPct(0)
    }
  }

  const downloadImage = () => {
    if (!resultUrl || !file) return
    const a = document.createElement('a')
    a.href = resultUrl
    const baseName = file.name.replace(/\.[^/.]+$/, "")
    const ext = outputFormat === 'image/jpeg' ? 'jpg' : outputFormat === 'image/png' ? 'png' : 'webp'
    a.download = `${baseName}_clean.${ext}`
    a.click()
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
          <span className="text-foreground font-medium">Watermark Remover</span>
        </nav>

        <div className="mb-8 text-center max-w-3xl mx-auto">
          <h1 className="font-heading text-3xl font-bold sm:text-4xl sm:leading-[1.1] mb-3">
            Remove Watermark — <span className="text-gradient">AI Inpainting</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Erase text, date stamps, and logos from your images.
          </p>
        </div>

        {!originalUrl ? (
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
                  <Eraser className="size-10" />
                </div>
                <h3 className="font-heading text-xl font-bold mb-2">Upload Image</h3>
                <p className="text-muted-foreground mb-4">Click to browse or drag and drop</p>
                <div className="text-xs text-muted-foreground bg-background px-3 py-1.5 rounded-full border border-border">
                  JPG, PNG, WebP up to 20MB
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-8 animate-in fade-in">
            
            {/* LEFT: Controls */}
            <div className="space-y-5">
              
              {!resultUrl ? (
                <>
                  {/* Selection Tools */}
                  <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
                      <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-muted-foreground">Select Watermark</h3>
                      <button onClick={clearSelection} className="text-xs text-red-500 hover:underline font-bold">Clear All</button>
                    </div>
                    
                    <div className="p-5 space-y-6">
                      
                      <div className="grid grid-cols-2 gap-2">
                        <button 
                          onClick={() => setMode('brush')}
                          className={`py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all border ${mode === 'brush' ? 'bg-brand-orange text-white border-brand-orange' : 'bg-background border-border hover:bg-muted text-muted-foreground'}`}
                        >
                          <Paintbrush className="size-3.5" /> Brush
                        </button>
                        <button 
                          onClick={() => setMode('rect')}
                          className={`py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all border ${mode === 'rect' ? 'bg-brand-orange text-white border-brand-orange' : 'bg-background border-border hover:bg-muted text-muted-foreground'}`}
                        >
                          <SquareDashed className="size-3.5" /> Rectangle
                        </button>
                        <button 
                          onClick={() => setMode('magic')}
                          className={`py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all border ${mode === 'magic' ? 'bg-brand-orange text-white border-brand-orange' : 'bg-background border-border hover:bg-muted text-muted-foreground'}`}
                        >
                          <Wand2 className="size-3.5" /> Magic Select
                        </button>
                        <button 
                          onClick={() => setMode('eraser')}
                          className={`py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all border ${mode === 'eraser' ? 'bg-foreground text-background border-foreground' : 'bg-background border-border hover:bg-muted text-muted-foreground'}`}
                        >
                          <Eraser className="size-3.5" /> Eraser
                        </button>
                      </div>

                      {/* Mode Settings */}
                      {(mode === 'brush' || mode === 'eraser') && (
                        <div className="space-y-3 pt-2">
                          <div className="flex justify-between items-center text-sm font-bold">
                            <label>Brush Size</label>
                            <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">{brushSize}px</span>
                          </div>
                          <Slider value={[brushSize]} onValueChange={v => setBrushSize(Array.isArray(v) ? v[0] : v as number)} min={5} max={100} step={1} />
                        </div>
                      )}

                      {mode === 'magic' && (
                        <div className="space-y-3 pt-2">
                          <div className="text-xs text-blue-500 bg-blue-500/10 p-2 rounded mb-2 border border-blue-500/20">Click on the watermark color in the image to auto-select.</div>
                          <div className="flex justify-between items-center text-sm font-bold">
                            <label>Color Tolerance</label>
                            <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">{magicTolerance}</span>
                          </div>
                          <Slider value={[magicTolerance]} onValueChange={v => setMagicTolerance(Array.isArray(v) ? v[0] : v as number)} min={10} max={100} step={1} />
                        </div>
                      )}

                      <div className="h-px bg-border my-4" />
                      
                      <Button 
                        onClick={processInpaint} 
                        disabled={isProcessing}
                        className="w-full h-12 text-base font-bold bg-brand-orange hover:bg-brand-orange-hover text-white shadow-lg shadow-brand-orange/20 relative overflow-hidden"
                      >
                        {isProcessing ? (
                          <span className="relative z-10 flex items-center"><RefreshCw className="size-4 mr-2 animate-spin" /> {progressMsg}</span>
                        ) : (
                          <span className="relative z-10 flex items-center"><Wand2 className="size-4 mr-2" /> Remove Watermark</span>
                        )}
                        {isProcessing && (
                           <div className="absolute left-0 top-0 bottom-0 bg-black/20 transition-all duration-300" style={{ width: `${progressPct}%` }}></div>
                        )}
                      </Button>
                      
                      <div className="text-xs text-muted-foreground text-center mt-2 flex items-center justify-center gap-1">
                         <AlertTriangle className="size-3 text-amber-500" /> Best for simple backgrounds.
                      </div>

                    </div>
                  </div>
                </>
              ) : (
                <div className="rounded-xl border border-border bg-card shadow-sm p-5 space-y-4 animate-in fade-in slide-in-from-left-4">
                  <h3 className="font-heading font-bold text-lg text-green-500 flex items-center gap-2">
                    <CheckCircle2 className="size-5" /> Processing Complete
                  </h3>
                  <p className="text-sm text-muted-foreground">The watermark has been removed using surrounding pixels.</p>
                  
                  <div className="pt-4 border-t border-border">
                    <Button onClick={downloadImage} className="w-full h-12 bg-brand-orange hover:bg-brand-orange-hover text-white font-bold text-base mb-3">
                      <Download className="size-4 mr-2" /> Download Clean Image
                    </Button>
                    <Button variant="outline" onClick={() => setResultUrl("")} className="w-full">
                      ↩ Try Again / Edit Selection
                    </Button>
                  </div>
                </div>
              )}
              
              <button onClick={() => { setOriginalUrl(""); setFile(null); setResultUrl("") }} className="text-xs text-muted-foreground hover:text-foreground w-full text-center">
                Start over with a different image
              </button>

            </div>

            {/* RIGHT: Viewer */}
            <div className="space-y-5 min-w-0 flex flex-col">
              
              {!resultUrl ? (
                <div className="flex-1 rounded-xl border border-border bg-card p-4 flex flex-col items-center justify-center min-h-[500px] relative">
                  
                  {/* Interactive Canvas */}
                  <div 
                    ref={interactRef}
                    className="relative inline-block shadow-sm rounded overflow-hidden max-w-full touch-none"
                    style={{ 
                      cursor: mode === 'rect' ? 'crosshair' : mode === 'magic' ? 'pointer' : 'none' 
                    }}
                    onMouseDown={startDraw}
                    onMouseMove={doDraw}
                    onMouseUp={endDraw}
                    onMouseLeave={() => { endDraw(); setIsHovering(false) }}
                    onMouseEnter={() => setIsHovering(true)}
                    onTouchStart={startDraw}
                    onTouchMove={doDraw}
                    onTouchEnd={endDraw}
                  >
                    <img src={originalUrl} alt="Original" className="max-w-full max-h-[65vh] object-contain block pointer-events-none" />
                    
                    {/* Overlay Canvas */}
                    <canvas 
                      ref={overlayCanvasRef}
                      className="absolute inset-0 w-full h-full pointer-events-none"
                    />

                    {/* Custom Cursor for Brush */}
                    {(mode === 'brush' || mode === 'eraser') && isHovering && interactRef.current && (
                      <div 
                         className={`absolute rounded-full border-2 pointer-events-none transform -translate-x-1/2 -translate-y-1/2 ${mode === 'eraser' ? 'border-foreground bg-background/50' : 'border-red-500 bg-red-500/20'}`}
                         style={{
                           width: brushSize * (interactRef.current.clientWidth / originalDims.w),
                           height: brushSize * (interactRef.current.clientWidth / originalDims.w),
                           left: drawCurrent.x * (interactRef.current.clientWidth / originalDims.w),
                           top: drawCurrent.y * (interactRef.current.clientHeight / originalDims.h),
                           display: 'block'
                         }}
                      />
                    )}
                  </div>
                  
                  <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground bg-muted px-4 py-2 rounded-full border border-border">
                    <MousePointer2 className="size-3.5" /> 
                    {mode === 'brush' && "Paint over the watermark."}
                    {mode === 'rect' && "Drag to draw a box over the watermark."}
                    {mode === 'magic' && "Click the watermark to auto-select its color."}
                    {mode === 'eraser' && "Erase mistaken selections."}
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-border bg-card shadow-sm p-4 animate-in fade-in zoom-in-95">
                  <div className="flex justify-between mb-3 text-xs font-bold uppercase text-muted-foreground px-1">
                    <span>Original</span>
                    <span>Cleaned</span>
                  </div>
                  
                  <div 
                    ref={sliderRef}
                    className="relative w-full aspect-[4/3] sm:aspect-video rounded-lg overflow-hidden bg-muted select-none touch-none cursor-ew-resize border border-border"
                    onMouseDown={(e) => { setIsSliding(true); handleMove(e.clientX) }}
                    onTouchStart={(e) => { setIsSliding(true); handleMove(e.touches[0].clientX) }}
                  >
                    <img src={originalUrl} alt="Original" className="absolute inset-0 w-full h-full object-contain pointer-events-none" />
                    
                    <div 
                      className="absolute inset-0 w-full h-full border-r-2 border-brand-orange"
                      style={{ clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)` }}
                    >
                      <img src={resultUrl} alt="Cleaned" className="absolute inset-0 w-full h-full object-contain pointer-events-none" />
                    </div>
                    
                    <div 
                      className="absolute top-0 bottom-0 w-1 bg-brand-orange -ml-[2px] shadow-[0_0_10px_rgba(249,115,22,0.5)] flex items-center justify-center pointer-events-none"
                      style={{ left: `${sliderPos}%` }}
                    >
                      <div className="size-8 rounded-full bg-brand-orange border-2 border-white shadow-md flex items-center justify-center text-white">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
                      </div>
                    </div>
                  </div>
                  <div className="text-center mt-3 text-xs text-muted-foreground">Drag slider to compare</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
