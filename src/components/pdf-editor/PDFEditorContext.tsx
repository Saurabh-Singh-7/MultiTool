"use client"

import React, { createContext, useContext, useState, useRef, ReactNode } from 'react'
import { AppState, EditorTool, PageThumbnail } from './types'
import type { fabric } from 'fabric'

interface PDFEditorContextType {
  appState: AppState
  setAppState: (s: AppState) => void
  file: File | null
  setFile: (f: File | null) => void
  originalPdfBuffer: ArrayBuffer | null
  setOriginalPdfBuffer: (b: ArrayBuffer | null) => void
  pdfDoc: any
  setPdfDoc: (d: any) => void
  thumbnails: PageThumbnail[]
  setThumbnails: (t: PageThumbnail[]) => void
  activePageId: string
  setActivePageId: (p: string) => void
  fabricCanvas: fabric.Canvas | null
  setFabricCanvas: (c: fabric.Canvas | null) => void
  
  activeTool: EditorTool
  setActiveTool: (t: EditorTool) => void
  activeObject: fabric.Object | null
  setActiveObject: (o: fabric.Object | null) => void
  zoom: number
  setZoom: (z: number) => void
  
  pageEditsRef: React.MutableRefObject<Map<string, string>>
  undoHistoryRef: React.MutableRefObject<Map<string, string[]>>
  redoHistoryRef: React.MutableRefObject<Map<string, string[]>>
  
  // Text Tool State
  fontFamily: string
  setFontFamily: (f: string) => void
  fontSize: number
  setFontSize: (s: number) => void
  textColor: string
  setTextColor: (c: string) => void
  isBold: boolean
  setIsBold: (b: boolean) => void
  isItalic: boolean
  setIsItalic: (i: boolean) => void
  isUnderline: boolean
  setIsUnderline: (u: boolean) => void
  textAlign: string
  setTextAlign: (a: string) => void
  
  // Shape/Annotate State
  strokeColor: string
  setStrokeColor: (c: string) => void
  fillColor: string
  setFillColor: (c: string) => void
  strokeWidth: number
  setStrokeWidth: (w: number) => void
  
  // Global Actions
  saveHistory: () => void
  undo: () => void
  redo: () => void
  canUndo: boolean
  canRedo: boolean
}

const PDFEditorContext = createContext<PDFEditorContextType | null>(null)

export const usePDFEditor = () => {
  const ctx = useContext(PDFEditorContext)
  if (!ctx) throw new Error("usePDFEditor must be used within PDFEditorProvider")
  return ctx
}

