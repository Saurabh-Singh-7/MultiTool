'use client'
import React, { useState, useRef, useEffect } from 'react'

const fmt = (ms: number) => {
  const h = Math.floor(ms / 3600000)
  const m = Math.floor((ms % 3600000) / 60000)
  const s = Math.floor((ms % 60000) / 1000)
  const cs = Math.floor((ms % 1000) / 10)
  return { h, m, s, cs, str: `${h > 0 ? String(h).padStart(2, '0') + ':' : ''}${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(cs).padStart(2, '0')}` }
}

export default function StopwatchClient() {
  const [tab, setTab] = useState<'stopwatch' | 'timer'>('stopwatch')

  // ── STOPWATCH ──
  const [swRunning, setSwRunning] = useState(false)
  const [swTime, setSwTime] = useState(0)
  const [laps, setLaps] = useState<number[]>([])
  const swRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const swStart = useRef(0)

  useEffect(() => {
    if (swRunning) {
      swStart.current = Date.now() - swTime
      swRef.current = setInterval(() => setSwTime(Date.now() - swStart.current), 10)
    } else if (swRef.current) clearInterval(swRef.current)
    return () => { if (swRef.current) clearInterval(swRef.current) }
  }, [swRunning])

  const swReset = () => { setSwRunning(false); setSwTime(0); setLaps([]) }
  const swLap = () => setLaps(prev => [swTime, ...prev])

  // ── TIMER ──
  const [timerMin, setTimerMin] = useState(5)
  const [timerSec, setTimerSec] = useState(0)
  const [timerRunning, setTimerRunning] = useState(false)
  const [timerMs, setTimerMs] = useState(0)
  const [timerDone, setTimerDone] = useState(false)
  const tmRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const tmEnd = useRef(0)

  const startTimer = () => {
    const total = (timerMin * 60 + timerSec) * 1000
    if (total <= 0) return
    tmEnd.current = Date.now() + total
    setTimerMs(total)
    setTimerRunning(true)
    setTimerDone(false)
  }

  useEffect(() => {
    if (timerRunning) {
      tmRef.current = setInterval(() => {
        const remaining = tmEnd.current - Date.now()
        if (remaining <= 0) {
          setTimerMs(0); setTimerRunning(false); setTimerDone(true)
          if (tmRef.current) clearInterval(tmRef.current)
          // Audio alert
          try {
            const ctx = new AudioContext()
            const osc = ctx.createOscillator(); osc.type = 'sine'; osc.frequency.value = 800
            osc.connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime + 0.3)
            setTimeout(() => { const o2 = ctx.createOscillator(); o2.type = 'sine'; o2.frequency.value = 1000; o2.connect(ctx.destination); o2.start(); o2.stop(ctx.currentTime + 0.5) }, 400)
          } catch {}
        } else setTimerMs(remaining)
      }, 50)
    } else if (tmRef.current) clearInterval(tmRef.current)
    return () => { if (tmRef.current) clearInterval(tmRef.current) }
  }, [timerRunning])

  const swFmt = fmt(swTime)
  const tmFmt = fmt(timerMs)

  return (
    <div className="space-y-8">
      {/* Tabs */}
      <div className="flex gap-2 justify-center">
        <button onClick={() => setTab('stopwatch')} className={`px-6 py-3 rounded-xl text-sm font-bold border transition-all ${tab === 'stopwatch' ? 'bg-brand-orange text-white border-brand-orange shadow-md' : 'border-border hover:bg-muted'}`}>⏱️ Stopwatch</button>
        <button onClick={() => setTab('timer')} className={`px-6 py-3 rounded-xl text-sm font-bold border transition-all ${tab === 'timer' ? 'bg-brand-orange text-white border-brand-orange shadow-md' : 'border-border hover:bg-muted'}`}>⏳ Timer</button>
      </div>

      {tab === 'stopwatch' ? (
        <div className="bg-card border border-border p-10 rounded-[2.5rem] shadow-sm text-center space-y-8">
          <div className="font-mono text-7xl sm:text-8xl font-extrabold tracking-tight tabular-nums text-foreground select-none">
            {swFmt.str}
          </div>
          <div className="flex gap-3 justify-center">
            <button onClick={() => setSwRunning(!swRunning)}
              className={`px-8 py-4 rounded-2xl text-lg font-bold transition-all shadow-md ${swRunning ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-brand-orange hover:bg-brand-orange-hover text-white shadow-brand-orange/20'}`}>
              {swRunning ? '⏸ Pause' : swTime > 0 ? '▶ Resume' : '▶ Start'}
            </button>
            {swTime > 0 && swRunning && <button onClick={swLap} className="px-6 py-4 bg-muted border border-border rounded-2xl text-lg font-bold transition-all hover:bg-muted/80">🏁 Lap</button>}
            {swTime > 0 && !swRunning && <button onClick={swReset} className="px-6 py-4 bg-muted border border-border rounded-2xl text-lg font-bold transition-all hover:bg-muted/80">🔄 Reset</button>}
          </div>
          {laps.length > 0 && (
            <div className="max-h-64 overflow-auto space-y-2 text-left">
              {laps.map((lap, i) => (
                <div key={i} className="flex justify-between items-center px-4 py-2 bg-muted/20 rounded-xl font-mono text-sm border border-border">
                  <span className="text-muted-foreground">Lap {laps.length - i}</span>
                  <span className="font-bold">{fmt(lap).str}</span>
                  {i < laps.length - 1 && <span className="text-xs text-brand-orange">+{fmt(lap - laps[i + 1]).str}</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-card border border-border p-10 rounded-[2.5rem] shadow-sm text-center space-y-8">
          {!timerRunning && timerMs === 0 && !timerDone ? (
            <div className="flex items-center justify-center gap-4">
              <div>
                <label className="block text-xs text-muted-foreground mb-2 font-bold uppercase tracking-widest">Minutes</label>
                <input type="number" min={0} max={999} value={timerMin} onChange={(e) => setTimerMin(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-28 text-center text-4xl font-mono font-bold bg-muted/30 border border-border rounded-2xl py-4" />
              </div>
              <span className="text-4xl font-bold text-muted-foreground mt-6">:</span>
              <div>
                <label className="block text-xs text-muted-foreground mb-2 font-bold uppercase tracking-widest">Seconds</label>
                <input type="number" min={0} max={59} value={timerSec} onChange={(e) => setTimerSec(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                  className="w-28 text-center text-4xl font-mono font-bold bg-muted/30 border border-border rounded-2xl py-4" />
              </div>
            </div>
          ) : (
            <div className={`font-mono text-7xl sm:text-8xl font-extrabold tracking-tight tabular-nums select-none ${timerDone ? 'text-brand-orange animate-pulse' : 'text-foreground'}`}>
              {timerDone ? '00:00.00' : tmFmt.str}
            </div>
          )}

          {timerDone && <p className="text-2xl font-bold text-brand-orange">⏰ Time&apos;s up!</p>}

          <div className="flex gap-3 justify-center">
            {!timerRunning && timerMs === 0 && !timerDone && (
              <button onClick={startTimer} className="px-8 py-4 bg-brand-orange hover:bg-brand-orange-hover text-white rounded-2xl text-lg font-bold transition-all shadow-md shadow-brand-orange/20">▶ Start Timer</button>
            )}
            {timerRunning && (
              <button onClick={() => setTimerRunning(false)} className="px-8 py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl text-lg font-bold transition-all shadow-md">⏸ Pause</button>
            )}
            {!timerRunning && timerMs > 0 && (
              <button onClick={() => { tmEnd.current = Date.now() + timerMs; setTimerRunning(true) }} className="px-8 py-4 bg-brand-orange hover:bg-brand-orange-hover text-white rounded-2xl text-lg font-bold transition-all shadow-md">▶ Resume</button>
            )}
            {(timerMs > 0 || timerDone) && (
              <button onClick={() => { setTimerRunning(false); setTimerMs(0); setTimerDone(false) }} className="px-6 py-4 bg-muted border border-border rounded-2xl text-lg font-bold transition-all">🔄 Reset</button>
            )}
          </div>

          <div className="flex gap-2 justify-center flex-wrap">
            {[1, 3, 5, 10, 15, 25, 30, 60].map(m => (
              <button key={m} onClick={() => { setTimerMin(m); setTimerSec(0) }}
                className="px-3 py-1.5 bg-muted/30 border border-border rounded-xl text-xs font-bold hover:border-brand-orange/40 transition-all">{m} min</button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
