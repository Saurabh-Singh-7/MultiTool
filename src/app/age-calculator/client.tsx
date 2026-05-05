'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

// ─── UTILS ─────────────────────────────────────────────────────────────

function calculateAge(birthDate: string | Date, toDate: string | Date = new Date()) {
  const birth = new Date(birthDate)
  const to = new Date(toDate)

  // Ensure times are zeroed for accurate day calculations
  birth.setHours(0, 0, 0, 0)
  const toDateObj = new Date(to)
  toDateObj.setHours(0, 0, 0, 0)

  let years = toDateObj.getFullYear() - birth.getFullYear()
  let months = toDateObj.getMonth() - birth.getMonth()
  let days = toDateObj.getDate() - birth.getDate()

  if (days < 0) {
    months--
    const prevMonth = new Date(toDateObj.getFullYear(), toDateObj.getMonth(), 0)
    days += prevMonth.getDate()
  }

  if (months < 0) {
    years--
    months += 12
  }

  // Time calculations
  const birthTime = birth.getTime()
  // Use exact 'to' time if it's today to get live seconds, else zeroed time
  const isToday = to.toDateString() === new Date().toDateString()
  const endTime = isToday ? Date.now() : toDateObj.getTime()

  const msDiff = endTime - birthTime
  const totalDays = Math.floor(msDiff / (1000 * 60 * 60 * 24))
  const totalWeeks = Math.floor(totalDays / 7)
  const totalMonths = years * 12 + months
  
  // These will update live if isToday
  const totalSeconds = Math.floor(msDiff / 1000)
  const totalMinutes = Math.floor(totalSeconds / 60)
  const totalHours = Math.floor(totalMinutes / 60)

  return {
    years, months, days,
    totalDays, totalWeeks, totalMonths,
    totalHours, totalMinutes, totalSeconds
  }
}

function getDaysUntilBirthday(birthDate: string) {
  const today = new Date()
  const birth = new Date(birthDate)
  
  // Set to today's year
  let nextBirthday = new Date(today.getFullYear(), birth.getMonth(), birth.getDate())

  // If already passed this year, set to next year
  if (nextBirthday.getTime() < today.getTime() && today.toDateString() !== nextBirthday.toDateString()) {
    nextBirthday.setFullYear(today.getFullYear() + 1)
  }

  // End of day or start of day? Let's target the exact start of the birthday (midnight)
  nextBirthday.setHours(0, 0, 0, 0)
  let msUntil = nextBirthday.getTime() - today.getTime()
  
  // If it's exactly today
  const isToday = today.getMonth() === birth.getMonth() && today.getDate() === birth.getDate()
  if (isToday) {
    msUntil = 0
  }

  const daysUntil = Math.ceil(msUntil / (1000 * 60 * 60 * 24))
  const nextAge = nextBirthday.getFullYear() - birth.getFullYear()

  return { daysUntil, nextBirthday, nextAge, msUntil, isToday }
}

function funAgeUnits(totalDays: number, totalSeconds: number) {
  return {
    lunarCycles: Math.floor(totalDays / 29.53),
    heartbeats: Math.round(totalSeconds * 1.17), // 70 bpm avg -> ~1.17 per sec
    sleepHours: Math.round(totalDays * 8), // 8hrs/day
    mealsEaten: Math.round(totalDays * 3), // 3 meals/day
    earthOrbits: (totalDays / 365.25).toFixed(2),
    moonOrbits: Math.floor(totalDays / 27.32),
    breaths: Math.round(totalSeconds * 0.267), // 16/min -> ~0.267 per sec
    steps: Math.round(totalDays * 7500) // avg steps
  }
}

function getZodiac(month: number, day: number) {
  const signs = [
    { sign: 'Capricorn', emoji: '♑', end: [1, 19] },
    { sign: 'Aquarius',  emoji: '♒', end: [2, 18] },
    { sign: 'Pisces',    emoji: '♓', end: [3, 20] },
    { sign: 'Aries',     emoji: '♈', end: [4, 19] },
    { sign: 'Taurus',    emoji: '♉', end: [5, 20] },
    { sign: 'Gemini',    emoji: '♊', end: [6, 20] },
    { sign: 'Cancer',    emoji: '♋', end: [7, 22] },
    { sign: 'Leo',       emoji: '♌', end: [8, 22] },
    { sign: 'Virgo',     emoji: '♍', end: [9, 22] },
    { sign: 'Libra',     emoji: '♎', end: [10, 22] },
    { sign: 'Scorpio',   emoji: '♏', end: [11, 21] },
    { sign: 'Sagittarius',emoji:'♐', end: [12, 21] },
    { sign: 'Capricorn', emoji: '♑', end: [12, 31] },
  ]
  return signs.find(s => month < s.end[0] || (month === s.end[0] && day <= s.end[1]))
}

