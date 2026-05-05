'use client'

import React, { useState, useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

// ─── TYPES & CONSTANTS ──────────────────────────────────────────────────

type AgeCategory = 'individual' | 'senior' | 'super-senior'
type CityType = 'metro' | 'non-metro'

const NEW_REGIME_SLABS_24_25 = [
  { min: 0, max: 300000, rate: 0 },
  { min: 300000, max: 700000, rate: 5 },
  { min: 700000, max: 1000000, rate: 10 },
  { min: 1000000, max: 1200000, rate: 15 },
  { min: 1200000, max: 1500000, rate: 20 },
  { min: 1500000, max: Infinity, rate: 30 },
]

const OLD_REGIME_SLABS_INDIVIDUAL = [
  { min: 0, max: 250000, rate: 0 },
  { min: 250000, max: 500000, rate: 5 },
  { min: 500000, max: 1000000, rate: 20 },
  { min: 1000000, max: Infinity, rate: 30 },
]

const OLD_REGIME_SLABS_SENIOR = [
  { min: 0, max: 300000, rate: 0 },
  { min: 300000, max: 500000, rate: 5 },
  { min: 500000, max: 1000000, rate: 20 },
  { min: 1000000, max: Infinity, rate: 30 },
]

const OLD_REGIME_SLABS_SUPER_SENIOR = [
  { min: 0, max: 500000, rate: 0 },
  { min: 500000, max: 1000000, rate: 20 },
  { min: 1000000, max: Infinity, rate: 30 },
]

const COLORS = ['#22c55e', '#ef4444', '#f97316', '#3b82f6', '#8b5cf6']

// ─── UTILS ─────────────────────────────────────────────────────────────

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(val)
}

const calculateSurcharge = (taxableIncome: number, tax: number, regime: 'new' | 'old') => {
  if (taxableIncome > 50000000) return tax * (regime === 'new' ? 0.25 : 0.37)
  if (taxableIncome > 20000000) return tax * 0.25
  if (taxableIncome > 10000000) return tax * 0.15
  if (taxableIncome > 5000000) return tax * 0.10
  return 0
}

// ─── COMPONENT ─────────────────────────────────────────────────────────

