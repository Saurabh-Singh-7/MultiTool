'use client'
import React, { useState, useEffect, useRef } from 'react'

const ALGOS = ['SHA-256', 'SHA-384', 'SHA-512', 'SHA-1'] as const

async function hashText(text: string, algo: string): Promise<string> {
  const data = new TextEncoder().encode(text)
  const buf = await crypto.subtle.digest(algo, data)
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

async function hashFile(file: File, algo: string): Promise<string> {
  const buf = await file.arrayBuffer()
  const hash = await crypto.subtle.digest(algo, buf)
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('')
}

export default function HashClient() {
  const [mode, setMode] = useState<'text' | 'file'>('text')
  const [input, setInput] = useState('Hello, ToolHive!')
  const [hashes, setHashes] = useState<Record<string, string>>({})
  const [fileInfo, setFileInfo] = useState<{ name: string; size: string } | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (mode !== 'text' || !input) { setHashes({}); return }
    const run = async () => {
      const results: Record<string, string> = {}
      for (const algo of ALGOS) results[algo] = await hashText(input, algo)
      setHashes(results)
    }
    run()
  }, [input, mode])

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setLoading(true)
    setFileInfo({ name: file.name, size: file.size > 1024 * 1024 ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : `${(file.size / 1024).toFixed(1)} KB` })
    const results: Record<string, string> = {}
    for (const algo of ALGOS) results[algo] = await hashFile(file, algo)
    setHashes(results)
    setLoading(false)
  }

  const copy = (text: string, id: string) => { navigator.clipboard.writeText(text); setCopied(id); setTimeout(() => setCopied(null), 1500) }

  return (
    <div className="space-y-6">
      <div className="flex gap-2 justify-center">
        <button onClick={() => { setMode('text'); setFileInfo(null) }} className={`px-5 py-2.5 rounded-xl text-sm font-bold border transition-all ${mode === 'text' ? 'bg-brand-orange text-white border-brand-orange' : 'border-border hover:bg-muted'}`}>📝 Text Input</button>
        <button onClick={() => { setMode('file'); setInput('') }} className={`px-5 py-2.5 rounded-xl text-sm font-bold border transition-all ${mode === 'file' ? 'bg-brand-orange text-white border-brand-orange' : 'border-border hover:bg-muted'}`}>📁 File Hash</button>
      </div>

      <div className="bg-card border border-border p-6 rounded-[2.5rem] shadow-sm">
        {mode === 'text' ? (
          <>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Enter Text</label>
            <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type or paste text to hash..."
              className="w-full bg-[#0d1117] text-[#c9d1d9] border border-[#21262d] rounded-2xl p-6 h-32 resize-none focus:outline-none focus:ring-2 focus:ring-brand-orange/50 font-mono text-sm" />
          </>
        ) : (
          <div className="text-center py-8">
            <button onClick={() => fileRef.current?.click()} className="px-8 py-4 bg-brand-orange/10 hover:bg-brand-orange hover:text-white text-brand-orange border border-brand-orange/20 rounded-2xl font-bold transition-all text-lg">
              📤 Choose File
            </button>
            <input ref={fileRef} type="file" onChange={handleFile} className="hidden" />
            {fileInfo && <p className="mt-4 text-sm text-muted-foreground">{fileInfo.name} ({fileInfo.size})</p>}
            {loading && <p className="mt-4 text-sm text-brand-orange animate-pulse">Computing hashes...</p>}
          </div>
        )}
      </div>

      {Object.keys(hashes).length > 0 && (
        <div className="space-y-3">
          {ALGOS.map(algo => (
            <div key={algo} className="bg-card border border-border p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center gap-3 group hover:border-brand-orange/30 transition-all">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest sm:w-24 shrink-0">{algo}</span>
              <div className="flex-1 bg-[#0d1117] rounded-xl px-4 py-2.5 font-mono text-xs text-[#c9d1d9] break-all overflow-auto border border-[#21262d]">{hashes[algo] || '—'}</div>
              <button onClick={() => copy(hashes[algo], algo)} className="shrink-0 text-xs px-4 py-2 rounded-lg bg-muted hover:bg-brand-orange hover:text-white font-bold transition-all">
                {copied === algo ? '✓ Copied!' : 'Copy'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
