"use client"

import React, { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, FileText, X, Download, AlertCircle, ChevronRight, CheckCircle2, Loader2, FileType } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import JSZip from "jszip"
import { saveAs } from "file-saver"
import mammoth from "mammoth"
import { jsPDF } from "jspdf"

interface FileStatus {
  file: File
  id: string
  status: 'idle' | 'processing' | 'completed' | 'error'
  resultBlob?: Blob
  error?: string
  progress: number
}

export default function WordToPDFClient() {
  const [files, setFiles] = useState<FileStatus[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFiles = (newFiles: FileList | null) => {
    if (!newFiles) return
    const validFiles = Array.from(newFiles).filter(f => 
      f.name.toLowerCase().endsWith('.docx')
    )

    if (validFiles.length === 0 && newFiles.length > 0) {
      alert("Only .docx files are supported at this time.")
    }

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
        const arrayBuffer = await newFiles[i].file.arrayBuffer()
        const result = await mammoth.convertToHtml({ arrayBuffer })
        const html = result.value

        // Simple jsPDF generation from text (Mammoth gives us HTML)
        // For a more robust solution, we'd use a more complex layout engine,
        // but for a fast browser-based tool, we'll use a clean text-based approach.
        const pdf = new jsPDF()
        
        // Split HTML to plain text for simplicity in this version
        const div = document.createElement('div')
        div.innerHTML = html
        const text = div.innerText

        const splitText = pdf.splitTextToSize(text, 180)
        let y = 20
        for (let line of splitText) {
          if (y > 280) {
            pdf.addPage()
            y = 20
          }
          pdf.text(line, 15, y)
          y += 7
        }

        const blob = pdf.output('blob')
        newFiles[i].resultBlob = blob
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
    const name = item.file.name.replace(/\.docx$/i, '.pdf')
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
      const name = f.file.name.replace(/\.docx$/i, '.pdf')
      zip.file(name, f.resultBlob!)
    })

    const content = await zip.generateAsync({ type: "blob" })
    saveAs(content, "toolhive-word-to-pdf.zip")
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
        <Link href="/#pdf-tools" className="hover:text-foreground transition-colors">PDF Tools</Link>
        <ChevronRight className="size-4" />
        <span className="text-foreground font-medium">Word to PDF</span>
      </nav>

      {/* Hero Header */}
      <div className="mb-12 text-center max-w-2xl mx-auto">
        <h1 className="font-heading text-4xl sm:text-5xl font-extrabold mb-4">
          Word to <span className="text-brand-orange">PDF</span> Converter
        </h1>
        <p className="text-muted-foreground text-lg">
          Transform your DOCX documents into professional PDF files. Fast, private, and works entirely in your browser.
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
            accept=".docx" 
            multiple 
            onChange={(e) => handleFiles(e.target.files)} 
          />
          
          <div className="relative z-10">
            <div className="size-20 bg-brand-orange/10 text-brand-orange rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
              <Upload className="size-10" />
            </div>
            <h2 className="text-2xl font-bold font-syne mb-2">Drop Word documents here</h2>
            <p className="text-muted-foreground mb-6">or click to browse from your device (.docx only)</p>
            <Button size="lg" className="bg-brand-orange hover:bg-brand-orange/90 text-white rounded-full px-8 h-12 text-lg font-bold shadow-lg">
              Select Documents
            </Button>
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
                    <FileType className="size-5" />
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
                      ) : 'Convert to PDF'}
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
                         <FileText className="size-6" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold truncate max-w-[200px] sm:max-w-xs">{item.file.name}</p>
                        <p className="text-xs text-muted-foreground">{(item.file.size / 1024 / 1024).toFixed(2)} MB</p>
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
