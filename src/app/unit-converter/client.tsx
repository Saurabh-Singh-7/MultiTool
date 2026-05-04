"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { 
  ArrowRightLeft, 
  Copy, 
  Check, 
  Scale, 
  Ruler, 
  Thermometer, 
  Maximize, 
  Droplets, 
  Database, 
  Zap,
  Wind,
  Layers,
  History,
  Trash2,
  ChevronDown
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

// --- CONVERSION DATA ---
const CATEGORIES: any = {
  length: {
    name: "Length",
    icon: Ruler,
    base: 'm',
    units: {
      m: { name: 'Meters', factor: 1 },
      km: { name: 'Kilometers', factor: 0.001 },
      cm: { name: 'Centimeters', factor: 100 },
      mm: { name: 'Millimeters', factor: 1000 },
      mi: { name: 'Miles', factor: 0.000621371 },
      yd: { name: 'Yards', factor: 1.09361 },
      ft: { name: 'Feet', factor: 3.28084 },
      in: { name: 'Inches', factor: 39.3701 },
      nmi: { name: 'Nautical Miles', factor: 0.000539957 }
    }
  },
  weight: {
    name: "Weight",
    icon: Scale,
    base: 'kg',
    units: {
      kg: { name: 'Kilograms', factor: 1 },
      g: { name: 'Grams', factor: 1000 },
      mg: { name: 'Milligrams', factor: 1000000 },
      lb: { name: 'Pounds', factor: 2.20462 },
      oz: { name: 'Ounces', factor: 35.274 },
      t: { name: 'Metric Tons', factor: 0.001 },
      st: { name: 'Stone', factor: 0.157473 }
    }
  },
  temperature: {
    name: "Temperature",
    icon: Thermometer,
    base: 'C',
    isSpecial: true,
    units: {
      C: { name: 'Celsius' },
      F: { name: 'Fahrenheit' },
      K: { name: 'Kelvin' }
    }
  },
  area: {
    name: "Area",
    icon: Maximize,
    base: 'sqm',
    units: {
      sqm: { name: 'Square Meters', factor: 1 },
      sqkm: { name: 'Square Kilometers', factor: 0.000001 },
      sqmi: { name: 'Square Miles', factor: 3.861e-7 },
      sqyd: { name: 'Square Yards', factor: 1.19599 },
      sqft: { name: 'Square Feet', factor: 10.7639 },
      sqin: { name: 'Square Inches', factor: 1550 },
      acre: { name: 'Acres', factor: 0.000247105 },
      ha: { name: 'Hectares', factor: 0.0001 }
    }
  },
  volume: {
    name: "Volume",
    icon: Droplets,
    base: 'l',
    units: {
      l: { name: 'Liters', factor: 1 },
      ml: { name: 'Milliliters', factor: 1000 },
      m3: { name: 'Cubic Meters', factor: 0.001 },
      gal: { name: 'US Gallons', factor: 0.264172 },
      qt: { name: 'US Quarts', factor: 1.05669 },
      pt: { name: 'US Pints', factor: 2.11338 },
      cup: { name: 'US Cups', factor: 4.22675 },
      floz: { name: 'Fluid Ounces', factor: 33.814 }
    }
  },
  data: {
    name: "Data",
    icon: Database,
    base: 'b',
    units: {
      b: { name: 'Bytes', factor: 1 },
      kb: { name: 'Kilobytes', factor: 1/1024 },
      mb: { name: 'Megabytes', factor: 1/Math.pow(1024, 2) },
      gb: { name: 'Gigabytes', factor: 1/Math.pow(1024, 3) },
      tb: { name: 'Terabytes', factor: 1/Math.pow(1024, 4) },
      pb: { name: 'Petabytes', factor: 1/Math.pow(1024, 5) },
      bit: { name: 'Bits', factor: 8 }
    }
  },
  speed: {
    name: "Speed",
    icon: Wind,
    base: 'mps',
    units: {
      mps: { name: 'Meters/sec', factor: 1 },
      kmh: { name: 'Kilometers/hour', factor: 3.6 },
      mph: { name: 'Miles/hour', factor: 2.23694 },
      knot: { name: 'Knots', factor: 1.94384 },
      mach: { name: 'Mach', factor: 0.00293867 }
    }
  },
  pressure: {
    name: "Pressure",
    icon: Layers,
    base: 'pa',
    units: {
      pa: { name: 'Pascal', factor: 1 },
      bar: { name: 'Bar', factor: 1e-5 },
      psi: { name: 'PSI', factor: 0.000145038 },
      atm: { name: 'Atmosphere', factor: 9.8692e-6 },
      torr: { name: 'Torr', factor: 0.00750062 }
    }
  }
}