export default function TaxCalculatorClient() {
  // Basic Inputs
  const [ay, setAy] = useState('2025-26')
  const [category, setCategory] = useState<AgeCategory>('individual')
  const [residential, setResidential] = useState('resident')

  // Income Sources
  const [salaryBasic, setSalaryBasic] = useState<number>(800000)
  const [salaryHra, setSalaryHra] = useState<number>(240000)
  const [salarySpecial, setSalarySpecial] = useState<number>(160000)
  const [salaryOther, setSalaryOther] = useState<number>(0)

  const [incomeInterest, setIncomeInterest] = useState<number>(0)
  const [incomeRental, setIncomeRental] = useState<number>(0)
  const [incomeCapital, setIncomeCapital] = useState<number>(0)
  const [incomeOtherSources, setIncomeOtherSources] = useState<number>(0)

  // Deductions 80C
  const [epf, setEpf] = useState<number>(72000)
  const [ppf, setPpf] = useState<number>(0)
  const [elss, setElss] = useState<number>(0)
  const [lic, setLic] = useState<number>(15000)
  const [hlp, setHlp] = useState<number>(0)
  const [tuition, setTuition] = useState<number>(0)

  // Deductions 80D & Others
  const [healthSelf, setHealthSelf] = useState<number>(25000)
  const [healthParents, setHealthParents] = useState<number>(0)
  
  const [ded80E, setDed80E] = useState<number>(0)
  const [ded80G, setDed80G] = useState<number>(0)
  const [ded80TTA, setDed80TTA] = useState<number>(0)
  const [ded24B, setDed24B] = useState<number>(0)
  const [ded80CCD1B, setDed80CCD1B] = useState<number>(0)

  // HRA Details
  const [rentPaid, setRentPaid] = useState<number>(180000)
  const [city, setCity] = useState<CityType>('metro')

  // Expand State
  const [expandIncome, setExpandIncome] = useState(true)
  const [expandDeductions, setExpandDeductions] = useState(false)

  // ─── CALCULATIONS ─────────────────────────────────────────────────────

  const totalGrossSalary = salaryBasic + salaryHra + salarySpecial + salaryOther
  const totalOtherIncome = incomeInterest + incomeRental + incomeCapital + incomeOtherSources
  const totalGrossIncome = totalGrossSalary + totalOtherIncome

  const raw80C = epf + ppf + elss + lic + hlp + tuition
  const total80C = Math.min(150000, raw80C)

  const maxHealthSelf = category === 'individual' ? 25000 : 50000
  const allowedHealthSelf = Math.min(healthSelf, maxHealthSelf)
  const allowedHealthParents = Math.min(healthParents, 50000) // simplify
  const total80D = allowedHealthSelf + allowedHealthParents

  const allowed80TTA = Math.min(10000, ded80TTA)
  const allowed24B = Math.min(200000, ded24B)
  const allowed80CCD1B = Math.min(50000, ded80CCD1B)

  // HRA Calculation
  const hraCondition1 = salaryHra
  const hraCondition2 = city === 'metro' ? salaryBasic * 0.5 : salaryBasic * 0.4
  const rentMinus10PercentBasic = rentPaid - (salaryBasic * 0.1)
  const hraCondition3 = rentMinus10PercentBasic > 0 ? rentMinus10PercentBasic : 0
  const hraExemption = Math.min(hraCondition1, hraCondition2, hraCondition3)

  const oldRegimeStandardDeduction = 50000
  // Note: New regime standard deduction is 75000 for FY 24-25 as per prompt
  const newRegimeStandardDeduction = 75000 

  const totalOldDeductions = total80C + total80D + ded80E + ded80G + allowed80TTA + allowed24B + allowed80CCD1B + hraExemption + oldRegimeStandardDeduction
  
  // Professional tax simplified (flat 2400/yr if salary > 0)
  const pt = totalGrossSalary > 0 ? 2400 : 0
  
  const taxableIncomeOld = Math.max(0, totalGrossIncome - totalOldDeductions - pt)
  const taxableIncomeNew = Math.max(0, totalGrossIncome - newRegimeStandardDeduction - pt)

  // ─── TAX ENGINE ───────────────────────────────────────────────────────

  const calculateTax = (taxableIncome: number, regime: 'new' | 'old') => {
    let slabs = NEW_REGIME_SLABS_24_25
    if (regime === 'old') {
      slabs = category === 'super-senior' ? OLD_REGIME_SLABS_SUPER_SENIOR : category === 'senior' ? OLD_REGIME_SLABS_SENIOR : OLD_REGIME_SLABS_INDIVIDUAL
    }

    let tax = 0
    let remaining = taxableIncome
    let breakdown: { slab: string, rate: number, taxable: number, tax: number }[] = []

    for (const slab of slabs) {
      if (remaining <= 0) break
      
      const slabMax = slab.max === Infinity ? remaining + slab.min : slab.max
      const taxableInThisSlab = Math.min(remaining, slabMax - slab.min)
      
      const slabTax = (taxableInThisSlab * slab.rate) / 100
      tax += slabTax
      remaining -= taxableInThisSlab
      
      breakdown.push({
        slab: slab.max === Infinity ? `Above ${formatCurrency(slab.min)}` : `${formatCurrency(slab.min)} - ${formatCurrency(slab.max)}`,
        rate: slab.rate,
        taxable: taxableInThisSlab,
        tax: slabTax
      })
    }

    // Marginal relief not implemented for simplicity, but basic 87A rebate is
    const rebateLimit = regime === 'new' ? 700000 : 500000
    if (taxableIncome <= rebateLimit) tax = 0

    const surcharge = calculateSurcharge(taxableIncome, tax, regime)
    const taxAndSurcharge = tax + surcharge
    const cess = taxAndSurcharge * 0.04
    const totalTax = Math.round(taxAndSurcharge + cess)

    return { tax, surcharge, cess, totalTax, breakdown }
  }

  const newTaxResult = calculateTax(taxableIncomeNew, 'new')
  const oldTaxResult = calculateTax(taxableIncomeOld, 'old')

  const winningRegime = newTaxResult.totalTax <= oldTaxResult.totalTax ? 'NEW' : 'OLD'
  const taxSavings = Math.abs(oldTaxResult.totalTax - newTaxResult.totalTax)

  // Pie Chart Data
  const winningTax = winningRegime === 'NEW' ? newTaxResult.totalTax : oldTaxResult.totalTax
  const inHandSalary = totalGrossIncome - winningTax - epf - pt // Simplified net
  const pieData = [
    { name: 'In-hand Salary', value: inHandSalary > 0 ? inHandSalary : 0 },
    { name: 'Income Tax', value: winningTax },
    { name: 'PF/Deductions', value: epf + pt },
  ]

  // Monthly breakdown
  const monthlyGross = totalGrossSalary / 12
  const monthlyPt = pt / 12
  const monthlyEpf = epf / 12
  const monthlyTax = winningTax / 12
  const monthlyNet = monthlyGross - monthlyPt - monthlyEpf - monthlyTax

  // ─── HELPER COMPONENTS ────────────────────────────────────────────────

  const InputRow = ({ label, value, onChange, max }: { label: string, value: number, onChange: (v: number) => void, max?: number }) => (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 py-2">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">₹</span>
        <input 
          type="number" 
          value={value || ''} 
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full sm:w-48 bg-muted/30 border border-border rounded-xl pl-8 pr-4 py-2 text-right font-mono focus:outline-none focus:ring-2 focus:ring-brand-orange/50 transition-all"
        />
      </div>
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* ─── ROW 1: BASIC INPUTS ─── */}
      <div className="bg-card border border-border p-6 md:p-8 rounded-[2.5rem] shadow-sm flex flex-wrap gap-6 items-center justify-between">
         
         <div className="space-y-2">
           <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Assessment Year</label>
           <div className="flex gap-2">
             <button onClick={() => setAy('2024-25')} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${ay === '2024-25' ? 'bg-brand-orange text-white' : 'bg-muted/50 text-muted-foreground hover:bg-muted'}`}>AY 2024-25 (FY 23-24)</button>
             <button onClick={() => setAy('2025-26')} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${ay === '2025-26' ? 'bg-brand-orange text-white' : 'bg-muted/50 text-muted-foreground hover:bg-muted'}`}>AY 2025-26 (FY 24-25)</button>
           </div>
         </div>

         <div className="space-y-2">
           <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Taxpayer Category</label>
           <div className="flex gap-2">
             <button onClick={() => setCategory('individual')} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${category === 'individual' ? 'bg-brand-orange text-white' : 'bg-muted/50 text-muted-foreground hover:bg-muted'}`}>👤 Individual</button>
             <button onClick={() => setCategory('senior')} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${category === 'senior' ? 'bg-brand-orange text-white' : 'bg-muted/50 text-muted-foreground hover:bg-muted'}`}>👴 Senior (60-80)</button>
             <button onClick={() => setCategory('super-senior')} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${category === 'super-senior' ? 'bg-brand-orange text-white' : 'bg-muted/50 text-muted-foreground hover:bg-muted'}`}>🧓 Super Senior (80+)</button>
           </div>
         </div>

         <div className="space-y-2">
           <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Residential Status</label>
           <div className="flex gap-2">
             <button onClick={() => setResidential('resident')} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${residential === 'resident' ? 'bg-brand-orange text-white' : 'bg-muted/50 text-muted-foreground hover:bg-muted'}`}>Resident</button>
             <button onClick={() => setResidential('nri')} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${residential === 'nri' ? 'bg-brand-orange text-white' : 'bg-muted/50 text-muted-foreground hover:bg-muted'}`}>Non-Resident</button>
           </div>
         </div>

      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* ─── LEFT COLUMN: INPUTS ─── */}
        <div className="lg:col-span-7 space-y-6">
           
           {/* INCOME DETAILS */}
           <div className="bg-card border border-border rounded-[2.5rem] shadow-sm overflow-hidden">
             <button 
               onClick={() => setExpandIncome(!expandIncome)} 
               className="w-full flex items-center justify-between p-6 bg-muted/10 hover:bg-muted/30 transition-colors"
             >
               <h2 className="text-xl font-bold font-syne flex items-center gap-2">💰 Income Details</h2>
               <div className="flex items-center gap-4">
                 <span className="font-mono font-bold text-brand-orange">{formatCurrency(totalGrossIncome)}</span>
                 <span className="text-xl opacity-50">{expandIncome ? '▲' : '▼'}</span>
               </div>
             </button>
             
             {expandIncome && (
               <div className="p-6 space-y-8 animate-in fade-in slide-in-from-top-4">
                  <div>
                    <h3 className="font-bold text-sm uppercase tracking-widest text-brand-orange mb-4 border-b border-border pb-2">Salary Income</h3>
                    <div className="space-y-1">
                      <InputRow label="Basic Salary (Yearly)" value={salaryBasic} onChange={setSalaryBasic} />
                      <InputRow label="HRA Received" value={salaryHra} onChange={setSalaryHra} />
                      <InputRow label="Special Allowance" value={salarySpecial} onChange={setSalarySpecial} />
                      <InputRow label="Other Allowances" value={salaryOther} onChange={setSalaryOther} />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-sm uppercase tracking-widest text-brand-orange mb-4 border-b border-border pb-2">Other Income</h3>
                    <div className="space-y-1">
                      <InputRow label="Interest Income (FD/SB)" value={incomeInterest} onChange={setIncomeInterest} />
                      <InputRow label="Rental Income" value={incomeRental} onChange={setIncomeRental} />
                      <InputRow label="Capital Gains" value={incomeCapital} onChange={setIncomeCapital} />
                      <InputRow label="Other Sources" value={incomeOtherSources} onChange={setIncomeOtherSources} />
                    </div>
                  </div>
               </div>
             )}
           </div>

           {/* DEDUCTIONS */}
           <div className="bg-card border border-border rounded-[2.5rem] shadow-sm overflow-hidden relative">
             {/* New Regime Overlay */}
             {winningRegime === 'NEW' && expandDeductions && (
               <div className="absolute inset-0 bg-background/80 backdrop-blur-[2px] z-10 flex items-center justify-center p-8 text-center pointer-events-none mt-[80px]">
                  <div className="bg-card border border-border p-6 rounded-3xl shadow-xl max-w-sm pointer-events-auto">
                    <span className="text-4xl block mb-2">ℹ️</span>
                    <h4 className="font-bold font-syne mb-2">Deductions Disabled</h4>
                    <p className="text-sm text-muted-foreground">The New Tax Regime is currently selected as it saves you more money. Most deductions are not applicable under this regime.</p>
                  </div>
               </div>
             )}

             <button 
               onClick={() => setExpandDeductions(!expandDeductions)} 
               className="w-full flex items-center justify-between p-6 bg-muted/10 hover:bg-muted/30 transition-colors"
             >
               <h2 className="text-xl font-bold font-syne flex items-center gap-2">🛡️ Deductions (Old Regime)</h2>
               <div className="flex items-center gap-4">
                 <span className="font-mono font-bold text-blue-500">{formatCurrency(totalOldDeductions - oldRegimeStandardDeduction)}</span>
                 <span className="text-xl opacity-50">{expandDeductions ? '▲' : '▼'}</span>
               </div>
             </button>
             
             {expandDeductions && (
               <div className="p-6 space-y-8 animate-in fade-in slide-in-from-top-4">
                  
                  {/* 80C */}
                  <div>
                    <div className="flex justify-between items-end border-b border-border pb-2 mb-4">
                      <h3 className="font-bold text-sm uppercase tracking-widest text-brand-orange">Section 80C (Max ₹1.5L)</h3>
                      <span className="text-xs font-mono font-bold">{formatCurrency(total80C)} / ₹1.5L</span>
                    </div>
                    {/* Progress Bar */}
                    <div className="h-2 w-full bg-muted rounded-full mb-6 overflow-hidden">
                      <div className="h-full bg-brand-orange transition-all duration-500" style={{ width: `${Math.min(100, (raw80C / 150000) * 100)}%` }}></div>
                    </div>

                    <div className="space-y-1">
                      <InputRow label="EPF Contribution" value={epf} onChange={setEpf} />
                      <InputRow label="PPF Contribution" value={ppf} onChange={setPpf} />
                      <InputRow label="ELSS Mutual Funds" value={elss} onChange={setElss} />
                      <InputRow label="Life Insurance Premium" value={lic} onChange={setLic} />
                      <InputRow label="Home Loan Principal" value={hlp} onChange={setHlp} />
                      <InputRow label="Children Tuition Fees" value={tuition} onChange={setTuition} />
                    </div>
                  </div>

                  {/* 80D */}
                  <div>
                    <h3 className="font-bold text-sm uppercase tracking-widest text-brand-orange mb-4 border-b border-border pb-2">Section 80D (Health)</h3>
                    <div className="space-y-1">
                      <InputRow label="Self & Family (Max ₹25k)" value={healthSelf} onChange={setHealthSelf} />
                      <InputRow label="Parents (Max ₹50k)" value={healthParents} onChange={setHealthParents} />
                    </div>
                  </div>

                  {/* HRA */}
                  <div className="bg-muted/30 p-6 rounded-3xl border border-border">
                    <h3 className="font-bold text-sm uppercase tracking-widest text-brand-orange mb-4">HRA Exemption Calculator</h3>
                    <div className="grid sm:grid-cols-2 gap-4 mb-6">
                      <div>
                        <label className="block text-xs font-bold text-muted-foreground mb-1">Rent Paid (Yearly)</label>
                        <input type="number" value={rentPaid} onChange={(e) => setRentPaid(Number(e.target.value))} className="w-full bg-background border border-border rounded-xl px-4 py-2 font-mono" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-muted-foreground mb-1">City Type</label>
                        <div className="flex gap-2">
                          <button onClick={() => setCity('metro')} className={`flex-1 py-2 rounded-xl text-sm font-bold border transition-all ${city === 'metro' ? 'border-brand-orange bg-brand-orange/10 text-brand-orange' : 'border-border hover:bg-muted'}`}>Metro</button>
                          <button onClick={() => setCity('non-metro')} className={`flex-1 py-2 rounded-xl text-sm font-bold border transition-all ${city === 'non-metro' ? 'border-brand-orange bg-brand-orange/10 text-brand-orange' : 'border-border hover:bg-muted'}`}>Non-Metro</button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-background rounded-2xl p-4 border border-border/50 text-sm space-y-2">
                       <p className="font-bold mb-2">HRA Exemption = Min of following:</p>
                       <p className="flex justify-between"><span className="text-muted-foreground">a) Actual HRA received:</span> <span className="font-mono">{formatCurrency(hraCondition1)}</span></p>
                       <p className="flex justify-between"><span className="text-muted-foreground">b) {city === 'metro' ? '50%' : '40%'} of Basic Salary:</span> <span className="font-mono">{formatCurrency(hraCondition2)}</span></p>
                       <p className="flex justify-between"><span className="text-muted-foreground">c) Rent paid - 10% of Basic:</span> <span className="font-mono">{formatCurrency(hraCondition3)}</span></p>
                       <div className="pt-2 mt-2 border-t border-border flex justify-between font-bold text-brand-orange">
                         <span>Final HRA Exemption:</span>
                         <span className="font-mono text-lg">{formatCurrency(hraExemption)}</span>
                       </div>
                    </div>
                  </div>

                  {/* OTHER DEDUCTIONS */}
                  <div>
                    <h3 className="font-bold text-sm uppercase tracking-widest text-brand-orange mb-4 border-b border-border pb-2">Other Deductions</h3>
                    <div className="space-y-1">
                      <InputRow label="80E - Education Loan Interest" value={ded80E} onChange={setDed80E} />
                      <InputRow label="80G - Donations" value={ded80G} onChange={setDed80G} />
                      <InputRow label="80TTA - Savings Interest" value={ded80TTA} onChange={setDed80TTA} />
                      <InputRow label="24B - Home Loan Interest" value={ded24B} onChange={setDed24B} />
                      <InputRow label="80CCD(1B) - NPS Contribution" value={ded80CCD1B} onChange={setDed80CCD1B} />
                    </div>
                  </div>

               </div>
             )}
           </div>

        </div>

        {/* ─── RIGHT COLUMN: RESULTS ─── */}
        <div className="lg:col-span-5 space-y-6">
           
           {/* COMPARISON CARD */}
           <div className="bg-card border border-border p-6 rounded-[2.5rem] shadow-xl relative overflow-hidden">
             
             {/* Decorative Background */}
             <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl opacity-10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20 ${winningRegime === 'NEW' ? 'from-brand-orange to-red-500' : 'from-blue-500 to-indigo-500'}`}></div>

             <div className="text-center mb-6">
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-2">Recommended Regime</p>
                <div className="inline-flex items-center gap-2 bg-green-500/10 text-green-600 dark:text-green-400 px-4 py-2 rounded-full font-bold">
                  ✅ {winningRegime} REGIME SAVES YOU {formatCurrency(taxSavings)}
                </div>
             </div>

             <div className="grid grid-cols-2 gap-4 text-sm relative z-10">
               
               {/* New Regime Column */}
               <div className={`p-4 rounded-2xl border transition-all ${winningRegime === 'NEW' ? 'border-brand-orange bg-brand-orange/5 shadow-md' : 'border-transparent opacity-60'}`}>
                 <h4 className="font-bold font-syne text-center mb-4 text-brand-orange">NEW REGIME</h4>
                 <div className="space-y-3 font-mono">
                   <div className="flex justify-between"><span className="text-muted-foreground font-sans text-xs">Gross Income</span> <span>{formatCurrency(totalGrossIncome)}</span></div>
                   <div className="flex justify-between"><span className="text-muted-foreground font-sans text-xs">Deductions (Std)</span> <span>{formatCurrency(newRegimeStandardDeduction)}</span></div>
                   <div className="flex justify-between font-bold border-t border-border/50 pt-2"><span className="font-sans text-xs">Taxable</span> <span>{formatCurrency(taxableIncomeNew)}</span></div>
                   
                   <div className="flex justify-between mt-4"><span className="text-muted-foreground font-sans text-xs">Tax</span> <span>{formatCurrency(newTaxResult.tax)}</span></div>
                   <div className="flex justify-between"><span className="text-muted-foreground font-sans text-xs">Surcharge</span> <span>{formatCurrency(newTaxResult.surcharge)}</span></div>
                   <div className="flex justify-between"><span className="text-muted-foreground font-sans text-xs">Cess (4%)</span> <span>{formatCurrency(newTaxResult.cess)}</span></div>
                   
                   <div className="flex justify-between font-bold text-lg border-t border-border/50 pt-2 text-foreground"><span className="font-sans text-sm">Total Tax</span> <span>{formatCurrency(newTaxResult.totalTax)}</span></div>
                 </div>
               </div>

               {/* Old Regime Column */}
               <div className={`p-4 rounded-2xl border transition-all ${winningRegime === 'OLD' ? 'border-blue-500 bg-blue-500/5 shadow-md' : 'border-transparent opacity-60'}`}>
                 <h4 className="font-bold font-syne text-center mb-4 text-blue-500">OLD REGIME</h4>
                 <div className="space-y-3 font-mono">
                   <div className="flex justify-between"><span className="text-muted-foreground font-sans text-xs">Gross Income</span> <span>{formatCurrency(totalGrossIncome)}</span></div>
                   <div className="flex justify-between"><span className="text-muted-foreground font-sans text-xs">Deductions (All)</span> <span>{formatCurrency(totalOldDeductions)}</span></div>
                   <div className="flex justify-between font-bold border-t border-border/50 pt-2"><span className="font-sans text-xs">Taxable</span> <span>{formatCurrency(taxableIncomeOld)}</span></div>
                   
                   <div className="flex justify-between mt-4"><span className="text-muted-foreground font-sans text-xs">Tax</span> <span>{formatCurrency(oldTaxResult.tax)}</span></div>
                   <div className="flex justify-between"><span className="text-muted-foreground font-sans text-xs">Surcharge</span> <span>{formatCurrency(oldTaxResult.surcharge)}</span></div>
                   <div className="flex justify-between"><span className="text-muted-foreground font-sans text-xs">Cess (4%)</span> <span>{formatCurrency(oldTaxResult.cess)}</span></div>
                   
                   <div className="flex justify-between font-bold text-lg border-t border-border/50 pt-2 text-foreground"><span className="font-sans text-sm">Total Tax</span> <span>{formatCurrency(oldTaxResult.totalTax)}</span></div>
                 </div>
               </div>

             </div>

           </div>

           {/* PIE CHART */}
           <div className="bg-card border border-border p-6 rounded-[2.5rem] shadow-sm">
             <h3 className="font-bold font-syne mb-4 text-center">Salary Distribution (Recommended Regime)</h3>
             <div className="h-64 w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie
                     data={pieData}
                     cx="50%"
                     cy="50%"
                     innerRadius={60}
                     outerRadius={80}
                     paddingAngle={5}
                     dataKey="value"
                   >
                     {pieData.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                     ))}
                   </Pie>
                   <Tooltip formatter={(value: number) => formatCurrency(value)} />
                   <Legend />
                 </PieChart>
               </ResponsiveContainer>
             </div>
           </div>

           {/* MONTHLY BREAKUP */}
           <div className="bg-muted/30 border border-border p-6 rounded-[2.5rem] shadow-sm">
             <h3 className="font-bold font-syne mb-4 flex items-center gap-2">📅 Monthly Salary Breakup</h3>
             <div className="space-y-3 font-mono text-sm">
               <div className="flex justify-between"><span className="font-sans text-muted-foreground">Gross Monthly</span> <span className="font-bold">{formatCurrency(monthlyGross)}</span></div>
               <div className="flex justify-between text-red-500/80"><span className="font-sans">Less: EPF</span> <span>-{formatCurrency(monthlyEpf)}</span></div>
               <div className="flex justify-between text-red-500/80"><span className="font-sans">Less: Prof. Tax</span> <span>-{formatCurrency(monthlyPt)}</span></div>
               <div className="flex justify-between text-red-500/80"><span className="font-sans">Less: TDS (Tax)</span> <span>-{formatCurrency(monthlyTax)}</span></div>
               <div className="flex justify-between border-t border-border pt-3 mt-3 font-bold text-lg text-green-600 dark:text-green-400">
                 <span className="font-sans">NET IN-HAND</span> 
                 <span>{formatCurrency(monthlyNet)}</span>
               </div>
             </div>
           </div>

           {/* SLAB BREAKDOWN */}
           <div className="bg-card border border-border p-6 rounded-[2.5rem] shadow-sm">
             <h3 className="font-bold font-syne mb-4 text-sm text-center">Tax Slab Breakdown ({winningRegime} Regime)</h3>
             <div className="overflow-x-auto">
               <table className="w-full text-left text-xs font-mono">
                 <thead className="bg-muted/50 border-b border-border">
                   <tr>
                     <th className="py-2 px-2">Slab</th>
                     <th className="py-2 px-2 text-right">Taxable</th>
                     <th className="py-2 px-2 text-right">Tax</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-border/50">
                   {(winningRegime === 'NEW' ? newTaxResult.breakdown : oldTaxResult.breakdown).map((b, i) => (
                     <tr key={i} className="hover:bg-muted/20">
                       <td className="py-2 px-2">{b.slab} <span className="text-muted-foreground opacity-50">@{b.rate}%</span></td>
                       <td className="py-2 px-2 text-right">{formatCurrency(b.taxable)}</td>
                       <td className="py-2 px-2 text-right font-bold">{formatCurrency(b.tax)}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           </div>

        </div>

      </div>
    </div>
  )
}
