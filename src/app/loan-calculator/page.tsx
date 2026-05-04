import { Metadata } from 'next'
import LoanCalculatorClient from './client'

export const metadata: Metadata = {
  title: "EMI Calculator Online Free - Loan EMI Calculator India | ToolHive",
  description: "Calculate EMI for home loan, car loan, personal loan online free. Get monthly EMI, total interest, amortization schedule instantly. No signup required.",
  keywords: "emi calculator, loan calculator online free, home loan emi calculator, car loan emi calculator, personal loan calculator, monthly emi calculator india, loan amortization calculator",
}

export default function LoanCalculatorPage() {
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
                <span className="text-brand-orange font-medium">EMI Calculator</span>
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
            Precision Financial Planning
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight font-syne text-foreground drop-shadow-sm">
            Loan EMI <span className="text-brand-orange relative inline-block">Calculator<div className="absolute -bottom-2 left-0 w-full h-1 bg-brand-orange rounded-full opacity-50 blur-[2px]"></div></span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-inter leading-relaxed">
            Calculate your monthly EMI for any loan instantly. Home loan, car loan, personal loan — get complete amortization schedule with charts.
          </p>
        </div>

        <LoanCalculatorClient />

        {/* SEO Content Section */}
        <div className="mt-32 max-w-5xl mx-auto space-y-20 border-t border-border pt-20 font-inter">
          <section className="space-y-8">
            <h2 className="text-3xl font-bold font-syne text-foreground">How to Calculate EMI</h2>
            <div className="grid md:grid-cols-2 gap-12">
               <div className="space-y-4">
                  <p className="text-muted-foreground leading-relaxed">
                     EMI (Equated Monthly Installment) is the fixed monthly payment for a loan that includes both principal and interest. 
                     The mathematical formula to calculate EMI is:
                  </p>
                  <div className="bg-muted p-6 rounded-3xl border border-border font-mono text-lg text-center select-all">
                     EMI = P × r × (1+r)ⁿ / ((1+r)ⁿ - 1)
                  </div>
               </div>
               <div className="space-y-4">
                  <ul className="space-y-2 text-sm">
                     <li className="flex gap-2"><strong>P</strong>: Principal Loan Amount</li>
                     <li className="flex gap-2"><strong>r</strong>: Monthly Interest Rate (Annual Rate / 12 / 100)</li>
                     <li className="flex gap-2"><strong>n</strong>: Loan Tenure in Months</li>
                  </ul>
                  <p className="text-muted-foreground text-xs italic">
                     Example: A ₹30 Lakh loan at 8.5% for 20 years results in an EMI of ₹26,035/month.
                  </p>
               </div>
            </div>
          </section>

          <section className="bg-brand-orange/5 p-12 rounded-[3rem] border border-brand-orange/20 space-y-12">
             <h2 className="text-3xl font-bold font-syne text-foreground">Loan Comparison Matrix</h2>
             <div className="grid md:grid-cols-3 gap-8">
                {[
                  { type: "Home Loan", rate: "7-9%", tenure: "Up to 30 yrs", benefits: "Tax benefits under 80C & 24(b)" },
                  { type: "Car Loan", rate: "8-12%", tenure: "Up to 7 yrs", benefits: "Vehicle as collateral" },
                  { type: "Personal Loan", rate: "12-24%", tenure: "Up to 5 yrs", benefits: "Unsecured, fast approval" }
                ].map(loan => (
                  <div key={loan.type} className="bg-card p-8 rounded-[2.5rem] border border-border shadow-sm">
                     <h4 className="font-bold text-xl mb-4 text-brand-orange">{loan.type}</h4>
                     <div className="space-y-2 text-sm text-muted-foreground">
                        <p><strong>Avg Rates:</strong> {loan.rate}</p>
                        <p><strong>Max Tenure:</strong> {loan.tenure}</p>
                        <p className="pt-4 border-t border-border">{loan.benefits}</p>
                     </div>
                  </div>
                ))}
             </div>
          </section>

          <section className="space-y-10">
             <h2 className="text-3xl font-bold font-syne text-foreground">How to Reduce Your Total Interest</h2>
             <div className="grid lg:grid-cols-2 gap-16">
                <div className="space-y-6">
                   <h3 className="text-xl font-bold">1. Higher Down Payment</h3>
                   <p className="text-muted-foreground">Reducing the principal amount (P) is the most direct way to lower your EMI and total interest burden.</p>
                   
                   <h3 className="text-xl font-bold">2. Prepayments</h3>
                   <p className="text-muted-foreground">Making extra payments (even once a year) can drastically reduce your tenure. Our calculator shows that a ₹50,000 yearly prepayment on a ₹30L loan can save over ₹8 Lakh in interest.</p>
                </div>
                <div className="space-y-6">
                   <h3 className="text-xl font-bold">3. Tenure Balance</h3>
                   <p className="text-muted-foreground">While a longer tenure reduces your monthly EMI, it significantly increases the total interest paid. Aim for the shortest tenure you can comfortably afford.</p>
                   
                   <h3 className="text-xl font-bold">4. Interest Rate Negotiation</h3>
                   <p className="text-muted-foreground">For floating rate loans, always track the market. Even a 0.5% reduction can save lakhs over a 20-year period.</p>
                </div>
             </div>
          </section>

          <section className="max-w-3xl mx-auto space-y-8">
             <h2 className="text-3xl font-bold font-syne text-center">Frequently Asked Questions</h2>
             <div className="space-y-4">
               {[
                 { q: "What is EMI?", a: "EMI stands for Equated Monthly Installment. It's a fixed payment made to a lender at a specified date each month until the loan is paid off in full." },
                 { q: "Can I pay off my loan early?", a: "Yes, most banks allow prepayment. For floating rate home loans, there are usually no penalties. Check your agreement for fixed-rate personal/car loans." },
                 { q: "What happens if I miss an EMI?", a: "Banks charge a penalty (usually 2% extra) on the overdue amount. More importantly, it negatively impacts your CIBIL credit score." },
                 { q: "Does a higher EMI mean less interest?", a: "Yes. A higher EMI usually implies a shorter tenure, which means you pay interest for fewer months, significantly reducing the total interest cost." }
               ].map((faq) => (
                 <div key={faq.q} className="p-8 bg-muted/50 rounded-[2.5rem] border border-border">
                   <h4 className="font-bold mb-4 text-lg">{faq.q}</h4>
                   <p className="text-muted-foreground text-sm leading-relaxed">{faq.a}</p>
                 </div>
               ))}
             </div>
          </section>
        </div>
      </main>
    </div>
  )
}
