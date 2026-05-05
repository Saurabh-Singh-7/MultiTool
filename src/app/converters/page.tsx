import { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight, ArrowRight, RefreshCcw, FileText, Image as ImageIcon, Video, Code, Table, Settings } from 'lucide-react'
import { motion } from 'framer-motion'

export const metadata: Metadata = {
  title: "Online File Converters - Convert Anything for Free | ToolHive",
  description: "Free online file converters for PDF, Image, Video, Audio, and Data. Fast, secure, and 100% private browser-based conversion. No signup, no watermark.",
  keywords: "online file converter, convert pdf, convert image, convert video, data converter, free online tools"
}

const converterGroups = [
  {
    title: "Document & PDF Converters",
    icon: <FileText className="size-6" />,
    color: "bg-blue-500/10 text-blue-500",
    links: [
      { name: "Word to PDF", href: "/word-to-pdf" },
      { name: "Excel to PDF", href: "/excel-to-pdf" },
      { name: "PDF to Image", href: "/pdf-to-image" },
      { name: "Image to PDF", href: "/image-to-pdf" },
      { name: "PDF to Word", href: "/pdf-to-word" },
      { name: "PDF to Excel", href: "/pdf-to-excel" },
      { name: "PDF to PowerPoint", href: "/pdf-to-ppt" },
    ]
  },
  {
    title: "Image & Vector Converters",
    icon: <ImageIcon className="size-6" />,
    color: "bg-orange-500/10 text-orange-500",
    links: [
      { name: "Image Converter", href: "/image-converter" },
      { name: "HEIC to JPG", href: "/heic-to-jpg" },
      { name: "SVG to PNG", href: "/svg-to-png" },
      { name: "Image Vectorizer", href: "/image-to-svg" },
      { name: "Favicon Generator", href: "/favicon-generator" },
      { name: "Base64 Converter", href: "/image-base64" },
    ]
  },
  {
    title: "Video & Audio Converters",
    icon: <Video className="size-6" />,
    color: "bg-purple-500/10 text-purple-500",
    links: [
      { name: "Audio Converter", href: "/audio-converter" },
      { name: "Extract Audio (Video to MP3)", href: "/extract-audio" },
      { name: "Video to GIF", href: "/video-to-gif" },
    ]
  },
  {
    title: "Developer & Data Converters",
    icon: <Code className="size-6" />,
    color: "bg-green-500/10 text-green-500",
    links: [
      { name: "CSV to JSON", href: "/csv-to-json" },
      { name: "JSON to CSV", href: "/csv-to-json" },
      { name: "YAML to JSON", href: "/yaml-to-json" },
      { name: "XML to JSON", href: "/xml-to-json" },
      { name: "Number Base Converter", href: "/number-converter" },
      { name: "URL Encoder/Decoder", href: "/url-encoder" },
    ]
  },
  {
    title: "Unit & Logic Converters",
    icon: <RefreshCcw className="size-6" />,
    color: "bg-cyan-500/10 text-cyan-500",
    links: [
      { name: "Unit Converter", href: "/unit-converter" },
      { name: "Currency Converter", href: "/currency-converter" },
      { name: "Text Case Converter", href: "/text-case" },
    ]
  }
]

export default function ConvertersHubPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-extrabold font-syne mb-6 tracking-tight">
            The Ultimate <span className="text-brand-orange">Converter</span> Hub
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Fast, secure, and private. Convert any file format instantly in your browser without uploading to a server.
          </p>
        </div>

        {/* Search / Filter (Mockup style for now) */}
        <div className="mb-12 relative max-w-xl mx-auto">
           <div className="bg-card border border-border rounded-full p-4 pl-12 flex items-center shadow-xl shadow-brand-orange/5">
             <div className="absolute left-5 text-muted-foreground">🔍</div>
             <input type="text" placeholder="Search for a converter (e.g. HEIC to JPG)..." className="bg-transparent border-none outline-none w-full text-sm font-medium" />
           </div>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {converterGroups.map((group, idx) => (
            <div key={idx} className="bg-card border border-border rounded-3xl p-8 hover:border-brand-orange/30 transition-all hover:shadow-xl hover:shadow-brand-orange/5 group">
              <div className={`size-12 rounded-2xl ${group.color} flex items-center justify-center mb-6`}>
                {group.icon}
              </div>
              <h2 className="text-2xl font-bold font-syne mb-6">{group.title}</h2>
              <ul className="space-y-4">
                {group.links.map((link, lIdx) => (
                  <li key={lIdx}>
                    <Link href={link.href} className="flex items-center justify-between text-muted-foreground hover:text-brand-orange font-medium transition-colors group/link">
                      <span>{link.name}</span>
                      <ArrowRight className="size-4 opacity-0 -translate-x-2 group-hover/link:opacity-100 group-hover/link:translate-x-0 transition-all" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-24 bg-brand-orange rounded-[3rem] p-12 text-white text-center shadow-2xl shadow-brand-orange/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
          <h2 className="text-3xl md:text-4xl font-bold font-syne mb-4 relative z-10">Why use ToolHive Converters?</h2>
          <div className="grid md:grid-cols-3 gap-12 mt-12 relative z-10">
            <div>
              <div className="text-4xl font-extrabold mb-2">100%</div>
              <div className="text-white/80 font-medium">Privacy Guaranteed (Local Processing)</div>
            </div>
            <div>
              <div className="text-4xl font-extrabold mb-2">FREE</div>
              <div className="text-white/80 font-medium">No Signup or Subscriptions</div>
            </div>
            <div>
              <div className="text-4xl font-extrabold mb-2">∞</div>
              <div className="text-white/80 font-medium">Unlimited File Sizes</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
