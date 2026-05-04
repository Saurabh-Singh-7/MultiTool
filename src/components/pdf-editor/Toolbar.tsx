"use client"

import React, { useRef, useState, useEffect } from 'react'
import { usePDFEditor } from './PDFEditorContext'
import { EditorTool } from './types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { 
  Type, Link as LinkIcon, FileCheck2, Image as ImageIcon, PenTool, 
  Eraser, Highlighter, Shapes, Undo2, Download, Plus, MousePointer2,
  AlignLeft, AlignCenter, AlignRight, Circle, Square, Minus, ArrowRight, Trash2
} from 'lucide-react'
import { SignModal } from './tools/SignModal'

const FONTS = [
  'Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Georgia', 'Verdana',
  'Inter', 'Lato', 'Open Sans', 'Roboto', 'Poppins', 'PT Sans', 'PT Serif',
  'Noto Sans', 'Noto Serif', 'Fira Sans', 'EB Garamond', 'Caveat',
  'Dancing Script', 'Pacifico', 'Satisfy', 'Great Vibes',
]

export function Toolbar({ exportPdf }: { exportPdf: () => void }) {
  const { 
    appState, activeTool, setActiveTool, activeObject,
    fontFamily, setFontFamily, fontSize, setFontSize, textColor, setTextColor,
    isBold, setIsBold, isItalic, setIsItalic, isUnderline, setIsUnderline, textAlign, setTextAlign,
    strokeColor, setStrokeColor, fillColor, setFillColor, strokeWidth, setStrokeWidth,
    undo, canUndo, fabricCanvas, saveHistory
  } = usePDFEditor()

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isSignModalOpen, setIsSignModalOpen] = useState(false)

  // Sync toolbar state when user selects an existing text object
  useEffect(() => {
    if (!activeObject) return
    if (activeObject.type === 'i-text' || activeObject.type === 'textbox') {
      const obj = activeObject as any
      if (obj.fontFamily) setFontFamily(obj.fontFamily)
      if (obj.fontSize) setFontSize(obj.fontSize)
      if (obj.fill) setTextColor(obj.fill as string)
      setIsBold(obj.fontWeight === 'bold')
      setIsItalic(obj.fontStyle === 'italic')
      setIsUnderline(!!obj.underline)
      if (obj.textAlign) setTextAlign(obj.textAlign)
    } else if (['rect', 'circle', 'path'].includes(activeObject.type || '')) {
      const obj = activeObject as any
      if (obj.fill) setFillColor(obj.fill as string)
      if (obj.stroke) setStrokeColor(obj.stroke as string)
      if (obj.strokeWidth !== undefined) setStrokeWidth(obj.strokeWidth)
    }
  }, [activeObject])

  if (appState !== 'editor') return null

  const isTextSelected = activeObject && (activeObject.type === 'i-text' || activeObject.type === 'textbox')
  const isShapeSelected = activeObject && ['rect', 'circle', 'path', 'line'].includes(activeObject.type || '')
  const isWhiteout = isShapeSelected && (activeObject as any).data?.type === 'whiteout'

  const updateProp = (prop: string, value: any) => {
    if (!fabricCanvas || !activeObject) return
    if (activeObject.type === 'activeSelection') {
       (activeObject as any).forEachObject((obj: any) => obj.set(prop, value))
    } else {
       activeObject.set(prop as any, value)
    }
    fabricCanvas.requestRenderAll()
    saveHistory()
  }

  const handleToolClick = (tool: EditorTool) => {
    setActiveTool(tool)
    if (fabricCanvas) {
      fabricCanvas.discardActiveObject()
      fabricCanvas.requestRenderAll()
    }
  }

  const deleteSelected = () => {
    if (!fabricCanvas) return
    const obj = fabricCanvas.getActiveObject()
    if (obj) {
      if (obj.type === 'activeSelection') {
        (obj as any).forEachObject((o: any) => fabricCanvas.remove(o))
        fabricCanvas.discardActiveObject()
      } else {
        fabricCanvas.remove(obj)
      }
      fabricCanvas.requestRenderAll()
      saveHistory()
    }
  }

  return (
    <div className="bg-card border-b border-border shadow-sm z-20 shrink-0 flex flex-col w-full">
      {/* Main Toolbar */}
      <div className="h-14 flex items-center justify-between px-3 w-full">
        <div className="flex items-center gap-0.5 overflow-x-auto no-scrollbar">
          <ToolBtn active={activeTool === 'select'} onClick={() => { setActiveTool('select'); if(fabricCanvas) { fabricCanvas.selection = true; fabricCanvas.forEachObject((o:any) => { o.selectable=true; o.evented=true }); fabricCanvas.requestRenderAll() }}} icon={<MousePointer2 className="size-4" />} label="Select" />
          <div className="w-px h-6 bg-border mx-1" />
          <ToolBtn active={activeTool === 'text'} onClick={() => handleToolClick('text')} icon={<Type className="size-4" />} label="Text" />
          <ToolBtn active={activeTool === 'images'} onClick={() => handleToolClick('images')} icon={<ImageIcon className="size-4" />} label="Images" />
          <ToolBtn active={activeTool.startsWith('shape')} onClick={() => handleToolClick('shape-rect')} icon={<Shapes className="size-4" />} label="Shapes" />
          <ToolBtn active={activeTool === 'sign'} onClick={() => handleToolClick('sign')} icon={<PenTool className="size-4" />} label="Sign" />
          <ToolBtn active={activeTool === 'annotate'} onClick={() => handleToolClick('annotate')} icon={<Highlighter className="size-4" />} label="Annotate" />
          <ToolBtn active={activeTool === 'whiteout'} onClick={() => handleToolClick('whiteout')} icon={<Eraser className="size-4" />} label="Erase" />
          <ToolBtn active={activeTool === 'links'} onClick={() => handleToolClick('links')} icon={<LinkIcon className="size-4" />} label="Links" />
        </div>
        
        <div className="flex items-center gap-2 shrink-0 ml-3">
          {activeObject && (
            <Button variant="ghost" size="icon" onClick={deleteSelected} title="Delete selected"><Trash2 className="size-4 text-red-500" /></Button>
          )}
          <Button variant="ghost" size="icon" onClick={undo} disabled={!canUndo} title="Undo (Ctrl+Z)"><Undo2 className="size-4" /></Button>
          <div className="w-px h-6 bg-border mx-1" />
          <Button className="bg-brand-orange hover:bg-brand-orange/90 text-white shadow-md font-bold h-9 px-4" onClick={exportPdf}>
            Apply changes <Download className="size-4 ml-2" />
          </Button>
        </div>
      </div>

      {/* Contextual Sub-toolbar */}
      <div className="min-h-[48px] bg-gradient-to-r from-muted/50 to-transparent border-t border-border flex items-center px-5 w-full overflow-x-auto text-sm gap-4 shadow-inner">
        
        {(activeTool === 'text' || isTextSelected) && (
          <div className="flex items-center gap-3 py-1">
             <select className="h-8 rounded border border-border bg-card px-2 min-w-[130px] text-xs" value={fontFamily} onChange={e => { setFontFamily(e.target.value); updateProp('fontFamily', e.target.value) }}>
                {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
             </select>

             <Input type="number" className="w-14 h-8 text-xs" value={fontSize} min={6} max={200}
               onChange={e => { const v = Number(e.target.value); setFontSize(v); updateProp('fontSize', v) }} />
             
             <div className="flex border border-border rounded overflow-hidden h-8">
                <button className={`w-7 flex items-center justify-center text-xs font-bold ${isBold ? 'bg-brand-orange/20 text-brand-orange' : 'bg-card hover:bg-muted'}`} onClick={() => { setIsBold(!isBold); updateProp('fontWeight', !isBold ? 'bold' : 'normal') }}>B</button>
                <button className={`w-7 flex items-center justify-center text-xs italic border-l border-border ${isItalic ? 'bg-brand-orange/20 text-brand-orange' : 'bg-card hover:bg-muted'}`} onClick={() => { setIsItalic(!isItalic); updateProp('fontStyle', !isItalic ? 'italic' : 'normal') }}>I</button>
                <button className={`w-7 flex items-center justify-center text-xs underline border-l border-border ${isUnderline ? 'bg-brand-orange/20 text-brand-orange' : 'bg-card hover:bg-muted'}`} onClick={() => { setIsUnderline(!isUnderline); updateProp('underline', !isUnderline) }}>U</button>
             </div>
             
             <div className="flex border border-border rounded overflow-hidden h-8">
                <button className={`w-7 flex items-center justify-center ${textAlign==='left' ? 'bg-brand-orange/20 text-brand-orange' : 'bg-card hover:bg-muted'}`} onClick={() => { setTextAlign('left'); updateProp('textAlign', 'left') }}><AlignLeft className="size-3" /></button>
                <button className={`w-7 flex items-center justify-center border-l border-border ${textAlign==='center' ? 'bg-brand-orange/20 text-brand-orange' : 'bg-card hover:bg-muted'}`} onClick={() => { setTextAlign('center'); updateProp('textAlign', 'center') }}><AlignCenter className="size-3" /></button>
                <button className={`w-7 flex items-center justify-center border-l border-border ${textAlign==='right' ? 'bg-brand-orange/20 text-brand-orange' : 'bg-card hover:bg-muted'}`} onClick={() => { setTextAlign('right'); updateProp('textAlign', 'right') }}><AlignRight className="size-3" /></button>
             </div>
             
             <div className="flex items-center gap-1.5 border-l border-border pl-3">
                <span className="text-muted-foreground text-xs">Color</span>
                <input type="color" className="w-7 h-7 p-0 border-0 rounded cursor-pointer bg-transparent" value={textColor} onChange={e => { setTextColor(e.target.value); updateProp('fill', e.target.value) }} />
             </div>
          </div>
        )}

        {activeTool.startsWith('shape') && !isTextSelected && !isShapeSelected && (
          <div className="flex items-center gap-3 py-1">
             <div className="flex gap-1">
                <Button variant={activeTool === 'shape-rect' ? 'default' : 'outline'} className={`h-8 text-xs px-2 ${activeTool === 'shape-rect' ? 'bg-brand-orange text-white' : ''}`} size="sm" onClick={() => handleToolClick('shape-rect')}><Square className="size-3.5 mr-1.5"/> Rect</Button>
                <Button variant={activeTool === 'shape-circle' ? 'default' : 'outline'} className={`h-8 text-xs px-2 ${activeTool === 'shape-circle' ? 'bg-brand-orange text-white' : ''}`} size="sm" onClick={() => handleToolClick('shape-circle')}><Circle className="size-3.5 mr-1.5"/> Circle</Button>
                <Button variant={activeTool === 'shape-line' ? 'default' : 'outline'} className={`h-8 text-xs px-2 ${activeTool === 'shape-line' ? 'bg-brand-orange text-white' : ''}`} size="sm" onClick={() => handleToolClick('shape-line')}><Minus className="size-3.5 mr-1.5"/> Line</Button>
                <Button variant={activeTool === 'shape-arrow' ? 'default' : 'outline'} className={`h-8 text-xs px-2 ${activeTool === 'shape-arrow' ? 'bg-brand-orange text-white' : ''}`} size="sm" onClick={() => handleToolClick('shape-arrow')}><ArrowRight className="size-3.5 mr-1.5"/> Arrow</Button>
             </div>
             <div className="w-px h-6 bg-border mx-2" />
             <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-xs">Fill</span>
                <input type="color" className="w-7 h-7 p-0 border-0 rounded cursor-pointer bg-transparent rounded-full overflow-hidden [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none" value={fillColor === 'transparent' ? '#ffffff' : fillColor} onChange={e => setFillColor(e.target.value)} />
                <Button variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={() => setFillColor('transparent')}>Clear</Button>
             </div>
             <div className="flex items-center gap-2 ml-2">
                <span className="text-muted-foreground text-xs">Stroke</span>
                <input type="color" className="w-7 h-7 p-0 border-0 rounded cursor-pointer bg-transparent rounded-full overflow-hidden [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none" value={strokeColor} onChange={e => setStrokeColor(e.target.value)} />
                <Input type="number" className="w-14 h-7 text-xs" value={strokeWidth} min={0} max={50} onChange={e => setStrokeWidth(Number(e.target.value))} />
             </div>
          </div>
        )}
        {isShapeSelected && !isWhiteout && (
          <div className="flex items-center gap-3 py-1">
             <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-xs">Fill</span>
                <input type="color" className="w-7 h-7 p-0 border-0 rounded cursor-pointer bg-transparent rounded-full overflow-hidden [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none" value={fillColor === 'transparent' ? '#ffffff' : fillColor} onChange={e => { setFillColor(e.target.value); updateProp('fill', e.target.value) }} />
                <Button variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={() => { setFillColor('transparent'); updateProp('fill', 'transparent') }}>Clear</Button>
             </div>
             <div className="w-px h-6 bg-border mx-2" />
             <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-xs">Stroke</span>
                <input type="color" className="w-7 h-7 p-0 border-0 rounded cursor-pointer bg-transparent rounded-full overflow-hidden [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none" value={strokeColor} onChange={e => { setStrokeColor(e.target.value); updateProp('stroke', e.target.value) }} />
                <Input type="number" className="w-14 h-7 text-xs" value={strokeWidth} min={0} max={50} onChange={e => { setStrokeWidth(Number(e.target.value)); updateProp('strokeWidth', Number(e.target.value)) }} />
             </div>
          </div>
        )}

        {activeTool === 'images' && !isTextSelected && !isShapeSelected && (
          <div className="flex gap-2 py-1">
             <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => fileInputRef.current?.click()}><Plus className="size-3.5 mr-1.5"/> Upload Image</Button>
             <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) { window.dispatchEvent(new CustomEvent('pdf-editor:insert-image', { detail: { file }})) }
                e.target.value = ''
             }}/>
          </div>
        )}

        {activeTool === 'sign' && !isTextSelected && !isShapeSelected && (
          <div className="flex gap-2 py-1">
             <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setIsSignModalOpen(true)}><Plus className="size-3.5 mr-1.5"/> New Signature</Button>
             <span className="text-muted-foreground text-xs ml-2">Create and place a signature on the document.</span>
          </div>
        )}

        {activeTool === 'whiteout' && !isTextSelected && !isShapeSelected && (
          <div className="flex items-center gap-4 py-1">
             <span className="text-muted-foreground text-xs font-medium">Erase Area:</span>
             <span className="text-muted-foreground text-xs hidden md:inline">Drag to draw a box that hides content underneath it.</span>
             <div className="w-px h-6 bg-border hidden sm:block" />
             <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground mr-1">Color:</span>
                {['#FFFFFF', '#000000'].map(c => (
                  <button 
                    key={c} 
                    className={`size-5 rounded-full border ${fillColor === c ? 'border-brand-orange scale-110 shadow-sm' : 'border-border hover:scale-110'} transition-transform`} 
                    style={{ backgroundColor: c }} 
                    onClick={() => setFillColor(c)} 
                    title={c === '#FFFFFF' ? 'White' : 'Black'}
                  />
                ))}
                <input type="color" className="w-5 h-5 p-0 border-0 cursor-pointer ml-1 rounded overflow-hidden" value={(!fillColor || fillColor === 'transparent') ? '#FFFFFF' : fillColor} onChange={e => setFillColor(e.target.value)} title="Custom Color / Eye Dropper" />
             </div>
          </div>
        )}
        {activeTool === 'links' && !isTextSelected && !isShapeSelected && (
          <span className="text-muted-foreground text-xs py-1">Drag on the page to create a link area.</span>
        )}
        {activeTool === 'annotate' && !isTextSelected && !isShapeSelected && (
          <div className="flex items-center gap-4 py-1">
             <span className="text-muted-foreground text-xs py-1 hidden sm:inline">Draw freehand to highlight. Press <kbd className="px-1 py-0.5 bg-muted border border-border rounded text-[10px]">Esc</kbd> to stop.</span>
             <div className="w-px h-6 bg-border" />
             <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground mr-1">Color:</span>
                {['#ffeb3b', '#4caf50', '#03a9f4', '#e91e63', '#ff9800', '#000000'].map(c => (
                  <button 
                    key={c} 
                    className={`size-5 rounded-full border-2 ${strokeColor === c ? 'border-brand-orange scale-110 shadow-sm' : 'border-transparent hover:scale-110'} transition-transform`} 
                    style={{ backgroundColor: c, opacity: 0.8 }} 
                    onClick={() => setStrokeColor(c)} 
                    title={c}
                  />
                ))}
                <input type="color" className="w-5 h-5 p-0 border-0 cursor-pointer ml-1" value={strokeColor} onChange={e => setStrokeColor(e.target.value)} title="Custom Color" />
             </div>
             <div className="w-px h-6 bg-border mx-2" />
             <div className="flex items-center gap-2 w-32">
                <span className="text-xs text-muted-foreground">Size:</span>
                <input 
                  type="range" 
                  min="5" 
                  max="80" 
                  value={strokeWidth} 
                  onChange={e => setStrokeWidth(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-brand-orange" 
                />
             </div>
          </div>
        )}

        {isShapeSelected && (
          <div className="flex items-center gap-4 py-1">
             <span className="text-muted-foreground text-xs font-medium">{isWhiteout ? 'Erase Area Options:' : 'Shape Options:'}</span>
             <div className="w-px h-6 bg-border" />
             <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground mr-1">Fill Color:</span>
                {['#FFFFFF', '#000000', 'transparent'].map(c => (
                  <button 
                    key={c} 
                    className={`size-5 rounded-full border ${fillColor === c ? 'border-brand-orange scale-110 shadow-sm' : 'border-border hover:scale-110'} transition-transform relative`} 
                    style={{ backgroundColor: c === 'transparent' ? '#fff' : c }} 
                    onClick={() => { setFillColor(c); updateProp('fill', c) }} 
                    title={c === '#FFFFFF' ? 'White' : c === '#000000' ? 'Black' : 'Transparent'}
                  >
                    {c === 'transparent' && <div className="absolute inset-0 flex items-center justify-center text-[10px] text-red-500 font-bold">/</div>}
                  </button>
                ))}
                <input type="color" className="w-5 h-5 p-0 border-0 cursor-pointer ml-1 rounded overflow-hidden" value={(!fillColor || fillColor === 'transparent') ? '#FFFFFF' : fillColor} onChange={e => { setFillColor(e.target.value); updateProp('fill', e.target.value) }} title="Custom Color / Eye Dropper" />
             </div>
             {!isWhiteout && (
               <>
                 <div className="w-px h-6 bg-border mx-2" />
                 <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Border:</span>
                    <input type="color" className="w-5 h-5 p-0 border-0 cursor-pointer rounded overflow-hidden" value={strokeColor} onChange={e => { setStrokeColor(e.target.value); updateProp('stroke', e.target.value) }} />
                 </div>
               </>
             )}
          </div>
        )}

        {activeTool === 'select' && !isTextSelected && !isShapeSelected && !activeObject && (
          <span className="text-muted-foreground text-xs py-1">Click any text to edit it. Select objects and press <kbd className="px-1 py-0.5 bg-muted border border-border rounded text-[10px]">Delete</kbd> to remove.</span>
        )}
      </div>

      {isSignModalOpen && (
        <SignModal 
          onClose={() => setIsSignModalOpen(false)} 
          onAddSignature={(dataUrl) => {
             setIsSignModalOpen(false)
             window.dispatchEvent(new CustomEvent('pdf-editor:insert-signature', { detail: { dataUrl } }))
          }} 
        />
      )}
    </div>
  )
}

function ToolBtn({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick} 
      className={`h-9 px-3 rounded-lg flex items-center gap-1.5 text-[13px] font-medium shrink-0 transition-all duration-200 ${
        active 
          ? 'bg-brand-orange text-white shadow-md shadow-brand-orange/20 scale-105' 
          : 'hover:bg-muted text-foreground/80 hover:text-foreground'
      }`}
    >
      {icon} {label}
    </button>
  )
}
