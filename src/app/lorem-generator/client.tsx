'use client'
import React, { useState, useMemo } from 'react'

const WORDS = 'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure in reprehenderit voluptate velit esse cillum fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum perspiciatis unde omnis iste natus error voluptatem accusantium doloremque laudantium totam rem aperiam eaque ipsa quae ab illo inventore veritatis quasi architecto beatae vitae dicta explicabo nemo ipsam quia voluptas aspernatur aut odit fugit consequuntur magni dolores eos ratione sequi nesciunt neque porro quisquam dolorem adipisci numquam eius modi tempora incidunt magnam aliquam quaerat'.split(' ')

const genSentence = (min = 6, max = 16) => {
  const len = min + Math.floor(Math.random() * (max - min))
  const s = Array.from({ length: len }, () => WORDS[Math.floor(Math.random() * WORDS.length)]).join(' ')
  return s.charAt(0).toUpperCase() + s.slice(1) + '.'
}
const genParagraph = (sentences = 5) => Array.from({ length: sentences }, () => genSentence()).join(' ')

export default function LoremClient() {
  const [mode, setMode] = useState<'paragraphs' | 'sentences' | 'words'>('paragraphs')
  const [count, setCount] = useState(3)
  const [startWithLorem, setStartWithLorem] = useState(true)
  const [copied, setCopied] = useState(false)

  const output = useMemo(() => {
    let result = ''
    if (mode === 'paragraphs') {
      result = Array.from({ length: count }, () => genParagraph(4 + Math.floor(Math.random() * 3))).join('\n\n')
    } else if (mode === 'sentences') {
      result = Array.from({ length: count }, () => genSentence()).join(' ')
    } else {
      result = Array.from({ length: count }, () => WORDS[Math.floor(Math.random() * WORDS.length)]).join(' ')
    }
    if (startWithLorem && result.length > 0) {
      result = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ' + result.slice(result.indexOf(' ', 10) + 1)
    }
    return result
  }, [mode, count, startWithLorem])

  const copy = () => { navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 2000) }

  return (
    <div className="bg-card border border-border p-8 rounded-[2.5rem] shadow-sm space-y-8">
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-2">
          {(['paragraphs', 'sentences', 'words'] as const).map(m => (
            <button key={m} onClick={() => setMode(m)} className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all capitalize ${mode === m ? 'bg-brand-orange text-white border-brand-orange' : 'border-border hover:bg-muted'}`}>{m}</button>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={startWithLorem} onChange={(e) => setStartWithLorem(e.target.checked)} className="accent-brand-orange" /> Start with "Lorem ipsum"</label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Count:</span>
            <input type="number" min={1} max={100} value={count} onChange={(e) => setCount(Math.max(1, parseInt(e.target.value) || 1))} className="w-20 bg-muted/30 border border-border rounded-xl px-3 py-2 text-center font-mono" />
          </div>
        </div>
      </div>
      <div className="relative">
        <div className="bg-muted/20 border border-border rounded-2xl p-6 max-h-[500px] overflow-y-auto text-sm leading-relaxed whitespace-pre-wrap">{output}</div>
        <button onClick={copy} className="absolute top-4 right-4 px-4 py-2 bg-brand-orange hover:bg-brand-orange-hover text-white rounded-xl text-sm font-bold transition-all shadow-sm">
          {copied ? '✓ Copied!' : '📋 Copy'}
        </button>
      </div>
      <div className="flex gap-4 text-xs text-muted-foreground justify-center">
        <span>{output.split(/\s+/).length} words</span>
        <span>{output.length} characters</span>
        <span>{output.split('\n\n').filter(Boolean).length} paragraphs</span>
      </div>
    </div>
  )
}
