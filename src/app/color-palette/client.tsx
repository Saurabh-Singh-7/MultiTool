'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'

// ─── COLOR UTILS ────────────────────────────────────────────────────────

const hslToHex = (h: number, s: number, l: number): string => {
  s /= 100; l /= 100
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => { const k = (n + h / 30) % 12; return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1) }
  return '#' + [f(0), f(8), f(4)].map(x => Math.round(x * 255).toString(16).padStart(2, '0')).join('')
}

const hexToHsl = (hex: string): [number, number, number] => {
  let r = parseInt(hex.slice(1, 3), 16) / 255
  let g = parseInt(hex.slice(3, 5), 16) / 255
  let b = parseInt(hex.slice(5, 7), 16) / 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h = 0, s = 0, l = (max + min) / 2
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)]
}

const hexToRgb = (hex: string) => ({
  r: parseInt(hex.slice(1, 3), 16),
  g: parseInt(hex.slice(3, 5), 16),
  b: parseInt(hex.slice(5, 7), 16),
})

const luminance = (hex: string) => {
  const { r, g, b } = hexToRgb(hex)
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255
}

// ─── PALETTE GENERATORS ─────────────────────────────────────────────────

type HarmonyType = 'complementary' | 'analogous' | 'triadic' | 'split' | 'monochromatic' | 'random'

const generatePalette = (baseHex: string, harmony: HarmonyType, count: number = 5): string[] => {
  const [h, s, l] = hexToHsl(baseHex)

  switch (harmony) {
    case 'complementary': {
      const comp = (h + 180) % 360
      return [
        hslToHex(h, s, l),
        hslToHex(h, Math.max(s - 15, 10), Math.min(l + 15, 90)),
        hslToHex(h, s, 50),
        hslToHex(comp, Math.max(s - 10, 10), Math.min(l + 10, 85)),
        hslToHex(comp, s, l),
      ]
    }
    case 'analogous': {
      return [
        hslToHex((h - 30 + 360) % 360, s, l),
        hslToHex((h - 15 + 360) % 360, s, Math.min(l + 10, 85)),
        hslToHex(h, s, l),
        hslToHex((h + 15) % 360, s, Math.min(l + 10, 85)),
        hslToHex((h + 30) % 360, s, l),
      ]
    }
    case 'triadic': {
      return [
        hslToHex(h, s, l),
        hslToHex(h, Math.max(s - 20, 10), Math.min(l + 20, 90)),
        hslToHex((h + 120) % 360, s, l),
        hslToHex((h + 120) % 360, Math.max(s - 20, 10), Math.min(l + 20, 90)),
        hslToHex((h + 240) % 360, s, l),
      ]
    }
    case 'split': {
      return [
        hslToHex(h, s, l),
        hslToHex(h, Math.max(s - 15, 10), Math.min(l + 20, 90)),
        hslToHex((h + 150) % 360, s, l),
        hslToHex((h + 180) % 360, s, Math.min(l + 10, 85)),
        hslToHex((h + 210) % 360, s, l),
      ]
    }
    case 'monochromatic': {
      return Array.from({ length: count }, (_, i) => {
        const newL = Math.max(15, Math.min(90, 20 + i * (70 / (count - 1))))
        return hslToHex(h, s, newL)
      })
    }
    case 'random': {
      return Array.from({ length: count }, () => {
        const rh = Math.floor(Math.random() * 360)
        const rs = 50 + Math.floor(Math.random() * 40)
        const rl = 35 + Math.floor(Math.random() * 35)
        return hslToHex(rh, rs, rl)
      })
    }
  }
}

// ─── COMPONENT ──────────────────────────────────────────────────────────

const HARMONIES: { id: HarmonyType; label: string; icon: string }[] = [
  { id: 'complementary', label: 'Complementary', icon: '🎯' },
  { id: 'analogous', label: 'Analogous', icon: '🌈' },
  { id: 'triadic', label: 'Triadic', icon: '🔺' },
  { id: 'split', label: 'Split-Complementary', icon: '✂️' },
  { id: 'monochromatic', label: 'Monochromatic', icon: '🎨' },
  { id: 'random', label: 'Random', icon: '🎲' },
]

