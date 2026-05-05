'use client'
import React, { useState } from 'react'

interface ColorStop { color: string; position: number }

const PRESETS = [
  { name: 'Sunset', stops: [{ color: '#FF6B6B', position: 0 }, { color: '#FFA07A', position: 50 }, { color: '#FFD700', position: 100 }] },
  { name: 'Ocean', stops: [{ color: '#667eea', position: 0 }, { color: '#764ba2', position: 100 }] },
  { name: 'Forest', stops: [{ color: '#11998e', position: 0 }, { color: '#38ef7d', position: 100 }] },
  { name: 'Fire', stops: [{ color: '#f12711', position: 0 }, { color: '#f5af19', position: 100 }] },
  { name: 'ToolHive', stops: [{ color: '#F97316', position: 0 }, { color: '#FDBA74', position: 100 }] },
  { name: 'Night', stops: [{ color: '#0F2027', position: 0 }, { color: '#203A43', position: 50 }, { color: '#2C5364', position: 100 }] },
  { name: 'Candy', stops: [{ color: '#fc5c7d', position: 0 }, { color: '#6a82fb', position: 100 }] },
  { name: 'Mojito', stops: [{ color: '#1D976C', position: 0 }, { color: '#93F9B9', position: 100 }] },
]

export default function GradientClient() {
  const [type, setType] = useState<'linear' | 'radial' | 'conic'>('linear')
  const [angle, setAngle] = useState(135)
  const [stops, setStops] = useState<ColorStop[]>([{ color: '#F97316', position: 0 }, { color: '#8B5CF6', position: 100 }])
  const [copied, setCopied] = useState(false)

  const stopsStr = stops.map(s => `${s.color} ${s.position}%`).join(', ')
  const cssValue = type === 'linear' ? `linear-gradient(${angle}deg, ${stopsStr})`
    : type === 'radial' ? `radial-gradient(circle, ${stopsStr})`
    : `conic-gradient(from ${angle}deg, ${stopsStr})`
  const cssCode = `background: ${cssValue};`

  const addStop = () => setStops([...stops, { color: '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'), position: 50 }])
  const removeStop = (i: number) => stops.length > 2 && setStops(stops.filter((_, idx) => idx !== i))
  const updateStop = (i: number, field: keyof ColorStop, value: string | number) => {
    const n = [...stops]; (n[i] as Record<string, unknown>)[field] = value; setStops(n)
  }

  const copy = () => { navigator.clipboard.writeText(cssCode); setCopied(true); setTimeout(() => setCopied(false), 2000) }

  return (
    <div className="space-y-8">
      {/* Preview */}
      <div className="rounded-[2.5rem] overflow-hidden border border-border shadow-xl h-[300px] sm:h-[350px]" style={{ background: cssValue }} />

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Controls */}
        <div className="lg:col-span-7 space-y-6">
          {/* Type + Angle */}
          <div className="bg-card border border-border p-6 rounded-[2rem] shadow-sm flex flex-wrap gap-6 items-end">
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Type</label>
              <div className="flex gap-2">
                {(['linear', 'radial', 'conic'] as const).map(t => (
                  <button key={t} onClick={() => setType(t)} className={`px-4 py-2 rounded-xl text-sm font-bold border capitalize transition-all ${type === t ? 'bg-brand-orange text-white border-brand-orange' : 'border-border hover:bg-muted'}`}>{t}</button>
                ))}
              </div>
            </div>
            {(type === 'linear' || type === 'conic') && (
              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Angle: {angle}°</label>
                <input type="range" min={0} max={360} value={angle} onChange={(e) => setAngle(parseInt(e.target.value))} className="w-full accent-brand-orange" />
              </div>
            )}
          </div>

          {/* Color Stops */}
          <div className="bg-card border border-border p-6 rounded-[2rem] shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold font-syne">Color Stops</h3>
              <button onClick={addStop} className="px-4 py-2 bg-brand-orange/10 text-brand-orange border border-brand-orange/20 rounded-xl text-sm font-bold hover:bg-brand-orange hover:text-white transition-all">+ Add Stop</button>
            </div>
            {stops.map((stop, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-muted/10 rounded-xl border border-border group">
                <input type="color" value={stop.color} onChange={(e) => updateStop(i, 'color', e.target.value)} className="w-10 h-10 rounded-lg border border-border cursor-pointer shrink-0" />
                <input type="text" value={stop.color} onChange={(e) => updateStop(i, 'color', e.target.value)} className="w-24 bg-muted/30 border border-border rounded-lg px-2 py-1.5 font-mono text-sm uppercase" />
                <div className="flex-1">
                  <input type="range" min={0} max={100} value={stop.position} onChange={(e) => updateStop(i, 'position', parseInt(e.target.value))} className="w-full accent-brand-orange" />
                </div>
                <span className="text-xs font-mono text-muted-foreground w-10 text-right">{stop.position}%</span>
                {stops.length > 2 && <button onClick={() => removeStop(i)} className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">×</button>}
              </div>
            ))}
          </div>

          {/* Presets */}
          <div className="bg-card border border-border p-6 rounded-[2rem] shadow-sm">
            <h3 className="font-bold font-syne mb-4">Presets</h3>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {PRESETS.map(p => (
                <button key={p.name} onClick={() => { setStops(p.stops); setType('linear') }} title={p.name}
                  className="h-12 rounded-xl border-2 border-border hover:border-brand-orange hover:scale-105 transition-all"
                  style={{ background: `linear-gradient(135deg, ${p.stops.map(s => `${s.color} ${s.position}%`).join(', ')})` }} />
              ))}
            </div>
          </div>
        </div>

        {/* CSS Output */}
        <div className="lg:col-span-5">
          <div className="bg-card border border-border p-6 rounded-[2rem] shadow-sm sticky top-8 space-y-4">
            <h3 className="font-bold font-syne">CSS Code</h3>
            <pre className="bg-[#0d1117] text-[#c9d1d9] p-4 rounded-xl font-mono text-sm overflow-x-auto border border-[#21262d] whitespace-pre-wrap">{cssCode}</pre>
            <button onClick={copy} className="w-full py-3 bg-brand-orange hover:bg-brand-orange-hover text-white font-bold rounded-2xl transition-all shadow-md shadow-brand-orange/20">
              {copied ? '✓ Copied CSS!' : '📋 Copy CSS Code'}
            </button>

            {/* Mini previews */}
            <div className="grid grid-cols-3 gap-2 pt-2">
              <div className="rounded-xl h-20 border border-border" style={{ background: cssValue }} />
              <div className="rounded-full h-20 border border-border" style={{ background: cssValue }} />
              <div className="rounded-xl h-20 border border-border flex items-center justify-center" style={{ background: cssValue }}>
                <span className="text-white font-bold text-xs drop-shadow-md">Button</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
