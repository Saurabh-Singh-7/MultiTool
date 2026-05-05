"use client"

import React, { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, FileImage, X, Download, AlertCircle, ChevronRight, CheckCircle2, Loader2, Wand2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { saveAs } from "file-saver"
import ImageTracer from "imagetracerjs"

export default function ImageToSVGClient() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>("")
  const [output, setOutput] = useState<string>("")
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = (files: FileList | null) => {
    if (!files || files.length === 0) return
    const f = files[0]
    if (!f.type.startsWith('image/')) {
      alert("Please upload an image file.")
      return
    }
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setOutput("")
  }

  const vectorize = async () => {
    if (!file) return
    setIsProcessing(true)

    try {
      const url = URL.createObjectURL(file)
      
      // ImageTracer is old-school and uses callbacks
      ImageTracer.imageToSVG(
        url,
        (svgString: string) => {
          setOutput(svgString)
          setIsProcessing(false)
          URL.revokeObjectURL(url)
        },
        { 
          ltra: 1,
          qtra: 1,
          pathomit: 8,
          colorsampling: 1,
          numberofcolors: 16,
          mincolorratio: 0.02,
          colorquantcycles: 3,
          scale: 1,
          simplifythreshold: 0.5,
          rounddefs: 1,
          blurradius: 0,
          blurdelta: 20
        }
      )
    } catch (err) {
      console.error(err)
      setIsProcessing(false)
      alert("Failed to vectorize image.")
    }
  }

  const downloadSVG = () => {
    if (!output) return
    const blob = new Blob([output], { type: 'image/svg+xml' })
    saveAs(blob, `toolhive-vectorized.svg`)
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
        <ChevronRight className="size-4" />
        <Link href="/#image-tools" className="hover:text-foreground transition-colors">Image Tools</Link>
        <ChevronRight className="size-4" />
        <span className="text-foreground font-medium">Image Vectorizer</span>
      </nav>

      {/* Hero Header */}
      <div className="mb-12 text-center max-w-2xl mx-auto">
        <h1 className="font-heading text-4xl sm:text-5xl font-extrabold mb-4">
          Image <span className="text-brand-orange">Vectorizer</span>
        </h1>
        <p className="text-muted-foreground text-lg">
          Turn your pixels into paths. Convert PNG or JPG images into clean, scalable SVG vectors instantly.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-start">
        {/* Upload & Preview */}
        <div className="space-y-6">
          <div 
            className="relative group bg-card border-2 border-dashed border-border hover:border-brand-orange/50 transition-all rounded-3xl p-12 text-center cursor-pointer overflow-hidden"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files) }}
            onClick={() => fileInputRef.current?.click()}
          >
            {preview ? (
              <img src={preview} alt="Preview" className="max-h-[300px] mx-auto rounded-xl shadow-lg" />
            ) : (
              <div className="relative z-10">
                <div className="size-20 bg-brand-orange/10 text-brand-orange rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Upload className="size-10" />
                </div>
                <h2 className="text-2xl font-bold font-syne mb-2">Drop image here</h2>
                <p className="text-muted-foreground mb-6">PNG, JPG, or WebP</p>
                <Button className="bg-brand-orange hover:bg-brand-orange/90 text-white rounded-full">Select Image</Button>
              </div>
            )}
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => handleFile(e.target.files)} />
          </div>

          {file && !output && (
            <Button 
              className="w-full bg-brand-orange hover:bg-brand-orange/90 text-white font-bold h-14 text-lg rounded-2xl shadow-xl"
              onClick={vectorize}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="size-5 animate-spin mr-2" />
                  Tracing Image...
                </>
              ) : (
                <>
                  <Wand2 className="size-5 mr-2" />
                  Vectorize Now
                </>
              )}
            </Button>
          )}
        </div>

        {/* Output */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-3xl p-8 min-h-[400px] flex flex-col items-center justify-center text-center relative overflow-hidden">
            {output ? (
              <>
                <div 
                  className="w-full h-[300px] flex items-center justify-center"
                  dangerouslySetInnerHTML={{ __html: output }}
                />
                <div className="mt-8 flex gap-4">
                  <Button className="bg-green-500 hover:bg-green-600 text-white font-bold rounded-full px-8" onClick={downloadSVG}>
                    <Download className="size-4 mr-2" />
                    Download SVG
                  </Button>
                  <Button variant="outline" className="rounded-full border-border" onClick={() => { setFile(null); setPreview(""); setOutput(""); }}>
                    New Image
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-muted-foreground opacity-50 flex flex-col items-center">
                <FileImage className="size-16 mb-4" />
                <p className="font-medium">Vector preview will appear here</p>
                <p className="text-xs">Processing is 100% local and private</p>
              </div>
            )}
            
            {isProcessing && (
              <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                <Loader2 className="size-12 text-brand-orange animate-spin mb-4" />
                <p className="font-bold font-syne">Analyzing Paths...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
