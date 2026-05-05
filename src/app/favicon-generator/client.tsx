'use client'
import React, { useState, useRef } from 'react'

const SIZES = [
  { size: 16, label: '16×16', use: 'Browser tab' },
  { size: 32, label: '32×32', use: 'Browser tab (2x)' },
  { size: 48, label: '48×48', use: 'Windows taskbar' },
  { size: 64, label: '64×64', use: 'Windows site icon' },
  { size: 128, label: '128×128', use: 'Chrome Web Store' },
  { size: 180, label: '180×180', use: 'Apple Touch Icon' },
  { size: 192, label: '192×192', use: 'Android Chrome' },
  { size: 512, label: '512×512', use: 'PWA Splash Screen' },
]

export default function FaviconClient() {
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [generated, setGenerated] = useState<{ size: number; label: string; use: string; dataUrl: string }[]>([])
  const [bgColor, setBgColor] = useState('#FFFFFF')
  const [rounded, setRounded] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setImageSrc(ev.target?.result as string)
      setGenerated([])
    }
    reader.readAsDataURL(file)
  }

  const generate = () => {
    if (!imageSrc) return
    const img = new Image()
    img.onload = () => {
      const results = SIZES.map(({ size, label, use }) => {
        const canvas = document.createElement('canvas')
        canvas.width = size; canvas.height = size
        const ctx = canvas.getContext('2d')!
        ctx.fillStyle = bgColor
        if (rounded) {
          ctx.beginPath()
          ctx.roundRect(0, 0, size, size, size * 0.2)
          ctx.fill()
          ctx.clip()
        } else {
          ctx.fillRect(0, 0, size, size)
        }
        // Fit image centered
        const scale = Math.min(size / img.width, size / img.height)
        const w = img.width * scale, h = img.height * scale
        ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h)
        return { size, label, use, dataUrl: canvas.toDataURL('image/png') }
      })
      setGenerated(results)
    }
    img.src = imageSrc
  }

  const download = (dataUrl: string, filename: string) => {
    const a = document.createElement('a')
    a.download = filename; a.href = dataUrl; a.click()
  }

  const downloadAll = () => {
    generated.forEach(g => download(g.dataUrl, `favicon-${g.size}x${g.size}.png`))
  }

  const getHtmlCode = () => {
    return `<!-- Favicon -->\n<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">\n<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">\n<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">\n<link rel="manifest" href="/site.webmanifest">`
  }

  return (
    <div className="space-y-8">
      {/* Upload */}
      <div className="bg-card border border-border p-8 rounded-[2.5rem] shadow-sm text-center">
        {!imageSrc ? (
          <div>
            <button onClick={() => fileRef.current?.click()} className="px-10 py-6 bg-brand-orange/10 hover:bg-brand-orange hover:text-white text-brand-orange border-2 border-dashed border-brand-orange/30 rounded-3xl font-bold transition-all text-lg">
              📤 Upload Image
            </button>
            <p className="mt-4 text-sm text-muted-foreground">PNG, JPG, SVG, or WebP — square images work best</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6">
            <img src={imageSrc} alt="Preview" className="w-32 h-32 object-contain rounded-2xl border border-border" />
            <div className="flex flex-wrap gap-4 items-center justify-center">
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">Background:</label>
                <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-8 h-8 rounded-lg border border-border cursor-pointer" />
              </div>
              <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                <input type="checkbox" checked={rounded} onChange={(e) => setRounded(e.target.checked)} className="accent-brand-orange" /> Rounded corners
              </label>
              <button onClick={generate} className="px-6 py-3 bg-brand-orange hover:bg-brand-orange-hover text-white font-bold rounded-xl transition-all shadow-md shadow-brand-orange/20">⚡ Generate All Sizes</button>
              <button onClick={() => { setImageSrc(null); setGenerated([]) }} className="px-4 py-3 bg-muted border border-border rounded-xl font-bold text-sm hover:text-red-500 transition-all">🔄 Change Image</button>
            </div>
          </div>
        )}
        <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
      </div>

      {/* Results */}
      {generated.length > 0 && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="font-bold font-syne text-xl">Generated Favicons</h2>
            <button onClick={downloadAll} className="px-5 py-2.5 bg-brand-orange hover:bg-brand-orange-hover text-white font-bold rounded-xl text-sm transition-all">📥 Download All</button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {generated.map(g => (
              <div key={g.size} className="bg-card border border-border p-4 rounded-2xl text-center group hover:border-brand-orange/40 transition-all">
                <div className="flex items-center justify-center h-20 mb-3">
                  <img src={g.dataUrl} alt={g.label} style={{ width: Math.min(g.size, 64), height: Math.min(g.size, 64) }} className="image-rendering-pixelated" />
                </div>
                <p className="font-mono font-bold text-sm">{g.label}</p>
                <p className="text-xs text-muted-foreground">{g.use}</p>
                <button onClick={() => download(g.dataUrl, `favicon-${g.size}x${g.size}.png`)}
                  className="mt-2 text-xs px-3 py-1 rounded-lg bg-muted hover:bg-brand-orange hover:text-white font-bold transition-all opacity-0 group-hover:opacity-100">Download</button>
              </div>
            ))}
          </div>

          {/* HTML Code */}
          <div className="bg-card border border-border p-6 rounded-[2rem] shadow-sm">
            <h3 className="font-bold font-syne mb-3">HTML Code</h3>
            <pre className="bg-[#0d1117] text-[#c9d1d9] p-4 rounded-xl font-mono text-xs overflow-x-auto border border-[#21262d]">{getHtmlCode()}</pre>
          </div>
        </div>
      )}
    </div>
  )
}
