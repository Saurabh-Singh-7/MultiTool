import { Metadata } from 'next'
import BMICalculatorClient from './client'

export const metadata: Metadata = {
  title: "BMI Calculator Online Free - Body Mass Index Calculator",
  description: "Calculate your BMI (Body Mass Index) online for free. Know if you are underweight, normal, overweight or obese. Get healthy weight range and tips. Metric and imperial units supported.",
  keywords: "bmi calculator, body mass index calculator, bmi calculator online free, healthy weight calculator, bmi calculator india, bmi chart, ideal weight calculator, overweight calculator",
}

export default function BMICalculatorPage() {
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
                <span className="text-brand-orange font-medium">BMI Calculator</span>
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
            Body Composition Analysis
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight font-syne text-foreground drop-shadow-sm">
            BMI Calculator — <span className="text-brand-orange relative inline-block">Check Your Index<div className="absolute -bottom-2 left-0 w-full h-1 bg-brand-orange rounded-full opacity-50 blur-[2px]"></div></span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-inter leading-relaxed">
            Calculate your Body Mass Index instantly. Find out if you are at a healthy weight and get personalized tips — free, no signup needed.
          </p>
        </div>

        <BMICalculatorClient />

        {/* SEO Content Section */}
        <div className="mt-32 max-w-5xl mx-auto space-y-20 border-t border-border pt-20 font-inter text-foreground">
          <section className="space-y-8">
            <h2 className="text-3xl font-bold font-syne">What is BMI?</h2>
            <div className="grid md:grid-cols-2 gap-12">
               <div className="space-y-4">
                  <p className="text-muted-foreground leading-relaxed">
                     BMI (Body Mass Index) is a measure of body fat based on height and weight that applies to adult men and women. 
                     While it doesn't measure body fat directly, it is a highly useful screening tool to identify possible weight problems.
                  </p>
                  <div className="bg-muted p-6 rounded-3xl border border-border font-mono text-lg text-center select-all">
                     BMI = weight(kg) / height(m)²
                  </div>
               </div>
               <div className="space-y-4">
                  <h4 className="font-bold">Example Calculation:</h4>
                  <p className="text-muted-foreground italic">
                     If you weigh 70 kg and are 1.70 m tall: <br/>
                     70 ÷ (1.70 × 1.70) = 24.2 BMI
                  </p>
               </div>
            </div>
          </section>

          <section className="bg-brand-orange/5 p-12 rounded-[3rem] border border-brand-orange/20 space-y-8">
             <h2 className="text-3xl font-bold font-syne">BMI Categories (WHO Standard)</h2>
             <div className="overflow-x-auto">
                <table className="w-full text-left">
                   <thead className="border-b border-brand-orange/20">
                      <tr>
                         <th className="py-4 font-bold text-sm uppercase tracking-widest text-brand-orange">BMI Range</th>
                         <th className="py-4 font-bold text-sm uppercase tracking-widest text-brand-orange">Category</th>
                         <th className="py-4 font-bold text-sm uppercase tracking-widest text-brand-orange">Health Risk</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-brand-orange/10">
                      <tr><td className="py-4">&lt; 18.5</td><td className="py-4">Underweight</td><td className="py-4 text-sm text-muted-foreground">Nutrient deficiency, osteoporosis</td></tr>
                      <tr><td className="py-4">18.5 – 24.9</td><td className="py-4 text-green-500 font-bold">Normal Weight</td><td className="py-4 text-sm text-muted-foreground">Low risk</td></tr>
                      <tr><td className="py-4">25.0 – 29.9</td><td className="py-4 text-yellow-600 font-bold">Overweight</td><td className="py-4 text-sm text-muted-foreground">Increased risk of diabetes, heart disease</td></tr>
                      <tr><td className="py-4">30.0 – 34.9</td><td className="py-4 text-orange-600 font-bold">Obese Class I</td><td className="py-4 text-sm text-muted-foreground">High risk</td></tr>
                      <tr><td className="py-4">35.0 – 39.9</td><td className="py-4 text-red-600 font-bold">Obese Class II</td><td className="py-4 text-sm text-muted-foreground">Very high risk</td></tr>
                      <tr><td className="py-4">&gt; 40.0</td><td className="py-4 text-red-900 font-bold uppercase">Obese Class III</td><td className="py-4 text-sm text-muted-foreground">Severe health consequences</td></tr>
                   </tbody>
                </table>
             </div>
          </section>

          <section className="space-y-10">
             <h2 className="text-3xl font-bold font-syne">BMI for Indians — Asian Cutoffs</h2>
             <div className="grid lg:grid-cols-2 gap-16">
                <div className="space-y-6">
                   <p className="text-muted-foreground leading-relaxed">
                      Research indicates that people of South Asian descent (including Indians) have a higher percentage of body fat and higher risk of metabolic diseases at lower BMI levels compared to Caucasians. 
                      Therefore, WHO and Indian health authorities recommend lower BMI cutoffs for Asians:
                   </p>
                   <ul className="space-y-4">
                      <li className="flex gap-4 p-4 bg-muted/50 rounded-2xl border border-border">
                         <span className="font-bold text-brand-orange">Normal:</span> 18.5 – 22.9
                      </li>
                      <li className="flex gap-4 p-4 bg-muted/50 rounded-2xl border border-border">
                         <span className="font-bold text-yellow-600">Overweight:</span> 23.0 – 27.4
                      </li>
                      <li className="flex gap-4 p-4 bg-muted/50 rounded-2xl border border-border">
                         <span className="font-bold text-red-600">Obese:</span> ≥ 27.5
                      </li>
                   </ul>
                </div>
                <div className="space-y-6 bg-[#1e293b] p-8 rounded-[2.5rem] text-white">
                   <h3 className="text-xl font-bold font-syne">Why these cutoffs matter?</h3>
                   <p className="text-zinc-400 text-sm leading-relaxed">
                      South Asians tend to store more fat around the abdomen (visceral fat), which is metabolically more active and dangerous. 
                      Even if your BMI is 24, which is "Normal" by global standards, an Indian adult may already have the metabolic profile of someone who is overweight.
                   </p>
                </div>
             </div>
          </section>

          <section className="space-y-8">
             <h2 className="text-3xl font-bold font-syne">Limitations of BMI</h2>
             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                  { t: "Muscle vs Fat", d: "BMI doesn't distinguish between muscle mass and fat. Athletes often have a high BMI despite having very low body fat." },
                  { t: "Body Fat Distribution", d: "It doesn't tell where fat is stored. Abdominal fat is much riskier than fat stored in other areas." },
                  { t: "Age Effects", d: "Older adults may benefit from having a slightly higher BMI (25-27) for bone density and resilience." },
                  { t: "Bone Density", d: "People with large frames or high bone density may have a high BMI without being unhealthy." },
                  { t: "Gender Differences", d: "Women naturally have a higher body fat percentage than men at the same BMI level." }
                ].map(item => (
                  <div key={item.t} className="p-8 border border-border rounded-3xl hover:border-brand-orange/50 transition-colors">
                     <h4 className="font-bold mb-3">{item.t}</h4>
                     <p className="text-sm text-muted-foreground">{item.d}</p>
                  </div>
                ))}
             </div>
          </section>

          <section className="max-w-3xl mx-auto space-y-8">
             <h2 className="text-3xl font-bold font-syne text-center">Frequently Asked Questions</h2>
             <div className="space-y-4">
               {[
                 { q: "What is a good BMI?", a: "For most adults, a BMI between 18.5 and 24.9 is considered normal/healthy. For Asians, 18.5 to 22.9 is the healthy range." },
                 { q: "Is BMI accurate for everyone?", a: "No. It is less accurate for athletes, pregnant women, growing children, and the elderly. It should be used alongside waist circumference and other health markers." },
                 { q: "What BMI is considered obese?", a: "A BMI of 30 or above is classified as obese globally. For Asians, the threshold is lower at 27.5." },
                 { q: "How can I lower my BMI?", a: "The best way is to combine a calorie-controlled balanced diet with regular physical activity. Consult a nutritionist for a personalized plan." },
                 { q: "How much weight should I lose?", a: "Our calculator shows your 'Healthy Weight Range.' Aiming for the upper end of that range is a great first goal." }
               ].map((faq) => (
                 <div key={faq.q} className="p-8 bg-muted/50 rounded-[2.5rem] border border-border">
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
                  { name: "Age Calculator", icon: "🎂", href: "/age-calculator" },
                  { name: "Loan Calculator", icon: "💰", href: "/loan-calculator" },
                  { name: "Percentage Calculator", icon: "🔢", href: "/percentage-calculator" },
                  { name: "Scientific Calculator", icon: "🧪", href: "/scientific-calculator" }
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
