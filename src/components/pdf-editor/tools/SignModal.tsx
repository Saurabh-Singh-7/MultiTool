"use client"

import React, { useState, useRef, useEffect } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { fabric } from 'fabric'

interface SignModalProps {
  onClose: () => void
  onAddSignature: (dataUrl: string) => void
}

export function SignModal({ onClose, onAddSignature }: SignModalProps) {
  const [activeTab, setActiveTab] = useState<'type' | 'draw' | 'upload'>('type')
  
  // Type state
  const [typedName, setTypedName] = useState('Your Name')
  const [selectedFont, setSelectedFont] = useState('Pacifico')
  const fonts = ['Pacifico', 'Dancing Script', 'Satisfy', 'Great Vibes', 'Caveat', 'Kalam']
  
  // Draw state
  const drawCanvasRef = useRef<HTMLCanvasElement>(null)
  const fabricDrawCanvas = useRef<fabric.Canvas | null>(null)
  const [drawColor, setDrawColor] = useState('#000000')

  // Load Google Fonts
  useEffect(() => {
    const link = document.createElement('link')
    link.href = `https://fonts.googleapis.com/css2?${fonts.map(f => `family=${f.replace(' ', '+')}`).join('&')}&display=swap`
    link.rel = 'stylesheet'
    document.head.appendChild(link)
    return () => { document.head.removeChild(link) }
  }, [])

  // Init Draw Canvas
  useEffect(() => {
    if (activeTab === 'draw' && drawCanvasRef.current && !fabricDrawCanvas.current) {
      const f = require('fabric').fabric
      const canvas = new f.Canvas(drawCanvasRef.current, {
        isDrawingMode: true,
        backgroundColor: '#f9fafb',
        width: 400,
        height: 200
      })
      canvas.freeDrawingBrush.color = drawColor
      canvas.freeDrawingBrush.width = 3
      fabricDrawCanvas.current = canvas
    }
    return () => {
      if (activeTab !== 'draw' && fabricDrawCanvas.current) {
        fabricDrawCanvas.current.dispose()
        fabricDrawCanvas.current = null
      }
    }
  }, [activeTab])

  useEffect(() => {
    if (fabricDrawCanvas.current) {
      fabricDrawCanvas.current.freeDrawingBrush.color = drawColor
    }
  }, [drawColor])

  const handleTypeSave = () => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    canvas.width = 400
    canvas.height = 150
    ctx.font = `60px "${selectedFont}"`
    ctx.fillStyle = drawColor
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(typedName, 200, 75)
    onAddSignature(canvas.toDataURL('image/png'))
  }

  const handleDrawSave = () => {
    if (fabricDrawCanvas.current) {
      // Crop to content
      const objects = fabricDrawCanvas.current.getObjects()
      if (objects.length === 0) return
      
      const dataUrl = fabricDrawCanvas.current.toDataURL({
        format: 'png',
        multiplier: 1
      })
      onAddSignature(dataUrl)
    }
  }

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (evt) => {
        const dataUrl = evt.target?.result as string
        // Basic transparency could be done here with canvas manipulation
        onAddSignature(dataUrl)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-lg rounded-2xl shadow-xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-bold text-lg">Create Signature</h3>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="size-5" /></Button>
        </div>
        
        <div className="flex border-b border-border">
          <button className={`flex-1 py-3 text-sm font-bold ${activeTab==='type' ? 'border-b-2 border-brand-orange text-brand-orange' : 'text-muted-foreground'}`} onClick={()=>setActiveTab('type')}>Type</button>
          <button className={`flex-1 py-3 text-sm font-bold ${activeTab==='draw' ? 'border-b-2 border-brand-orange text-brand-orange' : 'text-muted-foreground'}`} onClick={()=>setActiveTab('draw')}>Draw</button>
          <button className={`flex-1 py-3 text-sm font-bold ${activeTab==='upload' ? 'border-b-2 border-brand-orange text-brand-orange' : 'text-muted-foreground'}`} onClick={()=>setActiveTab('upload')}>Upload</button>
        </div>

        <div className="p-6">
          {activeTab === 'type' && (
            <div className="space-y-4">
              <Input value={typedName} onChange={e=>setTypedName(e.target.value)} placeholder="Your Name" className="text-center text-lg h-12" />
              <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto p-2">
                {fonts.map(f => (
                  <button 
                    key={f} 
                    className={`p-4 border rounded-xl text-2xl text-center hover:bg-muted ${selectedFont === f ? 'border-brand-orange bg-brand-orange/5' : 'border-border'}`}
                    style={{ fontFamily: f, color: drawColor }}
                    onClick={() => setSelectedFont(f)}
                  >
                    {typedName || 'Sign'}
                  </button>
                ))}
              </div>
              <div className="flex justify-between items-center pt-4">
                 <div className="flex gap-2">
                    <button className="w-8 h-8 rounded-full bg-black border-2 border-white ring-2 ring-transparent focus:ring-brand-orange" onClick={()=>setDrawColor('#000000')} />
                    <button className="w-8 h-8 rounded-full bg-blue-600 border-2 border-white ring-2 ring-transparent focus:ring-brand-orange" onClick={()=>setDrawColor('#2563eb')} />
                    <button className="w-8 h-8 rounded-full bg-red-600 border-2 border-white ring-2 ring-transparent focus:ring-brand-orange" onClick={()=>setDrawColor('#dc2626')} />
                 </div>
                 <Button onClick={handleTypeSave} className="bg-brand-orange text-white">Save Signature</Button>
              </div>
            </div>
          )}

          {activeTab === 'draw' && (
            <div className="space-y-4">
              <div className="border border-border rounded-xl overflow-hidden bg-[#f9fafb]">
                <canvas ref={drawCanvasRef} />
              </div>
              <div className="flex justify-between items-center pt-2">
                 <div className="flex gap-2">
                    <button className="w-8 h-8 rounded-full bg-black border-2 border-white ring-2 ring-transparent focus:ring-brand-orange" onClick={()=>setDrawColor('#000000')} />
                    <button className="w-8 h-8 rounded-full bg-blue-600 border-2 border-white ring-2 ring-transparent focus:ring-brand-orange" onClick={()=>setDrawColor('#2563eb')} />
                    <button className="w-8 h-8 rounded-full bg-red-600 border-2 border-white ring-2 ring-transparent focus:ring-brand-orange" onClick={()=>setDrawColor('#dc2626')} />
                 </div>
                 <div className="flex gap-2">
                   <Button variant="ghost" onClick={() => fabricDrawCanvas.current?.clear()}>Clear</Button>
                   <Button onClick={handleDrawSave} className="bg-brand-orange text-white">Save Signature</Button>
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'upload' && (
            <div className="text-center py-8">
              <label className="border-2 border-dashed border-brand-orange/50 rounded-xl p-8 cursor-pointer hover:bg-brand-orange/5 transition-colors inline-block w-full">
                <input type="file" accept="image/png, image/jpeg" className="hidden" onChange={handleUpload} />
                <span className="font-bold text-brand-orange">Click to upload signature</span>
                <p className="text-xs text-muted-foreground mt-2">PNG with transparent background recommended</p>
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
