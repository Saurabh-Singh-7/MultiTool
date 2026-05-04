"use client"

import React, { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { ChevronRight, FileText, Lock, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PDFDocument } from 'pdf-lib'

import { PDFEditorProvider, usePDFEditor } from "@/components/pdf-editor/PDFEditorContext"
import { Toolbar } from "@/components/pdf-editor/Toolbar"
import { Sidebar } from "@/components/pdf-editor/Sidebar"
import { CanvasArea } from "@/components/pdf-editor/CanvasArea"
import { PageThumbnail } from "@/components/pdf-editor/types"

// Dynamic load pdfjs
async function getPdfjs() {
  const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf')
  if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
  }
  return pdfjsLib
}

function PDFEditorApp() {
  const { 
    appState, setAppState, setFile, 
    originalPdfBuffer, setOriginalPdfBuffer,
    setPdfDoc, thumbnails, setThumbnails, setActivePageId,
    pageEditsRef, fabricCanvas, activePageId
  } = usePDFEditor()

  const [isPasswordProtected, setIsPasswordProtected] = useState(false)
  const [password, setPassword] = useState("")
  const [loadingMsg, setLoadingMsg] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFiles = async (newFiles: FileList | null) => {
    if (!newFiles || newFiles.length === 0) return
    const f = newFiles[0]
    
    if (f.type !== 'application/pdf') {
      alert("Please upload a PDF file")
      return
    }
    
    setFile(f)
    setAppState('loading')
    setLoadingMsg("Reading PDF file...")
    
    try {
      const buffer = await f.arrayBuffer()
      setOriginalPdfBuffer(buffer)
      await loadPdf(buffer)
    } catch (e: any) {
      if (e.name === 'PasswordException') {
         setIsPasswordProtected(true)
         setAppState('upload')
      } else {
         alert("Could not read this PDF. The file may be corrupted.")
         setAppState('upload')
      }
    }
  }

  const loadPdf = async (buffer: ArrayBuffer, pwd?: string) => {
    const pdfjsLib = await getPdfjs()
    const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer.slice(0)), password: pwd })
    
    const pdf = await loadingTask.promise
    setPdfDoc(pdf)
    setIsPasswordProtected(false)
    
    const numPages = pdf.numPages
    const newThumbnails: PageThumbnail[] = []
    
    for (let i = 1; i <= numPages; i++) {
      setLoadingMsg(`Loading pages... ${i} / ${numPages}`)
      const page = await pdf.getPage(i)
      const viewport = page.getViewport({ scale: 0.2 }) // small scale for thumbnail
      const canvas = document.createElement('canvas')
      canvas.width = viewport.width
      canvas.height = viewport.height
      const ctx = canvas.getContext('2d')
      
      if (ctx) {
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        await page.render({ canvasContext: ctx, viewport }).promise
        
        newThumbnails.push({
          id: `p${i}_${Date.now()}`,
          pageNum: i,
          thumbnailUrl: canvas.toDataURL('image/jpeg', 0.5),
          width: viewport.width,
          height: viewport.height,
          pageRef: page,
          rotation: 0
        })
      }
    }
    
    setThumbnails(newThumbnails)
    if (newThumbnails.length > 0) setActivePageId(newThumbnails[0].id)
    setAppState('editor')
  }

  const handlePasswordSubmit = async () => {
    if (!password || !originalPdfBuffer) return
    setAppState('loading')
    setLoadingMsg("Unlocking PDF...")
    try {
      await loadPdf(originalPdfBuffer, password)
    } catch (e) {
      setIsPasswordProtected(true)
      setAppState('upload')
      alert("Incorrect password. Try again.")
    }
  }

  const exportPdf = async () => {
    if (!originalPdfBuffer) return
    
    // Save current page edits before exporting
    if (fabricCanvas && activePageId) {
      const json = JSON.stringify(fabricCanvas.toJSON(['data']))
      pageEditsRef.current.set(activePageId, json)
    }
    
    setAppState('exporting')
    setLoadingMsg("Merging changes and preparing PDF...")
    
    try {
      const { PDFDocument, degrees } = await import('pdf-lib')
      const newPdf = await PDFDocument.create()
      const pdfjsLib = await getPdfjs()
      const srcPdf = await pdfjsLib.getDocument({ data: new Uint8Array(originalPdfBuffer.slice(0)) }).promise
      
      const exportScale = 2.0
      let fab: any = null
      if (typeof window !== 'undefined') {
        fab = require('fabric').fabric
      }
      
      for (let i = 0; i < thumbnails.length; i++) {
         const thumb = thumbnails[i]
         const pageNum = thumb.pageNum // 1-indexed original page number
         const pageId = thumb.id
         
         setLoadingMsg(`Exporting page ${i + 1} of ${thumbnails.length}...`)
         
         // Render PDF page at export scale
         const srcPage = await srcPdf.getPage(pageNum)
         const viewport = srcPage.getViewport({ scale: exportScale })
         const w = Math.round(viewport.width)
         const h = Math.round(viewport.height)
         
         const mergedCanvas = document.createElement('canvas')
         mergedCanvas.width = w
         mergedCanvas.height = h
         const ctx = mergedCanvas.getContext('2d')!
         ctx.fillStyle = '#FFFFFF'
         ctx.fillRect(0, 0, w, h)
         await srcPage.render({ canvasContext: ctx, viewport }).promise
         
         // If this page has edits, erase the original text first to prevent ghosting
         if (pageEditsRef.current.has(pageId) && fab) {
            // Erase original text by drawing white rectangles over their bounds
            const textContent = await srcPage.getTextContent()
            const vt = viewport.transform
            textContent.items.forEach((item: any) => {
              if (!item.str || !item.str.trim()) return
              const t = item.transform
              const pdfFontSize = Math.abs(t[3])
              const canvasX = vt[0] * t[4] + vt[2] * t[5] + vt[4]
              const canvasY = vt[1] * t[4] + vt[3] * t[5] + vt[5]
              const fontH = pdfFontSize * exportScale
              const y = canvasY - fontH * 0.85
              const w = (item.width || 0) * exportScale
              const h = fontH * 1.15
              
              const px = 6
              const py = 4
              ctx.fillStyle = '#FFFFFF'
              ctx.fillRect(canvasX - px, y - py, w + px * 2, h + py * 2)
            })

            const stateJSON = pageEditsRef.current.get(pageId)
            if (stateJSON) {
               const parsed = JSON.parse(stateJSON)
               // Remove backgroundImage from the state — we already rendered the PDF
               delete parsed.backgroundImage
               parsed.background = 'transparent'
               
               // The edits were saved at scale 1.5, export is at scale 2.0
               // We need to scale all objects by (exportScale / 1.5)
               const scaleFactor = exportScale / 1.5
               
               const tempCanvas = new fab.StaticCanvas(null, { width: w, height: h })
               await new Promise<void>(resolve => {
                  tempCanvas.loadFromJSON(parsed, () => {
                     tempCanvas.setZoom(scaleFactor)
                     tempCanvas.setWidth(w)
                     tempCanvas.setHeight(h)
                     tempCanvas.renderAll()
                     ctx.drawImage(tempCanvas.getElement(), 0, 0)
                     resolve()
                  })
               })
            }
         }
         
         const dataUrl = mergedCanvas.toDataURL('image/jpeg', 0.92)
         const base64Data = dataUrl.split(',')[1]
         const imgBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0))
         
         const jpgImg = await newPdf.embedJpg(imgBytes)
         const dims = srcPage.getViewport({ scale: 1 })
         const newPage = newPdf.addPage([dims.width, dims.height])
         if (thumb.rotation) {
            newPage.setRotation(degrees(thumb.rotation))
         }
         newPage.drawImage(jpgImg, {
            x: 0, y: 0, width: dims.width, height: dims.height
         })
         
         await new Promise(r => setTimeout(r, 10))
      }
      
      const pdfBytes = await newPdf.save()
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'edited_document.pdf'
      a.click()
      URL.revokeObjectURL(url)
      
      setAppState('editor')
      
    } catch (e) {
      console.error(e)
      alert("Failed to export PDF.")
      setAppState('editor')
    }
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] w-full relative">
      {(appState === 'upload' || appState === 'loading') && (
        <div className="flex-1 flex flex-col pt-8 pb-16 px-4 md:px-8">
           <div className="mb-8 text-center max-w-4xl mx-auto">
             <nav className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground mb-6">
               <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
               <ChevronRight className="size-3.5" />
               <Link href="/#pdf-tools" className="hover:text-foreground transition-colors">PDF Tools</Link>
               <ChevronRight className="size-3.5" />
               <span className="text-foreground font-medium">PDF Editor</span>
             </nav>
             <h1 className="font-heading text-4xl sm:text-5xl font-bold sm:leading-[1.1] mb-4">
               Free Online PDF Editor
             </h1>
             <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
               Edit PDF files instantly. Add text, highlight, whiteout, insert images and signatures. Free, secure, works in your browser.
             </p>
           </div>

           <div className="absolute inset-0 z-50 bg-background flex flex-col items-center justify-center p-4">
             {appState === 'upload' ? (
                isPasswordProtected ? (
                  <div className="bg-card border border-border rounded-2xl p-10 text-center shadow-sm max-w-md w-full">
                     <div className="size-16 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                       <Lock className="size-8" />
                     </div>
                     <h3 className="text-xl font-bold mb-2">Password Protected</h3>
                     <p className="text-muted-foreground mb-6">Enter password to unlock and edit.</p>
                     <div className="flex gap-2">
                       <Input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => { if(e.key === 'Enter' && originalPdfBuffer) handlePasswordSubmit() }} />
                       <Button className="bg-brand-orange text-white" onClick={handlePasswordSubmit}>Unlock</Button>
                     </div>
                  </div>
                ) : (
                   <div 
                     className="max-w-2xl w-full bg-card border-2 border-dashed border-border hover:border-brand-orange/50 transition-colors rounded-2xl p-16 text-center cursor-pointer flex flex-col items-center shadow-sm"
                     onClick={() => fileInputRef.current?.click()}
                     onDragOver={e => e.preventDefault()}
                     onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files) }}
                   >
                     <input ref={fileInputRef} type="file" accept="application/pdf" className="hidden" onChange={e => handleFiles(e.target.files)} />
                     <div className="size-20 bg-brand-orange/10 text-brand-orange rounded-full flex items-center justify-center mb-6">
                        <FileText className="size-10" />
                     </div>
                     <h2 className="text-2xl font-bold font-heading mb-2">Drop your PDF here to start editing</h2>
                     <p className="text-muted-foreground mb-6">PDF files only • Max 100MB</p>
                     <Button className="bg-brand-orange hover:bg-brand-orange/90 text-white font-bold h-12 px-8 text-lg rounded-full shadow-lg">Open PDF</Button>
                   </div>
                )
             ) : (
               <div className="text-center space-y-4">
                  <div className="size-16 border-4 border-brand-orange/30 border-t-brand-orange rounded-full animate-spin mx-auto"></div>
                  <h3 className="text-xl font-bold">{loadingMsg}</h3>
               </div>
             )}
           </div>
        </div>
      )}

      {(appState === 'editor' || appState === 'exporting') && (
        <div className="fixed inset-0 top-16 z-40 bg-background flex flex-col">
           <Toolbar exportPdf={exportPdf} />
           <div className="flex-1 flex overflow-hidden relative">
              <Sidebar />
              <CanvasArea />
              
              {appState === 'exporting' && (
                <div className="absolute inset-0 z-50 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center">
                   <div className="bg-card border border-border rounded-2xl p-10 shadow-xl flex flex-col items-center max-w-sm w-full text-center">
                     <div className="size-16 border-4 border-brand-orange/30 border-t-brand-orange rounded-full animate-spin mx-auto mb-6"></div>
                     <h3 className="text-xl font-bold font-heading">{loadingMsg}</h3>
                     <p className="text-muted-foreground mt-2 text-sm">Please do not close this tab.</p>
                   </div>
                </div>
              )}
           </div>
        </div>
      )}
    </div>
  )
}

export default function PDFEditorClient() {
  return (
    <PDFEditorProvider>
      <PDFEditorApp />
    </PDFEditorProvider>
  )
}
