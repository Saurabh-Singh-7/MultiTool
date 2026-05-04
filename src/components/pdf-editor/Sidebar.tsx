"use client"

import React from 'react'
import { usePDFEditor } from './PDFEditorContext'
import { ChevronLeft, ChevronRight, Trash2, Copy, RotateCw } from 'lucide-react'

export function Sidebar() {
  const { appState, thumbnails, setThumbnails, activePageId, setActivePageId, pageEditsRef } = usePDFEditor()

  if (appState !== 'editor') return null

  const currentIndex = thumbnails.findIndex(t => t.id === activePageId)

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (thumbnails.length <= 1) return alert("Cannot delete the last page!")
    const newThumbs = thumbnails.filter(t => t.id !== id)
    setThumbnails(newThumbs)
    if (activePageId === id) setActivePageId(newThumbs[0].id)
  }

  const handleDuplicate = (e: React.MouseEvent, thumb: any) => {
    e.stopPropagation()
    const idx = thumbnails.findIndex(t => t.id === thumb.id)
    const newId = `p${thumb.pageNum}_${Date.now()}`
    const newThumbs = [...thumbnails]
    newThumbs.splice(idx + 1, 0, { ...thumb, id: newId })
    setThumbnails(newThumbs)
    
    // Copy edits if any
    if (pageEditsRef.current.has(thumb.id)) {
      pageEditsRef.current.set(newId, pageEditsRef.current.get(thumb.id)!)
    }
    setActivePageId(newId)
  }

  const handleRotate = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    setThumbnails(thumbnails.map(t => t.id === id ? { ...t, rotation: (t.rotation + 90) % 360 } : t))
  }

  return (
    <div className="w-[160px] sm:w-[180px] bg-card border-r border-border flex flex-col shrink-0 z-10 shadow-sm">
      {/* Header */}
      <div className="p-3 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex justify-between items-center bg-muted/20">
        <span>{thumbnails.length} Pages</span>
        <div className="flex gap-1">
          <button 
            onClick={() => currentIndex > 0 && setActivePageId(thumbnails[currentIndex - 1].id)} 
            disabled={currentIndex <= 0}
            className="p-1 rounded hover:bg-muted disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="size-3.5" />
          </button>
          <button 
            onClick={() => currentIndex < thumbnails.length - 1 && setActivePageId(thumbnails[currentIndex + 1].id)}
            disabled={currentIndex >= thumbnails.length - 1 || currentIndex === -1}
            className="p-1 rounded hover:bg-muted disabled:opacity-30 transition-colors"
          >
            <ChevronRight className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Page Thumbnails */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4 bg-muted/10">
        {thumbnails.map((t, index) => (
          <div 
            key={t.id} 
            className={`group cursor-pointer rounded-lg overflow-hidden transition-all duration-200 relative ${
              activePageId === t.id 
                ? 'ring-2 ring-brand-orange ring-offset-2 ring-offset-background shadow-md scale-105' 
                : 'hover:ring-2 hover:ring-border hover:ring-offset-2 hover:ring-offset-background opacity-80 hover:opacity-100 hover:shadow-sm'
            }`}
            onClick={() => setActivePageId(t.id)}
          >
            <div className="relative bg-white border border-border/50 rounded-lg overflow-hidden aspect-[1/1.4] flex items-center justify-center">
              <img 
                src={t.thumbnailUrl} 
                alt={`Page ${index + 1}`} 
                className="w-full h-full object-contain transition-transform" 
                style={{ transform: `rotate(${t.rotation}deg)` }}
              />
              
              {/* Hover Actions Overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 backdrop-blur-[1px]">
                 <button onClick={(e) => handleRotate(e, t.id)} className="p-1.5 bg-white/10 hover:bg-white/20 hover:text-white text-white/80 rounded-full backdrop-blur-md transition-colors" title="Rotate Page"><RotateCw className="size-3.5" /></button>
                 <button onClick={(e) => handleDuplicate(e, t)} className="p-1.5 bg-white/10 hover:bg-white/20 hover:text-white text-white/80 rounded-full backdrop-blur-md transition-colors" title="Duplicate Page"><Copy className="size-3.5" /></button>
                 <button onClick={(e) => handleDelete(e, t.id)} className="p-1.5 bg-red-500/80 hover:bg-red-500 hover:text-white text-white rounded-full backdrop-blur-md transition-colors" title="Delete Page"><Trash2 className="size-3.5" /></button>
              </div>
            </div>
            <div className={`text-center py-1.5 text-[11px] font-semibold mt-1 transition-colors ${
              activePageId === t.id ? 'text-brand-orange' : 'text-muted-foreground group-hover:text-foreground'
            }`}>
              {index + 1}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