export default function ColorPaletteClient() {
  const [baseColor, setBaseColor] = useState('#F97316')
  const [harmony, setHarmony] = useState<HarmonyType>('complementary')
  const [palette, setPalette] = useState<string[]>([])
  const [count, setCount] = useState(5)
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null)
  const [copiedExport, setCopiedExport] = useState(false)
  const [locked, setLocked] = useState<boolean[]>([])
  const [history, setHistory] = useState<string[][]>([])
  const imgInputRef = useRef<HTMLInputElement>(null)

  const generate = useCallback(() => {
    const newPalette = generatePalette(baseColor, harmony, count)
    // Preserve locked colors
    const final = newPalette.map((c, i) => (locked[i] ? palette[i] || c : c))
    setPalette(final)
    setHistory(prev => [[...final], ...prev].slice(0, 10))
  }, [baseColor, harmony, count, locked, palette])

  useEffect(() => { generate() }, [baseColor, harmony, count])

  // Spacebar to regenerate
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault()
        generate()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [generate])

  const copyColor = (hex: string, idx: number) => {
    navigator.clipboard.writeText(hex.toUpperCase())
    setCopiedIdx(idx)
    setTimeout(() => setCopiedIdx(null), 1500)
  }

  const toggleLock = (idx: number) => {
    const newLocked = [...locked]
    newLocked[idx] = !newLocked[idx]
    setLocked(newLocked)
  }

  const exportCSS = () => {
    const css = palette.map((c, i) => `  --color-${i + 1}: ${c.toUpperCase()};`).join('\n')
    navigator.clipboard.writeText(`:root {\n${css}\n}`)
    setCopiedExport(true)
    setTimeout(() => setCopiedExport(false), 2000)
  }

  const extractFromImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const img = new Image()
    const canvas = document.createElement('canvas')
    img.onload = () => {
      canvas.width = 100; canvas.height = 100
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, 100, 100)
      const data = ctx.getImageData(0, 0, 100, 100).data
      // Sample pixels in a grid
      const colors: Map<string, number> = new Map()
      for (let i = 0; i < data.length; i += 16) {
        const r = data[i], g = data[i + 1], b = data[i + 2]
        // Quantize to reduce similar colors
        const qr = Math.round(r / 32) * 32, qg = Math.round(g / 32) * 32, qb = Math.round(b / 32) * 32
        const hex = '#' + [qr, qg, qb].map(v => Math.min(255, v).toString(16).padStart(2, '0')).join('')
        colors.set(hex, (colors.get(hex) || 0) + 1)
      }
      const sorted = [...colors.entries()].sort((a, b) => b[1] - a[1])
      const extracted = sorted.slice(0, count).map(([c]) => c)
      setPalette(extracted)
      if (extracted[0]) setBaseColor(extracted[0])
      setHistory(prev => [[...extracted], ...prev].slice(0, 10))
    }
    img.src = URL.createObjectURL(file)
  }

  return (
    <div className="space-y-8">
      {/* Main Palette Display */}
      <div className="bg-card border border-border rounded-[2.5rem] shadow-xl overflow-hidden">
        <div className="flex flex-col sm:flex-row h-[300px] sm:h-[350px]">
          {palette.map((color, idx) => (
            <div
              key={idx}
              className="flex-1 relative group cursor-pointer transition-all hover:flex-[1.3]"
              style={{ backgroundColor: color }}
              onClick={() => copyColor(color, idx)}
            >
              {/* Overlay on hover */}
              <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
                <div className={`px-3 py-1 rounded-lg text-sm font-bold font-mono backdrop-blur-md ${luminance(color) > 0.5 ? 'bg-black/20 text-black' : 'bg-white/20 text-white'}`}>
                  {copiedIdx === idx ? '✓ Copied!' : color.toUpperCase()}
                </div>
                <div className={`mt-2 text-xs font-mono ${luminance(color) > 0.5 ? 'text-black/60' : 'text-white/60'}`}>
                  {(() => { const rgb = hexToRgb(color); return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` })()}
                </div>
              </div>

              {/* Lock button */}
              <button
                onClick={(e) => { e.stopPropagation(); toggleLock(idx) }}
                className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all ${locked[idx] ? 'opacity-100' : 'opacity-0 group-hover:opacity-70'} ${luminance(color) > 0.5 ? 'bg-black/10 hover:bg-black/20' : 'bg-white/10 hover:bg-white/20'}`}
              >
                {locked[idx] ? '🔒' : '🔓'}
              </button>

              {/* Color code at bottom */}
              <div className={`absolute bottom-3 left-0 right-0 text-center font-mono text-xs font-bold ${luminance(color) > 0.5 ? 'text-black/50' : 'text-white/50'}`}>
                {color.toUpperCase()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left: Settings */}
        <div className="lg:col-span-8 space-y-6">
          {/* Harmony + Base Color */}
          <div className="bg-card border border-border p-6 rounded-[2rem] shadow-sm">
            <div className="flex flex-col sm:flex-row gap-6 justify-between">
              <div className="flex-1">
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Color Harmony</label>
                <div className="flex flex-wrap gap-2">
                  {HARMONIES.map(h => (
                    <button key={h.id} onClick={() => setHarmony(h.id)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${harmony === h.id ? 'bg-brand-orange text-white border-brand-orange shadow-md' : 'bg-card border-border text-muted-foreground hover:border-brand-orange/40'}`}>
                      <span>{h.icon}</span> {h.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="shrink-0">
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Base Color</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={baseColor} onChange={(e) => setBaseColor(e.target.value)} className="w-12 h-12 rounded-xl border border-border cursor-pointer" />
                  <input type="text" value={baseColor.toUpperCase()} onChange={(e) => { if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) setBaseColor(e.target.value) }}
                    className="w-28 bg-muted/30 border border-border rounded-xl px-3 py-2 font-mono text-sm uppercase" />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button onClick={generate} className="px-6 py-3 bg-brand-orange hover:bg-brand-orange-hover text-white font-bold rounded-2xl transition-all shadow-md shadow-brand-orange/20 text-sm">
              🎲 Generate New <span className="hidden sm:inline opacity-60 ml-1">(Spacebar)</span>
            </button>
            <button onClick={exportCSS} className="px-5 py-3 bg-muted hover:bg-muted/80 border border-border font-bold rounded-2xl text-sm transition-all">
              {copiedExport ? '✓ Copied CSS!' : '📋 Export CSS'}
            </button>
            <button onClick={() => imgInputRef.current?.click()} className="px-5 py-3 bg-muted hover:bg-muted/80 border border-border font-bold rounded-2xl text-sm transition-all">
              🖼️ Extract from Image
            </button>
            <input ref={imgInputRef} type="file" accept="image/*" onChange={extractFromImage} className="hidden" />
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-xs font-bold text-muted-foreground">Colors:</span>
              {[3, 4, 5, 6, 7].map(n => (
                <button key={n} onClick={() => { setCount(n); setLocked([]) }}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${count === n ? 'bg-brand-orange text-white' : 'bg-muted border border-border'}`}>{n}</button>
              ))}
            </div>
          </div>

          {/* Color Details */}
          <div className="bg-card border border-border p-6 rounded-[2rem] shadow-sm">
            <h3 className="font-bold font-syne mb-4">Palette Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {palette.map((color, idx) => {
                const [h, s, l] = hexToHsl(color)
                const rgb = hexToRgb(color)
                return (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-muted/20 rounded-xl border border-border hover:border-brand-orange/30 transition-colors cursor-pointer group"
                    onClick={() => copyColor(color, idx)}>
                    <div className="w-10 h-10 rounded-xl shrink-0 border border-border shadow-sm" style={{ backgroundColor: color }} />
                    <div className="min-w-0 flex-1">
                      <div className="font-mono font-bold text-sm">{color.toUpperCase()}</div>
                      <div className="text-xs text-muted-foreground font-mono truncate">rgb({rgb.r},{rgb.g},{rgb.b}) · hsl({h},{s}%,{l}%)</div>
                    </div>
                    <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity">{copiedIdx === idx ? '✓' : '📋'}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right: History */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-card border border-border p-6 rounded-[2rem] shadow-sm">
            <h3 className="font-bold font-syne mb-4">Recent Palettes</h3>
            {history.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">Generate palettes to see history</p>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {history.map((pal, hIdx) => (
                  <button key={hIdx} onClick={() => { setPalette(pal); if (pal[0]) setBaseColor(pal[0]) }}
                    className="w-full flex h-10 rounded-xl overflow-hidden border border-border hover:border-brand-orange/50 transition-all hover:scale-[1.02]">
                    {pal.map((c, ci) => (
                      <div key={ci} className="flex-1" style={{ backgroundColor: c }} />
                    ))}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="bg-muted/30 border border-border p-6 rounded-[2rem]">
            <h3 className="font-bold font-syne mb-3">⌨️ Keyboard Shortcuts</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex justify-between"><span>Generate new palette</span><kbd className="bg-muted px-2 py-0.5 rounded text-xs font-mono">Space</kbd></div>
              <div className="flex justify-between"><span>Click any color</span><span className="text-xs">Copy HEX</span></div>
              <div className="flex justify-between"><span>🔒 Lock icon</span><span className="text-xs">Keep on regenerate</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
