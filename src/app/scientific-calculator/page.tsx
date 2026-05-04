import { Metadata } from 'next'
import ScientificCalculatorClient from './client'

export const metadata: Metadata = {
  title: "Scientific Calculator Online Free - Advanced Math Calculator",
  description: "Free online scientific calculator with trigonometry, logarithms, powers, roots, constants and more. Works like a real calculator. No signup.",
  keywords: "scientific calculator online, advanced calculator free, trig calculator, sin cos tan calculator, logarithm calculator, online math calculator, scientific calculator with steps",
}

export default function ScientificCalculatorPage() {
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
                <span className="text-brand-orange font-medium">Scientific Calculator</span>
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
            Precision Math Engine
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight font-syne text-foreground drop-shadow-sm">
            Scientific <span className="text-brand-orange relative inline-block">Calculator<div className="absolute -bottom-2 left-0 w-full h-1 bg-brand-orange rounded-full opacity-50 blur-[2px]"></div></span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-inter leading-relaxed">
            A fully functional scientific calculator in your browser. Supports trigonometry, logarithms, powers, roots, constants and complex expressions. Free, no signup needed.
          </p>
        </div>

        <ScientificCalculatorClient />

        {/* SEO Content Section */}
        <div className="mt-32 max-w-4xl mx-auto space-y-16 border-t border-border pt-16 font-inter">
          <section className="space-y-6">
            <h2 className="text-3xl font-bold font-syne text-foreground">How to Use the Scientific Calculator</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="font-bold text-xl flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-brand-orange/10 text-brand-orange flex items-center justify-center text-sm">1</span>
                  Basic Operations
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Enter numbers using the keyboard or on-screen buttons. Use standard operators (+, -, *, /) for simple math. Press Enter or click "=" to see the final result.
                </p>
              </div>
              <div className="space-y-4">
                <h3 className="font-bold text-xl flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-brand-orange/10 text-brand-orange flex items-center justify-center text-sm">2</span>
                  Scientific Functions
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Access advanced functions like sin, cos, tan, log, and roots. Click the <strong>2nd</strong> button to switch to inverse functions (asin, acos, atan).
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-8 bg-brand-orange/5 p-12 rounded-[3rem] border border-brand-orange/20">
            <h2 className="text-3xl font-bold font-syne text-foreground">Advanced Functions Guide</h2>
            <div className="grid md:grid-cols-3 gap-6">
               {[
                 { title: "Trigonometry", items: ["sin, cos, tan", "asin, acos, atan", "DEG / RAD / GRAD"] },
                 { title: "Algebra", items: ["log, ln, log2", "x², x³, x^y", "√, ∛, x!"] },
                 { title: "Memory", items: ["MC (Clear)", "MR (Recall)", "M+ / M- / MS"] }
               ].map((cat) => (
                 <div key={cat.title} className="bg-white/50 p-6 rounded-2xl border border-white">
                   <h4 className="font-bold mb-4 text-brand-orange uppercase tracking-widest text-xs">{cat.title}</h4>
                   <ul className="space-y-2">
                     {cat.items.map(i => <li key={i} className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-brand-orange" /> {i}
                     </li>)}
                   </ul>
                 </div>
               ))}
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-3xl font-bold font-syne text-foreground">Degree vs Radian Mode</h2>
            <p className="text-muted-foreground leading-relaxed">
              Before performing trigonometric calculations, ensure you are in the correct angle mode. 
              <strong> Degree mode</strong> is typically used for general math and geometry (sin 90° = 1). 
              <strong> Radian mode</strong> is standard in physics and calculus (sin π/2 = 1). 
              <strong> Gradian mode</strong> is used in some engineering fields where a right angle is 100 grads.
            </p>
          </section>

          <section className="max-w-3xl mx-auto space-y-6">
             <h2 className="text-2xl font-bold font-syne text-center">Frequently Asked Questions</h2>
             <div className="space-y-4">
               {[
                 { q: "What is the difference between log and ln?", a: "log usually refers to base-10 logarithm, while ln is the natural logarithm (base e ≈ 2.718). Our calculator provides both for precision." },
                 { q: "How do I calculate sin⁻¹ (arcsin)?", a: "Toggle the '2nd' button on the top row. The sin, cos, and tan buttons will change to their inverse functions." },
                 { q: "Can I use my keyboard?", a: "Yes! Full keyboard support is enabled. Use numbers, basic operators, and letters like 's' for sin, 'c' for cos, and 'Enter' for equals." },
                 { q: "What does ANS do?", a: "The ANS button inserts the result of your very last calculation into your current expression, allowing for multi-step math." }
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
