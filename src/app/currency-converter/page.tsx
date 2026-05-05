import { Metadata } from 'next'
import CurrencyConverterClient from './client'

export const metadata: Metadata = {
  title: "Currency Converter Online Free - Live Exchange Rates | ToolHive",
  description: "Convert between 170+ currencies with live exchange rates. USD to INR, EUR to USD, GBP to INR and more. Updated daily. Free online.",
  keywords: "currency converter, usd to inr, live exchange rate, foreign currency converter, dollar to rupee, euro to rupee, currency exchange calculator online free"
}

export default function CurrencyConverterPage() {
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
                <span className="text-brand-orange font-medium">Currency Converter</span>
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
            Live Finance Tool
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight font-syne text-foreground drop-shadow-sm">
            Currency Converter — <span className="text-brand-orange relative inline-block">Live Exchange Rates Free<div className="absolute -bottom-2 left-0 w-full h-1 bg-brand-orange rounded-full opacity-50 blur-[2px]"></div></span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-inter leading-relaxed">
            Convert between 170+ world currencies with live exchange rates. Updated daily. Free, no signup needed.
          </p>
        </div>

        <CurrencyConverterClient />

        {/* SEO Content Section */}
        <div className="mt-32 max-w-5xl mx-auto space-y-20 border-t border-border pt-20 font-inter text-foreground">
          <section className="space-y-8">
            <h2 className="text-3xl font-bold font-syne">How to Convert Currency Online</h2>
            <div className="grid md:grid-cols-3 gap-8">
               {[
                 { step: "Step 1", title: "Select your currencies", desc: "Choose the base currency you have and the target currency you want to convert to from our list of 170+ options." },
                 { step: "Step 2", title: "Enter the amount", desc: "Type the amount you want to convert in either the 'From' or 'To' field. The other field will update instantly." },
                 { step: "Step 3", title: "Get live results", desc: "See the exact converted amount based on the latest mid-market exchange rates, updated daily." }
               ].map((item, idx) => (
                 <div key={idx} className="p-8 border border-border rounded-3xl hover:border-brand-orange/50 transition-colors relative overflow-hidden group bg-card">
                   <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-5xl font-bold text-brand-orange">0{idx + 1}</div>
                   <h4 className="font-bold mb-2 text-brand-orange text-sm uppercase tracking-wider">{item.step}</h4>
                   <h3 className="font-bold text-xl mb-3">{item.title}</h3>
                   <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                 </div>
               ))}
            </div>
          </section>

          <section className="bg-brand-orange/5 p-12 rounded-[3rem] border border-brand-orange/20 space-y-8">
             <h2 className="text-3xl font-bold font-syne">Popular Currency Pairs</h2>
             <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  "USD to INR", "EUR to USD", "GBP to INR", "USD to CAD",
                  "AUD to USD", "USD to JPY", "EUR to GBP", "USD to CHF",
                  "SGD to INR", "AED to INR", "SAR to INR", "CNY to USD"
                ].map((pair) => (
                  <div key={pair} className="bg-background/80 backdrop-blur-sm p-4 rounded-2xl border border-brand-orange/10 font-medium text-center hover:border-brand-orange transition-colors">
                    {pair}
                  </div>
                ))}
             </div>
             <p className="text-sm text-muted-foreground text-center mt-6">
                Our converter supports over 170 global currencies, covering 99% of the world's circulating money.
             </p>
          </section>

          <section className="space-y-8">
             <h2 className="text-3xl font-bold font-syne">Understanding Exchange Rates</h2>
             <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                   <p className="text-muted-foreground leading-relaxed">
                      Exchange rates fluctuate constantly based on global economic conditions, interest rates, inflation, and geopolitical events.
                   </p>
                   <ul className="space-y-4">
                      <li className="flex gap-4 p-4 bg-muted/50 rounded-2xl border border-border">
                         <span className="font-bold text-brand-orange min-w-[120px]">Mid-Market Rate:</span> 
                         <span className="text-sm">The rate you see on our calculator is the mid-market rate. This is the exact midpoint between the buy and sell prices of two currencies.</span>
                      </li>
                      <li className="flex gap-4 p-4 bg-muted/50 rounded-2xl border border-border">
                         <span className="font-bold text-blue-500 min-w-[120px]">Bank Margins:</span> 
                         <span className="text-sm">Banks and transfer services rarely give you the mid-market rate. They usually add a markup (hidden fee) to make a profit. Use our tool to compare what you *should* get versus what you are being offered.</span>
                      </li>
                   </ul>
                </div>
                <div className="bg-[#1e293b] p-8 rounded-[2.5rem] text-white">
                   <h3 className="text-xl font-bold font-syne mb-4 text-brand-orange">Why do rates change?</h3>
                   <ul className="space-y-3 text-zinc-300 text-sm">
                      <li className="flex items-center gap-3">📈 Inflation differentials</li>
                      <li className="flex items-center gap-3">🏦 Central bank interest rates</li>
                      <li className="flex items-center gap-3">🏛️ Government debt and deficits</li>
                      <li className="flex items-center gap-3">⚖️ Terms of trade</li>
                      <li className="flex items-center gap-3">🌍 Geopolitical stability</li>
                   </ul>
                </div>
             </div>
          </section>

          <section className="max-w-3xl mx-auto space-y-8">
             <h2 className="text-3xl font-bold font-syne text-center">Frequently Asked Questions</h2>
             <div className="space-y-4">
               {[
                 { q: "Are the exchange rates live?", a: "We fetch rates that are updated daily from reliable financial data providers. While they are highly accurate for reference, they are not intended for high-frequency trading." },
                 { q: "Is this currency converter free to use?", a: "Yes, our currency converter is 100% free with no daily limits or signups required." },
                 { q: "Will my bank give me this exact rate?", a: "Probably not. Banks and money transfer services typically take a 'spread' or margin on top of the mid-market rate shown here. You can use our tool to calculate how much of a fee your bank is charging." },
                 { q: "How many currencies are supported?", a: "We support over 170 global fiat currencies, including major ones like USD, EUR, GBP, JPY, INR, and many more regional currencies." },
                 { q: "Does this calculator work offline?", a: "If you have visited the page recently, the calculator will cache the latest rates in your browser, allowing you to perform calculations even if your internet connection drops." }
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
                  { name: "Loan Calculator", icon: "💰", href: "/loan-calculator" },
                  { name: "Percentage Calculator", icon: "🔢", href: "/percentage-calculator" },
                  { name: "BMI Calculator", icon: "⚖️", href: "/bmi-calculator" },
                  { name: "Age Calculator", icon: "🎂", href: "/age-calculator" }
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
