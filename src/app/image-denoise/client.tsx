"use client"

import React, { useState, useRef, useEffect, useCallback } from "react"
import Link from "next/link"
import { ChevronRight, Upload, Download, Settings2, Image as ImageIcon, CheckCircle2, AlertTriangle, RefreshCw, SlidersHorizontal, Moon, Zap, Layers } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"

// --- ALGORITHMS ---

function boxBlur(imageData: ImageData, radius: number) {
  if (radius <= 0) return new ImageData(new Uint8ClampedArray(imageData.data), imageData.width, imageData.height)
  
  const data = imageData.data
  const width = imageData.width
  const height = imageData.height
  const output = new Uint8ClampedArray(data)

  // Simple box blur (can be optimized but fits the requirement)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0, g = 0, b = 0, count = 0
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const nx = x + dx, ny = y + dy
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            const idx = (ny * width + nx) * 4
            r += data[idx]; g += data[idx + 1]; b += data[idx + 2]; count++
          }
        }
      }
      const outIdx = (y * width + x) * 4
      output[outIdx] = r / count
      output[outIdx + 1] = g / count
      output[outIdx + 2] = b / count
      // alpha stays same
    }
  }
  return new ImageData(output, width, height)
}

function medianFilter3x3(imageData: ImageData) {
  const data = imageData.data
  const width = imageData.width
  const height = imageData.height
  const output = new Uint8ClampedArray(data)

  const getMedian = (arr: number[]) => {
    arr.sort((a, b) => a - b)
    return arr[Math.floor(arr.length / 2)]
  }

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const r = [], g = [], b = []
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const idx = ((y + dy) * width + (x + dx)) * 4
          r.push(data[idx])
          g.push(data[idx + 1])
          b.push(data[idx + 2])
        }
      }
      const outIdx = (y * width + x) * 4
      output[outIdx] = getMedian(r)
      output[outIdx + 1] = getMedian(g)
      output[outIdx + 2] = getMedian(b)
    }
  }
  return new ImageData(output, width, height)
}

function unsharpMask(originalData: ImageData, blurredData: ImageData, amount: number) {
  if (amount <= 0) return blurredData
  
  const data = originalData.data
  const blurData = blurredData.data
  const output = new Uint8ClampedArray(blurData) // we apply sharpness to the already denoised image
  
  for (let i = 0; i < data.length; i += 4) {
    for (let c = 0; c < 3; c++) {
      // difference between original and blurred
      const diff = data[i + c] - blurData[i + c]
      output[i + c] = Math.min(255, Math.max(0, blurData[i + c] + (amount / 10) * diff))
    }
  }
  return new ImageData(output, originalData.width, originalData.height)
}

