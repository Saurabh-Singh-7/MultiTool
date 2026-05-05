'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'

// ─── UTILS & DATA ────────────────────────────────────────────────────────

const FALLBACK_RATES: Record<string, number> = {
  USD: 1, INR: 83.24, EUR: 0.92, GBP: 0.79, JPY: 149.8, CAD: 1.36,
  AUD: 1.53, CHF: 0.89, CNY: 7.24, SGD: 1.34, AED: 3.67, SAR: 3.75,
  BRL: 5.02, MXN: 16.7, ZAR: 18.9, RUB: 92.5, TRY: 32.1, KRW: 1350.5
}

interface CurrencyMeta {
  name: string
  symbol: string
  country: string
  flag: string
}

const CURRENCY_INFO: Record<string, CurrencyMeta> = {
  USD: { name: 'US Dollar', symbol: '$', country: 'United States', flag: '🇺🇸' },
  EUR: { name: 'Euro', symbol: '€', country: 'Eurozone', flag: '🇪🇺' },
  GBP: { name: 'British Pound', symbol: '£', country: 'United Kingdom', flag: '🇬🇧' },
  INR: { name: 'Indian Rupee', symbol: '₹', country: 'India', flag: '🇮🇳' },
  JPY: { name: 'Japanese Yen', symbol: '¥', country: 'Japan', flag: '🇯🇵' },
  CAD: { name: 'Canadian Dollar', symbol: '$', country: 'Canada', flag: '🇨🇦' },
  AUD: { name: 'Australian Dollar', symbol: '$', country: 'Australia', flag: '🇦🇺' },
  CHF: { name: 'Swiss Franc', symbol: 'Fr', country: 'Switzerland', flag: '🇨🇭' },
  CNY: { name: 'Chinese Yuan', symbol: '¥', country: 'China', flag: '🇨🇳' },
  SGD: { name: 'Singapore Dollar', symbol: '$', country: 'Singapore', flag: '🇸🇬' },
  AED: { name: 'UAE Dirham', symbol: 'د.إ', country: 'United Arab Emirates', flag: '🇦🇪' },
  SAR: { name: 'Saudi Riyal', symbol: 'ر.س', country: 'Saudi Arabia', flag: '🇸🇦' },
  BRL: { name: 'Brazilian Real', symbol: 'R$', country: 'Brazil', flag: '🇧🇷' },
  MXN: { name: 'Mexican Peso', symbol: '$', country: 'Mexico', flag: '🇲🇽' },
  ZAR: { name: 'South African Rand', symbol: 'R', country: 'South Africa', flag: '🇿🇦' },
  KRW: { name: 'South Korean Won', symbol: '₩', country: 'South Korea', flag: '🇰🇷' },
  RUB: { name: 'Russian Ruble', symbol: '₽', country: 'Russia', flag: '🇷🇺' },
  TRY: { name: 'Turkish Lira', symbol: '₺', country: 'Turkey', flag: '🇹🇷' },
  NZD: { name: 'New Zealand Dollar', symbol: '$', country: 'New Zealand', flag: '🇳🇿' },
  SEK: { name: 'Swedish Krona', symbol: 'kr', country: 'Sweden', flag: '🇸🇪' },
  NOK: { name: 'Norwegian Krone', symbol: 'kr', country: 'Norway', flag: '🇳🇴' },
  DKK: { name: 'Danish Krone', symbol: 'kr', country: 'Denmark', flag: '🇩🇰' },
  HKD: { name: 'Hong Kong Dollar', symbol: '$', country: 'Hong Kong', flag: '🇭🇰' },
  IDR: { name: 'Indonesian Rupiah', symbol: 'Rp', country: 'Indonesia', flag: '🇮🇩' },
  MYR: { name: 'Malaysian Ringgit', symbol: 'RM', country: 'Malaysia', flag: '🇲🇾' },
  PHP: { name: 'Philippine Peso', symbol: '₱', country: 'Philippines', flag: '🇵🇭' },
  THB: { name: 'Thai Baht', symbol: '฿', country: 'Thailand', flag: '🇹🇭' },
  VND: { name: 'Vietnamese Dong', symbol: '₫', country: 'Vietnam', flag: '🇻🇳' },
  PLN: { name: 'Polish Zloty', symbol: 'zł', country: 'Poland', flag: '🇵🇱' },
  ILS: { name: 'Israeli New Shekel', symbol: '₪', country: 'Israel', flag: '🇮🇱' }
}

