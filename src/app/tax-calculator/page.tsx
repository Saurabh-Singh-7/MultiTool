import { Metadata } from 'next'
import TaxCalculatorClient from './client'

export const metadata: Metadata = {
  title: "Income Tax Calculator India 2024-25 - New vs Old Regime | ToolHive",
  description: "Calculate income tax for FY 2024-25 under new and old tax regime. Compare both regimes, see deductions, HRA exemption and more.",
  keywords: "income tax calculator india 2024-25, new tax regime calculator, old tax regime calculator, income tax calculator fy 2024-25, tax calculator india, salary tax calculator, 80c deduction calculator"
}

export default function TaxCalculatorPage() {
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
                <span className="text-brand-orange font-medium">Tax Calculator</span>
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
            Financial Planning
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight font-syne text-foreground drop-shadow-sm">
            Income Tax Calculator — <span className="text-brand-orange relative inline-block">India FY 2024-25<div className="absolute -bottom-2 left-0 w-full h-1 bg-brand-orange rounded-full opacity-50 blur-[2px]"></div></span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-inter leading-relaxed">
            Calculate your exact income tax liability for FY 2024-25. Compare new vs old tax regime, calculate deductions and see your take-home salary.
          </p>
        </div>

        <TaxCalculatorClient />

        {/* SEO Content Section */}
        <div className="mt-32 max-w-5xl mx-auto space-y-20 border-t border-border pt-20 font-inter text-foreground">
          <section className="space-y-8">
            <h2 className="text-3xl font-bold font-syne">New Tax Regime vs Old Tax Regime</h2>
            <div className="grid md:grid-cols-2 gap-8">
               <div className="p-8 border border-border rounded-3xl bg-card">
                 <h3 className="font-bold text-xl mb-4 text-brand-orange">New Tax Regime (Default)</h3>
                 <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                   The new tax regime offers lower tax rates but does not allow most deductions and exemptions (like 80C, 80D, HRA). From FY 2023-24 onwards, it is the default tax regime.
                 </p>
                 <ul className="space-y-2 text-sm text-muted-foreground">
                   <li className="flex items-center gap-2">✓ Lower slab rates</li>
                   <li className="flex items-center gap-2">✓ Standard deduction of ₹50,000 allowed</li>
                   <li className="flex items-center gap-2">✓ No tax up to ₹7 Lakhs (with rebate)</li>
                   <li className="flex items-center gap-2 text-red-500">✗ No 80C, 80D, HRA, LTA deductions</li>
                 </ul>
               </div>
               <div className="p-8 border border-border rounded-3xl bg-card">
                 <h3 className="font-bold text-xl mb-4 text-blue-500">Old Tax Regime</h3>
                 <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                   The old tax regime has higher tax rates but allows you to claim around 70+ exemptions and deductions. It is beneficial if you have significant investments and rent.
                 </p>
                 <ul className="space-y-2 text-sm text-muted-foreground">
                   <li className="flex items-center gap-2 text-red-500">✗ Higher slab rates</li>
                   <li className="flex items-center gap-2">✓ Standard deduction of ₹50,000 allowed</li>
                   <li className="flex items-center gap-2">✓ Tax rebate only up to ₹5 Lakhs</li>
                   <li className="flex items-center gap-2 text-green-500">✓ All deductions (80C, 80D, HRA) allowed</li>
                 </ul>
               </div>
            </div>
          </section>

          <section className="bg-brand-orange/5 p-12 rounded-[3rem] border border-brand-orange/20 space-y-8">
             <h2 className="text-3xl font-bold font-syne">Income Tax Slabs FY 2024-25</h2>
             <div className="overflow-x-auto">
                <table className="w-full text-left bg-card rounded-2xl overflow-hidden">
                   <thead className="bg-muted border-b border-border">
                      <tr>
                         <th className="p-4 font-bold text-sm uppercase tracking-widest">Income Range</th>
                         <th className="p-4 font-bold text-sm uppercase tracking-widest text-brand-orange">New Regime Rate</th>
                         <th className="p-4 font-bold text-sm uppercase tracking-widest text-blue-500">Old Regime Rate</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-border text-sm">
                      <tr><td className="p-4">Up to ₹2,50,000</td><td className="p-4">0%</td><td className="p-4">0%</td></tr>
                      <tr><td className="p-4">₹2,50,001 to ₹3,00,000</td><td className="p-4">0%</td><td className="p-4">5%</td></tr>
                      <tr><td className="p-4">₹3,00,001 to ₹5,00,000</td><td className="p-4">5%</td><td className="p-4">5%</td></tr>
                      <tr><td className="p-4">₹5,00,001 to ₹6,00,000</td><td className="p-4">5%</td><td className="p-4">20%</td></tr>
                      <tr><td className="p-4">₹6,00,001 to ₹9,00,000</td><td className="p-4">10%</td><td className="p-4">20%</td></tr>
                      <tr><td className="p-4">₹9,00,001 to ₹10,00,000</td><td className="p-4">15%</td><td className="p-4">20%</td></tr>
                      <tr><td className="p-4">₹10,00,001 to ₹12,00,000</td><td className="p-4">15%</td><td className="p-4">30%</td></tr>
                      <tr><td className="p-4">₹12,00,001 to ₹15,00,000</td><td className="p-4">20%</td><td className="p-4">30%</td></tr>
                      <tr><td className="p-4">Above ₹15,00,000</td><td className="p-4">30%</td><td className="p-4">30%</td></tr>
                   </tbody>
                </table>
             </div>
             <p className="text-xs text-muted-foreground text-center">Note: Old regime slabs shown above are for individuals below 60 years. Surcharge and 4% Health & Education Cess apply additionally.</p>
          </section>

          <section className="space-y-8">
             <h2 className="text-3xl font-bold font-syne">Common Tax Deductions Section 80C</h2>
             <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                   <p className="text-muted-foreground leading-relaxed">
                      Section 80C is the most popular way to save tax under the Old Regime. It allows a maximum deduction of ₹1,50,000 per year from your taxable income. Common investments include:
                   </p>
                   <ul className="space-y-4">
                      <li className="flex gap-4 p-4 bg-muted/50 rounded-2xl border border-border">
                         <span className="font-bold min-w-[120px]">EPF & VPF:</span> 
                         <span className="text-sm">Employee Provident Fund contributions automatically made by your employer.</span>
                      </li>
                      <li className="flex gap-4 p-4 bg-muted/50 rounded-2xl border border-border">
                         <span className="font-bold min-w-[120px]">PPF:</span> 
                         <span className="text-sm">Public Provident Fund is a safe, government-backed long-term saving scheme.</span>
                      </li>
                      <li className="flex gap-4 p-4 bg-muted/50 rounded-2xl border border-border">
                         <span className="font-bold min-w-[120px]">ELSS:</span> 
                         <span className="text-sm">Equity Linked Savings Scheme mutual funds offer the shortest lock-in period (3 years).</span>
                      </li>
                   </ul>
                </div>
                <div className="bg-[#1e293b] p-8 rounded-[2.5rem] text-white">
                   <h3 className="text-xl font-bold font-syne mb-4 text-brand-orange">How to Reduce Income Tax</h3>
                   <ul className="space-y-3 text-zinc-300 text-sm">
                      <li className="flex items-start gap-3">✓ <strong>Max out 80C:</strong> Invest ₹1.5L in PPF, ELSS, EPF, etc.</li>
                      <li className="flex items-start gap-3">✓ <strong>Health Insurance:</strong> Claim up to ₹75,000 under 80D for self and parents.</li>
                      <li className="flex items-start gap-3">✓ <strong>NPS (80CCD(1B)):</strong> Get an extra ₹50,000 deduction by investing in NPS.</li>
                      <li className="flex items-start gap-3">✓ <strong>Home Loan:</strong> Claim up to ₹2L on interest (Sec 24B) and ₹1.5L on principal (80C).</li>
                      <li className="flex items-start gap-3">✓ <strong>HRA Exemption:</strong> Provide rent receipts to claim House Rent Allowance.</li>
                   </ul>
                </div>
             </div>
          </section>

          <section className="max-w-3xl mx-auto space-y-8">
             <h2 className="text-3xl font-bold font-syne text-center">Frequently Asked Questions</h2>
             <div className="space-y-4">
               {[
                 { q: "Which is better: New or Old Tax Regime?", a: "It depends on your deductions. If your total deductions (80C, HRA, 80D, etc.) are less than ₹3.75 Lakhs, the New Regime is generally better. Use our calculator's comparison feature to see exactly which saves you more money based on your specific income." },
                 { q: "Is Standard Deduction available in the New Regime?", a: "Yes. From FY 2023-24 onwards, a standard deduction of ₹50,000 is available for salaried individuals and pensioners under the New Tax Regime as well. For FY 2024-25, it was increased to ₹75,000 under the New Regime." },
                 { q: "How is HRA Exemption calculated?", a: "HRA exemption under the Old Regime is the minimum of three amounts: 1) Actual HRA received, 2) 50% of basic salary (for metro cities) or 40% (for non-metros), and 3) Actual rent paid minus 10% of basic salary." },
                 { q: "Who is a Senior Citizen for tax purposes?", a: "An individual resident in India who is of the age of 60 years or more but less than 80 years at any time during the previous year is considered a Senior Citizen. They get a higher basic exemption limit of ₹3 Lakhs under the Old Regime." },
                 { q: "What is Rebate under Section 87A?", a: "Section 87A provides a tax rebate. Under the Old Regime, full tax is rebated if taxable income is up to ₹5 Lakhs. Under the New Regime, full tax is rebated if taxable income is up to ₹7 Lakhs." }
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
                  { name: "Currency Converter", icon: "💱", href: "/currency-converter" },
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