// --- SPECIAL CONVERSION FUNCTIONS ---
const convertTemp = (val: number, from: string, to: string) => {
  let celsius = val
  if (from === 'F') celsius = (val - 32) * 5 / 9
  if (from === 'K') celsius = val - 273.15
  
  if (to === 'C') return celsius
  if (to === 'F') return (celsius * 9 / 5) + 32
  if (to === 'K') return celsius + 273.15
  return val
}

export default function UnitConverterClient() {
  const [category, setCategory] = useState('length')
  const [val1, setVal1] = useState('1')
  const [val2, setVal2] = useState('')
  const [unit1, setUnit1] = useState('m')
  const [unit2, setUnit2] = useState('ft')
  const [lastChanged, setLastChanged] = useState<1 | 2>(1)
  const [copied, setCopied] = useState<1 | 2 | null>(null)

  // Reset units when category changes
  useEffect(() => {
    const keys = Object.keys(CATEGORIES[category].units)
    setUnit1(keys[0])
    setUnit2(keys[1] || keys[0])
    setVal1('1')
    setLastChanged(1)
  }, [category])

  // Conversion Logic
  const results = useMemo(() => {
    const cat = CATEGORIES[category]
    const activeVal = lastChanged === 1 ? parseFloat(val1) || 0 : parseFloat(val2) || 0
    const fromUnit = lastChanged === 1 ? unit1 : unit2
    const toUnit = lastChanged === 1 ? unit2 : unit1

    let converted = 0
    if (cat.isSpecial && category === 'temperature') {
      converted = convertTemp(activeVal, fromUnit, toUnit)
    } else {
      // Normal conversion: normalized to base
      const unitFromData = cat.units[fromUnit]
      const unitToData = cat.units[toUnit]

      // Safety check for category switching
      if (!unitFromData || !unitToData) return { v1: val1, v2: val2 }

      const factorFrom = unitFromData.factor
      const factorTo = unitToData.factor
      const baseValue = activeVal / factorFrom
      converted = baseValue * factorTo
    }

    // Format for display
    const formatted = parseFloat(converted.toFixed(8)).toString()
    
    return {
      v1: lastChanged === 1 ? val1 : formatted,
      v2: lastChanged === 2 ? val2 : formatted
    }
  }, [category, val1, val2, unit1, unit2, lastChanged])

  // Sync state with memo results
  useEffect(() => {
    if (lastChanged === 1) setVal2(results.v2)
    else setVal1(results.v1)
  }, [results, lastChanged])

  const swap = () => {
    const u1 = unit1
    setUnit1(unit2)
    setUnit2(u1)
    setLastChanged(1)
  }

  const copyToClipboard = (v: string, id: 1 | 2) => {
    navigator.clipboard.writeText(v)
    setCopied(id)
    toast.success("Copied to clipboard!")
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {/* Category Selector */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         {Object.keys(CATEGORIES).map(key => {
            const Icon = CATEGORIES[key].icon
            return (
              <button
                key={key}
                onClick={() => setCategory(key)}
                className={cn(
                  "p-6 rounded-[2rem] border transition-all flex flex-col items-center gap-3",
                  category === key 
                    ? "bg-brand-orange text-white border-brand-orange shadow-lg shadow-brand-orange/20 scale-105 z-10" 
                    : "bg-card border-border hover:border-brand-orange/50 text-foreground"
                )}
              >
                <Icon className={cn("size-6", category === key ? "text-white" : "text-brand-orange")} />
                <span className="font-bold text-sm uppercase tracking-widest">{CATEGORIES[key].name}</span>
              </button>
            )
         })}
      </div>

      {/* Converter UI */}
      <div className="bg-card rounded-[3rem] border border-border p-8 md:p-12 shadow-2xl relative overflow-hidden">
         {/* Decorative Background Elements */}
         <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
            {React.createElement(CATEGORIES[category].icon, { className: "size-48" })}
         </div>

         <div className="relative z-10 space-y-12">
            <div className="flex flex-col md:flex-row items-center gap-6">
               {/* Field 1 */}
               <div className="w-full space-y-4">
                  <div className="flex justify-between items-center px-4">
                     <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">From</span>
                     <button onClick={() => copyToClipboard(val1, 1)} className="text-muted-foreground hover:text-brand-orange transition-colors">
                        {copied === 1 ? <Check className="size-4 text-green-500" /> : <Copy className="size-4" />}
                     </button>
                  </div>
                  <div className="relative group">
                     <Input 
                        value={val1}
                        onChange={(e) => {
                          setVal1(e.target.value)
                          setLastChanged(1)
                        }}
                        className="h-24 md:h-32 text-4xl md:text-5xl font-black rounded-[2rem] bg-muted/30 border-2 border-transparent focus:border-brand-orange transition-all pr-32"
                        placeholder="0"
                     />
                     <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <select 
                          value={unit1}
                          onChange={(e) => {
                            setUnit1(e.target.value)
                            setLastChanged(1)
                          }}
                          className="bg-[#1e293b] text-white text-xs font-bold rounded-xl px-4 py-3 outline-none appearance-none pr-10 cursor-pointer min-w-[100px]"
                        >
                           {Object.keys(CATEGORIES[category].units).map(u => (
                             <option key={u} value={u}>{CATEGORIES[category].units[u].name}</option>
                           ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-3 text-zinc-500 pointer-events-none" />
                     </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground font-medium px-4 truncate">
                    {val1} {CATEGORIES[category].units[unit1]?.name || ''}
                  </p>
               </div>

               {/* Swap Button */}
               <div className="shrink-0 flex items-center justify-center">
                  <Button 
                    onClick={swap}
                    className="size-14 rounded-full bg-brand-orange text-white shadow-xl hover:scale-110 active:scale-95 transition-all"
                  >
                     <ArrowRightLeft className="size-6" />
                  </Button>
               </div>

               {/* Field 2 */}
               <div className="w-full space-y-4">
                  <div className="flex justify-between items-center px-4">
                     <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">To</span>
                     <button onClick={() => copyToClipboard(val2, 2)} className="text-muted-foreground hover:text-brand-orange transition-colors">
                        {copied === 2 ? <Check className="size-4 text-green-500" /> : <Copy className="size-4" />}
                     </button>
                  </div>
                  <div className="relative group">
                     <Input 
                        value={val2}
                        onChange={(e) => {
                          setVal2(e.target.value)
                          setLastChanged(2)
                        }}
                        className="h-24 md:h-32 text-4xl md:text-5xl font-black rounded-[2rem] bg-muted/30 border-2 border-transparent focus:border-brand-orange transition-all pr-32"
                        placeholder="0"
                     />
                     <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <select 
                          value={unit2}
                          onChange={(e) => {
                            setUnit2(e.target.value)
                            setLastChanged(2)
                          }}
                          className="bg-[#1e293b] text-white text-xs font-bold rounded-xl px-4 py-3 outline-none appearance-none pr-10 cursor-pointer min-w-[100px]"
                        >
                           {Object.keys(CATEGORIES[category].units).map(u => (
                             <option key={u} value={u}>{CATEGORIES[category].units[u].name}</option>
                           ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-3 text-zinc-500 pointer-events-none" />
                     </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground font-medium px-4 truncate">
                    {val2} {CATEGORIES[category].units[unit2]?.name || ''}
                  </p>
               </div>
            </div>

            {/* Quick Conversion Links */}
            <div className="pt-10 border-t border-border">
               <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-6 text-center">Common Conversions</h4>
               <div className="flex flex-wrap justify-center gap-3">
                  {Object.keys(CATEGORIES[category].units).slice(0, 6).map((u, i, arr) => {
                    const next = arr[(i + 1) % arr.length]
                    if (u === next) return null
                    return (
                      <Button 
                        key={`${u}-${next}`}
                        variant="outline" 
                        size="sm" 
                        className="rounded-full text-[10px] font-bold border-muted hover:border-brand-orange hover:text-brand-orange transition-all"
                        onClick={() => {
                          setUnit1(u)
                          setUnit2(next)
                          setLastChanged(1)
                        }}
                      >
                         {CATEGORIES[category].units[u]?.name} <ArrowRightLeft className="size-3 mx-2 opacity-30" /> {CATEGORIES[category].units[next]?.name}
                      </Button>
                    )
                  })}
               </div>
            </div>
         </div>
      </div>

      {/* Info Grid */}
      <div className="grid md:grid-cols-3 gap-8">
         <div className="p-8 bg-card border border-border rounded-[2.5rem] space-y-4">
            <div className="size-12 bg-brand-orange/10 rounded-2xl flex items-center justify-center text-brand-orange">
               <Scale className="size-6" />
            </div>
            <h4 className="font-bold">Mass & Weight</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Quickly convert between Metric units like Kilograms and Grams, or Imperial units like Pounds and Ounces.
            </p>
         </div>
         <div className="p-8 bg-card border border-border rounded-[2.5rem] space-y-4">
            <div className="size-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500">
               <Thermometer className="size-6" />
            </div>
            <h4 className="font-bold">Temperature</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              High-precision temperature conversion between Celsius, Fahrenheit, and Kelvin for scientific and daily use.
            </p>
         </div>
         <div className="p-8 bg-card border border-border rounded-[2.5rem] space-y-4">
            <div className="size-12 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-500">
               <Ruler className="size-6" />
            </div>
            <h4 className="font-bold">Length & Distance</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Convert anything from Millimeters to Nautical Miles with scientific-grade accuracy and instant updates.
            </p>
         </div>
      </div>
    </div>
  )
}
