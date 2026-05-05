'use client'
import React, { useState, useEffect, useRef } from 'react'

type Mode = 'work' | 'break' | 'longBreak'

const DEFAULTS = { work: 25, break: 5, longBreak: 15 }
const MODE_LABELS: Record<Mode, string> = { work: '🎯 Focus', break: '☕ Short Break', longBreak: '🌴 Long Break' }
const MODE_COLORS: Record<Mode, string> = { work: 'text-brand-orange', break: 'text-green-500', longBreak: 'text-blue-500' }
const MODE_BG: Record<Mode, string> = { work: 'bg-brand-orange', break: 'bg-green-500', longBreak: 'bg-blue-500' }

export default function PomodoroClient() {
  const [mode, setMode] = useState<Mode>('work')
  const [workMin, setWorkMin] = useState(DEFAULTS.work)
  const [breakMin, setBreakMin] = useState(DEFAULTS.break)
  const [longBreakMin, setLongBreakMin] = useState(DEFAULTS.longBreak)
  const [timeLeft, setTimeLeft] = useState(DEFAULTS.work * 60)
  const [running, setRunning] = useState(false)
  const [sessions, setSessions] = useState(0)
  const [totalFocusMin, setTotalFocusMin] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const totalTime = mode === 'work' ? workMin * 60 : mode === 'break' ? breakMin * 60 : longBreakMin * 60
  const progress = ((totalTime - timeLeft) / totalTime) * 100

  const playBeep = () => {
    try {
      const ctx = new AudioContext()
      const osc = ctx.createOscillator(); osc.type = 'sine'; osc.frequency.value = 800
      osc.connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime + 0.2)
      setTimeout(() => { const o2 = ctx.createOscillator(); o2.type = 'sine'; o2.frequency.value = 1000; o2.connect(ctx.destination); o2.start(); o2.stop(ctx.currentTime + 0.3) }, 300)
      setTimeout(() => { const o3 = ctx.createOscillator(); o3.type = 'sine'; o3.frequency.value = 1200; o3.connect(ctx.destination); o3.start(); o3.stop(ctx.currentTime + 0.4) }, 600)
    } catch {}
  }

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setRunning(false)
            playBeep()
            // Auto-switch
            if (mode === 'work') {
              setSessions(s => s + 1)
              setTotalFocusMin(t => t + workMin)
              const nextSessions = sessions + 1
              if (nextSessions % 4 === 0) {
                setMode('longBreak')
                return longBreakMin * 60
              } else {
                setMode('break')
                return breakMin * 60
              }
            } else {
              setMode('work')
              return workMin * 60
            }
          }
          return prev - 1
        })
      }, 1000)
    } else if (intervalRef.current) clearInterval(intervalRef.current)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running, mode, workMin, breakMin, longBreakMin, sessions])

  const switchMode = (m: Mode) => {
    setRunning(false)
    setMode(m)
    setTimeLeft(m === 'work' ? workMin * 60 : m === 'break' ? breakMin * 60 : longBreakMin * 60)
  }

  const reset = () => {
    setRunning(false)
    setTimeLeft(mode === 'work' ? workMin * 60 : mode === 'break' ? breakMin * 60 : longBreakMin * 60)
  }

  const mins = Math.floor(timeLeft / 60)
  const secs = timeLeft % 60
  const displayTime = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`

  // Circle progress
  const radius = 140, circumference = 2 * Math.PI * radius

  return (
    <div className="space-y-8">
      {/* Mode Tabs */}
      <div className="flex gap-2 justify-center">
        {(['work', 'break', 'longBreak'] as Mode[]).map(m => (
          <button key={m} onClick={() => switchMode(m)}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold border transition-all ${mode === m ? `${MODE_BG[m]} text-white border-transparent shadow-md` : 'border-border hover:bg-muted'}`}>
            {MODE_LABELS[m]}
          </button>
        ))}
      </div>

      {/* Timer Display */}
      <div className="bg-card border border-border p-12 rounded-[2.5rem] shadow-xl text-center">
        <div className="relative inline-block">
          <svg width="320" height="320" className="transform -rotate-90">
            <circle cx="160" cy="160" r={radius} fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/30" />
            <circle cx="160" cy="160" r={radius} fill="none" strokeWidth="8" strokeLinecap="round"
              className={MODE_COLORS[mode].replace('text-', 'stroke-')}
              style={{ strokeDasharray: circumference, strokeDashoffset: circumference - (progress / 100) * circumference, transition: 'stroke-dashoffset 1s linear' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-6xl sm:text-7xl font-extrabold font-mono tabular-nums ${MODE_COLORS[mode]}`}>{displayTime}</span>
            <span className="text-sm text-muted-foreground mt-2">{MODE_LABELS[mode]}</span>
          </div>
        </div>

        <div className="flex gap-3 justify-center mt-10">
          <button onClick={() => setRunning(!running)}
            className={`px-10 py-4 rounded-2xl text-lg font-bold transition-all shadow-md ${running ? 'bg-red-500 hover:bg-red-600 text-white' : `${MODE_BG[mode]} hover:opacity-90 text-white`}`}>
            {running ? '⏸ Pause' : '▶ Start'}
          </button>
          <button onClick={reset} className="px-6 py-4 bg-muted border border-border rounded-2xl text-lg font-bold transition-all hover:bg-muted/80">🔄 Reset</button>
        </div>
      </div>

      {/* Stats + Settings */}
      <div className="grid sm:grid-cols-2 gap-6">
        <div className="bg-card border border-border p-6 rounded-[2rem] shadow-sm">
          <h3 className="font-bold font-syne mb-4">📊 Today&apos;s Stats</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted/20 p-4 rounded-xl text-center border border-border">
              <span className="text-3xl font-extrabold font-mono text-brand-orange">{sessions}</span>
              <p className="text-xs text-muted-foreground mt-1">Sessions</p>
            </div>
            <div className="bg-muted/20 p-4 rounded-xl text-center border border-border">
              <span className="text-3xl font-extrabold font-mono text-brand-orange">{totalFocusMin}</span>
              <p className="text-xs text-muted-foreground mt-1">Focus Minutes</p>
            </div>
          </div>
          <div className="mt-4 flex">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className={`flex-1 h-2 rounded-full mx-0.5 ${i < (sessions % 4) ? MODE_BG.work : 'bg-muted'}`} />
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">{4 - (sessions % 4)} session{4 - (sessions % 4) !== 1 ? 's' : ''} until long break</p>
        </div>

        <div className="bg-card border border-border p-6 rounded-[2rem] shadow-sm space-y-4">
          <h3 className="font-bold font-syne">⚙️ Settings</h3>
          {([
            { label: 'Focus (min)', value: workMin, set: (v: number) => { setWorkMin(v); if (mode === 'work' && !running) setTimeLeft(v * 60) } },
            { label: 'Short Break', value: breakMin, set: (v: number) => { setBreakMin(v); if (mode === 'break' && !running) setTimeLeft(v * 60) } },
            { label: 'Long Break', value: longBreakMin, set: (v: number) => { setLongBreakMin(v); if (mode === 'longBreak' && !running) setTimeLeft(v * 60) } },
          ]).map(s => (
            <div key={s.label} className="flex justify-between items-center">
              <span className="text-sm font-medium">{s.label}</span>
              <div className="flex items-center gap-2">
                <button onClick={() => s.set(Math.max(1, s.value - 5))} className="w-8 h-8 rounded-lg bg-muted border border-border font-bold">-</button>
                <span className="font-mono font-bold w-8 text-center">{s.value}</span>
                <button onClick={() => s.set(Math.min(120, s.value + 5))} className="w-8 h-8 rounded-lg bg-muted border border-border font-bold">+</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
