"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { ToolCard } from "@/components/tool-card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

// ─── TOOL DATA ──────────────────────────────────────────────────────────

const imageTools = [
  {
    icon: "🗜️",
    name: "Image Compressor",
    description: "Reduce image file size up to 90% without visible quality loss. Supports JPG, PNG, WebP.",
    href: "/image-compressor",
  },
  {
    icon: "🔄",
    name: "Image Converter",
    description: "Convert images between JPG, PNG, WebP, GIF, and BMP formats instantly.",
    href: "/image-converter",
  },
  {
    icon: "✂️",
    name: "Image Cropper",
    description: "Crop your images to exact dimensions or specific aspect ratios.",
    href: "/image-crop",
  },
  {
    icon: "🎨",
    name: "Background Remover",
    description: "Remove image backgrounds with AI precision. Get transparent PNGs in seconds.",
    href: "/background-remover",
  },
  {
    icon: "📐",
    name: "Image Resizer",
    description: "Resize images to exact dimensions while maintaining aspect ratio and quality.",
    href: "/image-resizer",
  },
  {
    icon: "🖼️",
    name: "Watermark Adder",
    description: "Add text or image watermarks to protect your photos and artwork.",
    href: "/add-watermark",
  },
  {
    icon: "📄",
    name: "Image to PDF",
    description: "Convert JPG, PNG, WebP images to PDF. Combine multiple images into one document.",
    href: "/image-to-pdf",
  },
  {
    icon: "🎨",
    name: "Color Picker",
    description: "Extract exact colors and palettes from any image. Get HEX, RGB, HSL and CMYK codes.",
    href: "/image-color-picker",
  },
  {
    icon: "🔍",
    name: "Image Enlarger",
    description: "AI image upscaler. Enlarge photos 2x, 4x, or 8x without losing quality or adding blur.",
    href: "/image-enlarger",
  },
  {
    icon: "✨",
    name: "Noise Remover",
    description: "Remove grain and noise from photos. Smooth out JPEG artifacts and sharpen details.",
    href: "/image-denoise",
  },
  {
    icon: "🌫️",
    name: "Image Blur",
    description: "Blur faces, pixelate sensitive areas, or blur photo backgrounds to protect privacy.",
    href: "/image-blur",
  },
  {
    icon: "📋",
    name: "EXIF Viewer",
    description: "View hidden image metadata like camera settings and GPS. Remove EXIF data for privacy.",
    href: "/image-metadata",
  },
  {
    icon: "🔡",
    name: "Base64 Converter",
    description: "Convert images to Base64 encoded strings for HTML/CSS, or decode strings back to images.",
    href: "/image-base64",
  },
  {
    icon: "🛡️",
    name: "Remove Metadata",
    description: "Batch strip EXIF data, GPS location, and camera details to protect your privacy.",
    href: "/remove-metadata",
  },
  {
    icon: "🪄",
    name: "Watermark Remover",
    description: "Erase text, date stamps, and logos from photos using AI-powered inpainting algorithms.",
    href: "/watermark-remover",
  },
  {
    icon: "📱",
    name: "HEIC to JPG",
    description: "Convert iPhone HEIC photos to JPG instantly in your browser. 100% private.",
    href: "/heic-to-jpg",
  },
  {
    icon: "📐",
    name: "SVG to PNG",
    description: "Convert vector SVGs to high-resolution PNG images with transparent backgrounds.",
    href: "/svg-to-png",
  },
  {
    icon: "🪄",
    name: "Image Vectorizer",
    description: "Convert PNG or JPG images to clean, scalable SVG vectors instantly. 100% private.",
    href: "/image-to-svg",
  },
]

