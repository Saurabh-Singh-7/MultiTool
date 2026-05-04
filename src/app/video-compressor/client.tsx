"use client"

import React, { useState, useRef, useEffect } from 'react'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'
import { 
  UploadCloud, 
  Video, 
  Settings, 
  CheckCircle2, 
  Download, 
  Loader2, 
  AlertTriangle, 
  RotateCcw,
  Zap,
  Gauge,
  Monitor,
  ArrowRight,
  Info,
  Maximize,
  Clock,
  Play,
  Pause
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'



interface VideoInfo {
  duration: number
  width: number
  height: number
  size: number
  format: string
  url: string
}

type CompressionMode = 'preset' | 'custom' | 'target'
type PresetLevel = 'low' | 'medium' | 'high' | 'max'

export default function VideoCompressorClient() {
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
  const [currentTime, setCurrentTime] = useState('0:00')
  const [statusMsg, setStatusMsg] = useState('')
  const [estRemaining, setEstRemaining] = useState<string | null>(null)
  
  // Settings
  const [mode, setMode] = useState<CompressionMode>('preset')
  const [preset, setPreset] = useState<PresetLevel>('high')
  const [crf, setCrf] = useState(28)
  const [codec, setCodec] = useState('H.264')
  const [encodingPreset, setEncodingPreset] = useState('medium')
  const [audioBitrate, setAudioBitrate] = useState('128')
  const [resScale, setResScale] = useState('original')
  const [targetSizeMB, setTargetSizeMB] = useState(50)
  const [showCustom, setShowCustom] = useState(false)

  // Result
  const [resultBlob, setResultBlob] = useState<Blob | null>(null)
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [resultSize, setResultSize] = useState(0)
  const [startTime, setStartTime] = useState(0)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const originalVideoRef = useRef<HTMLVideoElement>(null)
  const compressedVideoRef = useRef<HTMLVideoElement>(null)

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

  // Sync Video Playback
  useEffect(() => {
    const orig = originalVideoRef.current
    const comp = compressedVideoRef.current
    if (!orig || !comp) return

    const handlePlay = () => comp.play()
    const handlePause = () => comp.pause()
    const handleSeek = () => { comp.currentTime = orig.currentTime }

    orig.addEventListener('play', handlePlay)
    orig.addEventListener('pause', handlePause)
    orig.addEventListener('seeked', handleSeek)

    return () => {
      orig.removeEventListener('play', handlePlay)
      orig.removeEventListener('pause', handlePause)
      orig.removeEventListener('seeked', handleSeek)
    }
  }, [resultUrl])

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return
    const f = files[0]
    if (!f.type.startsWith('video/')) return
    
    setFile(f)
    const url = URL.createObjectURL(f)
    const video = document.createElement('video')
    video.src = url
    video.onloadedmetadata = () => {
      setVideoInfo({
        duration: video.duration,
        width: video.videoWidth,
        height: video.videoHeight,
        size: f.size,
        format: f.name.split('.').pop()?.toUpperCase() || 'MP4',
        url: url
      })
      // Auto-set target size to 50% of original if target mode selected
      setTargetSizeMB(Math.round((f.size / 1024 / 1024) * 0.5))
    }
    setStatus('idle')
    setResultBlob(null)
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const handleCompress = async () => {
    if (!file || !videoInfo) return
    setStatus('processing')
    setProgress(0)
    setStartTime(Date.now())
    
    const ext = file.name.split('.').pop()?.toLowerCase() || 'mp4'
    const inputName = `input.${ext}`
    const outputName = 'output.mp4'

    await ffmpeg.writeFile(inputName, await fetchFile(file))

    ffmpeg.on('progress', ({ progress, time }) => {
      setProgress(Math.round(progress * 100))
      setCurrentTime(formatTime(time / 1000000))
      
      // Est Remaining
      if (progress > 0.05) {
        const elapsed = (Date.now() - startTime) / 1000
        const totalEst = elapsed / progress
        const remaining = totalEst - elapsed
        if (remaining > 0) {
          setEstRemaining(Math.round(remaining) + 's')
        }
      }
    })

    try {
      if (mode === 'target') {
        await runTwoPassCompression(inputName, outputName)
      } else {
        await runStandardCompression(inputName, outputName)
      }

      const data = await ffmpeg.readFile(outputName)
      const blob = new Blob([data as any], { type: 'video/mp4' })
      setResultBlob(blob)
      setResultUrl(URL.createObjectURL(blob))
      setResultSize(blob.size)
      setStatus('done')
    } catch (err: any) {
      console.error(err)
      setStatus('error')
      setStatusMsg(err.message)
    } finally {
      await ffmpeg.deleteFile(inputName)
      try { await ffmpeg.deleteFile(outputName) } catch(e) {}
    }
  }

  const runStandardCompression = async (input: string, output: string) => {
    const args = ['-i', input]
    
    // Codec
    const codecMap: Record<string, string> = {
      'H.264': 'libx264',
      'H.265': 'libx265',
      'VP9': 'libvpx-vp9',
      'AV1': 'libaom-av1'
    }
    args.push('-c:v', codecMap[codec] || 'libx264')

    // Quality
    const activeCrf = mode === 'preset' ? { low: 18, medium: 23, high: 28, max: 35 }[preset] : crf
    args.push('-crf', activeCrf.toString())
    args.push('-preset', encodingPreset)

    // Scaling
    if (resScale !== 'original') {
      const scaleMap: Record<string, string> = {
        '1080p': '1920:-2',
        '720p': '1280:-2',
        '480p': '854:-2',
        '50%': 'iw/2:-2'
      }
      args.push('-vf', `scale=${scaleMap[resScale]}`)
    }

    args.push('-c:a', 'aac', '-b:a', audioBitrate === 'original' ? '128k' : audioBitrate)
    args.push('-movflags', '+faststart', output)

    setStatusMsg('Compressing video...')
    await ffmpeg.exec(args)
  }

  const runTwoPassCompression = async (input: string, output: string) => {
    const targetBits = targetSizeMB * 8 * 1024 * 1024
    const audioBits = 128 * 1024 * videoInfo!.duration
    const videoBits = targetBits - audioBits
    const videoBitrateKbps = Math.max(100, Math.floor(videoBits / videoInfo!.duration / 1024))

    setStatusMsg('Analysis Pass (1/2)...')
    await ffmpeg.exec([
      '-y', '-i', input,
      '-c:v', 'libx264',
      '-b:v', `${videoBitrateKbps}k`,
      '-pass', '1',
      '-an', '-f', 'null', 'NUL'
    ])

    setStatusMsg('Compression Pass (2/2)...')
    await ffmpeg.exec([
      '-i', input,
      '-c:v', 'libx264',
      '-b:v', `${videoBitrateKbps}k`,
      '-pass', '2',
      '-c:a', 'aac',
      '-b:a', '128k',
      '-movflags', '+faststart',
      output
    ])
  }

  const getSmartHint = () => {
    if (!videoInfo) return null
    if (videoInfo.width > 2000) return { type: 'high', msg: '4K video detected — High compression possible (70-85%)' }
    if (videoInfo.size > 500 * 1024 * 1024) return { type: 'high', msg: 'Large file — Significant compression possible' }
    if (videoInfo.size < 50 * 1024 * 1024) return { type: 'low', msg: 'File is already small — Compression may be limited' }
    return null
  }

  const getEstSize = (p: PresetLevel) => {
    if (!videoInfo) return 0
    const savings = { low: 0.25, medium: 0.5, high: 0.7, max: 0.85 }[p]
    return Math.round((videoInfo.size / 1024 / 1024) * (1 - savings))
  }

  if (ffmpegLoading) {
    return (
      <div className="max-w-2xl mx-auto bg-card rounded-3xl p-12 border border-border shadow-xl text-center space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="relative inline-flex">
           <div className="w-24 h-24 rounded-full border-4 border-brand-orange/20 border-t-brand-orange animate-spin" />
           <div className="absolute inset-0 flex items-center justify-center">
             <Video className="size-8 text-brand-orange" />
           </div>
        </div>
        <div className="space-y-4">
          <h2 className="text-2xl font-bold font-syne">⚙️ Loading Video Engine</h2>
          <Progress value={45} className="h-3 w-64 mx-auto" />
          <div className="text-muted-foreground text-sm">
            Preparing FFmpeg encoding environment...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      
      {/* Upload Zone */}
      {status === 'idle' && !videoInfo && (
        <div
          className={`border-3 border-dashed rounded-[2.5rem] p-20 flex flex-col items-center justify-center transition-all duration-300 ease-in-out cursor-pointer min-h-[450px] relative overflow-hidden group
            ${isDragging ? 'border-brand-orange bg-brand-orange/5 scale-[1.01]' : 'border-border hover:border-brand-orange/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20'}
          `}
          onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={e => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files) }}
          onClick={() => fileInputRef.current?.click()}
        >
          <input type="file" ref={fileInputRef} className="hidden" accept="video/*" onChange={e => handleFiles(e.target.files)} />
          <div className="w-24 h-24 bg-brand-orange/10 rounded-full flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 shadow-inner">
            <Video className="size-12 text-brand-orange animate-pulse" />
          </div>
          <h3 className="text-3xl font-bold font-syne mb-4 text-foreground text-center">Drop your video here to compress</h3>
          <p className="text-muted-foreground text-center text-lg max-w-md">MP4, AVI, MOV, MKV, WebM supported. Files processed locally for maximum privacy.</p>
        </div>
      )}

      {/* Main UI */}
      {videoInfo && status !== 'done' && (
        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* Left Side: Video Preview & Info */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-card rounded-3xl border border-border shadow-2xl overflow-hidden">
               <div className="aspect-video bg-black relative group">
                 <video src={videoInfo.url} controls className="w-full h-full object-contain" />
               </div>
               
               <div className="p-8 space-y-6">
                 {getSmartHint() && (
                   <div className={`flex items-center gap-3 p-4 rounded-2xl border ${getSmartHint()?.type === 'high' ? 'bg-green-500/10 border-green-500/20 text-green-700' : 'bg-brand-orange/10 border-brand-orange/20 text-brand-orange'}`}>
                      <Zap className="size-5 shrink-0" />
                      <p className="text-sm font-bold">{getSmartHint()?.msg}</p>
                   </div>
                 )}

                 <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-2">
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Original Size</p>
                      <p className="text-xl font-bold">{(videoInfo.size/1024/1024).toFixed(1)} MB</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Resolution</p>
                      <p className="text-xl font-bold">{videoInfo.width}×{videoInfo.height}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Duration</p>
                      <p className="text-xl font-bold">{formatTime(videoInfo.duration)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Format</p>
                      <p className="text-xl font-bold">{videoInfo.format}</p>
                    </div>
                 </div>
               </div>
            </div>
          </div>

          {/* Right Side: Settings */}
          <div className="lg:col-span-5 space-y-6">
             <div className="bg-card rounded-3xl border border-border shadow-2xl p-8 space-y-8">
                
                <div className="flex bg-muted p-1 rounded-xl">
                  {(['preset', 'target'] as CompressionMode[]).map(m => (
                    <button
                      key={m}
                      onClick={() => setMode(m)}
                      className={`flex-1 py-3 rounded-lg text-sm font-bold capitalize transition-all ${mode === m ? 'bg-card shadow-lg text-brand-orange' : 'text-muted-foreground'}`}
                    >
                      {m === 'preset' ? 'Level' : 'Target Size'}
                    </button>
                  ))}
                </div>

                {mode === 'preset' ? (
                  <div className="grid grid-cols-2 gap-3">
                    {(['low', 'medium', 'high', 'max'] as PresetLevel[]).map(p => (
                      <button
                        key={p}
                        onClick={() => setPreset(p)}
                        className={`p-6 rounded-2xl border-2 text-left transition-all relative overflow-hidden group ${preset === p ? 'border-brand-orange bg-brand-orange/5 shadow-xl ring-4 ring-brand-orange/5' : 'border-border hover:border-zinc-300 dark:hover:border-zinc-700'}`}
                      >
                         <div className={`w-3 h-3 rounded-full mb-3 ${p === 'low' ? 'bg-green-500' : p === 'medium' ? 'bg-yellow-500' : p === 'high' ? 'bg-brand-orange' : 'bg-red-500'}`} />
                         <p className="font-bold text-lg capitalize mb-1">{p}</p>
                         <p className="text-[10px] text-muted-foreground leading-tight mb-3">
                           {p === 'low' ? 'Near lossless quality, larger size.' : p === 'medium' ? 'Standard web quality.' : p === 'high' ? 'Best for messaging apps.' : 'Maximum size reduction.'}
                         </p>
                         <Badge variant="outline" className="text-[10px] font-black">~{getEstSize(p)} MB</Badge>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-6 animate-in slide-in-from-top-2 duration-300">
                    <div className="space-y-3">
                      <label className="text-sm font-bold flex justify-between">Target File Size <span>{targetSizeMB} MB</span></label>
                      <div className="flex gap-4 items-center">
                        <Input 
                          type="number" 
                          value={targetSizeMB} 
                          onChange={e => setTargetSizeMB(Number(e.target.value))}
                          className="w-24 h-12 text-center text-lg font-bold rounded-xl"
                        />
                        <Slider value={[targetSizeMB]} max={Math.round(videoInfo.size/1024/1024)} min={5} step={1} onValueChange={(v: any) => setTargetSizeMB(v[0] ?? v)} className="flex-1" />
                      </div>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-2xl border border-border text-xs text-muted-foreground">
                      Original: {(videoInfo.size/1024/1024).toFixed(1)} MB → Target: {targetSizeMB} MB 
                      ({Math.round(100 - (targetSizeMB / (videoInfo.size/1024/1024) * 100))}% reduction)
                    </div>
                  </div>
                )}

                <div className="space-y-6 pt-4 border-t border-border">
                   <div className="flex items-center justify-between">
                     <label className="text-sm font-bold flex items-center gap-2"><Settings className="size-4 text-brand-orange" /> Custom Settings</label>
                     <Switch checked={showCustom} onCheckedChange={setShowCustom} />
                   </div>

                   {showCustom && (
                     <div className="space-y-6 animate-in fade-in duration-300">
                        <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Output Resolution</label>
                          <div className="grid grid-cols-2 gap-2">
                             {['original', '1080p', '720p', '480p'].map(r => (
                               <button 
                                 key={r}
                                 onClick={() => setResScale(r)}
                                 className={`py-2 rounded-lg text-[10px] font-bold border ${resScale === r ? 'bg-brand-orange text-white border-brand-orange' : 'bg-muted border-border'}`}
                               >
                                 {r === 'original' ? 'Keep Original' : r}
                               </button>
                             ))}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Video Codec</label>
                          <select 
                            value={codec} 
                            onChange={e => setCodec(e.target.value)}
                            className="w-full h-10 rounded-xl bg-muted border-border text-xs px-3 font-bold"
                          >
                            <option>H.264</option>
                            <option>H.265</option>
                            <option>VP9</option>
                            <option>AV1</option>
                          </select>
                        </div>
                     </div>
                   )}
                </div>

                <div className="pt-4">
                  <Button 
                    onClick={handleCompress}
                    disabled={status === 'processing'}
                    className="w-full bg-brand-orange hover:bg-brand-orange/90 text-white h-16 rounded-full text-xl font-bold shadow-xl shadow-brand-orange/20"
                  >
                    {status === 'processing' ? <><Loader2 className="mr-3 size-6 animate-spin" /> Compressing...</> : 'Compress Video'}
                  </Button>
                </div>
             </div>

             {status === 'processing' && (
               <div className="bg-card rounded-3xl border border-border p-8 shadow-2xl space-y-6 animate-in slide-in-from-bottom-4">
                  <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      <h4 className="font-bold flex items-center gap-2"><Gauge className="size-5 text-brand-orange" /> {statusMsg}</h4>
                      <p className="text-xs text-muted-foreground">Processing at {currentTime} / {formatTime(videoInfo.duration)}</p>
                    </div>
                    <span className="text-3xl font-black text-brand-orange">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-3" />
                  <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    <span>Est. Remaining: {estRemaining || 'calculating...'}</span>
                    <span>Please keep tab open</span>
                  </div>
               </div>
             )}
          </div>
        </div>
      )}

      {/* Result UI */}
      {status === 'done' && resultUrl && (
        <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-12 duration-1000">
          
          <div className="bg-card rounded-[3rem] border border-border shadow-2xl overflow-hidden">
             <div className="bg-green-500/5 p-10 border-b border-border flex items-center gap-6">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white shadow-xl shadow-green-500/20">
                  <CheckCircle2 className="size-10" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold font-syne text-foreground">Compression Complete!</h3>
                  <p className="text-muted-foreground">Your video has been optimized and is ready for download.</p>
                </div>
             </div>

             <div className="p-10 space-y-10">
                {/* Stats Bar */}
                <div className="grid md:grid-cols-3 gap-8">
                   <div className="space-y-4">
                      <p className="text-xs font-black text-muted-foreground uppercase tracking-tighter">Size Comparison</p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm font-bold">
                          <span>Original</span>
                          <span>{(videoInfo!.size/1024/1024).toFixed(1)} MB</span>
                        </div>
                        <div className="flex justify-between text-sm font-bold text-brand-orange">
                          <span>Compressed</span>
                          <span>{(resultSize/1024/1024).toFixed(1)} MB</span>
                        </div>
                        <div className="h-3 bg-muted rounded-full overflow-hidden">
                           <div 
                             className="h-full bg-brand-orange" 
                             style={{ width: `${(resultSize / videoInfo!.size) * 100}%` }} 
                           />
                        </div>
                      </div>
                   </div>
                   <div className="flex flex-col items-center justify-center bg-muted/30 rounded-3xl p-6 border border-border">
                      <p className="text-xs font-black text-muted-foreground uppercase mb-2">You Saved</p>
                      <p className="text-4xl font-black text-brand-orange">{Math.round((1 - resultSize/videoInfo!.size) * 100)}%</p>
                      <p className="text-sm font-bold text-muted-foreground mt-1">{((videoInfo!.size - resultSize)/1024/1024).toFixed(1)} MB saved</p>
                   </div>
                   <div className="space-y-2 flex flex-col justify-center">
                      <div className="flex items-center gap-3 text-sm font-bold">
                        <Zap className="size-4 text-brand-orange" />
                        <span>Mode: {mode === 'preset' ? preset.toUpperCase() : 'TARGET'}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm font-bold">
                        <Monitor className="size-4 text-brand-orange" />
                        <span>Codec: {codec}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm font-bold">
                        <Clock className="size-4 text-brand-orange" />
                        <span>Time: {Math.round((Date.now() - startTime) / 1000)}s</span>
                      </div>
                   </div>
                </div>

                {/* Before/After Player */}
                <div className="space-y-4">
                  <h4 className="font-bold font-syne text-xl flex items-center gap-2 px-1">
                    <ArrowRight className="size-5 text-brand-orange" /> Quality Comparison
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <div className="relative rounded-2xl overflow-hidden aspect-video shadow-2xl">
                          <video ref={originalVideoRef} src={videoInfo!.url} className="w-full h-full object-cover" controls />
                          <div className="absolute top-4 left-4">
                            <Badge className="bg-black/60 text-white backdrop-blur-md">BEFORE (ORIGINAL)</Badge>
                          </div>
                       </div>
                    </div>
                    <div className="space-y-2">
                       <div className="relative rounded-2xl overflow-hidden aspect-video shadow-2xl border-2 border-brand-orange/20">
                          <video ref={compressedVideoRef} src={resultUrl} className="w-full h-full object-cover" controls />
                          <div className="absolute top-4 left-4">
                            <Badge className="bg-brand-orange text-white">AFTER (COMPRESSED)</Badge>
                          </div>
                       </div>
                    </div>
                  </div>
                  <p className="text-center text-xs text-muted-foreground italic">Playback is synchronized. Play either video to compare quality side-by-side.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                   <Button 
                     onClick={() => {
                       const link = document.createElement('a')
                       link.href = resultUrl!
                       link.download = `${file!.name.split('.')[0]}_compressed.mp4`
                       link.click()
                     }}
                     className="flex-1 bg-brand-orange hover:bg-brand-orange/90 text-white h-20 rounded-full text-2xl font-black shadow-2xl shadow-brand-orange/30 group"
                   >
                     <Download className="mr-4 size-8 group-hover:translate-y-1 transition-transform" /> Download Video
                   </Button>
                   <Button 
                     variant="outline" 
                     onClick={() => {
                        setFile(null)
                        setVideoInfo(null)
                        setStatus('idle')
                        setResultUrl(null)
                     }}
                     className="sm:w-1/3 h-20 rounded-full text-xl font-bold border-2"
                   >
                     <RotateCcw className="mr-3 size-6" /> Start New
                   </Button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  )
}
