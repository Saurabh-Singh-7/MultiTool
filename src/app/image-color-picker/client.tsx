"use client"

import React, { useState, useRef, useEffect, useCallback } from "react"
import Link from "next/link"
import Script from "next/script"
import { ChevronRight, Upload, Copy, Trash2, Palette, Download, CheckCircle2, Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

declare global {
  interface Window {
    ColorThief: any
  }
}

interface PickedColor {
  hex: string
  rgb: [number, number, number]
  hsl: string
  cmyk: string
  name: string
}

function rgbToHex(r: number, g: number, b: number) {
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('').toUpperCase()
}

function rgbToHsl(r: number, g: number, b: number) {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h = 0, s = 0, l = (max + min) / 2
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }
  return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`
}

function rgbToCmyk(r: number, g: number, b: number) {
  r /= 255; g /= 255; b /= 255
  const k = 1 - Math.max(r, g, b)
  if (k === 1) return 'C:0% M:0% Y:0% K:100%'
  const c = (1 - r - k) / (1 - k)
  const m = (1 - g - k) / (1 - k)
  const y = (1 - b - k) / (1 - k)
  return `C:${Math.round(c * 100)}% M:${Math.round(m * 100)}% Y:${Math.round(y * 100)}% K:${Math.round(k * 100)}%`
}

const getColorName = (r: number, g: number, b: number) => {
  const colors = [
    { name: "Black", rgb: [0, 0, 0] }, { name: "White", rgb: [255, 255, 255] },
    { name: "Red", rgb: [255, 0, 0] }, { name: "Lime", rgb: [0, 255, 0] },
    { name: "Blue", rgb: [0, 0, 255] }, { name: "Yellow", rgb: [255, 255, 0] },
    { name: "Cyan", rgb: [0, 255, 255] }, { name: "Magenta", rgb: [255, 0, 255] },
    { name: "Silver", rgb: [192, 192, 192] }, { name: "Gray", rgb: [128, 128, 128] },
    { name: "Maroon", rgb: [128, 0, 0] }, { name: "Olive", rgb: [128, 128, 0] },
    { name: "Green", rgb: [0, 128, 0] }, { name: "Purple", rgb: [128, 0, 128] },
    { name: "Teal", rgb: [0, 128, 128] }, { name: "Navy", rgb: [0, 0, 128] },
    { name: "Orange", rgb: [255, 165, 0] }, { name: "Pink", rgb: [255, 192, 203] },
    { name: "Brown", rgb: [165, 42, 42] }, { name: "Gold", rgb: [255, 215, 0] },
    { name: "Sky Blue", rgb: [135, 206, 235] }, { name: "Violet", rgb: [238, 130, 238] }
  ]
  let closest = colors[0]
  let minDistance = Infinity
  for (const c of colors) {
    const dist = Math.sqrt(Math.pow(r - c.rgb[0], 2) + Math.pow(g - c.rgb[1], 2) + Math.pow(b - c.rgb[2], 2))
    if (dist < minDistance) {
      minDistance = dist
      closest = c
    }
  }
  return closest.name
}

export default function ImageColorPickerClient() {
  const [imageUrl, setImageUrl] = useState<string>("")
  const [baseImageObj, setBaseImageObj] = useState<HTMLImageElement | null>(null)
  
  const [currentColor, setCurrentColor] = useState<PickedColor | null>(null)
  const [history, setHistory] = useState<PickedColor[]>([])
  const [palette, setPalette] = useState<string[]>([])
  
  const [isHovering, setIsHovering] = useState(false)
  const [lensPos, setLensPos] = useState({ x: 0, y: 0 })
  
  const [toastMsg, setToastMsg] = useState("")

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const lensCanvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(""), 2500)
  }

  // Draw image to canvas once loaded
  useEffect(() => {
    if (baseImageObj && canvasRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      if (ctx) {
        // Clear previous state to ensure clean redraw
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        
        // Size canvas to display proportionally
        const containerW = canvas.parentElement?.clientWidth || 800
        const scale = Math.min(1, containerW / baseImageObj.width)
        canvas.width = baseImageObj.width * scale
        canvas.height = baseImageObj.height * scale
        
        ctx.drawImage(baseImageObj, 0, 0, canvas.width, canvas.height)
      }
    }
  }, [baseImageObj])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 20 * 1024 * 1024) {
      showToast("File is too large. Max 20MB.")
      return
    }

    const url = URL.createObjectURL(file)
    const img = new Image()
    img.crossOrigin = "Anonymous"
    img.onload = () => {
      setBaseImageObj(img)
      setImageUrl(url)
      setCurrentColor(null)
      setPalette([])
    }
    img.src = url
  }

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    const lensCanvas = lensCanvasRef.current
    if (!canvas || !lensCanvas) return

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    
    // Pixel coordinates in canvas space
    const x = Math.floor((e.clientX - rect.left) * scaleX)
    const y = Math.floor((e.clientY - rect.top) * scaleY)

    // Position the lens DOM element near cursor
    setLensPos({ x: e.clientX - rect.left + 15, y: e.clientY - rect.top + 15 })

    // Draw zoomed area
    const lensCtx = lensCanvas.getContext('2d')
    if (!lensCtx) return

    const zoom = 8
    const lensSize = 100 // width/height of lens canvas
    lensCtx.clearRect(0, 0, lensSize, lensSize)
    lensCtx.imageSmoothingEnabled = false
    
    // Source rect from main canvas
    const srcW = lensSize / zoom
    const srcH = lensSize / zoom
    const srcX = x - srcW / 2
    const srcY = y - srcH / 2
    
    try {
      lensCtx.drawImage(canvas, srcX, srcY, srcW, srcH, 0, 0, lensSize, lensSize)
      // Center crosshair dot
      lensCtx.fillStyle = 'rgba(249, 115, 22, 0.8)' // brand-orange
      lensCtx.fillRect(lensSize / 2 - 1, lensSize / 2 - 1, 2, 2)
    } catch (err) {
      // Ignore out of bounds errors on edges
    }
  }

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const x = Math.floor((e.clientX - rect.left) * scaleX)
    const y = Math.floor((e.clientY - rect.top) * scaleY)

    try {
      const pixel = ctx.getImageData(x, y, 1, 1).data
      const r = pixel[0]
      const g = pixel[1]
      const b = pixel[2]
      
      const hex = rgbToHex(r, g, b)
      const newColor: PickedColor = {
        hex,
        rgb: [r, g, b],
        hsl: rgbToHsl(r, g, b),
        cmyk: rgbToCmyk(r, g, b),
        name: getColorName(r, g, b)
      }
      
      setCurrentColor(newColor)
      setHistory(prev => {
        const filtered = prev.filter(c => c.hex !== newColor.hex)
        return [newColor, ...filtered].slice(0, 20)
      })
    } catch (err) {
      // Ignore out of bounds
    }
  }

  const extractColorPalette = () => {
    if (!window.ColorThief || !baseImageObj) {
      showToast("Color extraction engine not loaded yet.")
      return
    }
    
    try {
      const colorThief = new window.ColorThief()
      const p = colorThief.getPalette(baseImageObj, 8)
      if (p && p.length) {
        const hexPalette = p.map((c: number[]) => rgbToHex(c[0], c[1], c[2]))
        setPalette(hexPalette)
        showToast("Palette extracted!")
      }
    } catch (e) {
      console.error(e)
      showToast("Could not extract palette from this image.")
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    showToast(`Copied ${text}`)
  }

  const downloadPalettePng = () => {
    if (!palette.length) return
    const canvas = document.createElement('canvas')
    canvas.width = 800
    canvas.height = 200
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const blockW = 800 / palette.length
    palette.forEach((hex, i) => {
      ctx.fillStyle = hex
      ctx.fillRect(i * blockW, 0, blockW, 200)
    })

    const a = document.createElement('a')
    a.href = canvas.toDataURL('image/png')
    a.download = 'extracted-palette.png'
    a.click()
  }

  return (
    <>
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/color-thief/2.3.2/color-thief.umd.js" strategy="lazyOnload" />

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-4 right-4 z-50 animate-in fade-in slide-in-from-bottom-4 flex items-center gap-2 bg-card border border-border shadow-lg rounded-lg px-4 py-3">
          <CheckCircle2 className="size-5 text-green-500" />
          <span className="text-sm font-medium">{toastMsg}</span>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight className="size-3.5" />
          <Link href="/#image-tools" className="hover:text-foreground transition-colors">Image Tools</Link>
          <ChevronRight className="size-3.5" />
          <span className="text-foreground font-medium">Image Color Picker</span>
        </nav>

        <div className="mb-8 text-center max-w-3xl mx-auto">
          <h1 className="font-heading text-3xl font-bold sm:text-4xl sm:leading-[1.1] mb-3">
            Image Color Picker — <span className="text-gradient">Pick Any Color</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Extract exact HEX, RGB, HSL and CMYK codes from any image instantly. Build palettes and find color inspiration.
          </p>
        </div>

        {!imageUrl ? (
          /* UPLOAD ZONE */
          <div className="max-w-3xl mx-auto animate-in fade-in zoom-in-95">
            <div 
              className="rounded-2xl border-2 border-dashed border-border bg-card hover:bg-muted/50 hover:border-brand-orange/50 transition-colors cursor-pointer"
              style={{ minHeight: '300px' }}
              onClick={() => fileInputRef.current?.click()}
            >
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileUpload} />
              <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <div className="mb-6 flex size-20 items-center justify-center rounded-3xl bg-brand-orange/10 text-brand-orange">
                  <ImageIcon className="size-10" />
                </div>
                <h3 className="font-heading text-xl font-bold mb-2">Upload Image to Pick Colors</h3>
                <p className="text-muted-foreground mb-4">Click to browse or drag and drop</p>
                <div className="text-xs text-muted-foreground bg-background px-3 py-1.5 rounded-full border border-border">
                  JPG, PNG, WebP up to 20MB
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* WORKSPACE */
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 animate-in fade-in">
            
            {/* LEFT: Canvas Area */}
            <div className="space-y-4 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-muted-foreground">Original Image</h3>
                <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="h-8 text-xs">
                  <Upload className="size-3.5 mr-1.5" /> Upload New
                </Button>
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileUpload} />
              </div>
              
              <div className="relative rounded-xl border border-border bg-muted/30 overflow-hidden shadow-inner flex items-center justify-center min-h-[400px]">
                {/* Crosshair cursor to indicate eyedropper */}
                <canvas 
                  ref={canvasRef}
                  className="max-w-full max-h-[70vh] cursor-crosshair shadow-sm"
                  onMouseMove={handleCanvasMouseMove}
                  onMouseEnter={() => setIsHovering(true)}
                  onMouseLeave={() => setIsHovering(false)}
                  onClick={handleCanvasClick}
                />
                
                {/* 8x Zoom Lens overlay */}
                {isHovering && (
                  <div 
                    className="absolute pointer-events-none rounded-full overflow-hidden border-4 border-white shadow-2xl z-10"
                    style={{
                      left: `${lensPos.x}px`,
                      top: `${lensPos.y}px`,
                      width: '100px',
                      height: '100px',
                      boxShadow: '0 0 0 1px rgba(0,0,0,0.1), 0 10px 25px -5px rgba(0,0,0,0.5)'
                    }}
                  >
                    <canvas ref={lensCanvasRef} width={100} height={100} className="w-full h-full block" />
                  </div>
                )}
              </div>
              <p className="text-xs text-center text-muted-foreground">Hover to zoom, click to pick a color.</p>
            </div>

            {/* RIGHT: Sidebar */}
            <div className="space-y-6">
              
              {/* Current Color Block */}
              <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
                  <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-muted-foreground">Selected Color</h3>
                </div>
                
                <div className="p-5 space-y-5">
                  {currentColor ? (
                    <>
                      {/* Big Swatch */}
                      <div className="flex items-center gap-4">
                        <div 
                          className="size-20 rounded-xl border border-border shadow-inner shrink-0" 
                          style={{ backgroundColor: currentColor.hex }}
                        />
                        <div>
                          <div className="font-heading text-2xl font-bold tracking-tight">{currentColor.hex}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                            <span className="inline-block size-2.5 rounded-full bg-brand-orange"></span>
                            ~ {currentColor.name}
                          </div>
                        </div>
                      </div>
                      
                      {/* Formats */}
                      <div className="space-y-2">
                        {[
                          { label: 'HEX', value: currentColor.hex },
                          { label: 'RGB', value: `rgb(${currentColor.rgb.join(', ')})` },
                          { label: 'HSL', value: currentColor.hsl },
                          { label: 'CMYK', value: currentColor.cmyk },
                        ].map(fmt => (
                          <div key={fmt.label} className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-muted/20 hover:bg-muted/50 transition-colors group">
                            <div className="flex flex-col">
                              <span className="text-[10px] font-bold text-muted-foreground uppercase">{fmt.label}</span>
                              <span className="font-mono text-sm">{fmt.value}</span>
                            </div>
                            <button 
                              onClick={() => copyToClipboard(fmt.value)}
                              className="p-1.5 rounded-md text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-background hover:text-foreground transition-all shadow-sm border border-transparent hover:border-border"
                              title="Copy"
                            >
                              <Copy className="size-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="py-12 text-center flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-border rounded-xl bg-muted/10">
                      <div className="size-12 rounded-full border border-border bg-background mb-3 flex items-center justify-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />
                      </div>
                      <p className="text-sm">Click image to pick color</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Palette Extraction */}
              <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                <div className="p-4 border-b border-border bg-muted/30">
                  <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-muted-foreground">Color Palette</h3>
                </div>
                <div className="p-5">
                  {!palette.length ? (
                    <Button onClick={extractColorPalette} className="w-full bg-brand-orange hover:bg-brand-orange-hover text-white">
                      <Palette className="size-4 mr-2" /> Extract Palette
                    </Button>
                  ) : (
                    <div className="space-y-4">
                      {/* Swatch row */}
                      <div className="flex h-16 rounded-lg overflow-hidden border border-border shadow-sm">
                        {palette.map((hex, i) => (
                          <div 
                            key={i} 
                            className="flex-1 cursor-pointer relative group" 
                            style={{ backgroundColor: hex }}
                            onClick={() => {
                              // Simulate pick
                              const c = hex.replace('#','')
                              const r = parseInt(c.substring(0,2), 16)
                              const g = parseInt(c.substring(2,4), 16)
                              const b = parseInt(c.substring(4,6), 16)
                              setCurrentColor({
                                hex, rgb: [r,g,b], hsl: rgbToHsl(r,g,b), cmyk: rgbToCmyk(r,g,b), name: getColorName(r,g,b)
                              })
                            }}
                          >
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <span className="text-[10px] text-white font-mono font-bold px-1">{hex}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => copyToClipboard(palette.join(', '))} className="flex-1 text-xs h-8">
                          <Copy className="size-3.5 mr-1.5" /> Copy HEX
                        </Button>
                        <Button variant="outline" size="sm" onClick={downloadPalettePng} className="flex-1 text-xs h-8">
                          <Download className="size-3.5 mr-1.5" /> Save PNG
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* History */}
              {history.length > 0 && (
                <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-border bg-muted/30 flex justify-between items-center">
                    <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-muted-foreground">History</h3>
                    <button onClick={() => setHistory([])} className="text-xs text-red-500 hover:underline">Clear</button>
                  </div>
                  <div className="p-5 flex flex-wrap gap-2">
                    {history.map((c, i) => (
                      <div 
                        key={i}
                        onClick={() => setCurrentColor(c)}
                        className="size-8 rounded-md border border-border shadow-sm cursor-pointer hover:scale-110 transition-transform relative group"
                        style={{ backgroundColor: c.hex }}
                        title={c.hex}
                      />
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        )}
      </div>
    </>
  )
}
