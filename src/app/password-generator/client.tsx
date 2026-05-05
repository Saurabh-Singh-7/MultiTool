'use client'

import React, { useState, useEffect } from 'react'

export default function PasswordGeneratorClient() {
  const [length, setLength] = useState(16)
  const [uppercase, setUppercase] = useState(true)
  const [lowercase, setLowercase] = useState(true)
  const [numbers, setNumbers] = useState(true)
  const [symbols, setSymbols] = useState(true)
  const [noAmbiguous, setNoAmbiguous] = useState(false)
  const [pronounceable, setPronounceable] = useState(false)
  
  const [passwords, setPasswords] = useState<string[]>([])
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const generatePassword = () => {
    if (pronounceable) {
      // Basic pronounceable (alternating consonant/vowel)
      const consonants = 'bcdfghjklmnpqrstvwxyz'
      const vowels = 'aeiou'
      let pwd = ''
      for (let i = 0; i < length; i++) {
        if (i % 2 === 0) {
          const char = consonants[Math.floor(Math.random() * consonants.length)]
          pwd += uppercase && i === 0 ? char.toUpperCase() : char
        } else {
          pwd += vowels[Math.floor(Math.random() * vowels.length)]
        }
      }
      return pwd
    }

    let chars = ''
    if (uppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    if (lowercase) chars += 'abcdefghijklmnopqrstuvwxyz'
    if (numbers) chars += '0123456789'
    if (symbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?'
    
    if (noAmbiguous) {
      chars = chars.replace(/[0O1lI]/g, '')
    }

    if (!chars) return '' // fallback if all unchecked

    return Array.from(
      { length },
      () => chars[Math.floor(Math.random() * chars.length)]
    ).join('')
  }

  const generateMultiple = (count = 1) => {
    if (!uppercase && !lowercase && !numbers && !symbols && !pronounceable) {
      setPasswords(['Please select at least one option.'])
      return
    }
    const newPwds = []
    for(let i=0; i<count; i++) {
      newPwds.push(generatePassword())
    }
    setPasswords(newPwds)
    setCopiedIndex(null)
  }

  useEffect(() => {
    generateMultiple(1)
  }, [length, uppercase, lowercase, numbers, symbols, noAmbiguous, pronounceable])

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const getStrength = () => {
    if (passwords.length === 0 || passwords[0].length === 0) return { score: 0, label: 'Invalid', color: 'bg-muted' }
    let score = 0
    if (length > 8) score += 1
    if (length > 12) score += 1
    if (length >= 16) score += 1
    if (uppercase && lowercase) score += 1
    if (numbers) score += 1
    if (symbols) score += 1

    if (score <= 2) return { score: 20, label: 'Weak', color: 'bg-red-500' }
    if (score <= 4) return { score: 60, label: 'Good', color: 'bg-yellow-500' }
    return { score: 100, label: 'Very Strong', color: 'bg-green-500' }
  }

  const strength = getStrength()

  return (
    <div className="bg-card border border-border p-8 rounded-[2.5rem] shadow-sm max-w-3xl mx-auto space-y-8">
      
      {/* Primary Display */}
      <div className="space-y-4">
        <div className="relative">
          <input 
            type="text" 
            readOnly 
            value={passwords[0] || ''}
            className="w-full bg-muted/30 border border-border rounded-2xl px-6 py-5 text-xl sm:text-3xl font-mono text-center tracking-wider text-foreground focus:outline-none pr-16"
          />
          <button 
            onClick={() => copyToClipboard(passwords[0], 0)}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-background hover:bg-brand-orange hover:text-white border border-border rounded-xl transition-all"
            title="Copy"
          >
            {copiedIndex === 0 ? '✓' : '📋'}
          </button>
        </div>

        {/* Strength Meter */}
        <div className="flex items-center gap-4">
          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
             <div className={`h-full transition-all duration-500 ${strength.color}`} style={{ width: `${strength.score}%` }}></div>
          </div>
          <span className={`text-xs font-bold uppercase tracking-widest ${strength.color.replace('bg-', 'text-')}`}>
            {strength.label}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="grid sm:grid-cols-2 gap-8 py-6 border-t border-b border-border">
        
        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Password Length</label>
              <span className="text-2xl font-bold font-mono text-brand-orange">{length}</span>
            </div>
            <input 
              type="range" 
              min="4" max="64" 
              value={length} 
              onChange={(e) => setLength(parseInt(e.target.value))}
              className="w-full accent-brand-orange"
            />
          </div>

          <button 
            onClick={() => generateMultiple(5)}
            className="w-full py-3 bg-brand-orange/10 hover:bg-brand-orange hover:text-white text-brand-orange font-bold rounded-xl transition-colors border border-brand-orange/20"
          >
            Generate 5 Passwords
          </button>
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={uppercase} onChange={(e) => {setUppercase(e.target.checked); setPronounceable(false)}} className="accent-brand-orange w-4 h-4" />
            <span className="text-sm font-medium">Uppercase letters (A-Z)</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={lowercase} onChange={(e) => {setLowercase(e.target.checked); setPronounceable(false)}} className="accent-brand-orange w-4 h-4" />
            <span className="text-sm font-medium">Lowercase letters (a-z)</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={numbers} onChange={(e) => {setNumbers(e.target.checked); setPronounceable(false)}} className="accent-brand-orange w-4 h-4" />
            <span className="text-sm font-medium">Numbers (0-9)</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={symbols} onChange={(e) => {setSymbols(e.target.checked); setPronounceable(false)}} className="accent-brand-orange w-4 h-4" />
            <span className="text-sm font-medium">Symbols (!@#$%^&*)</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={noAmbiguous} onChange={(e) => setNoAmbiguous(e.target.checked)} className="accent-brand-orange w-4 h-4" />
            <span className="text-sm font-medium text-muted-foreground">Avoid ambiguous chars (0,O,l,1)</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={pronounceable} onChange={(e) => setPronounceable(e.target.checked)} className="accent-brand-orange w-4 h-4" />
            <span className="text-sm font-medium text-muted-foreground">Easy to pronounce (letters only)</span>
          </label>
        </div>

      </div>

      {/* Multiple Passwords List */}
      {passwords.length > 1 && (
        <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Choose from multiple options</h3>
          {passwords.map((pwd, idx) => (
            <div key={idx} className="flex justify-between items-center p-3 bg-muted/20 hover:bg-muted/40 rounded-xl transition-colors font-mono border border-border group">
              <span className="truncate mr-4 text-sm sm:text-base">{pwd}</span>
              <button 
                onClick={() => copyToClipboard(pwd, idx)}
                className="text-xs px-3 py-1.5 bg-background border border-border rounded-lg group-hover:border-brand-orange group-hover:text-brand-orange transition-colors"
              >
                {copiedIndex === idx ? 'Copied!' : 'Copy'}
              </button>
            </div>
          ))}
        </div>
      )}

    </div>
  )
}
