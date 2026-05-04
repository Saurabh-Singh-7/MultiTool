"use client"

import React, { useState, useRef, useEffect } from 'react'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'
import { 
  UploadCloud, 
  Music, 
  Video, 
  Settings, 
  Scissors, 
  Play, 
  CheckCircle2, 
  Download, 
  Loader2, 
  AlertTriangle, 
  RotateCcw,
  Layers,
  FileVideo,
  Info
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import JSZip from 'jszip'



interface VideoMetadata {
  name: string
  size: number
  duration: number
  format: string
  width?: number
  height?: number
  url: string
}

interface AudioSettings {
  format: 'MP3' | 'WAV' | 'AAC' | 'OGG' | 'FLAC'
  bitrate: '128' | '192' | '256' | '320'
  sampleRate: 44100 | 48000 | 22050
  channels: 'stereo' | 'mono' | 'left' | 'right'
  trim: boolean
  startTime: string
  endTime: string
}

export default function ExtractAudioClient() {
  const ffmpegRef = useRef<FFmpeg | null>(null)
  
  if (!ffmpegRef.current && typeof window !== 'undefined') {
    ffmpegRef.current = new FFmpeg()
  }
  
  const ffmpeg = ffmpegRef.current!

  // FFmpeg State
  const [ffmpegLoading, setFFmpegLoading] = useState(true)
  const [ffmpegReady, setFFmpegReady] = useState(false)
  const [ffmpegProgress, setFFmpegProgress] = useState(0)
  const [ffmpegError, setFFmpegError] = useState<string | null>(null)

  // App State
  const [isBatchMode, setIsBatchMode] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [currentFileIndex, setCurrentFileIndex] = useState(0)
  const [videoMetadata, setVideoMetadata] = useState<VideoMetadata | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [status, setStatus] = useState<'idle' | 'processing' | 'done' | 'error'>('idle')
  const [extractionProgress, setExtractionProgress] = useState(0)
  const [statusMsg, setStatusMsg] = useState('')
  
  // Settings
  const [settings, setSettings] = useState<AudioSettings>({
    format: 'MP3',
    bitrate: '192',
    sampleRate: 44100,
    channels: 'stereo',
    trim: false,
    startTime: '00:00:00',
    endTime: '00:00:00'
  })

  // Results
  const [results, setResults] = useState<{ blob: Blob; url: string; size: number }[]>([])
  const [activeResultIndex, setActiveResultIndex] = useState(0)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Initialize FFmpeg
  const loadFFmpeg = async () => {
    if (ffmpeg.loaded) {
      setFFmpegReady(true)
      setFFmpegLoading(false)
      return
    }

    try {
      setFFmpegLoading(true)
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.4/dist/umd'

      ffmpeg.on('log', ({ message }) => {
        // Parse progress if possible, but FFmpeg logs are verbose
        if (message.includes('time=')) {
          // Progress is handled via 'progress' event in 0.12+
        }
      })

      ffmpeg.on('progress', ({ progress }) => {
        setExtractionProgress(Math.round(progress * 100))
      })

      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      })

      setFFmpegReady(true)
      setFFmpegLoading(false)
    } catch (err: any) {
      console.error(err)
      setFFmpegError('Failed to load FFmpeg engine. Please ensure your browser supports SharedArrayBuffer and cross-origin isolation.')
      setFFmpegLoading(false)
    }
  }

  useEffect(() => {
    loadFFmpeg()
  }, [])

  // Handle File Selection
  const handleFiles = (newFiles: FileList | null) => {
    if (!newFiles || newFiles.length === 0) return
    
    const validFiles: File[] = []
    for (let i = 0; i < newFiles.length; i++) {
      const f = newFiles[i]
      if (f.type.startsWith('video/')) {
        validFiles.push(f)
      }
    }

    if (validFiles.length === 0) {
      alert('Please upload valid video files.')
      return
    }

    // Single mode vs Batch mode
    const filesToProcess = isBatchMode ? validFiles.slice(0, 10) : [validFiles[0]]
    setFiles(filesToProcess)
    setCurrentFileIndex(0)
    processFileMetadata(filesToProcess[0])
    setStatus('idle')
    setResults([])
  }

  const processFileMetadata = (file: File) => {
    const url = URL.createObjectURL(file)
    const video = document.createElement('video')
    video.src = url
    video.onloadedmetadata = () => {
      setVideoMetadata({
        name: file.name,
        size: file.size,
        duration: video.duration,
        format: file.name.split('.').pop()?.toUpperCase() || 'Video',
        width: video.videoWidth,
        height: video.videoHeight,
        url: url
      })
      setSettings(prev => ({
        ...prev,
        endTime: formatTime(video.duration)
      }))
    }
  }

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = Math.floor(seconds % 60)
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const parseTimeToSeconds = (time: string) => {
    const [h, m, s] = time.split(':').map(Number)
    return h * 3600 + m * 60 + s
  }

  const handleApply = async () => {
    if (files.length === 0) return
    setIsProcessing(true)
    setStatus('processing')
    setExtractionProgress(0)
    const newResults: { blob: Blob; url: string; size: number }[] = []

    for (let i = 0; i < files.length; i++) {
      setCurrentFileIndex(i)
      const file = files[i]
      try {
        const resultBlob = await runExtraction(file)
        const result = {
          blob: resultBlob,
          url: URL.createObjectURL(resultBlob),
          size: resultBlob.size
        }
        newResults.push(result)
        
        if (i === 0) {
           drawWaveform(resultBlob)
        }
      } catch (err: any) {
        console.error(err)
        setStatus('error')
        setStatusMsg(`Extraction failed for ${file.name}: ${err.message}`)
        setIsProcessing(false)
        return
      }
    }

    setResults(newResults)
    setStatus('done')
    setIsProcessing(false)
  }

  const runExtraction = async (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase() || 'mp4'
    const inputName = `input.${ext}`
    const outputName = `output.${settings.format.toLowerCase()}`
    
    setStatusMsg(`Reading ${file.name}...`)
    await ffmpeg.writeFile(inputName, await fetchFile(file))

    const args = ['-i', inputName]

    if (settings.trim) {
      args.push('-ss', settings.startTime)
      args.push('-to', settings.endTime)
    }

    // Quality/Codec
    if (settings.format === 'MP3') {
      args.push('-vn', '-acodec', 'libmp3lame', '-ab', `${settings.bitrate}k`, '-ar', settings.sampleRate.toString(), '-ac', settings.channels === 'mono' ? '1' : '2')
    } else if (settings.format === 'WAV') {
      args.push('-vn', '-acodec', 'pcm_s16le', '-ar', settings.sampleRate.toString())
    } else if (settings.format === 'AAC') {
      args.push('-vn', '-acodec', 'aac', '-ab', `${settings.bitrate}k`, '-ar', settings.sampleRate.toString())
    } else if (settings.format === 'OGG') {
      args.push('-vn', '-acodec', 'libvorbis', '-ab', `${settings.bitrate}k`)
    } else if (settings.format === 'FLAC') {
      args.push('-vn', '-acodec', 'flac')
    }

    // Channels
    if (settings.channels === 'left') {
      args.push('-af', 'pan=mono|c0=FL')
    } else if (settings.channels === 'right') {
      args.push('-af', 'pan=mono|c0=FR')
    }

    args.push(outputName)

    const statusInterval = setInterval(() => {
      const messages = ["Extracting audio track...", "Encoding to format...", "Applying quality settings...", "Almost done..."]
      setStatusMsg(messages[Math.floor(Math.random() * messages.length)])
    }, 2000)

    try {
      await ffmpeg.exec(args)
    } finally {
      clearInterval(statusInterval)
    }

    const data = await ffmpeg.readFile(outputName)
    const result = new Blob([data as any], { type: getMimeType(settings.format) })

    // Cleanup
    await ffmpeg.deleteFile(inputName)
    await ffmpeg.deleteFile(outputName)

    return result
  }

  const getMimeType = (format: string) => {
    const types: Record<string, string> = {
      'MP3': 'audio/mpeg',
      'WAV': 'audio/wav',
      'AAC': 'audio/aac',
      'OGG': 'audio/ogg',
      'FLAC': 'audio/flac',
    }
    return types[format] || 'audio/mpeg'
  }

  const drawWaveform = async (blob: Blob) => {
    const canvas = canvasRef.current
    if (!canvas) return

    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const arrayBuffer = await blob.arrayBuffer()
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer)
      const data = audioBuffer.getChannelData(0)
      
      const ctx = canvas.getContext('2d')!
      const width = canvas.width
      const height = canvas.height
      const step = Math.ceil(data.length / width)
      const amp = height / 2

      ctx.clearRect(0, 0, width, height)
      ctx.fillStyle = '#18181b' // zinc-900
      ctx.fillRect(0, 0, width, height)
      
      ctx.strokeStyle = '#f97316' // brand-orange
      ctx.lineWidth = 2
      ctx.beginPath()

      for (let i = 0; i < width; i++) {
        let min = 1, max = -1
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
      console.error("Waveform draw error:", e)
    }
  }

  const downloadAll = async () => {
    if (results.length === 0) return
    
    if (results.length === 1) {
      const link = document.createElement('a')
      link.href = results[0].url
      link.download = `${files[0].name.split('.')[0]}_audio.${settings.format.toLowerCase()}`
      link.click()
      return
    }

    const zip = new JSZip()
    results.forEach((res, i) => {
      const name = `${files[i].name.split('.')[0]}_audio.${settings.format.toLowerCase()}`
      zip.file(name, res.blob)
    })
    
    const zipBlob = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(zipBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'extracted_audio.zip'
    link.click()
    URL.revokeObjectURL(url)
  }

  // UI Helper
  const getFormatInfo = (f: string) => {
    switch(f) {
      case 'MP3': return "Most compatible. Good quality. Small size."
      case 'WAV': return "Lossless quality. Large file size."
      case 'AAC': return "Better than MP3 at same size. Apple devices."
      case 'OGG': return "Open source. Good for web."
      case 'FLAC': return "Lossless compression. Large file."
      default: return ""
    }
  }

  const getQualityInfo = (k: string) => {
    switch(k) {
      case '128': return "Smallest size. Good for speech."
      case '192': return "Recommended. Great for music."
      case '256': return "High quality. Slightly larger."
      case '320': return "Maximum MP3 quality. Largest."
      default: return ""
    }
  }

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
          <div className="text-muted-foreground space-y-1">
            <p>Loading FFmpeg audio engine...</p>
            <p className="text-xs">This happens once — ~5-10 seconds</p>
            <p className="text-xs">After loading, works instantly!</p>
          </div>
        </div>
      </div>
    )
  }

  if (ffmpegError) {
    return (
      <div className="max-w-2xl mx-auto bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900 rounded-3xl p-12 text-center space-y-6">
        <AlertTriangle className="size-16 text-red-600 mx-auto" />
        <h2 className="text-2xl font-bold text-red-900 dark:text-red-200">System Error</h2>
        <p className="text-red-800 dark:text-red-300 max-w-md mx-auto">{ffmpegError}</p>
        <Button onClick={() => window.location.reload()} className="bg-red-600 hover:bg-red-700 text-white rounded-full px-8 h-12">
          <RotateCcw className="mr-2 size-4" /> Retry Loading
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      
      {/* Upload Zone */}
      {status === 'idle' && !videoMetadata && (
        <div className="space-y-6">
          <div className="flex justify-center gap-4">
            <button 
              onClick={() => setIsBatchMode(false)}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${!isBatchMode ? 'bg-brand-orange text-white shadow-lg shadow-brand-orange/20' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
            >
              Single Video
            </button>
            <button 
              onClick={() => setIsBatchMode(true)}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${isBatchMode ? 'bg-brand-orange text-white shadow-lg shadow-brand-orange/20' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
            >
              Batch Mode (Up to 10)
            </button>
          </div>

          <div
            className={`border-3 border-dashed rounded-[2.5rem] p-20 flex flex-col items-center justify-center transition-all duration-300 ease-in-out cursor-pointer min-h-[400px] relative overflow-hidden group
              ${isDragging ? 'border-brand-orange bg-brand-orange/5 scale-[1.01]' : 'border-border hover:border-brand-orange/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20'}
            `}
            onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={e => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files) }}
            onClick={() => fileInputRef.current?.click()}
          >
            <input type="file" ref={fileInputRef} className="hidden" accept="video/*" multiple={isBatchMode} onChange={e => handleFiles(e.target.files)} />
            
            <div className="w-24 h-24 bg-brand-orange/10 rounded-full flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
              <Music className="size-12 text-brand-orange animate-pulse" />
            </div>
            
            <h3 className="text-3xl font-bold font-syne mb-4 text-foreground text-center">
              Drop your video here to extract audio
            </h3>
            <div className="text-muted-foreground text-center space-y-2 max-w-lg">
              <p className="text-lg">MP4, AVI, MOV, MKV, WebM, FLV, WMV supported</p>
              <p className="text-sm bg-muted/50 py-1 px-3 rounded-full inline-block">Files stay 100% private and never leave your device</p>
            </div>

            {isDragging && (
              <div className="absolute inset-0 bg-brand-orange/10 backdrop-blur-[2px] flex items-center justify-center">
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-2xl border border-brand-orange scale-110">
                   <p className="text-brand-orange font-bold text-xl">Release to Upload</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Editor Section */}
      {videoMetadata && status !== 'done' && (
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Preview & Files List */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-card rounded-3xl border border-border shadow-2xl overflow-hidden p-6 space-y-6">
              <div className="aspect-video bg-black rounded-2xl overflow-hidden relative group">
                <video
                  ref={videoRef}
                  src={videoMetadata.url}
                  controls
                  className="w-full h-full object-contain"
                  onTimeUpdate={(e) => {
                    if (settings.trim) {
                      // Logic for updating slider or highlighting section could go here
                    }
                  }}
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-2xl border border-border">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Format</p>
                  <p className="font-bold flex items-center gap-1.5"><FileVideo className="size-3 text-brand-orange" /> {videoMetadata.format}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Duration</p>
                  <p className="font-bold">{formatTime(videoMetadata.duration)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Size</p>
                  <p className="font-bold">{(videoMetadata.size / 1024 / 1024).toFixed(1)} MB</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Resolution</p>
                  <p className="font-bold">{videoMetadata.width}×{videoMetadata.height}</p>
                </div>
              </div>
            </div>

            {isBatchMode && files.length > 1 && (
              <div className="bg-card rounded-3xl border border-border p-6 shadow-xl space-y-4">
                <h4 className="font-bold flex items-center gap-2"><Layers className="size-4" /> Batch List ({files.length})</h4>
                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                  {files.map((f, idx) => (
                    <div key={idx} className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${idx === currentFileIndex ? 'border-brand-orange bg-brand-orange/5' : 'border-border bg-muted/30'}`}>
                      <div className="flex items-center gap-3 overflow-hidden">
                        <Video className={`size-4 ${idx === currentFileIndex ? 'text-brand-orange' : 'text-zinc-400'}`} />
                        <span className="text-sm font-medium truncate">{f.name}</span>
                      </div>
                      <span className="text-[10px] font-bold text-muted-foreground">{(f.size/1024/1024).toFixed(1)} MB</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Settings Panel */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-card rounded-3xl border border-border shadow-2xl p-8 space-y-8">
              <h3 className="text-2xl font-bold font-syne flex items-center gap-2">
                <Settings className="size-6 text-brand-orange" /> Audio Settings
              </h3>

              {/* Output Format */}
              <div className="space-y-4">
                <label className="text-sm font-bold flex items-center gap-2">Output Format</label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {['MP3', 'WAV', 'AAC', 'OGG', 'FLAC'].map(f => (
                    <button
                      key={f}
                      title={getFormatInfo(f)}
                      onClick={() => setSettings(prev => ({ ...prev, format: f as any }))}
                      className={`py-3 rounded-xl text-xs font-bold border transition-all ${settings.format === f ? 'bg-brand-orange border-brand-orange text-white shadow-lg' : 'bg-muted border-border text-muted-foreground hover:bg-zinc-200 dark:hover:bg-zinc-800'}`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground italic px-1">{getFormatInfo(settings.format)}</p>
              </div>

              {/* Quality Settings */}
              {['MP3', 'AAC', 'OGG'].includes(settings.format) && (
                <div className="space-y-4 pt-4 border-t border-border">
                  <label className="text-sm font-bold">Bitrate (Audio Quality)</label>
                  <div className="grid grid-cols-4 gap-2">
                    {['128', '192', '256', '320'].map(k => (
                      <button
                        key={k}
                        title={getQualityInfo(k)}
                        onClick={() => setSettings(prev => ({ ...prev, bitrate: k as any }))}
                        className={`py-3 rounded-xl text-[10px] font-bold border transition-all ${settings.bitrate === k ? 'bg-brand-orange border-brand-orange text-white' : 'bg-muted border-border text-muted-foreground'}`}
                      >
                        {k} kbps
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-brand-orange/5 rounded-xl border border-brand-orange/10">
                    <Info className="size-4 text-brand-orange shrink-0" />
                    <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                      Estimated size: ~{(videoMetadata.duration * parseInt(settings.bitrate) / 8 / 1024).toFixed(1)} MB for full audio.
                    </p>
                  </div>
                </div>
              )}

              {/* Trim Feature */}
              <div className="space-y-6 pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold flex items-center gap-2">
                    <Scissors className="size-4 text-brand-orange" /> Trim Audio Range
                  </label>
                  <Switch checked={settings.trim} onCheckedChange={(c) => setSettings(prev => ({ ...prev, trim: c }))} />
                </div>

                {settings.trim && (
                  <div className="space-y-6 animate-in slide-in-from-top-2 duration-300">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase text-muted-foreground px-1">Start Time</label>
                        <Input 
                          value={settings.startTime} 
                          onChange={(e) => setSettings(prev => ({ ...prev, startTime: e.target.value }))}
                          className="font-mono text-center h-10 rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase text-muted-foreground px-1">End Time</label>
                        <Input 
                          value={settings.endTime} 
                          onChange={(e) => setSettings(prev => ({ ...prev, endTime: e.target.value }))}
                          className="font-mono text-center h-10 rounded-xl"
                        />
                      </div>
                    </div>
                    
                    <div className="px-2">
                      <Slider 
                        defaultValue={[0, 100]} 
                        max={100} 
                        step={1}
                        onValueChange={(val) => {
                           if (!Array.isArray(val)) return
                           const [s, e] = val
                           const startSec = (s / 100) * videoMetadata.duration
                           const endSec = (e / 100) * videoMetadata.duration
                           setSettings(prev => ({ 
                             ...prev, 
                             startTime: formatTime(startSec),
                             endTime: formatTime(endSec)
                           }))
                        }}
                      />
                    </div>
                    
                    <div className="text-center">
                      <p className="text-xs font-medium text-brand-orange">
                        Extracting: {settings.startTime} → {settings.endTime}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="pt-4">
                <Button
                  onClick={handleApply}
                  disabled={isProcessing}
                  className="w-full bg-brand-orange hover:bg-brand-orange/90 text-white rounded-full h-16 text-xl font-bold shadow-xl shadow-brand-orange/20 group"
                >
                  {isProcessing ? (
                    <><Loader2 className="mr-3 size-6 animate-spin" /> Processing...</>
                  ) : (
                    <><Music className="mr-3 size-6 group-hover:rotate-12 transition-transform" /> Extract Audio</>
                  )}
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full mt-4 rounded-full text-muted-foreground"
                  onClick={() => {
                    setVideoMetadata(null)
                    setFiles([])
                    setResults([])
                  }}
                >
                  Cancel and Choose Another
                </Button>
              </div>
            </div>

            {/* Extraction Progress Overlay */}
            {isProcessing && (
              <div className="bg-card rounded-3xl border border-border p-8 shadow-2xl space-y-6 animate-in zoom-in-95 duration-300">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-lg flex items-center gap-2">
                    <Loader2 className="size-5 text-brand-orange animate-spin" /> 
                    {isBatchMode ? `Processing Video ${currentFileIndex + 1} of ${files.length}` : 'Extracting Audio...'}
                  </h4>
                  <span className="text-brand-orange font-bold font-mono">{extractionProgress}%</span>
                </div>
                <Progress value={extractionProgress} className="h-3" />
                <div className="space-y-1 text-center">
                  <p className="text-sm font-medium animate-pulse">{statusMsg}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Please keep this tab open</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Results Section */}
      {status === 'done' && results.length > 0 && (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="bg-card rounded-[2.5rem] border border-border shadow-2xl overflow-hidden">
            <div className="bg-green-50 dark:bg-green-900/10 border-b border-green-100 dark:border-green-900/30 px-10 py-6 flex items-center gap-4">
               <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-green-500/20">
                 <CheckCircle2 className="size-7" />
               </div>
               <div>
                 <h3 className="text-2xl font-bold font-syne text-green-900 dark:text-green-200">Extraction Complete</h3>
                 <p className="text-green-800 dark:text-green-300/80 text-sm">{results.length} audio {results.length === 1 ? 'track' : 'tracks'} ready for download</p>
               </div>
            </div>

            <div className="p-10 space-y-10">
              {/* Active Result Preview */}
              <div className="space-y-6">
                <canvas 
                  ref={canvasRef} 
                  width={800} 
                  height={150} 
                  className="w-full h-[150px] rounded-2xl bg-zinc-900 shadow-inner"
                />
                
                <div className="bg-muted/50 p-6 rounded-2xl border border-border space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-lg truncate max-w-[70%]">{files[activeResultIndex]?.name.split('.')[0]}_audio</h4>
                    <span className="px-3 py-1 bg-brand-orange text-white text-[10px] font-black rounded-full uppercase tracking-widest">
                      {settings.format}
                    </span>
                  </div>
                  <audio controls className="w-full h-12 custom-audio-player" src={results[activeResultIndex].url}>
                    Your browser does not support the audio element.
                  </audio>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Format", val: settings.format },
                    { label: "Quality", val: settings.bitrate + " kbps" },
                    { label: "Size", val: (results[activeResultIndex].size / 1024 / 1024).toFixed(1) + " MB" },
                    { label: "Channels", val: settings.channels.toUpperCase() }
                  ].map(stat => (
                    <div key={stat.label} className="bg-muted p-4 rounded-xl text-center border border-border">
                      <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">{stat.label}</p>
                      <p className="font-bold text-sm">{stat.val}</p>
                    </div>
                  ))}
                </div>
              </div>

              {isBatchMode && results.length > 1 && (
                <div className="space-y-4 border-t border-border pt-10">
                   <h4 className="font-bold flex items-center gap-2 px-1 text-muted-foreground uppercase text-xs tracking-widest">Batch Results List</h4>
                   <div className="grid sm:grid-cols-2 gap-3">
                     {results.map((res, idx) => (
                       <button
                         key={idx}
                         onClick={() => {
                           setActiveResultIndex(idx)
                           drawWaveform(res.blob)
                         }}
                         className={`flex items-center justify-between p-4 rounded-xl border transition-all ${idx === activeResultIndex ? 'border-brand-orange bg-brand-orange/5 shadow-md' : 'border-border bg-card hover:bg-muted'}`}
                       >
                         <div className="flex items-center gap-3 overflow-hidden">
                           <Play className={`size-4 ${idx === activeResultIndex ? 'text-brand-orange' : 'text-zinc-400'}`} />
                           <span className="text-xs font-bold truncate text-left">{files[idx].name.split('.')[0]}</span>
                         </div>
                         <Download className="size-4 text-muted-foreground shrink-0 ml-2" />
                       </button>
                     ))}
                   </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <Button
                  onClick={downloadAll}
                  className="flex-1 bg-brand-orange hover:bg-brand-orange/90 text-white rounded-full h-16 text-lg font-bold shadow-xl shadow-brand-orange/20"
                >
                  <Download className="mr-3 size-6" /> 
                  {results.length > 1 ? 'Download All as ZIP' : `Download ${settings.format} Audio`}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setVideoMetadata(null)
                    setFiles([])
                    setResults([])
                    setStatus('idle')
                  }}
                  className="sm:flex-1 h-16 rounded-full text-lg font-bold border-2"
                >
                  <RotateCcw className="mr-3 size-5" /> Start New Extraction
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
