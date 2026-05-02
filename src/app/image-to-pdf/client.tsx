"use client"

import React, { useState, useRef, useCallback, useEffect } from "react"
import Link from "next/link"
import { jsPDF } from "jspdf"
import { ChevronRight, Upload, Download, Trash2, CheckCircle2, AlertTriangle, GripVertical, FileText, RefreshCw, X, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"

interface ImageItem {
  id: string
  file: File
  preview: string
  width: number
  height: number
}

type PageSize = 'a3' | 'a4' | 'a5' | 'letter' | 'legal'
type Orientation = 'portrait' | 'landscape'
type ImageFit = 'fill' | 'fit' | 'original'
type MarginSize = 'none' | 'small' | 'medium' | 'large'
type ImagesPerPage = 1 | 2 | 4
type Quality = 72 | 150 | 300

const PAGE_DIMS: Record<PageSize, [number, number]> = {
  a3: [297, 420], a4: [210, 297], a5: [148, 210],
  letter: [215.9, 279.4], legal: [215.9, 355.6]
}

const MARGINS: Record<MarginSize, number> = { none: 0, small: 5, medium: 10, large: 20 }

export default function ImageToPdfClient() {
  const [images, setImages] = useState<ImageItem[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [pageSize, setPageSize] = useState<PageSize>('a4')
  const [orientation, setOrientation] = useState<Orientation>('portrait')
  const [marginSize, setMarginSize] = useState<MarginSize>('medium')
  const [imageFit, setImageFit] = useState<ImageFit>('fit')
  const [imagesPerPage, setImagesPerPage] = useState<ImagesPerPage>(1)
  const [quality, setQuality] = useState<Quality>(150)
  const [isConverting, setIsConverting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [progressText, setProgressText] = useState("")
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null)
  const [pdfSize, setPdfSize] = useState(0)
  const [toastMsg, setToastMsg] = useState("")
  const [dragIdx, setDragIdx] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { if (toastMsg) { const t = setTimeout(() => setToastMsg(""), 3000); return () => clearTimeout(t) } }, [toastMsg])

  const loadImageDims = (file: File): Promise<{ w: number; h: number; preview: string }> =>
    new Promise((resolve) => {
      const url = URL.createObjectURL(file)
      const img = new Image()
      img.onload = () => resolve({ w: img.width, h: img.height, preview: url })
      img.src = url
    })

  const handleFiles = async (fileList: FileList | File[]) => {
    const valid = Array.from(fileList).filter(f => f.type.startsWith('image/') && f.size <= 50 * 1024 * 1024)
    if (!valid.length) { setToastMsg("⚠ No valid images found"); return }
    const remaining = 30 - images.length
    const toAdd = valid.slice(0, remaining)
    const newItems: ImageItem[] = []
    for (const file of toAdd) {
      const { w, h, preview } = await loadImageDims(file)
      newItems.push({ id: crypto.randomUUID(), file, preview, width: w, height: h })
    }
    setImages(prev => [...prev, ...newItems])
    setPdfBlob(null)
  }

  const removeImage = (id: string) => { setImages(prev => prev.filter(i => i.id !== id)); setPdfBlob(null) }
  const clearAll = () => { setImages([]); setPdfBlob(null) }

  // Drag reorder
  const handleDragStart = (idx: number) => setDragIdx(idx)
  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault()
    if (dragIdx === null || dragIdx === idx) return
    setImages(prev => {
      const copy = [...prev]
      const [item] = copy.splice(dragIdx, 1)
      copy.splice(idx, 0, item)
      return copy
    })
    setDragIdx(idx)
  }
  const handleDragEnd = () => setDragIdx(null)

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })

  const convertToPDF = async () => {
    if (!images.length) return
    setIsConverting(true)
    setProgress(0)
    setPdfBlob(null)

    try {
      const dims = PAGE_DIMS[pageSize]
      const pageW = orientation === 'portrait' ? dims[0] : dims[1]
      const pageH = orientation === 'portrait' ? dims[1] : dims[0]
      const margin = MARGINS[marginSize]

      const pdf = new jsPDF({ orientation, unit: 'mm', format: [pageW, pageH] })

      const totalPages = Math.ceil(images.length / imagesPerPage)

      for (let page = 0; page < totalPages; page++) {
        if (page > 0) pdf.addPage([pageW, pageH], orientation)
        setProgressText(`Converting page ${page + 1} of ${totalPages}...`)
        setProgress(Math.round(((page) / totalPages) * 100))

        const startIdx = page * imagesPerPage
        const pageImages = images.slice(startIdx, startIdx + imagesPerPage)

        // Calculate grid slots
        const slots: { x: number; y: number; w: number; h: number }[] = []
        const usableW = pageW - 2 * margin
        const usableH = pageH - 2 * margin

        if (imagesPerPage === 1) {
          slots.push({ x: margin, y: margin, w: usableW, h: usableH })
        } else if (imagesPerPage === 2) {
          const halfH = (usableH - 5) / 2
          slots.push({ x: margin, y: margin, w: usableW, h: halfH })
          slots.push({ x: margin, y: margin + halfH + 5, w: usableW, h: halfH })
        } else {
          const halfW = (usableW - 5) / 2
          const halfH = (usableH - 5) / 2
          slots.push({ x: margin, y: margin, w: halfW, h: halfH })
          slots.push({ x: margin + halfW + 5, y: margin, w: halfW, h: halfH })
          slots.push({ x: margin, y: margin + halfH + 5, w: halfW, h: halfH })
          slots.push({ x: margin + halfW + 5, y: margin + halfH + 5, w: halfW, h: halfH })
        }

        for (let i = 0; i < pageImages.length; i++) {
          const imgItem = pageImages[i]
          const slot = slots[i]
          const imgData = await fileToBase64(imgItem.file)
          const imgRatio = imgItem.width / imgItem.height

          let drawW: number, drawH: number, drawX: number, drawY: number

          if (imageFit === 'fill') {
            drawW = slot.w
            drawH = slot.h
            drawX = slot.x
            drawY = slot.y
          } else if (imageFit === 'original') {
            const pxToMm = 25.4 / quality
            drawW = Math.min(imgItem.width * pxToMm, slot.w)
            drawH = Math.min(imgItem.height * pxToMm, slot.h)
            drawX = slot.x + (slot.w - drawW) / 2
            drawY = slot.y + (slot.h - drawH) / 2
          } else {
            const slotRatio = slot.w / slot.h
            if (imgRatio > slotRatio) {
              drawW = slot.w
              drawH = drawW / imgRatio
            } else {
              drawH = slot.h
              drawW = drawH * imgRatio
            }
            drawX = slot.x + (slot.w - drawW) / 2
            drawY = slot.y + (slot.h - drawH) / 2
          }

          pdf.addImage(imgData, 'JPEG', drawX, drawY, drawW, drawH, undefined, 'FAST')
        }
      }

      setProgress(100)
      setProgressText("Generating PDF...")
      const blob = pdf.output('blob')
      setPdfBlob(blob)
      setPdfSize(blob.size)
      setToastMsg("✓ PDF ready!")
    } catch (e) {
      setToastMsg("⚠ Error generating PDF")
    } finally {
      setIsConverting(false)
      setProgress(0)
      setProgressText("")
    }
  }

  const downloadPdf = () => {
    if (!pdfBlob) return
    const url = URL.createObjectURL(pdfBlob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'converted.pdf'
    a.click()
    URL.revokeObjectURL(url)
    setToastMsg("✓ PDF downloaded!")
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
          <span className="text-foreground font-medium">Image to PDF</span>
        </nav>

        <div className="mb-8 text-center max-w-3xl mx-auto">
          <h1 className="font-heading text-3xl font-bold sm:text-4xl sm:leading-[1.1] mb-3">
            Image to PDF Converter — <span className="text-gradient">Free Online</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Convert JPG, PNG, WebP images to PDF. Combine multiple images, choose page size and orientation — download instantly, no signup.
          </p>
        </div>

        {/* UPLOAD ZONE */}
        {images.length === 0 && (
          <div className="max-w-4xl mx-auto animate-in fade-in zoom-in-95">
            <div
              className={`relative rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer overflow-hidden ${isDragging ? "border-brand-orange bg-brand-orange/5 scale-[1.01]" : "border-border hover:border-brand-orange/50 hover:bg-muted/50 bg-card"}`}
              style={{ minHeight: '400px' }}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files) }}
              onClick={() => fileInputRef.current?.click()}
            >
              <input ref={fileInputRef} type="file" multiple accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => e.target.files && handleFiles(e.target.files)} />
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10 pointer-events-none">
                <div className="mb-6 flex size-20 items-center justify-center rounded-3xl bg-brand-orange/10 text-brand-orange shadow-inner">
                  <FileText className="size-10" />
                </div>
                <h3 className="font-heading text-2xl font-bold mb-2">Drop your images here</h3>
                <p className="text-muted-foreground mb-6">or click to browse from your device</p>
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground bg-background/50 px-3 py-1.5 rounded-full border border-border">
                  <span>JPG, PNG, WebP</span>
                  <span className="w-1 h-1 rounded-full bg-border" />
                  <span>Up to 30 images</span>
                  <span className="w-1 h-1 rounded-full bg-border" />
                  <span>Max 50MB each</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* WORKSPACE */}
        {images.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-8 animate-in fade-in">

            {/* LEFT: Settings */}
            <div className="space-y-5">
              <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                <div className="p-4 border-b border-border bg-muted/30">
                  <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-muted-foreground">PDF Settings</h3>
                </div>
                <div className="p-5 space-y-6">

                  {/* Page Size */}
                  <div>
                    <label className="text-xs font-bold uppercase text-muted-foreground mb-2 block">Page Size</label>
                    <div className="flex flex-wrap gap-1.5">
                      {(['a4', 'a3', 'a5', 'letter', 'legal'] as PageSize[]).map(s => (
                        <button key={s} onClick={() => { setPageSize(s); setPdfBlob(null) }} className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${pageSize === s ? 'bg-brand-orange text-white border-brand-orange' : 'bg-background border-border hover:bg-muted text-muted-foreground'}`}>
                          {s.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Orientation */}
                  <div>
                    <label className="text-xs font-bold uppercase text-muted-foreground mb-2 block">Orientation</label>
                    <div className="flex gap-2">
                      {(['portrait', 'landscape'] as Orientation[]).map(o => (
                        <button key={o} onClick={() => { setOrientation(o); setPdfBlob(null) }} className={`flex-1 py-2 text-xs font-medium rounded-md border transition-colors ${orientation === o ? 'bg-brand-orange text-white border-brand-orange' : 'bg-background border-border hover:bg-muted text-muted-foreground'}`}>
                          {o === 'portrait' ? '📄 Portrait' : '📃 Landscape'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Margin */}
                  <div>
                    <label className="text-xs font-bold uppercase text-muted-foreground mb-2 block">Margin</label>
                    <div className="flex flex-wrap gap-1.5">
                      {([['none', 'None'], ['small', '5mm'], ['medium', '10mm'], ['large', '20mm']] as [MarginSize, string][]).map(([k, label]) => (
                        <button key={k} onClick={() => { setMarginSize(k); setPdfBlob(null) }} className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${marginSize === k ? 'bg-brand-orange text-white border-brand-orange' : 'bg-background border-border hover:bg-muted text-muted-foreground'}`}>
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Image Fit */}
                  <div>
                    <label className="text-xs font-bold uppercase text-muted-foreground mb-2 block">Image Fit</label>
                    <div className="space-y-1.5">
                      {([['fill', 'Fill Page', 'Image fills entire page edge to edge'], ['fit', 'Fit to Page', 'Image fits within margins, keeps aspect ratio'], ['original', 'Original Size', 'Image at actual pixel size']] as [ImageFit, string, string][]).map(([k, title, desc]) => (
                        <button key={k} onClick={() => { setImageFit(k); setPdfBlob(null) }} className={`w-full text-left px-3 py-2 text-xs rounded-md border transition-colors ${imageFit === k ? 'bg-brand-orange/10 border-brand-orange/30 text-foreground' : 'bg-background border-border hover:bg-muted text-muted-foreground'}`}>
                          <span className="font-medium">{title}</span>
                          <span className="block text-[10px] opacity-70 mt-0.5">{desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Images per page */}
                  <div>
                    <label className="text-xs font-bold uppercase text-muted-foreground mb-2 block">Images Per Page</label>
                    <div className="flex gap-2">
                      {([1, 2, 4] as ImagesPerPage[]).map(n => (
                        <button key={n} onClick={() => { setImagesPerPage(n); setPdfBlob(null) }} className={`flex-1 py-2 text-xs font-medium rounded-md border transition-colors ${imagesPerPage === n ? 'bg-brand-orange text-white border-brand-orange' : 'bg-background border-border hover:bg-muted text-muted-foreground'}`}>
                          {n === 1 ? '1 per page' : n === 2 ? '2 per page' : '4 (grid)'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quality */}
                  <div>
                    <label className="text-xs font-bold uppercase text-muted-foreground mb-2 block">PDF Quality</label>
                    <div className="flex gap-2">
                      {([[72, 'Screen'], [150, 'Print'], [300, 'High']] as [Quality, string][]).map(([dpi, label]) => (
                        <button key={dpi} onClick={() => { setQuality(dpi); setPdfBlob(null) }} className={`flex-1 py-2 text-xs font-medium rounded-md border transition-colors ${quality === dpi ? 'bg-brand-orange text-white border-brand-orange' : 'bg-background border-border hover:bg-muted text-muted-foreground'}`}>
                          {label} ({dpi}dpi)
                        </button>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* RIGHT: Images + Actions */}
            <div className="space-y-5 min-w-0">

              {/* Image list header */}
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-muted-foreground">
                  {images.length} Image{images.length !== 1 ? 's' : ''} • {Math.ceil(images.length / imagesPerPage)} Page{Math.ceil(images.length / imagesPerPage) !== 1 ? 's' : ''}
                </h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={images.length >= 30} className="h-8 text-xs">
                    <Plus className="size-3.5 mr-1" /> Add More
                  </Button>
                  <input ref={fileInputRef} type="file" multiple accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => e.target.files && handleFiles(e.target.files)} />
                  <Button variant="outline" size="sm" onClick={clearAll} className="h-8 text-xs text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20">
                    <Trash2 className="size-3.5 mr-1" /> Clear All
                  </Button>
                </div>
              </div>

              {/* Image Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {images.map((img, idx) => (
                  <div
                    key={img.id}
                    draggable
                    onDragStart={() => handleDragStart(idx)}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    onDragEnd={handleDragEnd}
                    className={`group relative rounded-xl border-2 overflow-hidden bg-muted/30 transition-all cursor-grab active:cursor-grabbing ${dragIdx === idx ? 'border-brand-orange opacity-50 scale-95' : 'border-border hover:border-brand-orange/30'}`}
                  >
                    <div className="aspect-[3/4] relative">
                      <img src={img.preview} alt="" className="w-full h-full object-cover" draggable={false} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute top-1.5 left-1.5 bg-black/70 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">{idx + 1}</div>
                      <button onClick={() => removeImage(img.id)} className="absolute top-1.5 right-1.5 p-1 bg-black/70 text-white rounded hover:bg-red-500 transition-colors opacity-0 group-hover:opacity-100">
                        <X className="size-3" />
                      </button>
                      <div className="absolute bottom-1.5 left-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between">
                        <span className="text-[9px] text-white/80 truncate max-w-[80%]">{img.file.name}</span>
                        <GripVertical className="size-3.5 text-white/60" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Progress */}
              {isConverting && (
                <div className="rounded-xl border border-brand-orange/20 bg-brand-orange/5 p-5 animate-in fade-in text-center">
                  <RefreshCw className="size-6 text-brand-orange animate-spin mx-auto mb-3" />
                  <div className="font-bold text-foreground mb-2">{progressText}</div>
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div className="bg-brand-orange h-full transition-all duration-300" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              )}

              {/* Result */}
              {pdfBlob && !isConverting && (
                <div className="rounded-xl bg-green-500/10 border border-green-500/20 p-6 animate-in fade-in slide-in-from-bottom-2 text-center">
                  <CheckCircle2 className="size-8 text-green-500 mx-auto mb-3" />
                  <div className="font-bold text-lg text-foreground mb-1">PDF Ready!</div>
                  <div className="text-sm text-muted-foreground mb-5">{images.length} images • {Math.ceil(images.length / imagesPerPage)} pages • {formatBytes(pdfSize)}</div>
                  <div className="flex gap-3 justify-center">
                    <Button onClick={downloadPdf} className="h-12 px-8 text-base font-bold bg-brand-orange hover:bg-brand-orange-hover text-white shadow-lg shadow-brand-orange/20">
                      <Download className="size-5 mr-2" /> Download PDF
                    </Button>
                    <Button variant="outline" onClick={() => setPdfBlob(null)} className="h-12 bg-background">Modify Settings</Button>
                  </div>
                </div>
              )}

              {/* Convert Button */}
              {!pdfBlob && !isConverting && (
                <Button onClick={convertToPDF} className="w-full h-14 text-lg font-bold bg-brand-orange hover:bg-brand-orange-hover text-white shadow-lg shadow-brand-orange/20 transition-transform active:scale-[0.98]">
                  <FileText className="size-5 mr-2" /> Convert {images.length} Image{images.length !== 1 ? 's' : ''} to PDF
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
