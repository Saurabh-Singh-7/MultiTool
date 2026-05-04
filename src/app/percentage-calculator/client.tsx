"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { 
  Plus, 
  Minus, 
  ArrowRight, 
  ArrowUpDown, 
  Copy, 
  Printer, 
  Hash, 
  TrendingUp, 
  TrendingDown, 
  ShoppingBag, 
  Percent, 
  Calculator, 
  Scale, 
  Coffee, 
  GraduationCap, 
  IndianRupee,
  DollarSign,
  Euro,
  PoundSterling,
  Trash2,
  ChevronDown,
  Info
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

// Helper for formatting
const formatNum = (num: number, decimals = 2) => {
  if (isNaN(num) || !isFinite(num)) return "0"
  return Number(num.toFixed(decimals)).toLocaleString('en-IN')
}

const formatPercent = (num: number, decimals = 2) => {
  if (isNaN(num) || !isFinite(num)) return "0"
  return Number(num.toFixed(decimals)).toString()
}

// Sub-component for Calc Card
const CalcCard = ({ id, title, icon: Icon, children, result, formula }: any) => {
  const copyResult = () => {
    if (result) {
      navigator.clipboard.writeText(result)
      toast.success("Result copied to clipboard!")
    }
  }

  return (
    <div id={id} className="bg-card rounded-[2.5rem] border border-border shadow-xl hover:shadow-2xl transition-all overflow-hidden group border-l-[12px] border-l-brand-orange/10 hover:border-l-brand-orange/50">
       <div className="p-8 space-y-6">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-brand-orange/10 rounded-2xl flex items-center justify-center text-brand-orange group-hover:scale-110 transition-transform">
                <Icon className="size-6" />
             </div>
             <h3 className="text-xl font-bold font-syne uppercase tracking-tight">{title}</h3>
          </div>
          
          <div className="space-y-6">
             {children}
          </div>

          {result && (
             <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-brand-orange/5 rounded-3xl border border-brand-orange/20 p-6 space-y-4">
                   <div className="flex items-center justify-between">
                      <p className="text-sm font-black uppercase tracking-widest text-brand-orange/70">Result</p>
                      <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 hover:bg-brand-orange/10 text-brand-orange" onClick={copyResult}>
                         <Copy className="size-4" />
                      </Button>
                   </div>
                   <div className="text-2xl font-bold font-mono tracking-tight">{result}</div>
                   {formula && (
                      <div className="pt-4 border-t border-brand-orange/10 flex items-center gap-2">
                         <Info className="size-4 text-brand-orange/40" />
                         <div className="text-[10px] md:text-xs text-muted-foreground font-medium">
                            <span className="uppercase opacity-50 mr-2">Formula:</span>
                            {formula}
                         </div>
                      </div>
                   )}
                </div>
             </div>
          )}
       </div>
    </div>
  )
}

