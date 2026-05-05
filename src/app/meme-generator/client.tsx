'use client'
import React, { useState, useRef, useEffect } from 'react'

export default function MemeClient() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [topText, setTopText] = useState('TOP TEXT')
  const [bottomText, setBottomText] = useState('BOTTOM TEXT')
  const [fontSize, setFontSize] = useState(48)
  const [textColor, setTextColor] = useState('#FFFFFF')
  const [strokeColor, setStrokeColor] = useState('#000000')
  const [fontFamily, setFontFamily] = useState('Impact')

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setImageSrc(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  useEffect(() => {
    if (!imageSrc || !canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')!
    const img = new Image()
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)

      // Text settings
      const fs = fontSize * (img.width / 600)
      ctx.font = `bold ${fs}px ${fontFamily}, Arial, sans-serif`
      ctx.textAlign = 'center'
      ctx.fillStyle = textColor
      ctx.strokeStyle = strokeColor
      ctx.lineWidth = fs / 12
      ctx.lineJoin = 'round'

      // Top text
      if (topText) {
        ctx.strokeText(topText.toUpperCase(), img.width / 2, fs + 10)
        ctx.fillText(topText.toUpperCase(), img.width / 2, fs + 10)
      }

      // Bottom text
      if (bottomText) {
        ctx.strokeText(bottomText.toUpperCase(), img.width / 2, img.height - 20)
        ctx.fillText(bottomText.toUpperCase(), img.width / 2, img.height - 20)
      }
    }
    img.src = imageSrc
  }, [imageSrc, topText, bottomText, fontSize, textColor, strokeColor, fontFamily])

  const download = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const a = document.createElement('a')
    a.download = 'meme-toolhive.png'
    a.href = canvas.toDataURL('image/png')
    a.click()
  }

  return (
    <div className="grid lg:grid-cols-12 gap-8">
      {/* Preview */}
      <div className="lg:col-span-7">
        <div className="bg-card border border-border rounded-[2.5rem] shadow-sm overflow-hidden">
          {!imageSrc ? (
            <div className="flex flex-col items-center justify-center p-16 text-center">
              <button onClick={() => fileRef.current?.click()} className="px-10 py-6 bg-brand-orange/10 hover:bg-brand-orange hover:text-white text-brand-orange border-2 border-dashed border-brand-orange/30 rounded-3xl font-bold transition-all text-lg">
                📤 Upload Image
              </button>
              <p className="mt-4 text-sm text-muted-foreground">Upload any image to start creating your meme</p>
            </div>
          ) : (
            <div className="p-4">
              <canvas ref={canvasRef} className="w-full rounded-2xl" />
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
        </div>
      </div>

      {/* Controls */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-card border border-border p-6 rounded-[2rem] shadow-sm space-y-5">
          <h3 className="font-bold font-syne text-lg">Meme Text</h3>
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Top Text</label>
            <input type="text" value={topText} onChange={(e) => setTopText(e.target.value)} placeholder="Top text..."
              className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 font-bold focus:outline-none focus:ring-2 focus:ring-brand-orange/50" />
          </div>
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Bottom Text</label>
            <input type="text" value={bottomText} onChange={(e) => setBottomText(e.target.value)} placeholder="Bottom text..."
              className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 font-bold focus:outline-none focus:ring-2 focus:ring-brand-orange/50" />
          </div>
        </div>

        <div className="bg-card border border-border p-6 rounded-[2rem] shadow-sm space-y-5">
          <h3 className="font-bold font-syne text-lg">Customize</h3>
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Font Size: {fontSize}px</label>
            <input type="range" min={20} max={100} value={fontSize} onChange={(e) => setFontSize(parseInt(e.target.value))} className="w-full accent-brand-orange" />
          </div>
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Font</label>
            <select value={fontFamily} onChange={(e) => setFontFamily(e.target.value)} className="w-full bg-muted/30 border border-border rounded-xl px-3 py-2.5 text-sm">
              <option value="Impact">Impact (Classic)</option>
              <option value="Arial Black">Arial Black</option>
              <option value="Comic Sans MS">Comic Sans</option>
              <option value="Georgia">Georgia</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Text Color</label>
              <div className="flex gap-2 items-center">
                <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="w-10 h-10 rounded-lg border border-border cursor-pointer" />
                <span className="font-mono text-sm">{textColor}</span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Outline</label>
              <div className="flex gap-2 items-center">
                <input type="color" value={strokeColor} onChange={(e) => setStrokeColor(e.target.value)} className="w-10 h-10 rounded-lg border border-border cursor-pointer" />
                <span className="font-mono text-sm">{strokeColor}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={download} disabled={!imageSrc} className="flex-1 py-4 bg-brand-orange hover:bg-brand-orange-hover text-white font-bold rounded-2xl transition-all shadow-md shadow-brand-orange/20 text-lg disabled:opacity-50">
            📥 Download Meme
          </button>
          <button onClick={() => fileRef.current?.click()} className="py-4 px-5 bg-muted border border-border rounded-2xl font-bold transition-all hover:bg-muted/80">🔄</button>
        </div>
      </div>
    </div>
  )
}
