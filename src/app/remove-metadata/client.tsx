"use client"

import React, { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { ChevronRight, Upload, Download, Trash2, CheckCircle2, AlertTriangle, ShieldAlert, Shield, ShieldCheck, FileArchive, X, Camera, MapPin, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import exifr from 'exifr'

interface FileItem {
  id: string
  file: File
  preview: string
  status: 'scanning' | 'scanned' | 'processing' | 'done' | 'error'
  metadata: {
    hasGPS: boolean
    hasCamera: boolean
    fieldCount: number
    raw: any
  } | null
  cleanBlob: Blob | null
  cleanUrl: string | null
  expanded: boolean
}

export default function RemoveMetadataClient() {
  const [items, setItems] = useState<FileItem[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessingAll, setIsProcessingAll] = useState(false)
  const [toastMsg, setToastMsg] = useState("")
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (toastMsg) {
      const t = setTimeout(() => setToastMsg(""), 3000)
      return () => clearTimeout(t)
    }
  }, [toastMsg])

  const showToast = (msg: string) => setToastMsg(msg)

  const quickScan = async (file: File) => {
    try {
      const data = await exifr.parse(file, {
        tiff: true, exif: true, gps: true, iptc: true, xmp: true, icc: true, jfif: true, ihdr: true,
      })
      if (!data) return { hasGPS: false, hasCamera: false, fieldCount: 0, raw: null }
      
      const hasGPS = !!(data.latitude || data.longitude)
      const hasCamera = !!(data.Make || data.Model || data.LensModel)
      const fieldCount = Object.keys(data).length
      return { hasGPS, hasCamera, fieldCount, raw: data }
    } catch {
      return { hasGPS: false, hasCamera: false, fieldCount: 0, raw: null }
    }
  }

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    
    const newItems: FileItem[] = []
    let addedCount = 0
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (!file.type.startsWith('image/')) continue
      if (items.length + addedCount >= 20) {
        showToast("⚠ Maximum 20 images allowed per batch.")
        break
      }
      
      const id = crypto.randomUUID()
      newItems.push({
        id,
        file,
        preview: URL.createObjectURL(file),
        status: 'scanning',
        metadata: null,
        cleanBlob: null,
        cleanUrl: null,
        expanded: false
      })
      addedCount++
    }
    
    if (newItems.length === 0) return
    
    setItems(prev => [...prev, ...newItems])
    
    // Scan all newly added files
    for (const item of newItems) {
      const meta = await quickScan(item.file)
      setItems(prev => prev.map(p => 
        p.id === item.id 
          ? { ...p, status: 'scanned', metadata: meta } 
          : p
      ))
    }
  }

  const stripMetadata = async (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        if (!ctx) return reject(new Error("No context"))
        
        ctx.drawImage(img, 0, 0)
        const format = file.type === 'image/png' ? 'image/png' : 'image/jpeg'
        canvas.toBlob((blob) => {
          if (blob) resolve(blob)
          else reject(new Error("Blob creation failed"))
        }, format, 0.95)
      }
      img.onerror = reject
      img.src = URL.createObjectURL(file)
    })
  }

  const processFile = async (id: string) => {
    const item = items.find(i => i.id === id)
    if (!item || item.status === 'done' || item.metadata?.fieldCount === 0) return

    setItems(prev => prev.map(p => p.id === id ? { ...p, status: 'processing' } : p))
    try {
      const cleanBlob = await stripMetadata(item.file)
      const cleanUrl = URL.createObjectURL(cleanBlob)
      setItems(prev => prev.map(p => p.id === id ? { 
        ...p, 
        status: 'done', 
        cleanBlob, 
        cleanUrl 
      } : p))
    } catch (e) {
      console.error(e)
      setItems(prev => prev.map(p => p.id === id ? { ...p, status: 'error' } : p))
    }
  }

  const processAll = async () => {
    setIsProcessingAll(true)
    const toProcess = items.filter(i => i.status === 'scanned' && (i.metadata?.fieldCount || 0) > 0)
    for (const item of toProcess) {
      await processFile(item.id)
    }
    setIsProcessingAll(false)
    showToast("✓ All files cleaned!")
  }

  const downloadFile = (id: string) => {
    const item = items.find(i => i.id === id)
    if (!item || !item.cleanUrl) return
    const a = document.createElement('a')
    a.href = item.cleanUrl
    const baseName = item.file.name.replace(/\.[^/.]+$/, "")
    const ext = item.file.type === 'image/png' ? 'png' : 'jpg'
    a.download = `${baseName}_clean.${ext}`
    a.click()
  }

  const downloadAllAsZip = async () => {
    const cleanedItems = items.filter(i => i.status === 'done' && i.cleanBlob)
    if (cleanedItems.length === 0) return
    
    try {
      showToast("Preparing ZIP file...")
      const JSZip = (await import('jszip')).default
      const zip = new JSZip()
      
      cleanedItems.forEach(item => {
        const baseName = item.file.name.replace(/\.[^/.]+$/, "")
        const ext = item.file.type === 'image/png' ? 'png' : 'jpg'
        zip.file(`${baseName}_clean.${ext}`, item.cleanBlob!)
      })
      
      const content = await zip.generateAsync({ type: 'blob' })
      const url = URL.createObjectURL(content)
      const a = document.createElement('a')
      a.href = url
      a.download = "cleaned_images.zip"
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      console.error(e)
      showToast("⚠ Failed to create ZIP")
    }
  }

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(p => p.id !== id))
  }

  const toggleExpand = (id: string) => {
    setItems(prev => prev.map(p => p.id === id ? { ...p, expanded: !p.expanded } : p))
  }

  const getRiskUI = (metadata: any) => {
    if (!metadata) return { icon: <Search className="size-4 animate-pulse text-muted-foreground" />, color: "text-muted-foreground", text: "Scanning..." }
    if (metadata.hasGPS) return { icon: <ShieldAlert className="size-4 text-red-500" />, color: "text-red-500 bg-red-500/10 border-red-500/20", text: "GPS Found" }
    if (metadata.hasCamera) return { icon: <Shield className="size-4 text-amber-500" />, color: "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20", text: "Camera Found" }
    if (metadata.fieldCount > 0) return { icon: <Shield className="size-4 text-amber-500" />, color: "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20", text: "EXIF Found" }
    return { icon: <ShieldCheck className="size-4 text-green-500" />, color: "text-green-600 dark:text-green-400 bg-green-500/10 border-green-500/20", text: "Clean" }
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B"
    const k = 1024, sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
  }

  const canProcessAll = items.some(i => i.status === 'scanned' && (i.metadata?.fieldCount || 0) > 0)
  const canDownloadZip = items.some(i => i.status === 'done')

  return (
    <>
      {toastMsg && (
        <div className="fixed bottom-4 right-4 z-50 animate-in fade-in slide-in-from-bottom-4 flex items-center gap-2 bg-card border border-border shadow-lg rounded-lg px-4 py-3">
          {toastMsg.startsWith('✓') ? <CheckCircle2 className="size-5 text-green-500" /> : <AlertTriangle className="size-5 text-amber-500" />}
          <span className="text-sm font-medium">{toastMsg.replace(/^[✓⚠]\s*/, '')}</span>
        </div>
      )}

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight className="size-3.5" />
          <Link href="/#security-tools" className="hover:text-foreground transition-colors">Privacy & Security</Link>
          <ChevronRight className="size-3.5" />
          <span className="text-foreground font-medium">Remove Metadata</span>
        </nav>

        <div className="mb-8 text-center max-w-3xl mx-auto">
          <h1 className="font-heading text-3xl font-bold sm:text-4xl sm:leading-[1.1] mb-3">
            Remove Photo Metadata — <span className="text-gradient">Free Privacy Tool</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Batch strip GPS location, camera details, and all hidden EXIF tags from your images before sharing them online.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 animate-in fade-in">
          
          {/* UPLOAD ZONE */}
          <div 
            className={`rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer overflow-hidden bg-card ${isDragging ? "border-brand-orange bg-brand-orange/5 scale-[1.01]" : "border-border hover:border-brand-orange/50 hover:bg-muted/50"}`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files) }}
            onClick={() => fileInputRef.current?.click()}
          >
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/tiff" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <div className="mb-4 flex size-16 items-center justify-center rounded-3xl bg-brand-orange/10 text-brand-orange">
                <Upload className="size-8" />
              </div>
              <h3 className="font-heading text-lg font-bold mb-1">Add Images to Clean</h3>
              <p className="text-muted-foreground text-sm mb-3">Drag and drop or click to browse</p>
              <div className="text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full border border-border inline-block">
                JPG, PNG, WebP, TIFF (Max 20 files)
              </div>
            </div>
          </div>

          {/* BATCH CONTROLS */}
          {(items.length > 0) && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl border border-border bg-muted/30">
              <div className="text-sm font-medium">
                {items.length} file(s) selected
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                {canDownloadZip && (
                  <Button variant="outline" onClick={downloadAllAsZip} className="flex-1 sm:flex-none">
                    <FileArchive className="size-4 mr-2" /> Download ZIP
                  </Button>
                )}
                {canProcessAll && (
                  <Button 
                    onClick={processAll} 
                    disabled={isProcessingAll}
                    className="flex-1 sm:flex-none bg-brand-orange hover:bg-brand-orange-hover text-white shadow-lg shadow-brand-orange/20 font-bold"
                  >
                    {isProcessingAll ? "Processing..." : "Remove Metadata from All"}
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* FILE LIST */}
          {items.length > 0 && (
            <div className="space-y-3">
              {items.map(item => {
                const ui = getRiskUI(item.metadata)
                const isClean = item.status === 'done' || (item.status === 'scanned' && item.metadata?.fieldCount === 0)
                
                return (
                  <div key={item.id} className={`rounded-xl border bg-card overflow-hidden transition-all ${isClean ? 'border-green-500/30' : 'border-border'}`}>
                    
                    {/* Main Row */}
                    <div className="p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      
                      {/* Thumb & Name */}
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <img src={item.preview} alt="" className="size-12 rounded object-cover border border-border" />
                        <div className="min-w-0">
                          <div className="font-medium text-sm truncate">{item.file.name}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">{formatBytes(item.file.size)}</div>
                        </div>
                      </div>

                      {/* Status Badges */}
                      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                        {item.status === 'done' ? (
                          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400">
                            <CheckCircle2 className="size-3.5" /> Cleaned (0 fields)
                          </div>
                        ) : (
                          <>
                            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${ui.color}`}>
                              {ui.icon} {ui.text}
                            </div>
                            {item.metadata && item.metadata.fieldCount > 0 && (
                              <button 
                                onClick={() => toggleExpand(item.id)}
                                className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded border border-border bg-muted/50 transition-colors"
                              >
                                {item.metadata.fieldCount} Fields
                              </button>
                            )}
                          </>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 ml-auto w-full sm:w-auto justify-end sm:justify-start pt-2 sm:pt-0 border-t sm:border-t-0 border-border">
                        {item.status === 'scanned' && (item.metadata?.fieldCount || 0) > 0 && (
                          <Button size="sm" onClick={() => processFile(item.id)} className="h-8 text-xs bg-brand-orange hover:bg-brand-orange-hover text-white">
                            Remove
                          </Button>
                        )}
                        {item.status === 'done' && (
                          <Button size="sm" variant="secondary" onClick={() => downloadFile(item.id)} className="h-8 text-xs font-bold text-green-600 dark:text-green-400">
                            <Download className="size-3.5 mr-1" /> Download
                          </Button>
                        )}
                        <button onClick={() => removeItem(item.id)} className="p-2 text-muted-foreground hover:text-red-500 transition-colors">
                          <X className="size-4" />
                        </button>
                      </div>

                    </div>

                    {/* Expanded Details */}
                    {item.expanded && item.metadata && item.metadata.fieldCount > 0 && item.status !== 'done' && (
                      <div className="bg-muted/30 border-t border-border p-4 text-xs font-mono">
                        <div className="text-muted-foreground mb-3 font-sans font-medium">The following data will be permanently removed:</div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 max-h-48 overflow-y-auto">
                          {Object.entries(item.metadata.raw).slice(0, 50).map(([k, v]) => {
                            if (typeof v === 'object' && v !== null && !(v instanceof Date)) v = JSON.stringify(v)
                            return (
                              <div key={k} className="flex gap-2">
                                <span className="text-red-500 shrink-0">✕</span>
                                <span className="text-muted-foreground w-1/3 truncate">{k}:</span>
                                <span className="truncate">{String(v)}</span>
                              </div>
                            )
                          })}
                          {item.metadata.fieldCount > 50 && (
                            <div className="text-muted-foreground italic col-span-full mt-2">...and {item.metadata.fieldCount - 50} more fields</div>
                          )}
                        </div>
                      </div>
                    )}

                  </div>
                )
              })}
            </div>
          )}

        </div>
      </div>
    </>
  )
}