const pdfTools = [
  {
    icon: "📄",
    name: "PDF Merge",
    description: "Combine multiple PDF files into a single document. Drag to reorder pages.",
    href: "/pdf-merge",
  },
  {
    icon: "✂️",
    name: "PDF Split",
    description: "Split a PDF into individual pages or extract specific page ranges.",
    href: "/pdf-split",
  },
  {
    icon: "🗜️",
    name: "PDF Compress",
    description: "Reduce PDF file size up to 90% without losing quality. Set custom size targets.",
    href: "/pdf-compress",
  },
  {
    icon: "🔄",
    name: "PDF to Image",
    description: "Convert PDF pages to high-quality JPG or PNG images for easy sharing.",
    href: "/pdf-to-image",
  },
  {
    icon: "📝",
    name: "PDF Editor",
    description: "Edit PDF files online for free. Add text, insert images, draw shapes, and more.",
    href: "/pdf-editor",
  },
  {
    icon: "📝",
    name: "PDF to Word",
    description: "Convert PDF files to editable Word documents online for free. Preserve formatting, fonts and layout.",
    href: "/pdf-to-word",
  },
  {
    icon: "📊",
    name: "PDF to Excel",
    description: "Convert PDF tables to Excel spreadsheets online for free. Extract data from PDF to XLSX.",
    href: "/pdf-to-excel",
  },
  {
    icon: "📽️",
    name: "PDF to PowerPoint",
    description: "Convert PDF to PowerPoint presentations online for free. Each PDF page becomes a slide.",
    href: "/pdf-to-ppt",
  },
  {
    icon: "🔒",
    name: "PDF Password Protect",
    description: "Add password protection and encryption to your PDF files. Set permissions and secure documents instantly.",
    href: "/pdf-protect",
  },
  {
    icon: "🔓",
    name: "PDF Unlock",
    description: "Remove passwords and restrictions from your PDF files securely in your browser. Fast and completely private.",
    href: "/pdf-unlock",
  },
  {
    icon: "©️",
    name: "PDF Watermark",
    description: "Add custom text or image watermarks to your PDF documents. Customize position, opacity, and rotation.",
    href: "/pdf-watermark",
  },
  {
    icon: "📝",
    name: "Word to PDF",
    description: "Convert Word documents (.docx) to high-quality PDF files instantly. 100% private.",
    href: "/word-to-pdf",
  },
  {
    icon: "📊",
    name: "Excel to PDF",
    description: "Convert Excel spreadsheets (.xlsx, .xls) to professional PDF reports instantly. 100% private.",
    href: "/excel-to-pdf",
  },
]

const videoTools = [
  {
    icon: "🎵",
    name: "Audio Extractor",
    description: "Extract audio from video files online for free. Convert MP4 to MP3, WAV, AAC and more instantly in browser.",
    href: "/extract-audio",
  },
  {
    icon: "🎬",
    name: "Video Compressor",
    description: "Reduce video file size by up to 90% without losing quality. Support for MP4, AVI, MOV and HEVC.",
    href: "/video-compressor",
  },
  {
    icon: "📹",
    name: "Video to GIF",
    description: "Convert video clips to animated GIFs. Set duration, speed, and quality.",
    href: "/video-to-gif",
  },
  {
    icon: "✂️",
    name: "Video Trimmer",
    description: "Trim and cut videos online for free. Support for MP4, MOV, and AVI with fast stream copy.",
    href: "/video-trimmer",
  },
  {
    icon: "🎥",
    name: "Screen Recorder",
    description: "Record your screen online with audio and webcam. No software download needed, direct MP4 export.",
    href: "/screen-recorder",
  },
  {
    icon: "🔇",
    name: "Remove Audio",
    description: "Remove audio from video, mute completely, or replace with a new track instantly.",
    href: "/remove-audio",
  },
  {
    icon: "🎼",
    name: "Audio Converter",
    description: "Convert between MP3, WAV, AAC, FLAC and more. Batch convert files with advanced audio filters.",
    href: "/audio-converter",
  },
  {
    icon: "🔗",
    name: "Merge Audio",
    description: "Join multiple audio files into one. Drag to reorder, add silence gaps, or crossfade tracks.",
    href: "/merge-audio",
  },
  {
    icon: "🎬",
    name: "WebM to MP4",
    description: "Convert WebM videos to highly compatible MP4 format instantly. 100% private.",
    href: "/webm-to-mp4",
  },
]