const POPULAR_CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'SGD', 'AED', 'SAR']
const DEFAULT_MULTI_LIST = ['INR', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'SGD', 'AED']

// ─── COMPONENTS ─────────────────────────────────────────────────────────

export default function CurrencyConverterClient() {
  const [rates, setRates] = useState<Record<string, number>>({})
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [loading, setLoading] = useState(true)
  const [usingFallback, setUsingFallback] = useState(false)
  
  // Converter State
  const [amount1, setAmount1] = useState<string>('1000')
  const [currency1, setCurrency1] = useState('USD')
  const [amount2, setAmount2] = useState<string>('')
  const [currency2, setCurrency2] = useState('INR')
  
  // Trend indicator
  const [trend, setTrend] = useState<{type: 'up'|'down'|'neutral', percent: number, text: string} | null>(null)
  
  // Multi Converter State
  const [multiCurrencies, setMultiCurrencies] = useState<string[]>(DEFAULT_MULTI_LIST)
  const [showMultiSettings, setShowMultiSettings] = useState(false)

  const fetchRates = async (forceRefresh = false) => {
    setLoading(true)
    setUsingFallback(false)
    try {
      if (!forceRefresh) {
        const cached = localStorage.getItem('exchangeRates')
        const cacheTime = localStorage.getItem('ratesCacheTime')
        
        if (cached && cacheTime) {
          const age = Date.now() - parseInt(cacheTime)
          if (age < 3600000) { // 1 hour valid cache
            setRates(JSON.parse(cached))
            setLastUpdated(new Date(parseInt(cacheTime)))
            setLoading(false)
            calculateTrend(JSON.parse(cached))
            return
          }
        }
      }

      const res = await fetch('https://open.er-api.com/v6/latest/USD')
      if (!res.ok) throw new Error('API failed')
      const data = await res.json()

      // Save yesterday's rate roughly if cache existed
      const oldCache = localStorage.getItem('exchangeRates')
      if (oldCache) {
        localStorage.setItem('exchangeRates_yesterday', oldCache)
      }

      localStorage.setItem('exchangeRates', JSON.stringify(data.rates))
      localStorage.setItem('ratesCacheTime', Date.now().toString())

      setRates(data.rates)
      setLastUpdated(new Date())
      setLoading(false)
      calculateTrend(data.rates)
    } catch (err) {
      console.error(err)
      setRates(FALLBACK_RATES)
      setUsingFallback(true)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRates()
  }, [])

  // Trend logic
  const calculateTrend = (currentRates: Record<string, number>) => {
    try {
      const yesterdayStr = localStorage.getItem('exchangeRates_yesterday')
      if (!yesterdayStr) return
      const yesterdayRates = JSON.parse(yesterdayStr)
      
      const oldRate = yesterdayRates[currency2] / yesterdayRates[currency1]
      const newRate = currentRates[currency2] / currentRates[currency1]
      
      if (!oldRate || !newRate) return
      
      const diff = newRate - oldRate
      const percent = (Math.abs(diff) / oldRate) * 100
      
      if (percent < 0.01) {
        setTrend({ type: 'neutral', percent: 0, text: `${currency1} is stable against ${currency2} compared to your last visit.` })
      } else if (diff > 0) {
        setTrend({ type: 'up', percent, text: `📈 ${currency1} has strengthened against ${currency2} by ${percent.toFixed(2)}% since your last visit.` })
      } else {
        setTrend({ type: 'down', percent, text: `📉 ${currency1} has weakened against ${currency2} by ${percent.toFixed(2)}% since your last visit.` })
      }
    } catch(e) {
      // Ignore
    }
  }

  // Recalculate trend when currencies change
  useEffect(() => {
    if (Object.keys(rates).length > 0) {
      calculateTrend(rates)
    }
  }, [currency1, currency2, rates])

  const convert = (amount: number, from: string, to: string) => {
    if (!rates[from] || !rates[to]) return 0
    const inUSD = amount / rates[from]
    return inUSD * rates[to]
  }

  // Effect to recalculate amount2 when amount1, currency1, or currency2 changes
  useEffect(() => {
    if (amount1 === '') {
      setAmount2('')
      return
    }
    const val = parseFloat(amount1)
    if (!isNaN(val)) {
      const result = convert(val, currency1, currency2)
      // Format to 2 or 4 decimal places intelligently
      const formatted = result < 0.01 ? result.toPrecision(4) : result.toFixed(2)
      setAmount2(formatted)
    }
  }, [amount1, currency1, currency2, rates])

  const handleAmount2Change = (val: string) => {
    setAmount2(val)
    if (val === '') {
      setAmount1('')
      return
    }
    const parsed = parseFloat(val)
    if (!isNaN(parsed)) {
      const result = convert(parsed, currency2, currency1)
      setAmount1(result.toFixed(2))
    }
  }

  const handleSwap = () => {
    setCurrency1(currency2)
    setCurrency2(currency1)
    setAmount1(amount2) // The effect will auto-calculate the new amount2
  }

  const getMeta = (code: string) => CURRENCY_INFO[code] || { name: code, symbol: code, country: 'Unknown', flag: '🏳' }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(num)
  }

  // ─── CUSTOM DROPDOWN COMPONENT ───────────────────────────────────────
  
  const CurrencySelect = ({ value, onChange, label }: { value: string, onChange: (v: string) => void, label: string }) => {
    const [isOpen, setIsOpen] = useState(false)
    const [search, setSearch] = useState('')
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false)
      }
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const allCodes = Object.keys(rates).length > 0 ? Object.keys(rates) : Object.keys(FALLBACK_RATES)
    
    const filteredCodes = allCodes.filter(c => {
      const meta = getMeta(c)
      const term = search.toLowerCase()
      return c.toLowerCase().includes(term) || meta.name.toLowerCase().includes(term) || meta.country.toLowerCase().includes(term)
    })

    const selectedMeta = getMeta(value)

    return (
      <div className="relative" ref={ref}>
        <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">{label}</label>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between w-full bg-muted/30 border border-border rounded-xl px-4 py-3 hover:border-brand-orange/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">{selectedMeta.flag}</span>
            <div className="text-left flex flex-col">
              <span className="font-bold text-foreground leading-none">{value}</span>
              <span className="text-xs text-muted-foreground truncate max-w-[120px]">{selectedMeta.name}</span>
            </div>
          </div>
          <span className="text-muted-foreground text-xs">▼</span>
        </button>

        {isOpen && (
          <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2">
            <div className="p-2 border-b border-border bg-muted/10">
              <input 
                type="text" 
                placeholder="Search currency..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-background border border-input rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand-orange"
              />
            </div>
            <div className="max-h-60 overflow-y-auto p-1">
              {search === '' && (
                <div className="px-2 py-1 text-xs font-bold text-muted-foreground uppercase bg-muted/30">Popular</div>
              )}
              {(search === '' ? POPULAR_CURRENCIES : filteredCodes).map(code => {
                const meta = getMeta(code)
                return (
                  <button
                    key={code}
                    onClick={() => { onChange(code); setIsOpen(false); setSearch('') }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-brand-orange/10 hover:text-brand-orange transition-colors ${value === code ? 'bg-brand-orange/5 font-bold text-brand-orange' : ''}`}
                  >
                    <span className="text-xl">{meta.flag}</span>
                    <span className="w-10 text-sm">{code}</span>
                    <span className="text-xs text-muted-foreground truncate">{meta.name}</span>
                  </button>
                )
              })}
              {search === '' && (
                <div className="px-2 py-1 mt-2 text-xs font-bold text-muted-foreground uppercase bg-muted/30">All Currencies</div>
              )}
              {search === '' && allCodes.filter(c => !POPULAR_CURRENCIES.includes(c)).map(code => {
                const meta = getMeta(code)
                return (
                  <button
                    key={code}
                    onClick={() => { onChange(code); setIsOpen(false); setSearch('') }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-brand-orange/10 hover:text-brand-orange transition-colors ${value === code ? 'bg-brand-orange/5 font-bold text-brand-orange' : ''}`}
                  >
                    <span className="text-xl">{meta.flag}</span>
                    <span className="w-10 text-sm">{code}</span>
                    <span className="text-xs text-muted-foreground truncate">{meta.name}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
    )
  }

  // ─── RENDERERS ────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-pulse">
        <div className="bg-card border border-border rounded-[2.5rem] p-8 h-[300px] flex items-center justify-center flex-col">
           <div className="w-12 h-12 border-4 border-brand-orange/20 border-t-brand-orange rounded-full animate-spin mb-4"></div>
           <p className="text-muted-foreground font-medium">⏳ Loading live exchange rates...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      {usingFallback && (
        <div className="bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 p-4 rounded-2xl flex items-center gap-3">
          <span className="text-xl">⚠</span>
          <div>
            <p className="font-bold text-sm">Using approximate offline rates</p>
            <p className="text-xs opacity-80">Live rates are currently unavailable. Refresh to try again.</p>
          </div>
        </div>
      )}

      {/* Main Converter */}
      <div className="bg-card border border-border p-8 rounded-[2.5rem] shadow-sm relative z-10">
        
        {/* Status Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-4 border-b border-border text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${usingFallback ? 'bg-orange-500 animate-none' : 'bg-green-500 animate-ping'}`}></span>
              <span className={`relative inline-flex h-2 w-2 rounded-full ${usingFallback ? 'bg-orange-500' : 'bg-green-500'}`}></span>
            </span>
            {usingFallback ? 'Offline Mode' : `Rates last updated: ${lastUpdated?.toLocaleTimeString()}`}
          </div>
          <div className="flex gap-4 items-center">
            <span>Source: Open Exchange Rates</span>
            <button onClick={() => fetchRates(true)} className="hover:text-brand-orange transition-colors flex items-center gap-1 bg-muted/50 px-2 py-1 rounded-lg">
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* Converter Inputs */}
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1 w-full bg-muted/10 p-6 rounded-3xl border border-border focus-within:border-brand-orange/50 focus-within:ring-1 focus-within:ring-brand-orange/50 transition-all">
            <CurrencySelect label="From" value={currency1} onChange={setCurrency1} />
            <input 
              type="number" 
              value={amount1}
              onChange={(e) => setAmount1(e.target.value)}
              className="w-full bg-transparent text-4xl font-extrabold font-mono mt-6 focus:outline-none placeholder:text-muted-foreground/30"
              placeholder="0.00"
            />
          </div>

          <button 
            onClick={handleSwap}
            className="w-14 h-14 shrink-0 rounded-full bg-brand-orange text-white flex items-center justify-center hover:scale-110 hover:shadow-lg hover:shadow-brand-orange/20 transition-all z-10 -my-4 md:my-0 md:-mx-10"
            title="Swap Currencies"
          >
            <span className="text-2xl">⇄</span>
          </button>

          <div className="flex-1 w-full bg-muted/10 p-6 rounded-3xl border border-border focus-within:border-brand-orange/50 focus-within:ring-1 focus-within:ring-brand-orange/50 transition-all">
            <CurrencySelect label="To" value={currency2} onChange={setCurrency2} />
            <input 
              type="number" 
              value={amount2}
              onChange={(e) => handleAmount2Change(e.target.value)}
              className="w-full bg-transparent text-4xl font-extrabold font-mono mt-6 focus:outline-none text-brand-orange placeholder:text-brand-orange/30"
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Exchange Rate Summary */}
        <div className="mt-8 bg-brand-orange/5 border border-brand-orange/20 rounded-2xl p-6 text-center space-y-2">
           <p className="text-xl font-bold">
             1 {currency1} = <span className="text-brand-orange font-mono">{(convert(1, currency1, currency2)).toFixed(4)} {currency2}</span>
           </p>
           <p className="text-sm text-muted-foreground font-mono">
             1 {currency2} = {(convert(1, currency2, currency1)).toFixed(4)} {currency1}
           </p>
        </div>

        {trend && (
          <div className="mt-4 text-center text-sm">
            <span className={`px-3 py-1 rounded-full font-medium ${trend.type === 'up' ? 'bg-green-500/10 text-green-600 dark:text-green-400' : trend.type === 'down' ? 'bg-red-500/10 text-red-600 dark:text-red-400' : 'bg-muted text-muted-foreground'}`}>
              {trend.text}
            </span>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        
        {/* Multi Currency View */}
        <div className="md:col-span-2 space-y-6">
          <div className="flex justify-between items-end mb-4">
             <div>
               <h2 className="text-2xl font-bold font-syne flex items-center gap-2">🌍 Multi Converter</h2>
               <p className="text-sm text-muted-foreground">Convert <span className="font-bold">{amount1 || 1} {currency1}</span> to multiple currencies instantly.</p>
             </div>
             <button 
               onClick={() => setShowMultiSettings(!showMultiSettings)}
               className="text-sm bg-muted hover:bg-muted/80 px-4 py-2 rounded-xl transition-colors font-semibold"
             >
               ⚙️ Customize
             </button>
          </div>

          {showMultiSettings && (
            <div className="bg-card border border-border p-6 rounded-[2rem] shadow-sm mb-6 animate-in fade-in slide-in-from-top-2">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Select Currencies to Show</h3>
                <button onClick={() => setMultiCurrencies(DEFAULT_MULTI_LIST)} className="text-xs text-brand-orange hover:underline">Reset to Default</button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-[200px] overflow-y-auto p-2 border border-border rounded-xl bg-muted/10">
                {Object.keys(rates).slice(0, 50).map(c => (
                  <label key={c} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted/50 p-1.5 rounded-lg transition-colors">
                    <input 
                      type="checkbox" 
                      checked={multiCurrencies.includes(c)}
                      onChange={(e) => {
                        if (e.target.checked) setMultiCurrencies([...multiCurrencies, c])
                        else setMultiCurrencies(multiCurrencies.filter(mc => mc !== c))
                      }}
                      className="accent-brand-orange"
                    />
                    {getMeta(c).flag} {c}
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="bg-card border border-border rounded-[2.5rem] shadow-sm overflow-hidden">
            <div className="divide-y divide-border">
              {multiCurrencies.map(targetCode => {
                const meta = getMeta(targetCode)
                const amt = parseFloat(amount1 || '1')
                const result = convert(amt, currency1, targetCode)
                if (targetCode === currency1) return null // Skip showing self
                return (
                  <div key={targetCode} className="flex items-center justify-between p-5 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="text-3xl bg-muted/50 w-12 h-12 flex items-center justify-center rounded-2xl">{meta.flag}</div>
                      <div>
                        <div className="font-bold flex items-center gap-2">
                          {targetCode} 
                          <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-md">{meta.symbol}</span>
                        </div>
                        <div className="text-xs text-muted-foreground truncate max-w-[120px] sm:max-w-[200px]">{meta.name}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-lg text-foreground">{formatNumber(result)}</div>
                      <div className="text-xs text-muted-foreground font-mono opacity-60">1 {currency1} = {(result/amt).toFixed(4)}</div>
                    </div>
                  </div>
                )
              })}
              {multiCurrencies.length === 0 && (
                <div className="p-10 text-center text-muted-foreground">No currencies selected. Click customize to add some!</div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          
          <div className="bg-muted/30 border border-border p-6 rounded-[2rem]">
             <h3 className="font-bold font-syne mb-4 flex items-center gap-2">⚡ Popular Pairs</h3>
             <div className="flex flex-wrap gap-2">
               {['USD-INR', 'EUR-INR', 'GBP-INR', 'USD-EUR', 'USD-GBP', 'AED-INR', 'SAR-INR', 'SGD-INR', 'USD-JPY'].map(pair => {
                 const [from, to] = pair.split('-')
                 return (
                   <button 
                     key={pair}
                     onClick={() => { setCurrency1(from); setCurrency2(to) }}
                     className="bg-card hover:bg-brand-orange hover:text-white border border-border px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-sm"
                   >
                     {pair.replace('-', ' → ')}
                   </button>
                 )
               })}
             </div>
          </div>

          <div className="bg-card border border-border p-6 rounded-[2rem] shadow-sm">
             <h3 className="font-bold font-syne mb-4 flex items-center gap-2">ℹ️ Currency Info</h3>
             <div className="space-y-6">
               <div className="bg-muted/30 p-4 rounded-2xl border border-border">
                 <div className="flex items-center gap-2 mb-2">
                   <span className="text-2xl">{getMeta(currency1).flag}</span>
                   <span className="font-bold text-lg">{currency1} — {getMeta(currency1).name}</span>
                 </div>
                 <div className="space-y-1 text-sm text-muted-foreground">
                   <div><span className="font-semibold text-foreground">Symbol:</span> {getMeta(currency1).symbol}</div>
                   <div><span className="font-semibold text-foreground">Country:</span> {getMeta(currency1).country}</div>
                 </div>
               </div>

               <div className="bg-muted/30 p-4 rounded-2xl border border-border">
                 <div className="flex items-center gap-2 mb-2">
                   <span className="text-2xl">{getMeta(currency2).flag}</span>
                   <span className="font-bold text-lg">{currency2} — {getMeta(currency2).name}</span>
                 </div>
                 <div className="space-y-1 text-sm text-muted-foreground">
                   <div><span className="font-semibold text-foreground">Symbol:</span> {getMeta(currency2).symbol}</div>
                   <div><span className="font-semibold text-foreground">Country:</span> {getMeta(currency2).country}</div>
                 </div>
               </div>
             </div>
          </div>

        </div>

      </div>
    </div>
  )
}