const chineseZodiacs = [
  { sign: 'Monkey', emoji: '🐒' }, { sign: 'Rooster', emoji: '🐓' }, { sign: 'Dog', emoji: '🐕' }, 
  { sign: 'Pig', emoji: '🐖' }, { sign: 'Rat', emoji: '🐀' }, { sign: 'Ox', emoji: '🐂' },
  { sign: 'Tiger', emoji: '🐅' }, { sign: 'Rabbit', emoji: '🐇' }, { sign: 'Dragon', emoji: '🐉' }, 
  { sign: 'Snake', emoji: '🐍' }, { sign: 'Horse', emoji: '🐎' }, { sign: 'Goat', emoji: '🐐' }
]

const famousBirthdays = [
  { name: 'APJ Abdul Kalam', date: '1931-10-15', fact: 'Former President of India' },
  { name: 'Mahatma Gandhi', date: '1869-10-02', fact: 'Leader of Indian independence' },
  { name: 'Sachin Tendulkar', date: '1973-04-24', fact: 'Cricket legend' },
  { name: 'Narendra Modi', date: '1950-09-17', fact: 'Prime Minister of India' },
  { name: 'Amitabh Bachchan', date: '1942-10-11', fact: 'Iconic Actor' },
  { name: 'Virat Kohli', date: '1988-11-05', fact: 'Cricket star' },
  { name: 'Martin Luther King Jr.', date: '1929-01-15', fact: 'Civil Rights Leader' },
  { name: 'Albert Einstein', date: '1879-03-14', fact: 'Theoretical Physicist' },
  { name: 'Kalpana Chawla', date: '1962-03-17', fact: 'Astronaut' },
  { name: 'Steve Jobs', date: '1955-02-24', fact: 'Co-founder of Apple' },
  { name: 'Mother Teresa', date: '1910-08-26', fact: 'Nobel Peace Prize Laureate' },
  { name: 'Swami Vivekananda', date: '1863-01-12', fact: 'Spiritual Leader' },
  { name: 'Shah Rukh Khan', date: '1965-11-02', fact: 'Actor' },
  { name: 'Priyanka Chopra', date: '1982-07-18', fact: 'Actress' },
  { name: 'Sundar Pichai', date: '1972-06-10', fact: 'CEO of Alphabet' }
]

const historicalEvents = [
  { month: 1, day: 1, name: "New Year's Day" },
  { month: 1, day: 26, name: "Republic Day (India)" },
  { month: 2, day: 14, name: "Valentine's Day" },
  { month: 8, day: 15, name: "Independence Day (India)" },
  { month: 10, day: 2, name: "Gandhi Jayanti" },
  { month: 12, day: 25, name: "Christmas Day" }
]

const yearsFacts: Record<number, string> = {
  1990: "The year the World Wide Web was invented",
  1995: "The year Windows 95 launched",
  1998: "The year Google was founded",
  2000: "The year of the Y2K millennium",
  2001: "The year Wikipedia was launched",
  2004: "The year Facebook was founded",
  2005: "The year YouTube was created",
  2007: "The year the first iPhone was released",
  2010: "The year Instagram was launched"
}

// ─── COMPONENTS ─────────────────────────────────────────────────────────