export default function ImageDenoiseClient() {
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>("")
  const [originalDims, setOriginalDims] = useState({ w: 0, h: 0 })
  const [originalImageData, setOriginalImageData] = useState<ImageData | null>(null)
  
  // Settings
  const [noiseStr, setNoiseStr] = useState(50)
  const [jpegFix, setJpegFix] = useState(false)
  const [jpegStr, setJpegStr] = useState(40)
  const [sharpen, setSharpen] = useState(false)
  const [sharpenStr, setSharpenStr] = useState(30)
  const [smoothSkin, setSmoothSkin] = useState(false)
  const [smoothStr, setSmoothStr] = useState(20)
  
  const [outputFormat, setOutputFormat] = useState<'image/jpeg' | 'image/png' | 'image/webp'>('image/jpeg')
  const [outputQuality, setOutputQuality] = useState(90)
  
  const [isProcessing, setIsProcessing] = useState(false)
  const [progressMsg, setProgressMsg] = useState("")
  
  const [resultUrl, setResultUrl] = useState<string>("")
  const [resultSize, setResultSize] = useState(0)
  
  const [isDragging, setIsDragging] = useState(false)
  const [toastMsg, setToastMsg] = useState("")

  const [sliderPos, setSliderPos] = useState(50)
  const [isSliding, setIsSliding] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const sliderRef = useRef<HTMLDivElement>(null)

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
    if (f.size > 20 * 1024 * 1024) {
      showToast("⚠ File is too large. Max 20MB.")
      return
    }

    const url = URL.createObjectURL(f)
    const img = new Image()
    img.onload = () => {
      setOriginalDims({ w: img.width, h: img.height })
      
      // Store raw ImageData for processing
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(img, 0, 0)
        setOriginalImageData(ctx.getImageData(0, 0, img.width, img.height))
      }
      
      setFile(f)
      setPreviewUrl(url)
      setResultUrl("") 
      setOutputFormat(f.type === 'image/png' ? 'image/png' : 'image/jpeg')
    }
    img.src = url
  }

  // PRESETS
  const applyPreset = (preset: string) => {
    switch (preset) {
      case 'light':
        setNoiseStr(20); setJpegFix(false); setSharpen(true); setSharpenStr(20); setSmoothSkin(false);
        break;
      case 'night':
        setNoiseStr(80); setJpegFix(true); setJpegStr(30); setSharpen(true); setSharpenStr(40); setSmoothSkin(false);
        break;
      case 'jpeg':
        setNoiseStr(10); setJpegFix(true); setJpegStr(60); setSharpen(true); setSharpenStr(10); setSmoothSkin(false);
        break;
      case 'smooth':
        setNoiseStr(40); setJpegFix(false); setSharpen(true); setSharpenStr(50); setSmoothSkin(true); setSmoothStr(60);
        break;
    }
  }

  const processImage = async () => {
    if (!originalImageData || isProcessing) return
    setIsProcessing(true)
    
    // We use setTimeout to yield to the UI thread so progress messages can update
    const yieldToUI = (msg: string) => new Promise(r => {
      setProgressMsg(msg)
      setTimeout(r, 50)
    })

    try {
      let currentData = originalImageData
      let totalBlurRadius = 0
      
      await yieldToUI("Analyzing image structure...")
      
      // Calculate effective blur radius based on strength
      if (noiseStr > 0) {
        totalBlurRadius += Math.ceil((noiseStr / 100) * 3) // max radius 3 for basic box blur
      }
      if (jpegFix && jpegStr > 0) {
        totalBlurRadius += Math.ceil((jpegStr / 100) * 2)
      }
      if (smoothSkin && smoothStr > 0) {
        totalBlurRadius += Math.ceil((smoothStr / 100) * 4)
      }

      // Apply Median Filter for extreme noise if > 70
      if (noiseStr > 70) {
        await yieldToUI("Applying median filter (heavy noise reduction)...")
        currentData = medianFilter3x3(currentData)
      }

      if (totalBlurRadius > 0) {
        await yieldToUI(`Smoothing pixels (Radius: ${totalBlurRadius})...`)
        currentData = boxBlur(currentData, totalBlurRadius)
      }

      if (sharpen && sharpenStr > 0) {
        await yieldToUI("Sharpening edges...")
        currentData = unsharpMask(originalImageData, currentData, sharpenStr)
      }

      await yieldToUI("Encoding final image...")
      
      const canvas = document.createElement('canvas')
      canvas.width = originalImageData.width
      canvas.height = originalImageData.height
      const ctx = canvas.getContext('2d')!
      ctx.putImageData(currentData, 0, 0)
      
      const dataUrl = canvas.toDataURL(outputFormat, outputQuality / 100)
      setResultUrl(dataUrl)
      
      const strLength = dataUrl.length - `data:${outputFormat};base64,`.length
      setResultSize(4 * Math.ceil((strLength / 3)) * 0.5624896334383812)
      
      showToast("✓ Image enhanced!")
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
    a.download = `${baseName}_denoised.${ext}`
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
          <span className="text-foreground font-medium">Noise Remover</span>
        </nav>

        <div className="mb-8 text-center max-w-3xl mx-auto">
          <h1 className="font-heading text-3xl font-bold sm:text-4xl sm:leading-[1.1] mb-3">
            Remove Noise & Grain — <span className="text-gradient">Free Online</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Smooth grainy photos, reduce JPEG artifacts, and enhance clarity using in-browser processing.
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
                <h3 className="font-heading text-xl font-bold mb-2">Upload Image to Denoise</h3>
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
              <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
                  <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-muted-foreground">Enhancement Tools</h3>
                  <button onClick={() => setPreviewUrl("")} className="text-xs text-brand-orange hover:underline">Change Image</button>
                </div>
                
                <div className="p-5 space-y-6">
                  
                  {/* Presets */}
                  <div>
                    <label className="text-xs font-bold uppercase text-muted-foreground mb-2 block">Quick Presets</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => applyPreset('light')} className="flex items-center gap-2 p-2 rounded-lg border border-border bg-background hover:bg-muted transition-colors text-xs font-medium text-left">
                        <ImageIcon className="size-3.5 text-blue-500" /> Light Denoise
                      </button>
                      <button onClick={() => applyPreset('night')} className="flex items-center gap-2 p-2 rounded-lg border border-border bg-background hover:bg-muted transition-colors text-xs font-medium text-left">
                        <Moon className="size-3.5 text-indigo-500" /> Night Photo Fix
                      </button>
                      <button onClick={() => applyPreset('jpeg')} className="flex items-center gap-2 p-2 rounded-lg border border-border bg-background hover:bg-muted transition-colors text-xs font-medium text-left">
                        <Zap className="size-3.5 text-amber-500" /> JPEG Fix
                      </button>
                      <button onClick={() => applyPreset('smooth')} className="flex items-center gap-2 p-2 rounded-lg border border-border bg-background hover:bg-muted transition-colors text-xs font-medium text-left">
                        <Layers className="size-3.5 text-pink-500" /> Smooth & Sharp
                      </button>
                    </div>
                  </div>

                  <div className="h-px bg-border my-4" />

                  {/* Noise Reduction */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-bold flex items-center gap-2"><SlidersHorizontal className="size-4 text-muted-foreground" /> Noise Reduction</label>
                      <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{noiseStr}%</span>
                    </div>
                    <Slider value={[noiseStr]} onValueChange={v => setNoiseStr(Array.isArray(v) ? v[0] : v)} min={0} max={100} step={1} />
                    {noiseStr > 70 && <div className="text-[10px] text-amber-600 bg-amber-50 dark:bg-amber-950/30 p-1.5 rounded border border-amber-200 dark:border-amber-900">High values use a median filter which may take a few seconds to process.</div>}
                  </div>

                  {/* JPEG Artifacts */}
                  <div className="space-y-3 pt-2">
                    <label className="flex items-center gap-2 text-sm font-bold cursor-pointer">
                      <input type="checkbox" checked={jpegFix} onChange={e => setJpegFix(e.target.checked)} className="rounded border-border text-brand-orange focus:ring-brand-orange" />
                      Remove JPEG Artifacts
                    </label>
                    {jpegFix && (
                      <div className="pl-6 flex items-center gap-3 animate-in fade-in">
                        <Slider value={[jpegStr]} onValueChange={v => setJpegStr(Array.isArray(v) ? v[0] : v)} min={0} max={100} step={1} className="flex-1" />
                        <span className="text-xs font-mono w-8 text-right">{jpegStr}%</span>
                      </div>
                    )}
                  </div>

                  {/* Smoothing */}
                  <div className="space-y-3 pt-2">
                    <label className="flex items-center gap-2 text-sm font-bold cursor-pointer">
                      <input type="checkbox" checked={smoothSkin} onChange={e => setSmoothSkin(e.target.checked)} className="rounded border-border text-brand-orange focus:ring-brand-orange" />
                      Smooth Skin / Surfaces
                    </label>
                    {smoothSkin && (
                      <div className="pl-6 flex items-center gap-3 animate-in fade-in">
                        <Slider value={[smoothStr]} onValueChange={v => setSmoothStr(Array.isArray(v) ? v[0] : v)} min={0} max={100} step={1} className="flex-1" />
                        <span className="text-xs font-mono w-8 text-right">{smoothStr}%</span>
                      </div>
                    )}
                  </div>

                  {/* Sharpening */}
                  <div className="space-y-3 pt-2">
                    <label className="flex items-center gap-2 text-sm font-bold cursor-pointer">
                      <input type="checkbox" checked={sharpen} onChange={e => setSharpen(e.target.checked)} className="rounded border-border text-brand-orange focus:ring-brand-orange" />
                      Sharpen After Denoise
                    </label>
                    {sharpen && (
                      <div className="pl-6 flex items-center gap-3 animate-in fade-in">
                        <Slider value={[sharpenStr]} onValueChange={v => setSharpenStr(Array.isArray(v) ? v[0] : v)} min={0} max={100} step={1} className="flex-1" />
                        <span className="text-xs font-mono w-8 text-right">{sharpenStr}%</span>
                      </div>
                    )}
                  </div>

                  <div className="h-px bg-border my-4" />
                  
                  <Button 
                    onClick={processImage} 
                    disabled={isProcessing}
                    className="w-full h-12 text-base font-bold bg-brand-orange hover:bg-brand-orange-hover text-white shadow-lg shadow-brand-orange/20"
                  >
                    {isProcessing ? (
                      <><RefreshCw className="size-4 mr-2 animate-spin" /> Processing...</>
                    ) : (
                      <><Settings2 className="size-4 mr-2" /> Apply Filters</>
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
                <div className="flex-1 rounded-xl border border-border bg-card flex flex-col items-center justify-center p-8 text-center min-h-[500px]">
                  <img src={previewUrl} alt="Original" className="max-w-full max-h-[400px] object-contain rounded shadow-sm opacity-50" />
                  <div className="mt-6 bg-muted/50 px-4 py-2 rounded-lg border border-border inline-block">
                    <p className="text-sm font-medium">Ready to enhance</p>
                    <p className="text-xs text-muted-foreground mt-1">Adjust the sliders and click Apply Filters.</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="rounded-xl border border-border bg-card shadow-sm p-4 animate-in fade-in zoom-in-95">
                    <div className="flex justify-between mb-3 text-xs font-bold uppercase text-muted-foreground px-1">
                      <span>Original</span>
                      <span>Enhanced</span>
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
                        <img src={resultUrl} alt="Enhanced" className="absolute inset-0 w-full h-full object-contain pointer-events-none" />
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

                  <div className="rounded-xl border border-border bg-card p-5 space-y-4">
                    <h4 className="font-heading font-bold text-sm">Download Options</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold uppercase text-muted-foreground mb-2 block">Format</label>
                        <div className="flex gap-2">
                          {(['image/jpeg', 'image/png', 'image/webp'] as const).map(fmt => (
                            <button 
                              key={fmt} 
                              onClick={() => setOutputFormat(fmt)} 
                              className={`flex-1 py-1.5 text-xs font-medium rounded-md border transition-colors ${outputFormat === fmt ? 'bg-muted border-foreground text-foreground' : 'bg-background border-border hover:bg-muted text-muted-foreground'}`}
                            >
                              {fmt.split('/')[1].toUpperCase()}
                            </button>
                          ))}
                        </div>
                      </div>
                      {(outputFormat === 'image/jpeg' || outputFormat === 'image/webp') && (
                        <div>
                          <label className="text-xs font-bold uppercase text-muted-foreground mb-2 flex justify-between">
                            Quality <span>{outputQuality}%</span>
                          </label>
                          <Slider value={[outputQuality]} onValueChange={v => setOutputQuality(Array.isArray(v) ? v[0] : v)} min={60} max={100} step={1} />
                        </div>
                      )}
                    </div>
                    <div className="flex justify-end pt-2">
                      <Button onClick={downloadImage} className="bg-brand-orange hover:bg-brand-orange-hover text-white">
                        <Download className="size-4 mr-2" /> Download Enhanced ({formatBytes(resultSize)})
                      </Button>
                    </div>
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
