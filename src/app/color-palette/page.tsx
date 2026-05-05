import { Metadata } from 'next'
import ColorPaletteClient from './client'

export const metadata: Metadata = {
  title: "Color Palette Generator Online Free | ToolHive",
  description: "Generate beautiful color palettes instantly. Explore complementary, analogous, triadic and monochromatic schemes. Extract palettes from images. Copy HEX, RGB, HSL codes.",
  keywords: "color palette generator, color scheme generator, complementary colors, color picker, hex color palette, design color tool"
}

export default function ColorPalettePage() {
  return (
    <div className="min-h-screen bg-background font-inter">
      <main className="max-w-7xl mx-auto px-4 py-12 md:py-24">
        <nav className="flex mb-8 text-sm text-muted-foreground" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center"><a href="/" className="hover:text-brand-orange transition-colors">Home</a></li>
            <li><div className="flex items-center"><span className="mx-2 text-zinc-400">/</span><span>Design</span></div></li>
            <li aria-current="page"><div className="flex items-center"><span className="mx-2 text-zinc-400">/</span><span className="text-brand-orange font-medium">Color Palette</span></div></li>
          </ol>
        </nav>
        <div className="text-center space-y-6 mb-16 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-orange/10 text-brand-orange text-sm font-semibold tracking-wide uppercase mb-4 shadow-sm border border-brand-orange/20">
            <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-orange opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-brand-orange" /></span>
            Design Tool
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight font-syne text-foreground drop-shadow-sm">
            Color Palette <span className="text-brand-orange relative inline-block">Generator<div className="absolute -bottom-2 left-0 w-full h-1 bg-brand-orange rounded-full opacity-50 blur-[2px]"></div></span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Generate stunning color palettes with one click. Explore harmonies, extract from images, and export for your designs.
          </p>
        </div>
        <ColorPaletteClient />
        <div className="mt-32 max-w-5xl mx-auto space-y-20 border-t border-border pt-20 text-foreground">
          <section className="space-y-8">
            <h2 className="text-3xl font-bold font-syne">Understanding Color Harmonies</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: "Complementary", desc: "Colors opposite on the color wheel. High contrast and vibrant — great for calls to action." },
                { title: "Analogous", desc: "Colors next to each other on the wheel. Harmonious and pleasing — ideal for cohesive designs." },
                { title: "Triadic", desc: "Three colors equally spaced on the wheel. Balanced yet colorful — perfect for playful brands." },
                { title: "Split-Complementary", desc: "A base color plus two colors adjacent to its complement. Less tension than complementary." },
                { title: "Monochromatic", desc: "Variations of a single hue in different lightness/saturation. Elegant and minimal." },
                { title: "Random", desc: "AI-curated random palettes for inspiration when you're stuck. Hit spacebar to generate!" },
              ].map(h => (
                <div key={h.title} className="p-6 border border-border rounded-3xl bg-card hover:border-brand-orange/40 transition-colors">
                  <h3 className="font-bold mb-2">{h.title}</h3>
                  <p className="text-sm text-muted-foreground">{h.desc}</p>
                </div>
              ))}
            </div>
          </section>
          <section className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-3xl font-bold font-syne text-center">FAQs</h2>
            <div className="space-y-4">
              {[
                { q: "Can I extract colors from an image?", a: "Yes! Upload any image and we'll extract the dominant colors to build a palette automatically." },
                { q: "What formats are supported?", a: "You can copy colors in HEX, RGB, and HSL formats. Click any color swatch to copy its code instantly." },
                { q: "How do I save my palette?", a: "Click the Export button to copy the full palette as CSS variables, or use the share URL feature." },
              ].map(f => (
                <div key={f.q} className="p-8 bg-muted/50 rounded-[2.5rem] border border-border hover:border-brand-orange/30 transition-all">
                  <h4 className="font-bold mb-4 text-lg">{f.q}</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">{f.a}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
