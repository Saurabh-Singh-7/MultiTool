'use client'

import React, { useState } from 'react'

export default function NumberConverterClient() {
  const [input, setInput] = useState('255')
  const [base, setBase] = useState<number>(10)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  let decimalVal = NaN
  if (input.trim() !== '') {
    decimalVal = parseInt(input.trim(), base)
  }

  const isValid = !isNaN(decimalVal)

  const results = [
    { label: 'Decimal (Base 10)', value: isValid ? decimalVal.toString(10) : 'Invalid Input' },
    { label: 'Binary (Base 2)', value: isValid ? decimalVal.toString(2) : 'Invalid Input' },
    { label: 'Octal (Base 8)', value: isValid ? decimalVal.toString(8) : 'Invalid Input' },
    { label: 'Hexadecimal (Base 16)', value: isValid ? decimalVal.toString(16).toUpperCase() : 'Invalid Input' },
  ]

  const bases = [
    { name: 'Binary', val: 2 },
    { name: 'Octal', val: 8 },
    { name: 'Decimal', val: 10 },
    { name: 'Hexadecimal', val: 16 }
  ]

  const copyToClipboard = (text: string, label: string) => {
    if (!isValid) return
    navigator.clipboard.writeText(text)
    setCopiedField(label)
    setTimeout(() => setCopiedField(null), 2000)
  }

  return (
    <div className="bg-card border border-border p-8 rounded-[2.5rem] shadow-sm max-w-2xl mx-auto space-y-8">
      
      {/* Input Section */}
      <div className="space-y-4">
        <label className="block text-sm font-bold text-muted-foreground uppercase tracking-widest">Input Value</label>
        <div className="flex flex-col sm:flex-row gap-4">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value.toUpperCase())}
            placeholder="Enter number..."
            className={`flex-1 bg-muted/30 border rounded-2xl px-6 py-4 text-2xl font-mono focus:outline-none focus:ring-2 transition-all ${!isValid && input !== '' ? 'border-red-500 focus:ring-red-500/50 text-red-500' : 'border-border focus:ring-brand-orange/50'}`}
          />
        </div>
        
        <div className="flex flex-wrap gap-2 pt-2">
          {bases.map(b => (
            <button
              key={b.val}
              onClick={() => setBase(b.val)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${base === b.val ? 'bg-brand-orange border-brand-orange text-white shadow-md' : 'bg-muted/30 border-border text-muted-foreground hover:bg-muted'}`}
            >
              {b.name}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full h-px bg-border"></div>

      {/* Results Section */}
      <div className="space-y-4">
        <h3 className="font-bold font-syne text-xl mb-6">Converted Results</h3>
        
        <div className="grid gap-3">
          {results.map(r => (
            <div key={r.label} className="bg-muted/10 border border-border p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:border-brand-orange/30 transition-colors">
              <span className="text-muted-foreground font-medium text-sm sm:w-1/3">{r.label}</span>
              <div className="flex-1 flex justify-between items-center bg-background border border-border/50 px-4 py-2 rounded-xl overflow-hidden">
                <span className={`font-mono truncate ${!isValid && input !== '' ? 'text-red-400' : 'text-foreground font-bold'}`}>
                  {r.value}
                </span>
                <button 
                  onClick={() => copyToClipboard(r.value, r.label)}
                  disabled={!isValid}
                  className={`ml-4 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors shrink-0 ${copiedField === r.label ? 'bg-green-500 text-white' : 'bg-muted hover:bg-brand-orange hover:text-white disabled:opacity-50'}`}
                >
                  {copiedField === r.label ? '✓' : 'Copy'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
