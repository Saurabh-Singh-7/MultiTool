"use client"

import React, { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, FileCode, X, Download, AlertCircle, ChevronRight, CheckCircle2, Loader2, Maximize } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import JSZip from "jszip"
import { saveAs } from "file-saver"

interface FileStatus {
  file: File
  id: string
  status: 'idle' | 'processing' | 'completed' | 'error'
  resultBlob?: Blob
  error?: string
  progress: number
}

export default function SVGToPNGClient() {
  const [files, setFiles] = useState<FileStatus[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [scale, setScale] = useState(2) // 2x by default
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFiles = (newFiles: FileList | null) => {
    if (!newFiles) return
    const validFiles = Array.from(newFiles).filter(f => 
      f.name.toLowerCase().endsWith('.svg')
    )

    const mapped = validFiles.map(f => ({
      file: f,
      id: Math.random().toString(36).substring(7),
      status: 'idle' as const,
      progress: 0
    }))

    setFiles(prev => [...prev, ...mapped])
  }

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id))
  }

  const convertFiles = async () => {
    setIsProcessing(true)
    const newFiles = [...files]

    for (let i = 0; i < newFiles.length; i++) {
      if (newFiles[i].status === 'completed') continue

      newFiles[i].status = 'processing'
      setFiles([...newFiles])

      try {
        const text = await newFiles[i].file.text()
        const blob = new Blob([text], { type: 'image/svg+xml' })
        const url = URL.createObjectURL(blob)

        const img = new Image()
        await new Promise((resolve, reject) => {
          img.onload = resolve
          img.onerror = reject
          img.src = url
        })

        const canvas = document.createElement('canvas')
        const width = img.width * scale
        const height = img.height * scale
        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        if (!ctx) throw new Error("Could not get canvas context")
        
        ctx.drawImage(img, 0, 0, width, height)
        
        const pngBlob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((b) => resolve(b!), 'image/png')
        })

        URL.revokeObjectURL(url)
        newFiles[i].resultBlob = pngBlob
        newFiles[i].status = 'completed'
        newFiles[i].progress = 100
      } catch (err) {
        console.error(err)
        newFiles[i].status = 'error'
        newFiles[i].error = "Conversion failed"
      }
      setFiles([...newFiles])
    }
    setIsProcessing(false)
  }

  const downloadSingle = (item: FileStatus) => {
    if (!item.resultBlob) return
    const name = item.file.name.replace(/\.svg$/i, '.png')
    saveAs(item.resultBlob, name)
  }

  const downloadAll = async () => {
    const completed = files.filter(f => f.status === 'completed' && f.resultBlob)
    if (completed.length === 0) return

    if (completed.length === 1) {
      downloadSingle(completed[0])
      return
    }

    const zip = new JSZip()
    completed.forEach(f => {
      const name = f.file.name.replace(/\.svg$/i, '.png')
      zip.file(name, f.resultBlob!)
    })

    const content = await zip.generateAsync({ type: "blob" })
    saveAs(content, "toolhive-converted-svg.zip")
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  }

  const item = {
    hidden: { opacity: 0, scale: 0.95, y: 10 },
    show: { opacity: 1, scale: 1, y: 0 }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
        <ChevronRight className="size-4" />
        <Link href="/#image-tools" className="hover:text-foreground transition-colors">Image Tools</Link>
        <ChevronRight className="size-4" />
        <span className="text-foreground font-medium">SVG to PNG</span>
      </nav>

      {/* Hero Header */}
      <div className="mb-12 text-center max-w-2xl mx-auto">
        <h1 className="font-heading text-4xl sm:text-5xl font-extrabold mb-4">
          SVG to <span className="text-brand-orange">PNG</span> Converter
        </h1>
        <p className="text-muted-foreground text-lg">
          Export your vector SVGs to high-resolution PNGs with transparency. Clean, fast, and 100% private.
        </p>
      </div>

      {/* Main Dropzone */}
      <div className="space-y-8">
        <div 
          className="relative group bg-card border-2 border-dashed border-border hover:border-brand-orange/50 transition-all rounded-3xl p-12 text-center cursor-pointer overflow-hidden"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files) }}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="absolute inset-0 bg-brand-orange/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept=".svg" 
            multiple 
            onChange={(e) => handleFiles(e.target.files)} 
          />
          
          <div className="relative z-10">
            <div className="size-20 bg-brand-orange/10 text-brand-orange rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
              <FileCode className="size-10" />
            </div>
            <h2 className="text-2xl font-bold font-syne mb-2">Drop SVG files here</h2>
            <p className="text-muted-foreground mb-6">or click to browse from your device</p>
            <Button size="lg" className="bg-brand-orange hover:bg-brand-orange/90 text-white rounded-full px-8 h-12 text-lg font-bold shadow-lg">
              Select SVGs
            </Button>
          </div>
        </div>

        {/* Options */}
        <div className="bg-card rounded-2xl border border-border p-6 flex flex-wrap items-center justify-between gap-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="size-10 rounded-xl bg-brand-orange/10 text-brand-orange flex items-center justify-center shrink-0">
              <Maximize className="size-5" />
            </div>
            <div>
              <p className="font-bold">Export Resolution</p>
              <p className="text-xs text-muted-foreground">Scale up your vector for crisp export</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {[1, 2, 4, 8].map((s) => (
              <Button 
                key={s} 
                variant={scale === s ? "default" : "outline"}
                className={scale === s ? "bg-brand-orange hover:bg-brand-orange/90 text-white" : "border-border hover:bg-muted"}
                onClick={() => setScale(s)}
                size="sm"
              >
                {s}x
              </Button>
            ))}
          </div>
        </div>

        {/* File List */}
        <AnimatePresence>
          {files.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card rounded-3xl border border-border overflow-hidden shadow-xl"
            >
              <div className="p-6 border-b border-border bg-muted/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-brand-orange/10 text-brand-orange flex items-center justify-center">
                    <FileCode className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-bold">{files.length} file{files.length !== 1 ? 's' : ''} selected</h3>
                    <p className="text-xs text-muted-foreground">Local browser processing</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setFiles([])} disabled={isProcessing}>
                    Clear All
                  </Button>
                  {files.some(f => f.status === 'idle') && (
                    <Button 
                      className="bg-brand-orange hover:bg-brand-orange/90 text-white font-bold rounded-full"
                      onClick={convertFiles}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="size-4 animate-spin mr-2" />
                          Converting...
                        </>
                      ) : 'Convert to PNG'}
                    </Button>
                  )}
                  {files.some(f => f.status === 'completed') && !isProcessing && (
                    <Button 
                      variant="outline"
                      className="border-brand-orange text-brand-orange hover:bg-brand-orange/5 font-bold rounded-full"
                      onClick={downloadAll}
                    >
                      <Download className="size-4 mr-2" />
                      Download All (.ZIP)
                    </Button>
                  )}
                </div>
              </div>

              <motion.div variants={container} initial="hidden" animate="show" className="p-4 max-h-[400px] overflow-y-auto divide-y divide-border">
                {files.map((item) => (
                  <motion.div 
                    key={item.id} 
                    variants={item}
                    className="py-4 flex items-center justify-between group px-2"
                  >
                    <div className="flex items-center gap-4">
                      <div className="size-12 rounded-xl bg-muted flex items-center justify-center text-muted-foreground shrink-0 overflow-hidden">
                         <FileCode className="size-6" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold truncate max-w-[200px] sm:max-w-xs">{item.file.name}</p>
                        <p className="text-xs text-muted-foreground">{(item.file.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {item.status === 'processing' && (
                        <div className="flex items-center gap-2 text-brand-orange">
                          <Loader2 className="size-4 animate-spin" />
                          <span className="text-xs font-bold uppercase tracking-wider">Processing</span>
                        </div>
                      )}
                      {item.status === 'completed' && (
                        <div className="flex items-center gap-2 text-green-500">
                          <CheckCircle2 className="size-4" />
                          <span className="text-xs font-bold uppercase tracking-wider">Ready</span>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="size-8 rounded-full hover:bg-green-500/10 hover:text-green-600"
                            onClick={() => downloadSingle(item)}
                          >
                            <Download className="size-4" />
                          </Button>
                        </div>
                      )}
                      {item.status === 'error' && (
                        <div className="flex items-center gap-2 text-destructive">
                          <AlertCircle className="size-4" />
                          <span className="text-xs font-bold uppercase tracking-wider">Error</span>
                        </div>
                      )}
                      {item.status === 'idle' && (
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="size-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeFile(item.id)}
                        >
                          <X className="size-4" />
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
