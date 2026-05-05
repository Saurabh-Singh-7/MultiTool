import { Metadata } from 'next'
import AgeCalculatorClient from './client'

export const metadata: Metadata = {
  title: "Age Calculator Online Free - Calculate Exact Age | ToolHive",
  description: "Calculate your exact age in years, months, days, hours and minutes. Find days until next birthday, age difference between two people. Free online age calculator.",
  keywords: "age calculator, calculate age online free, exact age calculator, birthday calculator, age difference calculator, how old am i calculator, days until birthday, age in days calculator"
}

export default function AgeCalculatorPage() {
  return (
    <div className="min-h-screen bg-background font-inter">
      <main className="max-w-7xl mx-auto px-4 py-12 md:py-24">
        {/* Breadcrumb */}
        <nav className="flex mb-8 text-sm text-muted-foreground" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <a href="/" className="hover:text-brand-orange transition-colors">Home</a>
            </li>
            <li>
              <div className="flex items-center">
                <span className="mx-2 text-zinc-400">/</span>
                <span className="cursor-default">Calculators</span>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <span className="mx-2 text-zinc-400">/</span>
                <span className="text-brand-orange font-medium">Age Calculator</span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Header Section */}
        <div className="text-center space-y-6 mb-16 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-orange/10 text-brand-orange text-sm font-semibold tracking-wide uppercase mb-4 shadow-sm border border-brand-orange/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-orange opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-orange" />
            </span>
            Time & Date Analysis
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight font-syne text-foreground drop-shadow-sm">
            Age Calculator — <span className="text-brand-orange relative inline-block">Calculate Your Exact Age Free<div className="absolute -bottom-2 left-0 w-full h-1 bg-brand-orange rounded-full opacity-50 blur-[2px]"></div></span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-inter leading-relaxed">
            Find your exact age in years, months, days and even hours. Calculate age difference, days until birthday and more — free, no signup needed.
          </p>
        </div>

        <AgeCalculatorClient />

        {/* SEO Content Section */}
        <div className="mt-32 max-w-5xl mx-auto space-y-20 border-t border-border pt-20 font-inter text-foreground">
          <section className="space-y-8">
            <h2 className="text-3xl font-bold font-syne">How to Calculate Your Exact Age</h2>
            <div className="grid md:grid-cols-3 gap-8">
               {[
                 { step: "Step 1", title: "Enter your date of birth", desc: "Select your exact birth date using our intuitive date picker." },
                 { step: "Step 2", title: "Select target date", desc: "Calculate your age as of today, or choose any custom date in the past or future." },
                 { step: "Step 3", title: "Get instant results", desc: "See your exact age in years, months, days, and even track the seconds ticking!" }
               ].map((item, idx) => (
                 <div key={idx} className="p-8 border border-border rounded-3xl hover:border-brand-orange/50 transition-colors relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-5xl font-bold text-brand-orange">0{idx + 1}</div>
                   <h4 className="font-bold mb-2 text-brand-orange text-sm uppercase tracking-wider">{item.step}</h4>
                   <h3 className="font-bold text-xl mb-3">{item.title}</h3>
                   <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                 </div>
               ))}
            </div>
          </section>

          <section className="bg-brand-orange/5 p-12 rounded-[3rem] border border-brand-orange/20 space-y-8">
             <h2 className="text-3xl font-bold font-syne">Age Calculation Formula</h2>
             <div className="space-y-6">
                <p className="text-muted-foreground leading-relaxed">
                   While calculating age might seem simple, dealing with leap years, different month lengths, and exact day differences can be tricky. Here is the general approach our calculator takes:
                </p>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-background/80 backdrop-blur-sm p-6 rounded-2xl border border-brand-orange/10">
                    <h4 className="font-bold text-brand-orange mb-2">Years</h4>
                    <p className="text-sm">Current Year - Birth Year (Adjusted if birthday hasn't occurred this year)</p>
                  </div>
                  <div className="bg-background/80 backdrop-blur-sm p-6 rounded-2xl border border-brand-orange/10">
                    <h4 className="font-bold text-brand-orange mb-2">Months</h4>
                    <p className="text-sm">Current Month - Birth Month (Carrying over from years if negative)</p>
                  </div>
                  <div className="bg-background/80 backdrop-blur-sm p-6 rounded-2xl border border-brand-orange/10">
                    <h4 className="font-bold text-brand-orange mb-2">Days</h4>
                    <p className="text-sm">Current Day - Birth Day (Borrowing days from the previous month if needed)</p>
                  </div>
                </div>
             </div>
          </section>

          <section className="space-y-8">
             <h2 className="text-3xl font-bold font-syne">Leap Year and Age Calculation</h2>
             <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                   <p className="text-muted-foreground leading-relaxed">
                      Born on Feb 29 (leap day)? Your actual birth date only occurs once every 4 years.
                   </p>
                   <ul className="space-y-4">
                      <li className="flex gap-4 p-4 bg-muted/50 rounded-2xl border border-border">
                         <span className="font-bold text-brand-orange">Leap Years:</span> Your birthday is celebrated on February 29th.
                      </li>
                      <li className="flex gap-4 p-4 bg-muted/50 rounded-2xl border border-border">
                         <span className="font-bold text-blue-500">Non-Leap Years:</span> For official age calculation purposes, your birthday is considered to be March 1st.
                      </li>
                   </ul>
                </div>
                <div className="bg-[#1e293b] p-8 rounded-[2.5rem] text-white">
                   <h3 className="text-xl font-bold font-syne mb-4 text-brand-orange">Why Calculate Exact Age?</h3>
                   <ul className="space-y-3 text-zinc-300 text-sm">
                      <li className="flex items-center gap-3">✓ Passport and visa applications</li>
                      <li className="flex items-center gap-3">✓ Government document requirements</li>
                      <li className="flex items-center gap-3">✓ Insurance and medical forms</li>
                      <li className="flex items-center gap-3">✓ School and college admissions</li>
                      <li className="flex items-center gap-3">✓ Retirement and pension calculations</li>
                   </ul>
                </div>
             </div>
          </section>

          <section className="max-w-3xl mx-auto space-y-8">
             <h2 className="text-3xl font-bold font-syne text-center">Frequently Asked Questions</h2>
             <div className="space-y-4">
               {[
                 { q: "How do I calculate my exact age?", a: "Subtract your birth date from today's date. You must count the remaining months and days carefully, considering varying month lengths and leap years. Our calculator handles all these edge cases automatically!" },
                 { q: "What is my age in days?", a: "Multiply your years by 365.25 (to account for leap years) and add your remaining months and days. For example, a 25-year-old has lived approximately 9,131 days. You can find this exact number in the 'My Age' tab." },
                 { q: "How many days until my next birthday?", a: "Use our 'Days Until Birthday' tab. It calculates the exact number of days, hours, minutes, and seconds until your next celebration." },
                 { q: "What day of the week was I born?", a: "Simply enter your date of birth in the calculator, and we'll show you the exact day of the week you were born on, along with your Zodiac sign." },
                 { q: "How to calculate age difference?", a: "Use the 'Age Difference' tab. Enter two dates of birth, and we'll instantly show you the exact difference in years, months, and days between the two people." }
               ].map((faq) => (
                 <div key={faq.q} className="p-8 bg-muted/50 rounded-[2.5rem] border border-border transition-all hover:border-brand-orange/30">
                   <h4 className="font-bold mb-4 text-lg">{faq.q}</h4>
                   <p className="text-muted-foreground text-sm leading-relaxed">{faq.a}</p>
                 </div>
               ))}
             </div>
          </section>

          <section className="pt-20 border-t border-border">
             <h2 className="text-2xl font-bold font-syne mb-10 text-center">Related Calculators</h2>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { name: "BMI Calculator", icon: "⚖️", href: "/bmi-calculator" },
                  { name: "Loan Calculator", icon: "💰", href: "/loan-calculator" },
                  { name: "Percentage Calculator", icon: "🔢", href: "/percentage-calculator" },
                  { name: "Scientific Calculator", icon: "🧪", href: "/scientific-calculator" }
                ].map(calc => (
                  <a key={calc.name} href={calc.href} className="group p-6 bg-card border border-border rounded-3xl hover:border-brand-orange transition-all text-center flex flex-col items-center justify-center min-h-[140px]">
                     <div className="text-3xl mb-4 group-hover:scale-110 transition-transform">{calc.icon}</div>
                     <h4 className="font-bold text-sm">{calc.name}</h4>
                  </a>
                ))}
             </div>
          </section>
        </div>
      </main>
    </div>
  )
}