const calculators = [
  {
    icon: "🧮",
    name: "Scientific Calculator",
    description: "Advanced online scientific calculator with trigonometry, logarithms, and complex math support.",
    href: "/scientific-calculator",
  },
  {
    icon: "📊",
    name: "Percentage Calculator",
    description: "Calculate percentages, increases, decreases, and differences instantly.",
    href: "/percentage-calculator",
  },
  {
    icon: "💰",
    name: "Loan Calculator",
    description: "Calculate monthly payments, total interest, and amortization schedules.",
    href: "/loan-calculator",
  },
  {
    icon: "⚖️",
    name: "BMI Calculator",
    description: "Calculate your Body Mass Index (BMI) and check your healthy weight range.",
    href: "/bmi-calculator",
  },
  {
    icon: "🔢",
    name: "Unit Converter",
    description: "Convert between units of length, weight, temperature, and more.",
    href: "/unit-converter",
  },
  {
    icon: "🎂",
    name: "Age Calculator",
    description: "Calculate your exact age in years, months, days, hours and minutes instantly.",
    href: "/age-calculator",
  },
  {
    icon: "💱",
    name: "Currency Converter",
    description: "Convert between 170+ currencies with live exchange rates. Updated daily.",
    href: "/currency-converter",
  },
  {
    icon: "📉",
    name: "Tax Calculator",
    description: "Calculate your exact income tax liability for FY 2024-25. Compare new vs old tax regime.",
    href: "/tax-calculator",
  },
  {
    icon: "📅",
    name: "Date Calculator",
    description: "Calculate exact days, weeks, months, and working days between two dates.",
    href: "/date-calculator",
  },
  {
    icon: "⛽",
    name: "Fuel Calculator",
    description: "Calculate fuel cost, required fuel, and cost per km for your trip.",
    href: "/fuel-calculator",
  },
]

const developerTools = [
  { icon: "🔑", name: "Password Generator", description: "Create completely random, highly secure passwords instantly.", href: "/password-generator" },
  { icon: "🔢", name: "Number Converter", description: "Convert values between Binary, Octal, Decimal, and Hexadecimal in real-time.", href: "/number-converter" },
  { icon: "📱", name: "QR Code Generator", description: "Create custom QR codes with logo, colors, and design. URL, WiFi, vCard and more.", href: "/qr-generator" },
  { icon: "{ }", name: "JSON Formatter", description: "Format, validate, minify and explore JSON with syntax highlighting and tree view.", href: "/json-formatter" },
  { icon: "🎨", name: "Color Palette", description: "Generate stunning color palettes. Explore harmonies, extract from images, export CSS.", href: "/color-palette" },
  { icon: "📓", name: "Markdown Editor", description: "Write and preview markdown in real-time with syntax highlighting.", href: "/markdown-editor" },
  { icon: "🔠", name: "Text Case Converter", description: "Convert text to UPPERCASE, lowercase, Title Case, camelCase, snake_case and more.", href: "/text-case" },
  { icon: "🔗", name: "URL Encoder/Decoder", description: "Encode and decode URLs, Base64, and HTML entities instantly.", href: "/url-encoder" },
  { icon: "#️⃣", name: "Hash Generator", description: "Generate SHA-256, SHA-512, SHA-1 hashes from text or files. Verify file integrity.", href: "/hash-generator" },
  { icon: "📊", name: "CSV to JSON", description: "Convert CSV data to JSON format and vice versa instantly. Perfect for developers.", href: "/csv-to-json" },
  { icon: "📄", name: "YAML to JSON", description: "Convert YAML configuration files to JSON and vice versa instantly. Secure and private.", href: "/yaml-to-json" },
  { icon: "📜", name: "XML to JSON", description: "Convert XML data to JSON format and vice versa instantly. Modernize legacy data.", href: "/xml-to-json" },
]

const businessProductivity = [
  { icon: "⏱️", name: "Stopwatch & Timer", description: "Precise stopwatch with laps and countdown timer with audio alerts.", href: "/stopwatch" },
  { icon: "🍅", name: "Pomodoro Timer", description: "Stay focused with the Pomodoro technique. 25/5 cycles with session tracking.", href: "/pomodoro" },
  { icon: "🧾", name: "Invoice Generator", description: "Create professional invoices with line items, tax, and download as PDF.", href: "/invoice-generator" },
  { icon: "📝", name: "Word Counter", description: "Get instant live statistics on your text including word count and keyword density.", href: "/word-counter" },
  { icon: "📜", name: "Lorem Ipsum", description: "Generate placeholder text for your designs. Paragraphs, sentences, or words.", href: "/lorem-generator" },
  { icon: "📄", name: "Resume Builder", description: "Create a professional resume in minutes with a real-time preview and PDF export.", href: "/resume-builder" },
]