export default function AgeCalculatorClient() {
  const router = useRouter()
  // useSearchParams is a hook from next/navigation, need to handle properly in client component
  // Wrap in Suspense if necessary or just use window.location in useEffect, but useSearchParams is safe if page is dynamic
  
  const [activeTab, setActiveTab] = useState<'myAge'|'ageOnDate'|'ageDiff'|'birthday'|'funUnits'>('myAge')
  
  const [dob, setDob] = useState<string>('')
  const [targetDateMode, setTargetDateMode] = useState<'today'|'custom'>('today')
  const [targetDate, setTargetDate] = useState<string>('')
  
  const [person1Dob, setPerson1Dob] = useState<string>('')
  const [person2Dob, setPerson2Dob] = useState<string>('')

  const [liveSeconds, setLiveSeconds] = useState(0)
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [isConfetti, setIsConfetti] = useState(false)
  
  // Initialize from URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const dobParam = params.get('dob')
    if (dobParam) setDob(dobParam)
  }, [])

  // Live timer for seconds and birthday countdown
  useEffect(() => {
    const timer = setInterval(() => {
      // Live seconds for My Age
      if (dob && activeTab === 'myAge' && targetDateMode === 'today') {
        const stats = calculateAge(dob)
        setLiveSeconds(stats.totalSeconds)
      }
      
      // Birthday Countdown
      if (dob && activeTab === 'birthday') {
        const { msUntil, isToday } = getDaysUntilBirthday(dob)
        if (isToday) {
          setIsConfetti(true)
        } else {
          setIsConfetti(false)
          let totalSecs = Math.floor(msUntil / 1000)
          const d = Math.floor(totalSecs / (3600 * 24))
          totalSecs %= (3600 * 24)
          const h = Math.floor(totalSecs / 3600)
          totalSecs %= 3600
          const m = Math.floor(totalSecs / 60)
          const s = totalSecs % 60
          setCountdown({ days: d, hours: h, minutes: m, seconds: s })
        }
      }
    }, 1000)
    return () => clearInterval(timer)
  }, [dob, activeTab, targetDateMode])

  const handleShare = () => {
    if (!dob) return alert('Please enter a date of birth first.')
    const url = new URL(window.location.href)
    url.searchParams.set('dob', dob)
    window.history.replaceState({}, '', url.toString())
    navigator.clipboard.writeText(url.toString())
    alert('Link copied to clipboard!')
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('Copied to clipboard!')
  }

  const renderTabs = () => (
    <div className="flex flex-wrap gap-2 mb-8 bg-muted/30 p-2 rounded-2xl justify-center">
      {[
        { id: 'myAge', label: '🎂 My Age' },
        { id: 'ageOnDate', label: '📅 Age on Date' },
        { id: 'ageDiff', label: '⚖ Age Difference' },
        { id: 'birthday', label: '⏳ Days Until Birthday' },
        { id: 'funUnits', label: '🌍 Age in Other Units' },
      ].map(tab => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id as any)}
          className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
            activeTab === tab.id 
              ? 'bg-brand-orange text-white shadow-md shadow-brand-orange/20' 
              : 'hover:bg-muted text-muted-foreground'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )

  const renderMyAge = () => {
    if (!dob) return (
      <div className="bg-card border border-border p-12 rounded-[2.5rem] shadow-sm flex flex-col items-center justify-center text-center h-[400px]">
        <div className="text-6xl mb-4 opacity-50">📅</div>
        <h2 className="text-xl font-bold font-syne mb-2 text-muted-foreground">Select your Date of Birth</h2>
        <p className="text-sm text-muted-foreground max-w-xs">Please enter your date of birth in the details panel to see your exact age and fun facts.</p>
      </div>
    )
    const birthDateObj = new Date(dob)
    if (birthDateObj > new Date()) return <div className="text-red-500 font-bold p-6 bg-red-500/10 rounded-2xl">⚠ Date of birth cannot be in the future</div>
    if (birthDateObj.getFullYear() < 1850) return <div className="text-red-500 font-bold p-6 bg-red-500/10 rounded-2xl">⚠ Please enter a valid date of birth</div>

    const toDateVal = targetDateMode === 'today' ? new Date() : new Date(targetDate || new Date())
    const stats = calculateAge(dob, toDateVal)
    
    const formattedStats = `My exact age: ${stats.years} years, ${stats.months} months, ${stats.days} days\n(${stats.totalDays.toLocaleString()} days | ${stats.totalWeeks.toLocaleString()} weeks | ${stats.totalMonths.toLocaleString()} months)`

    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-card border border-border p-8 rounded-[2.5rem] shadow-sm mb-6 relative overflow-hidden">
          <h2 className="text-2xl font-bold font-syne mb-6 flex items-center gap-2">🎂 Your Age</h2>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-muted/50 p-6 rounded-3xl text-center">
              <div className="text-4xl font-extrabold text-brand-orange mb-1">{stats.years}</div>
              <div className="text-sm text-muted-foreground font-semibold uppercase tracking-wider">Years</div>
            </div>
            <div className="bg-muted/50 p-6 rounded-3xl text-center">
              <div className="text-4xl font-extrabold text-brand-orange mb-1">{stats.months}</div>
              <div className="text-sm text-muted-foreground font-semibold uppercase tracking-wider">Months</div>
            </div>
            <div className="bg-muted/50 p-6 rounded-3xl text-center">
              <div className="text-4xl font-extrabold text-brand-orange mb-1">{stats.days}</div>
              <div className="text-sm text-muted-foreground font-semibold uppercase tracking-wider">Days</div>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground bg-muted/30 p-4 rounded-xl border border-border">
             <div><span className="font-bold">Born:</span> {birthDateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
             <div><span className="font-bold">As of:</span> {toDateVal.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-card border border-border p-8 rounded-[2.5rem] shadow-sm">
             <h3 className="text-xl font-bold font-syne mb-6 flex items-center gap-2">📊 Age in Different Units</h3>
             <ul className="space-y-4 text-sm">
               <li className="flex justify-between border-b border-border pb-2"><span className="text-muted-foreground">Total Years:</span> <span className="font-mono font-bold text-brand-orange">{(stats.totalDays / 365.25).toFixed(2)} years</span></li>
               <li className="flex justify-between border-b border-border pb-2"><span className="text-muted-foreground">Total Months:</span> <span className="font-mono font-bold">{stats.totalMonths.toLocaleString()} months</span></li>
               <li className="flex justify-between border-b border-border pb-2"><span className="text-muted-foreground">Total Weeks:</span> <span className="font-mono font-bold">{stats.totalWeeks.toLocaleString()} weeks</span></li>
               <li className="flex justify-between border-b border-border pb-2"><span className="text-muted-foreground">Total Days:</span> <span className="font-mono font-bold">{stats.totalDays.toLocaleString()} days</span></li>
               <li className="flex justify-between border-b border-border pb-2"><span className="text-muted-foreground">Total Hours:</span> <span className="font-mono font-bold">{stats.totalHours.toLocaleString()} hours</span></li>
               <li className="flex justify-between border-b border-border pb-2"><span className="text-muted-foreground">Total Minutes:</span> <span className="font-mono font-bold">{stats.totalMinutes.toLocaleString()} minutes</span></li>
               <li className="flex justify-between pt-2 items-center">
                 <span className="text-muted-foreground">Total Seconds:</span> 
                 <span className="font-mono text-xl font-bold text-brand-orange bg-brand-orange/10 px-3 py-1 rounded-lg">
                   {(targetDateMode === 'today' && liveSeconds > 0) ? liveSeconds.toLocaleString() : stats.totalSeconds.toLocaleString()} s
                 </span>
               </li>
             </ul>
          </div>

          <div className="space-y-6">
            <div className="bg-card border border-border p-6 rounded-3xl shadow-sm">
               <h3 className="font-bold mb-2 flex items-center gap-2">🌟 Fun Facts</h3>
               <p className="text-sm text-muted-foreground mb-1">
                 You were born on a <span className="font-bold text-foreground">{birthDateObj.toLocaleDateString('en-US', { weekday: 'long' })}</span>!
               </p>
               {yearsFacts[birthDateObj.getFullYear()] && (
                 <p className="text-sm text-muted-foreground mb-1">
                   {birthDateObj.getFullYear()}: {yearsFacts[birthDateObj.getFullYear()]}
                 </p>
               )}
               {(() => {
                 const z = getZodiac(birthDateObj.getMonth() + 1, birthDateObj.getDate())
                 const cz = chineseZodiacs[birthDateObj.getFullYear() % 12]
                 return (
                   <>
                     {z && <p className="text-sm text-muted-foreground mb-1">Zodiac sign: {z.emoji} <span className="font-bold text-foreground">{z.sign}</span></p>}
                     {cz && <p className="text-sm text-muted-foreground">Chinese zodiac: {cz.emoji} <span className="font-bold text-foreground">{cz.sign}</span></p>}
                   </>
                 )
               })()}
            </div>

            <div className="bg-card border border-border p-6 rounded-3xl shadow-sm">
               <h3 className="font-bold mb-3 flex items-center gap-2">👥 Famous Birthdays</h3>
               <ul className="text-sm space-y-2">
                 {famousBirthdays
                   .filter(p => new Date(p.date).getMonth() === birthDateObj.getMonth() && new Date(p.date).getDate() === birthDateObj.getDate())
                   .map((p, i) => (
                     <li key={i} className="flex gap-2"><span className="text-brand-orange">•</span> <span><span className="font-bold">{p.name}</span> ({p.fact})</span></li>
                   ))}
                 {famousBirthdays.filter(p => new Date(p.date).getMonth() === birthDateObj.getMonth() && new Date(p.date).getDate() === birthDateObj.getDate()).length === 0 && (
                   <li className="text-muted-foreground">You have a unique birthday!</li>
                 )}
               </ul>
            </div>
            
            <div className="flex gap-4">
              <button onClick={() => handleCopy(formattedStats)} className="flex-1 bg-muted hover:bg-muted/80 text-foreground font-semibold py-3 px-4 rounded-2xl transition-colors text-sm">
                📋 Copy Summary
              </button>
              <button onClick={handleShare} className="flex-1 bg-brand-orange hover:bg-brand-orange/90 text-white font-semibold py-3 px-4 rounded-2xl transition-colors text-sm shadow-md shadow-brand-orange/20">
                🔗 Share Link
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderAgeOnDate = () => {
    if (!dob || !targetDate) return (
      <div className="bg-card border border-border p-12 rounded-[2.5rem] shadow-sm flex flex-col items-center justify-center text-center h-[400px]">
        <div className="text-6xl mb-4 opacity-50">📅</div>
        <h2 className="text-xl font-bold font-syne mb-2 text-muted-foreground">Select Dates</h2>
        <p className="text-sm text-muted-foreground max-w-xs">Please enter your date of birth and a target date to see how old you were.</p>
      </div>
    )
    const birthDateObj = new Date(dob)
    const targetObj = new Date(targetDate)
    
    if (birthDateObj > targetObj) return <div className="text-red-500 font-bold p-6 bg-red-500/10 rounded-2xl">⚠ Target date must be after birth date</div>

    const stats = calculateAge(dob, targetDate)
    
    const specialEvent = historicalEvents.find(e => e.month === targetObj.getMonth() + 1 && e.day === targetObj.getDate())

    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-card border border-border p-8 rounded-[2.5rem] shadow-sm">
          <h2 className="text-xl font-bold font-syne mb-6">On {targetObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} you were:</h2>
          
          <div className="text-3xl font-extrabold text-brand-orange mb-6">
            {stats.years} Years {stats.months} Months {stats.days} Days
          </div>
          
          <div className="bg-muted/50 p-6 rounded-2xl text-sm text-muted-foreground space-y-2">
            <p>You were <span className="font-bold text-foreground">{stats.years}</span> years old.</p>
            {specialEvent && <p className="text-brand-orange font-bold">This was {specialEvent.name}!</p>}
          </div>
        </div>
      </div>
    )
  }

  const renderAgeDiff = () => {
    if (!person1Dob || !person2Dob) return (
      <div className="bg-card border border-border p-12 rounded-[2.5rem] shadow-sm flex flex-col items-center justify-center text-center h-[400px]">
        <div className="text-6xl mb-4 opacity-50">⚖️</div>
        <h2 className="text-xl font-bold font-syne mb-2 text-muted-foreground">Select Both Dates</h2>
        <p className="text-sm text-muted-foreground max-w-xs">Please enter the dates of birth for both people to calculate their exact age difference.</p>
      </div>
    )
    const p1 = new Date(person1Dob)
    const p2 = new Date(person2Dob)
    
    if (p1.getTime() === p2.getTime()) return <div className="text-brand-orange font-bold p-6 bg-brand-orange/10 rounded-2xl text-center">👯 Both persons share the exact same birthday!</div>

    const older = p1 < p2 ? p1 : p2
    const younger = p1 < p2 ? p2 : p1
    const olderName = p1 < p2 ? "Person 1" : "Person 2"
    const youngerName = p1 < p2 ? "Person 2" : "Person 1"
    
    const diff = calculateAge(older, younger)
    const p1Age = calculateAge(p1)
    const p2Age = calculateAge(p2)

    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-card border border-border p-8 rounded-[2.5rem] shadow-sm mb-6">
          <h2 className="text-2xl font-bold font-syne mb-6 flex items-center gap-2">⚖ Age Difference</h2>
          
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <div className="bg-muted/50 p-4 rounded-2xl">
              <div className="text-sm text-muted-foreground mb-1">Person 1 Age:</div>
              <div className="font-bold">{p1Age.years} yrs, {p1Age.months} mos, {p1Age.days} days</div>
            </div>
            <div className="bg-muted/50 p-4 rounded-2xl">
              <div className="text-sm text-muted-foreground mb-1">Person 2 Age:</div>
              <div className="font-bold">{p2Age.years} yrs, {p2Age.months} mos, {p2Age.days} days</div>
            </div>
          </div>
          
          <div className="border-t border-border pt-6">
            <div className="text-sm text-muted-foreground mb-2">Exact Difference:</div>
            <div className="text-3xl font-extrabold text-brand-orange mb-4">
              {diff.years} years {diff.months} months {diff.days} days
            </div>
            <p className="font-medium">
              {olderName} is older by {diff.years} years.
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              In total days: {diff.totalDays.toLocaleString()} days older.
            </p>
          </div>
        </div>
        
        <div className="bg-brand-orange/5 border border-brand-orange/20 p-6 rounded-3xl">
           <h3 className="font-bold mb-2 flex items-center gap-2 text-brand-orange">💡 Fun Fact</h3>
           <p className="text-sm">
             {olderName} was <span className="font-bold">{diff.years} years old</span> when {youngerName} was born!
           </p>
        </div>
      </div>
    )
  }

  const renderBirthday = () => {
    if (!dob) return (
      <div className="bg-card border border-border p-12 rounded-[2.5rem] shadow-sm flex flex-col items-center justify-center text-center h-[400px]">
        <div className="text-6xl mb-4 opacity-50">🎂</div>
        <h2 className="text-xl font-bold font-syne mb-2 text-muted-foreground">Select your Date of Birth</h2>
        <p className="text-sm text-muted-foreground max-w-xs">Please enter your date of birth to see the countdown to your next birthday.</p>
      </div>
    )
    const { daysUntil, nextBirthday, nextAge, isToday } = getDaysUntilBirthday(dob)
    const bdayStr = nextBirthday.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

    if (isToday) {
      return (
        <div className="animate-in zoom-in duration-500 bg-gradient-to-br from-brand-orange to-orange-400 p-10 rounded-[3rem] text-white text-center relative overflow-hidden shadow-xl shadow-brand-orange/20">
          <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PGNpcmNsZSBjeD0iMTAiIGN5PSIxMCIgcj0iMiIgZmlsbD0iI2ZmZiIvPjwvc3ZnPg==')]"></div>
          <div className="relative z-10">
            <div className="text-6xl mb-6">🎉🎊🎂</div>
            <h2 className="text-4xl font-extrabold font-syne mb-4">Happy Birthday!</h2>
            <p className="text-xl font-medium">Today is your special day!</p>
            <p className="mt-2 opacity-90">You are turning {nextAge} years old.</p>
          </div>
          {/* Simple CSS Confetti */}
          <div className="absolute top-0 left-1/4 w-3 h-3 bg-white rounded-full animate-[ping_1.5s_infinite] mix-blend-overlay"></div>
          <div className="absolute top-10 right-1/4 w-4 h-4 bg-yellow-300 rotate-45 animate-[ping_2s_infinite] mix-blend-overlay"></div>
          <div className="absolute bottom-10 left-1/3 w-3 h-3 bg-blue-300 rounded-full animate-[ping_1.2s_infinite] mix-blend-overlay"></div>
        </div>
      )
    }

    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-card border border-border p-8 rounded-[2.5rem] shadow-sm mb-6 text-center">
          <h2 className="text-2xl font-bold font-syne mb-2">🎂 Next Birthday: {bdayStr}</h2>
          <div className="text-brand-orange font-bold text-xl mb-8">⏳ {daysUntil} days to go!</div>
          
          <div className="inline-block bg-muted/30 p-6 rounded-3xl border border-border w-full max-w-md mx-auto">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4">Countdown</h3>
            <div className="flex justify-center gap-4 text-center">
              <div>
                <div className="text-4xl font-extrabold font-mono text-foreground bg-background rounded-xl p-3 shadow-sm min-w-[70px] border border-border/50">{countdown.days.toString().padStart(3, '0')}</div>
                <div className="text-xs text-muted-foreground mt-2 uppercase font-semibold tracking-wider">Days</div>
              </div>
              <div className="text-3xl font-bold mt-3 opacity-30">:</div>
              <div>
                <div className="text-4xl font-extrabold font-mono text-foreground bg-background rounded-xl p-3 shadow-sm min-w-[70px] border border-border/50">{countdown.hours.toString().padStart(2, '0')}</div>
                <div className="text-xs text-muted-foreground mt-2 uppercase font-semibold tracking-wider">Hours</div>
              </div>
              <div className="text-3xl font-bold mt-3 opacity-30">:</div>
              <div>
                <div className="text-4xl font-extrabold font-mono text-foreground bg-background rounded-xl p-3 shadow-sm min-w-[70px] border border-border/50">{countdown.minutes.toString().padStart(2, '0')}</div>
                <div className="text-xs text-muted-foreground mt-2 uppercase font-semibold tracking-wider">Mins</div>
              </div>
              <div className="text-3xl font-bold mt-3 opacity-30">:</div>
              <div>
                <div className="text-4xl font-extrabold font-mono text-brand-orange bg-brand-orange/5 rounded-xl p-3 shadow-sm min-w-[70px] border border-brand-orange/20">{countdown.seconds.toString().padStart(2, '0')}</div>
                <div className="text-xs text-brand-orange mt-2 uppercase font-semibold tracking-wider">Secs</div>
              </div>
            </div>
          </div>
          
          <p className="mt-8 text-muted-foreground font-medium text-lg">
            You will turn <span className="text-foreground font-bold">{nextAge}</span> years old 🎉
          </p>
        </div>
      </div>
    )
  }

  const renderFunUnits = () => {
    if (!dob) return (
      <div className="bg-card border border-border p-12 rounded-[2.5rem] shadow-sm flex flex-col items-center justify-center text-center h-[400px]">
        <div className="text-6xl mb-4 opacity-50">🌍</div>
        <h2 className="text-xl font-bold font-syne mb-2 text-muted-foreground">Select your Date of Birth</h2>
        <p className="text-sm text-muted-foreground max-w-xs">Please enter your date of birth to see your age in fun units like heartbeats and lunar cycles.</p>
      </div>
    )
    const stats = calculateAge(dob)
    const fun = funAgeUnits(stats.totalDays, stats.totalSeconds)

    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-card border border-border p-8 rounded-[2.5rem] shadow-sm">
          <h2 className="text-2xl font-bold font-syne mb-8 flex items-center gap-2">🌍 Your Age in Fun Units</h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center gap-4 p-4 bg-muted/40 rounded-2xl">
              <div className="text-3xl">🌙</div>
              <div><div className="text-sm text-muted-foreground">Lunar cycles</div><div className="font-bold">{fun.lunarCycles.toLocaleString()} full moons</div></div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-muted/40 rounded-2xl">
              <div className="text-3xl">❤️</div>
              <div><div className="text-sm text-muted-foreground">Heartbeats</div><div className="font-bold">~{fun.heartbeats.toLocaleString()}</div></div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-muted/40 rounded-2xl">
              <div className="text-3xl">😴</div>
              <div><div className="text-sm text-muted-foreground">Sleep hours</div><div className="font-bold">~{fun.sleepHours.toLocaleString()} hours</div></div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-muted/40 rounded-2xl">
              <div className="text-3xl">🍽</div>
              <div><div className="text-sm text-muted-foreground">Meals eaten</div><div className="font-bold">~{fun.mealsEaten.toLocaleString()} meals</div></div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-muted/40 rounded-2xl">
              <div className="text-3xl">🌍</div>
              <div><div className="text-sm text-muted-foreground">Earth rotations</div><div className="font-bold">{stats.totalDays.toLocaleString()} days</div></div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-muted/40 rounded-2xl">
              <div className="text-3xl">☀️</div>
              <div><div className="text-sm text-muted-foreground">Earth orbits</div><div className="font-bold">{fun.earthOrbits} orbits</div></div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-muted/40 rounded-2xl">
              <div className="text-3xl">💓</div>
              <div><div className="text-sm text-muted-foreground">Breaths taken</div><div className="font-bold">~{fun.breaths.toLocaleString()}</div></div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-muted/40 rounded-2xl">
              <div className="text-3xl">👣</div>
              <div><div className="text-sm text-muted-foreground">Steps walked</div><div className="font-bold">~{fun.steps.toLocaleString()}</div></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {renderTabs()}

      <div className="grid lg:grid-cols-[1fr_300px] gap-8">
        {/* Main Content Area */}
        <div>
          {activeTab === 'myAge' && renderMyAge()}
          {activeTab === 'ageOnDate' && renderAgeOnDate()}
          {activeTab === 'ageDiff' && renderAgeDiff()}
          {activeTab === 'birthday' && renderBirthday()}
          {activeTab === 'funUnits' && renderFunUnits()}
        </div>

        {/* Sidebar Controls */}
        <div className="space-y-6 order-first lg:order-last">
          <div className="bg-muted/30 p-6 rounded-3xl border border-border">
            {activeTab === 'ageDiff' ? (
              <div className="space-y-4">
                <h3 className="font-bold font-syne flex items-center gap-2 mb-4"><span className="text-brand-orange">1</span> Date Details</h3>
                <div>
                  <label className="block text-sm font-semibold mb-2">Person 1 Date of Birth</label>
                  <input 
                    type="date" 
                    value={person1Dob}
                    onChange={(e) => setPerson1Dob(e.target.value)}
                    className="w-full bg-background border border-input rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/50 transition-shadow"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 mt-4">Person 2 Date of Birth</label>
                  <input 
                    type="date" 
                    value={person2Dob}
                    onChange={(e) => setPerson2Dob(e.target.value)}
                    className="w-full bg-background border border-input rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/50 transition-shadow"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="font-bold font-syne flex items-center gap-2 mb-4"><span className="text-brand-orange">1</span> Your Details</h3>
                <div>
                  <label className="block text-sm font-semibold mb-2">Date of Birth</label>
                  <input 
                    type="date" 
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full bg-background border border-input rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/50 transition-shadow"
                  />
                </div>
                
                {(activeTab === 'myAge' || activeTab === 'ageOnDate') && (
                  <div className="pt-4 border-t border-border mt-4">
                    <label className="block text-sm font-semibold mb-3">Calculate age as of:</label>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <button 
                        onClick={() => setTargetDateMode('today')}
                        className={`py-2 px-3 text-sm rounded-lg font-medium transition-colors ${targetDateMode === 'today' ? 'bg-brand-orange text-white' : 'bg-background border border-border hover:bg-muted'}`}
                      >
                        Today {targetDateMode === 'today' && '✓'}
                      </button>
                      <button 
                        onClick={() => { setTargetDateMode('custom'); setActiveTab('ageOnDate'); }}
                        className={`py-2 px-3 text-sm rounded-lg font-medium transition-colors ${targetDateMode === 'custom' ? 'bg-brand-orange text-white' : 'bg-background border border-border hover:bg-muted'}`}
                      >
                        Custom Date
                      </button>
                    </div>
                    
                    {targetDateMode === 'custom' && (
                      <input 
                        type="date" 
                        value={targetDate}
                        onChange={(e) => setTargetDate(e.target.value)}
                        className="w-full bg-background border border-input rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/50 transition-shadow animate-in slide-in-from-top-2"
                      />
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="bg-brand-orange/5 border border-brand-orange/20 p-6 rounded-3xl text-sm">
             <h4 className="font-bold text-brand-orange mb-2">Private & Secure</h4>
             <p className="text-muted-foreground leading-relaxed">
               All calculations happen directly in your browser. No data is sent to our servers.
             </p>
          </div>
        </div>
      </div>
    </div>
  )
}
