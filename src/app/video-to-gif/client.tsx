"use client"

import React, { useState, useRef, useEffect, useMemo } from 'react'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'
import { 
  Video, 
  Settings, 
  CheckCircle2, 
  Download, 
  Loader2, 
  AlertTriangle, 
  RotateCcw,
  Zap,
  Clock,
  Play,
  Pause,
  Music,
  Plus,
  Trash2,
  GripVertical,
  Info,
  Maximize,
  Image as ImageIcon,
  FastForward,
  Rewind,
  Scissors,
  Eye,
  Sparkles,
  ArrowRight,
  DownloadCloud
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface VideoInfo {
  duration: number
  width: number
  height: number
  size: number
  name: string
  url: string
}

interface GifSettings {
  startTime: number
  endTime: number
  width: number
  fps: number
  quality: 'low' | 'medium' | 'high'
  optimize: boolean
  loop: 'forever' | 'none' | 'count'
  loopCount: number
  dithering: boolean
  speed: number
  effect: 'none' | 'reverse' | 'grayscale' | 'sepia' | 'bounce'
  outputName: string
}

export default function VideoToGifClient() {
  const ffmpegRef = useRef<FFmpeg | null>(null)
  
  if (!ffmpegRef.current && typeof window !== 'undefined') {
    ffmpegRef.current = new FFmpeg()
  }
  
  const ffmpeg = ffmpegRef.current!
  const [ffmpegLoading, setFFmpegLoading] = useState(true)
  const [ffmpegReady, setFFmpegReady] = useState(false)
  
  const [file, setFile] = useState<File | null>(null)
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [status, setStatus] = useState<'idle' | 'processing' | 'done' | 'error'>('idle')
  const [progress, setProgress] = useState(0)
  const [phase, setPhase] = useState<'analyzing' | 'encoding'>('analyzing')
  const [statusMsg, setStatusMsg] = useState('')
  
  const [settings, setSettings] = useState<GifSettings>({
    startTime: 0,
    endTime: 0,
    width: 480,
    fps: 10,
    quality: 'medium',
    optimize: true,
    loop: 'forever',
    loopCount: 3,
    dithering: true,
    speed: 1.0,
    effect: 'none',
    outputName: 'toolhive_video_to_gif'
  })

  // Results
  const [resultBlob, setResultBlob] = useState<Blob | null>(null)
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isPreviewLoading, setIsPreviewLoading] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

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

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    const file = files[0]
    if (!file.type.startsWith('video/')) return

    const url = URL.createObjectURL(file)
    const video = document.createElement('video')
    video.src = url
    video.onloadedmetadata = () => {
      setVideoInfo({
        duration: video.duration,
        width: video.videoWidth,
        height: video.videoHeight,
        size: file.size,
        name: file.name,
        url: url
      })
      setSettings(prev => ({
        ...prev,
        endTime: Math.min(video.duration, 5), // Default 5s clip
        width: video.videoWidth > 480 ? 480 : video.videoWidth,
        outputName: file.name.split('.')[0] + '_gif'
      }))
      setFile(file)
    }
  }

  const selectedDuration = useMemo(() => settings.endTime - settings.startTime, [settings.startTime, settings.endTime])
  
  const estimatedSize = useMemo(() => {
    if (!videoInfo) return 0
    const h = Math.round(settings.width * videoInfo.height / videoInfo.width)
    const factor = settings.quality === 'high' ? 0.2 : settings.quality === 'medium' ? 0.15 : 0.1
    const size = (settings.width * h * settings.fps * selectedDuration * factor) / (1024 * 1024)
    return size
  }, [settings, videoInfo, selectedDuration])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const handleConvert = async () => {
    if (!file || !videoInfo) return
    setStatus('processing')
    setProgress(0)
    setPhase('analyzing')
    
    try {
      const blob = await convertToGIF(file, settings)
      setResultBlob(blob)
      setResultUrl(URL.createObjectURL(blob))
      setStatus('done')
    } catch (err) {
      console.error(err)
      setStatus('error')
    }
  }

  const convertToGIF = async (videoFile: File, gifSettings: GifSettings, isPreview = false) => {
    const ext = videoFile.name.split('.').pop()?.toLowerCase() || 'mp4'
    const inputName = `input.${ext}`
    const outputName = isPreview ? 'preview.gif' : 'output.gif'
    const paletteName = isPreview ? 'preview_palette.png' : 'palette.png'

    await ffmpeg.writeFile(inputName, await fetchFile(videoFile))

    ffmpeg.on('progress', ({ progress }) => {
      const p = Math.round(progress * 100)
      if (phase === 'analyzing') {
        setProgress(Math.round(p * 0.4)) // Pass 1 is 40%
      } else {
        setProgress(Math.round(40 + p * 0.6)) // Pass 2 is 60%
      }
    })

    const filters = []
    
    // Scale
    const h = Math.round(gifSettings.width * videoInfo!.height / videoInfo!.width)
    filters.push(`scale=${gifSettings.width}:${h}:flags=lanczos`)
    
    // FPS
    filters.push(`fps=${gifSettings.fps}`)

    // Effects
    if (gifSettings.effect === 'reverse') filters.push('reverse')
    if (gifSettings.effect === 'grayscale') filters.push('hue=s=0')
    if (gifSettings.effect === 'sepia') filters.push('colorchannelmixer=.393:.769:.189:0:.349:.686:.168:0:.272:.534:.131')
    if (gifSettings.speed !== 1.0) filters.push(`setpts=${1/gifSettings.speed}*PTS`)
    
    const filterChain = filters.join(',')
    const paletteColors = isPreview ? 32 : { low: 64, medium: 128, high: 256 }[gifSettings.quality]
    const dithering = gifSettings.dithering ? 'bayer:bayer_scale=5' : 'none'

    const trimArgs = ['-ss', gifSettings.startTime.toString(), '-t', selectedDuration.toString()]

    // PASS 1: Generate Palette
    setPhase('analyzing')
    setStatusMsg("Analyzing color palette...")
    await ffmpeg.exec([
      ...trimArgs,
      '-i', inputName,
      '-vf', `${filterChain},palettegen=max_colors=${paletteColors}`,
      '-y', paletteName
    ])

    // PASS 2: Encode GIF
    setPhase('encoding')
    setStatusMsg("Encoding GIF frames...")
    await ffmpeg.exec([
      ...trimArgs,
      '-i', inputName,
      '-i', paletteName,
      '-lavfi', `${filterChain}[x];[x][1:v]paletteuse=dither=${dithering}`,
      '-loop', gifSettings.loop === 'forever' ? '0' : gifSettings.loop === 'none' ? '-1' : gifSettings.loopCount.toString(),
      '-y', outputName
    ])

    const data = await ffmpeg.readFile(outputName)
    const blob = new Blob([data as any], { type: 'image/gif' })

    // Cleanup
    await ffmpeg.deleteFile(inputName)
    await ffmpeg.deleteFile(outputName)
    try { await ffmpeg.deleteFile(paletteName) } catch {}

    return blob
  }

  const handlePreview = async () => {
    if (!file || !videoInfo) return
    setIsPreviewLoading(true)
    try {
      const blob = await convertToGIF(file, {
        ...settings,
        width: 240,
        fps: 5,
        quality: 'low'
      }, true)
      setPreviewUrl(URL.createObjectURL(blob))
    } catch (err) {
      console.error(err)
    } finally {
      setIsPreviewLoading(false)
    }
  }

  const handleOptimize = (targetMB: number) => {
    if (!videoInfo) return
    const targetBytes = targetMB * 1024 * 1024
    const options = [
      { width: 480, fps: 10 },
      { width: 360, fps: 10 },
      { width: 480, fps: 5 },
      { width: 320, fps: 10 },
      { width: 360, fps: 5 },
      { width: 240, fps: 10 },
    ]

    for (const opt of options) {
      const h = Math.round(opt.width * videoInfo.height / videoInfo.width)
      const est = opt.width * h * opt.fps * selectedDuration * 0.15
      if (est <= targetBytes) {
        setSettings(p => ({ ...p, width: opt.width, fps: opt.fps }))
        return
      }
    }
    setSettings(p => ({ ...p, width: 240, fps: 5 }))
  }

  if (ffmpegLoading) {
    return (
      <div className="max-w-2xl mx-auto bg-card rounded-3xl p-12 border border-border shadow-xl text-center space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="relative inline-flex">
           <div className="w-24 h-24 rounded-full border-4 border-brand-orange/20 border-t-brand-orange animate-spin" />
           <div className="absolute inset-0 flex items-center justify-center">
             <ImageIcon className="size-8 text-brand-orange" />
           </div>
        </div>
        <div className="space-y-4">
          <h2 className="text-2xl font-bold font-syne text-foreground">⚙️ Loading GIF Engine</h2>
          <Progress value={62} className="h-3 w-64 mx-auto" />
          <div className="text-muted-foreground text-sm">Loading FFmpeg... first time only</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-12">
      {/* Upload Zone */}
      {!file && (
        <div
          className={`border-3 border-dashed rounded-[2.5rem] p-20 flex flex-col items-center justify-center transition-all duration-300 ease-in-out cursor-pointer min-h-[400px] relative overflow-hidden group
            ${isDragging ? 'border-brand-orange bg-brand-orange/5 scale-[1.01]' : 'border-border hover:border-brand-orange/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/10'}
          `}
          onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={e => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files) }}
          onClick={() => fileInputRef.current?.click()}
        >
          <input type="file" ref={fileInputRef} className="hidden" accept="video/*" onChange={e => handleFiles(e.target.files)} />
          <div className="w-24 h-24 bg-brand-orange/10 rounded-full flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 shadow-inner text-5xl">
            🎞️
          </div>
          <h3 className="text-3xl font-bold font-syne mb-4 text-foreground text-center">Drop your video here to convert to GIF</h3>
          <p className="text-muted-foreground text-center text-lg max-w-lg">MP4, MOV, AVI, MKV, WebM supported • Max 500MB</p>
        </div>
      )}

      {file && videoInfo && status !== 'done' && (
        <div className="grid lg:grid-cols-12 gap-8 items-start animate-in fade-in slide-in-from-bottom-8 duration-700">
          
          {/* Main Area: Video & Preview */}
          <div className="lg:col-span-12 xl:col-span-8 space-y-6">
            <div className="bg-card rounded-[2.5rem] border border-border shadow-2xl overflow-hidden p-8">
              <div className="flex items-center justify-between mb-6">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-brand-orange/10 rounded-xl flex items-center justify-center">
                       <Video className="size-5 text-brand-orange" />
                    </div>
                    <div>
                       <h4 className="font-bold truncate max-w-[200px] md:max-w-md">{videoInfo.name}</h4>
                       <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{videoInfo.width}×{videoInfo.height} • {(videoInfo.size/1024/1024).toFixed(1)} MB</p>
                    </div>
                 </div>
                 <Button variant="ghost" size="sm" className="rounded-full text-red-500 hover:bg-red-50" onClick={() => {setFile(null); setVideoInfo(null); setStatus('idle')}}><RotateCcw className="size-4 mr-2" /> Start Over</Button>
              </div>

              <div className="relative rounded-2xl overflow-hidden bg-black aspect-video flex items-center justify-center shadow-inner border border-border">
                <video
                  ref={videoRef}
                  src={videoInfo.url}
                  controls
                  className="max-h-[400px] w-full"
                />
              </div>

              {/* Trim Selector */}
              <div className="mt-8 space-y-6 bg-muted/30 p-6 rounded-3xl border border-border">
                <div className="flex items-center justify-between">
                   <h5 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                     <Scissors className="size-4" /> Trim Range
                   </h5>
                   <Badge variant="outline" className="font-bold border-brand-orange/30 text-brand-orange">
                     Selected: {selectedDuration.toFixed(1)}s
                   </Badge>
                </div>

                <div className="px-4">
                  <Slider 
                    value={[settings.startTime, settings.endTime]} 
                    max={videoInfo.duration} 
                    step={0.1} 
                    onValueChange={(v) => setSettings(p => ({ ...p, startTime: v[0], endTime: v[1] }))}
                    className="mb-8"
                  />
                  <div className="flex justify-between items-center text-xs font-bold text-muted-foreground">
                    <div className="flex items-center gap-2 bg-card px-3 py-1.5 rounded-lg border border-border">
                       <span>Start:</span>
                       <span className="text-brand-orange font-black w-12">{formatTime(settings.startTime)}</span>
                    </div>
                    <div className="flex gap-2">
                       <Button size="sm" variant="outline" className="text-[10px] h-8 rounded-full" onClick={() => videoRef.current && setSettings(p => ({ ...p, startTime: videoRef.current!.currentTime }))}>📍 Set Start</Button>
                       <Button size="sm" variant="outline" className="text-[10px] h-8 rounded-full" onClick={() => videoRef.current && setSettings(p => ({ ...p, endTime: videoRef.current!.currentTime }))}>📍 Set End</Button>
                    </div>
                    <div className="flex items-center gap-2 bg-card px-3 py-1.5 rounded-lg border border-border">
                       <span>End:</span>
                       <span className="text-brand-orange font-black w-12">{formatTime(settings.endTime)}</span>
                    </div>
                  </div>
                </div>

                {selectedDuration > 15 && (
                  <div className={`p-4 rounded-2xl flex items-start gap-3 text-xs font-medium animate-in slide-in-from-top-2 duration-300 ${selectedDuration > 30 ? 'bg-red-500/10 text-red-600 border border-red-500/20' : 'bg-brand-orange/10 text-brand-orange border border-brand-orange/20'}`}>
                    <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                    <p>
                      {selectedDuration > 30 
                        ? "⚠ GIF may exceed 50MB. Reduce duration, frame rate or resolution for better results."
                        : "⚠ GIFs longer than 15 seconds can be very large. Consider reducing duration for smaller file size."}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Preview Section */}
            <div className="bg-card rounded-[2.5rem] border border-border shadow-xl p-8">
               <div className="flex items-center justify-between mb-6">
                  <h4 className="text-xl font-bold font-syne flex items-center gap-2">
                    <Eye className="size-5 text-brand-orange" /> Live Preview
                  </h4>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="rounded-full h-10 px-6 border-brand-orange/30 hover:bg-brand-orange/5"
                    onClick={handlePreview}
                    disabled={isPreviewLoading}
                  >
                    {isPreviewLoading ? <Loader2 className="size-4 animate-spin mr-2" /> : <Sparkles className="size-4 mr-2" />}
                    Generate Draft Preview
                  </Button>
               </div>
               
               <div className="relative rounded-3xl overflow-hidden bg-muted border border-border min-h-[250px] flex items-center justify-center">
                  {previewUrl ? (
                    <div className="w-full space-y-4 p-4 text-center">
                      <img src={previewUrl} alt="GIF Preview" className="max-w-full rounded-2xl shadow-xl mx-auto max-h-[350px] object-contain" />
                      <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest bg-card/50 inline-block px-4 py-1.5 rounded-full border border-border">
                        Preview: 240px • 5fps • Low Quality
                      </div>
                    </div>
                  ) : (
                    <div className="text-center space-y-3 p-12">
                       <ImageIcon className="size-16 text-muted-foreground/10 mx-auto" />
                       <p className="text-sm text-muted-foreground">Click preview to see a low-quality draft animation</p>
                    </div>
                  )}
               </div>
            </div>
          </div>

          {/* Sidebar: Settings */}
          <div className="lg:col-span-12 xl:col-span-4 space-y-6 lg:sticky lg:top-8">
            <div className="bg-card rounded-[2.5rem] border border-border shadow-2xl p-8 space-y-8">
              <div className="space-y-4">
                <h3 className="text-2xl font-bold font-syne flex items-center gap-2">
                  <Settings className="size-6 text-brand-orange" /> GIF Settings
                </h3>
                
                <div className="space-y-4">
                   <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Output Resolution</label>
                      <Badge variant="secondary" className="font-bold">{settings.width}px</Badge>
                   </div>
                   <div className="grid grid-cols-3 gap-2">
                     {[240, 320, 360, 480, 640].map(w => (
                       <button 
                         key={w}
                         onClick={() => setSettings(p => ({ ...p, width: w }))}
                         className={`py-2 rounded-xl text-xs font-bold border transition-all ${settings.width === w ? 'bg-brand-orange text-white border-brand-orange shadow-lg scale-105' : 'bg-muted border-border hover:border-brand-orange/30'}`}
                       >
                         {w}px
                       </button>
                     ))}
                     <button 
                        onClick={() => setSettings(p => ({ ...p, width: videoInfo.width }))}
                        className={`py-2 rounded-xl text-xs font-bold border transition-all ${settings.width === videoInfo.width ? 'bg-brand-orange text-white border-brand-orange shadow-lg' : 'bg-muted border-border hover:border-brand-orange/30'}`}
                     >
                       Original
                     </button>
                   </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-border">
                   <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Frame Rate (FPS)</label>
                      <Badge className="bg-brand-orange/10 text-brand-orange border-brand-orange/30 font-bold">{settings.fps} FPS</Badge>
                   </div>
                   <Slider 
                      value={[settings.fps]} 
                      min={1} max={30} step={1} 
                      onValueChange={(v) => setSettings(p => ({ ...p, fps: v[0] }))}
                   />
                   <div className="grid grid-cols-4 gap-1 text-[8px] font-black text-center text-muted-foreground uppercase">
                      <span>Tiny</span>
                      <span>Rec ✓</span>
                      <span>Smooth</span>
                      <span>Smooth+</span>
                   </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-border">
                   <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Color Quality</label>
                   <Tabs value={settings.quality} onValueChange={(v: any) => setSettings(p => ({ ...p, quality: v }))} className="w-full">
                      <TabsList className="grid grid-cols-3 w-full rounded-xl h-10 p-1 bg-muted">
                        <TabsTrigger value="low" className="rounded-lg text-xs">Low</TabsTrigger>
                        <TabsTrigger value="medium" className="rounded-lg text-xs">Med</TabsTrigger>
                        <TabsTrigger value="high" className="rounded-lg text-xs">High</TabsTrigger>
                      </TabsList>
                   </Tabs>
                </div>

                <div className="space-y-4 pt-4 border-t border-border">
                   <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Fun Effects</label>
                   <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'none', label: 'None', icon: '🚫' },
                        { id: 'reverse', label: 'Reverse', icon: '⏪' },
                        { id: 'grayscale', label: 'B&W', icon: '🏁' },
                        { id: 'sepia', label: 'Sepia', icon: '📜' },
                      ].map(eff => (
                        <button 
                          key={eff.id}
                          onClick={() => setSettings(p => ({ ...p, effect: eff.id as any }))}
                          className={`py-2 px-3 rounded-xl text-[10px] font-bold border flex items-center gap-2 transition-all ${settings.effect === eff.id ? 'bg-brand-orange/10 border-brand-orange text-brand-orange' : 'bg-muted border-border hover:border-brand-orange/30'}`}
                        >
                          <span>{eff.icon}</span>
                          {eff.label}
                        </button>
                      ))}
                   </div>
                </div>

                <div className="space-y-2 pt-4 border-t border-border">
                   <div className="flex items-center justify-between">
                      <label className="text-xs font-bold">Optimization</label>
                      <Switch checked={settings.optimize} onCheckedChange={(c) => setSettings(p => ({ ...p, optimize: c }))} />
                   </div>
                   <div className="flex items-center justify-between">
                      <label className="text-xs font-bold">Dithering</label>
                      <Switch checked={settings.dithering} onCheckedChange={(c) => setSettings(p => ({ ...p, dithering: c }))} />
                   </div>
                </div>

                <div className="bg-brand-orange/5 rounded-3xl border border-brand-orange/10 p-5 flex items-center justify-between">
                   <div className="space-y-1">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Estimated Size</p>
                      <p className="text-2xl font-black text-brand-orange">~{estimatedSize.toFixed(1)} MB</p>
                   </div>
                   <div className="w-12 h-12 bg-brand-orange/10 rounded-full flex items-center justify-center">
                      <ImageIcon className="size-6 text-brand-orange" />
                   </div>
                </div>

                {/* Target Size Optimizer */}
                <div className="pt-4 border-t border-border space-y-4">
                   <div className="flex items-center gap-2">
                      <Zap className="size-4 text-brand-orange fill-brand-orange" />
                      <label className="text-xs font-bold">Quick Optimize</label>
                   </div>
                   <div className="flex flex-wrap gap-2">
                      {[1, 2, 5, 10].map(mb => (
                        <Button 
                          key={mb} 
                          variant="outline" 
                          size="sm" 
                          className="text-[10px] font-bold rounded-full h-8"
                          onClick={() => handleOptimize(mb)}
                        >
                          Target {mb}MB
                        </Button>
                      ))}
                   </div>
                </div>

                <Button 
                  onClick={handleConvert}
                  disabled={selectedDuration < 0.5 || estimatedSize > 100}
                  className="w-full bg-brand-orange hover:bg-brand-orange/90 text-white h-16 rounded-full text-xl font-black shadow-2xl shadow-brand-orange/30 group"
                >
                   <ImageIcon className="mr-3 size-6" />
                   Convert to GIF
                </Button>
                
                {estimatedSize > 100 && (
                  <p className="text-center text-[10px] text-red-500 font-bold px-4">⚠ Estimated size exceeds 100MB limit. Reduce duration or FPS.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Processing State */}
      {status === 'processing' && (
        <div className="max-w-2xl mx-auto bg-card rounded-[3rem] p-12 border border-border shadow-2xl text-center space-y-8 animate-in fade-in zoom-in duration-500">
           <div className="space-y-6">
              <div className="relative inline-flex">
                 <div className="w-24 h-24 rounded-full border-4 border-brand-orange/10 border-t-brand-orange animate-spin" />
                 <div className="absolute inset-0 flex items-center justify-center">
                   <ImageIcon className="size-10 text-brand-orange animate-pulse" />
                 </div>
              </div>
              <div className="space-y-2">
                 <h3 className="text-2xl font-bold font-syne">{statusMsg}</h3>
                 <p className="text-muted-foreground text-sm uppercase font-black tracking-widest">{phase === 'analyzing' ? 'Phase 1: Analyzing Colors' : 'Phase 2: Encoding GIF'}</p>
              </div>
           </div>

           <div className="space-y-4 max-w-sm mx-auto">
              <div className="flex justify-between text-sm font-bold">
                 <span>Progress</span>
                 <span className="text-brand-orange font-black">{progress}%</span>
              </div>
              <Progress value={progress} className="h-4 rounded-full" />
              <div className="grid grid-cols-2 gap-4 text-xs font-bold text-muted-foreground mt-4">
                 <div className="bg-muted p-3 rounded-2xl border border-border">{settings.width}px Res</div>
                 <div className="bg-muted p-3 rounded-2xl border border-border">{settings.fps} FPS</div>
              </div>
           </div>
           
           <p className="text-[10px] font-black text-muted-foreground uppercase tracking-tighter">Your browser is processing the video locally. No upload needed.</p>
        </div>
      )}

      {/* Result UI */}
      {status === 'done' && resultUrl && resultBlob && (
        <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-12 duration-1000">
           <div className="bg-card rounded-[3rem] border border-border shadow-2xl overflow-hidden">
              <div className="bg-green-500/5 p-10 border-b border-border flex items-center gap-6 text-green-600">
                 <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white shadow-xl shadow-green-500/20">
                   <CheckCircle2 className="size-10" />
                 </div>
                 <div>
                   <h3 className="text-3xl font-bold font-syne">GIF Created Successfully!</h3>
                   <p className="text-muted-foreground">Your animation is ready for download.</p>
                 </div>
              </div>

              <div className="p-10 grid lg:grid-cols-2 gap-10">
                 <div className="space-y-6">
                    <div className="bg-muted/30 rounded-3xl p-6 border border-border shadow-inner relative group flex items-center justify-center min-h-[300px]">
                       <img src={resultUrl} alt="Converted GIF" className="max-w-full rounded-2xl shadow-2xl transition-transform group-hover:scale-[1.02] max-h-[400px] object-contain" />
                       <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest border border-white/10">
                         {settings.width}px • {settings.fps} FPS
                       </div>
                    </div>
                 </div>

                 <div className="space-y-8 flex flex-col justify-center">
                    <div className="grid grid-cols-2 gap-4">
                       <div className="bg-muted/50 p-6 rounded-3xl border border-border">
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Duration</p>
                          <p className="text-2xl font-bold font-syne">{selectedDuration.toFixed(1)}s</p>
                       </div>
                       <div className="bg-muted/50 p-6 rounded-3xl border border-border">
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">File Size</p>
                          <p className="text-2xl font-bold font-syne">{(resultBlob.size / (1024 * 1024)).toFixed(1)} MB</p>
                       </div>
                    </div>

                    {resultBlob.size > 15 * 1024 * 1024 && (
                      <div className="bg-brand-orange/10 border border-brand-orange/20 p-5 rounded-2xl space-y-3">
                         <p className="text-xs font-bold text-brand-orange flex items-center gap-2">
                           <AlertTriangle className="size-4" /> Large GIF Warning
                         </p>
                         <p className="text-[11px] text-muted-foreground leading-relaxed">
                           This GIF is over 15MB. Consider reducing duration under 10s or lowering FPS for better compatibility on mobile.
                         </p>
                      </div>
                    )}

                    <div className="space-y-4">
                       <Button 
                         onClick={() => {
                           const link = document.createElement('a')
                           link.href = resultUrl
                           link.download = `${settings.outputName}.gif`
                           link.click()
                         }}
                         className="w-full bg-brand-orange hover:bg-brand-orange/90 text-white h-20 rounded-full text-2xl font-black shadow-2xl shadow-brand-orange/30 group"
                       >
                         <DownloadCloud className="mr-4 size-8 group-hover:translate-y-1 transition-transform" /> Download GIF
                       </Button>
                       <div className="flex gap-4">
                          <Button variant="outline" className="flex-1 h-14 rounded-2xl font-bold" onClick={() => setStatus('idle')}>
                            <Settings className="mr-2 size-4" /> Adjust Settings
                          </Button>
                          <Button variant="outline" className="flex-1 h-14 rounded-2xl font-bold" onClick={() => { setFile(null); setVideoInfo(null); setStatus('idle'); }}>
                            <RotateCcw className="mr-2 size-4" /> Start New
                          </Button>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {status === 'error' && (
        <div className="max-w-2xl mx-auto bg-red-500/5 border border-red-500/20 rounded-[3rem] p-12 text-center space-y-6 animate-in slide-in-from-top-4 duration-500">
           <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto text-3xl">
              ⚠️
           </div>
           <div className="space-y-2">
              <h3 className="text-2xl font-bold text-foreground font-syne">Conversion Error</h3>
              <p className="text-muted-foreground">We couldn't process your video. Please ensure the file is not corrupted and try a shorter clip.</p>
           </div>
           <Button onClick={() => setStatus('idle')} className="rounded-full bg-red-500 hover:bg-red-600 text-white px-12 h-14 font-bold text-lg">Try Again</Button>
        </div>
      )}
    </div>
  )
}
