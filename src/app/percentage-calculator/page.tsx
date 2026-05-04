import { Metadata } from 'next'
import PercentageCalculatorClient from './client'

export const metadata: Metadata = {
  title: "Percentage Calculator Online Free - Calculate % Instantly",
  description: "Free online percentage calculator. Calculate percentage of a number, percentage change, percentage difference, markup and more. Instant results with formula explanation.",
  keywords: "percentage calculator, calculate percentage online, percent calculator free, percentage change calculator, percentage difference, what is X percent of Y, percentage increase decrease calculator",
}

export default function PercentageCalculatorPage() {
  return (
    <div className="min-h-screen bg-background font-inter">
      <main className="max-w-6xl mx-auto px-4 py-12 md:py-24">
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
                <span className="text-brand-orange font-medium">Percentage Calculator</span>
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
            Instant % Results
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight font-syne text-foreground drop-shadow-sm">
            Percentage <span className="text-brand-orange relative inline-block">Calculator<div className="absolute -bottom-2 left-0 w-full h-1 bg-brand-orange rounded-full opacity-50 blur-[2px]"></div></span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-inter leading-relaxed">
            Calculate any type of percentage instantly. Find percentage of a number, percentage change, markup, discount and more — with formulas shown.
          </p>
        </div>

        <PercentageCalculatorClient />

        {/* SEO Content Section */}
        <div className="mt-32 max-w-4xl mx-auto space-y-16 border-t border-border pt-16 font-inter">
          <section className="space-y-6">
            <h2 className="text-3xl font-bold font-syne text-foreground">How to Calculate Percentage</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="font-bold text-xl flex items-center gap-2">The Basic Formula</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                   The basic formula to find a percentage is: <strong>(Part ÷ Whole) × 100</strong>. 
                   For example, if you scored 30 marks out of 200, your percentage is (30 ÷ 200) × 100 = 15%.
                </p>
              </div>
              <div className="space-y-4">
                <h3 className="font-bold text-xl flex items-center gap-2">Reverse Calculation</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  To find what 20% of 500 is, use: <strong>(Percent ÷ 100) × Number</strong>. 
                  (20 ÷ 100) × 500 = 100.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-8 bg-brand-orange/5 p-12 rounded-[3rem] border border-brand-orange/20">
            <h2 className="text-3xl font-bold font-syne text-foreground">Percentage Change vs Difference</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h4 className="font-bold text-brand-orange uppercase tracking-widest text-xs">Percentage Change</h4>
                <p className="text-sm text-muted-foreground">
                  Compares a new value to an old value. It is <strong>directional</strong> (increase or decrease).
                  Formula: ((New - Old) ÷ |Old|) × 100.
                </p>
              </div>
              <div className="space-y-4">
                <h4 className="font-bold text-brand-orange uppercase tracking-widest text-xs">Percentage Difference</h4>
                <p className="text-sm text-muted-foreground">
                  Compares two values where neither is considered "older" or "newer." It is <strong>non-directional</strong>.
                  Formula: |V1 - V2| ÷ ((V1 + V2) ÷ 2) × 100.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-3xl font-bold font-syne text-foreground">GST Calculation (India)</h2>
            <p className="text-muted-foreground leading-relaxed">
              In India, GST (Goods and Services Tax) rates are typically 0%, 5%, 12%, 18%, or 28%. 
              To <strong>Add GST</strong>, multiply by (1 + Rate/100). 
              To <strong>Remove GST</strong>, divide by (1 + Rate/100). 
              Our calculator also breaks down CGST (Central GST) and SGST (State GST), which are each exactly half of the total GST amount.
            </p>
          </section>

          <section className="max-w-3xl mx-auto space-y-6">
             <h2 className="text-2xl font-bold font-syne text-center">Frequently Asked Questions</h2>
             <div className="space-y-4">
               {[
                 { q: "What is 20% of 500?", a: "20% of 500 = (20 ÷ 100) × 500 = 100." },
                 { q: "How to calculate percentage increase?", a: "Subtract the original value from the new value, divide by the original value, and multiply by 100." },
                 { q: "How to add 18% GST to a price?", a: "Multiply the base price by 1.18. For example, ₹1,000 × 1.18 = ₹1,180." },
                 { q: "What is the difference between markup and margin?", a: "Markup is based on the Cost Price, while Margin is based on the Selling Price. A 40% markup is not the same as a 40% margin." }
               ].map((faq) => (
                 <div key={faq.q} className="p-6 bg-muted/50 rounded-2xl border border-border">
                   <h4 className="font-bold mb-2">{faq.q}</h4>
                   <p className="text-muted-foreground text-sm">{faq.a}</p>
                 </div>
               ))}
             </div>
          </section>
        </div>
      </main>
    </div>
  )
}
