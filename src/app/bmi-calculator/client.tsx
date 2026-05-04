"use client"

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts'
import { 
  User, 
  UserPlus, 
  Scale, 
  ArrowUp, 
  ArrowDown, 
  CheckCircle2, 
  AlertTriangle, 
  History, 
  Trash2, 
  Download, 
  Printer, 
  ChevronRight,
  Info,
  Calendar,
  Activity,
  Zap,
  Dna,
  TrendingUp
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

// Helper for Number Formatting
const formatNum = (num: number, decimals = 1) => {
  return num.toLocaleString('en-IN', {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals
  })
}

export default function BMICalculatorClient() {
  // --- STATE ---
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric')
  const [gender, setGender] = useState<'male' | 'female'>('male')
  const [age, setAge] = useState(25)
  const [standard, setStandard] = useState<'who' | 'asian'>('who')
  
  // Metric State
  const [heightCm, setHeightCm] = useState(170)
  const [weightKg, setWeightKg] = useState(70)
  
  // Imperial State (derived/stored for form)
  const [heightFt, setHeightFt] = useState(5)
  const [heightIn, setHeightIn] = useState(7)
  const [weightLbs, setWeightLbs] = useState(154)

  const [activityLevel, setActivityLevel] = useState(1.55) // Moderate default
  const [history, setHistory] = useState<any[]>([])

  // --- PERSISTENCE ---
  useEffect(() => {
    const saved = localStorage.getItem('bmi_history')
    if (saved) setHistory(JSON.parse(saved))
  }, [])

  const saveToHistory = () => {
    const entry = {
      id: Date.now(),
      date: new Date().toLocaleDateString('en-IN'),
      bmi: results.bmi,
      weight: unitSystem === 'metric' ? `${weightKg} kg` : `${weightLbs} lbs`,
      height: unitSystem === 'metric' ? `${heightCm} cm` : `${heightFt}'${heightIn}"`,
      category: results.category.category
    }
    const newHistory = [entry, ...history].slice(0, 50)
    setHistory(newHistory)
    localStorage.setItem('bmi_history', JSON.stringify(newHistory))
    toast.success("BMI entry saved to history!")
  }

  const clearHistory = () => {
    setHistory([])
    localStorage.removeItem('bmi_history')
    toast.info("History cleared")
  }

  // --- LOGIC ---
  const results = useMemo(() => {
    const hM = heightCm / 100
    if (hM <= 0) return null
    
    const bmi = weightKg / (hM * hM)
    const roundedBmi = Math.round(bmi * 10) / 10

    // WHO Standard
    const getWHO = (b: number) => {
      if (b < 16) return { category: 'Severely Underweight', color: '#3b82f6', emoji: '⚠️' }
      if (b < 17) return { category: 'Moderately Underweight', color: '#60a5fa', emoji: '⚠️' }
      if (b < 18.5) return { category: 'Mildly Underweight', color: '#93c5fd', emoji: '📉' }
      if (b < 25) return { category: 'Normal Weight', color: '#22c55e', emoji: '✅' }
      if (b < 30) return { category: 'Overweight', color: '#eab308', emoji: '📈' }
      if (b < 35) return { category: 'Obese Class I', color: '#f97316', emoji: '⚠️' }
      if (b < 40) return { category: 'Obese Class II', color: '#dc2626', emoji: '⚠️' }
      return { category: 'Obese Class III', color: '#7f1d1d', emoji: '🚨' }
    }

    // Asian Standard
    const getAsian = (b: number) => {
      if (b < 18.5) return { category: 'Underweight', color: '#93c5fd', emoji: '📉' }
      if (b < 23) return { category: 'Normal Weight', color: '#22c55e', emoji: '✅' }
      if (b < 27.5) return { category: 'Overweight', color: '#f97316', emoji: '📈' }
      return { category: 'Obese', color: '#dc2626', emoji: '🚨' }
    }

    const category = standard === 'who' ? getWHO(roundedBmi) : getAsian(roundedBmi)

    // Ideal Weight (BMI 18.5 - 24.9)
    const minIdeal = 18.5 * (hM * hM)
    const maxIdeal = 24.9 * (hM * hM)
    const diff = weightKg > maxIdeal ? weightKg - maxIdeal : weightKg < minIdeal ? minIdeal - weightKg : 0

    // Additional Metrics
    const gNum = gender === 'male' ? 1 : 0
    const bodyFat = (1.20 * roundedBmi) + (0.23 * age) - (10.8 * gNum) - 5.4
    
    // BMR (Harris-Benedict)
    let bmr = 0
    if (gender === 'male') {
      bmr = 88.362 + (13.397 * weightKg) + (4.799 * heightCm) - (5.677 * age)
    } else {
      bmr = 447.593 + (9.247 * weightKg) + (3.098 * heightCm) - (4.330 * age)
    }

    // Ideal Weights
    const hIn = heightCm / 2.54
    const baseH = hIn - 60
    const devine = gender === 'male' ? 50 + 2.3 * baseH : 45.5 + 2.3 * baseH
    const robinson = gender === 'male' ? 52 + 1.9 * baseH : 49 + 1.7 * baseH
    const miller = gender === 'male' ? 56.2 + 1.41 * baseH : 53.1 + 1.36 * baseH

    return {
      bmi: roundedBmi,
      category,
      ideal: { min: minIdeal, max: maxIdeal, diff },
      bodyFat: Math.max(0, Math.round(bodyFat * 10) / 10),
      bmr: Math.round(bmr),
      tdee: Math.round(bmr * activityLevel),
      formulas: { devine, robinson, miller, avg: (devine + robinson + miller) / 3 }
    }
  }, [heightCm, weightKg, age, gender, standard, activityLevel])

  // --- UNIT SYNC ---
  useEffect(() => {
    if (unitSystem === 'metric') {
      const hTotalIn = (heightFt * 12) + heightIn
      const newCm = hTotalIn * 2.54
      const newKg = weightLbs * 0.453592
      setHeightCm(Math.round(newCm))
      setWeightKg(Math.round(newKg))
    } else {
      const totalIn = heightCm / 2.54
      setHeightFt(Math.floor(totalIn / 12))
      setHeightIn(Math.round(totalIn % 12))
      setWeightLbs(Math.round(weightKg / 0.453592))
    }
  }, [unitSystem])

  // --- SVG GAUGE COMPONENT ---
  const BMIGauge = ({ bmi }: { bmi: number }) => {
    const minBMI = 10, maxBMI = 45
    const clampedBmi = Math.min(maxBMI, Math.max(minBMI, bmi))
    const angle = ((clampedBmi - minBMI) / (maxBMI - minBMI)) * 180 - 180 // -180 to 0 degrees for bottom arc? No, -180 to 0 for top.
    
    // Polar to Cartesian
    const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
      const angleInRadians = (angleInDegrees - 180) * Math.PI / 180.0
      return {
        x: centerX + (radius * Math.cos(angleInRadians)),
        y: centerY + (radius * Math.sin(angleInRadians))
      }
    }

    const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
      const start = polarToCartesian(x, y, radius, endAngle)
      const end = polarToCartesian(x, y, radius, startAngle)
      const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1"
      return [
        "M", start.x, start.y, 
        "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
      ].join(" ")
    }

    const zones = [
      { start: 10, end: 16,   color: '#3b82f6' },
      { start: 16, end: 18.5, color: '#ef4444' },
      { start: 18.5,end: 25,  color: '#22c55e' },
      { start: 25, end: 30,   color: '#eab308' },
      { start: 30, end: 35,   color: '#f97316' },
      { start: 35, end: 45,   color: '#dc2626' },
    ]

    const needleAngle = ((clampedBmi - minBMI) / (maxBMI - minBMI)) * 180

    return (
      <div className="relative flex flex-col items-center">
        <svg viewBox="0 0 200 120" className="w-full max-w-[350px]">
          {zones.map(zone => (
            <path
              key={zone.start}
              d={describeArc(100, 110, 80, ((zone.start - 10) / 35) * 180, ((zone.end - 10) / 35) * 180)}
              fill="none"
              stroke={zone.color}
              strokeWidth="20"
              className="transition-all duration-500"
            />
          ))}
          {/* Needle */}
          <g transform={`rotate(${needleAngle - 180}, 100, 110)`} className="transition-transform duration-1000 ease-out">
            <line x1="100" y1="110" x2="30" y2="110" stroke="white" strokeWidth="3" strokeLinecap="round" />
            <circle cx="100" cy="110" r="4" fill="white" />
          </g>
          <text x="100" y="100" textAnchor="middle" fill="white" className="text-3xl font-black font-syne">{bmi}</text>
        </svg>
        <div className="flex justify-between w-full max-w-[350px] px-2 text-[10px] text-muted-foreground font-bold uppercase mt-2">
           <span>Under</span>
           <span>Normal</span>
           <span>Over</span>
           <span>Obese</span>
        </div>
      </div>
    )
  }

  const exportCSV = () => {
    if (history.length === 0) return
    const headers = "Date,Weight,Height,BMI,Category\n"
    const rows = history.map(h => `${h.date},${h.weight},${h.height},${h.bmi},${h.category}`).join("\n")
    const blob = new Blob([headers + rows], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = "BMI_History_ToolHive.csv"
    a.click()
    toast.success("History exported as CSV")
  }

  if (!results) return null

  return (
    <div className="grid lg:grid-cols-12 gap-8">
      {/* Left Column: Form */}
      <div className="lg:col-span-5 space-y-8">
        <div className="bg-card rounded-[3rem] border border-border p-8 shadow-xl">
           {/* Unit Toggle */}
           <div className="flex bg-muted p-1.5 rounded-2xl mb-10">
              <Button 
                variant={unitSystem === 'metric' ? 'default' : 'ghost'} 
                className={cn("flex-1 rounded-xl h-12 font-bold", unitSystem === 'metric' && "bg-brand-orange text-white")}
                onClick={() => setUnitSystem('metric')}
              >
                📏 Metric
              </Button>
              <Button 
                variant={unitSystem === 'imperial' ? 'default' : 'ghost'} 
                className={cn("flex-1 rounded-xl h-12 font-bold", unitSystem === 'imperial' && "bg-brand-orange text-white")}
                onClick={() => setUnitSystem('imperial')}
              >
                📐 Imperial
              </Button>
           </div>

           <div className="space-y-10">
              {/* Gender */}
              <div className="space-y-4">
                 <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Gender</label>
                 <div className="flex gap-4">
                    <Button 
                      variant={gender === 'male' ? 'default' : 'outline'}
                      className={cn("flex-1 rounded-2xl h-14 font-black border-2", gender === 'male' ? "bg-brand-orange text-white border-brand-orange" : "hover:border-brand-orange/50")}
                      onClick={() => setGender('male')}
                    >
                      👨 Male
                    </Button>
                    <Button 
                      variant={gender === 'female' ? 'default' : 'outline'}
                      className={cn("flex-1 rounded-2xl h-14 font-black border-2", gender === 'female' ? "bg-brand-orange text-white border-brand-orange" : "hover:border-brand-orange/50")}
                      onClick={() => setGender('female')}
                    >
                      👩 Female
                    </Button>
                 </div>
              </div>

              {/* Age */}
              <div className="space-y-6">
                 <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Age (Years)</label>
                    <div className="bg-muted/50 px-4 py-2 rounded-xl border border-border font-black text-lg">
                       {age}
                    </div>
                 </div>
                 <div className="relative h-10 flex items-center group">
                    <div className="absolute w-full h-1.5 bg-muted rounded-full pointer-events-none">
                       <div className="h-full bg-brand-orange/20 rounded-full" style={{ width: `${((age - 2) / 98) * 100}%` }} />
                    </div>
                    <input 
                       type="range"
                       value={age}
                       onChange={(e) => setAge(Number(e.target.value))}
                       min={2}
                       max={100}
                       step={1}
                       className="relative w-full h-full bg-transparent appearance-none cursor-pointer outline-none z-10
                       [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand-orange [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110
                       [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-brand-orange [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-md"
                    />
                 </div>
                 {age < 18 && (
                   <div className="p-3 bg-blue-500/5 border border-blue-500/20 rounded-xl flex items-start gap-3">
                      <Info className="size-4 text-blue-500 mt-0.5 shrink-0" />
                      <p className="text-[10px] text-blue-600 leading-tight">Note: For children (2-17), BMI interpretation uses growth percentiles rather than fixed adult categories.</p>
                   </div>
                 )}
              </div>

              {/* Height */}
              <div className="space-y-6">
                 <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Height</label>
                    <div className="flex items-center gap-2">
                       {unitSystem === 'metric' ? (
                          <div className="bg-muted/50 px-4 py-2 rounded-xl border border-border font-black text-lg">
                             {heightCm} <span className="text-[10px] text-muted-foreground">CM</span>
                          </div>
                       ) : (
                          <div className="flex gap-2">
                             <div className="bg-muted/50 px-3 py-2 rounded-xl border border-border font-black">
                                {heightFt} <span className="text-[10px] text-muted-foreground italic">FT</span>
                             </div>
                             <div className="bg-muted/50 px-3 py-2 rounded-xl border border-border font-black">
                                {heightIn} <span className="text-[10px] text-muted-foreground italic">IN</span>
                             </div>
                          </div>
                       )}
                    </div>
                 </div>
                 {unitSystem === 'metric' ? (
                   <div className="relative h-10 flex items-center group">
                      <div className="absolute w-full h-1.5 bg-muted rounded-full pointer-events-none">
                         <div className="h-full bg-brand-orange/20 rounded-full" style={{ width: `${((heightCm - 100) / 150) * 100}%` }} />
                      </div>
                      <input 
                         type="range"
                         value={heightCm}
                         onChange={(e) => setHeightCm(Number(e.target.value))}
                         min={100}
                         max={250}
                         step={1}
                         className="relative w-full h-full bg-transparent appearance-none cursor-pointer outline-none z-10
                         [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand-orange [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110
                         [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-brand-orange [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-md"
                      />
                   </div>
                 ) : (
                   <div className="grid grid-cols-2 gap-4">
                      <div className="relative h-10 flex items-center group">
                         <div className="absolute w-full h-1.5 bg-muted rounded-full pointer-events-none">
                            <div className="h-full bg-brand-orange/20 rounded-full" style={{ width: `${((heightFt - 1) / 7) * 100}%` }} />
                         </div>
                         <input 
                            type="range"
                            value={heightFt}
                            onChange={(e) => setHeightFt(Number(e.target.value))}
                            min={1}
                            max={8}
                            step={1}
                            className="relative w-full h-full bg-transparent appearance-none cursor-pointer outline-none z-10
                            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand-orange [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110
                            [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-brand-orange [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-md"
                         />
                      </div>
                      <div className="relative h-10 flex items-center group">
                         <div className="absolute w-full h-1.5 bg-muted rounded-full pointer-events-none">
                            <div className="h-full bg-brand-orange/20 rounded-full" style={{ width: `${(heightIn / 11) * 100}%` }} />
                         </div>
                         <input 
                            type="range"
                            value={heightIn}
                            onChange={(e) => setHeightIn(Number(e.target.value))}
                            min={0}
                            max={11}
                            step={1}
                            className="relative w-full h-full bg-transparent appearance-none cursor-pointer outline-none z-10
                            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand-orange [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110
                            [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-brand-orange [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-md"
                         />
                      </div>
                   </div>
                 )}
              </div>

              {/* Weight */}
              <div className="space-y-6">
                 <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Weight</label>
                    <div className="bg-muted/50 px-4 py-2 rounded-xl border border-border font-black text-lg">
                       {unitSystem === 'metric' ? `${weightKg} KG` : `${weightLbs} LBS`}
                    </div>
                 </div>
                 {unitSystem === 'metric' ? (
                    <div className="relative h-10 flex items-center group">
                       <div className="absolute w-full h-1.5 bg-muted rounded-full pointer-events-none">
                          <div className="h-full bg-brand-orange/20 rounded-full" style={{ width: `${((weightKg - 20) / 280) * 100}%` }} />
                       </div>
                       <input 
                          type="range"
                          value={weightKg}
                          onChange={(e) => setWeightKg(Number(e.target.value))}
                          min={20}
                          max={300}
                          step={1}
                          className="relative w-full h-full bg-transparent appearance-none cursor-pointer outline-none z-10
                          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand-orange [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110
                          [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-brand-orange [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-md"
                       />
                    </div>
                 ) : (
                    <div className="relative h-10 flex items-center group">
                       <div className="absolute w-full h-1.5 bg-muted rounded-full pointer-events-none">
                          <div className="h-full bg-brand-orange/20 rounded-full" style={{ width: `${((weightLbs - 44) / 616) * 100}%` }} />
                       </div>
                       <input 
                          type="range"
                          value={weightLbs}
                          onChange={(e) => setWeightLbs(Number(e.target.value))}
                          min={44}
                          max={660}
                          step={1}
                          className="relative w-full h-full bg-transparent appearance-none cursor-pointer outline-none z-10
                          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand-orange [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110
                          [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-brand-orange [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-md"
                       />
                    </div>
                 )}
              </div>

              {/* Standard Toggle */}
              <div className="pt-6 border-t border-border">
                 <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4 block">Calculation Standard</label>
                 <div className="flex gap-2 bg-muted p-1 rounded-xl">
                    <Button 
                      variant={standard === 'who' ? 'secondary' : 'ghost'} 
                      size="sm" 
                      className="flex-1 rounded-lg text-[10px] font-bold"
                      onClick={() => setStandard('who')}
                    >
                      WHO Standard
                    </Button>
                    <Button 
                      variant={standard === 'asian' ? 'secondary' : 'ghost'} 
                      size="sm" 
                      className="flex-1 rounded-lg text-[10px] font-bold"
                      onClick={() => setStandard('asian')}
                    >
                      Asian/Indian
                    </Button>
                 </div>
              </div>
           </div>
        </div>

        {/* History Tracker */}
        <div className="bg-card rounded-[3rem] border border-border p-8 shadow-xl space-y-6">
           <div className="flex justify-between items-center">
              <h3 className="font-bold font-syne text-xl flex items-center gap-2">
                 <History className="size-5 text-brand-orange" /> History
              </h3>
              <div className="flex gap-2">
                 <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={exportCSV} title="Export CSV"><Download className="size-4" /></Button>
                 <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500" onClick={clearHistory} title="Clear All"><Trash2 className="size-4" /></Button>
              </div>
           </div>
           
           <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {history.length > 0 ? history.map((h: any) => (
                <div key={h.id} className="p-4 bg-muted/30 rounded-2xl border border-border flex justify-between items-center group">
                   <div>
                      <p className="text-[10px] font-bold text-muted-foreground">{h.date}</p>
                      <p className="font-black text-sm">{h.bmi} — <span className="text-[10px] font-medium opacity-70">{h.category}</span></p>
                   </div>
                   <div className="text-right">
                      <p className="text-xs font-bold">{h.weight}</p>
                   </div>
                </div>
              )) : (
                <div className="py-10 text-center space-y-3">
                   <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto text-muted-foreground"><History className="size-6" /></div>
                   <p className="text-xs text-muted-foreground">No records saved yet.</p>
                </div>
              )}
           </div>
           
           <Button className="w-full rounded-2xl h-14 font-black bg-brand-orange text-white hover:bg-brand-orange/90" onClick={saveToHistory}>
              <UserPlus className="size-5 mr-2" /> Save Current Result
           </Button>
        </div>
      </div>

      {/* Right Column: Results */}
      <div className="lg:col-span-7 space-y-8">
        {/* Main BMI Result Card */}
        <div className={cn(
          "bg-[#1e293b] rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group border-t-[8px]",
          results.bmi < 18.5 ? "border-blue-500" :
          results.bmi < 25 ? "border-green-500" :
          results.bmi < 30 ? "border-yellow-500" : "border-red-500"
        )}>
           <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity">
              <Scale className="size-48" />
           </div>
           
           <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
              <div className="flex-1 space-y-6 text-center md:text-left">
                 <p className="text-zinc-500 font-mono text-xs uppercase tracking-[0.2em]">Your BMI Score</p>
                 <div className="flex items-center justify-center md:justify-start gap-4">
                    <span className="text-4xl">{results.category.emoji}</span>
                    <h2 className="text-7xl font-black tracking-tighter" style={{ color: results.category.color }}>{results.bmi}</h2>
                 </div>
                 <div className="inline-block px-6 py-2 rounded-full border border-white/10 bg-white/5">
                    <p className="font-bold text-lg uppercase tracking-wider">{results.category.category}</p>
                 </div>
                 <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                    <div>
                       <p className="text-[10px] text-zinc-500 uppercase font-bold">Age / Gender</p>
                       <p className="font-bold">{age}Y / {gender === 'male' ? 'Male' : 'Female'}</p>
                    </div>
                    <div>
                       <p className="text-[10px] text-zinc-500 uppercase font-bold">Measured At</p>
                       <p className="font-bold">{heightCm} cm | {weightKg} kg</p>
                    </div>
                 </div>
              </div>
              
              <div className="shrink-0">
                 <BMIGauge bmi={results.bmi} />
              </div>
           </div>
        </div>

        {/* Ideal Weight Range */}
        <div className="bg-card rounded-[3rem] border border-border p-10 shadow-xl space-y-8 relative overflow-hidden">
           <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-500">
                 <CheckCircle2 className="size-8" />
              </div>
              <div>
                 <h3 className="font-bold font-syne text-2xl">Healthy Weight Range</h3>
                 <p className="text-sm text-muted-foreground">For your height of {heightCm} cm</p>
              </div>
           </div>

           <div className="bg-muted/30 rounded-3xl p-8 space-y-8">
              <div className="text-center">
                 <h4 className="text-3xl font-black text-foreground">{results.ideal.min} kg — {results.ideal.max} kg</h4>
                 <p className="text-xs text-muted-foreground font-medium mt-2">Recommended range (BMI 18.5 - 24.9)</p>
              </div>

              <div className="relative pt-10">
                 <div className="h-3 w-full bg-muted rounded-full relative">
                    <div className="absolute h-full bg-green-500/50 rounded-full" style={{ left: '18.5%', right: '50.2%' }} />
                    {/* User Marker */}
                    <div 
                      className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center transition-all duration-700" 
                      style={{ left: `${Math.min(100, (results.bmi / 45) * 100)}%` }}
                    >
                       <div className="w-4 h-4 rounded-full bg-brand-orange border-4 border-white shadow-lg ring-4 ring-brand-orange/20" />
                       <div className="absolute -top-8 bg-brand-orange text-white text-[10px] font-bold px-2 py-1 rounded-md whitespace-nowrap">
                          You ({weightKg} kg)
                       </div>
                       <ArrowDown className="size-3 text-brand-orange absolute -top-4" />
                    </div>
                 </div>
                 <div className="flex justify-between mt-3 text-[10px] font-bold text-muted-foreground">
                    <span>10 BMI</span>
                    <span>18.5</span>
                    <span>24.9</span>
                    <span>45 BMI</span>
                 </div>
              </div>

              <div className={cn(
                "p-6 rounded-2xl flex items-center gap-5 transition-all",
                results.ideal.diff === 0 ? "bg-green-500/10 border border-green-500/20 text-green-600" :
                results.bmi > 24.9 ? "bg-red-500/10 border border-red-500/20 text-red-600" : "bg-blue-500/10 border border-blue-500/20 text-blue-600"
              )}>
                 {results.ideal.diff === 0 ? (
                    <>
                       <CheckCircle2 className="size-6 shrink-0" />
                       <p className="font-bold">You are within the healthy weight range!</p>
                    </>
                 ) : (
                    <>
                       {results.bmi > 24.9 ? <ArrowDown className="size-6 shrink-0" /> : <ArrowUp className="size-6 shrink-0" />}
                       <p className="font-bold">
                          {results.bmi > 24.9 
                            ? `Lose ${formatNum(results.ideal.diff)} kg to reach healthy range` 
                            : `Gain ${formatNum(results.ideal.diff)} kg to reach healthy range`}
                       </p>
                    </>
                 )}
              </div>
           </div>
        </div>

        {/* Health Metrics & Recommendations */}
        <div className="grid md:grid-cols-2 gap-8">
           <div className="bg-card rounded-[3rem] border border-border p-8 shadow-xl space-y-6">
              <h4 className="font-bold font-syne text-lg flex items-center gap-2">
                 <Activity className="size-5 text-brand-orange" /> Recommendations
              </h4>
              <div className="space-y-4">
                 {results.bmi < 18.5 && (
                    <div className="space-y-3">
                       <p className="text-xs font-bold text-blue-600 uppercase">📉 You are Underweight</p>
                       <ul className="space-y-2 text-xs text-muted-foreground">
                          <li className="flex gap-2">• Increase calorie intake by 300-500 cal/day</li>
                          <li className="flex gap-2">• Focus on protein-rich foods and healthy fats</li>
                          <li className="flex gap-2">• Strength training to build muscle mass</li>
                          <li className="flex gap-2">• Consult a doctor for nutrient screening</li>
                       </ul>
                    </div>
                 )}
                 {results.bmi >= 18.5 && results.bmi < 25 && (
                    <div className="space-y-3">
                       <p className="text-xs font-bold text-green-600 uppercase">✅ Healthy Weight Range</p>
                       <ul className="space-y-2 text-xs text-muted-foreground">
                          <li className="flex gap-2">• Maintain 150 min moderate exercise weekly</li>
                          <li className="flex gap-2">• Eat balanced diet with 5 portions of fruit/veg</li>
                          <li className="flex gap-2">• Stay hydrated (2-3 liters daily)</li>
                          <li className="flex gap-2">• Regular annual health screenings</li>
                       </ul>
                    </div>
                 )}
                 {results.bmi >= 25 && results.bmi < 30 && (
                    <div className="space-y-3">
                       <p className="text-xs font-bold text-yellow-600 uppercase">📈 You are Overweight</p>
                       <ul className="space-y-2 text-xs text-muted-foreground">
                          <li className="flex gap-2">• Create 500 cal/day deficit for 0.5kg/week loss</li>
                          <li className="flex gap-2">• Increase physical activity to 300 min/week</li>
                          <li className="flex gap-2">• Reduce processed sugar and high-GI carbs</li>
                          <li className="flex gap-2">• Monitor portion sizes regularly</li>
                       </ul>
                    </div>
                 )}
                 {results.bmi >= 30 && (
                    <div className="space-y-3">
                       <p className="text-xs font-bold text-red-600 uppercase">🚨 BMI indicates Obesity</p>
                       <ul className="space-y-2 text-xs text-muted-foreground">
                          <li className="flex gap-2">• Consult a healthcare professional immediately</li>
                          <li className="flex gap-2">• Aim for gradual weight loss (0.5-1kg per week)</li>
                          <li className="flex gap-2">• Screen for diabetes and heart markers</li>
                          <li className="flex gap-2">• Focus on whole foods, avoid crash diets</li>
                       </ul>
                    </div>
                 )}
              </div>
              <div className="pt-4 border-t border-border">
                 <p className="text-[10px] text-muted-foreground italic leading-relaxed">
                    ℹ️ BMI is a screening tool. Athletes or highly muscular individuals may have a high BMI without excess body fat.
                 </p>
              </div>
           </div>

           <div className="bg-card rounded-[3rem] border border-border p-8 shadow-xl space-y-6">
              <h4 className="font-bold font-syne text-lg flex items-center gap-2">
                 <Zap className="size-5 text-brand-orange" /> Energy & Composition
              </h4>
              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-muted/40 p-4 rounded-2xl border border-border">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Estimated Body Fat</p>
                    <p className="text-xl font-black text-brand-orange">{results.bodyFat}%</p>
                 </div>
                 <div className="bg-muted/40 p-4 rounded-2xl border border-border">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">BMR (Resting)</p>
                    <p className="text-xl font-black text-brand-orange">{results.bmr} <span className="text-[8px] font-medium">CAL/D</span></p>
                 </div>
              </div>
              
              <div className="space-y-4">
                 <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Activity Level</label>
                    <select 
                      value={activityLevel} 
                      onChange={(e) => setActivityLevel(Number(e.target.value))}
                      className="bg-transparent text-[10px] font-bold uppercase outline-none text-brand-orange"
                    >
                       <option value={1.2}>Sedentary</option>
                       <option value={1.375}>Light</option>
                       <option value={1.55}>Moderate</option>
                       <option value={1.725}>Active</option>
                       <option value={1.9}>Very Active</option>
                    </select>
                 </div>
                 <div className="bg-brand-orange p-6 rounded-2xl text-white shadow-lg shadow-brand-orange/20">
                    <p className="text-[10px] font-bold uppercase opacity-70">Daily TDEE (Estimated)</p>
                    <p className="text-3xl font-black">{results.tdee} <span className="text-sm font-medium">CALORIES/DAY</span></p>
                    <p className="text-[8px] opacity-60 mt-1 uppercase tracking-widest">Total Daily Energy Expenditure</p>
                 </div>
              </div>
           </div>
        </div>

        {/* Ideal Weight Formulas */}
        <div className="bg-card rounded-[3rem] border border-border p-10 shadow-xl space-y-8">
           <h3 className="text-2xl font-bold font-syne flex items-center gap-3">
              <Dna className="size-6 text-brand-orange" /> Ideal Weight Formulas
           </h3>
           <div className="grid md:grid-cols-4 gap-6">
              {[
                { name: 'BMI Method', val: results.ideal.max, desc: 'Based on BMI 24.9' },
                { name: 'Devine', val: results.formulas.devine, desc: 'Used for medical doses' },
                { name: 'Robinson', val: results.formulas.robinson, desc: 'Modern revision' },
                { name: 'Miller', val: results.formulas.miller, desc: 'Conservative estimate' }
              ].map(f => (
                <div key={f.name} className="p-6 bg-muted/30 border border-border rounded-3xl text-center space-y-2">
                   <p className="text-[10px] font-bold text-muted-foreground uppercase">{f.name}</p>
                   <p className="text-xl font-black">{formatNum(f.val)} <span className="text-xs font-medium">KG</span></p>
                   <p className="text-[8px] text-muted-foreground italic leading-none">{f.desc}</p>
                </div>
              ))}
           </div>
           <div className="bg-brand-orange/5 border border-brand-orange/20 p-6 rounded-3xl text-center">
              <p className="text-xs font-bold text-muted-foreground uppercase mb-2">Aggregate Ideal Weight</p>
              <p className="text-3xl font-black text-brand-orange">{formatNum(results.formulas.avg)} KG</p>
           </div>
        </div>

        {/* BMI Trend Chart */}
        {history.length > 1 && (
           <div className="bg-card rounded-[3rem] border border-border p-8 shadow-xl">
              <div className="flex justify-between items-center mb-8">
                 <h3 className="font-bold font-syne text-xl flex items-center gap-2">
                    <TrendingUp className="size-5 text-brand-orange" /> BMI Trend Chart
                 </h3>
                 <Badge variant="outline" className="rounded-full text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Historical Data</Badge>
              </div>
              <div className="h-[300px]">
                 <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={[...history].reverse()}>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                       <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6b7280' }} />
                       <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6b7280' }} domain={[10, 45]} />
                       <Tooltip 
                          contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '1rem', color: '#fff', fontSize: '12px' }}
                          formatter={(value: any) => [value, "BMI"]}
                       />
                       <ReferenceLine y={18.5} stroke="#3b82f6" strokeDasharray="3 3" label={{ value: 'Under', position: 'right', fill: '#3b82f6', fontSize: 10 }} />
                       <ReferenceLine y={25} stroke="#eab308" strokeDasharray="3 3" label={{ value: 'Over', position: 'right', fill: '#eab308', fontSize: 10 }} />
                       <ReferenceLine y={30} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Obese', position: 'right', fill: '#ef4444', fontSize: 10 }} />
                       <Line type="monotone" dataKey="bmi" stroke="#F97316" strokeWidth={3} dot={{ fill: '#F97316', r: 4 }} activeDot={{ r: 6, strokeWidth: 0 }} />
                    </LineChart>
                 </ResponsiveContainer>
              </div>
           </div>
        )}

        <Button variant="outline" className="w-full rounded-2xl h-14 font-black border-2 border-muted hover:border-brand-orange transition-all" onClick={() => window.print()}>
           <Printer className="size-5 mr-2" /> Print Full BMI Report
        </Button>
      </div>
    </div>
  )
}