const creativeFun = [
  { icon: "😀", name: "Emoji Picker", description: "Search, browse, and copy 300+ emojis by category. Click to copy instantly.", href: "/emoji-picker" },
  { icon: "🌈", name: "CSS Gradient", description: "Create stunning CSS gradients visually. Linear, radial, conic. Copy CSS code.", href: "/css-gradient" },
  { icon: "⭐", name: "Favicon Generator", description: "Convert any image to favicons for web, iOS, and Android. All sizes generated.", href: "/favicon-generator" },
  { icon: "😂", name: "Meme Generator", description: "Upload images, add top and bottom text, customize fonts and download memes.", href: "/meme-generator" },
]

// ─── CURATED SECTIONS ───────────────────────────────────────────────────

const mostPopularTools = [
  { icon: "🗜️", name: "Image Compressor", description: "Reduce image file size up to 90% without visible quality loss.", href: "/image-compressor" },
  { icon: "📄", name: "PDF Merge", description: "Combine multiple PDF files into a single document.", href: "/pdf-merge" },
  { icon: "🎨", name: "Background Remover", description: "Remove image backgrounds with AI precision.", href: "/background-remover" },
  { icon: "🗜️", name: "PDF Compress", description: "Reduce PDF file size up to 90% without losing quality.", href: "/pdf-compress" },
  { icon: "🔄", name: "Image Converter", description: "Convert images between JPG, PNG, WebP, GIF, and BMP.", href: "/image-converter" },
  { icon: "🎵", name: "Audio Extractor", description: "Extract audio from video files. Convert MP4 to MP3 instantly.", href: "/extract-audio" },
  { icon: "📝", name: "PDF Editor", description: "Edit PDF files online. Add text, images, shapes, and more.", href: "/pdf-editor" },
  { icon: "💱", name: "Currency Converter", description: "Convert between 170+ currencies with live exchange rates.", href: "/currency-converter" },
]

const staffPicksTools = [
  { icon: "🪄", name: "Watermark Remover", description: "Erase text, date stamps, and logos from photos using AI.", href: "/watermark-remover" },
  { icon: "🎥", name: "Screen Recorder", description: "Record your screen with audio and webcam. No download needed.", href: "/screen-recorder" },
  { icon: "📉", name: "Tax Calculator", description: "Compare New vs Old tax regime instantly for FY 2024-25.", href: "/tax-calculator" },
  { icon: "🔍", name: "Image Enlarger", description: "AI upscaler — enlarge photos 2x to 8x without losing quality.", href: "/image-enlarger" },
  { icon: "🔑", name: "Password Generator", description: "Generate ultra-secure passwords with a strength meter.", href: "/password-generator" },
  { icon: "📝", name: "PDF to Word", description: "Convert PDF files to editable Word documents for free.", href: "/pdf-to-word" },
]

// ─── CATEGORY TABS ──────────────────────────────────────────────────────

const categories = [
  { id: "all", label: "🌟 All Tools" },
  { id: "image", label: "🖼️ Image" },
  { id: "pdf", label: "📄 PDF" },
  { id: "video", label: "🎬 Video & Audio" },
  { id: "calculators", label: "🧮 Calculators" },
  { id: "developer", label: "💻 Developer" },
  { id: "productivity", label: "⚡ Productivity" },
  { id: "creative", label: "🎨 Creative" },
]

const categorySectionsMap = [
  { id: "image-tools", title: "Image Tools", items: imageTools },
  { id: "pdf-tools", title: "PDF Utilities", items: pdfTools },
  { id: "video-tools", title: "Video & Audio Converters", items: videoTools },
  { id: "calculators", title: "Smart Calculators", items: calculators },
  { id: "developer-tools", title: "Developer Tools", items: developerTools },
  { id: "productivity-tools", title: "Productivity", items: businessProductivity },
  { id: "creative-tools", title: "Creative & Fun", items: creativeFun },
]

const categoryToolsMap: Record<string, any[]> = {
  image: imageTools,
  pdf: pdfTools,
  video: videoTools,
  calculators: calculators,
  developer: developerTools,
  productivity: businessProductivity,
  creative: creativeFun,
}

