"use client"

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area
} from 'recharts'
import { 
  Home, 
  Car, 
  Briefcase, 
  GraduationCap, 
  Settings, 
  Download, 
  Printer, 
  Info, 
  ArrowRight, 
  Calculator, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Table as TableIcon,
  PieChart as PieIcon,
  ChevronRight,
  Plus,
  Minus
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

// Helper for Indian Number Formatting
const formatINR = (num: number, hideSymbol = false) => {
  return new Intl.NumberFormat('en-IN', {
    style: hideSymbol ? 'decimal' : 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(num)
}

const loanPresets = {
  home: { amount: 3000000, rate: 8.5, tenure: 20, maxAmt: 50000000, maxTenure: 30 },
  car: { amount: 800000, rate: 9.5, tenure: 5, maxAmt: 5000000, maxTenure: 7 },
  personal: { amount: 500000, rate: 14, tenure: 3, maxAmt: 2000000, maxTenure: 5 },
  edu: { amount: 1000000, rate: 10.5, tenure: 7, maxAmt: 5000000, maxTenure: 15 },
  custom: { amount: 100000, rate: 10, tenure: 5, maxAmt: 100000000, maxTenure: 30 }
}

export default function LoanCalculatorClient() {
  const [activeTab, setActiveTab] = useState<keyof typeof loanPresets>('home')
  const [principal, setPrincipal] = useState(loanPresets.home.amount)
  const [annualRate, setAnnualRate] = useState(loanPresets.home.rate)
  const [tenure, setTenure] = useState(loanPresets.home.tenure)
  const [tenureUnit, setTenureUnit] = useState<'Yr' | 'Mo'>('Yr')

  // UI States
  const [showTable, setShowTable] = useState(false)
  const [tableMode, setTableMode] = useState<'monthly' | 'yearly'>('yearly')
  
  // Extra Payment State
  const [prepayment, setPrepayment] = useState(0)
  const [prepaymentFreq, setPrepaymentFreq] = useState<'month' | 'year'>('year')
  const [prepaymentStart, setPrepaymentStart] = useState(12)

  // Eligibility State
  const [showEligibility, setShowEligibility] = useState(false)
  const [monthlyIncome, setMonthlyIncome] = useState(75000)
  const [existingEMI, setExistingEMI] = useState(10000)

  // Comparison State
  const [showCompare, setShowCompare] = useState(false)
  const [compRate, setCompRate] = useState(9.0)

  // Calculations
  const results = useMemo(() => {
    const P = Number(principal) || 0
    const r = (Number(annualRate) || 0) / 12 / 100
    const n = tenureUnit === 'Yr' ? (Number(tenure) || 0) * 12 : (Number(tenure) || 0)

    if (n <= 0 || P <= 0) return { emi: 0, totalInterest: 0, totalPayment: 0, interestPercent: 0 }
    
    let emi = 0
    if (r === 0) {
      emi = P / n
    } else {
      emi = P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1)
    }

    const totalPayment = emi * n
    const totalInterest = Math.max(0, totalPayment - P)
    const interestPercent = P > 0 ? (totalInterest / P) * 100 : 0

    return {
      emi: Math.round(emi),
      totalPayment: Math.round(totalPayment),
      totalInterest: Math.round(totalInterest),
      interestPercent
    }
  }, [principal, annualRate, tenure, tenureUnit])

  // Chart Data
  const pieData = [
    { name: 'Principal', value: principal, color: '#22c55e' },
    { name: 'Interest', value: results.totalInterest, color: '#ef4444' }
  ]

  const amortizationData = useMemo(() => {
    const P = principal
    const r = annualRate / 12 / 100
    const n = tenureUnit === 'Yr' ? tenure * 12 : tenure
    const emi = results.emi

    let balance = P
    const schedule = []
    const yearly = []

    let yearlyInterest = 0
    let yearlyPrincipal = 0

    for (let m = 1; m <= n; m++) {
      const interest = balance * r
      const principalPaid = emi - interest
      balance -= principalPaid
      
      yearlyInterest += interest
      yearlyPrincipal += principalPaid

      schedule.push({
        month: m,
        emi,
        interest: Math.round(interest),
        principal: Math.round(principalPaid),
        balance: Math.max(0, Math.round(balance))
      })

      if (m % 12 === 0 || m === n) {
        yearly.push({
          year: Math.ceil(m / 12),
          totalEMI: Math.round(emi * (m % 12 || 12)),
          interest: Math.round(yearlyInterest),
          principal: Math.round(yearlyPrincipal),
          balance: Math.max(0, Math.round(balance))
        })
        yearlyInterest = 0
        yearlyPrincipal = 0
      }
    }

    return { monthly: schedule, yearly }
  }, [principal, annualRate, tenure, tenureUnit, results.emi])

  // Prepayment Analysis
  const prepaymentResults = useMemo(() => {
    if (prepayment <= 0) return null
    
    const P = principal
    const r = annualRate / 12 / 100
    const n = tenureUnit === 'Yr' ? tenure * 12 : tenure
    const emi = results.emi
    
    let balance = P
    let month = 0
    let totalInterest = 0

    while (balance > 0 && month < n * 2) {
      month++
      const interest = balance * r
      totalInterest += interest
      balance -= (emi - interest)

      if (month >= prepaymentStart) {
        if (prepaymentFreq === 'month') balance -= prepayment
        else if (prepaymentFreq === 'year' && month % 12 === 0) balance -= prepayment
      }

      if (balance <= 0) break
    }

    const interestSaved = results.totalInterest - totalInterest
    const monthsSaved = n - month

    return {
      newTenure: month,
      monthsSaved,
      interestSaved: Math.round(interestSaved)
    }
  }, [principal, annualRate, tenure, tenureUnit, results.emi, prepayment, prepaymentFreq, prepaymentStart, results.totalInterest])

  // Eligibility Calculation
  const eligibility = useMemo(() => {
    const maxEMIPercent = 0.45 
    const maxEMI = monthlyIncome * maxEMIPercent
    const availableEMI = Math.max(0, maxEMI - existingEMI)
    
    const r = annualRate / 12 / 100
    const n = tenureUnit === 'Yr' ? tenure * 12 : tenure
    
    if (r === 0 || n === 0) return { maxEMI, availableEMI, maxLoan: availableEMI * n }
    
    const maxLoan = availableEMI * (Math.pow(1 + r, n) - 1) / (r * Math.pow(1 + r, n))
    return { maxEMI, availableEMI, maxLoan: Math.round(maxLoan) }
  }, [monthlyIncome, existingEMI, annualRate, tenure, tenureUnit])

  // Comparison Calculation
  const comparison = useMemo(() => {
    const r2 = compRate / 12 / 100
    const n = tenureUnit === 'Yr' ? tenure * 12 : tenure
    if (n === 0) return null
    
    let emi2 = 0
    if (r2 === 0) emi2 = principal / n
    else emi2 = principal * r2 * Math.pow(1 + r2, n) / (Math.pow(1 + r2, n) - 1)
    
    const total2 = emi2 * n
    const diff = total2 - results.totalPayment
    return { emi: Math.round(emi2), total: Math.round(total2), diff: Math.round(diff) }
  }, [principal, compRate, tenure, tenureUnit, results.totalPayment])

  // Handle Tab Change
  useEffect(() => {
    const preset = loanPresets[activeTab]
    setPrincipal(preset.amount)
    setAnnualRate(preset.rate)
    setTenure(preset.tenure)
    setTenureUnit('Yr')
  }, [activeTab])

  const downloadCSV = () => {
    const data = tableMode === 'monthly' ? amortizationData.monthly : amortizationData.yearly
    const headers = tableMode === 'monthly' ? ['Month','EMI','Principal','Interest','Balance'] : ['Year','EMI','Principal','Interest','Balance']
    const csvRows = [
      headers.join(','),
      ...data.map((row: any) => [
        tableMode === 'monthly' ? row.month : row.year,
        row.emi || row.totalEMI,
        row.principal,
        row.interest,
        row.balance
      ].join(','))
    ]
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Loan_Schedule_${activeTab}.csv`
    a.click()
    toast.success("CSV Downloaded")
  }

  return (
    <div className="space-y-12">
      {/* Loan Type Tabs */}
      <div className="flex flex-wrap justify-center gap-3">
         {[
           { id: 'home', label: 'Home Loan', icon: Home },
           { id: 'car', label: 'Car Loan', icon: Car },
           { id: 'personal', label: 'Personal Loan', icon: Briefcase },
           { id: 'edu', label: 'Education Loan', icon: GraduationCap },
           { id: 'custom', label: 'Custom', icon: Settings }
         ].map(tab => (
           <Button 
             key={tab.id}
             variant={activeTab === tab.id ? 'default' : 'outline'}
             className={cn(
               "rounded-full px-6 transition-all",
               activeTab === tab.id ? "bg-brand-orange text-white" : "hover:border-brand-orange hover:text-brand-orange"
             )}
             onClick={() => setActiveTab(tab.id as any)}
           >
              <tab.icon className="size-4 mr-2" /> {tab.label}
           </Button>
         ))}
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
         {/* Input Panel */}
         <div className="lg:col-span-5 space-y-10 bg-card rounded-[3rem] border border-border p-10 shadow-xl h-fit">
            <div className="space-y-6">
               <div className="flex justify-between items-center">
                  <label className="font-bold text-muted-foreground uppercase tracking-wider text-xs">Loan Amount</label>
                  <div className="flex items-center gap-2 bg-muted/50 px-4 py-2 rounded-2xl border border-border">
                     <span className="text-muted-foreground font-bold text-sm">₹</span>
                     <input 
                        type="number" 
                        value={principal || ''} 
                        onChange={(e) => {
                           const val = parseFloat(e.target.value)
                           setPrincipal(isNaN(val) ? 0 : Math.max(0, val))
                        }}
                        className="bg-transparent font-bold text-lg outline-none w-32 text-right pr-2"
                     />
                  </div>
               </div>
               <div className="relative h-10 flex items-center group">
                  {/* Custom Track */}
                  <div className="absolute w-full h-1.5 bg-muted rounded-full pointer-events-none">
                     <div 
                        className="h-full bg-brand-orange/20 rounded-full" 
                        style={{ width: `${Math.min(100, ((Number(principal) || 0) / loanPresets[activeTab].maxAmt) * 100)}%` }} 
                     />
                  </div>
                  <input 
                     type="range"
                     value={Number(principal) || 0}
                     onChange={(e) => setPrincipal(Number(e.target.value))}
                     max={loanPresets[activeTab].maxAmt}
                     min={0}
                     step={10000}
                     className="relative w-full h-full bg-transparent appearance-none cursor-pointer outline-none z-10
                     [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand-orange [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110
                     [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-brand-orange [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-md"
                  />
               </div>
               <div className="flex flex-wrap gap-2">
                  {[500000, 1000000, 2500000, 5000000, 10000000].map(v => (
                    <Button key={v} variant="ghost" size="sm" className="rounded-full text-[10px] h-6 bg-muted hover:bg-brand-orange hover:text-white" onClick={() => setPrincipal(v)}>
                      {v >= 10000000 ? `${v/10000000}Cr` : `${v/100000}L`}
                    </Button>
                  ))}
               </div>
            </div>

            <div className="space-y-6">
               <div className="flex justify-between items-center">
                  <label className="font-bold text-muted-foreground uppercase tracking-wider text-xs">Interest Rate (% p.a.)</label>
                  <div className="flex items-center gap-2 bg-muted/50 px-4 py-2 rounded-2xl border border-border">
                     <input 
                        type="number" 
                        value={annualRate || ''} 
                        onChange={(e) => {
                           const val = parseFloat(e.target.value)
                           setAnnualRate(isNaN(val) ? 0 : Math.max(0, val))
                        }}
                        className="bg-transparent font-bold text-lg outline-none w-16 text-right pr-1"
                        step="0.1"
                     />
                     <span className="text-muted-foreground font-bold text-sm">%</span>
                  </div>
               </div>
               <div className="relative h-10 flex items-center group">
                  {/* Custom Track */}
                  <div className="absolute w-full h-1.5 bg-muted rounded-full pointer-events-none">
                     <div 
                        className="h-full bg-brand-orange/20 rounded-full" 
                        style={{ width: `${Math.min(100, ((Number(annualRate) || 0) / 30) * 100)}%` }} 
                     />
                  </div>
                  <input 
                     type="range"
                     value={Number(annualRate) || 0}
                     onChange={(e) => setAnnualRate(Number(e.target.value))}
                     max={30}
                     min={0}
                     step={0.1}
                     className="relative w-full h-full bg-transparent appearance-none cursor-pointer outline-none z-10
                     [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand-orange [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110
                     [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-brand-orange [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-md"
                  />
               </div>
               <p className="text-[10px] text-muted-foreground font-medium italic">Monthly interest rate: {(annualRate/12).toFixed(2)}%</p>
            </div>

            <div className="space-y-6">
               <div className="flex justify-between items-center">
                  <label className="font-bold text-muted-foreground uppercase tracking-wider text-xs">Loan Tenure</label>
                  <div className="flex gap-2">
                     <div className="flex items-center gap-2 bg-muted/50 px-4 py-2 rounded-2xl border border-border">
                        <input 
                           type="number" 
                           value={tenure || ''} 
                           onChange={(e) => {
                              const val = parseFloat(e.target.value)
                              setTenure(isNaN(val) ? 1 : Math.max(1, val))
                           }}
                           className="bg-transparent font-bold text-lg outline-none w-12 text-center"
                        />
                     </div>
                     <div className="bg-muted p-1 rounded-2xl flex">
                        <Button variant={tenureUnit === 'Yr' ? 'default' : 'ghost'} size="sm" className="rounded-xl h-8 text-[10px]" onClick={() => setTenureUnit('Yr')}>Years</Button>
                        <Button variant={tenureUnit === 'Mo' ? 'default' : 'ghost'} size="sm" className="rounded-xl h-8 text-[10px]" onClick={() => setTenureUnit('Mo')}>Months</Button>
                     </div>
                  </div>
               </div>
               <div className="relative h-10 flex items-center group">
                  {/* Custom Track */}
                  <div className="absolute w-full h-1.5 bg-muted rounded-full pointer-events-none">
                     <div 
                        className="h-full bg-brand-orange/20 rounded-full" 
                        style={{ width: `${Math.min(100, ((Number(tenure) || 1) / (tenureUnit === 'Yr' ? loanPresets[activeTab].maxTenure : loanPresets[activeTab].maxTenure * 12)) * 100)}%` }} 
                     />
                  </div>
                  <input 
                     type="range"
                     value={Number(tenure) || 1}
                     onChange={(e) => setTenure(Number(e.target.value))}
                     max={tenureUnit === 'Yr' ? loanPresets[activeTab].maxTenure : loanPresets[activeTab].maxTenure * 12}
                     min={1}
                     step={1}
                     className="relative w-full h-full bg-transparent appearance-none cursor-pointer outline-none z-10
                     [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand-orange [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110
                     [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-brand-orange [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-md"
                  />
               </div>
            </div>
         </div>

         {/* Results Panel */}
         <div className="lg:col-span-7 space-y-8">
            <div className="bg-[#1e293b] rounded-[3rem] border border-white/5 p-10 shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Calculator className="size-48" />
               </div>
               <div className="relative z-10 grid md:grid-cols-2 gap-10">
                  <div className="space-y-8">
                     <div>
                        <p className="text-zinc-500 font-mono text-xs uppercase tracking-[0.2em] mb-2">Monthly EMI</p>
                        <h2 className="text-5xl font-black text-brand-orange tracking-tighter">{formatINR(results.emi)}</h2>
                        <p className="text-zinc-500 text-[10px] mt-2 font-medium">TOTAL PAYABLE: {formatINR(results.totalPayment)}</p>
                     </div>

                     <div className="space-y-4">
                        <div className="flex justify-between items-center">
                           <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-green-500" />
                              <span className="text-xs font-bold text-zinc-400">Principal</span>
                           </div>
                           <span className="text-sm font-bold text-white">{formatINR(principal)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                           <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-red-500" />
                              <span className="text-xs font-bold text-zinc-400">Total Interest</span>
                           </div>
                           <span className="text-sm font-bold text-white">{formatINR(results.totalInterest)}</span>
                        </div>
                     </div>

                     <div className={cn(
                        "p-4 rounded-2xl border-l-4 font-medium text-xs leading-relaxed",
                        results.interestPercent < 50 ? "bg-green-500/10 border-green-500 text-green-400" :
                        results.interestPercent < 100 ? "bg-yellow-500/10 border-yellow-500 text-yellow-400" :
                        "bg-red-500/10 border-red-500 text-red-400"
                     )}>
                        {results.interestPercent > 100 ? (
                           <div className="flex gap-2">
                              <TrendingUp className="size-4 shrink-0" />
                              <p>High interest burden! You pay <strong>{results.interestPercent.toFixed(1)}%</strong> of principal as interest. Consider shorter tenure.</p>
                           </div>
                        ) : (
                           <div className="flex gap-2">
                              <TrendingDown className="size-4 shrink-0" />
                              <p>Interest burden is <strong>{results.interestPercent.toFixed(1)}%</strong>. This is a {results.interestPercent < 50 ? 'very efficient' : 'moderate'} loan structure.</p>
                           </div>
                        )}
                     </div>
                  </div>

                  <div className="h-[250px] flex items-center justify-center">
                     <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                           <Pie
                              data={pieData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={90}
                              paddingAngle={5}
                              dataKey="value"
                           >
                              {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                           </Pie>
                           <Tooltip 
                              contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '1rem', color: '#fff' }}
                              itemStyle={{ color: '#fff' }}
                              formatter={(value: any) => formatINR(value)}
                           />
                        </PieChart>
                     </ResponsiveContainer>
                     <div className="absolute flex flex-col items-center pointer-events-none">
                        <span className="text-[10px] text-zinc-500 font-bold uppercase">EMI</span>
                        <span className="text-lg font-black text-white">{formatINR(results.emi)}</span>
                     </div>
                  </div>
               </div>
            </div>

            {/* Line Chart Section */}
            <div className="bg-card rounded-[3rem] border border-border p-8 shadow-xl">
               <div className="flex justify-between items-center mb-8">
                  <h3 className="font-bold font-syne text-xl flex items-center gap-2">
                     <TrendingDown className="size-5 text-brand-orange" /> Balance Breakdown
                  </h3>
                  <Badge variant="outline" className="rounded-full text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Yearly Projection</Badge>
               </div>
               <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                     <LineChart data={amortizationData.yearly}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6b7280' }} label={{ value: 'Year', position: 'bottom', offset: 0, fill: '#6b7280', fontSize: 10 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6b7280' }} tickFormatter={(v) => `₹${(v/100000).toFixed(0)}L`} />
                        <Tooltip 
                           contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '1rem', color: '#fff', fontSize: '12px' }}
                           formatter={(value: any) => formatINR(value)}
                        />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '20px' }} />
                        <Line type="monotone" dataKey="balance" stroke="#ef4444" strokeWidth={3} dot={false} name="Outstanding" />
                        <Line type="monotone" dataKey="principal" stroke="#22c55e" strokeWidth={3} dot={false} name="Principal Paid" />
                        <Line type="monotone" dataKey="interest" stroke="#F97316" strokeWidth={3} dot={false} name="Interest Paid" />
                     </LineChart>
                  </ResponsiveContainer>
               </div>
            </div>
         </div>
      </div>

      {/* Analysis Modules */}
      <div className="grid md:grid-cols-2 gap-8">
         {/* Prepayment Calculator */}
         <div className="bg-card rounded-[3rem] border border-border p-10 shadow-xl space-y-8 relative overflow-hidden">
            <div className="flex items-center gap-4 border-b border-border pb-6">
               <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-500">
                  <TrendingUp className="size-6" />
               </div>
               <div>
                  <h3 className="font-bold font-syne text-xl">Prepayment Power</h3>
                  <p className="text-xs text-muted-foreground">Save lakhs by making extra payments</p>
               </div>
            </div>

            <div className="grid gap-6">
               <div className="space-y-4">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Extra Payment Amount</label>
                  <div className="flex gap-4">
                     <Input 
                        type="number" 
                        placeholder="₹ Amount" 
                        value={prepayment || ''} 
                        onChange={(e) => setPrepayment(Number(e.target.value))}
                        className="rounded-2xl h-12 text-right font-bold"
                     />
                     <div className="bg-muted p-1 rounded-2xl flex shrink-0">
                        <Button variant={prepaymentFreq === 'year' ? 'default' : 'ghost'} size="sm" className="rounded-xl h-10 px-4 text-xs" onClick={() => setPrepaymentFreq('year')}>Yearly</Button>
                        <Button variant={prepaymentFreq === 'month' ? 'default' : 'ghost'} size="sm" className="rounded-xl h-10 px-4 text-xs" onClick={() => setPrepaymentFreq('month')}>Monthly</Button>
                     </div>
                  </div>
               </div>
            </div>

            {prepaymentResults && (
               <div className="bg-green-500/5 rounded-3xl border border-green-500/20 p-8 space-y-6 animate-in zoom-in-95 duration-500">
                  <div className="flex justify-between items-center">
                     <p className="text-sm font-bold text-green-600">Total Interest Saved</p>
                     <p className="text-2xl font-black text-green-600">{formatINR(prepaymentResults.interestSaved)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                     <Badge className="bg-green-500 text-white border-none rounded-full">
                        -{Math.floor(prepaymentResults.monthsSaved / 12)}Y {prepaymentResults.monthsSaved % 12}M Tenure Reduced
                     </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground italic leading-relaxed">
                     By paying {formatINR(prepayment)} extra every {prepaymentFreq}, your loan will end in <strong>{Math.floor(prepaymentResults.newTenure / 12)}Y {prepaymentResults.newTenure % 12}M</strong> instead of {tenureUnit === 'Yr' ? tenure : Math.floor(tenure/12)}Y.
                  </p>
               </div>
            )}
         </div>

         {/* Amortization Switch */}
         <div className="bg-card rounded-[3rem] border border-border p-10 shadow-xl flex flex-col justify-between">
            <div className="space-y-6">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500">
                     <TableIcon className="size-6" />
                  </div>
                  <div>
                     <h3 className="font-bold font-syne text-xl">Detailed Schedule</h3>
                     <p className="text-xs text-muted-foreground">Month-by-month repayment breakdown</p>
                  </div>
               </div>
               <p className="text-sm text-muted-foreground leading-relaxed">
                  View exactly how much of your monthly EMI goes towards paying off the principal versus the interest over the entire duration of your loan.
               </p>
            </div>
            
            <div className="flex flex-col gap-4 mt-8">
               <div className="flex gap-2 bg-muted p-1 rounded-2xl">
                  <Button variant={tableMode === 'yearly' ? 'secondary' : 'ghost'} className="flex-1 rounded-xl h-12 font-bold" onClick={() => setTableMode('yearly')}>Yearly View</Button>
                  <Button variant={tableMode === 'monthly' ? 'secondary' : 'ghost'} className="flex-1 rounded-xl h-12 font-bold" onClick={() => setTableMode('monthly')}>Monthly View</Button>
               </div>
               <Button 
                 className="w-full rounded-2xl h-14 font-black bg-brand-orange text-white hover:bg-brand-orange/90 group" 
                 onClick={() => {
                   setShowTable(!showTable);
                   toast.info(showTable ? "Table Hidden" : "Loading Amortization Table...");
                 }}
               >
                  {showTable ? 'Hide Table' : 'Show Full Amortization Table'}
                  <ChevronRight className={cn("size-5 ml-2 transition-transform", showTable ? "rotate-90" : "")} />
               </Button>
            </div>
         </div>
      </div>

      {/* Amortization Table Section */}
      {showTable && (
         <div className="bg-card rounded-[3rem] border border-border shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-8 duration-700">
            <div className="p-8 border-b border-border bg-muted/20 flex flex-col md:flex-row justify-between items-center gap-6">
               <h3 className="text-2xl font-bold font-syne uppercase tracking-tight">Repayment Schedule</h3>
               <div className="flex gap-3">
                  <Button variant="outline" className="rounded-full px-6" onClick={downloadCSV}>
                     <Download className="size-4 mr-2" /> CSV
                  </Button>
                  <Button variant="outline" className="rounded-full px-6" onClick={() => window.print()}>
                     <Printer className="size-4 mr-2" /> Print
                  </Button>
               </div>
            </div>
            <div className="overflow-x-auto max-h-[600px] custom-scrollbar">
               <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-muted z-20 shadow-sm">
                     <tr>
                        <th className="px-8 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">{tableMode === 'monthly' ? 'Month' : 'Year'}</th>
                        <th className="px-8 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">EMI Payment</th>
                        <th className="px-8 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest text-green-500">Principal</th>
                        <th className="px-8 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest text-red-500">Interest</th>
                        <th className="px-8 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">Ending Balance</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                     {(tableMode === 'monthly' ? amortizationData.monthly : amortizationData.yearly).map((row: any, idx) => (
                        <tr key={idx} className="hover:bg-muted/30 transition-colors group">
                           <td className="px-8 py-4 font-mono font-bold text-sm">{tableMode === 'monthly' ? row.month : row.year}</td>
                           <td className="px-8 py-4 font-mono text-sm">{formatINR(row.emi || row.totalEMI)}</td>
                           <td className="px-8 py-4 font-mono text-sm text-green-500/80">+{formatINR(row.principal)}</td>
                           <td className="px-8 py-4 font-mono text-sm text-red-500/80">-{formatINR(row.interest)}</td>
                           <td className="px-8 py-4 font-mono font-black text-sm">{formatINR(row.balance)}</td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>
      )}

      {/* Comparison & Eligibility Mini-Tools */}
      <div className="grid lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 bg-brand-orange rounded-[3rem] p-10 text-white shadow-xl flex flex-col md:flex-row items-center gap-10 group overflow-hidden relative">
            <div className="absolute -bottom-10 -right-10 opacity-10 group-hover:scale-110 transition-transform duration-700">
               <ArrowRight className="size-64 rotate-[-45deg]" />
            </div>
            <div className="relative z-10 flex-1 space-y-6">
               <h3 className="text-4xl font-black font-syne tracking-tighter leading-none">Compare with another rate</h3>
               {!showCompare ? (
                 <>
                   <p className="text-white/80 font-medium leading-relaxed max-w-md">
                      Compare your current offer with a different interest rate to see how much you can save.
                   </p>
                   <Button 
                    className="bg-white text-brand-orange hover:bg-white/90 rounded-2xl h-14 px-8 font-black text-lg"
                    onClick={() => setShowCompare(true)}
                   >
                      Compare Now <ChevronRight className="size-6 ml-2" />
                   </Button>
                 </>
               ) : (
                 <div className="space-y-4 animate-in fade-in zoom-in-95">
                    <div className="flex items-center gap-4">
                       <span className="font-bold">New Rate:</span>
                       <Input 
                        type="number" 
                        value={compRate} 
                        onChange={(e) => setCompRate(Number(e.target.value))}
                        className="w-24 bg-white/20 border-white/30 text-white font-bold h-10"
                       />
                       <span className="font-bold">%</span>
                    </div>
                    {comparison && (
                      <div className="bg-white/10 p-4 rounded-2xl border border-white/20">
                         <p className="text-sm">Monthly EMI: {formatINR(comparison.emi)}</p>
                         <p className="text-xl font-bold">
                            {comparison.diff > 0 
                              ? `You pay ${formatINR(comparison.diff)} MORE` 
                              : `You save ${formatINR(Math.abs(comparison.diff))} TOTAL`}
                         </p>
                      </div>
                    )}
                    <Button variant="ghost" className="text-white/70 hover:text-white" onClick={() => setShowCompare(false)}>Close Comparison</Button>
                 </div>
               )}
            </div>
         </div>

         <div className="bg-card rounded-[3rem] border border-border p-10 shadow-xl flex flex-col justify-center gap-6">
            {!showEligibility ? (
              <>
                <div className="w-16 h-16 bg-brand-orange/10 rounded-3xl flex items-center justify-center text-brand-orange">
                   <TrendingUp className="size-8" />
                </div>
                <h3 className="text-2xl font-bold font-syne leading-tight">Eligibility Checker</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                   Find out how much loan you can actually get based on your income.
                </p>
                <Button 
                  variant="outline" 
                  className="w-full rounded-2xl h-14 font-black border-2 border-brand-orange/20 hover:border-brand-orange text-brand-orange"
                  onClick={() => setShowEligibility(true)}
                >
                   Check Eligibility
                </Button>
              </>
            ) : (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground">Monthly Income</label>
                    <Input type="number" value={monthlyIncome} onChange={(e) => setMonthlyIncome(Number(e.target.value))} className="h-10" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground">Existing EMIs</label>
                    <Input type="number" value={existingEMI} onChange={(e) => setExistingEMI(Number(e.target.value))} className="h-10" />
                 </div>
                 <div className="p-4 bg-brand-orange/5 rounded-2xl border border-brand-orange/20">
                    <p className="text-[10px] font-bold uppercase text-brand-orange">Max Loan Eligible</p>
                    <p className="text-2xl font-black text-brand-orange">{formatINR(eligibility.maxLoan)}</p>
                 </div>
                 <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => setShowEligibility(false)}>Back</Button>
              </div>
            )}
         </div>
      </div>
    </div>
  )
}
