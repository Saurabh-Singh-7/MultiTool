"use client"

import React, { useEffect, useRef, useState } from 'react'
import { usePDFEditor } from './PDFEditorContext'
import { ZoomIn, ZoomOut } from 'lucide-react'

let fabricLoaded = false
let fabric: any = null

export function CanvasArea() {
  const {
    appState, thumbnails, activePageId, pdfDoc,
    fabricCanvas, setFabricCanvas, zoom, setZoom,
    pageEditsRef, activeTool, setActiveTool, setActiveObject,
    fontFamily, fontSize, textColor, isBold, isItalic, isUnderline, textAlign,
    strokeColor, fillColor, strokeWidth, saveHistory, undo
  } = usePDFEditor()

  const activeThumbnail = thumbnails.find(t => t.id === activePageId)
  const currentPage = activeThumbnail?.pageNum || 1

  const containerRef = useRef<HTMLDivElement>(null)
  const canvasElRef = useRef<HTMLCanvasElement>(null)
  const prevPageRef = useRef(activePageId)
  const [canvasSize, setCanvasSize] = useState({ w: 800, h: 1100 })
  const drawState = useRef({ isDrawing: false, startX: 0, startY: 0, activeShape: null as any })

  useEffect(() => {
    if (typeof window !== 'undefined' && !fabricLoaded) {
      fabric = require('fabric').fabric
      fabricLoaded = true
    }
  }, [])

  // ─── Render page: extract text, erase from bg, place as editable objects ───
  useEffect(() => {
    if ((appState !== 'editor' && appState !== 'exporting') || !pdfDoc || !fabric || !activePageId) return
    if (appState === 'exporting') return // Don't re-render while exporting
    let cancelled = false

    const render = async () => {
      // Save previous page
      if (fabricCanvas && prevPageRef.current && prevPageRef.current !== activePageId) {
        pageEditsRef.current.set(prevPageRef.current, JSON.stringify(fabricCanvas.toJSON(['data'])))
      }
      prevPageRef.current = activePageId

      const page = await pdfDoc.getPage(currentPage)
      if (cancelled) return

      const scale = 1.5
      const viewport = page.getViewport({ scale })
      const w = Math.round(viewport.width)
      const h = Math.round(viewport.height)

      // Step 1: Render full PDF page
      const offscreen = document.createElement('canvas')
      offscreen.width = w
      offscreen.height = h
      const ctx = offscreen.getContext('2d')!
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, w, h)
      await page.render({ canvasContext: ctx, viewport }).promise
      if (cancelled) return

      // Step 2: Extract text content
      const textContent = await page.getTextContent()
      if (cancelled) return

      // Step 3: Parse text items with positions
      const textItems = parseTextItems(textContent.items, viewport, scale)

      // Step 4: ERASE original text from background by painting white over text areas
      textItems.forEach(item => {
        if (!item.text.trim()) return
        // Use generous padding to fully cover the original rendered text
        const px = 4  // horizontal padding
        const py = 3  // vertical padding
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(
          item.x - px,
          item.y - py,
          item.width + px * 2,
          item.height + py * 2
        )
      })

      const cleanBgUrl = offscreen.toDataURL('image/png')
      setCanvasSize({ w, h })

      // Step 5: Setup fabric canvas
      let fc = fabricCanvas
      if (!fc) {
        fc = new fabric.Canvas(canvasElRef.current, {
          width: w, height: h, selection: true, preserveObjectStacking: true,
        }) as any
        fc!.on('selection:created', (e: any) => setActiveObject(e.selected?.[0] || null))
        fc!.on('selection:updated', (e: any) => setActiveObject(e.selected?.[0] || null))
        fc!.on('selection:cleared', () => setActiveObject(null))
        fc!.on('object:modified', () => saveHistory())
        setFabricCanvas(fc)
      } else {
        fc.setWidth(w)
        fc.setHeight(h)
        fc.clear()
      }

      if (!fc) return

      // If user already edited this page, load their saved state
      const saved = pageEditsRef.current.get(activePageId)
      if (saved) {
        fc.loadFromJSON(JSON.parse(saved), () => fc!.renderAll())
        return
      }

      // Step 6: Set cleaned background (text erased, images/borders remain)
      fabric.Image.fromURL(cleanBgUrl, (bgImg: any) => {
        if (cancelled || !fc) return
        fc.setBackgroundImage(bgImg, () => {
          // Step 7: Place extracted text as editable objects (ONLY copy of text)
          textItems.forEach(item => {
            if (!item.text.trim()) return
            const webFont = mapFont(item.fontName)
            const fSize = Math.max(8, Math.round(item.fontSize * scale))

            const itext = new fabric.IText(item.text, {
              left: item.x,
              top: item.y,
              fontFamily: webFont,
              fontSize: fSize,
              fill: item.color,
              fontWeight: item.bold ? 'bold' : 'normal',
              fontStyle: item.italic ? 'italic' : 'normal',
              editable: true,
              selectable: true,
              cursorColor: '#F97316',
              cursorWidth: 2,
              borderColor: '#F97316',
              cornerColor: '#F97316',
              cornerSize: 6,
              transparentCorners: false,
              padding: 1,
              data: { type: 'pdf-text', original: item.text },
            })
            fc.add(itext)
          })

          fc.renderAll()
          saveHistory()
        }, {
          scaleX: w / bgImg.width,
          scaleY: h / bgImg.height,
          originX: 'left',
          originY: 'top',
        })
      })
    }

    render()
    return () => { cancelled = true }
  }, [activePageId, pdfDoc, appState])

  // ─── Keyboard shortcuts ───
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!fabricCanvas) return
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      const active = fabricCanvas.getActiveObject()
      if (active && (active as any).isEditing) return

      if (e.key === 'Delete' || e.key === 'Backspace') {
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
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); undo() }
      if (e.key === 'Escape') {
        setActiveTool('select')
        fabricCanvas.discardActiveObject()
        fabricCanvas.isDrawingMode = false
        fabricCanvas.requestRenderAll()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [fabricCanvas, saveHistory, undo, setActiveTool])

  // ─── Tool handlers ───
  useEffect(() => {
    if (!fabricCanvas || !fabric) return
    fabricCanvas.isDrawingMode = false
    fabricCanvas.off('mouse:down')
    fabricCanvas.off('mouse:move')
    fabricCanvas.off('mouse:up')

    // In select mode, all objects are interactive
    const isInteractive = ['select', 'text', 'images', 'sign'].includes(activeTool)
    fabricCanvas.selection = isInteractive
    fabricCanvas.forEachObject((obj: any) => {
      obj.selectable = isInteractive
      obj.evented = isInteractive
    })
    const isCrosshair = activeTool.startsWith('shape') || ['whiteout', 'links', 'annotate'].includes(activeTool)
    fabricCanvas.defaultCursor = isCrosshair ? 'crosshair' : (activeTool === 'text' ? 'text' : 'default')
    fabricCanvas.hoverCursor = isInteractive ? 'pointer' : fabricCanvas.defaultCursor

    if (activeTool === 'text') {
      fabricCanvas.on('mouse:down', (opt: any) => {
        if (opt.target) return
        const p = fabricCanvas.getPointer(opt.e)
        const t = new fabric.IText('Type here', {
          left: p.x, top: p.y, fontFamily, fontSize, fill: textColor,
          fontWeight: isBold ? 'bold' : 'normal', fontStyle: isItalic ? 'italic' : 'normal',
          underline: isUnderline, textAlign, editable: true,
          cursorColor: '#F97316', cursorWidth: 2, borderColor: '#F97316',
          cornerColor: '#F97316', cornerSize: 7, transparentCorners: false,
          data: { type: 'new-text' },
        })
        fabricCanvas.add(t)
        fabricCanvas.setActiveObject(t)
        t.enterEditing()
        t.selectAll()
        fabricCanvas.renderAll()
        saveHistory()
      })
    } else if (activeTool === 'shape-rect' || activeTool === 'whiteout' || activeTool === 'links') {
      const isWhiteout = activeTool === 'whiteout'
      const isLink = activeTool === 'links'
      const actualFill = isWhiteout ? ((!fillColor || fillColor === 'transparent') ? '#FFFFFF' : fillColor) : (isLink ? 'rgba(0,100,255,0.15)' : fillColor)
      const actualStroke = isWhiteout ? undefined : (isLink ? 'rgba(0,100,255,0.5)' : strokeColor)
      const actualStrokeW = isWhiteout ? 0 : (isLink ? 1 : strokeWidth)
      
      setupDrag(fabricCanvas, drawState, 
        (p: any) => new fabric.Rect({ left: p.x, top: p.y, width: 0, height: 0, fill: actualFill, stroke: actualStroke, strokeWidth: actualStrokeW, selectable: false, borderColor: '#F97316', cornerColor: '#F97316', data: { type: isWhiteout ? 'whiteout' : (isLink ? 'link' : 'shape') } }), 
        (shape: any, sP: any, cP: any) => shape.set({ width: Math.abs(cP.x - sP.x), height: Math.abs(cP.y - sP.y), left: Math.min(cP.x, sP.x), top: Math.min(cP.y, sP.y) }),
        saveHistory, setActiveTool
      )
    } else if (activeTool === 'shape-circle') {
      setupDrag(fabricCanvas, drawState, 
        (p: any) => new fabric.Circle({ left: p.x, top: p.y, radius: 0, fill: fillColor, stroke: strokeColor, strokeWidth, selectable: false, borderColor: '#F97316', cornerColor: '#F97316' }), 
        (shape: any, sP: any, cP: any) => { const r = Math.max(Math.abs(cP.x - sP.x), Math.abs(cP.y - sP.y)) / 2; shape.set({ radius: r, left: sP.x > cP.x ? sP.x - r*2 : sP.x, top: sP.y > cP.y ? sP.y - r*2 : sP.y }) },
        saveHistory, setActiveTool
      )
    } else if (activeTool === 'shape-line') {
      setupDrag(fabricCanvas, drawState, 
        (p: any) => new fabric.Line([p.x, p.y, p.x, p.y], { stroke: strokeColor, strokeWidth, selectable: false, borderColor: '#F97316', cornerColor: '#F97316' }), 
        (shape: any, sP: any, cP: any) => shape.set({ x2: cP.x, y2: cP.y }),
        saveHistory, setActiveTool
      )
    } else if (activeTool === 'shape-arrow') {
      setupDrag(fabricCanvas, drawState, 
        (p: any) => new fabric.Path(`M ${p.x} ${p.y} L ${p.x} ${p.y}`, { fill: '', stroke: strokeColor, strokeWidth, selectable: false, borderColor: '#F97316', cornerColor: '#F97316', strokeLineCap: 'round', strokeLineJoin: 'round' }), 
        (shape: any, sP: any, cP: any) => {
          const dx = cP.x - sP.x, dy = cP.y - sP.y;
          const angle = Math.atan2(dy, dx);
          const headlen = 15 + strokeWidth;
          const path = [
             ['M', sP.x, sP.y],
             ['L', cP.x, cP.y],
             ['M', cP.x - headlen * Math.cos(angle - Math.PI / 6), cP.y - headlen * Math.sin(angle - Math.PI / 6)],
             ['L', cP.x, cP.y],
             ['L', cP.x - headlen * Math.cos(angle + Math.PI / 6), cP.y - headlen * Math.sin(angle + Math.PI / 6)]
          ];
          shape.initialize(path, { fill: '', stroke: strokeColor, strokeWidth, selectable: false, borderColor: '#F97316', cornerColor: '#F97316', strokeLineCap: 'round', strokeLineJoin: 'round' })
        },
        saveHistory, setActiveTool
      )
    } else if (activeTool === 'annotate') {
      fabricCanvas.isDrawingMode = true
      fabricCanvas.freeDrawingBrush = new fabric.PencilBrush(fabricCanvas)
      let r = 255, g = 235, b = 0
      if (strokeColor.startsWith('#') && strokeColor.length === 7) {
        r = parseInt(strokeColor.slice(1, 3), 16)
        g = parseInt(strokeColor.slice(3, 5), 16)
        b = parseInt(strokeColor.slice(5, 7), 16)
      }
      fabricCanvas.freeDrawingBrush.color = `rgba(${r},${g},${b},0.4)`
      fabricCanvas.freeDrawingBrush.width = strokeWidth * 2

      // Create a custom cursor showing the brush size
      const brushSize = Math.max(4, strokeWidth * 2 * zoom)
      const cursorSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${brushSize}" height="${brushSize}" viewBox="0 0 ${brushSize} ${brushSize}"><circle cx="${brushSize / 2}" cy="${brushSize / 2}" r="${brushSize / 2 - 1}" fill="rgba(${r},${g},${b},0.3)" stroke="rgba(0,0,0,0.5)" stroke-width="1"/></svg>`
      fabricCanvas.freeDrawingCursor = `url('data:image/svg+xml;base64,${btoa(cursorSvg)}') ${brushSize / 2} ${brushSize / 2}, crosshair`

      const onPathCreated = (e: any) => {
        // Set multiply blend mode so it highlights instead of covers
        e.path.set({ globalCompositeOperation: 'multiply' })
        fabricCanvas.renderAll()
        saveHistory()
      }
      fabricCanvas.on('path:created', onPathCreated)
      return () => { fabricCanvas.off('path:created', onPathCreated) }
    }
  }, [activeTool, fabricCanvas, fontFamily, fontSize, textColor, isBold, isItalic, isUnderline, textAlign, strokeColor, fillColor, strokeWidth, saveHistory, setActiveTool])

  // ─── Image & signature insert ───
  useEffect(() => {
    const handler = (e: any) => {
      if (!fabricCanvas || !fabric) return
      const file = e.detail?.file
      const dataUrl = e.detail?.dataUrl
      
      const insertImage = (src: string) => {
        fabric.Image.fromURL(src, (img: any) => {
          if (!img) return
          const max = fabricCanvas.width! * (file ? 0.5 : 0.3)
          if (img.width > max) img.scaleToWidth(max)
          img.set({ left: fabricCanvas.width! / 2 - img.getScaledWidth() / 2, top: fabricCanvas.height! / 2 - img.getScaledHeight() / 2, borderColor: '#F97316', cornerColor: '#F97316', cornerSize: 8 })
          fabricCanvas.add(img)
          fabricCanvas.setActiveObject(img)
          fabricCanvas.renderAll()
          saveHistory()
          setActiveTool('select') // Switch back to select mode so user can move it!
        })
      }

      if (file) {
        const reader = new FileReader()
        reader.onload = (ev) => {
          if (ev.target?.result) insertImage(ev.target.result as string)
        }
        reader.readAsDataURL(file)
      } else if (dataUrl) {
        insertImage(dataUrl)
      }
    }
    window.addEventListener('pdf-editor:insert-image', handler)
    window.addEventListener('pdf-editor:insert-signature', handler)
    return () => { window.removeEventListener('pdf-editor:insert-image', handler); window.removeEventListener('pdf-editor:insert-signature', handler) }
  }, [fabricCanvas, saveHistory, setActiveTool])

  // ─── Keyboard Copy / Paste ───
  useEffect(() => {
    if (!fabricCanvas) return
    let clipboard: any = null

    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return
      const activeObj = fabricCanvas.getActiveObject()
      if (activeObj && (activeObj as any).isEditing) return

      if (e.key === 'c' && (e.ctrlKey || e.metaKey)) {
        if (activeObj) {
          activeObj.clone((cloned: any) => { clipboard = cloned })
        }
      } else if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
        if (!clipboard) return
        clipboard.clone((clonedObj: any) => {
          fabricCanvas.discardActiveObject()
          clonedObj.set({
            left: clonedObj.left + 10,
            top: clonedObj.top + 10,
            evented: true,
          })
          if (clonedObj.type === 'activeSelection') {
            clonedObj.canvas = fabricCanvas
            clonedObj.forEachObject((obj: any) => fabricCanvas.add(obj))
            clonedObj.setCoords()
          } else {
            fabricCanvas.add(clonedObj)
          }
          clipboard.top += 10
          clipboard.left += 10
          fabricCanvas.setActiveObject(clonedObj)
          fabricCanvas.renderAll()
          saveHistory()
        })
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [fabricCanvas, saveHistory])

  if (appState !== 'editor' && appState !== 'exporting') return null
  return (
    <div className="flex-1 overflow-auto relative flex flex-col bg-zinc-100 dark:bg-[#1e1e1e]" ref={containerRef}>
      {/* Figma-like dot pattern background */}
      <div className="absolute inset-0 z-0 opacity-[0.4] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#9ca3af 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

      <div className="sticky top-5 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur-xl border border-border/50 rounded-full shadow-xl shadow-black/5 px-5 py-2.5 flex items-center gap-4 z-10 text-xs font-medium w-fit mx-auto transition-all hover:bg-background/95">
        <span className="font-bold text-muted-foreground tracking-wide">PAGE {currentPage} / {thumbnails.length}</span>
        <div className="w-px h-4 bg-border/80" />
        <div className="flex items-center gap-1.5">
          <button onClick={() => setZoom(Math.max(0.5, zoom - 0.25))} className="p-1.5 hover:bg-muted rounded-full transition-colors text-foreground/70 hover:text-foreground"><ZoomOut className="size-4" /></button>
          <span className="w-12 text-center font-bold tabular-nums">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom(Math.min(3, zoom + 0.25))} className="p-1.5 hover:bg-muted rounded-full transition-colors text-foreground/70 hover:text-foreground"><ZoomIn className="size-4" /></button>
        </div>
      </div>

      <div className="flex-1 flex items-start justify-center p-8 pt-6 z-0">
        <div className="shadow-2xl shadow-black/20 transition-transform duration-200 ease-out rounded-sm overflow-hidden ring-1 ring-border/20" style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}>
          <canvas ref={canvasElRef} />
        </div>
      </div>
    </div>
  )
}

