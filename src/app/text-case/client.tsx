'use client'
import React, { useState } from 'react'

const conversions = [
  { id: 'upper', label: 'UPPERCASE', fn: (t: string) => t.toUpperCase() },
  { id: 'lower', label: 'lowercase', fn: (t: string) => t.toLowerCase() },
  { id: 'title', label: 'Title Case', fn: (t: string) => t.replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()) },
  { id: 'sentence', label: 'Sentence case', fn: (t: string) => t.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, c => c.toUpperCase()) },
  { id: 'camel', label: 'camelCase', fn: (t: string) => t.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase()) },
  { id: 'pascal', label: 'PascalCase', fn: (t: string) => t.toLowerCase().replace(/(^|[^a-zA-Z0-9]+)(.)/g, (_, __, c) => c.toUpperCase()) },
  { id: 'snake', label: 'snake_case', fn: (t: string) => t.toLowerCase().replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_|_$/g, '') },
  { id: 'kebab', label: 'kebab-case', fn: (t: string) => t.toLowerCase().replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '') },
  { id: 'constant', label: 'CONSTANT_CASE', fn: (t: string) => t.toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_|_$/g, '') },
  { id: 'dot', label: 'dot.case', fn: (t: string) => t.toLowerCase().replace(/[^a-zA-Z0-9]+/g, '.').replace(/^\.|\.$/g, '') },
  { id: 'toggle', label: 'tOGGLE cASE', fn: (t: string) => t.split('').map(c => c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()).join('') },
  { id: 'reverse', label: 'Reverse', fn: (t: string) => t.split('').reverse().join('') },
]

export default function TextCaseClient() {
  const [input, setInput] = useState('The quick brown fox jumps over the lazy dog')
  const [copied, setCopied] = useState<string | null>(null)

  const copy = (text: string, id: string) => { navigator.clipboard.writeText(text); setCopied(id); setTimeout(() => setCopied(null), 1500) }

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border p-6 rounded-[2.5rem] shadow-sm">
        <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Input Text</label>
        <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type or paste your text here..."
          className="w-full bg-muted/20 border border-border rounded-2xl p-6 h-32 resize-none focus:outline-none focus:ring-2 focus:ring-brand-orange/50 text-lg" />
        <div className="mt-3 flex gap-3 text-xs text-muted-foreground">
          <span>{input.split(/\s+/).filter(Boolean).length} words</span>
          <span>{input.length} chars</span>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {conversions.map(c => {
          const result = c.fn(input)
          return (
            <div key={c.id} className="bg-card border border-border p-5 rounded-2xl hover:border-brand-orange/40 transition-all group">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{c.label}</span>
                <button onClick={() => copy(result, c.id)}
                  className="text-xs px-3 py-1 rounded-lg bg-muted hover:bg-brand-orange hover:text-white font-bold transition-all opacity-0 group-hover:opacity-100">
                  {copied === c.id ? '✓' : 'Copy'}
                </button>
              </div>
              <p className="font-mono text-sm truncate text-foreground">{result || '—'}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
