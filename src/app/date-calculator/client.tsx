'use client'

import React, { useState, useEffect } from 'react'

export default function DateCalculatorClient() {
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [result, setResult] = useState<{ totalDays: number, weeks: number, remainingDays: number, workingDays: number, weekends: number, months: number, remainingDaysMonths: number } | null>(null)

  useEffect(() => {
    // Set default dates
    const today = new Date()
    const nextYear = new Date()
    nextYear.setFullYear(today.getFullYear() + 1)
    
    setFromDate(today.toISOString().split('T')[0])
    setToDate(nextYear.toISOString().split('T')[0])
  }, [])

  useEffect(() => {
    if (!fromDate || !toDate) return

    const start = new Date(fromDate)
    const end = new Date(toDate)
    
    // Ensure start is before end
    const from = start <= end ? start : end
    const to = start <= end ? end : start

    // Calculate basic diff
    const diffTime = Math.abs(to.getTime() - from.getTime())
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    const weeks = Math.floor(totalDays / 7)
    const remainingDays = totalDays % 7

    // Calculate working days
    let workingDays = 0
    let current = new Date(from)
    
    // Count inclusive of start date to exclusive of end date to match totalDays exactly
    // Or we can just count day by day for totalDays iterations
    current.setHours(0,0,0,0)
    to.setHours(0,0,0,0)
    
    for (let i = 0; i < totalDays; i++) {
      const day = current.getDay()
      if (day !== 0 && day !== 6) workingDays++
      current.setDate(current.getDate() + 1)
    }

    // Calculate months roughly
    let months = (to.getFullYear() - from.getFullYear()) * 12
    months -= from.getMonth()
    months += to.getMonth()
    
    // Adjust if 'to' day is before 'from' day
    let mFrom = new Date(from)
    mFrom.setMonth(mFrom.getMonth() + months)
    if (mFrom > to) {
      months--
      mFrom = new Date(from)
      mFrom.setMonth(mFrom.getMonth() + months)
    }
    
    const remainingDaysMonths = Math.ceil((to.getTime() - mFrom.getTime()) / (1000 * 60 * 60 * 24))

    setResult({
      totalDays,
      weeks,
      remainingDays,
      workingDays,
      weekends: totalDays - workingDays,
      months: months < 0 ? 0 : months,
      remainingDaysMonths: remainingDaysMonths < 0 ? 0 : remainingDaysMonths
    })

  }, [fromDate, toDate])

  return (
    <div className="bg-card border border-border p-8 rounded-[2.5rem] shadow-sm flex flex-col md:flex-row gap-12">
      
      <div className="flex-1 space-y-6">
        <h2 className="text-xl font-bold font-syne mb-6">Select Dates</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-muted-foreground uppercase tracking-widest mb-2">From Date</label>
            <input 
              type="date" 
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 font-mono focus:ring-2 focus:ring-brand-orange/50 transition-all focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-muted-foreground uppercase tracking-widest mb-2">To Date</label>
            <input 
              type="date" 
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 font-mono focus:ring-2 focus:ring-brand-orange/50 transition-all focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 bg-muted/10 p-6 rounded-3xl border border-border">
        <h2 className="text-xl font-bold font-syne mb-6 text-brand-orange">Result</h2>
        
        {result ? (
          <div className="space-y-6 font-mono">
            <div className="text-center p-4 bg-background border border-border rounded-2xl shadow-sm">
              <span className="text-sm text-muted-foreground block mb-1">Total Difference</span>
              <span className="text-4xl font-extrabold text-foreground">{result.totalDays} <span className="text-xl font-normal text-muted-foreground">days</span></span>
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center p-3 bg-muted/30 rounded-xl">
                <span className="text-muted-foreground">Weeks & Days</span>
                <span className="font-bold">{result.weeks} weeks, {result.remainingDays} days</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/30 rounded-xl">
                <span className="text-muted-foreground">Months & Days</span>
                <span className="font-bold">{result.months} months, {result.remainingDaysMonths} days</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/30 rounded-xl">
                <span className="text-muted-foreground flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500"></span> Working Days</span>
                <span className="font-bold">{result.workingDays} days</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/30 rounded-xl">
                <span className="text-muted-foreground flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-orange-500"></span> Weekends</span>
                <span className="font-bold">{result.weekends} days</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-12">Select valid dates to see difference</div>
        )}
      </div>

    </div>
  )
}
