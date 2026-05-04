import { Metadata } from 'next'
import UnitConverterClient from './client'

export const metadata: Metadata = {
  title: "Unit Converter Online Free - Convert Length, Weight, Temp & More",
  description: "Free online unit converter. Convert between length, weight, temperature, area, volume, and more instantly. Supports metric and imperial units. High precision, fast and no signup required.",
  keywords: "unit converter, convert units online, metric to imperial, length converter, weight converter, temperature converter, area converter, volume converter, data converter, speed converter",
}

export default function UnitConverterPage() {
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
                <span className="text-brand-orange font-medium">Unit Converter</span>
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
            Instant Precision Conversions
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight font-syne text-foreground drop-shadow-sm">
            Unit Converter — <span className="text-brand-orange relative inline-block">Convert Anything<div className="absolute -bottom-2 left-0 w-full h-1 bg-brand-orange rounded-full opacity-50 blur-[2px]"></div></span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-inter leading-relaxed">
            Fast, accurate unit conversion for everyday use. Convert between hundreds of units in weight, length, temperature, and more — free and private.
          </p>
        </div>

        <UnitConverterClient />

        {/* SEO Content Section */}
        <div className="mt-32 max-w-5xl mx-auto space-y-20 border-t border-border pt-20 font-inter text-foreground">
          <section className="space-y-8">
            <h2 className="text-3xl font-bold font-syne">Comprehensive Unit Conversion</h2>
            <div className="grid md:grid-cols-2 gap-12">
               <div className="space-y-4">
                  <p className="text-muted-foreground leading-relaxed">
                     Our online unit converter is designed to handle complex mathematical conversions instantly. 
                     Whether you are a student working on physics problems, a traveler converting kilometers to miles, or a cook converting liters to cups, we provide high-precision results for every need.
                  </p>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  {[
                    "Metric & Imperial Support",
                    "Scientific Accuracy",
                    "Real-time Updates",
                    "Zero Data Tracking"
                  ].map(feat => (
                    <div key={feat} className="flex items-center gap-2 text-sm font-bold">
                       <div className="size-2 rounded-full bg-brand-orange" />
                       {feat}
                    </div>
                  ))}
               </div>
            </div>
          </section>

          <section className="bg-[#1e293b] p-12 rounded-[3rem] text-white space-y-10">
             <h2 className="text-3xl font-bold font-syne">Supported Categories</h2>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {[
                  { n: "Length", d: "m, km, cm, mi, ft, in" },
                  { n: "Weight", d: "kg, g, lbs, oz, stone" },
                  { n: "Temperature", d: "°C, °F, Kelvin" },
                  { n: "Area", d: "m², Acre, Hectare" },
                  { n: "Volume", d: "Liters, ml, Gallons" },
                  { n: "Data", d: "KB, MB, GB, TB" },
                  { n: "Speed", d: "km/h, mph, knot" },
                  { n: "Pressure", d: "PSI, Bar, Pascal" }
                ].map(cat => (
                  <div key={cat.n} className="space-y-2">
                     <h4 className="font-bold text-brand-orange uppercase text-xs tracking-widest">{cat.n}</h4>
                     <p className="text-sm text-zinc-400">{cat.d}</p>
                  </div>
                ))}
             </div>
          </section>

          <section className="space-y-8">
             <h2 className="text-3xl font-bold font-syne">How to Use the Unit Converter?</h2>
             <div className="grid md:grid-cols-3 gap-8">
                {[
                  { s: "1", t: "Select Category", d: "Choose the type of measurement you want to convert (e.g., Weight or Length)." },
                  { s: "2", t: "Input Value", d: "Type the number into either the 'From' or 'To' field. The result updates in real-time." },
                  { s: "3", t: "Swap & Copy", d: "Use the swap button to reverse units, and click the copy icon to use the result anywhere." }
                ].map(step => (
                  <div key={step.s} className="p-8 bg-muted/50 rounded-3xl border border-border relative">
                     <span className="absolute -top-4 -left-4 size-10 bg-brand-orange text-white rounded-full flex items-center justify-center font-black shadow-lg shadow-brand-orange/20">{step.s}</span>
                     <h4 className="font-bold mb-3 mt-2">{step.t}</h4>
                     <p className="text-sm text-muted-foreground">{step.d}</p>
                  </div>
                ))}
             </div>
          </section>

          <section className="max-w-3xl mx-auto space-y-8">
             <h2 className="text-3xl font-bold font-syne text-center">Frequently Asked Questions</h2>
             <div className="space-y-4">
               {[
                 { q: "Is the conversion accurate?", a: "Yes, we use standardized conversion factors (e.g., 1 inch = 2.54 cm) and high-precision floating point math to ensure scientific-grade accuracy." },
                 { q: "How many units are supported?", a: "We support over 50 of the most common units across 8+ categories, including specialized units like Knots for speed and Acres for area." },
                 { q: "Can I use it offline?", a: "Once the page is loaded, the conversion logic runs entirely in your browser. You can continue converting units even if your connection drops." },
                 { q: "Do you save my data?", a: "Never. All calculations happen locally on your device. We do not store or track what you convert." }
               ].map((faq) => (
                 <div key={faq.q} className="p-8 bg-muted/50 rounded-[2.5rem] border border-border">
                   <h4 className="font-bold mb-4 text-lg">{faq.q}</h4>
                   <p className="text-muted-foreground text-sm leading-relaxed">{faq.a}</p>
                 </div>
               ))}
             </div>
          </section>

          <section className="pt-20 border-t border-border">
             <h2 className="text-2xl font-bold font-syne mb-10 text-center">Related Tools</h2>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { name: "Scientific Calculator", icon: "🧪", href: "/scientific-calculator" },
                  { name: "BMI Calculator", icon: "⚖️", href: "/bmi-calculator" },
                  { name: "Loan Calculator", icon: "💰", href: "/loan-calculator" },
                  { name: "Percentage Calculator", icon: "🔢", href: "/percentage-calculator" }
                ].map(calc => (
                  <a key={calc.name} href={calc.href} className="group p-6 bg-card border border-border rounded-3xl hover:border-brand-orange transition-all text-center">
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
