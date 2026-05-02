"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import Link from "next/link"
import { removeBackground, Config } from "@imgly/background-removal"
import { Upload, ChevronRight, Image as ImageIcon, Scissors, Info, CheckCircle2, Download, RefreshCw, AlertTriangle, Palette } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
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

function BeforeAfterSlider({ originalSrc, compressedSrc, isTransparent }: { originalSrc: string, compressedSrc: string, isTransparent: boolean }) {
  const [sliderPosition, setSliderPosition] = useState(50)
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    let x = ((clientX - rect.left) / rect.width) * 100
    x = Math.min(Math.max(x, 0), 100)
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
      className="relative w-full aspect-square sm:aspect-video md:aspect-[16/9] lg:aspect-[2/1] rounded-xl overflow-hidden bg-muted select-none touch-none border border-border"
    >
      {/* BEFORE (Left) */}
      <img src={originalSrc} alt="Original" className="absolute top-0 left-0 w-full h-full object-contain bg-black/5" draggable={false} />
      
      {/* AFTER (Right) with Checkered Background option */}
      <div 
        className="absolute top-0 left-0 w-full h-full"
        style={{ clipPath: `inset(0 0 0 ${sliderPosition}%)` }}
      >
        <div className={`absolute w-full h-full ${isTransparent ? 'checkered-bg' : 'bg-black/5'}`}></div>
        <img 
          src={compressedSrc} 
          alt="Result" 
          className="absolute top-0 left-0 w-full h-full object-contain" 
          draggable={false}
        />
      </div>

      <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-md text-white text-xs px-2 py-1 rounded font-medium shadow-sm">
        BEFORE
      </div>
      <div className="absolute top-4 right-4 bg-brand-orange/90 backdrop-blur-md text-white text-xs px-2 py-1 rounded font-medium shadow-sm z-10">
        AFTER
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

const TIPS = [
  "AI is detecting edges and subjects...",
  "Separating foreground from background...",
  "Refining hair and fine details...",
  "Almost done! Cleaning up edges..."
];

const PRESET_COLORS = [
  '#FFFFFF', // White
  '#000000', // Black
  '#F3F4F6', // Light Gray
  '#F97316', // Brand Orange
  '#EF4444', // Red
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#8B5CF6', // Purple
  '#EC4899', // Pink
];

type BgMode = 'transparent' | 'white' | 'black' | 'blur' | 'color' | 'image'

export default function BackgroundRemoverClient() {
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const customBgInputRef = useRef<HTMLInputElement>(null)
  
  const [status, setStatus] = useState<'idle' | 'loading_model' | 'processing' | 'done' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState("")
  const [toastMessage, setToastMessage] = useState("")
  
  // Progress states
  const [modelProgress, setModelProgress] = useState(0)
  const [modelProgressLabel, setModelProgressLabel] = useState("")
  const [processProgress, setProcessProgress] = useState(0)
  const [tipIndex, setTipIndex] = useState(0)

  // Image states
  const [originalFile, setOriginalFile] = useState<File | null>(null)
  const [originalUrl, setOriginalUrl] = useState<string | null>(null)
  const [originalImg, setOriginalImg] = useState<HTMLImageElement | null>(null)
  const [resultBlob, setResultBlob] = useState<Blob | null>(null) // the raw transparent PNG
  const [resultImg, setResultImg] = useState<HTMLImageElement | null>(null)
  const [timeTaken, setTimeTaken] = useState(0)
  
  // Background replacement
  const [bgMode, setBgMode] = useState<BgMode>('transparent')
  const [customColor, setCustomColor] = useState("#F97316")
  const [customBgImage, setCustomBgImage] = useState<HTMLImageElement | null>(null)
  
  const [finalUrl, setFinalUrl] = useState<string | null>(null)
  const [finalBlob, setFinalBlob] = useState<Blob | null>(null)
  const [finalJpgBlob, setFinalJpgBlob] = useState<Blob | null>(null)

  const ACCEPTED = "image/*"

  // WebAssembly Check
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.WebAssembly) {
      setStatus('error')
      setErrorMsg('Your browser does not support WebAssembly. Please use Chrome, Firefox, Safari or Edge.')
    }
  }, [])

  // Rotate tips
  useEffect(() => {
    if (status === 'processing') {
      const interval = setInterval(() => {
        setTipIndex(i => (i + 1) % TIPS.length)
      }, 2000)
      return () => clearInterval(interval)
    }
  }, [status])

  // Page title sync
  useEffect(() => {
    if (status === 'processing' || status === 'loading_model') {
      document.title = "Removing background... | ToolHive"
    } else {
      document.title = "Free Background Remover Online - Remove Image Background Instantly | ToolHive"
    }
  }, [status])

  // Handle Ctrl+S
  useEffect(() => {
    const handleShortcut = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s" && status === 'done' && finalBlob) {
        e.preventDefault()
        downloadResult(bgMode === 'transparent' ? 'png' : 'jpg')
      }
    }
    window.addEventListener("keydown", handleShortcut)
    return () => window.removeEventListener("keydown", handleShortcut)
  }, [status, finalBlob, bgMode])

  const loadHtmlImage = (url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = url
    })
  }

  const handleFiles = async (files: FileList | File[]) => {
    if (files.length === 0) return
    const file = files[0]

    if (!file.type.startsWith("image/")) {
      setStatus('error')
      setErrorMsg('⚠ Only image files are supported.')
      return
    }

    if (file.size > 100 * 1024 * 1024) {
      setStatus('error')
      setErrorMsg('⚠ File too large. Please use an image under 100MB.')
      return
    }

    resetState()
    setOriginalFile(file)
    const url = URL.createObjectURL(file)
    setOriginalUrl(url)
    
    try {
      const img = await loadHtmlImage(url)
      setOriginalImg(img)
    } catch (e) {
      console.error(e)
    }

    processImage(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  const processImage = async (file: File) => {
    setStatus('loading_model')
    setProcessProgress(0)
    const startTime = performance.now()

    const config: Config = {
      progress: (key, current, total) => {
        const percent = Math.round((current / total) * 100)
        
        if (key.includes('fetch') || key.includes('wasm')) {
          setStatus('loading_model')
          setModelProgress(percent)
          setModelProgressLabel(key.split('/').pop() || key)
        } else if (key.includes('compute')) {
          setStatus('processing')
          setProcessProgress(percent)
        } else {
          setStatus('processing')
        }
      }
    }

    try {
      const blob = await removeBackground(file, config)
      const rUrl = URL.createObjectURL(blob)
      setResultBlob(blob)
      
      const rImg = await loadHtmlImage(rUrl)
      setResultImg(rImg)
      
      setTimeTaken((performance.now() - startTime) / 1000)
      setStatus('done')
      setBgMode('transparent')
      
      // Initial final setup
      setFinalBlob(blob)
      setFinalUrl(rUrl)
      
    } catch (error: any) {
      console.error('Background removal failed:', error)
      setStatus('error')
      if (!window.navigator.onLine) {
        setErrorMsg('⚠ Could not load AI model. Check your internet connection and refresh the page.')
      } else {
        setErrorMsg('⚠ Could not process this image. Try a clearer photo with an obvious subject and background.')
      }
    }
  }

  // Composite background
  useEffect(() => {
    if (!resultImg || !originalImg || status !== 'done') return

    const generateComposite = async () => {
      if (bgMode === 'transparent') {
        setFinalBlob(resultBlob)
        setFinalUrl(URL.createObjectURL(resultBlob!))
        return
      }

      const canvas = document.createElement('canvas')
      canvas.width = originalImg.width
      canvas.height = originalImg.height
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      if (bgMode === 'white') {
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      } else if (bgMode === 'black') {
        ctx.fillStyle = '#000000'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      } else if (bgMode === 'color') {
        ctx.fillStyle = customColor
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      } else if (bgMode === 'blur') {
        ctx.filter = 'blur(15px)'
        ctx.drawImage(originalImg, 0, 0)
        ctx.filter = 'none'
      } else if (bgMode === 'image' && customBgImage) {
        const scale = Math.max(
          canvas.width / customBgImage.width,
          canvas.height / customBgImage.height
        )
        const bw = customBgImage.width * scale
        const bh = customBgImage.height * scale
        const bx = (canvas.width - bw) / 2
        const by = (canvas.height - bh) / 2
        ctx.drawImage(customBgImage, bx, by, bw, bh)
      } else if (bgMode === 'image' && !customBgImage) {
        // user selected image but hasn't uploaded one yet, fallback to transparent visual temporarily
        setFinalBlob(resultBlob)
        setFinalUrl(URL.createObjectURL(resultBlob!))
        return
      }

      // Draw the result on top
      ctx.drawImage(resultImg, 0, 0)

      canvas.toBlob((blob) => {
        if (blob) {
          setFinalBlob(blob)
          setFinalUrl(URL.createObjectURL(blob))
        }
      }, 'image/png')
      
      canvas.toBlob((blob) => {
        if (blob) setFinalJpgBlob(blob)
      }, 'image/jpeg', 0.92)
    }

    generateComposite()
  }, [bgMode, customColor, customBgImage, resultImg, originalImg, status, resultBlob])

  const handleCustomBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    const file = e.target.files[0]
    const url = URL.createObjectURL(file)
    try {
      const img = await loadHtmlImage(url)
      setCustomBgImage(img)
      setBgMode('image')
    } catch (err) {
      console.error(err)
    }
  }

  const downloadResult = (format: 'png' | 'jpg') => {
    if (!finalBlob || !originalFile) return
    const blobToDownload = format === 'jpg' && finalJpgBlob ? finalJpgBlob : finalBlob
    
    const baseName = originalFile.name.replace(/\.[^/.]+$/, '')
    const filename = `${baseName}_no_bg.${format}`
    const url = URL.createObjectURL(blobToDownload)
    
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    setToastMessage("✓ Download started!")
  }

  const resetState = () => {
    setStatus('idle')
    setOriginalFile(null)
    setOriginalUrl(null)
    setOriginalImg(null)
    setResultBlob(null)
    setResultImg(null)
    setFinalBlob(null)
    setFinalJpgBlob(null)
    setFinalUrl(null)
    setErrorMsg("")
    setBgMode('transparent')
    setCustomBgImage(null)
  }

  return (
    <>
      <Toast message={toastMessage} visible={!!toastMessage} onClose={() => setToastMessage("")} />

      {/* Adding checkered background style globally for this component scope */}
      <style dangerouslySetInnerHTML={{__html: `
        .checkered-bg {
          background-image: 
            linear-gradient(45deg, #e5e7eb 25%, transparent 25%),
            linear-gradient(-45deg, #e5e7eb 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #e5e7eb 75%),
            linear-gradient(-45deg, transparent 75%, #e5e7eb 75%);
          background-size: 16px 16px;
          background-position: 0 0, 0 8px, 8px -8px, -8px 0px;
          background-color: white;
        }
        .dark .checkered-bg {
          background-image: 
            linear-gradient(45deg, #374151 25%, transparent 25%),
            linear-gradient(-45deg, #374151 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #374151 75%),
            linear-gradient(-45deg, transparent 75%, #374151 75%);
          background-color: #1f2937;
        }
      `}} />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight className="size-3.5" />
          <Link href="/#image-tools" className="hover:text-foreground transition-colors">Image Tools</Link>
          <ChevronRight className="size-3.5" />
          <span className="text-foreground font-medium">Background Remover</span>
        </nav>

        <div className="mb-8 text-center max-w-3xl mx-auto">
          <h1 className="font-heading text-3xl font-bold sm:text-4xl sm:leading-[1.1] mb-3">
            Background Remover — <span className="text-gradient">Remove Image Background Free</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Remove background from any photo instantly using AI. Get a transparent PNG in seconds — no signup, no watermark, 100% free. Your image never leaves your device.
          </p>
        </div>

        {/* USE CASES */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {[
            { icon: "👤", label: "Profile Photos" },
            { icon: "📦", label: "Product Images" },
            { icon: "🎨", label: "Graphic Design" },
            { icon: "🪪", label: "ID & Passport" },
            { icon: "🛒", label: "E-commerce" },
            { icon: "📱", label: "App Icons" }
          ].map(c => (
            <Badge key={c.label} variant="secondary" className="px-3 py-1.5 text-xs font-normal border-border bg-card hover:bg-muted cursor-default">
              <span className="mr-1.5">{c.icon}</span> {c.label}
            </Badge>
          ))}
        </div>

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
              <input ref={inputRef} type="file" accept={ACCEPTED} className="hidden" onChange={(e) => e.target.files && handleFiles(e.target.files)} />
              
              {/* Animated dashed border effect using SVG or CSS - using standard border for now, with orange glow when drag */}
              
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10 pointer-events-none">
                <div className="mb-6 flex size-20 items-center justify-center rounded-3xl bg-brand-orange/10 text-brand-orange shadow-inner">
                  <Scissors className="size-10" />
                </div>
                <h3 className="font-heading text-2xl font-bold mb-2">Drop your image here to remove background</h3>
                <p className="text-muted-foreground mb-6">or click to browse from your device</p>
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground bg-background/50 px-3 py-1.5 rounded-full border border-border">
                  <span>All image formats supported</span>
                  <span className="w-1 h-1 rounded-full bg-border"></span>
                  <span>Max 100MB</span>
                </div>
              </div>
            </div>
          )}

          {/* STATE: ERROR */}
          {status === 'error' && (
            <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center animate-in zoom-in-95">
              <AlertTriangle className="size-12 text-destructive mx-auto mb-4" />
              <h3 className="font-bold text-lg text-destructive mb-2">Error Processing Image</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">{errorMsg}</p>
              <Button onClick={resetState} className="bg-brand-orange hover:bg-brand-orange-hover text-white">
                <RefreshCw className="size-4 mr-2" /> Try Again
              </Button>
            </div>
          )}

          {/* STATE: LOADING / PROCESSING */}
          {(status === 'loading_model' || status === 'processing') && (
            <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm animate-in fade-in">
              <div className="p-8 text-center relative overflow-hidden">
                
                {/* Background blurred preview */}
                {originalUrl && (
                  <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
                    <img src={originalUrl} alt="" className="w-full h-full object-cover blur-xl scale-110" />
                  </div>
                )}
                
                <div className="relative z-10 max-w-md mx-auto py-8">
                  {status === 'loading_model' ? (
                    <>
                      <div className="text-4xl mb-4">🤖</div>
                      <h3 className="font-bold text-xl mb-6">Loading AI Model...</h3>
                      
                      <div className="w-full bg-muted rounded-full h-3 mb-2 overflow-hidden border border-border">
                        <div className="bg-brand-orange h-3 rounded-full transition-all duration-300 relative overflow-hidden" style={{width: `${modelProgress}%`}}>
                          <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]"></div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between text-xs text-muted-foreground mb-6 font-mono">
                        <span className="truncate pr-4">{modelProgressLabel || 'Initializing...'}</span>
                        <span>{modelProgress}%</span>
                      </div>
                      
                      <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground border border-border/50 text-left">
                        <p className="font-medium text-foreground flex items-center gap-2 mb-1">
                          <Info className="size-4 text-brand-orange" /> First-time setup
                        </p>
                        <p>Downloading the AI model. This takes 10-30 seconds depending on your internet speed. After this first load, it works instantly!</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-4xl mb-4 animate-bounce">✨</div>
                      <h3 className="font-bold text-xl mb-6 text-brand-orange">AI is removing background...</h3>
                      
                      <div className="w-full bg-muted rounded-full h-3 mb-2 overflow-hidden border border-border">
                        <div className="bg-brand-orange h-3 rounded-full transition-all duration-300" style={{width: `${processProgress || 100}%`}}></div>
                      </div>
                      
                      <p className="text-sm font-medium text-muted-foreground h-6 animate-pulse">
                        {TIPS[tipIndex]}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STATE: DONE */}
          {status === 'done' && originalUrl && finalUrl && originalFile && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-500">
              
              <BeforeAfterSlider 
                originalSrc={originalUrl} 
                compressedSrc={finalUrl} 
                isTransparent={bgMode === 'transparent'}
              />

              {/* Background Replacement Panel */}
              <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-semibold mb-4">
                  <Palette className="size-4 text-muted-foreground" /> Choose Background
                </div>
                
                <div className="space-y-5">
                  {/* Primary Options */}
                  <div className="flex flex-wrap gap-2">
                    <button 
                      onClick={() => setBgMode('transparent')} 
                      className={`px-4 py-2 text-sm font-medium rounded-lg border flex items-center gap-2 transition-colors ${bgMode === 'transparent' ? 'border-brand-orange bg-brand-orange/10 text-brand-orange shadow-sm' : 'border-border bg-background hover:bg-muted'}`}
                    >
                      <span className="w-4 h-4 rounded-sm checkered-bg border border-border/50"></span> Transparent
                    </button>
                    
                    <button 
                      onClick={() => setBgMode('blur')} 
                      className={`px-4 py-2 text-sm font-medium rounded-lg border flex items-center gap-2 transition-colors ${bgMode === 'blur' ? 'border-brand-orange bg-brand-orange/10 text-brand-orange shadow-sm' : 'border-border bg-background hover:bg-muted'}`}
                    >
                      <span className="w-4 h-4 rounded-sm bg-muted overflow-hidden relative border border-border/50"><div className="absolute inset-0 backdrop-blur-sm"></div></span> Blur Image
                    </button>
                    
                    <div className="relative flex items-center">
                      <input 
                        ref={customBgInputRef}
                        type="file" 
                        accept="image/*"
                        onChange={handleCustomBgUpload} 
                        className="hidden"
                      />
                      <button onClick={() => customBgInputRef.current?.click()} className={`px-4 py-2 text-sm font-medium rounded-lg border flex items-center gap-2 transition-colors ${bgMode === 'image' ? 'border-brand-orange bg-brand-orange/10 text-brand-orange shadow-sm' : 'border-border bg-background hover:bg-muted'}`}>
                        <ImageIcon className="size-4" /> Custom Image
                      </button>
                    </div>
                  </div>

                  {/* Solid Colors Palette */}
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Solid Colors</p>
                    <div className="flex flex-wrap gap-3">
                      {PRESET_COLORS.map(color => (
                        <button 
                          key={color} 
                          onClick={() => { setCustomColor(color); setBgMode('color'); }}
                          className={`size-8 rounded-full border shadow-sm transition-all hover:scale-110 hover:shadow-md ${bgMode === 'color' && customColor.toUpperCase() === color.toUpperCase() ? 'border-brand-orange scale-110 ring-2 ring-brand-orange/30' : 'border-border/50'}`}
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                      
                      <div className="relative flex items-center justify-center size-8 rounded-full border border-border bg-muted overflow-hidden hover:scale-110 transition-transform shadow-sm group" title="Custom Color">
                        <input 
                          type="color" 
                          value={bgMode === 'color' ? customColor : '#ffffff'} 
                          onChange={(e) => { setCustomColor(e.target.value); setBgMode('color'); }} 
                          className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
                        />
                        <div className="absolute inset-0 bg-gradient-to-tr from-brand-orange via-purple-500 to-blue-500 opacity-20 group-hover:opacity-100 transition-opacity"></div>
                        <Palette className="size-4 text-foreground relative z-0" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Panel */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                
                {/* Download Options */}
                <div className="md:col-span-7 rounded-xl border border-border bg-card p-5 shadow-sm flex flex-col justify-center space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="size-5 text-green-500" />
                    <h3 className="font-bold text-lg">Ready to Download</h3>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button 
                      onClick={() => downloadResult('png')} 
                      className="flex-1 bg-brand-orange hover:bg-brand-orange-hover text-white h-12 shadow-md shadow-brand-orange/20 cursor-pointer"
                    >
                      <Download className="size-4 mr-2" /> 
                      Download PNG
                    </Button>
                    
                    {bgMode !== 'transparent' && finalJpgBlob && (
                      <Button 
                        onClick={() => downloadResult('jpg')} 
                        variant="outline"
                        className="flex-1 h-12 cursor-pointer"
                      >
                        <Download className="size-4 mr-2" /> 
                        Download JPG
                      </Button>
                    )}
                  </div>
                  
                  <div className="flex justify-center gap-6 text-xs text-muted-foreground font-mono bg-muted/30 py-2 rounded-lg border border-border/50">
                    {finalBlob && <span>PNG: {formatBytes(finalBlob.size)}</span>}
                    {bgMode !== 'transparent' && finalJpgBlob && <span>JPG: {formatBytes(finalJpgBlob.size)}</span>}
                  </div>
                </div>

                {/* Info Card */}
                <div className="md:col-span-5 rounded-xl border border-border bg-muted/20 p-5 text-sm space-y-3">
                  <h4 className="font-semibold border-b border-border pb-2 mb-3">Processing Details</h4>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Original:</span>
                    <span className="font-mono truncate ml-4" title={originalFile.name}>{originalFile.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Resolution:</span>
                    <span className="font-mono">{originalImg?.width} × {originalImg?.height}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Background:</span>
                    <span className="font-medium capitalize">{bgMode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Time taken:</span>
                    <span className="font-mono">{timeTaken.toFixed(1)}s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Privacy:</span>
                    <span className="text-green-600 dark:text-green-400 font-medium">100% Local</span>
                  </div>
                </div>
              </div>

              {/* Reset Button */}
              <div className="flex justify-center pt-4">
                <Button variant="ghost" onClick={resetState} className="text-muted-foreground hover:text-foreground cursor-pointer">
                  <RefreshCw className="size-4 mr-2" /> Remove Background from Another Image
                </Button>
              </div>

            </div>
          )}

        </div>
      </div>
    </>
  )
}