const allToolsCombined = [
  ...imageTools, ...pdfTools, ...videoTools, ...calculators, ...developerTools, ...businessProductivity, ...creativeFun
]

const popularTags = [
  { label: "SVG to PNG", href: "/svg-to-png" },
  { label: "CSV to JSON", href: "/csv-to-json" },
  { label: "Excel to PDF", href: "/excel-to-pdf" },
  { label: "Word to PDF", href: "/word-to-pdf" },
  { label: "HEIC to JPG", href: "/heic-to-jpg" },
  { label: "Image Compressor", href: "/image-compressor" },
  { label: "PDF Merge", href: "/pdf-merge" },
  { label: "Background Remover", href: "/background-remover" },
  { label: "Audio Extractor", href: "/extract-audio" },
  { label: "Currency Converter", href: "/currency-converter" },
]

// ─── HOMEPAGE ───────────────────────────────────────────────────────────

import { motion, AnimatePresence } from "framer-motion"

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("all")

  const isSearching = searchQuery.trim() !== ""

  const searchResults = isSearching
    ? allToolsCombined.filter(
        (t) =>
          t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : []

  const categoryTools =
    activeCategory === "all"
      ? allToolsCombined
      : categoryToolsMap[activeCategory] || []

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.1 }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  }

  return (
    <>
      {/* ===== HERO SECTION ===== */}
      <section className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute left-1/2 top-0 -translate-x-1/2 h-[600px] w-[800px] rounded-full bg-brand-orange/5 blur-[120px]" 
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
            className="absolute right-0 top-1/3 h-[300px] w-[300px] rounded-full bg-brand-orange/10 blur-[80px]" 
          />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "circOut" }}
          className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center"
        >
          {/* Badge */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-orange/20 bg-brand-orange/5 px-4 py-1.5 text-sm font-semibold text-brand-orange shadow-sm shadow-brand-orange/10"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-orange opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-orange" />
            </span>
            50+ Free Tools — No Signup Required
          </motion.div>

          {/* Heading */}
          <h1 className="font-heading text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl mb-6 drop-shadow-sm">
            Every Tool You&apos;ll Ever Need
            <span className="block text-gradient mt-2">— Free Forever</span>
          </h1>

          {/* Subtext */}
          <p className="mx-auto max-w-2xl text-lg sm:text-xl text-muted-foreground mb-10 leading-relaxed font-medium">
            Compress, convert, edit, extract — 50+ tools, no signup required.
            Everything runs in your browser. Your files never leave your device.
          </p>

          {/* Search bar */}
          <motion.div 
            whileHover={{ scale: 1.01 }}
            className="mx-auto max-w-xl relative group z-10"
          >
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-brand-orange/50 to-brand-orange-light/50 opacity-0 blur-lg transition-opacity duration-500 group-focus-within:opacity-100" />
            <div className="relative flex items-center rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl shadow-xl shadow-black/5">
              <Search className="ml-5 size-5 text-brand-orange" />
              <input
                type="text"
                placeholder="Search for any tool... (e.g. PDF Merge)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent px-4 py-4 text-base placeholder:text-muted-foreground/60 focus:outline-none focus:ring-0 border-none"
                id="search-tools"
              />
              <AnimatePresence>
                {searchQuery && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={() => setSearchQuery("")}
                    className="mr-2 rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                  >
                    <span className="text-lg leading-none">×</span>
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Popular tags */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-2"
          >
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground mr-2">Popular:</span>
            {popularTags.map((tag) => (
              <Link key={tag.label} href={tag.href} scroll={false}>
                <Badge
                  variant="secondary"
                  className="cursor-pointer transition-all duration-300 hover:bg-brand-orange/10 hover:text-brand-orange hover:border-brand-orange/30 border border-border/50 rounded-lg py-1 px-3"
                >
                  {tag.label}
                </Badge>
              </Link>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ===== SEARCH RESULTS ===== */}
      {isSearching && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-1 w-8 rounded-full bg-brand-orange" />
              <h2 className="font-heading text-2xl font-bold sm:text-3xl">
                Search Results
              </h2>
            </div>
            <p className="text-muted-foreground ml-11">
              {searchResults.length} tool{searchResults.length !== 1 ? "s" : ""} found for &ldquo;{searchQuery}&rdquo;
            </p>
          </div>

          {searchResults.length > 0 ? (
            <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {searchResults.map((tool) => (
                <motion.div key={tool.name + tool.href} variants={item} layout>
                  <ToolCard {...tool} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mx-auto max-w-7xl px-4 py-20 text-center">
              <p className="text-5xl mb-4">🔍</p>
              <p className="text-xl font-medium text-muted-foreground">
                No tools found for &ldquo;{searchQuery}&rdquo;.
              </p>
              <button onClick={() => setSearchQuery("")} className="mt-6 text-brand-orange hover:underline font-medium">Clear search</button>
            </motion.div>
          )}
        </section>
      )}

      {/* ===== MAIN CONTENT (hidden during search) ===== */}
      {!isSearching && (
        <>
          {/* ── 🔥 MOST POPULAR ── */}
          <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-1 w-8 rounded-full bg-brand-orange" />
                <h2 className="font-heading text-2xl font-bold sm:text-3xl">
                  🔥 Most Popular Tools
                </h2>
              </div>
              <p className="text-muted-foreground ml-11">The tools our users love the most — start here</p>
            </div>

            <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {mostPopularTools.map((tool) => (
                <motion.div key={tool.name} variants={item}>
                  <ToolCard {...tool} />
                </motion.div>
              ))}
            </motion.div>
          </section>

          {/* ── ⭐ STAFF PICKS ── */}
          <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-1 w-8 rounded-full bg-brand-orange" />
                <h2 className="font-heading text-2xl font-bold sm:text-3xl">
                  ⭐ Staff Picks
                </h2>
              </div>
              <p className="text-muted-foreground ml-11">Unique and powerful tools you might have missed</p>
            </div>

            <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {staffPicksTools.map((tool) => (
                <motion.div key={tool.name} variants={item}>
                  <ToolCard {...tool} />
                </motion.div>
              ))}
            </motion.div>
          </section>

          {/* ── 📂 ALL TOOLS — CATEGORY TABS ── */}
          <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 border-t border-border/50" id="all-tools">
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-1 w-8 rounded-full bg-brand-orange" />
                <h2 className="font-heading text-2xl font-bold sm:text-3xl">
                  All Tools
                </h2>
              </div>
              <p className="text-muted-foreground ml-11">Browse all {allToolsCombined.length}+ tools by category</p>
            </div>

            {/* Segmented Control Category Tabs */}
            <div className="flex flex-wrap gap-2 mb-10 bg-muted/20 p-2 rounded-2xl border border-border/50 max-w-fit">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`relative px-5 py-2.5 rounded-xl text-sm font-bold transition-colors cursor-pointer z-10 ${
                    activeCategory === cat.id
                      ? "text-white"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {activeCategory === cat.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-brand-orange rounded-xl shadow-md -z-10"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  {cat.label}
                  <span className="ml-1.5 text-xs opacity-70">
                    ({cat.id === "all" ? allToolsCombined.length : (categoryToolsMap[cat.id]?.length || 0)})
                  </span>
                </button>
              ))}
            </div>

            {/* Tool Grids */}
            <motion.div 
              key={activeCategory} // Force re-animation when category changes
              variants={container} 
              initial="hidden" 
              animate="show" 
              className="space-y-16"
            >
              {activeCategory === "all" ? (
                // Show all sections with IDs when "All" is selected
                categorySectionsMap.map((section) => (
                  <div key={section.id} id={section.id} className="scroll-mt-32">
                    <h3 className="font-heading text-xl font-bold mb-6 flex items-center gap-2 text-muted-foreground">
                      {section.title}
                      <span className="h-px bg-border/50 flex-1 ml-4" />
                    </h3>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {section.items.map((tool) => (
                        <motion.div key={tool.name + tool.href} variants={item} layout>
                          <ToolCard {...tool} />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                // Show single category grid when a specific tab is selected
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {categoryToolsMap[activeCategory]?.map((tool) => (
                    <motion.div key={tool.name + tool.href} variants={item} layout>
                      <ToolCard {...tool} />
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </section>
        </>
      )}
    </>
  )
}