// ─── Parse PDF text items into paragraphs for better editing ───
function parseTextItems(items: any[], viewport: any, scale: number) {
  const vt = viewport.transform
  const raw: any[] = []

  for (const item of items) {
    if (!item.str || item.str.trim() === '') {
      // Keep track of spaces if they exist, but usually they are just empty strings
      if (item.str === ' ') {
        // We handle spacing using coordinates below, but keep this just in case
      }
      continue
    }
    const t = item.transform
    const pdfFontSize = Math.abs(t[3])
    const pdfX = t[4]
    const pdfY = t[5]

    const canvasX = vt[0] * pdfX + vt[2] * pdfY + vt[4]
    const canvasY = vt[1] * pdfX + vt[3] * pdfY + vt[5]

    const fontH = pdfFontSize * scale
    const y = canvasY - fontH * 0.85
    const w = (item.width || 0) * scale

    raw.push({
      text: item.str,
      x: canvasX,
      y: y,
      width: Math.max(w, 2),
      height: fontH * 1.15,
      fontSize: pdfFontSize,
      fontName: item.fontName || '',
      bold: (item.fontName || '').includes('Bold'),
      italic: (item.fontName || '').includes('Italic'),
      color: '#000000',
    })
  }

  // 1. Sort primarily by Y, then by X
  const sorted = raw.sort((a, b) => {
    if (Math.abs(a.y - b.y) < a.fontSize * 0.5) return a.x - b.x
    return a.y - b.y
  })

  // 2. Merge into lines (with spaces)
  const lines: any[] = []
  for (const item of sorted) {
    const last = lines[lines.length - 1]
    const gap = last ? (item.x - (last.x + last.width)) : 0

    // Merge if same line, same font, and horizontal gap is very small (not a different column)
    if (last &&
      Math.abs(last.y - item.y) < last.fontSize * 0.5 &&
      Math.abs(last.fontSize - item.fontSize) < 2 &&
      gap < last.fontSize * scale * 0.5 // Strict threshold: > 0.5 means a different column/tab
    ) {
      // If gap is more than 15% of font size, consider it a space
      const isSpace = gap > (last.fontSize * scale * 0.15)
      last.text += (isSpace ? ' ' : '') + item.text
      last.width = (item.x + item.width) - last.x
    } else {
      lines.push({ ...item })
    }
  }

  // 3. Merge lines into paragraphs
  const paragraphs: any[] = []
  for (const line of lines) {
    let merged = false

    // Look backwards to find the correct paragraph (handles side-by-side columns)
    for (let i = paragraphs.length - 1; i >= Math.max(0, paragraphs.length - 15); i--) {
      const prev = paragraphs[i]

      // A paragraph continues if:
      // - Y distance is roughly 1-1.5 times the font size (line height)
      // - X distance (left alignment or center alignment) is very close
      // - Font properties match
      const isXAligned = Math.abs(prev.x - line.x) < prev.fontSize * scale * 0.5
      const isCenterAligned = Math.abs((prev.x + prev.width / 2) - (line.x + line.width / 2)) < prev.fontSize * scale * 0.5

      if (
        Math.abs((line.y - prev.y) - (prev.fontSize * scale * 1.2)) < prev.fontSize * scale * 0.6 &&
        (isXAligned || isCenterAligned) &&
        Math.abs(prev.fontSize - line.fontSize) < 2 &&
        prev.bold === line.bold &&
        prev.italic === line.italic
      ) {
        prev.text += '\n' + line.text
        prev.width = Math.max(prev.width, line.width)
        prev.height = (line.y + line.height) - prev.y
        merged = true
        break
      }
    }

    if (!merged) {
      paragraphs.push({ ...line })
    }
  }

  return paragraphs
}