export default function PercentageCalculatorClient() {
  // Navigation
  const jumpLinks = [
    { id: 'basic', label: 'Basic %', icon: Percent },
    { id: 'change', label: '% Change', icon: TrendingUp },
    { id: 'difference', label: '% Difference', icon: Scale },
    { id: 'incdec', label: 'Inc/Dec', icon: Calculator },
    { id: 'discount', label: 'Discount', icon: ShoppingBag },
    { id: 'markup', label: 'Markup', icon: TrendingUp },
    { id: 'tip', label: 'Tip', icon: Coffee },
    { id: 'gst', label: 'GST', icon: IndianRupee },
    { id: 'grade', label: 'Grade', icon: GraduationCap },
  ]

  // 1. What is X% of Y
  const [c1X, setC1X] = useState('15')
  const [c1Y, setC1Y] = useState('200')
  const c1Res = (parseFloat(c1X) / 100) * parseFloat(c1Y)

  // 2. X is what % of Y
  const [c2X, setC2X] = useState('30')
  const [c2Y, setC2Y] = useState('200')
  const c2Res = (parseFloat(c2X) / parseFloat(c2Y)) * 100

  // 3. Percentage Change
  const [c3From, setC3From] = useState('150')
  const [c3To, setC3To] = useState('200')
  const c3Diff = parseFloat(c3To) - parseFloat(c3From)
  const c3Percent = (c3Diff / Math.abs(parseFloat(c3From))) * 100

  // 4. Percentage Difference
  const [c4V1, setC4V1] = useState('40')
  const [c4V2, setC4V2] = useState('60')
  const c4Diff = Math.abs(parseFloat(c4V1) - parseFloat(c4V2))
  const c4Avg = (parseFloat(c4V1) + parseFloat(c4V2)) / 2
  const c4Res = (c4Diff / c4Avg) * 100

  // 5. Inc/Dec by %
  const [c5Val, setC5Val] = useState('500')
  const [c5Percent, setC5Percent] = useState('20')
  const [c5Mode, setC5Mode] = useState<'inc' | 'dec'>('inc')
  const c5Amount = (parseFloat(c5Val) * parseFloat(c5Percent)) / 100
  const c5Res = c5Mode === 'inc' ? parseFloat(c5Val) + c5Amount : parseFloat(c5Val) - c5Amount

  // 6. Discount
  const [c6Price, setC6Price] = useState('2000')
  const [c6Discount, setC6Discount] = useState('30')
  const [currency, setCurrency] = useState('₹')
  const c6Savings = (parseFloat(c6Price) * parseFloat(c6Discount)) / 100
  const c6Final = parseFloat(c6Price) - c6Savings

  // 7. Markup
  const [c7Cost, setC7Cost] = useState('500')
  const [c7Markup, setC7Markup] = useState('40')
  const c7Profit = (parseFloat(c7Cost) * parseFloat(c7Markup)) / 100
  const c7Selling = parseFloat(c7Cost) + c7Profit
  const c7Margin = (c7Profit / c7Selling) * 100

  // 8. Tip
  const [c8Bill, setC8Bill] = useState('1500')
  const [c8Tip, setC8Tip] = useState('12')
  const [c8Split, setC8Split] = useState('3')
  const c8TipTotal = (parseFloat(c8Bill) * parseFloat(c8Tip)) / 100
  const c8GrandTotal = parseFloat(c8Bill) + c8TipTotal
  const c8PerPerson = c8GrandTotal / parseFloat(c8Split)

  // 9. GST
  const [c9Amt, setC9Amt] = useState('1000')
  const [c9Rate, setC9Rate] = useState('18')
  const [c9Mode, setC9Mode] = useState<'add' | 'rem'>('add')
  const calculateGST = () => {
    const amt = parseFloat(c9Amt)
    const rate = parseFloat(c9Rate)
    if (c9Mode === 'add') {
      const gst = (amt * rate) / 100
      return { total: amt + gst, gst, base: amt }
    } else {
      const base = amt / (1 + rate / 100)
      const gst = amt - base
      return { total: amt, gst, base }
    }
  }
  const c9Res = calculateGST()

  // 10. Grade
  const [subjects, setSubjects] = useState([{ name: 'Subject 1', marks: '85', total: '100' }])
  const addSubject = () => setSubjects([...subjects, { name: `Subject ${subjects.length + 1}`, marks: '', total: '100' }])
  const removeSubject = (idx: number) => setSubjects(subjects.filter((_, i) => i !== idx))
  const updateSubject = (idx: number, field: string, val: string) => {
    const next = [...subjects]
    ;(next[idx] as any)[field] = val
    setSubjects(next)
  }
  const totalObtained = subjects.reduce((acc, s) => acc + (parseFloat(s.marks) || 0), 0)
  const totalPossible = subjects.reduce((acc, s) => acc + (parseFloat(s.total) || 0), 0)
  const gradePercent = (totalObtained / totalPossible) * 100
  const getGrade = (p: number) => {
    if (p >= 90) return { grade: 'A+', label: 'Outstanding' }
    if (p >= 80) return { grade: 'A', label: 'Excellent' }
    if (p >= 70) return { grade: 'B+', label: 'First Class' }
    if (p >= 60) return { grade: 'B', label: 'Second Class' }
    if (p >= 50) return { grade: 'C', label: 'Pass' }
    return { grade: 'F', label: 'Fail' }
  }
  const gradeInfo = getGrade(gradePercent)

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  return (
    <div className="space-y-12">
      {/* Quick Jump Navigation */}
      <div className="bg-card/50 backdrop-blur-md sticky top-4 z-50 p-4 border border-border rounded-[2.5rem] shadow-lg flex flex-wrap justify-center gap-2">
         {jumpLinks.map(link => (
           <Button key={link.id} variant="ghost" size="sm" className="rounded-full text-xs hover:bg-brand-orange/10 hover:text-brand-orange" onClick={() => scrollTo(link.id)}>
             <link.icon className="size-3 mr-2" /> {link.label}
           </Button>
         ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* 1. Basic Percentage */}
        <CalcCard 
          id="basic"
          title="What is X% of Y?" 
          icon={Percent}
          result={`${c1X}% of ${c1Y} = ${formatNum(c1Res)}`}
          formula={`(${c1X} ÷ 100) × ${c1Y} = ${formatNum(c1Res)}`}
        >
          <div className="flex flex-col md:flex-row items-center gap-4">
             <div className="flex-1 space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase ml-2">Percentage (%)</label>
                <Input type="number" value={c1X} onChange={(e) => setC1X(e.target.value)} className="text-right h-14 text-xl rounded-2xl bg-muted/30 focus:bg-background border-2" />
             </div>
             <div className="pt-6 font-bold text-muted-foreground">OF</div>
             <div className="flex-1 space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase ml-2">Number (Total)</label>
                <Input type="number" value={c1Y} onChange={(e) => setC1Y(e.target.value)} className="text-right h-14 text-xl rounded-2xl bg-muted/30 focus:bg-background border-2" />
             </div>
          </div>
          <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
             <div className="h-full bg-brand-orange transition-all duration-700" style={{ width: `${Math.min(parseFloat(c1X), 100)}%` }} />
          </div>
        </CalcCard>

        {/* 2. X is what % of Y */}
        <CalcCard 
          id="iswhat"
          title="X is What % of Y?" 
          icon={Calculator}
          result={`${c2X} is ${formatPercent(c2Res)}% of ${c2Y}`}
          formula={`(${c2X} ÷ ${c2Y}) × 100 = ${formatPercent(c2Res)}%`}
        >
          <div className="flex flex-col md:flex-row items-center gap-4">
             <div className="flex-1 space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase ml-2">Number (Part)</label>
                <Input type="number" value={c2X} onChange={(e) => setC2X(e.target.value)} className="text-right h-14 text-xl rounded-2xl bg-muted/30 focus:bg-background border-2" />
             </div>
             <div className="pt-6 font-bold text-muted-foreground">IS WHAT % OF</div>
             <div className="flex-1 space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase ml-2">Number (Total)</label>
                <Input type="number" value={c2Y} onChange={(e) => setC2Y(e.target.value)} className="text-right h-14 text-xl rounded-2xl bg-muted/30 focus:bg-background border-2" />
             </div>
          </div>
        </CalcCard>

        {/* 3. Percentage Change */}
        <CalcCard 
          id="change"
          title="Percentage Change" 
          icon={TrendingUp}
          result={
            <div className="flex items-center gap-4">
               {c3Percent >= 0 ? <TrendingUp className="size-8 text-green-500" /> : <TrendingDown className="size-8 text-red-500" />}
               <div>
                  <div className={cn("text-2xl font-bold", c3Percent >= 0 ? "text-green-500" : "text-red-500")}>
                    {c3Percent >= 0 ? 'Increased' : 'Decreased'} by {formatPercent(Math.abs(c3Percent))}%
                  </div>
                  <div className="text-sm font-medium text-muted-foreground">Total Change: {c3Diff > 0 ? '+' : ''}{formatNum(c3Diff)}</div>
               </div>
            </div>
          }
          formula={`((${c3To} - ${c3From}) ÷ |${c3From}|) × 100 = ${formatPercent(c3Percent)}%`}
        >
          <div className="flex flex-col md:flex-row items-center gap-4">
             <div className="flex-1 space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase ml-2">From (Old)</label>
                <Input type="number" value={c3From} onChange={(e) => setC3From(e.target.value)} className="text-right h-14 text-xl rounded-2xl bg-muted/30 focus:bg-background border-2" />
             </div>
             <Button variant="ghost" size="icon" className="mt-6 rounded-full" onClick={() => {setC3From(c3To); setC3To(c3From);}}>
                <ArrowRight className="size-6" />
             </Button>
             <div className="flex-1 space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase ml-2">To (New)</label>
                <Input type="number" value={c3To} onChange={(e) => setC3To(e.target.value)} className="text-right h-14 text-xl rounded-2xl bg-muted/30 focus:bg-background border-2" />
             </div>
          </div>
        </CalcCard>

        {/* 4. Percentage Difference */}
        <CalcCard 
          id="difference"
          title="Percentage Difference" 
          icon={Scale}
          result={`Percentage Difference: ${formatPercent(c4Res)}%`}
          formula={`|${c4V1} - ${c4V2}| ÷ ((${c4V1} + ${c4V2}) ÷ 2) × 100 = ${formatPercent(c4Res)}%`}
        >
          <div className="flex flex-col md:flex-row items-center gap-4">
             <div className="flex-1 space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase ml-2">Value 1</label>
                <Input type="number" value={c4V1} onChange={(e) => setC4V1(e.target.value)} className="text-right h-14 text-xl rounded-2xl bg-muted/30 focus:bg-background border-2" />
             </div>
             <div className="pt-6 font-bold text-muted-foreground">&</div>
             <div className="flex-1 space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase ml-2">Value 2</label>
                <Input type="number" value={c4V2} onChange={(e) => setC4V2(e.target.value)} className="text-right h-14 text-xl rounded-2xl bg-muted/30 focus:bg-background border-2" />
             </div>
          </div>
          <p className="text-[10px] text-muted-foreground italic text-center">Note: Uses average as denominator. Always positive.</p>
        </CalcCard>

        {/* 5. Inc/Dec by % */}
        <CalcCard 
          id="incdec"
          title="Increase / Decrease" 
          icon={ArrowUpDown}
          result={`${c5Val} ${c5Mode === 'inc' ? 'increased' : 'decreased'} by ${c5Percent}% = ${formatNum(c5Res)}`}
          formula={`${c5Val} ${c5Mode === 'inc' ? '+' : '-'} (${c5Val} × ${c5Percent} ÷ 100) = ${formatNum(c5Res)}`}
        >
          <div className="flex flex-col md:flex-row items-center gap-4">
             <div className="flex-[1.5] space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase ml-2">Initial Value</label>
                <Input type="number" value={c5Val} onChange={(e) => setC5Val(e.target.value)} className="text-right h-14 text-xl rounded-2xl bg-muted/30 focus:bg-background border-2" />
             </div>
             <div className="pt-6 flex flex-col gap-1">
                <Button variant={c5Mode === 'inc' ? 'default' : 'ghost'} size="sm" className="h-6 rounded-t-lg" onClick={() => setC5Mode('inc')}>INC</Button>
                <Button variant={c5Mode === 'dec' ? 'default' : 'ghost'} size="sm" className="h-6 rounded-b-lg" onClick={() => setC5Mode('dec')}>DEC</Button>
             </div>
             <div className="flex-1 space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase ml-2">By (%)</label>
                <Input type="number" value={c5Percent} onChange={(e) => setC5Percent(e.target.value)} className="text-right h-14 text-xl rounded-2xl bg-muted/30 focus:bg-background border-2" />
             </div>
          </div>
        </CalcCard>

        {/* 6. Discount */}
        <CalcCard 
          id="discount"
          title="Discount Calculator" 
          icon={ShoppingBag}
          result={
            <div className="space-y-4">
               <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-muted-foreground">You Save:</span>
                  <span className="text-2xl font-bold text-green-500">{currency}{formatNum(c6Savings)}</span>
               </div>
               <div className="flex justify-between items-center border-t border-brand-orange/10 pt-4">
                  <span className="text-sm font-bold">Final Price:</span>
                  <span className="text-3xl font-black text-brand-orange">{currency}{formatNum(c6Final)}</span>
               </div>
            </div>
          }
          formula={`${currency}${c6Price} - (${c6Price} × ${c6Discount} ÷ 100) = ${currency}${formatNum(c6Final)}`}
        >
          <div className="flex flex-col md:flex-row items-center gap-4">
             <div className="flex-1 space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase ml-2">Original Price</label>
                <div className="relative">
                   <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">{currency}</span>
                   <Input type="number" value={c6Price} onChange={(e) => setC6Price(e.target.value)} className="pl-10 text-right h-14 text-xl rounded-2xl bg-muted/30 focus:bg-background border-2" />
                </div>
             </div>
             <div className="flex-1 space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase ml-2">Discount (%)</label>
                <Input type="number" value={c6Discount} onChange={(e) => setC6Discount(e.target.value)} className="text-right h-14 text-xl rounded-2xl bg-muted/30 focus:bg-background border-2" />
             </div>
          </div>
          <div className="flex justify-center gap-2">
             {['₹', '$', '€', '£'].map(c => (
               <Button key={c} variant={currency === c ? 'default' : 'ghost'} size="sm" className="rounded-full w-10 h-10" onClick={() => setCurrency(c)}>{c}</Button>
             ))}
          </div>
        </CalcCard>

        {/* 7. Markup */}
        <CalcCard 
          id="markup"
          title="Markup Calculator" 
          icon={TrendingUp}
          result={
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                  <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Selling Price</p>
                  <p className="text-xl font-bold">{currency}{formatNum(c7Selling)}</p>
               </div>
               <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                  <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Gross Margin</p>
                  <p className="text-xl font-bold text-green-500">{formatPercent(c7Margin)}%</p>
               </div>
            </div>
          }
          formula={`Cost + (Cost × Markup%) = Selling Price. (${c7Cost} + ${formatNum(c7Profit)})`}
        >
          <div className="flex flex-col md:flex-row items-center gap-4">
             <div className="flex-1 space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase ml-2">Cost Price</label>
                <Input type="number" value={c7Cost} onChange={(e) => setC7Cost(e.target.value)} className="text-right h-14 text-xl rounded-2xl bg-muted/30 focus:bg-background border-2" />
             </div>
             <div className="flex-1 space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase ml-2">Markup (%)</label>
                <Input type="number" value={c7Markup} onChange={(e) => setC7Markup(e.target.value)} className="text-right h-14 text-xl rounded-2xl bg-muted/30 focus:bg-background border-2" />
             </div>
          </div>
        </CalcCard>

        {/* 8. Tip Calculator */}
        <CalcCard 
          id="tip"
          title="Tip Calculator" 
          icon={Coffee}
          result={
            <div className="space-y-6">
               <div className="flex justify-between items-center text-sm">
                  <span>Total Tip:</span>
                  <span className="font-bold">{currency}{formatNum(c8TipTotal)}</span>
               </div>
               <div className="flex justify-between items-center text-sm border-b border-white/10 pb-4">
                  <span>Grand Total:</span>
                  <span className="font-bold">{currency}{formatNum(c8GrandTotal)}</span>
               </div>
               <div className="flex justify-between items-end">
                  <div>
                     <p className="text-[10px] font-black uppercase tracking-widest text-brand-orange">Per Person</p>
                     <p className="text-3xl font-black text-brand-orange">{currency}{formatNum(c8PerPerson)}</p>
                  </div>
                  <Coffee className="size-10 text-brand-orange opacity-20" />
               </div>
            </div>
          }
          formula={`(Bill + (Bill × Tip%)) ÷ People = Per Person`}
        >
          <div className="space-y-6">
             <div className="flex gap-4">
                <div className="flex-1 space-y-2">
                   <label className="text-xs font-bold text-muted-foreground uppercase ml-2">Bill Amount</label>
                   <Input type="number" value={c8Bill} onChange={(e) => setC8Bill(e.target.value)} className="text-right h-12 rounded-xl" />
                </div>
                <div className="flex-1 space-y-2">
                   <label className="text-xs font-bold text-muted-foreground uppercase ml-2">Split (# People)</label>
                   <Input type="number" value={c8Split} onChange={(e) => setC8Split(e.target.value)} className="text-right h-12 rounded-xl" />
                </div>
             </div>
             <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase ml-2">Tip (%)</label>
                <div className="flex gap-2">
                   {[10, 15, 18, 20].map(t => (
                     <Button key={t} variant={parseFloat(c8Tip) === t ? 'default' : 'outline'} className="flex-1 rounded-xl" onClick={() => setC8Tip(t.toString())}>{t}%</Button>
                   ))}
                   <Input type="number" value={c8Tip} onChange={(e) => setC8Tip(e.target.value)} className="w-20 h-10 text-right" placeholder="Custom" />
                </div>
             </div>
          </div>
        </CalcCard>

        {/* 9. GST Calculator */}
        <CalcCard 
          id="gst"
          title="GST Calculator (India)" 
          icon={IndianRupee}
          result={
            <div className="space-y-4">
               <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                     <p className="opacity-50 text-[10px] uppercase font-bold">Base Amount</p>
                     <p className="font-bold">₹{formatNum(c9Res.base)}</p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                     <p className="opacity-50 text-[10px] uppercase font-bold">GST ({c9Rate}%)</p>
                     <p className="font-bold text-brand-orange">₹{formatNum(c9Res.gst)}</p>
                  </div>
               </div>
               <div className="flex justify-between items-center p-4 bg-brand-orange/10 rounded-2xl border border-brand-orange/20">
                  <span className="font-bold uppercase tracking-widest text-xs">Total Amount</span>
                  <span className="text-2xl font-black text-brand-orange">₹{formatNum(c9Res.total)}</span>
               </div>
               <div className="flex gap-4 text-[10px] font-mono text-muted-foreground">
                  <span>CGST ({(parseFloat(c9Rate)/2)}%): ₹{formatNum(c9Res.gst/2)}</span>
                  <span>SGST ({(parseFloat(c9Rate)/2)}%): ₹{formatNum(c9Res.gst/2)}</span>
               </div>
            </div>
          }
          formula={c9Mode === 'add' ? `Amt + (Amt × ${c9Rate}%)` : `Amt ÷ (1 + ${c9Rate}/100)`}
        >
          <div className="space-y-6">
             <div className="flex gap-4">
                <Button variant={c9Mode === 'add' ? 'default' : 'outline'} className="flex-1 rounded-2xl h-12" onClick={() => setC9Mode('add')}>Add GST</Button>
                <Button variant={c9Mode === 'rem' ? 'default' : 'outline'} className="flex-1 rounded-2xl h-12" onClick={() => setC9Mode('rem')}>Remove GST</Button>
             </div>
             <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase ml-2">Amount</label>
                <Input type="number" value={c9Amt} onChange={(e) => setC9Amt(e.target.value)} className="text-right h-14 text-xl rounded-2xl" />
             </div>
             <div className="flex flex-wrap gap-2">
                {[5, 12, 18, 28].map(r => (
                  <Button key={r} variant={parseFloat(c9Rate) === r ? 'default' : 'outline'} size="sm" className="flex-1 rounded-xl" onClick={() => setC9Rate(r.toString())}>{r}%</Button>
                ))}
             </div>
          </div>
        </CalcCard>

        {/* 10. Grade Calculator */}
        <CalcCard 
          id="grade"
          title="Grade Calculator" 
          icon={GraduationCap}
          result={
            <div className="space-y-4">
               <div className="flex items-center justify-between">
                  <div>
                     <p className="text-[10px] font-black uppercase tracking-widest text-brand-orange opacity-60">Your Grade</p>
                     <p className="text-5xl font-black text-brand-orange">{gradeInfo.grade}</p>
                     <p className="text-sm font-bold text-muted-foreground">{gradeInfo.label}</p>
                  </div>
                  <div className="text-right">
                     <p className="text-xs font-bold text-muted-foreground mb-1">Percentage</p>
                     <p className="text-2xl font-black">{formatPercent(gradePercent)}%</p>
                  </div>
               </div>
               <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-brand-orange transition-all duration-1000" style={{ width: `${Math.min(gradePercent, 100)}%` }} />
               </div>
            </div>
          }
          formula={`(Total Obtained ÷ Total Max) × 100`}
        >
          <div className="space-y-4">
             {subjects.map((s, idx) => (
               <div key={idx} className="flex gap-3 animate-in fade-in slide-in-from-left-4">
                  <Input 
                    placeholder="Subject Name" 
                    value={s.name} 
                    onChange={(e) => updateSubject(idx, 'name', e.target.value)}
                    className="flex-[2] h-10 rounded-xl text-sm"
                  />
                  <Input 
                    type="number" 
                    placeholder="Marks" 
                    value={s.marks} 
                    onChange={(e) => updateSubject(idx, 'marks', e.target.value)}
                    className="flex-1 h-10 rounded-xl text-right text-sm"
                  />
                  <div className="pt-2 text-xs opacity-40">/</div>
                  <Input 
                    type="number" 
                    placeholder="Total" 
                    value={s.total} 
                    onChange={(e) => updateSubject(idx, 'total', e.target.value)}
                    className="flex-1 h-10 rounded-xl text-right text-sm"
                  />
                  <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-red-500 rounded-xl" onClick={() => removeSubject(idx)}>
                     <Trash2 className="size-4" />
                  </Button>
               </div>
             ))}
             <Button variant="ghost" className="w-full border-2 border-dashed border-border rounded-2xl py-6 hover:border-brand-orange hover:bg-brand-orange/5 text-muted-foreground hover:text-brand-orange" onClick={addSubject}>
                <Plus className="size-4 mr-2" /> Add Subject
             </Button>
          </div>
        </CalcCard>
      </div>

      <div className="flex justify-center pt-12">
         <Button variant="outline" className="rounded-full px-12 py-8 text-lg font-bold border-2 hover:bg-brand-orange hover:text-white transition-all group" onClick={() => window.print()}>
            <Printer className="size-6 mr-3 group-hover:scale-110 transition-transform" /> Print My Results
         </Button>
      </div>
    </div>
  )
}