export const PDFEditorProvider = ({ children }: { children: ReactNode }) => {
  const [appState, setAppState] = useState<AppState>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [originalPdfBuffer, setOriginalPdfBuffer] = useState<ArrayBuffer | null>(null)
  const [pdfDoc, setPdfDoc] = useState<any>(null)
  const [thumbnails, setThumbnails] = useState<PageThumbnail[]>([])
  const [activePageId, setActivePageId] = useState<string>('')
  const [fabricCanvas, setFabricCanvas] = useState<fabric.Canvas | null>(null)
  
  const [activeTool, setActiveTool] = useState<EditorTool>('select')
  const [activeObject, setActiveObject] = useState<fabric.Object | null>(null)
  const [zoom, setZoom] = useState(1)
  
  const pageEditsRef = useRef(new Map<string, string>())
  const undoHistoryRef = useRef(new Map<string, string[]>())
  const redoHistoryRef = useRef(new Map<string, string[]>())
  
  // Render triggers for history buttons
  const [historyTick, setHistoryTick] = useState(0)
  
  const [fontFamily, setFontFamily] = useState('Helvetica')
  const [fontSize, setFontSize] = useState(16)
  const [textColor, setTextColor] = useState('#000000')
  const [isBold, setIsBold] = useState(false)
  const [isItalic, setIsItalic] = useState(false)
  const [isUnderline, setIsUnderline] = useState(false)
  const [textAlign, setTextAlign] = useState('left')
  
  const [strokeColor, setStrokeColor] = useState('#000000')
  const [fillColor, setFillColor] = useState('transparent')
  const [strokeWidth, setStrokeWidth] = useState(2)

  const isHistoryUpdateRef = useRef(false)

  const saveHistory = () => {
    if (!fabricCanvas || isHistoryUpdateRef.current || !activePageId) return
    const json = fabricCanvas.toJSON()
    
    // Save to current page history
    const pageHistory = undoHistoryRef.current.get(activePageId) || []
    pageHistory.push(JSON.stringify(json))
    if (pageHistory.length > 30) pageHistory.shift() // Max 30 steps
    undoHistoryRef.current.set(activePageId, pageHistory)
    
    // Clear redo history
    redoHistoryRef.current.set(activePageId, [])
    
    // Also save to pageEdits map for switching pages
    pageEditsRef.current.set(activePageId, JSON.stringify(json))
    
    setHistoryTick(t => t + 1)
  }

  const undo = () => {
    if (!fabricCanvas || !activePageId) return
    const pageHistory = undoHistoryRef.current.get(activePageId) || []
    if (pageHistory.length < 2) return
    
    isHistoryUpdateRef.current = true
    
    // Current state
    const currentStr = pageHistory.pop()!
    const previousStr = pageHistory[pageHistory.length - 1]
    
    // Push current to redo
    const redos = redoHistoryRef.current.get(activePageId) || []
    redos.push(currentStr)
    redoHistoryRef.current.set(activePageId, redos)
    
    undoHistoryRef.current.set(activePageId, pageHistory)
    
    fabricCanvas.loadFromJSON(JSON.parse(previousStr), () => {
      fabricCanvas.renderAll()
      pageEditsRef.current.set(activePageId, previousStr)
      isHistoryUpdateRef.current = false
      setHistoryTick(t => t + 1)
    })
  }

  const redo = () => {
    if (!fabricCanvas || !activePageId) return
    const redos = redoHistoryRef.current.get(activePageId) || []
    if (redos.length === 0) return
    
    isHistoryUpdateRef.current = true
    const stateStr = redos.pop()!
    redoHistoryRef.current.set(activePageId, redos)
    
    const pageHistory = undoHistoryRef.current.get(activePageId) || []
    pageHistory.push(stateStr)
    undoHistoryRef.current.set(activePageId, pageHistory)
    
    fabricCanvas.loadFromJSON(JSON.parse(stateStr), () => {
      fabricCanvas.renderAll()
      pageEditsRef.current.set(activePageId, stateStr)
      isHistoryUpdateRef.current = false
      setHistoryTick(t => t + 1)
    })
  }

  const canUndo = (undoHistoryRef.current.get(activePageId)?.length || 0) > 1
  const canRedo = (redoHistoryRef.current.get(activePageId)?.length || 0) > 0

  return (
    <PDFEditorContext.Provider value={{
      appState, setAppState, file, setFile, originalPdfBuffer, setOriginalPdfBuffer,
      pdfDoc, setPdfDoc, thumbnails, setThumbnails, activePageId, setActivePageId,
      fabricCanvas, setFabricCanvas, activeTool, setActiveTool, activeObject, setActiveObject,
      zoom, setZoom, pageEditsRef, undoHistoryRef, redoHistoryRef,
      fontFamily, setFontFamily, fontSize, setFontSize, textColor, setTextColor,
      isBold, setIsBold, isItalic, setIsItalic, isUnderline, setIsUnderline, textAlign, setTextAlign,
      strokeColor, setStrokeColor, fillColor, setFillColor, strokeWidth, setStrokeWidth,
      saveHistory, undo, redo, canUndo, canRedo
    }}>
      {children}
    </PDFEditorContext.Provider>
  )
}