function mapFont(name: string): string {
  const fallback = 'system-ui, -apple-system, "Segoe UI", Roboto, "Noto Sans", "Noto Sans Devanagari", "Helvetica Neue", sans-serif'
  if (!name) return fallback
  const n = name.toLowerCase()
  if (n.includes('arial')) return `Arial, ${fallback}`
  if (n.includes('helvetica')) return `Helvetica, ${fallback}`
  if (n.includes('times')) return `Times New Roman, serif`
  if (n.includes('courier')) return `Courier New, monospace`
  if (n.includes('georgia')) return `Georgia, serif`
  if (n.includes('calibri')) return `Calibri, ${fallback}`
  if (n.includes('sans')) return fallback
  if (n.includes('serif')) return 'Times New Roman, serif'
  if (n.includes('mono')) return 'Courier New, monospace'
  return fallback
}

function setupDrag(
  fc: any, ds: any, 
  create: (p: any) => any, 
  update: (shape: any, startP: any, currentP: any) => void, 
  save: () => void, 
  setTool: (t: any) => void
) {
  fc.on('mouse:down', (o: any) => { 
     ds.current.isDrawing = true; 
     const p = fc.getPointer(o.e); 
     ds.current.startX = p.x; 
     ds.current.startY = p.y; 
     ds.current.activeShape = create(p); 
     fc.add(ds.current.activeShape);
  })
  fc.on('mouse:move', (o: any) => { 
     if (!ds.current.isDrawing || !ds.current.activeShape) return; 
     const p = fc.getPointer(o.e); 
     update(ds.current.activeShape, {x: ds.current.startX, y: ds.current.startY}, p); 
     fc.renderAll();
  })
  fc.on('mouse:up', () => { 
     ds.current.isDrawing = false; 
     if (ds.current.activeShape) { 
        ds.current.activeShape.set({ selectable: true, evented: true }); 
        ds.current.activeShape.setCoords();
        fc.setActiveObject(ds.current.activeShape); 
        fc.renderAll(); 
        save();
     } 
     ds.current.activeShape = null; 
     setTool('select');
  })
}
