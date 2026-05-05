"use client"

import React, { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { FFmpeg } from "@ffmpeg/ffmpeg"
import { fetchFile, toBlobURL } from "@ffmpeg/util"
import { Upload, Video, X, Download, AlertCircle, ChevronRight, CheckCircle2, Loader2, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { saveAs } from "file-saver"

export default function WebMToMP4Client() {
  const [ffmpegReady, setFfmpegReady] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<'idle' | 'processing' | 'done' | 'error'>('idle')
  const [progress, setProgress] = useState(0)
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const ffmpegRef = useRef<FFmpeg | null>(null)

  useEffect(() => {
    loadFFmpeg()
  }, [])

  const loadFFmpeg = async () => {
    const ffmpeg = new FFmpeg()
    ffmpegRef.current = ffmpeg
    const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.4/dist/umd"
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
    })
    setFfmpegReady(true)
  }

  const handleFile = (files: FileList | null) => {
    if (!files || files.length === 0) return
    setFile(files[0])
    setStatus('idle')
    setResultUrl(null)
  }

  const convertToMP4 = async () => {
    if (!file || !ffmpegRef.current) return
    const ffmpeg = ffmpegRef.current
    setStatus('processing')
    setProgress(0)

    ffmpeg.on("progress", ({ progress }) => {
      setProgress(Math.round(progress * 100))
    })

    try {
      const inputName = "input.webm"
      const outputName = "output.mp4"
      await ffmpeg.writeFile(inputName, await fetchFile(file))

      // Using faster preset for browser conversion
      await ffmpeg.exec(["-i", inputName, "-c:v", "libx264", "-preset", "veryfast", "-crf", "23", "-c:a", "aac", outputName])

      const data = await ffmpeg.readFile(outputName)
      const url = URL.createObjectURL(new Blob([data as any], { type: "video/mp4" }))
      setResultUrl(url)
      setStatus('done')
    } catch (err) {
      console.error(err)
      setStatus('error')
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
        <ChevronRight className="size-4" />
        <Link href="/#video-tools" className="hover:text-foreground transition-colors">Video Tools</Link>
        <ChevronRight className="size-4" />
        <span className="text-foreground font-medium">WebM to MP4</span>
      </nav>

      <div className="mb-12 text-center max-w-2xl mx-auto">
        <h1 className="font-heading text-4xl sm:text-5xl font-extrabold mb-4">
          WebM to <span className="text-brand-orange">MP4</span> Converter
        </h1>
        <p className="text-muted-foreground text-lg">
          Fast, private, and high-quality. Convert your WebM videos to universally supported MP4 format in your browser.
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-8">
        {!file && (
          <div 
            className="border-2 border-dashed border-border rounded-3xl p-16 text-center cursor-pointer hover:border-brand-orange/50 transition-all bg-card"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files) }}
            onClick={() => document.getElementById('fileInput')?.click()}
          >
            <input id="fileInput" type="file" className="hidden" accept=".webm" onChange={(e) => handleFile(e.target.files)} />
            <div className="size-20 bg-brand-orange/10 text-brand-orange rounded-full flex items-center justify-center mx-auto mb-6">
              <Video className="size-10" />
            </div>
            <h2 className="text-2xl font-bold font-syne mb-2">Drop WebM video here</h2>
            <p className="text-muted-foreground">Max 500MB • Local processing</p>
          </div>
        )}

        {file && status === 'idle' && (
          <div className="bg-card border border-border rounded-3xl p-8 flex items-center justify-between shadow-lg animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center gap-4">
              <div className="size-12 bg-brand-orange/10 text-brand-orange rounded-xl flex items-center justify-center">
                <Play className="size-6" />
              </div>
              <div>
                <p className="font-bold truncate max-w-[200px] sm:max-w-md">{file.name}</p>
                <p className="text-xs text-muted-foreground uppercase font-black tracking-widest">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={() => setFile(null)}>Cancel</Button>
              <Button className="bg-brand-orange hover:bg-brand-orange/90 text-white font-bold rounded-full px-8" onClick={convertToMP4} disabled={!ffmpegReady}>
                {ffmpegReady ? 'Convert to MP4' : 'Loading Engine...'}
              </Button>
            </div>
          </div>
        )}

        {status === 'processing' && (
          <div className="bg-card border border-border rounded-3xl p-12 text-center space-y-6 shadow-xl">
            <div className="relative inline-flex mb-4">
              <div className="size-20 rounded-full border-4 border-brand-orange/10 border-t-brand-orange animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Video className="size-8 text-brand-orange" />
              </div>
            </div>
            <h3 className="text-2xl font-bold font-syne">Converting Video...</h3>
            <div className="space-y-2 max-w-xs mx-auto">
              <div className="flex justify-between text-xs font-black uppercase">
                <span>Progress</span>
                <span className="text-brand-orange">{progress}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-brand-orange transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Please keep this tab open. Processing happens in your browser.</p>
          </div>
        )}

        {status === 'done' && resultUrl && (
          <div className="bg-card border border-border rounded-3xl p-10 text-center space-y-8 shadow-2xl animate-in zoom-in duration-500">
            <div className="size-20 bg-green-500 rounded-full flex items-center justify-center mx-auto text-white shadow-xl shadow-green-500/20">
              <CheckCircle2 className="size-12" />
            </div>
            <h2 className="text-3xl font-bold font-syne">Conversion Complete!</h2>
            <div className="bg-muted/50 rounded-2xl p-6 border border-border inline-block mx-auto">
               <video src={resultUrl} controls className="max-h-[300px] rounded-lg shadow-inner" />
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-brand-orange hover:bg-brand-orange/90 text-white h-14 px-10 rounded-full text-xl font-black shadow-xl shadow-brand-orange/20" onClick={() => saveAs(resultUrl, file!.name.replace(".webm", ".mp4"))}>
                <Download className="size-6 mr-3" /> Download MP4
              </Button>
              <Button variant="outline" className="h-14 px-8 rounded-full font-bold" onClick={() => {setFile(null); setStatus('idle');}}>
                Convert Another
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
