'use client'
import React, { useState } from 'react'

const modes = [
  { id: 'url', label: 'URL Encode/Decode', encode: (t: string) => encodeURIComponent(t), decode: (t: string) => decodeURIComponent(t) },
  { id: 'base64', label: 'Base64', encode: (t: string) => btoa(unescape(encodeURIComponent(t))), decode: (t: string) => decodeURIComponent(escape(atob(t))) },
  { id: 'html', label: 'HTML Entities', encode: (t: string) => t.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[c] || c)), decode: (t: string) => t.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#039;/g, "'") },
]

export default function UrlEncoderClient() {
  const [input, setInput] = useState('https://toolhive.app/search?q=hello world&lang=en')
  const [mode, setMode] = useState('url')
  const [copied, setCopied] = useState<string | null>(null)

  const currentMode = modes.find(m => m.id === mode)!
  let encoded = '', decoded = '', encodeError = '', decodeError = ''
  try { encoded = currentMode.encode(input) } catch { encodeError = 'Invalid input for encoding' }
  try { decoded = currentMode.decode(input) } catch { decodeError = 'Invalid input for decoding' }

  const copy = (text: string, id: string) => { navigator.clipboard.writeText(text); setCopied(id); setTimeout(() => setCopied(null), 1500) }

  return (
    <div className="space-y-6">
      <div className="flex gap-2 justify-center">
        {modes.map(m => (
          <button key={m.id} onClick={() => setMode(m.id)} className={`px-4 py-2.5 rounded-xl text-sm font-bold border transition-all ${mode === m.id ? 'bg-brand-orange text-white border-brand-orange shadow-md' : 'border-border hover:bg-muted'}`}>{m.label}</button>
        ))}
      </div>

      <div className="bg-card border border-border p-6 rounded-[2.5rem] shadow-sm">
        <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Input</label>
        <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="Paste text to encode or decode..."
          className="w-full bg-[#0d1117] text-[#c9d1d9] border border-[#21262d] rounded-2xl p-6 h-32 resize-none focus:outline-none focus:ring-2 focus:ring-brand-orange/50 font-mono text-sm" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-card border border-border p-6 rounded-[2rem] shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">✅ Encoded</span>
            <button onClick={() => copy(encoded, 'enc')} disabled={!!encodeError} className="text-xs px-3 py-1 rounded-lg bg-muted hover:bg-brand-orange hover:text-white font-bold transition-all disabled:opacity-50">{copied === 'enc' ? '✓ Copied!' : 'Copy'}</button>
          </div>
          <div className="bg-[#0d1117] text-[#c9d1d9] rounded-xl p-4 font-mono text-sm max-h-48 overflow-auto break-all border border-[#21262d]">
            {encodeError ? <span className="text-red-400">{encodeError}</span> : (encoded || '—')}
          </div>
          <button onClick={() => setInput(encoded)} className="mt-3 text-xs text-brand-orange hover:underline">↑ Use as input</button>
        </div>
        <div className="bg-card border border-border p-6 rounded-[2rem] shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">🔓 Decoded</span>
            <button onClick={() => copy(decoded, 'dec')} disabled={!!decodeError} className="text-xs px-3 py-1 rounded-lg bg-muted hover:bg-brand-orange hover:text-white font-bold transition-all disabled:opacity-50">{copied === 'dec' ? '✓ Copied!' : 'Copy'}</button>
          </div>
          <div className="bg-[#0d1117] text-[#c9d1d9] rounded-xl p-4 font-mono text-sm max-h-48 overflow-auto break-all border border-[#21262d]">
            {decodeError ? <span className="text-red-400">{decodeError}</span> : (decoded || '—')}
          </div>
          <button onClick={() => setInput(decoded)} className="mt-3 text-xs text-brand-orange hover:underline">↑ Use as input</button>
        </div>
      </div>
    </div>
  )
}
