"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react'
import * as math from 'mathjs'
import { 
  History, 
  Trash2, 
  Settings, 
  HelpCircle, 
  ChevronDown, 
  ChevronRight, 
  Maximize2, 
  RotateCcw,
  Keyboard,
  Info,
  BookOpen,
  Scale,
  Delete,
  ArrowLeft
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

type AngleMode = 'DEG' | 'RAD' | 'GRAD'

interface HistoryItem {
  expression: string
  result: string
  timestamp: number
}

export default function ScientificCalculatorClient() {
  const [expression, setExpression] = useState('')
  const [result, setResult] = useState('')
  const [lastAnswer, setLastAnswer] = useState('0')
  const [angleMode, setAngleMode] = useState<AngleMode>('DEG')
  const [isSecond, setIsSecond] = useState(false)
  const [memory, setMemory] = useState(0)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [activeButton, setActiveButton] = useState<string | null>(null)
  const [historyLoaded, setHistoryLoaded] = useState(false)
  
  // Panels
  const [showHistory, setShowHistory] = useState(true)
  const [showSteps, setShowSteps] = useState(false)
  const [steps, setSteps] = useState<string[]>([])

  const displayRef = useRef<HTMLDivElement>(null)

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('calc_history')
    if (saved) {
      try {
        setHistory(JSON.parse(saved))
      } catch (e) {
        console.error("Failed to parse history", e)
      }
    }
    setHistoryLoaded(true)
  }, [])

  // Save history
  useEffect(() => {
    if (historyLoaded) {
      localStorage.setItem('calc_history', JSON.stringify(history.slice(0, 20)))
    }
  }, [history, historyLoaded])

  // Helpers for Angle Conversion
  const toRad = (angle: number, mode: AngleMode) => {
    if (mode === 'DEG') return angle * (Math.PI / 180)
    if (mode === 'GRAD') return angle * (Math.PI / 200)
    return angle
  }

  const fromRad = (rad: number, mode: AngleMode) => {
    if (mode === 'DEG') return rad * (180 / Math.PI)
    if (mode === 'GRAD') return rad * (200 / Math.PI)
    return rad
  }

  // Evaluation logic
  const evaluate = useCallback((expr: string, isFinal = false) => {
    if (!expr) {
      setResult('')
      setSteps([])
      return
    }

    try {
      // Create a scope with angle-aware functions using mathjs internal logic
      const scope = {
        sin: (x: any) => {
          const val = typeof x === 'number' ? x : math.number(x)
          const unit = angleMode === 'DEG' ? 'deg' : angleMode === 'GRAD' ? 'grad' : 'rad'
          return math.sin(math.unit(val, unit))
        },
        cos: (x: any) => {
          const val = typeof x === 'number' ? x : math.number(x)
          const unit = angleMode === 'DEG' ? 'deg' : angleMode === 'GRAD' ? 'grad' : 'rad'
          return math.cos(math.unit(val, unit))
        },
        tan: (x: any) => {
          const val = typeof x === 'number' ? x : math.number(x)
          const unit = angleMode === 'DEG' ? 'deg' : angleMode === 'GRAD' ? 'grad' : 'rad'
          const res = math.tan(math.unit(val, unit))
          if (Math.abs(res) > 1e14) return Infinity
          return res
        },
        asin: (x: any) => {
          const val = typeof x === 'number' ? x : math.number(x)
          const res = math.asin(val)
          if (angleMode === 'RAD') return res
          return math.unit(res, 'rad').toNumber(angleMode === 'DEG' ? 'deg' : 'grad')
        },
        acos: (x: any) => {
          const val = typeof x === 'number' ? x : math.number(x)
          const res = math.acos(val)
          if (angleMode === 'RAD') return res
          return math.unit(res, 'rad').toNumber(angleMode === 'DEG' ? 'deg' : 'grad')
        },
        atan: (x: any) => {
          const val = typeof x === 'number' ? x : math.number(x)
          const res = math.atan(val)
          if (angleMode === 'RAD') return res
          return math.unit(res, 'rad').toNumber(angleMode === 'DEG' ? 'deg' : 'grad')
        },
        log: (x: any) => math.log10(x),
        ln: (x: any) => math.log(x),
        log2: (x: any) => math.log2(x),
        sqrt: (x: any) => math.sqrt(x),
        cbrt: (x: any) => math.cbrt(x),
        fact: (x: any) => math.factorial(x),
        pi: Math.PI,
        e: Math.E,
        ans: parseFloat(lastAnswer)
      }

      // Cleanup expression for mathjs
      let cleanExpr = expr
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/π/g, 'pi')
        .replace(/\^/g, '^')
        .replace(/mod/g, '%')
        
      const res = math.evaluate(cleanExpr, scope)
      
      let formattedResult = ''
      if (res !== undefined && res !== null) {
        formattedResult = math.format(res, {
          precision: 10,
          upperExp: 10,
          lowerExp: -10
        })
        
        // Final cleanup for infinity/NaN
        if (formattedResult === 'NaN') formattedResult = 'Undefined'
        if (formattedResult === 'Infinity') formattedResult = 'Overflow'
      }

      setResult(formattedResult)

      if (isFinal && formattedResult !== 'Syntax Error' && formattedResult !== 'Undefined') {
        setLastAnswer(formattedResult)
        setHistory(prev => [{ expression: expr, result: formattedResult, timestamp: Date.now() }, ...prev])
        // Basic steps generation logic
        if (showSteps) {
           generateSteps(expr, formattedResult)
        }
      }

    } catch (err) {
      if (isFinal) setResult('Syntax Error')
    }
  }, [angleMode, lastAnswer, showSteps])

  const generateSteps = (expr: string, final: string) => {
    const s = [`Expression: ${expr}`]
    // Very basic heuristic for demo
    if (expr.includes('sin')) s.push(`Step 1: Calculate trigonometric values in ${angleMode}`)
    if (expr.includes('^')) s.push(`Step 2: Evaluate exponents and powers`)
    if (expr.includes('*') || expr.includes('/')) s.push(`Step 3: Perform multiplication and division`)
    s.push(`Final Result: ${final}`)
    setSteps(s)
  }

  const append = (val: string) => {
    setExpression(prev => prev + val)
    evaluate(expression + val)
  }

  const handleAction = (action: string) => {
    setActiveButton(action)
    setTimeout(() => setActiveButton(null), 100)

    switch (action) {
      case '=':
        evaluate(expression, true)
        setExpression(result)
        setResult('')
        break
      case 'C':
        setExpression('')
        setResult('')
        setSteps([])
        break
      case 'CE':
        // Find last operand/operator and remove it? 
        // For simplicity just C for now or last char
        setExpression(prev => prev.slice(0, -1))
        break
      case '⌫':
        setExpression(prev => prev.slice(0, -1))
        break
      case '±':
        if (expression.startsWith('-')) setExpression(prev => prev.slice(1))
        else setExpression(prev => '-' + prev)
        break
      case '1/':
        if (expression) {
           setExpression(`1/(${expression})`)
           evaluate(`1/(${expression})`)
        } else {
           append('1/')
        }
        break
      case 'MC': setMemory(0); toast.info("Memory Cleared"); break
      case 'MR': append(memory.toString()); break
      case 'M+': setMemory(prev => prev + parseFloat(result || '0')); toast.success("Added to Memory"); break
      case 'M-': setMemory(prev => prev - parseFloat(result || '0')); toast.success("Subtracted from Memory"); break
      case 'MS': setMemory(parseFloat(result || '0')); toast.success("Stored in Memory"); break
      case 'DEG': setAngleMode('DEG'); break
      case 'RAD': setAngleMode('RAD'); break
      case 'GRAD': setAngleMode('GRAD'); break
      case '2nd': setIsSecond(!isSecond); break
      default:
        append(action)
    }
  }

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key
      if (/[0-9]/.test(key)) handleAction(key)
      else if (key === '.') handleAction('.')
      else if (key === '+') handleAction('+')
      else if (key === '-') handleAction('-')
      else if (key === '*') handleAction('×')
      else if (key === '/') handleAction('÷')
      else if (key === 'Enter') { e.preventDefault(); handleAction('=') }
      else if (key === 'Backspace') handleAction('⌫')
      else if (key === 'Escape') handleAction('C')
      else if (key === 'Delete') handleAction('CE')
      else if (key === '^') handleAction('^')
      else if (key === '(') handleAction('(')
      else if (key === ')') handleAction(')')
      else if (key === 's') handleAction(isSecond ? 'asin(' : 'sin(')
      else if (key === 'c') handleAction(isSecond ? 'acos(' : 'cos(')
      else if (key === 't') handleAction(isSecond ? 'atan(' : 'tan(')
      else if (key === 'l') handleAction('log(')
      else if (key === 'n') handleAction('ln(')
      else if (key === 'r') handleAction('sqrt(')
      else if (key === 'p') handleAction('π')
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isSecond, expression, result])

  const buttons = [
    // Row 0
    { label: angleMode, action: angleMode === 'DEG' ? 'RAD' : angleMode === 'RAD' ? 'GRAD' : 'DEG', color: 'gray-dark' },
    { label: '2nd', action: '2nd', color: isSecond ? 'blue' : 'gray-dark' },
    { label: 'MC', action: 'MC', color: 'gray-light' },
    { label: 'MR', action: 'MR', color: 'gray-light' },
    { label: 'MS', action: 'MS', color: 'gray-light' },

    // Row 1
    { label: isSecond ? 'sin⁻¹' : 'sin', action: isSecond ? 'asin(' : 'sin(', color: 'gray' },
    { label: isSecond ? 'cos⁻¹' : 'cos', action: isSecond ? 'acos(' : 'cos(', color: 'gray' },
    { label: isSecond ? 'tan⁻¹' : 'tan', action: isSecond ? 'atan(' : 'tan(', color: 'gray' },
    { label: isSecond ? '2π' : 'π', action: isSecond ? '2*π' : 'π', color: 'gray' },
    { label: isSecond ? 'e²' : 'e', action: isSecond ? 'e^2' : 'e', color: 'gray' },

    // Row 2
    { label: isSecond ? '10ˣ' : 'log', action: isSecond ? '10^' : 'log(', color: 'gray' },
    { label: isSecond ? 'eˣ' : 'ln', action: isSecond ? 'e^' : 'ln(', color: 'gray' },
    { label: isSecond ? 'x³' : 'x²', action: isSecond ? '^3' : '^2', color: 'gray' },
    { label: '^', action: '^', color: 'gray' },
    { label: isSecond ? '∛' : '√', action: isSecond ? 'cbrt(' : 'sqrt(', color: 'gray' },

    // Row 3
    { label: '(', action: '(', color: 'gray-light' },
    { label: ')', action: ')', color: 'gray-light' },
    { label: 'x!', action: '!', color: 'gray-light' },
    { label: 'mod', action: 'mod', color: 'gray-light' },
    { label: '⌫', action: '⌫', color: 'orange-muted' },

    // Row 4 (7-9)
    { label: '7', action: '7', color: 'num' },
    { label: '8', action: '8', color: 'num' },
    { label: '9', action: '9', color: 'num' },
    { label: '÷', action: '÷', color: 'orange' },
    { label: 'C', action: 'C', color: 'gray-light' },

    // Row 5 (4-6)
    { label: '4', action: '4', color: 'num' },
    { label: '5', action: '5', color: 'num' },
    { label: '6', action: '6', color: 'num' },
    { label: '×', action: '×', color: 'orange' },
    { label: '1/x', action: '1/', color: 'gray-light' }, // In simple calculators we wrap, here we append 1/

    // Row 6 (1-3)
    { label: '1', action: '1', color: 'num' },
    { label: '2', action: '2', color: 'num' },
    { label: '3', action: '3', color: 'num' },
    { label: '−', action: '-', color: 'orange' },
    { label: 'EXP', action: 'e+', color: 'gray-light' },

    // Row 7 (0, ., ANS, +, =)
    { label: '0', action: '0', color: 'num' },
    { label: '.', action: '.', color: 'num' },
    { label: 'ANS', action: 'ANS', color: 'gray-light' },
    { label: '+', action: '+', color: 'orange' },
    { label: '=', action: '=', color: 'orange-large' },
  ]

  return (
    <div className="grid lg:grid-cols-12 gap-8 items-start">
      {/* Calculator Main */}
      <div className="lg:col-span-7 xl:col-span-8 flex justify-center">
        <div className="w-full max-w-[420px] bg-[#1e293b] rounded-[2.5rem] p-6 shadow-2xl border-8 border-zinc-800 ring-4 ring-black/20">
           {/* Display */}
           <div className="bg-black/90 rounded-[1.5rem] p-6 mb-6 shadow-inner relative overflow-hidden h-40 flex flex-col justify-between border-2 border-white/5">
              {/* Scanline Effect */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent pointer-events-none" />
              
              <div className="flex justify-between items-start z-10">
                 <div className="flex gap-2">
                    <Badge variant="outline" className="bg-brand-orange/20 text-brand-orange border-brand-orange/30 font-mono text-[10px] px-1.5 py-0">
                       {angleMode}
                    </Badge>
                    {memory !== 0 && (
                       <Badge variant="outline" className="bg-green-500/20 text-green-500 border-green-500/30 font-mono text-[10px] px-1.5 py-0">
                          M
                       </Badge>
                    )}
                 </div>
                 <div className="text-zinc-500 font-mono text-xs uppercase tracking-widest">
                    {isSecond ? 'Shift Active' : 'ToolHive SC-1'}
                 </div>
              </div>

              <div className="space-y-1 text-right z-10 overflow-hidden">
                 <p className="text-zinc-400 font-mono text-sm truncate min-h-[1.25rem]">
                    {expression || ' '}
                 </p>
                 <h2 className={cn(
                    "font-mono text-4xl font-bold tracking-tight truncate",
                    result === 'Syntax Error' || result === 'Overflow' || result === 'Undefined' ? "text-red-500" : "text-white"
                 )}>
                    {result ? '= ' + result : (expression ? '' : '0')}
                 </h2>
              </div>

              <div className="flex justify-between items-center text-[10px] font-mono text-zinc-600 border-t border-white/5 pt-2">
                 <span>MATH ENGINE V1.2</span>
                 <span>ANS: {lastAnswer}</span>
              </div>
           </div>

           {/* Button Grid */}
           <div className="grid grid-cols-5 gap-3">
              {buttons.map((btn, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAction(btn.action)}
                  className={cn(
                    "relative h-12 rounded-xl font-bold text-sm transition-all active:scale-95 flex items-center justify-center group overflow-hidden",
                    // Numbers
                    btn.color === 'num' && "bg-[#334155] text-white hover:bg-[#475569]",
                    // Operators
                    btn.color === 'orange' && "bg-brand-orange/20 text-brand-orange hover:bg-brand-orange hover:text-white border border-brand-orange/20",
                    // Large Equals
                    btn.color === 'orange-large' && "bg-brand-orange text-white hover:bg-brand-orange/90 shadow-lg shadow-brand-orange/20",
                    // Special
                    btn.color === 'orange-muted' && "bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white",
                    // Functions
                    btn.color === 'gray' && "bg-[#475569]/30 text-zinc-300 hover:bg-[#475569] hover:text-white",
                    // Memory/Clear
                    btn.color === 'gray-light' && "bg-zinc-700/50 text-zinc-400 hover:bg-zinc-600 hover:text-white",
                    // Mode
                    btn.color === 'gray-dark' && "bg-zinc-800 text-zinc-500 hover:text-brand-orange",
                    // 2nd Active
                    btn.color === 'blue' && "bg-blue-600 text-white shadow-lg shadow-blue-600/30",
                    // Active Keyboard highlight
                    activeButton === btn.action && "ring-2 ring-white scale-95"
                  )}
                >
                  <span className="z-10">{btn.label}</span>
                  <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
           </div>

           {/* Quick Actions Footer */}
           <div className="mt-8 flex gap-3">
              <Button variant="ghost" size="sm" className="w-full text-zinc-500 hover:text-white rounded-xl bg-white/5" onClick={() => setShowHistory(!showHistory)}>
                 <History className="size-4 mr-2" /> History
              </Button>
              <Button variant="ghost" size="sm" className="w-full text-zinc-500 hover:text-white rounded-xl bg-white/5" onClick={() => setShowSteps(!showSteps)}>
                 <BookOpen className="size-4 mr-2" /> {showSteps ? 'Hide Steps' : 'Show Steps'}
              </Button>
           </div>
        </div>
      </div>

      {/* Side Panel: History & Steps */}
      <div className="lg:col-span-5 xl:col-span-4 space-y-8">
        {showHistory && (
          <div className="bg-card rounded-[2.5rem] border border-border p-8 shadow-xl min-h-[300px] flex flex-col">
             <div className="flex items-center justify-between mb-6 border-b border-border pb-4">
                <h3 className="font-bold font-syne text-xl flex items-center gap-2">
                   <History className="size-5 text-brand-orange" /> History
                </h3>
                <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-red-500" onClick={() => setHistory([])}>
                   <Trash2 className="size-4" />
                </Button>
             </div>
             
             <div className="space-y-4 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                {history.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                     <RotateCcw className="size-10 mx-auto mb-4 opacity-20" />
                     <p className="text-sm italic">No recent calculations</p>
                  </div>
                ) : (
                  history.map((item, idx) => (
                    <div 
                      key={idx} 
                      className="group p-4 bg-muted/20 rounded-2xl border border-border hover:border-brand-orange/30 cursor-pointer transition-all"
                      onClick={() => {setExpression(item.expression); evaluate(item.expression);}}
                    >
                       <p className="text-xs font-mono text-muted-foreground mb-1 group-hover:text-brand-orange">{item.expression}</p>
                       <p className="text-lg font-mono font-bold">{item.result}</p>
                    </div>
                  ))
                )}
             </div>
          </div>
        )}

        {showSteps && steps.length > 0 && (
           <div className="bg-brand-orange/5 rounded-[2.5rem] border border-brand-orange/20 p-8 shadow-xl animate-in fade-in slide-in-from-right-8">
              <h3 className="font-bold font-syne text-xl mb-6 flex items-center gap-2 text-brand-orange">
                 <BookOpen className="size-5" /> Calculation Steps
              </h3>
              <div className="space-y-4">
                 {steps.map((step, idx) => (
                    <div key={idx} className="flex gap-4">
                       <div className="w-6 h-6 rounded-full bg-brand-orange text-white flex items-center justify-center shrink-0 text-[10px] font-bold mt-0.5">
                          {idx + 1}
                       </div>
                       <p className="text-sm font-medium text-muted-foreground leading-relaxed">{step}</p>
                    </div>
                 ))}
              </div>
           </div>
        )}

        <div className="bg-card rounded-[2.5rem] border border-border p-8 shadow-xl">
           <h3 className="font-bold font-syne text-xl mb-6 flex items-center gap-2">
              <Keyboard className="size-5 text-brand-orange" /> Keyboard Support
           </h3>
           <div className="grid grid-cols-2 gap-x-8 gap-y-3">
              {[
                { k: '0-9', v: 'Numbers' },
                { k: 'Enter', v: 'Evaluate' },
                { k: 'Esc', v: 'Clear All' },
                { k: 'Backsp', v: 'Delete' },
                { k: 's / c / t', v: 'sin/cos/tan' },
                { k: 'p', v: 'Pi (π)' },
                { k: 'r', v: 'Square Root' },
                { k: '^', v: 'Power' }
              ].map(item => (
                <div key={item.k} className="flex justify-between items-center py-1 border-b border-border/50">
                   <kbd className="px-2 py-0.5 bg-muted rounded border border-border text-[10px] font-mono font-bold shadow-sm">{item.k}</kbd>
                   <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{item.v}</span>
                </div>
              ))}
           </div>
        </div>
      </div>

      {/* Unit Converter Mini */}
      <div className="lg:col-span-12 mt-8">
         <div className="bg-card rounded-[3rem] border border-border p-10 shadow-xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
               <Scale className="size-40" />
            </div>
            
            <div className="relative z-10 flex flex-col md:flex-row gap-12 items-center">
               <div className="md:w-1/3">
                  <Badge className="bg-brand-orange/10 text-brand-orange hover:bg-brand-orange/20 border-none mb-4">Utility Module</Badge>
                  <h3 className="text-3xl font-bold font-syne mb-4">Angle & Math Utilities</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                     Quickly convert between different mathematical units or insert common physical constants into your calculations.
                  </p>
               </div>
               
               <div className="flex-1 grid md:grid-cols-2 gap-8 w-full">
                  <div className="space-y-4">
                     <p className="text-xs font-black uppercase tracking-widest text-brand-orange">Angle Converter</p>
                     <div className="flex items-center gap-4 bg-muted/30 p-2 rounded-2xl border border-border">
                        <input type="number" defaultValue="90" className="bg-transparent font-mono font-bold outline-none px-4 w-20" />
                        <div className="h-8 w-px bg-border" />
                        <div className="flex-1 flex justify-between items-center px-2">
                           <span className="text-sm font-bold">Degrees</span>
                           <ArrowLeft className="size-4 text-muted-foreground rotate-180" />
                           <span className="text-sm font-bold text-brand-orange">1.5708 Rad</span>
                        </div>
                     </div>
                  </div>

                  <div className="space-y-4">
                     <p className="text-xs font-black uppercase tracking-widest text-brand-orange">Common Constants</p>
                     <div className="flex flex-wrap gap-2">
                        {[
                          { label: 'π (Pi)', val: '3.14159' },
                          { label: 'e (Euler)', val: '2.71828' },
                          { label: 'φ (Golden)', val: '1.61803' },
                          { label: 'c (Light)', val: '299792458' }
                        ].map(c => (
                          <button 
                            key={c.label} 
                            onClick={() => append(c.val)}
                            className="px-4 py-2 bg-muted/50 rounded-xl border border-border text-xs font-bold hover:bg-brand-orange hover:text-white transition-all shadow-sm"
                          >
                             {c.label}
                          </button>
                        ))}
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  )
}
