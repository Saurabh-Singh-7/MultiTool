"use client"

import React, { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { ChevronRight, Upload, Trash2, CheckCircle2, AlertTriangle, FileText, Lock, Unlock, GripVertical, Settings2, Plus, Download, RefreshCw, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"

import { PDFDocument } from 'pdf-lib'
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent
} from '@dnd-kit/core'
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// --- Types ---
interface PdfFile {
  id: string
  file: File
  name: string
  size: number
  pageCount: number
  isEncrypted: boolean
  isUnlocked: boolean
  password?: string
  pageRangeStr: string
  validPages: number[]
  rangeError: string
  isCorrupted: boolean
  expanded: boolean
}

// --- Helper functions ---
const formatBytes = (bytes: number) => {
  if (bytes === 0) return "0 B"
  const k = 1024, sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

function parsePageRange(rangeStr: string, totalPages: number): { pages: number[], error: string } {
  if (!rangeStr.trim()) return { pages: Array.from({ length: totalPages }, (_, i) => i + 1), error: "" }
  
  const pages = new Set<number>()
  const parts = rangeStr.split(',').map(s => s.trim()).filter(Boolean)
  let error = ""

  for (const part of parts) {
    if (part.includes('-')) {
      const bounds = part.split('-').map(s => s.trim())
      if (bounds.length !== 2) {
        error = `Invalid range format: ${part}`
        break
      }
      const start = parseInt(bounds[0])
      const end = parseInt(bounds[1])
      if (isNaN(start) || isNaN(end)) {
        error = `Invalid number in range: ${part}`
        break
      }
      if (start < 1 || start > totalPages || end < 1 || end > totalPages) {
        error = `Range out of bounds: ${part} (max: ${totalPages})`
        break
      }
      if (start > end) {
        error = `Start page must be before end page: ${part}`
        break
      }
      for (let i = start; i <= end; i++) pages.add(i)
    } else {
      const n = parseInt(part)
      if (isNaN(n)) {
        error = `Invalid number: ${part}`
        break
      }
      if (n < 1 || n > totalPages) {
        error = `Page ${n} doesn't exist (max: ${totalPages})`
        break
      }
      pages.add(n)
    }
  }

  const result = Array.from(pages).sort((a, b) => a - b)
  if (!error && result.length === 0) {
    error = "No valid pages selected"
  }
  
  return { pages: result, error }
}

// --- Sortable Item Component ---
function SortablePDFItem({ 
  item, index, onRemove, onUpdateRange, onToggleExpand, onUnlock 
}: { 
  item: PdfFile, index: number, onRemove: (id: string) => void, onUpdateRange: (id: string, val: string) => void, onToggleExpand: (id: string) => void, onUnlock: (id: string, pwd: string) => void 
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id })
  const [pwdInput, setPwdInput] = useState("")

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 'auto',
  }

  return (
    <div ref={setNodeRef} style={style} className={`rounded-xl border bg-card overflow-hidden shadow-sm transition-all ${item.isCorrupted ? 'border-red-500/50 bg-red-500/5' : 'border-border'}`}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center p-3 gap-3">
        <div {...attributes} {...listeners} className="p-2 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground touch-none self-center sm:self-auto">
          <GripVertical className="size-5" />
        </div>
        
        <div className="flex-1 min-w-0 flex items-center gap-3 w-full sm:w-auto">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-500">
             {item.isEncrypted && !item.isUnlocked ? <Lock className="size-5" /> : <FileText className="size-5" />}
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-medium text-sm truncate flex items-center gap-2">
              <span className="text-brand-orange text-xs font-bold w-4">{index + 1}.</span> 
              {item.name}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5 flex gap-2">
              {item.isCorrupted ? (
                <span className="text-red-500 font-bold">Invalid / Corrupted PDF</span>
              ) : item.isEncrypted && !item.isUnlocked ? (
                <span className="text-amber-500 font-bold">Password Protected</span>
              ) : (
                <>
                  <span>{item.pageCount} pages</span>
                  <span>•</span>
                  <span>{formatBytes(item.size)}</span>
                  {item.validPages.length > 0 && item.validPages.length !== item.pageCount && (
                     <span className="text-brand-orange ml-1">({item.validPages.length} selected)</span>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center mt-2 sm:mt-0 w-full sm:w-auto justify-end">
          {item.isEncrypted && !item.isUnlocked && (
             <div className="flex gap-2 w-full sm:w-auto max-w-[200px]">
               <Input type="password" placeholder="Password" value={pwdInput} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPwdInput(e.target.value)} className="h-8 text-xs" />
               <Button size="sm" onClick={() => onUnlock(item.id, pwdInput)} className="h-8">Unlock</Button>
             </div>
          )}
          {!item.isCorrupted && (!item.isEncrypted || item.isUnlocked) && (
            <button onClick={() => onToggleExpand(item.id)} className="text-xs font-medium text-muted-foreground hover:text-foreground px-2 py-1 rounded hover:bg-muted transition-colors">
              {item.expanded ? 'Hide Range' : 'Page Range'}
            </button>
          )}
          <button onClick={() => onRemove(item.id)} className="p-2 text-muted-foreground hover:text-red-500 transition-colors shrink-0">
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>

      {item.expanded && !item.isCorrupted && (!item.isEncrypted || item.isUnlocked) && (
        <div className="bg-muted/30 border-t border-border p-4 text-sm animate-in fade-in slide-in-from-top-2">
           <div className="flex flex-col gap-2">
             <label className="font-bold text-xs uppercase text-muted-foreground">Pages to include</label>
             <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <Input 
                  value={item.pageRangeStr} 
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdateRange(item.id, e.target.value)}
                  placeholder="e.g. 1-5, 8, 11-13 (leave blank for all)" 
                  className={`max-w-[300px] bg-background ${item.rangeError ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                />
                <div className="text-xs">
                  {item.rangeError ? (
                     <span className="text-red-500 font-medium flex items-center gap-1"><AlertTriangle className="size-3" /> {item.rangeError}</span>
                  ) : item.pageRangeStr ? (
                     <span className="text-muted-foreground">Will include: {item.validPages.join(', ')} ({item.validPages.length} pages)</span>
                  ) : (
                     <span className="text-muted-foreground">All {item.pageCount} pages will be included.</span>
                  )}
                </div>
             </div>
           </div>
        </div>
      )}
    </div>
  )
}

// --- Main Client Component ---
export default function PDFMergeClient() {
  const [files, setFiles] = useState<PdfFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [toastMsg, setToastMsg] = useState("")
  
  // Settings
  const [outputName, setOutputName] = useState("merged_document")
  const [addBlankPage, setAddBlankPage] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  
  // Merge State
  const [isMerging, setIsMerging] = useState(false)
  const [mergeProgress, setMergeProgress] = useState(0)
  const [currentFileStr, setCurrentFileStr] = useState("")
  
  // Result
  const [resultBlob, setResultBlob] = useState<Blob | null>(null)
  const [resultStats, setResultStats] = useState({ count: 0, pages: 0, size: 0, time: 0 })
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  useEffect(() => {
    if (toastMsg) {
      const t = setTimeout(() => setToastMsg(""), 3000)
      return () => clearTimeout(t)
    }
  }, [toastMsg])

  const showToast = (msg: string) => setToastMsg(msg)

  // Load PDF info
  const analyzeFile = async (file: File): Promise<Partial<PdfFile>> => {
    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true })
      return {
        pageCount: pdf.getPageCount(),
        isEncrypted: pdf.isEncrypted,
        isUnlocked: !pdf.isEncrypted,
        isCorrupted: false,
        validPages: Array.from({ length: pdf.getPageCount() }, (_, i) => i + 1)
      }
    } catch (err: any) {
      if (err.message?.includes('encrypted')) {
         return { isEncrypted: true, isUnlocked: false, isCorrupted: false, pageCount: 0, validPages: [] }
      }
      return { isCorrupted: true, pageCount: 0, validPages: [], isEncrypted: false, isUnlocked: false }
    }
  }

  const handleFiles = async (newFiles: FileList | null) => {
    if (!newFiles || newFiles.length === 0) return
    
    let addedCount = 0
    let rejectedCount = 0
    
    const incoming: PdfFile[] = []
    
    for (let i = 0; i < newFiles.length; i++) {
      const file = newFiles[i]
      if (file.type !== 'application/pdf') {
        rejectedCount++
        continue
      }
      if (file.size > 100 * 1024 * 1024) {
        showToast(`⚠ ${file.name} is too large (Max 100MB)`)
        continue
      }
      if (files.length + incoming.length >= 20) {
        showToast("⚠ Maximum 20 files allowed.")
        break
      }
      
      const id = crypto.randomUUID()
      incoming.push({
        id, file, name: file.name, size: file.size, 
        pageCount: 0, isEncrypted: false, isUnlocked: true,
        pageRangeStr: "", validPages: [], rangeError: "",
        isCorrupted: false, expanded: false
      })
      addedCount++
    }
    
    if (rejectedCount > 0) showToast(`⚠ Skipped ${rejectedCount} non-PDF files`)
    if (incoming.length === 0) return
    
    // Add placeholders immediately
    setFiles(prev => [...prev, ...incoming])
    
    // Analyze async
    for (const item of incoming) {
      const data = await analyzeFile(item.file)
      setFiles(prev => prev.map(p => p.id === item.id ? { ...p, ...data } : p))
    }
    
    setResultBlob(null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setFiles((items) => {
        const oldIndex = items.findIndex(i => i.id === active.id)
        const newIndex = items.findIndex(i => i.id === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  const removeFile = (id: string) => setFiles(prev => prev.filter(p => p.id !== id))
  const clearAll = () => setFiles([])
  
  const toggleExpand = (id: string) => {
    setFiles(prev => prev.map(p => p.id === id ? { ...p, expanded: !p.expanded } : p))
  }
  
  const updateRange = (id: string, val: string) => {
    setFiles(prev => prev.map(p => {
      if (p.id !== id) return p
      const { pages, error } = parsePageRange(val, p.pageCount)
      return { ...p, pageRangeStr: val, validPages: pages, rangeError: error }
    }))
  }

  const unlockPdf = async (id: string, pwd: string) => {
    const item = files.find(i => i.id === id)
    if (!item) return
    try {
      const arrayBuffer = await item.file.arrayBuffer()
      const pdf = await PDFDocument.load(arrayBuffer, { password: pwd } as any)
      const pageCount = pdf.getPageCount()
      setFiles(prev => prev.map(p => p.id === id ? { 
        ...p, isUnlocked: true, password: pwd, pageCount, 
        validPages: Array.from({ length: pageCount }, (_, i) => i + 1)
      } : p))
      showToast("✓ PDF Unlocked!")
    } catch {
      showToast("⚠ Incorrect password")
    }
  }

  // MERGE EXECUTION
  const executeMerge = async () => {
    const validFiles = files.filter(f => !f.isCorrupted && f.isUnlocked && f.validPages.length > 0)
    if (validFiles.length < 2) {
      showToast("⚠ Need at least 2 valid PDFs to merge.")
      return
    }
    
    setIsMerging(true)
    setMergeProgress(5)
    const startTime = performance.now()
    let totalOutputPages = 0
    
    try {
      const mergedPdf = await PDFDocument.create()
      
      for (let i = 0; i < validFiles.length; i++) {
        const fileItem = validFiles[i]
        setCurrentFileStr(`${fileItem.name} (${i+1}/${validFiles.length})`)
        setMergeProgress(10 + Math.round((i / validFiles.length) * 80))
        
        const arrayBuffer = await fileItem.file.arrayBuffer()
        const pdf = await PDFDocument.load(arrayBuffer, { 
          password: fileItem.password,
          ignoreEncryption: !fileItem.password
        } as any)
        
        const pageIndices = fileItem.validPages.map(p => p - 1)
        const copiedPages = await mergedPdf.copyPages(pdf, pageIndices)
        
        for (const page of copiedPages) {
          mergedPdf.addPage(page)
          totalOutputPages++
        }
        
        if (addBlankPage && i < validFiles.length - 1) {
          mergedPdf.addPage()
          totalOutputPages++
        }
      }
      
      setMergeProgress(95)
      setCurrentFileStr("Saving merged document...")
      
      const mergedBytes = await mergedPdf.save()
      const blob = new Blob([mergedBytes as unknown as BlobPart], { type: 'application/pdf' })
      
      const endTime = performance.now()
      
      setResultBlob(blob)
      setResultStats({
        count: validFiles.length,
        pages: totalOutputPages,
        size: blob.size,
        time: Number(((endTime - startTime) / 1000).toFixed(1))
      })
      showToast("✓ Merge complete!")
      
    } catch (err) {
      console.error(err)
      showToast("⚠ Error during merge process.")
    } finally {
      setIsMerging(false)
      setMergeProgress(0)
    }
  }

  const downloadResult = () => {
    if (!resultBlob) return
    const url = URL.createObjectURL(resultBlob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${outputName || 'merged_document'}.pdf`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's' && resultBlob) {
        e.preventDefault()
        downloadResult()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [resultBlob, outputName])

  // Computed states
  const totalFiles = files.length
  const totalPages = files.reduce((acc, f) => acc + (f.isUnlocked && !f.isCorrupted ? f.validPages.length : 0), 0)
  const totalSize = files.reduce((acc, f) => acc + f.size, 0)
  const canMerge = files.filter(f => !f.isCorrupted && f.isUnlocked && !f.rangeError).length >= 2

  return (
    <>
      {toastMsg && (
        <div className="fixed bottom-4 right-4 z-50 animate-in fade-in slide-in-from-bottom-4 flex items-center gap-2 bg-card border border-border shadow-lg rounded-lg px-4 py-3">
          {toastMsg.startsWith('✓') ? <CheckCircle2 className="size-5 text-green-500" /> : <AlertTriangle className="size-5 text-amber-500" />}
          <span className="text-sm font-medium">{toastMsg.replace(/^[✓⚠]\s*/, '')}</span>
        </div>
      )}

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight className="size-3.5" />
          <Link href="/#pdf-tools" className="hover:text-foreground transition-colors">PDF Tools</Link>
          <ChevronRight className="size-3.5" />
          <span className="text-foreground font-medium">Merge PDF</span>
        </nav>

        <div className="mb-8 text-center max-w-2xl mx-auto">
          <h1 className="font-heading text-3xl font-bold sm:text-4xl sm:leading-[1.1] mb-3">
            Merge PDF Files — <span className="text-gradient">Free & Private</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Combine multiple PDF files into one document instantly. Drag to reorder, select custom pages, and download.
          </p>
        </div>

        {/* State 1: Empty / Upload */}
        {files.length === 0 && !resultBlob && (
          <div className="animate-in fade-in zoom-in-95">
            <div 
              className={`rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer overflow-hidden bg-card ${isDragging ? "border-brand-orange bg-brand-orange/5 scale-[1.01]" : "border-border hover:border-brand-orange/50 hover:bg-muted/50"}`}
              style={{ minHeight: '350px' }}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files) }}
              onClick={() => fileInputRef.current?.click()}
            >
              <input ref={fileInputRef} type="file" accept="application/pdf" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <div className="mb-6 flex size-24 items-center justify-center rounded-full bg-brand-orange/10 text-brand-orange">
                  <FileText className="size-12" />
                </div>
                <h3 className="font-heading text-2xl font-bold mb-2">Drop PDF files here to merge</h3>
                <p className="text-muted-foreground mb-6">Click to browse or drag and drop</p>
                <div className="flex gap-4 text-xs font-medium text-muted-foreground">
                  <span className="bg-muted px-3 py-1.5 rounded-full border border-border">PDF only</span>
                  <span className="bg-muted px-3 py-1.5 rounded-full border border-border">Up to 20 files</span>
                  <span className="bg-muted px-3 py-1.5 rounded-full border border-border">Max 100MB each</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* State 2: Active List */}
        {files.length > 0 && !resultBlob && (
          <div className="space-y-6 animate-in fade-in">
            
            {/* Header / Stats */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-border bg-card shadow-sm">
              <div className="flex items-center gap-2">
                <div className="size-10 rounded-full bg-brand-orange/10 flex items-center justify-center text-brand-orange">
                  <FileText className="size-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">{totalFiles} PDFs selected</h3>
                  <div className="text-xs text-muted-foreground">Total: {totalPages} pages • {formatBytes(totalSize)}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="flex-1 sm:flex-none">
                  <Plus className="size-4 mr-1.5" /> Add More
                </Button>
                <Button variant="ghost" size="sm" onClick={clearAll} className="text-muted-foreground hover:text-red-500 flex-1 sm:flex-none">
                  Clear All
                </Button>
              </div>
            </div>

            {totalSize > 500 * 1024 * 1024 && (
              <div className="bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 p-4 rounded-xl text-sm flex items-start gap-3">
                <AlertTriangle className="size-5 shrink-0" />
                <div>Total size is very large (&gt; 500MB). Merging runs entirely in your browser and may be slow on older devices.</div>
              </div>
            )}

            {/* File List (DND) */}
            <div className="bg-muted/30 p-2 rounded-2xl border border-border">
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={files.map(f => f.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-2">
                    {files.map((file, idx) => (
                      <SortablePDFItem 
                        key={file.id} 
                        item={file} 
                        index={idx} 
                        onRemove={removeFile}
                        onUpdateRange={updateRange}
                        onToggleExpand={toggleExpand}
                        onUnlock={unlockPdf}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>

            {/* Settings & Action */}
            <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
              <button 
                onClick={() => setShowSettings(!showSettings)}
                className="w-full p-4 flex items-center justify-between bg-muted/30 hover:bg-muted/50 transition-colors border-b border-border"
              >
                <div className="flex items-center gap-2">
                  <Settings2 className="size-4 text-muted-foreground" />
                  <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-muted-foreground">Merge Settings</h3>
                </div>
                <ChevronRight className={`size-4 text-muted-foreground transition-transform ${showSettings ? 'rotate-90' : ''}`} />
              </button>
              
              {showSettings && (
                <div className="p-5 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-sm font-bold text-foreground">Output Filename</label>
                      <div className="flex items-center gap-2">
                        <Input value={outputName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOutputName(e.target.value)} className="bg-background" />
                        <span className="text-muted-foreground text-sm font-mono">.pdf</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-sm font-bold text-foreground">Formatting</label>
                      <div className="flex items-center justify-between border border-border rounded-lg p-3 bg-background">
                        <div className="space-y-0.5">
                          <div className="text-sm font-medium">Add blank pages</div>
                          <div className="text-xs text-muted-foreground">Insert a blank page between merged files</div>
                        </div>
                        <Switch checked={addBlankPage} onCheckedChange={setAddBlankPage} />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-muted p-3 rounded-lg text-xs font-mono text-muted-foreground truncate border border-border">
                    <span className="font-bold text-foreground font-sans uppercase mr-2">Merge Order:</span>
                    {files.map(f => f.name).join(' → ')}
                  </div>
                </div>
              )}
              
              <div className="p-5 bg-card">
                <Button 
                  onClick={executeMerge} 
                  disabled={!canMerge || isMerging}
                  className="w-full h-14 text-lg font-bold bg-brand-orange hover:bg-brand-orange-hover text-white shadow-xl shadow-brand-orange/20 relative overflow-hidden"
                >
                  {isMerging ? (
                    <div className="flex flex-col items-center justify-center relative z-10 w-full">
                      <div className="flex items-center"><RefreshCw className="size-5 mr-2 animate-spin" /> Merging PDFs... {mergeProgress}%</div>
                      <div className="text-[10px] uppercase tracking-widest font-medium opacity-80 mt-1">{currentFileStr}</div>
                    </div>
                  ) : (
                    <span className="relative z-10 flex items-center">
                      <Link className="size-5 mr-2" href="#" onClick={e=>e.preventDefault()} /> 
                      Merge {canMerge ? validFilesCount() : files.length} PDFs
                    </span>
                  )}
                  {isMerging && (
                     <div className="absolute left-0 top-0 bottom-0 bg-black/20 transition-all duration-300" style={{ width: `${mergeProgress}%` }}></div>
                  )}
                </Button>
                
                {files.length === 1 && (
                  <div className="text-center text-sm text-red-500 font-medium mt-3">⚠ Upload at least 2 PDFs to merge.</div>
                )}
                {files.length > 1 && !canMerge && (
                  <div className="text-center text-sm text-red-500 font-medium mt-3">⚠ Resolve errors in the file list to merge.</div>
                )}
              </div>
            </div>

            {/* Hidden Input for adding more */}
            <input ref={fileInputRef} type="file" accept="application/pdf" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
          </div>
        )}

        {/* State 3: Result */}
        {resultBlob && (
          <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4">
            
            <div className="rounded-2xl border-2 border-green-500/20 bg-card shadow-xl overflow-hidden">
              <div className="bg-green-500/10 p-8 text-center border-b border-green-500/20">
                <div className="mx-auto size-16 bg-green-500 rounded-full flex items-center justify-center text-white mb-4 shadow-lg shadow-green-500/20">
                  <CheckCircle2 className="size-8" />
                </div>
                <h2 className="text-2xl font-bold text-green-700 dark:text-green-400 mb-2">Merge Complete!</h2>
                <p className="text-green-600/80 dark:text-green-500/80">Your PDFs have been successfully combined.</p>
              </div>
              
              <div className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-border bg-muted/30">
                    <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Files Merged</div>
                    <div className="text-2xl font-mono">{resultStats.count}</div>
                  </div>
                  <div className="p-4 rounded-xl border border-border bg-muted/30">
                    <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Total Pages</div>
                    <div className="text-2xl font-mono">{resultStats.pages}</div>
                  </div>
                  <div className="p-4 rounded-xl border border-border bg-muted/30">
                    <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Output Size</div>
                    <div className="text-2xl font-mono">{formatBytes(resultStats.size)}</div>
                  </div>
                  <div className="p-4 rounded-xl border border-border bg-muted/30">
                    <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Processing Time</div>
                    <div className="text-2xl font-mono">{resultStats.time}s</div>
                  </div>
                </div>

                <Button 
                  onClick={downloadResult}
                  className="w-full h-14 text-lg font-bold bg-brand-orange hover:bg-brand-orange-hover text-white shadow-xl shadow-brand-orange/20"
                >
                  <Download className="size-5 mr-2" /> Download Merged PDF
                </Button>
                <div className="text-center text-xs text-muted-foreground">Or press <kbd className="bg-muted px-1 rounded border border-border">Ctrl+S</kbd></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <Button variant="outline" onClick={() => { setResultBlob(null); setFiles([]) }} className="h-12 border-border hover:bg-muted">
                 <RefreshCw className="size-4 mr-2" /> Merge More PDFs
               </Button>
               <Button variant="outline" onClick={() => { setResultBlob(null); fileInputRef.current?.click() }} className="h-12 border-border hover:bg-muted">
                 <Plus className="size-4 mr-2" /> Add Files to Current
               </Button>
            </div>

            {/* Hidden Input for adding more from result view */}
            <input ref={fileInputRef} type="file" accept="application/pdf" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />

          </div>
        )}

      </div>
    </>
  )

  function validFilesCount() {
    return files.filter(f => !f.isCorrupted && f.isUnlocked && f.validPages.length > 0).length
  }
}
