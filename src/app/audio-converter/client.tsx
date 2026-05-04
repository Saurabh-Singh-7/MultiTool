"use client"

import React, { useState, useRef, useEffect } from 'react'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'
import { 
  UploadCloud, 
  Music, 
  Trash2, 
  Settings2, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  Download, 
  Loader2, 
  AlertTriangle, 
  RotateCcw,
  Volume2,
  Zap,
  Scissors,
  TrendingUp,
  History,
  ArrowRight,
  Play,
  Pause,
  Plus,
  FileAudio,
  Info
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import JSZip from 'jszip'

type AudioFormat = 'MP3' | 'WAV' | 'AAC' | 'OGG' | 'FLAC' | 'M4A' | 'OPUS'

interface AudioFile {
  id: string
  file: File
  name: string
  size: number
  format: string
  duration: string
  durationSecs: number
  status: 'pending' | 'processing' | 'done' | 'error'
  progress: number
  outputFormat: AudioFormat
  error?: string
}

interface GlobalSettings {
  format: AudioFormat
  bitrate: string
  sampleRate: string
  bitDepth: string
  flacLevel: number
  channels: 'stereo' | 'mono'
  volumeDB: number
  normalize: boolean
  speed: number
  trim: boolean
  startTime: string
  endTime: string
  fadeIn: number
  fadeOut: number
}

interface ConversionResult {
  id: string
  blob: Blob
  url: string
  name: string
  originalSize: number
  newSize: number
  format: AudioFormat
}

export default function AudioConverterClient() {
  const ffmpegRef = useRef<FFmpeg | null>(null)
  
  // Initialize FFmpeg only on the client
  if (!ffmpegRef.current && typeof window !== 'undefined') {
    ffmpegRef.current = new FFmpeg()
  }
  
  const ffmpeg = ffmpegRef.current!

  const [ffmpegLoading, setFFmpegLoading] = useState(true)
  const [ffmpegReady, setFFmpegReady] = useState(false)
  
  const [files, setFiles] = useState<AudioFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [status, setStatus] = useState<'idle' | 'processing' | 'done'>('idle')
  const [overallProgress, setOverallProgress] = useState(0)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showAdvanced, setShowAdvanced] = useState(false)
  
  const [settings, setSettings] = useState<GlobalSettings>({
    format: 'MP3',
    bitrate: '192',
    sampleRate: '44100',
    bitDepth: '16',
    flacLevel: 5,
    channels: 'stereo',
    volumeDB: 0,
    normalize: false,
    speed: 1.0,
    trim: false,
    startTime: '00:00:00',
    endTime: '00:00:00',
    fadeIn: 0,
    fadeOut: 0
  })

  const [results, setResults] = useState<ConversionResult[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // FFmpeg Loading
  useEffect(() => {
    const load = async () => {
      if (ffmpeg.loaded) { setFFmpegReady(true); setFFmpegLoading(false); return }
      try {
        setFFmpegLoading(true)
        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.4/dist/umd'
        await ffmpeg.load({
          coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
          wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        })
        setFFmpegReady(true)
        setFFmpegLoading(false)
      } catch (err) {
        console.error(err)
        setFFmpegLoading(false)
      }
    }
    load()
  }, [])

  const handleFiles = async (newFiles: FileList | null) => {
    if (!newFiles || newFiles.length === 0) return
    
    const validFiles: AudioFile[] = []
    const count = Math.min(newFiles.length, 10 - files.length)
    
    for (let i = 0; i < count; i++) {
      const f = newFiles[i]
      if (f.type.startsWith('audio/') || ['.mp3', '.wav', '.aac', '.ogg', '.flac', '.m4a', '.opus', '.wma', '.aiff'].some(ext => f.name.toLowerCase().endsWith(ext))) {
        const info = await getAudioInfo(f)
        validFiles.push({
          id: Math.random().toString(36).substr(2, 9),
          file: f,
          name: f.name,
          size: f.size,
          format: f.name.split('.').pop()?.toUpperCase() || 'Audio',
          duration: info.duration,
          durationSecs: info.durationSecs,
          status: 'pending',
          progress: 0,
          outputFormat: settings.format
        })
      }
    }

    setFiles(prev => [...prev, ...validFiles])
    setStatus('idle')
  }

  const getAudioInfo = (file: File): Promise<{ duration: string; durationSecs: number }> => {
    return new Promise((resolve) => {
      const audio = new Audio()
      audio.src = URL.createObjectURL(file)
      audio.onloadedmetadata = () => {
        const mins = Math.floor(audio.duration / 60)
        const secs = Math.floor(audio.duration % 60)
        const duration = `${mins}:${secs.toString().padStart(2, '0')}`
        const durationSecs = audio.duration
        URL.revokeObjectURL(audio.src)
        resolve({ duration, durationSecs })
      }
      audio.onerror = () => resolve({ duration: 'Unknown', durationSecs: 0 })
    })
  }

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id))
  }

  const updateFileFormat = (id: string, format: AudioFormat) => {
    setFiles(prev => prev.map(f => f.id === id ? { ...f, outputFormat: format } : f))
  }

  const handleConvert = async () => {
    if (files.length === 0) return
    setStatus('processing')
    setOverallProgress(0)
    const newResults: ConversionResult[] = []

    for (let i = 0; i < files.length; i++) {
      setCurrentIndex(i)
      const currentFile = files[i]
      if (currentFile.status === 'done') continue

      setFiles(prev => prev.map(f => f.id === currentFile.id ? { ...f, status: 'processing', progress: 0 } : f))
      
      try {
        const result = await runConversion(currentFile)
        newResults.push(result)
        setFiles(prev => prev.map(f => f.id === currentFile.id ? { ...f, status: 'done', progress: 100 } : f))
      } catch (err: any) {
        console.error(err)
        setFiles(prev => prev.map(f => f.id === currentFile.id ? { ...f, status: 'error', error: err.message } : f))
      }
      
      setOverallProgress(Math.round(((i + 1) / files.length) * 100))
    }

    setResults(newResults)
    setStatus('done')
  }

  const runConversion = async (audioFile: AudioFile): Promise<ConversionResult> => {
    const inputExt = audioFile.name.split('.').pop()?.toLowerCase() || 'mp3'
    const inputName = `input.${inputExt}`
    
    const codecMap: Record<AudioFormat, { codec: string; ext: string; mime: string }> = {
      'MP3':  { codec: 'libmp3lame', ext: 'mp3', mime: 'audio/mpeg' },
      'WAV':  { codec: 'pcm_s16le',  ext: 'wav', mime: 'audio/wav' },
      'AAC':  { codec: 'aac',        ext: 'aac', mime: 'audio/aac' },
      'OGG':  { codec: 'libvorbis',  ext: 'ogg', mime: 'audio/ogg' },
      'FLAC': { codec: 'flac',       ext: 'flac',mime: 'audio/flac' },
      'M4A':  { codec: 'aac',        ext: 'm4a', mime: 'audio/m4a' },
      'OPUS': { codec: 'libopus',    ext: 'opus',mime: 'audio/opus' },
    }
    
    const { codec, ext, mime } = codecMap[audioFile.outputFormat]
    const outputName = `output.${ext}`

    await ffmpeg.writeFile(inputName, await fetchFile(audioFile.file))

    ffmpeg.on('progress', ({ progress }) => {
      setFiles(prev => prev.map(f => f.id === audioFile.id ? { ...f, progress: Math.round(progress * 100) } : f))
    })

    const args = ['-i', inputName]

    // Filters
    const filters = []
    if (settings.volumeDB !== 0) filters.push(`volume=${settings.volumeDB}dB`)
    if (settings.normalize) filters.push('loudnorm=I=-14:TP=-1.5:LRA=11')
    if (settings.speed !== 1.0) filters.push(`atempo=${settings.speed}`)
    if (settings.fadeIn > 0) filters.push(`afade=t=in:d=${settings.fadeIn}`)
    if (settings.fadeOut > 0) {
      const startTime = audioFile.durationSecs / settings.speed - settings.fadeOut
      filters.push(`afade=t=out:st=${startTime}:d=${settings.fadeOut}`)
    }

    if (filters.length > 0) args.push('-af', filters.join(','))
    
    // Quality
    args.push('-c:a', codec)
    if (['MP3', 'AAC', 'OGG', 'M4A', 'OPUS'].includes(audioFile.outputFormat)) {
      args.push('-b:a', `${settings.bitrate}k`)
    }
    
    if (audioFile.outputFormat === 'WAV') {
       const bitDepthMap: Record<string, string> = { '16': 'pcm_s16le', '24': 'pcm_s24le', '32': 'pcm_s32le' }
       args.push('-c:a', bitDepthMap[settings.bitDepth] || 'pcm_s16le')
    }

    if (audioFile.outputFormat === 'FLAC') {
      args.push('-compression_level', settings.flacLevel.toString())
    }

    args.push('-ar', settings.sampleRate)
    if (settings.channels === 'mono') args.push('-ac', '1')

    if (settings.trim) {
      args.push('-ss', settings.startTime, '-to', settings.endTime)
    }

    args.push(outputName)
    await ffmpeg.exec(args)

    const data = await ffmpeg.readFile(outputName)
    const blob = new Blob([data as any], { type: mime })
    const resultUrl = URL.createObjectURL(blob)

    // Cleanup
    await ffmpeg.deleteFile(inputName)
    await ffmpeg.deleteFile(outputName)

    return {
      id: audioFile.id,
      blob,
      url: resultUrl,
      name: `${audioFile.name.split('.')[0]}_converted.${ext}`,
      originalSize: audioFile.size,
      newSize: blob.size,
      format: audioFile.outputFormat
    }
  }

  const downloadAll = async () => {
    if (results.length === 0) return
    const zip = new JSZip()
    results.forEach(res => {
      zip.file(res.name, res.blob)
    })
    const zipBlob = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(zipBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'converted_audio.zip'
    link.click()
  }

  const drawWaveform = async (url: string, canvasId: string) => {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement
    if (!canvas) return
    
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const response = await fetch(url)
      const arrayBuffer = await response.arrayBuffer()
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer)
      const data = audioBuffer.getChannelData(0)
      
      const ctx = canvas.getContext('2d')!
      const W = canvas.width = 300
      const H = canvas.height = 60
      const step = Math.ceil(data.length / W)
      const amp = H / 2

      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = '#1e293b' // slate-900
      ctx.fillRect(0, 0, W, H)
      ctx.strokeStyle = '#f97316' // brand-orange
      ctx.lineWidth = 1
      ctx.beginPath()

      for (let i = 0; i < W; i++) {
        let min = 1.0, max = -1.0
        for (let j = 0; j < step; j++) {
          const val = data[i * step + j] || 0
          if (val < min) min = val
          if (val > max) max = val
        }
        ctx.moveTo(i, (1 + min) * amp)
        ctx.lineTo(i, (1 + max) * amp)
      }
      ctx.stroke()
      audioCtx.close()
    } catch (e) {
      console.error(e)
    }
  }

  // Trigger waveforms when results appear
  useEffect(() => {
    results.forEach(res => {
      drawWaveform(res.url, `waveform-${res.id}`)
    })
  }, [results])

  if (ffmpegLoading) {
    return (
      <div className="max-w-2xl mx-auto bg-card rounded-3xl p-12 border border-border shadow-xl text-center space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="relative inline-flex">
           <div className="w-24 h-24 rounded-full border-4 border-brand-orange/20 border-t-brand-orange animate-spin" />
           <div className="absolute inset-0 flex items-center justify-center">
             <Music className="size-8 text-brand-orange" />
           </div>
        </div>
        <div className="space-y-4">
          <h2 className="text-2xl font-bold font-syne">⚙️ Loading Audio Engine</h2>
          <Progress value={62} className="h-3 w-64 mx-auto" />
          <div className="text-muted-foreground text-sm">
            Preparing FFmpeg audio engine... first time only.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      
      {/* Upload Zone */}
      {status === 'idle' && files.length === 0 && (
        <div
          className={`border-3 border-dashed rounded-[2.5rem] p-20 flex flex-col items-center justify-center transition-all duration-300 ease-in-out cursor-pointer min-h-[400px] relative overflow-hidden group
            ${isDragging ? 'border-brand-orange bg-brand-orange/5 scale-[1.01]' : 'border-border hover:border-brand-orange/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20'}
          `}
          onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={e => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files) }}
          onClick={() => fileInputRef.current?.click()}
        >
          <input type="file" ref={fileInputRef} className="hidden" accept="audio/*" multiple onChange={e => handleFiles(e.target.files)} />
          <div className="w-24 h-24 bg-brand-orange/10 rounded-full flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 shadow-inner">
            <Music className="size-12 text-brand-orange animate-pulse" />
          </div>
          <h3 className="text-3xl font-bold font-syne mb-4 text-foreground text-center">Drop audio files here to convert</h3>
          <p className="text-muted-foreground text-center text-lg max-w-lg">MP3, WAV, AAC, OGG, FLAC, M4A, OPUS supported • Up to 10 files</p>
        </div>
      )}

      {/* Main UI */}
      {files.length > 0 && status !== 'done' && (
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Settings Panel */}
          <div className="lg:col-span-12 xl:col-span-4 space-y-6">
             <div className="bg-card rounded-3xl border border-border shadow-2xl p-8 space-y-8 sticky top-8">
                <div className="space-y-4">
                  <label className="text-sm font-black uppercase tracking-widest text-muted-foreground">Global Output Format</label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['MP3', 'WAV', 'AAC', 'OGG', 'FLAC', 'M4A', 'OPUS'] as AudioFormat[]).map(f => (
                      <button
                        key={f}
                        onClick={() => {
                          setSettings(prev => ({ ...prev, format: f }))
                          setFiles(prev => prev.map(af => ({ ...af, outputFormat: f })))
                        }}
                        className={`py-3 rounded-xl text-xs font-bold border transition-all ${settings.format === f ? 'bg-brand-orange border-brand-orange text-white shadow-lg' : 'bg-muted border-border hover:bg-zinc-200 dark:hover:bg-zinc-800'}`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-6 pt-4 border-t border-border">
                   {['MP3', 'AAC', 'OGG', 'M4A', 'OPUS'].includes(settings.format) && (
                     <div className="space-y-4">
                        <label className="text-sm font-bold flex justify-between">Bitrate <span>{settings.bitrate} kbps</span></label>
                        <div className="grid grid-cols-3 gap-2">
                          {['64', '128', '192', '256', '320'].map(b => (
                            <button 
                              key={b}
                              onClick={() => setSettings(prev => ({ ...prev, bitrate: b }))}
                              className={`py-2 rounded-lg text-[10px] font-bold border ${settings.bitrate === b ? 'bg-brand-orange text-white border-brand-orange' : 'bg-muted border-border'}`}
                            >
                              {b}k
                            </button>
                          ))}
                        </div>
                     </div>
                   )}

                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-muted-foreground">Sample Rate</label>
                        <select 
                          value={settings.sampleRate} 
                          onChange={e => setSettings(prev => ({ ...prev, sampleRate: e.target.value }))}
                          className="w-full h-10 rounded-xl bg-muted border-border text-xs px-3 font-bold"
                        >
                          <option value="44100">44.1 kHz</option>
                          <option value="48000">48 kHz</option>
                          <option value="22050">22.05 kHz</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-muted-foreground">Channels</label>
                        <div className="flex bg-muted p-1 rounded-xl h-10">
                          <button onClick={() => setSettings(prev => ({ ...prev, channels: 'stereo' }))} className={`flex-1 text-[10px] font-bold rounded-lg ${settings.channels === 'stereo' ? 'bg-card text-brand-orange shadow-sm' : 'text-muted-foreground'}`}>Stereo</button>
                          <button onClick={() => setSettings(prev => ({ ...prev, channels: 'mono' }))} className={`flex-1 text-[10px] font-bold rounded-lg ${settings.channels === 'mono' ? 'bg-card text-brand-orange shadow-sm' : 'text-muted-foreground'}`}>Mono</button>
                        </div>
                      </div>
                   </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-border">
                  <button 
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex items-center justify-between w-full text-sm font-bold text-muted-foreground hover:text-foreground"
                  >
                    <div className="flex items-center gap-2"><Settings2 className="size-4" /> Advanced Options</div>
                    {showAdvanced ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                  </button>

                  {showAdvanced && (
                    <div className="space-y-6 pt-2 animate-in slide-in-from-top-2 duration-300">
                       <div className="space-y-3">
                         <div className="flex justify-between text-[10px] font-black uppercase text-muted-foreground">
                            <span>Volume Adjust</span>
                            <span>{settings.volumeDB > 0 ? '+' : ''}{settings.volumeDB} dB</span>
                         </div>
                         <Slider value={[settings.volumeDB]} min={-20} max={20} onValueChange={(v: any) => setSettings(prev => ({ ...prev, volumeDB: v[0] ?? v }))} />
                       </div>

                       <div className="flex items-center justify-between p-3 bg-muted rounded-2xl">
                          <div className="space-y-0.5">
                             <p className="text-xs font-bold">Normalize Audio</p>
                             <p className="text-[10px] text-muted-foreground">-14 LUFS (Spotify/YT Standard)</p>
                          </div>
                          <Switch checked={settings.normalize} onCheckedChange={c => setSettings(prev => ({ ...prev, normalize: c }))} />
                       </div>

                       <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase text-muted-foreground">Fade In (s)</label>
                             <Input type="number" value={settings.fadeIn} onChange={e => setSettings(prev => ({ ...prev, fadeIn: Number(e.target.value) }))} className="h-10 rounded-xl" />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase text-muted-foreground">Fade Out (s)</label>
                             <Input type="number" value={settings.fadeOut} onChange={e => setSettings(prev => ({ ...prev, fadeOut: Number(e.target.value) }))} className="h-10 rounded-xl" />
                          </div>
                       </div>
                    </div>
                  )}
                </div>

                <Button 
                  onClick={handleConvert}
                  disabled={status === 'processing' || files.length === 0}
                  className="w-full bg-brand-orange hover:bg-brand-orange/90 text-white h-16 rounded-full text-xl font-bold shadow-xl shadow-brand-orange/20"
                >
                  {status === 'processing' ? <><Loader2 className="mr-3 size-6 animate-spin" /> Converting...</> : `Convert ${files.length} File${files.length > 1 ? 's' : ''}`}
                </Button>
             </div>
          </div>

          {/* File List Panel */}
          <div className="lg:col-span-12 xl:col-span-8 space-y-6">
             <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                   <Badge className="bg-brand-orange/10 text-brand-orange hover:bg-brand-orange/20 transition-colors py-1.5 px-4 rounded-full border-brand-orange/20">
                     {files.length} Files Selected
                   </Badge>
                   <span className="text-xs text-muted-foreground font-medium">Total Size: {(files.reduce((a, b) => a + b.size, 0) / 1024 / 1024).toFixed(1)} MB</span>
                </div>
                <div className="flex gap-2">
                   <Button variant="outline" size="sm" className="rounded-full h-9" onClick={() => fileInputRef.current?.click()}><Plus className="size-4 mr-1" /> Add More</Button>
                   <Button variant="ghost" size="sm" className="rounded-full h-9 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => setFiles([])}><Trash2 className="size-4 mr-1" /> Clear All</Button>
                </div>
             </div>

             <div className="bg-card rounded-[2rem] border border-border shadow-xl overflow-hidden">
                <div className="divide-y divide-border">
                  {files.map((f, idx) => (
                    <div key={f.id} className={`p-6 transition-colors group hover:bg-zinc-50/50 dark:hover:bg-zinc-900/10 ${f.status === 'processing' ? 'bg-brand-orange/5' : ''}`}>
                       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-4 flex-1 overflow-hidden">
                             <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner ${f.status === 'done' ? 'bg-green-500/10 text-green-500' : f.status === 'processing' ? 'bg-brand-orange/10 text-brand-orange' : 'bg-muted text-zinc-400'}`}>
                                {f.status === 'done' ? <CheckCircle2 className="size-6" /> : <Music className={`size-6 ${f.status === 'processing' ? 'animate-bounce' : ''}`} />}
                             </div>
                             <div className="min-w-0">
                                <p className="font-bold truncate text-foreground pr-4">{f.name}</p>
                                <div className="flex items-center gap-2 mt-1 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                   <span className="px-2 py-0.5 bg-muted rounded-md">{f.format}</span>
                                   <span>•</span>
                                   <span>{f.duration}</span>
                                   <span>•</span>
                                   <span>{(f.size/1024/1024).toFixed(1)} MB</span>
                                </div>
                             </div>
                          </div>

                          <div className="flex items-center gap-4">
                             <ArrowRight className="size-4 text-muted-foreground hidden sm:block" />
                             <select 
                               value={f.outputFormat} 
                               disabled={status === 'processing'}
                               onChange={(e) => updateFileFormat(f.id, e.target.value as AudioFormat)}
                               className="h-10 rounded-xl bg-muted border-border text-xs px-4 font-black text-brand-orange focus:ring-2 ring-brand-orange/20"
                             >
                               {['MP3', 'WAV', 'AAC', 'OGG', 'FLAC', 'M4A', 'OPUS'].map(fmt => <option key={fmt} value={fmt}>{fmt}</option>)}
                             </select>
                             <Button 
                               variant="ghost" 
                               size="icon" 
                               className="rounded-xl text-zinc-400 hover:text-red-500 hover:bg-red-50"
                               onClick={() => removeFile(f.id)}
                               disabled={status === 'processing'}
                             >
                               <Trash2 className="size-5" />
                             </Button>
                          </div>
                       </div>

                       {f.status === 'processing' && (
                         <div className="mt-4 space-y-2">
                           <div className="flex justify-between text-[10px] font-black text-brand-orange uppercase">
                             <span>Processing...</span>
                             <span>{f.progress}%</span>
                           </div>
                           <Progress value={f.progress} className="h-1.5" />
                         </div>
                       )}

                       {f.error && (
                         <div className="mt-3 flex items-center gap-2 text-xs text-red-500 font-bold bg-red-50 dark:bg-red-950/20 p-2 rounded-lg">
                           <AlertTriangle className="size-4" /> {f.error}
                         </div>
                       )}
                    </div>
                  ))}
                </div>
             </div>

             {status === 'processing' && (
               <div className="bg-brand-orange text-white rounded-[2rem] p-8 shadow-2xl shadow-brand-orange/30 animate-in slide-in-from-bottom-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                     <Zap className="size-24" />
                  </div>
                  <div className="relative z-10 space-y-6">
                    <div className="flex justify-between items-end">
                       <div className="space-y-1">
                          <h4 className="text-2xl font-black font-syne">Converting Batch</h4>
                          <p className="text-brand-orange-foreground/80 font-medium">Processing file {currentIndex + 1} of {files.length}</p>
                       </div>
                       <span className="text-5xl font-black">{overallProgress}%</span>
                    </div>
                    <Progress value={overallProgress} className="h-3 bg-white/20" />
                    <p className="text-sm font-bold animate-pulse">Converting: {files[currentIndex]?.name} → {files[currentIndex]?.outputFormat}</p>
                  </div>
               </div>
             )}
          </div>
        </div>
      )}

      {/* Results View */}
      {status === 'done' && results.length > 0 && (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-12 duration-1000">
          <div className="bg-card rounded-[3rem] border border-border shadow-2xl overflow-hidden">
             <div className="bg-green-500/5 p-10 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                   <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white shadow-xl shadow-green-500/20">
                     <CheckCircle2 className="size-10" />
                   </div>
                   <div>
                     <h3 className="text-3xl font-bold font-syne">Conversion Complete</h3>
                     <p className="text-muted-foreground">{results.length} of {files.length} files successfully converted.</p>
                   </div>
                </div>
                <Button 
                  onClick={downloadAll}
                  className="bg-brand-orange hover:bg-brand-orange/90 text-white h-16 px-10 rounded-full text-xl font-bold shadow-xl shadow-brand-orange/30"
                >
                  <Download className="mr-3 size-6" /> Download All ZIP
                </Button>
             </div>

             <div className="p-4 sm:p-10 divide-y divide-border">
                {results.map(res => (
                  <div key={res.id} className="py-8 first:pt-0 last:pb-0 space-y-6">
                     <div className="flex flex-col md:flex-row justify-between gap-6">
                        <div className="flex-1 space-y-4">
                           <div className="flex items-center gap-3">
                              <h4 className="font-bold text-lg truncate max-w-[300px]">{res.name}</h4>
                              <Badge className="bg-brand-orange text-white uppercase text-[10px] font-black">{res.format}</Badge>
                           </div>
                           
                           <div className="flex items-center gap-6">
                              <div className="space-y-1">
                                 <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Original</p>
                                 <p className="font-bold">{(res.originalSize/1024/1024).toFixed(1)} MB</p>
                              </div>
                              <ArrowRight className="size-4 text-zinc-300" />
                              <div className="space-y-1">
                                 <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">New Size</p>
                                 <div className="flex items-center gap-2">
                                    <p className="font-bold">{(res.newSize/1024/1024).toFixed(1)} MB</p>
                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded ${res.newSize < res.originalSize ? 'bg-green-500/10 text-green-600' : 'bg-brand-orange/10 text-brand-orange'}`}>
                                       {res.newSize < res.originalSize ? '-' : '+'}{Math.abs(Math.round((1 - res.newSize/res.originalSize) * 100))}%
                                    </span>
                                 </div>
                              </div>
                           </div>
                        </div>

                        <div className="space-y-4">
                           <canvas id={`waveform-${res.id}`} className="rounded-xl shadow-inner bg-slate-900 w-full h-[60px]" />
                           <audio controls src={res.url} className="w-full h-10 custom-audio-player" />
                        </div>
                     </div>
                  </div>
                ))}
             </div>

             <div className="p-10 bg-muted/30 border-t border-border text-center">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setFiles([])
                    setResults([])
                    setStatus('idle')
                  }}
                  className="h-14 rounded-full px-10 text-lg font-bold border-2"
                >
                  <RotateCcw className="mr-3 size-5" /> Convert More Files
                </Button>
             </div>
          </div>
        </div>
      )}
    </div>
  )
}
