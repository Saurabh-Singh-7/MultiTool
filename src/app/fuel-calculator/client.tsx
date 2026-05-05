'use client'

import React, { useState } from 'react'

export default function FuelCalculatorClient() {
  const [distance, setDistance] = useState<string>('500')
  const [efficiency, setEfficiency] = useState<string>('15')
  const [price, setPrice] = useState<string>('103')
  const [unit, setUnit] = useState<'metric'|'imperial'>('metric')
  const [vehicle, setVehicle] = useState('car')

  const distVal = parseFloat(distance) || 0
  const effVal = parseFloat(efficiency) || 0
  const priceVal = parseFloat(price) || 0

  let fuelNeeded = 0
  let totalCost = 0
  let costPerKm = 0

  if (effVal > 0) {
    fuelNeeded = distVal / effVal
    totalCost = fuelNeeded * priceVal
    costPerKm = distVal > 0 ? totalCost / distVal : 0
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: unit === 'metric' ? 'INR' : 'USD', maximumFractionDigits: 2 }).format(val)
  }

  return (
    <div className="bg-card border border-border p-8 rounded-[2.5rem] shadow-sm flex flex-col md:flex-row gap-12">
      
      <div className="flex-1 space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold font-syne">Trip Details</h2>
          <div className="bg-muted/50 p-1 rounded-xl flex text-xs font-bold">
            <button onClick={() => setUnit('metric')} className={`px-3 py-1 rounded-lg transition-all ${unit === 'metric' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>Metric (km/L)</button>
            <button onClick={() => setUnit('imperial')} className={`px-3 py-1 rounded-lg transition-all ${unit === 'imperial' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>Imperial (mpg)</button>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          {[{id:'car', icon:'🚗', label:'Car'}, {id:'bike', icon:'🏍', label:'Bike'}, {id:'bus', icon:'🚌', label:'Bus'}].map(v => (
            <button 
              key={v.id}
              onClick={() => setVehicle(v.id)}
              className={`flex-1 py-3 flex flex-col items-center gap-1 rounded-2xl border transition-all ${vehicle === v.id ? 'bg-brand-orange/10 border-brand-orange text-brand-orange' : 'border-border bg-muted/20 hover:bg-muted/50'}`}
            >
              <span className="text-2xl">{v.icon}</span>
              <span className="text-xs font-bold">{v.label}</span>
            </button>
          ))}
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-muted-foreground uppercase tracking-widest mb-2">Distance ({unit === 'metric' ? 'km' : 'miles'})</label>
            <input 
              type="number" 
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 font-mono focus:ring-2 focus:ring-brand-orange/50 transition-all focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-muted-foreground uppercase tracking-widest mb-2">Fuel Efficiency ({unit === 'metric' ? 'km/L' : 'mpg'})</label>
            <input 
              type="number" 
              value={efficiency}
              onChange={(e) => setEfficiency(e.target.value)}
              className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 font-mono focus:ring-2 focus:ring-brand-orange/50 transition-all focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-muted-foreground uppercase tracking-widest mb-2">Fuel Price ({unit === 'metric' ? 'per Liter' : 'per Gallon'})</label>
            <input 
              type="number" 
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 font-mono focus:ring-2 focus:ring-brand-orange/50 transition-all focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 bg-muted/10 p-6 rounded-3xl border border-border flex flex-col justify-center">
        <h2 className="text-xl font-bold font-syne mb-8 text-brand-orange text-center">Estimation</h2>
        
        <div className="space-y-6 font-mono max-w-sm mx-auto w-full">
          <div className="text-center p-6 bg-background border border-border rounded-2xl shadow-sm">
            <span className="text-sm text-muted-foreground block mb-2 font-sans uppercase tracking-widest">Total Trip Cost</span>
            <span className="text-4xl font-extrabold text-foreground">{formatCurrency(totalCost)}</span>
          </div>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center p-4 bg-muted/30 rounded-xl">
              <span className="text-muted-foreground font-sans">Fuel Required</span>
              <span className="font-bold text-lg">{fuelNeeded.toFixed(2)} <span className="text-xs text-muted-foreground font-normal">{unit === 'metric' ? 'Liters' : 'Gallons'}</span></span>
            </div>
            <div className="flex justify-between items-center p-4 bg-muted/30 rounded-xl">
              <span className="text-muted-foreground font-sans">Cost per {unit === 'metric' ? 'km' : 'mile'}</span>
              <span className="font-bold text-lg">{formatCurrency(costPerKm)}</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
