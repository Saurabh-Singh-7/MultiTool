'use client'

import React, { useState, useEffect } from 'react'

export default function WordCounterClient() {
  const [text, setText] = useState('')
  const [stats, setStats] = useState({
    words: 0, characters: 0, charsNoSpaces: 0, 
    sentences: 0, paragraphs: 0, lines: 0,
    readingTime: 0, speakingTime: 0,
    topWords: [] as [string, number][],
    charBreakdown: { upper: 0, lower: 0, numbers: 0, spaces: 0, special: 0 }
  })

  useEffect(() => {
    const words = text.trim().split(/\s+/).filter(w => w.length > 0)
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
    const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0)
    const lines = text ? text.split('\n').length : 0

    const wordFreq: Record<string, number> = {}
    words.forEach(w => {
      const clean = w.toLowerCase().replace(/[^a-z0-9]/g, '')
      if (clean) wordFreq[clean] = (wordFreq[clean] || 0) + 1
    })

    const topWords = Object.entries(wordFreq).sort(([, a], [, b]) => b - a).slice(0, 10)

    const chars = text.split('')
    let upper = 0, lower = 0, numbers = 0, spaces = 0, special = 0
    chars.forEach(c => {
      if (/[A-Z]/.test(c)) upper++
      else if (/[a-z]/.test(c)) lower++
      else if (/[0-9]/.test(c)) numbers++
      else if (/\s/.test(c)) spaces++
      else special++
    })

    setStats({
      words: words.length,
      characters: text.length,
      charsNoSpaces: text.replace(/\s/g, '').length,
      sentences: sentences.length,
      paragraphs: paragraphs.length,
      lines,
      readingTime: Math.ceil(words.length / 250),
      speakingTime: Math.ceil(words.length / 125),
      topWords,
      charBreakdown: { upper, lower, numbers, spaces, special }
    })

  }, [text])

  const formatNum = (n: number) => new Intl.NumberFormat('en-US').format(n)

  const StatBox = ({ label, value }: { label: string, value: string | number }) => (
    <div className="bg-muted/10 border border-border p-4 rounded-2xl flex justify-between items-center hover:border-brand-orange/30 transition-colors">
      <span className="text-muted-foreground font-medium text-sm">{label}</span>
      <span className="font-bold font-mono text-lg">{value}</span>
    </div>
  )

  return (
    <div className="grid lg:grid-cols-12 gap-8">
      
      {/* LEFT: Text Area */}
      <div className="lg:col-span-8 space-y-4">
        <div className="bg-card border border-border p-2 rounded-[2rem] shadow-sm flex flex-col h-[500px] lg:h-[700px]">
          <div className="px-6 py-4 border-b border-border flex justify-between items-center">
            <h2 className="font-bold font-syne">Input Text</h2>
            <button 
              onClick={() => setText('')}
              className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-red-500 transition-colors"
            >
              Clear All
            </button>
          </div>
          <textarea 
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type or paste your text here to begin analysis..."
            className="flex-1 w-full bg-transparent p-6 resize-none focus:outline-none leading-relaxed text-foreground"
          ></textarea>
        </div>
      </div>

      {/* RIGHT: Stats */}
      <div className="lg:col-span-4 space-y-6">
        
        <div className="grid grid-cols-2 gap-3">
          <StatBox label="Words" value={formatNum(stats.words)} />
          <StatBox label="Characters" value={formatNum(stats.characters)} />
          <StatBox label="Sentences" value={formatNum(stats.sentences)} />
          <StatBox label="Paragraphs" value={formatNum(stats.paragraphs)} />
        </div>

        <div className="bg-card border border-border p-6 rounded-3xl shadow-sm space-y-4 text-sm">
          <div className="flex justify-between items-center pb-3 border-b border-border">
            <span className="text-muted-foreground">Chars (no spaces)</span>
            <span className="font-mono font-bold">{formatNum(stats.charsNoSpaces)}</span>
          </div>
          <div className="flex justify-between items-center pb-3 border-b border-border">
            <span className="text-muted-foreground">Total Lines</span>
            <span className="font-mono font-bold">{formatNum(stats.lines)}</span>
          </div>
          <div className="flex justify-between items-center pb-3 border-b border-border">
            <span className="text-muted-foreground">Reading Time</span>
            <span className="font-medium text-brand-orange">~{stats.readingTime} min</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Speaking Time</span>
            <span className="font-medium text-brand-orange">~{stats.speakingTime} min</span>
          </div>
        </div>

        {stats.topWords.length > 0 && (
          <div className="bg-card border border-border p-6 rounded-3xl shadow-sm">
            <h3 className="font-bold text-xs uppercase tracking-widest text-muted-foreground mb-4">Keyword Density</h3>
            <div className="flex flex-wrap gap-2">
              {stats.topWords.map(([word, count]) => (
                <div key={word} className="flex items-center gap-2 bg-muted/30 border border-border px-3 py-1.5 rounded-lg text-sm">
                  <span className="font-medium truncate max-w-[100px]">{word}</span>
                  <span className="bg-muted text-muted-foreground font-mono text-xs px-1.5 rounded">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {text.length > 0 && (
          <div className="bg-card border border-border p-6 rounded-3xl shadow-sm">
            <h3 className="font-bold text-xs uppercase tracking-widest text-muted-foreground mb-4">Character Breakdown</h3>
            <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Uppercase</span> <span className="font-mono font-bold">{formatNum(stats.charBreakdown.upper)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Lowercase</span> <span className="font-mono font-bold">{formatNum(stats.charBreakdown.lower)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Numbers</span> <span className="font-mono font-bold">{formatNum(stats.charBreakdown.numbers)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Spaces</span> <span className="font-mono font-bold">{formatNum(stats.charBreakdown.spaces)}</span></div>
              <div className="flex justify-between col-span-2"><span className="text-muted-foreground">Special / Punctuation</span> <span className="font-mono font-bold">{formatNum(stats.charBreakdown.special)}</span></div>
            </div>
          </div>
        )}

      </div>

    </div>
  )
}
