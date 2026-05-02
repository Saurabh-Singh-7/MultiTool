"use client"

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react"
import Link from "next/link"
import JSZip from "jszip"
import { ChevronRight, Upload, Download, Trash2, CheckCircle2, AlertTriangle, Type, Image as ImageIcon, Copy, Bold, Italic, Underline, Palette, RefreshCw, LayoutGrid, RotateCcw, Save, X, GripHorizontal, MousePointer2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"

type PositionType = 'TL' | 'TC' | 'TR' | 'ML' | 'MC' | 'MR' | 'BL' | 'BC' | 'BR' | 'CUSTOM'

interface Preset {
  id: string
  name: string
  type: 'text' | 'logo'
  settings: any
}

export default function AddWatermarkClient() {
  // File State
  const [files, setFiles] = useState<File[]>([])
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [baseImageObj, setBaseImageObj] = useState<HTMLImageElement | null>(null)
  
  const [isBatchMode, setIsBatchMode] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)
  
  // Watermark Settings State
  const [watermarkType, setWatermarkType] = useState<'text' | 'logo'>('text')
  
  // Text Settings
  const [watermarkText, setWatermarkText] = useState("© YourBrand 2025")
  const [fontFamily, setFontFamily] = useState("Arial")
  const [fontSize, setFontSize] = useState(48)
  const [isBold, setIsBold] = useState(false)
  const [isItalic, setIsItalic] = useState(false)
  const [isUnderline, setIsUnderline] = useState(false)
  const [textColor, setTextColor] = useState("#FFFFFF")
  
  const [hasStroke, setHasStroke] = useState(true)
  const [strokeColor, setStrokeColor] = useState("#000000")
  const [strokeWidth, setStrokeWidth] = useState(2)
  
  // Logo Settings
  const [logoImg, setLogoImg] = useState<HTMLImageElement | null>(null)
  const [logoSize, setLogoSize] = useState(20) // percentage of base image width
  
  // Shared Settings
  const [opacity, setOpacity] = useState(70)
  const [rotation, setRotation] = useState(0)
  
  // Position Settings
  const [position, setPosition] = useState<PositionType>('BR')
  const [margin, setMargin] = useState(20)
  const [isTileMode, setIsTileMode] = useState(false)
  const [tileSpacing, setTileSpacing] = useState(200)
  
  const [customX, setCustomX] = useState(100)
  const [customY, setCustomY] = useState(100)
  
  // Canvas & Interaction State
  const previewCanvasRef = useRef<HTMLCanvasElement>(null)
  const previewImgRef = useRef<HTMLImageElement>(null)
  const [previewDataUrl, setPreviewDataUrl] = useState<string>("")
  const [isDraggingWatermark, setIsDraggingWatermark] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  
  // Output Settings
  const [outputFormat, setOutputFormat] = useState('Same as input')
  const [outputQuality, setOutputQuality] = useState(95)
  const [outputFilename, setOutputFilename] = useState('')
  
  // Presets & UI State
  const [presets, setPresets] = useState<Preset[]>([])
  const [toastMessage, setToastMessage] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [isDone, setIsDone] = useState(false)

  const ACCEPTED_FILES = "image/jpeg,image/png,image/webp"
  const ACCEPTED_LOGOS = "image/png,image/jpeg,image/webp,image/svg+xml"

  const formatMap: Record<string, string> = {
    'JPG': 'image/jpeg',
    'PNG': 'image/png',
    'WebP': 'image/webp'
  }
  
  const extMap: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp'
  }

  const FONTS = [
    "Arial", "Georgia", "Times New Roman", "Courier New",
    "Impact", "Verdana", "Trebuchet MS", "Comic Sans MS",
    "Palatino", "Garamond"
  ]

  const COLORS = ["#FFFFFF", "#000000", "#F97316", "#EF4444", "#3B82F6", "#22C55E", "#EAB308", "#6B7280"]

  // Load presets on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('watermark_presets')
      if (saved) setPresets(JSON.parse(saved))
    } catch (e) {}
  }, [])

  useEffect(() => {
    if (toastMessage) {
      const t = setTimeout(() => setToastMessage(""), 3000)
      return () => clearTimeout(t)
    }
  }, [toastMessage])

  // Load the active image onto the baseImageObj
  useEffect(() => {
    if (files.length > 0 && files[activeImageIndex]) {
      const file = files[activeImageIndex]
      const url = URL.createObjectURL(file)
      const img = new Image()
      img.onload = () => {
        setBaseImageObj(img)
      }
      img.src = url
      setOutputFilename(file.name.replace(/\.[^/.]+$/, '') + '_watermarked')
      
      if (file.type === 'image/jpeg') setOutputFormat('JPG')
      else if (file.type === 'image/png') setOutputFormat('PNG')
      else if (file.type === 'image/webp') setOutputFormat('WebP')
      else setOutputFormat('Same as input')
    }
  }, [files, activeImageIndex])

  // Main Render Loop
  const drawWatermark = useCallback((canvasTarget?: HTMLCanvasElement, imgObj?: HTMLImageElement) => {
    const canvas = canvasTarget || previewCanvasRef.current
    const baseImg = imgObj || baseImageObj
    
    if (!canvas || !baseImg) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = baseImg.width
    canvas.height = baseImg.height

    // Draw base image
    ctx.drawImage(baseImg, 0, 0)

    ctx.globalAlpha = opacity / 100

    if (isTileMode) {
      // TILE MODE
      ctx.save()
      const spacing = tileSpacing
      for (let y = -baseImg.height; y < baseImg.height * 2; y += spacing) {
        for (let x = -baseImg.width; x < baseImg.width * 2; x += spacing) {
          ctx.save()
          ctx.translate(x, y)
          ctx.rotate((-45 * Math.PI) / 180)
          
          if (watermarkType === 'text' && watermarkText) {
            const fontStyleStr = [isBold ? 'bold' : '', isItalic ? 'italic' : ''].filter(Boolean).join(' ')
            ctx.font = `${fontStyleStr} ${fontSize}px ${fontFamily}`
            ctx.fillStyle = textColor
            ctx.textBaseline = 'middle'
            
            const txtMetrics = ctx.measureText(watermarkText)
            
            if (hasStroke) {
              ctx.strokeStyle = strokeColor
              ctx.lineWidth = strokeWidth
              ctx.lineJoin = 'round'
              ctx.strokeText(watermarkText, -txtMetrics.width/2, 0)
            }
            ctx.fillText(watermarkText, -txtMetrics.width/2, 0)
            
          } else if (watermarkType === 'logo' && logoImg) {
            const logoW = Math.round(baseImg.width * (logoSize / 100))
            const logoH = Math.round(logoW * (logoImg.height / logoImg.width))
            ctx.drawImage(logoImg, -logoW/2, -logoH/2, logoW, logoH)
          }
          
          ctx.restore()
        }
      }
      ctx.restore()
      
    } else {
      // SINGLE POSITION MODE
      if (watermarkType === 'text' && watermarkText) {
        const fontStyleStr = [isBold ? 'bold' : '', isItalic ? 'italic' : ''].filter(Boolean).join(' ')
        ctx.font = `${fontStyleStr} ${fontSize}px ${fontFamily}`
        ctx.fillStyle = textColor
        ctx.textBaseline = 'middle'
        
        const txtMetrics = ctx.measureText(watermarkText)
        const txtW = txtMetrics.width
        const txtH = fontSize // Approx
        
        let x = 0, y = 0
        if (position === 'CUSTOM') {
          x = customX
          y = customY
        } else {
          const pos = calculatePosition(position, baseImg.width, baseImg.height, txtW, txtH, margin)
          x = pos.x
          y = pos.y
        }

        ctx.save()
        ctx.translate(x + txtW / 2, y + txtH / 2)
        ctx.rotate((rotation * Math.PI) / 180)

        if (hasStroke) {
          ctx.strokeStyle = strokeColor
          ctx.lineWidth = strokeWidth
          ctx.lineJoin = 'round'
          ctx.strokeText(watermarkText, -txtW / 2, 0)
        }

        ctx.fillText(watermarkText, -txtW / 2, 0)

        if (isUnderline) {
          ctx.strokeStyle = textColor
          ctx.lineWidth = Math.max(1, fontSize / 15)
          ctx.beginPath()
          ctx.moveTo(-txtW / 2, fontSize * 0.3)
          ctx.lineTo(txtW / 2, fontSize * 0.3)
          ctx.stroke()
        }
        ctx.restore()

      } else if (watermarkType === 'logo' && logoImg) {
        const logoW = Math.round(baseImg.width * (logoSize / 100))
        const logoH = Math.round(logoW * (logoImg.height / logoImg.width))
        
        let x = 0, y = 0
        if (position === 'CUSTOM') {
          x = customX
          y = customY
        } else {
          const pos = calculatePosition(position, baseImg.width, baseImg.height, logoW, logoH, margin)
          x = pos.x
          y = pos.y
        }

        ctx.save()
        ctx.translate(x + logoW / 2, y + logoH / 2)
        ctx.rotate((rotation * Math.PI) / 180)
        ctx.drawImage(logoImg, -logoW / 2, -logoH / 2, logoW, logoH)
        ctx.restore()
      }
    }

    ctx.globalAlpha = 1.0

    // Only update the state preview URL if we are drawing to the main preview canvas
    if (!canvasTarget) {
      setPreviewDataUrl(canvas.toDataURL())
    }
  }, [
    baseImageObj, watermarkType, watermarkText, fontFamily, fontSize, isBold, isItalic, 
    isUnderline, textColor, hasStroke, strokeColor, strokeWidth, logoImg, logoSize, 
    opacity, rotation, position, margin, isTileMode, tileSpacing, customX, customY
  ])

  useEffect(() => {
    drawWatermark()
  }, [drawWatermark])

  const calculatePosition = (pos: PositionType, imgW: number, imgH: number, wmW: number, wmH: number, m: number) => {
    switch(pos) {
      case 'TL': return { x: m, y: m }
      case 'TC': return { x: (imgW - wmW) / 2, y: m }
      case 'TR': return { x: imgW - wmW - m, y: m }
      case 'ML': return { x: m, y: (imgH - wmH) / 2 }
      case 'MC': return { x: (imgW - wmW) / 2, y: (imgH - wmH) / 2 }
      case 'MR': return { x: imgW - wmW - m, y: (imgH - wmH) / 2 }
      case 'BL': return { x: m, y: imgH - wmH - m }
      case 'BC': return { x: (imgW - wmW) / 2, y: imgH - wmH - m }
      case 'BR': return { x: imgW - wmW - m, y: imgH - wmH - m }
      default: return { x: m, y: m }
    }
  }

  // --- Interaction Handlers ---
  
  const handleFilesDrop = (newFiles: FileList | File[]) => {
    const valid = Array.from(newFiles).filter(f => f.type.startsWith('image/') && f.size <= 50 * 1024 * 1024)
    if (valid.length === 0) {
      setToastMessage("⚠ Please upload valid images under 50MB.")
      return
    }
    
    if (isBatchMode) {
      const combined = [...files, ...valid].slice(0, 20)
      setFiles(combined)
    } else {
      setFiles([valid[0]])
    }
    setIsDone(false)
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    if (file.type === 'image/svg+xml') {
      const reader = new FileReader()
      reader.onload = (evt) => {
        const svgStr = evt.target?.result as string
        const blob = new Blob([svgStr], { type: 'image/svg+xml' })
        const url = URL.createObjectURL(blob)
        const img = new Image()
        img.onload = () => setLogoImg(img)
        img.src = url
      }
      reader.readAsText(file)
    } else {
      const url = URL.createObjectURL(file)
      const img = new Image()
      img.onload = () => setLogoImg(img)
      img.src = url
    }
    setWatermarkType('logo')
  }

  // Canvas Dragging
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (isTileMode || !baseImageObj || !previewImgRef.current) return
    
    const img = previewImgRef.current
    const rect = img.getBoundingClientRect()
    
    let clientX, clientY
    if ('touches' in e) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }
    
    // Convert click coordinates to actual image pixels
    const scaleX = baseImageObj.width / rect.width
    const scaleY = baseImageObj.height / rect.height
    const clickX = (clientX - rect.left) * scaleX
    const clickY = (clientY - rect.top) * scaleY

    // Determine current watermark bounding box
    let currentX = 0, currentY = 0, wmW = 0, wmH = 0
    
    const canvas = previewCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    if (watermarkType === 'text') {
      const fontStyleStr = [isBold ? 'bold' : '', isItalic ? 'italic' : ''].filter(Boolean).join(' ')
      ctx.font = `${fontStyleStr} ${fontSize}px ${fontFamily}`
      wmW = ctx.measureText(watermarkText).width
      wmH = fontSize
    } else if (watermarkType === 'logo' && logoImg) {
      wmW = Math.round(baseImageObj.width * (logoSize / 100))
      wmH = Math.round(wmW * (logoImg.height / logoImg.width))
    }
    
    if (position === 'CUSTOM') {
      currentX = customX
      currentY = customY
    } else {
      const pos = calculatePosition(position, baseImageObj.width, baseImageObj.height, wmW, wmH, margin)
      currentX = pos.x
      currentY = pos.y
    }
    
    // Rough hit detection (with some padding)
    const hitPadding = 20
    if (
      clickX >= currentX - hitPadding &&
      clickX <= currentX + wmW + hitPadding &&
      clickY >= currentY - hitPadding &&
      clickY <= currentY + wmH + hitPadding
    ) {
      setIsDraggingWatermark(true)
      setPosition('CUSTOM')
      setDragOffset({
        x: clickX - currentX,
        y: clickY - currentY
      })
    }
  }
  
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!isDraggingWatermark || !baseImageObj || !previewImgRef.current || !previewCanvasRef.current) return
    
    const img = previewImgRef.current
    const rect = img.getBoundingClientRect()
    
    let clientX, clientY
    if ('touches' in e) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }
    
    const scaleX = baseImageObj.width / rect.width
    const scaleY = baseImageObj.height / rect.height
    const mouseX = (clientX - rect.left) * scaleX
    const mouseY = (clientY - rect.top) * scaleY
    
    let newX = mouseX - dragOffset.x
    let newY = mouseY - dragOffset.y
    
    // Clamp to boundaries
    let wmW = 0, wmH = 0
    const canvas = previewCanvasRef.current
    const ctx = canvas.getContext('2d')
    if (ctx && watermarkType === 'text') {
      const fontStyleStr = [isBold ? 'bold' : '', isItalic ? 'italic' : ''].filter(Boolean).join(' ')
      ctx.font = `${fontStyleStr} ${fontSize}px ${fontFamily}`
      wmW = ctx.measureText(watermarkText).width
      wmH = fontSize
    } else if (watermarkType === 'logo' && logoImg) {
      wmW = Math.round(baseImageObj.width * (logoSize / 100))
      wmH = Math.round(wmW * (logoImg.height / logoImg.width))
    }
    
    newX = Math.max(0, Math.min(newX, baseImageObj.width - wmW))
    newY = Math.max(0, Math.min(newY, baseImageObj.height - wmH))
    
    setCustomX(newX)
    setCustomY(newY)
  }
  
  const handleCanvasMouseUp = () => {
    setIsDraggingWatermark(false)
  }

  // --- Processing & Download ---
  
  const processSingleImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file)
      const img = new Image()
      img.onload = () => {
        const c = document.createElement('canvas')
        drawWatermark(c, img)
        
        const targetMime = formatMap[outputFormat] || file.type
        const isLossy = targetMime === 'image/jpeg' || targetMime === 'image/webp'
        
        c.toBlob((blob) => {
          if (blob) resolve(blob)
          else reject(new Error("Failed to create blob"))
        }, targetMime, isLossy ? outputQuality / 100 : undefined)
      }
      img.onerror = reject
      img.src = url
    })
  }

  const downloadSingle = async () => {
    if (!files[activeImageIndex]) return
    if (watermarkType === 'text' && !watermarkText) {
      setToastMessage("⚠ Please enter watermark text")
      return
    }
    if (watermarkType === 'logo' && !logoImg) {
      setToastMessage("⚠ Please upload a logo image")
      return
    }
    
    setIsProcessing(true)
    try {
      const blob = await processSingleImage(files[activeImageIndex])
      const file = files[activeImageIndex]
      const baseName = file.name.replace(/\.[^/.]+$/, '')
      const targetMime = formatMap[outputFormat] || file.type
      const ext = extMap[targetMime] || 'png'
      const finalName = outputFilename ? `${outputFilename}.${ext}` : `${baseName}_watermarked.${ext}`
      
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = finalName
      a.click()
      URL.revokeObjectURL(url)
      
      setIsDone(true)
      setToastMessage("✓ Watermarked image downloaded!")
    } catch (e) {
      setToastMessage("⚠ Error processing image")
    } finally {
      setIsProcessing(false)
    }
  }

  const downloadBatch = async () => {
    if (files.length === 0) return
    setIsProcessing(true)
    setProcessingProgress(0)
    
    try {
      const zip = new JSZip()
      
      for (let i = 0; i < files.length; i++) {
        setProcessingProgress(Math.round(((i) / files.length) * 100))
        const file = files[i]
        const blob = await processSingleImage(file)
        
        const baseName = file.name.replace(/\.[^/.]+$/, '')
        const targetMime = formatMap[outputFormat] || file.type
        const ext = extMap[targetMime] || 'png'
        
        zip.file(`${baseName}_watermarked.${ext}`, blob)
      }
      
      setProcessingProgress(100)
      const zipBlob = await zip.generateAsync({ type: 'blob' })
      const url = URL.createObjectURL(zipBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'watermarked_images.zip'
      a.click()
      URL.revokeObjectURL(url)
      
      setIsDone(true)
      setToastMessage("✓ ZIP file downloaded!")
    } catch (e) {
      setToastMessage("⚠ Error processing batch")
    } finally {
      setIsProcessing(false)
      setProcessingProgress(0)
    }
  }

  const savePreset = () => {
    const name = prompt("Enter a name for this preset:", "My Brand Watermark")
    if (!name) return
    
    const newPreset: Preset = {
      id: Date.now().toString(),
      name,
      type: watermarkType,
      settings: {
        watermarkText, fontFamily, fontSize, isBold, isItalic, isUnderline,
        textColor, hasStroke, strokeColor, strokeWidth,
        logoSize, opacity, rotation, position, margin, isTileMode, tileSpacing
      }
    }
    
    const newPresets = [...presets, newPreset]
    setPresets(newPresets)
    localStorage.setItem('watermark_presets', JSON.stringify(newPresets))
    setToastMessage("✓ Preset saved!")
  }

  const applyPreset = (p: Preset) => {
    setWatermarkType(p.type)
    const s = p.settings
    if (s.watermarkText !== undefined) setWatermarkText(s.watermarkText)
    if (s.fontFamily !== undefined) setFontFamily(s.fontFamily)
    if (s.fontSize !== undefined) setFontSize(s.fontSize)
    if (s.isBold !== undefined) setIsBold(s.isBold)
    if (s.isItalic !== undefined) setIsItalic(s.isItalic)
    if (s.isUnderline !== undefined) setIsUnderline(s.isUnderline)
    if (s.textColor !== undefined) setTextColor(s.textColor)
    if (s.hasStroke !== undefined) setHasStroke(s.hasStroke)
    if (s.strokeColor !== undefined) setStrokeColor(s.strokeColor)
    if (s.strokeWidth !== undefined) setStrokeWidth(s.strokeWidth)
    if (s.logoSize !== undefined) setLogoSize(s.logoSize)
    if (s.opacity !== undefined) setOpacity(s.opacity)
    if (s.rotation !== undefined) setRotation(s.rotation)
    if (s.position !== undefined) setPosition(s.position)
    if (s.margin !== undefined) setMargin(s.margin)
    if (s.isTileMode !== undefined) setIsTileMode(s.isTileMode)
    if (s.tileSpacing !== undefined) setTileSpacing(s.tileSpacing)
    setToastMessage(`✓ Applied preset: ${p.name}`)
  }

  const deletePreset = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    const newP = presets.filter(p => p.id !== id)
    setPresets(newP)
    localStorage.setItem('watermark_presets', JSON.stringify(newP))
  }

  const resetAll = () => {
    setFiles([])
    setBaseImageObj(null)
    setPreviewDataUrl("")
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

      {/* Hidden Canvas for Processing */}
      <canvas ref={previewCanvasRef} className="hidden" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        
        {/* BREADCRUMB & HEADER */}
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight className="size-3.5" />
          <Link href="/#image-tools" className="hover:text-foreground transition-colors">Image Tools</Link>
          <ChevronRight className="size-3.5" />
          <span className="text-foreground font-medium">Add Watermark</span>
        </nav>

        <div className="mb-8 text-center max-w-3xl mx-auto">
          <h1 className="font-heading text-3xl font-bold sm:text-4xl sm:leading-[1.1] mb-3">
            Add Watermark to Image — <span className="text-gradient">Free Online Tool</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Protect your photos and artwork by adding a text or logo watermark. Customize position, opacity, size and style — download instantly, no signup needed, 100% free.
          </p>
        </div>

        {/* UPLOAD ZONE */}
        {files.length === 0 && (
          <div className="max-w-4xl mx-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-muted p-1 rounded-lg inline-flex">
                <button onClick={() => setIsBatchMode(false)} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${!isBatchMode ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>Single Image</button>
                <button onClick={() => setIsBatchMode(true)} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${isBatchMode ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>Batch Mode</button>
              </div>
            </div>

            <div
              className={`relative rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer overflow-hidden ${
                isDragging ? "border-brand-orange bg-brand-orange/5 scale-[1.01]" : "border-border hover:border-brand-orange/50 hover:bg-muted/50 bg-card"
              }`}
              style={{ minHeight: '400px' }}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFilesDrop(e.dataTransfer.files) }}
              onClick={() => fileInputRef.current?.click()}
            >
              <input ref={fileInputRef} type="file" multiple={isBatchMode} accept={ACCEPTED_FILES} className="hidden" onChange={(e) => e.target.files && handleFilesDrop(e.target.files)} />
              
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10 pointer-events-none">
                <div className="mb-6 flex size-20 items-center justify-center rounded-3xl bg-brand-orange/10 text-brand-orange shadow-inner text-4xl">
                  🛡️
                </div>
                <h3 className="font-heading text-2xl font-bold mb-2">
                  Drop your image{isBatchMode ? 's' : ''} here to add watermark
                </h3>
                <p className="text-muted-foreground mb-6">or click to browse from your device</p>
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground bg-background/50 px-3 py-1.5 rounded-full border border-border">
                  <span>JPG, PNG, WebP</span>
                  <span className="w-1 h-1 rounded-full bg-border"></span>
                  <span>Max 50MB {isBatchMode && '(Up to 20 files)'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* WORKSPACE */}
        {files.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-8 animate-in fade-in">
            
            {/* LEFT COLUMN: Settings Panel */}
            <div className="space-y-6 flex flex-col">
              
              {/* Presets */}
              {presets.length > 0 && (
                <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center justify-between">
                    Saved Presets
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {presets.map(p => (
                      <div key={p.id} className="group flex items-center bg-muted/50 hover:bg-muted border border-border rounded-full text-xs font-medium pr-1 cursor-pointer transition-colors" onClick={() => applyPreset(p)}>
                        <span className="px-3 py-1.5">{p.name}</span>
                        <button onClick={(e) => deletePreset(e, p.id)} className="p-1 text-muted-foreground hover:text-red-500 rounded-full hover:bg-background"><X className="size-3" /></button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="rounded-xl border border-border bg-card shadow-sm flex-1 overflow-hidden flex flex-col">
                
                {/* Tabs */}
                <div className="flex border-b border-border bg-muted/30">
                  <button 
                    onClick={() => setWatermarkType('text')}
                    className={`flex-1 py-3 text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${watermarkType === 'text' ? 'bg-background text-foreground border-b-2 border-brand-orange' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    <Type className="size-4" /> Text Watermark
                  </button>
                  <button 
                    onClick={() => setWatermarkType('logo')}
                    className={`flex-1 py-3 text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${watermarkType === 'logo' ? 'bg-background text-foreground border-b-2 border-brand-orange' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    <ImageIcon className="size-4" /> Logo/Image
                  </button>
                </div>

                <div className="p-5 space-y-6 overflow-y-auto max-h-[800px] scrollbar-thin">
                  
                  {watermarkType === 'text' ? (
                    <>
                      {/* Text Input */}
                      <div>
                        <label className="text-xs font-bold uppercase text-muted-foreground mb-2 flex justify-between">
                          Text <span className="font-mono">{watermarkText.length}/100</span>
                        </label>
                        <input 
                          type="text" 
                          maxLength={100}
                          value={watermarkText}
                          onChange={(e) => setWatermarkText(e.target.value)}
                          placeholder="© YourBrand 2025"
                          className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-brand-orange focus:outline-none"
                        />
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {["© 2025", "Confidential", "Draft", "Sample", "Do Not Copy"].map(t => (
                            <button key={t} onClick={() => setWatermarkText(t)} className="text-[10px] bg-muted hover:bg-muted/80 text-muted-foreground px-2 py-1 rounded border border-border">{t}</button>
                          ))}
                        </div>
                      </div>

                      {/* Font Family & Style */}
                      <div className="grid grid-cols-[1fr_auto] gap-3">
                        <div>
                          <label className="text-xs font-bold uppercase text-muted-foreground mb-2 block">Font Family</label>
                          <select value={fontFamily} onChange={(e) => setFontFamily(e.target.value)} className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-brand-orange focus:outline-none">
                            {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-bold uppercase text-muted-foreground mb-2 block">Style</label>
                          <div className="flex bg-muted rounded-md p-0.5 border border-input">
                            <button onClick={() => setIsBold(!isBold)} className={`p-1.5 rounded ${isBold ? 'bg-background shadow-sm' : 'hover:bg-background/50'}`}><Bold className="size-4" /></button>
                            <button onClick={() => setIsItalic(!isItalic)} className={`p-1.5 rounded ${isItalic ? 'bg-background shadow-sm' : 'hover:bg-background/50'}`}><Italic className="size-4" /></button>
                            <button onClick={() => setIsUnderline(!isUnderline)} className={`p-1.5 rounded ${isUnderline ? 'bg-background shadow-sm' : 'hover:bg-background/50'}`}><Underline className="size-4" /></button>
                          </div>
                        </div>
                      </div>

                      {/* Font Size */}
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-xs font-bold uppercase text-muted-foreground block">Size: {fontSize}px</label>
                          <div className="flex gap-1">
                            <button onClick={() => setFontSize(24)} className="text-[10px] px-1.5 py-0.5 rounded border border-border hover:bg-muted">S</button>
                            <button onClick={() => setFontSize(48)} className="text-[10px] px-1.5 py-0.5 rounded border border-border hover:bg-muted">M</button>
                            <button onClick={() => setFontSize(80)} className="text-[10px] px-1.5 py-0.5 rounded border border-border hover:bg-muted">L</button>
                            <button onClick={() => setFontSize(120)} className="text-[10px] px-1.5 py-0.5 rounded border border-border hover:bg-muted">XL</button>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <Slider value={[fontSize]} min={10} max={300} step={1} onValueChange={(v) => setFontSize(Array.isArray(v) ? v[0] : v)} className="flex-1" />
                          <input type="number" value={fontSize} onChange={e => setFontSize(parseInt(e.target.value) || 48)} className="w-14 text-center text-xs bg-background border border-input rounded focus:outline-none focus:ring-1 focus:ring-brand-orange" />
                        </div>
                      </div>

                      {/* Colors */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold uppercase text-muted-foreground mb-2 block">Text Color</label>
                          <div className="flex gap-2">
                            <input type="color" value={textColor} onChange={e => setTextColor(e.target.value)} className="h-8 w-8 rounded cursor-pointer border border-input p-0" />
                            <div className="flex flex-wrap gap-1 flex-1">
                              {COLORS.map(c => (
                                <button key={c} onClick={() => setTextColor(c)} className={`size-4 rounded-full border shadow-sm ${textColor === c ? 'ring-2 ring-brand-orange ring-offset-1 ring-offset-card' : 'border-border'}`} style={{backgroundColor: c}} />
                              ))}
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-bold uppercase text-muted-foreground mb-2 flex justify-between items-center">
                            <span>Stroke/Outline</span>
                            <input type="checkbox" checked={hasStroke} onChange={e => setHasStroke(e.target.checked)} className="rounded border-input text-brand-orange focus:ring-brand-orange" />
                          </label>
                          {hasStroke && (
                            <div className="flex items-center gap-2 animate-in slide-in-from-top-1 fade-in">
                              <input type="color" value={strokeColor} onChange={e => setStrokeColor(e.target.value)} className="h-8 w-8 rounded cursor-pointer border border-input p-0" />
                              <Slider value={[strokeWidth]} min={1} max={10} step={1} onValueChange={(v) => setStrokeWidth(Array.isArray(v) ? v[0] : v)} className="flex-1" />
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Logo Upload */}
                      <div>
                        <label className="text-xs font-bold uppercase text-muted-foreground mb-2 block">Logo Image</label>
                        <div 
                          onClick={() => logoInputRef.current?.click()}
                          className="border-2 border-dashed border-border hover:border-brand-orange/50 rounded-lg p-4 text-center cursor-pointer transition-colors bg-muted/20"
                        >
                          <input ref={logoInputRef} type="file" accept={ACCEPTED_LOGOS} className="hidden" onChange={handleLogoUpload} />
                          {logoImg ? (
                            <div className="flex flex-col items-center">
                              <div className="h-16 mb-2 rounded border border-border bg-white/5 checkered-bg flex items-center justify-center overflow-hidden w-max px-4">
                                <img src={logoImg.src} alt="Logo Preview" className="h-full object-contain" />
                              </div>
                              <span className="text-xs text-brand-orange font-medium">Click to change logo</span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center">
                              <Upload className="size-6 text-muted-foreground mb-2" />
                              <span className="text-sm font-medium">Upload Logo / Signature</span>
                              <span className="text-[10px] text-muted-foreground mt-1">PNG with transparent background best</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Logo Size */}
                      <div>
                        <label className="text-xs font-bold uppercase text-muted-foreground mb-2 flex justify-between">
                          <span>Logo Size: {logoSize}%</span>
                          <span className="font-mono text-[10px] lowercase text-muted-foreground/70">of image width</span>
                        </label>
                        <Slider value={[logoSize]} min={5} max={80} step={1} onValueChange={(v) => setLogoSize(Array.isArray(v) ? v[0] : v)} />
                      </div>
                    </>
                  )}

                  <hr className="border-border" />

                  {/* Shared Transforms: Opacity & Rotation */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold uppercase text-muted-foreground mb-2 block">Opacity: {opacity}%</label>
                      <Slider value={[opacity]} min={5} max={100} step={1} onValueChange={(v) => setOpacity(Array.isArray(v) ? v[0] : v)} />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase text-muted-foreground mb-2 block">Rotation: {rotation}°</label>
                      <Slider value={[rotation]} min={-180} max={180} step={1} onValueChange={(v) => setRotation(Array.isArray(v) ? v[0] : v)} />
                      <div className="flex gap-1 mt-2 justify-between">
                        {[-45, 0, 45, 90].map(deg => (
                          <button key={deg} onClick={() => setRotation(deg)} className="text-[10px] px-1.5 py-0.5 bg-muted rounded border border-border hover:bg-muted/80">{deg}°</button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <hr className="border-border" />

                  {/* Positioning Engine */}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <label className="text-xs font-bold uppercase text-muted-foreground block">Position</label>
                      <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                        <input type="checkbox" checked={isTileMode} onChange={(e) => setIsTileMode(e.target.checked)} className="rounded border-input text-brand-orange focus:ring-brand-orange" />
                        🔲 Tile Mode
                      </label>
                    </div>

                    {isTileMode ? (
                      <div className="bg-brand-orange/5 border border-brand-orange/20 rounded-lg p-4 animate-in fade-in">
                        <p className="text-xs text-muted-foreground mb-3">Watermark will be repeated diagonally across the entire image.</p>
                        <label className="text-xs font-bold uppercase text-muted-foreground mb-2 block">Spacing: {tileSpacing}px</label>
                        <Slider value={[tileSpacing]} min={50} max={800} step={10} onValueChange={(v) => setTileSpacing(Array.isArray(v) ? v[0] : v)} />
                      </div>
                    ) : (
                      <div className="flex gap-6 animate-in fade-in">
                        {/* 3x3 Grid */}
                        <div className="shrink-0 bg-muted/50 p-1.5 rounded-lg border border-border relative">
                          <div className="grid grid-cols-3 gap-1">
                            {(['TL', 'TC', 'TR', 'ML', 'MC', 'MR', 'BL', 'BC', 'BR'] as PositionType[]).map(pos => (
                              <button 
                                key={pos} 
                                onClick={() => setPosition(pos)}
                                className={`size-8 rounded flex items-center justify-center text-[10px] font-bold transition-colors ${position === pos ? 'bg-brand-orange text-white shadow-md' : 'bg-background border border-border hover:bg-muted text-muted-foreground'}`}
                              >
                                {pos}
                              </button>
                            ))}
                          </div>
                          {position === 'CUSTOM' && (
                            <div className="absolute inset-0 bg-background/80 backdrop-blur-[1px] rounded-lg flex items-center justify-center text-xs font-bold text-brand-orange">CUSTOM</div>
                          )}
                        </div>

                        <div className="flex-1 space-y-4">
                          <div>
                            <label className="text-[10px] font-bold uppercase text-muted-foreground mb-1 block">Margin Edge</label>
                            <div className="flex gap-2">
                              <Slider value={[margin]} min={0} max={200} step={1} onValueChange={(v) => {setMargin(Array.isArray(v) ? v[0] : v); if(position==='CUSTOM') setPosition('BR')}} className="flex-1" />
                              <span className="text-[10px] font-mono w-6">{margin}</span>
                            </div>
                          </div>
                          <div className="pt-2 border-t border-border">
                            <label className="text-[10px] font-bold uppercase text-muted-foreground mb-2 flex justify-between">
                              <span>Exact Position (px)</span>
                              <span className="font-normal text-muted-foreground/70">or drag on canvas</span>
                            </label>
                            <div className="flex gap-2">
                              <input type="number" placeholder="X" value={Math.round(customX)} onChange={e => {setCustomX(parseInt(e.target.value)||0); setPosition('CUSTOM')}} className="w-1/2 bg-background border border-input rounded text-xs px-2 py-1 font-mono focus:ring-1 focus:ring-brand-orange focus:outline-none" />
                              <input type="number" placeholder="Y" value={Math.round(customY)} onChange={e => {setCustomY(parseInt(e.target.value)||0); setPosition('CUSTOM')}} className="w-1/2 bg-background border border-input rounded text-xs px-2 py-1 font-mono focus:ring-1 focus:ring-brand-orange focus:outline-none" />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Save Preset Button */}
                <div className="p-3 border-t border-border bg-muted/20">
                  <Button variant="outline" size="sm" onClick={savePreset} className="w-full text-xs font-medium h-8 bg-background">
                    <Save className="size-3.5 mr-2" /> Save Current Settings as Preset
                  </Button>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Live Preview & Output */}
            <div className="space-y-6 min-w-0">
              
              {/* Batch Selector (if multiple files) */}
              {isBatchMode && files.length > 1 && (
                <div className="rounded-xl border border-border bg-card shadow-sm p-3 flex gap-2 overflow-x-auto scrollbar-thin">
                  {files.map((file, i) => (
                    <button 
                      key={i} 
                      onClick={() => setActiveImageIndex(i)}
                      className={`shrink-0 h-16 w-24 rounded-lg border-2 overflow-hidden relative transition-all ${activeImageIndex === i ? 'border-brand-orange opacity-100' : 'border-transparent opacity-50 hover:opacity-100'}`}
                    >
                      <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" alt="" />
                      <div className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-[9px] px-1 truncate">{file.name}</div>
                    </button>
                  ))}
                </div>
              )}

              {/* Live Preview Canvas Wrapper */}
              <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden relative">
                <div className="absolute top-3 left-3 z-10 bg-black/70 backdrop-blur-md text-white px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider pointer-events-none flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> LIVE PREVIEW
                </div>
                {baseImageObj && baseImageObj.width < 300 && (
                  <div className="absolute top-3 right-3 z-10 bg-amber-500 text-black px-2 py-1 rounded-md text-[10px] font-bold shadow-md pointer-events-none">
                    Small Image Warning
                  </div>
                )}
                
                <div className="bg-muted checkered-bg w-full h-[500px] flex items-center justify-center p-4 relative select-none">
                  {previewDataUrl && (
                    <div 
                      className={`relative shadow-2xl transition-transform ${isDraggingWatermark ? 'cursor-grabbing' : 'cursor-grab'}`}
                      onMouseDown={handleCanvasMouseDown}
                      onMouseMove={handleCanvasMouseMove}
                      onMouseUp={handleCanvasMouseUp}
                      onMouseLeave={handleCanvasMouseUp}
                      onTouchStart={handleCanvasMouseDown}
                      onTouchMove={handleCanvasMouseMove}
                      onTouchEnd={handleCanvasMouseUp}
                    >
                      <img ref={previewImgRef} src={previewDataUrl} alt="Live Watermark Preview" className="max-w-full max-h-[460px] object-contain pointer-events-none" draggable={false} />
                      {!isTileMode && (
                         <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 hover:opacity-100 transition-opacity">
                            <div className="bg-black/50 text-white px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm shadow-xl flex items-center gap-2">
                              <MousePointer2 className="size-3" /> Drag watermark to position
                            </div>
                         </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="bg-muted/50 border-t border-border px-4 py-2 text-xs text-muted-foreground flex justify-between">
                  <span>Image {activeImageIndex + 1} of {files.length} • {files[activeImageIndex]?.name}</span>
                  <span className="font-mono">{baseImageObj?.width} × {baseImageObj?.height} px</span>
                </div>
              </div>

              {/* Success / Processing States */}
              {isProcessing && (
                <div className="rounded-xl border border-brand-orange/20 bg-brand-orange/5 p-5 animate-in fade-in text-center">
                  <RefreshCw className="size-6 text-brand-orange animate-spin mx-auto mb-3" />
                  <div className="font-bold text-foreground mb-1">Applying Watermark{isBatchMode ? 's' : ''}...</div>
                  {isBatchMode && (
                    <div className="w-full bg-muted rounded-full h-2 mt-3 overflow-hidden">
                      <div className="bg-brand-orange h-full transition-all duration-300" style={{width: `${processingProgress}%`}}></div>
                    </div>
                  )}
                </div>
              )}

              {isDone && !isProcessing && (
                <div className="rounded-xl bg-green-500/10 border border-green-500/20 p-5 animate-in fade-in slide-in-from-bottom-2">
                  <div className="flex items-center gap-3 text-green-600 dark:text-green-400 mb-4 justify-center">
                    <CheckCircle2 className="size-6" />
                    <span className="font-bold text-lg">Successfully Watermarked!</span>
                  </div>
                  <div className="flex gap-3 justify-center">
                    <Button variant="outline" onClick={() => setIsDone(false)} className="bg-background">Modify Settings</Button>
                    <Button variant="outline" onClick={resetAll} className="bg-background">Upload New Image</Button>
                  </div>
                </div>
              )}

              {/* Output Controls */}
              {!isProcessing && !isDone && (
                <div className="rounded-xl border border-border bg-card shadow-sm p-5 space-y-5">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Output Settings</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] uppercase text-muted-foreground block mb-1.5">Format</label>
                      <select 
                        value={outputFormat}
                        onChange={(e) => setOutputFormat(e.target.value)}
                        className="w-full bg-background border border-input rounded-md text-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-brand-orange"
                      >
                        <option>Same as input</option>
                        <option>JPG</option>
                        <option>PNG</option>
                        <option>WebP</option>
                      </select>
                    </div>

                    {(outputFormat === 'JPG' || outputFormat === 'WebP' || (outputFormat === 'Same as input' && files[0]?.type !== 'image/png')) ? (
                      <div>
                        <div className="flex justify-between items-center mb-1.5">
                          <label className="text-[10px] uppercase text-muted-foreground block">Quality: {outputQuality}%</label>
                        </div>
                        <Slider value={[outputQuality]} min={60} max={100} step={1} onValueChange={(v) => setOutputQuality(Array.isArray(v) ? v[0] : v)} className="mt-2" />
                      </div>
                    ) : (
                      <div className="flex items-center text-xs text-muted-foreground pt-4">PNG is always lossless.</div>
                    )}
                  </div>

                  {!isBatchMode && (
                    <div>
                      <label className="text-[10px] uppercase text-muted-foreground block mb-1.5">Filename</label>
                      <input 
                        type="text" 
                        className="w-full bg-background border border-input rounded-md text-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-brand-orange" 
                        value={outputFilename} 
                        onChange={(e) => setOutputFilename(e.target.value)} 
                      />
                    </div>
                  )}

                  <Button 
                    onClick={isBatchMode ? downloadBatch : downloadSingle}
                    disabled={(!logoImg && watermarkType === 'logo') || (!watermarkText && watermarkType === 'text')}
                    className="w-full h-14 text-lg font-bold bg-brand-orange hover:bg-brand-orange-hover text-white shadow-lg shadow-brand-orange/20 transition-transform active:scale-[0.98]"
                  >
                    <Download className="size-5 mr-2" />
                    {isBatchMode ? `Download ZIP (${files.length} images)` : 'Download Watermarked Image'}
                  </Button>

                </div>
              )}

            </div>
          </div>
        )}

      </div>
    </>
  )
}
