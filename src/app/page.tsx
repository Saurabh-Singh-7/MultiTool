"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { ToolCard } from "@/components/tool-card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

const popularTags = [
  { label: "Image Compressor", href: "/image-compressor" },
  { label: "PDF Merge", href: "#" },
  { label: "Background Remover", href: "/background-remover" },
  { label: "Audio Extractor", href: "#" },
]

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
]

const pdfTools = [
  {
    icon: "📄",
    name: "PDF Merge",
    description: "Combine multiple PDF files into a single document. Drag to reorder pages.",
    href: "#",
  },
  {
    icon: "✂️",
    name: "PDF Split",
    description: "Split a PDF into individual pages or extract specific page ranges.",
    href: "#",
  },
  {
    icon: "🔄",
    name: "PDF to Image",
    description: "Convert PDF pages to high-quality JPG or PNG images for easy sharing.",
    href: "#",
  },
]

const videoTools = [
  {
    icon: "🎵",
    name: "Audio Extractor",
    description: "Extract audio tracks from video files. Export as MP3, WAV, or AAC.",
    href: "#",
  },
  {
    icon: "🎬",
    name: "Video Compressor",
    description: "Reduce video file size while maintaining quality. Perfect for sharing.",
    href: "#",
  },
  {
    icon: "📹",
    name: "Video to GIF",
    description: "Convert video clips to animated GIFs. Set duration, speed, and quality.",
    href: "#",
  },
]

const calculators = [
  {
    icon: "📊",
    name: "Percentage Calculator",
    description: "Calculate percentages, increases, decreases, and differences instantly.",
    href: "#",
  },
  {
    icon: "💰",
    name: "Loan Calculator",
    description: "Calculate monthly payments, total interest, and amortization schedules.",
    href: "#",
  },
  {
    icon: "🔢",
    name: "Unit Converter",
    description: "Convert between units of length, weight, temperature, and more.",
    href: "#",
  },
]

const toolSections = [
  {
    id: "image-tools",
    title: "Image Tools",
    subtitle: "Edit, compress, convert and transform your images",
    tools: imageTools,
  },
  {
    id: "pdf-tools",
    title: "PDF Tools",
    subtitle: "Merge, split, convert and manage PDF documents",
    tools: pdfTools,
  },
  {
    id: "video-tools",
    title: "Video Tools",
    subtitle: "Extract, compress and convert video & audio files",
    tools: videoTools,
  },
  {
    id: "calculators",
    title: "Calculators",
    subtitle: "Quick math, finance and unit conversion calculators",
    tools: calculators,
  },
]

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("")

  const allTools = toolSections.flatMap((s) => s.tools)
  const filteredSections = searchQuery.trim()
    ? [
        {
          id: "search-results",
          title: "Search Results",
          subtitle: `Showing results for "${searchQuery}"`,
          tools: allTools.filter(
            (t) =>
              t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              t.description.toLowerCase().includes(searchQuery.toLowerCase())
          ),
        },
      ]
    : toolSections

  return (
    <>
      {/* ===== HERO SECTION ===== */}
      <section className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 -translate-x-1/2 h-[600px] w-[800px] rounded-full bg-brand-orange/5 blur-[120px]" />
          <div className="absolute right-0 top-1/3 h-[300px] w-[300px] rounded-full bg-brand-orange/10 blur-[80px]" />
        </div>

        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-orange/20 bg-brand-orange/5 px-4 py-1.5 text-sm text-brand-orange">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-orange opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-orange" />
            </span>
            50+ Free Tools — No Signup Required
          </div>

          {/* Heading */}
          <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl mb-6">
            Every Tool You&apos;ll Ever Need
            <span className="block text-gradient mt-1">— Free Forever</span>
          </h1>

          {/* Subtext */}
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground mb-10">
            Compress, convert, edit, extract — 50+ tools, no signup required.
            Everything runs in your browser. Your files never leave your device.
          </p>

          {/* Search bar */}
          <div className="mx-auto max-w-xl relative group">
            <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-brand-orange/50 to-brand-orange-light/50 opacity-0 blur transition-opacity duration-500 group-focus-within:opacity-100" />
            <div className="relative flex items-center rounded-xl border border-border bg-card shadow-lg">
              <Search className="ml-4 size-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search for a tool..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent px-4 py-3.5 text-sm placeholder:text-muted-foreground focus:outline-none"
                id="search-tools"
              />
              <button className="mr-2 rounded-lg bg-brand-orange px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-orange-hover cursor-pointer">
                Search
              </button>
            </div>
          </div>

          {/* Popular tags */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs text-muted-foreground mr-1">Popular:</span>
            {popularTags.map((tag) => (
              <Link key={tag.label} href={tag.href}>
                <Badge
                  variant="secondary"
                  className="cursor-pointer transition-all hover:bg-brand-orange/10 hover:text-brand-orange hover:border-brand-orange/30 border border-transparent"
                >
                  {tag.label}
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TOOLS GRID SECTIONS ===== */}
      {filteredSections.map((section) => (
        <section
          key={section.id}
          id={section.id}
          className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16"
        >
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-1 w-8 rounded-full bg-brand-orange" />
              <h2 className="font-heading text-2xl font-bold sm:text-3xl">
                {section.title}
              </h2>
            </div>
            <p className="text-muted-foreground ml-11">{section.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {section.tools.map((tool) => (
              <ToolCard key={tool.name} {...tool} />
            ))}
          </div>
        </section>
      ))}

      {filteredSections.length === 1 &&
        filteredSections[0].tools.length === 0 && (
          <div className="mx-auto max-w-7xl px-4 py-20 text-center">
            <p className="text-4xl mb-4">🔍</p>
            <p className="text-lg text-muted-foreground">
              No tools found for &ldquo;{searchQuery}&rdquo;. Try a different search.
            </p>
          </div>
        )}
    </>
  )
}
