"use client"

import React, { useState, useRef, useEffect } from 'react'
import { PDFDocument, rgb, degrees, StandardFonts } from '@cantoo/pdf-lib'
import { saveAs } from 'file-saver'
import { UploadCloud, PenTool, CheckCircle2, Download, Loader2, Image as ImageIcon, Type, Grid3X3, Maximize } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'

// Dynamic load pdfjs
async function getPdfjs() {
  const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf')
  if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
  }
  return pdfjsLib
}

export default function PDFWatermarkClient() {
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [completed, setCompleted] = useState(false)
  
  // Preview State
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const [previewLoaded, setPreviewLoaded] = useState(false)
  const [pageDims, setPageDims] = useState({ w: 0, h: 0 })

  // General Settings
  const [wmType, setWmType] = useState<'text' | 'image'>('text')
  const [applyTo, setApplyTo] = useState('all') // 'all', 'odd', 'even', 'custom'
  const [customPages, setCustomPages] = useState('')
  const [position, setPosition] = useState('MC')
  const [customPos, setCustomPos] = useState({ x: 50, y: 50 })
  const [tile, setTile] = useState(false)

  // Text Settings
  const [text, setText] = useState('CONFIDENTIAL')
  const [font, setFont] = useState('Helvetica-Bold')
  const [fontSize, setFontSize] = useState(60)
  const [color, setColor] = useState('#808080')
  const [opacity, setOpacity] = useState(30)
  const [rotation, setRotation] = useState(-45)

  // Image Settings
  const [imgFile, setImgFile] = useState<File | null>(null)
  const [imgUrl, setImgUrl] = useState('')
  const [imgScale, setImgScale] = useState(30)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const imgInputRef = useRef<HTMLInputElement>(null)

  // Load preview on file upload
  useEffect(() => {
    if (!file) return
    let active = true
    const renderPreview = async () => {
      try {
        const pdfjsLib = await getPdfjs()
        const arrayBuffer = await file.arrayBuffer()
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
        if (!active) return
        
        const page = await pdf.getPage(1)
        const viewport = page.getViewport({ scale: 1.0 })
        setPageDims({ w: viewport.width, h: viewport.height })
        
        // Render at a sensible resolution
        const displayScale = 800 / viewport.width
        const scaledViewport = page.getViewport({ scale: displayScale })
        
        const canvas = canvasRef.current
        if (!canvas) return
        
        canvas.width = scaledViewport.width
        canvas.height = scaledViewport.height
        const ctx = canvas.getContext('2d')!
        
        ctx.fillStyle = 'white'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        
        await page.render({ canvasContext: ctx, viewport: scaledViewport }).promise
        setPreviewLoaded(true)
      } catch (err) {
        console.error("Preview error", err)
      }
    }
    renderPreview()
    return () => { active = false }
  }, [file])

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const f = e.target.files[0]
      if (!f.type.startsWith('image/')) return
      setImgFile(f)
      setImgUrl(URL.createObjectURL(f))
    }
  }

  const handleFiles = (newFiles: FileList | null) => {
    if (!newFiles || newFiles.length === 0) return
    const f = newFiles[0]
    if (f.type !== 'application/pdf') { alert("Please upload a PDF file"); return }
    if (f.size > 100 * 1024 * 1024) { alert("File size exceeds 100MB limit."); return }
    setFile(f)
    setCompleted(false)
    setPreviewLoaded(false)
  }

  // Helper to parse custom pages string (e.g. "1-3, 5")
  const parsePages = (str: string, maxPages: number) => {
    const pages = new Set<number>()
    const parts = str.split(',').map(s => s.trim())
    for (const part of parts) {
      if (!part) continue
      if (part.includes('-')) {
        const [start, end] = part.split('-').map(Number)
        if (!isNaN(start) && !isNaN(end)) {
          for (let i = Math.max(1, start); i <= Math.min(maxPages, end); i++) pages.add(i)
        }
      } else {
        const num = Number(part)
        if (!isNaN(num) && num >= 1 && num <= maxPages) pages.add(num)
      }
    }
    return pages
  }

  // Parse Hex color
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 128, g: 128, b: 128 }
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    if (tile) return
    const overlay = overlayRef.current
    if (!overlay) return
    
    setPosition('CUSTOM')
    const rect = overlay.getBoundingClientRect()
    
    const updatePos = (clientX: number, clientY: number) => {
       const xPercent = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100))
       const yPercent = Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100))
       setCustomPos({ x: xPercent, y: yPercent })
    }
    
    updatePos(e.clientX, e.clientY)
    
    const handleMove = (e: PointerEvent) => updatePos(e.clientX, e.clientY)
    const handleUp = () => {
       window.removeEventListener('pointermove', handleMove)
       window.removeEventListener('pointerup', handleUp)
    }
    
    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', handleUp)
  }

  const handleApply = async () => {
    if (!file) return
    if (wmType === 'image' && !imgFile) {
      alert("Please upload a watermark image.")
      return
    }

    setIsProcessing(true)
    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)
      
      const pages = pdfDoc.getPages()
      const numPages = pages.length

      // Determine which pages to process (1-indexed)
      const selectedPages = new Set<number>()
      if (applyTo === 'all') {
        for (let i = 1; i <= numPages; i++) selectedPages.add(i)
      } else if (applyTo === 'odd') {
        for (let i = 1; i <= numPages; i += 2) selectedPages.add(i)
      } else if (applyTo === 'even') {
        for (let i = 2; i <= numPages; i += 2) selectedPages.add(i)
      } else if (applyTo === 'custom') {
        const parsed = parsePages(customPages, numPages)
        parsed.forEach(p => selectedPages.add(p))
      }

      // Prepare watermark assets
      let fontRef: any = null
      if (wmType === 'text') {
        const fontMap: Record<string, any> = {
          'Helvetica': StandardFonts.Helvetica,
          'Helvetica-Bold': StandardFonts.HelveticaBold,
          'Times-Roman': StandardFonts.TimesRoman,
          'Times-Bold': StandardFonts.TimesRomanBold,
          'Courier': StandardFonts.Courier,
          'Courier-Bold': StandardFonts.CourierBold,
        }
        fontRef = await pdfDoc.embedFont(fontMap[font] || StandardFonts.HelveticaBold)
      }

      let imgRef: any = null
      let imgDims: any = null
      if (wmType === 'image' && imgFile) {
        const imgBytes = await imgFile.arrayBuffer()
        if (imgFile.type === 'image/png') {
          imgRef = await pdfDoc.embedPng(imgBytes)
        } else {
          imgRef = await pdfDoc.embedJpg(imgBytes)
        }
        imgDims = { w: imgRef.width, h: imgRef.height }
      }

      const colorRgb = hexToRgb(color)

      // Apply watermark
      for (let i = 0; i < pages.length; i++) {
        if (!selectedPages.has(i + 1)) continue

        const page = pages[i]
        const { width, height } = page.getSize()
        
        // Helper to draw single item
        const drawItem = (x: number, y: number) => {
           if (wmType === 'text' && fontRef) {
              const textWidth = fontRef.widthOfTextAtSize(text, fontSize)
              const textHeight = fontRef.heightAtSize(fontSize)
              
              page.drawText(text, {
                x, y,
                size: fontSize,
                font: fontRef,
                color: rgb(colorRgb.r / 255, colorRgb.g / 255, colorRgb.b / 255),
                opacity: opacity / 100,
                rotate: degrees(rotation),
              })
           } else if (wmType === 'image' && imgRef && imgDims) {
              const wmWidth = width * (imgScale / 100)
              const wmHeight = wmWidth * (imgDims.h / imgDims.w)
              
              page.drawImage(imgRef, {
                x, y,
                width: wmWidth,
                height: wmHeight,
                opacity: opacity / 100,
                rotate: degrees(rotation),
              })
           }
        }

        if (tile) {
           // Simple tiling algorithm
           const stepX = width / 3
           const stepY = height / 4
           for (let x = -width/2; x < width * 1.5; x += stepX) {
              for (let y = -height/2; y < height * 1.5; y += stepY) {
                 drawItem(x, y)
              }
           }
        } else {
           // Grid positioning
           let x = width / 2
           let y = height / 2
           
           let itemW = 0, itemH = 0
           if (wmType === 'text' && fontRef) {
              itemW = fontRef.widthOfTextAtSize(text, fontSize)
              itemH = fontRef.heightAtSize(fontSize)
           } else if (wmType === 'image' && imgDims) {
              itemW = width * (imgScale / 100)
              itemH = itemW * (imgDims.h / imgDims.w)
           }

           const marginX = width * 0.05
           const marginY = height * 0.05

           if (position === 'CUSTOM') {
             x = width * (customPos.x / 100) - itemW / 2
             y = height * (1 - customPos.y / 100) - itemH / 2
           } else {
             if (position.includes('L')) x = marginX
             else if (position.includes('C')) x = width/2 - itemW/2
             else if (position.includes('R')) x = width - itemW - marginX

             if (position.includes('B')) y = marginY + itemH // pdf-lib 0,0 is bottom-left
             else if (position.includes('M')) y = height/2 - itemH/2
             else if (position.includes('T')) y = height - itemH - marginY
           }

           drawItem(x, y)
        }
      }

      const bytes = await pdfDoc.save()
      const blob = new Blob([bytes as any], { type: 'application/pdf' })
      saveAs(blob, file.name.replace('.pdf', '_watermarked.pdf'))
      setCompleted(true)
    } catch (err) {
      console.error(err)
      alert("An error occurred while adding the watermark.")
    } finally {
      setIsProcessing(false)
    }
  }

  // --- Preview Overlay Styles ---
  // Translate grid positions to CSS flexbox
  const getJustify = () => {
    if (position.includes('L')) return 'justify-start'
    if (position.includes('R')) return 'justify-end'
    return 'justify-center'
  }
  const getAlign = () => {
    if (position.includes('T')) return 'items-start'
    if (position.includes('B')) return 'items-end'
    return 'items-center'
  }

  return (
    <div className="bg-card rounded-3xl shadow-2xl border border-border z-20 relative font-inter flex flex-col md:flex-row min-h-[600px] overflow-hidden">
      
      {/* Left Panel: Preview */}
      <div className="w-full md:w-1/2 bg-zinc-100 dark:bg-zinc-950/50 p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-border relative">
        {!file ? (
          <div 
            className={`w-full max-w-sm border-3 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center transition-all cursor-pointer
              ${isDragging ? 'border-brand-orange bg-brand-orange/5 scale-[1.02]' : 'border-border hover:border-brand-orange/50'}
            `}
            onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={e => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files) }}
            onClick={() => fileInputRef.current?.click()}
          >
            <input type="file" ref={fileInputRef} className="hidden" accept="application/pdf" onChange={e => handleFiles(e.target.files)} />
            <UploadCloud className="size-10 text-brand-orange mb-4" />
            <h3 className="text-xl font-bold font-syne mb-2 text-foreground">Upload PDF</h3>
            <p className="text-muted-foreground text-sm text-center">Max size: 100MB</p>
          </div>
        ) : (
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-zinc-200/50 dark:bg-zinc-900/50 rounded-lg shadow-inner p-4">
            {!previewLoaded && (
               <div className="absolute inset-0 flex items-center justify-center z-10 bg-background/80 backdrop-blur-sm">
                  <Loader2 className="size-8 text-brand-orange animate-spin" />
               </div>
            )}
            
            <div className="relative shadow-xl max-w-full max-h-full overflow-hidden" style={{ aspectRatio: pageDims.w ? `${pageDims.w}/${pageDims.h}` : '1/1.414' }}>
              <canvas ref={canvasRef} className="w-full h-full object-contain" />
              
              {/* CSS Overlay for Live Preview */}
              {previewLoaded && (
                <div className="absolute inset-0 p-[5%] overflow-hidden">
                  {tile ? (
                    <div className="w-[150%] h-[150%] -ml-[25%] -mt-[25%] flex flex-wrap gap-12 items-center justify-center opacity-80" 
                         style={{ transform: `rotate(${rotation}deg)` }}>
                       {Array.from({length: 25}).map((_, i) => (
                         <div key={i} className="flex-shrink-0" style={{ opacity: opacity / 100 }}>
                           {wmType === 'text' ? (
                             <span style={{ fontSize: `${fontSize * (canvasRef.current?.clientWidth || 0) / pageDims.w}px`, fontFamily: font.split('-')[0], fontWeight: font.includes('Bold')?'bold':'normal', color: color }}>
                               {text}
                             </span>
                           ) : imgUrl ? (
                             <img src={imgUrl} alt="WM" style={{ width: `${imgScale}%` }} />
                           ) : null}
                         </div>
                       ))}
                    </div>
                  ) : (
                    <div 
                      ref={overlayRef}
                      className={`w-full h-full flex ${position !== 'CUSTOM' ? `${getJustify()} ${getAlign()}` : ''} ${!tile ? 'cursor-move' : ''}`}
                      onPointerDown={handlePointerDown}
                      style={{ touchAction: 'none' }}
                    >
                      <div 
                        style={{ 
                          transform: position === 'CUSTOM' ? `translate(-50%, -50%) rotate(${rotation}deg)` : `rotate(${rotation}deg)`, 
                          transformOrigin: 'center', 
                          opacity: opacity / 100,
                          ...(position === 'CUSTOM' ? { position: 'absolute', left: `${customPos.x}%`, top: `${customPos.y}%` } : {})
                        }}
                        className="pointer-events-none"
                      >
                        {wmType === 'text' ? (
                          <span style={{ fontSize: `${fontSize * (canvasRef.current?.clientWidth || 0) / pageDims.w}px`, fontFamily: font.split('-')[0], fontWeight: font.includes('Bold')?'bold':'normal', color: color, whiteSpace: 'nowrap' }}>
                            {text}
                          </span>
                        ) : imgUrl ? (
                          <img src={imgUrl} alt="WM" style={{ width: `${(canvasRef.current?.clientWidth || 0) * (imgScale/100)}px` }} />
                        ) : null}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Right Panel: Controls */}
      <div className="w-full md:w-1/2 p-6 md:p-8 overflow-y-auto max-h-[800px] no-scrollbar">
        <h3 className="text-2xl font-bold font-syne mb-6 flex items-center gap-2">
           <PenTool className="size-6 text-brand-orange" /> Watermark Settings
        </h3>

        <div className="space-y-8">
          
          {/* Type Toggle */}
          <div className="flex bg-muted rounded-lg p-1">
            <button
              onClick={() => setWmType('text')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${wmType === 'text' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Type className="size-4" /> Text
            </button>
            <button
              onClick={() => setWmType('image')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${wmType === 'image' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <ImageIcon className="size-4" /> Image
            </button>
          </div>

          {/* Specific Settings */}
          {wmType === 'text' ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Text to display</label>
                <Input value={text} onChange={e => setText(e.target.value)} placeholder="Enter watermark text..." />
                <div className="flex flex-wrap gap-2 pt-2">
                  {['CONFIDENTIAL', 'DRAFT', 'SAMPLE', 'DO NOT COPY'].map(t => (
                    <button key={t} onClick={() => setText(t)} className="text-xs px-2 py-1 bg-muted hover:bg-muted/80 rounded border border-border text-muted-foreground">
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Font Family</label>
                  <select 
                    value={font} 
                    onChange={e => setFont(e.target.value)}
                    className="w-full flex h-10 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus:ring-brand-orange dark:border-zinc-800 dark:bg-zinc-950"
                  >
                    <option value="Helvetica-Bold">Helvetica Bold</option>
                    <option value="Helvetica">Helvetica</option>
                    <option value="Times-Bold">Times Bold</option>
                    <option value="Times-Roman">Times</option>
                    <option value="Courier-Bold">Courier Bold</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium flex justify-between">Color <span>{color}</span></label>
                  <div className="flex gap-2">
                    <input type="color" value={color} onChange={e => setColor(e.target.value)} className="h-10 w-14 rounded cursor-pointer border-0 p-0" />
                    <Input value={color} onChange={e => setColor(e.target.value)} className="font-mono uppercase" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex justify-between">Size <span>{fontSize}px</span></label>
                  <Slider value={[fontSize]} min={20} max={200} step={1} onValueChange={(v: any) => setFontSize(v[0] ?? v)} />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Upload Image (PNG/JPG)</label>
                <div className="flex items-center gap-4">
                   <Button variant="outline" onClick={() => imgInputRef.current?.click()}>
                      Choose Image
                   </Button>
                   <span className="text-sm text-muted-foreground truncate max-w-[200px]">
                     {imgFile ? imgFile.name : 'No image selected'}
                   </span>
                </div>
                <input type="file" ref={imgInputRef} className="hidden" accept="image/png, image/jpeg" onChange={handleImageUpload} />
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex justify-between">Image Scale <span>{imgScale}%</span></label>
                  <Slider value={[imgScale]} min={5} max={80} step={1} onValueChange={(v: any) => setImgScale(v[0] ?? v)} />
                  <p className="text-xs text-muted-foreground">Percentage of page width</p>
                </div>
              </div>
            </div>
          )}

          {/* Shared Settings */}
          <div className="border-t border-border pt-6 space-y-6">
             <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex justify-between">Opacity <span>{opacity}%</span></label>
                  <Slider value={[opacity]} min={0} max={100} step={1} onValueChange={(v: any) => setOpacity(v[0] ?? v)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium flex justify-between">Rotation <span>{rotation}°</span></label>
                  <Slider value={[rotation]} min={-180} max={180} step={5} onValueChange={(v: any) => setRotation(v[0] ?? v)} />
                </div>
             </div>

             <div className="space-y-3">
               <div className="flex items-center justify-between">
                 <label className="text-sm font-medium flex items-center gap-2"><Grid3X3 className="size-4" /> Position Grid <span className="text-xs text-brand-orange font-normal">(or drag preview directly)</span></label>
                 <div className="flex items-center gap-2">
                   <Switch id="tile" checked={tile} onCheckedChange={setTile} />
                   <label htmlFor="tile" className="text-xs cursor-pointer select-none">Tile</label>
                 </div>
               </div>
               
               {!tile && (
                 <div className="grid grid-cols-3 gap-2 max-w-[200px] mx-auto bg-muted p-2 rounded-xl">
                   {['TL', 'TC', 'TR', 'ML', 'MC', 'MR', 'BL', 'BC', 'BR'].map(pos => (
                     <button
                       key={pos}
                       onClick={() => setPosition(pos)}
                       className={`aspect-square rounded-lg flex items-center justify-center transition-all ${position === pos ? 'bg-brand-orange text-white shadow-md' : 'bg-card hover:bg-zinc-200 dark:hover:bg-zinc-800 text-muted-foreground'}`}
                     >
                       <span className="sr-only">{pos}</span>
                       <div className="w-2 h-2 rounded-full bg-current" />
                     </button>
                   ))}
                 </div>
               )}
             </div>

             <div className="space-y-2">
               <label className="text-sm font-medium">Apply To</label>
               <select 
                 value={applyTo} 
                 onChange={e => setApplyTo(e.target.value)}
                 className="w-full flex h-10 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus:ring-brand-orange dark:border-zinc-800 dark:bg-zinc-950"
               >
                 <option value="all">All Pages</option>
                 <option value="odd">Odd Pages Only</option>
                 <option value="even">Even Pages Only</option>
                 <option value="custom">Custom Range...</option>
               </select>
               {applyTo === 'custom' && (
                 <Input 
                   value={customPages} 
                   onChange={e => setCustomPages(e.target.value)} 
                   placeholder="e.g. 1-5, 8, 11-13" 
                   className="mt-2"
                 />
               )}
             </div>
          </div>

          <div className="pt-4">
             <Button
               onClick={handleApply}
               disabled={!file || isProcessing || (wmType === 'image' && !imgFile)}
               className="bg-brand-orange hover:bg-brand-orange/90 text-white rounded-full h-14 text-lg font-bold shadow-xl shadow-brand-orange/20 w-full"
             >
               {isProcessing ? (
                 <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing...</>
               ) : completed ? (
                 <><CheckCircle2 className="mr-2 size-5" /> Downloaded!</>
               ) : (
                 <><Download className="mr-2 size-5" /> Add Watermark</>
               )}
             </Button>
          </div>

        </div>
      </div>

    </div>
  )
}
