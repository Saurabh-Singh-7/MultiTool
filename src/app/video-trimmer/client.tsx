"use client"

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'
import { 
  Scissors, 
  Settings, 
  CheckCircle2, 
  Download, 
  Loader2, 
  AlertTriangle, 
  RotateCcw,
  Plus,
  Trash2,
  Play,
  Pause,
  Video,
  Clock,
  Zap,
  Info,
  ChevronRight,
  DownloadCloud,
  FileVideo,
  GripVertical,
  Type
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

interface VideoInfo {
  duration: number
  width: number
  height: number
  size: number
  name: string
  url: string
}

interface Clip {
  id: string
  start: number
  end: number
}

interface Thumbnail {
  time: number
  url: string
}

export default function VideoTrimmerClient() {
  const ffmpegRef = useRef<FFmpeg | null>(null)
  
  if (!ffmpegRef.current && typeof window !== 'undefined') {
    ffmpegRef.current = new FFmpeg()
  }
  
  const ffmpeg = ffmpegRef.current!
  const [ffmpegLoading, setFFmpegLoading] = useState(true)
  const [ffmpegReady, setFFmpegReady] = useState(false)
  
  const [file, setFile] = useState<File | null>(null)
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null)
  const [thumbnails, setThumbnails] = useState<Thumbnail[]>([])
  const [isThumbLoading, setIsThumbLoading] = useState(false)
  
  const [clips, setClips] = useState<Clip[]>([{ id: '1', start: 0, end: 0 }])
  const [activeClipId, setActiveClipId] = useState('1')
  
  const [isDragging, setIsDragging] = useState(false)
  const [status, setStatus] = useState<'idle' | 'processing' | 'done' | 'error'>('idle')
  const [progress, setProgress] = useState(0)
  const [statusMsg, setStatusMsg] = useState('')
  
  const [outputFormat, setOutputFormat] = useState('original')
  const [trimMethod, setTrimMethod] = useState<'fast' | 'precise'>('fast')
  const [mergeClips, setMergeClips] = useState(true)

  // Results
  const [results, setResults] = useState<{ url: string; name: string; size: number }[]>([])

  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const timelineRef = useRef<HTMLDivElement>(null)

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

  const generateThumbnails = async (videoFile: File, count: number) => {
    setIsThumbLoading(true)
    const video = document.createElement('video')
    video.src = URL.createObjectURL(videoFile)
    await new Promise(r => video.onloadedmetadata = r)

    const thumbs: Thumbnail[] = []
    const canvas = document.createElement('canvas')
    canvas.width = 80
    canvas.height = 45
    const ctx = canvas.getContext('2d')

    for (let i = 0; i < count; i++) {
      const time = (i / (count - 1)) * video.duration
      video.currentTime = time
      await new Promise(r => video.onseeked = r)
      ctx?.drawImage(video, 0, 0, 80, 45)
      thumbs.push({
        time,
        url: canvas.toDataURL('image/jpeg', 0.5)
      })
    }
    setIsThumbLoading(false)
    return thumbs
  }

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    const file = files[0]
    if (!file.type.startsWith('video/')) return

    const url = URL.createObjectURL(file)
    const video = document.createElement('video')
    video.src = url
    video.onloadedmetadata = async () => {
      setVideoInfo({
        duration: video.duration,
        width: video.videoWidth,
        height: video.videoHeight,
        size: file.size,
        name: file.name,
        url: url
      })
      setClips([{ id: '1', start: 0, end: video.duration > 10 ? 10 : video.duration }])
      setFile(file)
      
      const thumbs = await generateThumbnails(file, 20)
      setThumbnails(thumbs)
    }
  }

  const activeClip = useMemo(() => clips.find(c => c.id === activeClipId) || clips[0], [clips, activeClipId])

  const updateClip = (id: string, updates: Partial<Clip>) => {
    setClips(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c))
  }

  const addClip = () => {
    if (!videoInfo) return
    const lastClip = clips[clips.length - 1]
    const newStart = Math.min(lastClip.end + 1, videoInfo.duration)
    const newEnd = Math.min(newStart + 5, videoInfo.duration)
    const newClip = { id: Math.random().toString(36).substr(2, 9), start: newStart, end: newEnd }
    setClips(prev => [...prev, newClip])
    setActiveClipId(newClip.id)
  }

  const removeClip = (id: string) => {
    if (clips.length <= 1) return
    setClips(prev => prev.filter(c => c.id !== id))
    if (activeClipId === id) setActiveClipId(clips[0].id)
  }

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = Math.floor(seconds % 60)
    const ms = Math.floor((seconds % 1) * 1000)
    return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`
  }

  const handleSeek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time
    }
  }

  const [currentTime, setCurrentTime] = useState(0)
  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    const update = () => setCurrentTime(v.currentTime)
    v.addEventListener('timeupdate', update)
    return () => v.removeEventListener('timeupdate', update)
  }, [file])

  const handleTrim = async () => {
    if (!file || !videoInfo) return
    setStatus('processing')
    setProgress(0)
    setResults([])

    const ext = outputFormat === 'original' ? file.name.split('.').pop() : outputFormat
    const inputName = `input.${file.name.split('.').pop()}`

    try {
      await ffmpeg.writeFile(inputName, await fetchFile(file))

      ffmpeg.on('progress', ({ progress }) => {
        setProgress(Math.round(progress * 100))
      })

      if (mergeClips && clips.length > 1) {
        setStatusMsg("Processing multiple clips and merging...")
        // For merging, we usually need re-encoding to ensure same parameters
        // Actually, let's try fast merge if all from same file, but simple approach is re-encode
        const filterParts = clips.map((c, i) => `[0:v]trim=start=${c.start}:end=${c.end},setpts=PTS-STARTPTS[v${i}];[0:a]atrim=start=${c.start}:end=${c.end},asetpts=PTS-STARTPTS[a${i}]`).join(';')
        const filterConcat = clips.map((_, i) => `[v${i}][a${i}]`).join('') + `concat=n=${clips.length}:v=1:a=1[v][a]`
        
        const outputName = `output.${ext}`
        await ffmpeg.exec([
          '-i', inputName,
          '-filter_complex', `${filterParts};${filterConcat}`,
          '-map', '[v]', '-map', '[a]',
          '-c:v', 'libx264', '-c:a', 'aac', '-crf', '18',
          outputName
        ])

        const data = await ffmpeg.readFile(outputName)
        const blob = new Blob([data as any], { type: `video/${ext}` })
        setResults([{ 
          url: URL.createObjectURL(blob), 
          name: `${videoInfo.name.split('.')[0]}_trimmed.${ext}`,
          size: blob.size
        }])
      } else {
        const processedResults = []
        for (let i = 0; i < clips.length; i++) {
          const c = clips[i]
          const outputName = `output_${i}.${ext}`
          const duration = c.end - c.start
          
          setStatusMsg(`Trimming Clip ${i + 1}: ${formatTime(c.start)} → ${formatTime(c.end)}`)

          if (trimMethod === 'fast') {
            // FAST TRIM (Stream copy)
            await ffmpeg.exec([
              '-ss', c.start.toString(),
              '-i', inputName,
              '-t', duration.toString(),
              '-c', 'copy',
              '-avoid_negative_ts', 'make_zero',
              outputName
            ])
          } else {
            // PRECISE TRIM (Re-encode)
            await ffmpeg.exec([
              '-i', inputName,
              '-ss', c.start.toString(),
              '-to', c.end.toString(),
              '-c:v', 'libx264',
              '-c:a', 'aac',
              '-crf', '18',
              outputName
            ])
          }

          const data = await ffmpeg.readFile(outputName)
          const blob = new Blob([data as any], { type: `video/${ext}` })
          processedResults.push({
            url: URL.createObjectURL(blob),
            name: `${videoInfo.name.split('.')[0]}_clip_${i + 1}.${ext}`,
            size: blob.size
          })
          await ffmpeg.deleteFile(outputName)
        }
        setResults(processedResults)
      }

      setStatus('done')
      await ffmpeg.deleteFile(inputName)
    } catch (err) {
      console.error(err)
      setStatus('error')
    }
  }

  // Keyboard controls
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!file || status === 'processing') return
      const v = videoRef.current
      if (!v) return

      if (e.code === 'Space') {
        e.preventDefault()
        v.paused ? v.play() : v.pause()
      } else if (e.key === 'j' || e.key === 'J') {
        v.currentTime -= 5
      } else if (e.key === 'l' || e.key === 'L') {
        v.currentTime += 5
      } else if (e.key === 'i' || e.key === 'I') {
        updateClip(activeClipId, { start: v.currentTime })
      } else if (e.key === 'o' || e.key === 'O') {
        updateClip(activeClipId, { end: v.currentTime })
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [file, activeClipId, status])

  if (ffmpegLoading) {
    return (
      <div className="max-w-2xl mx-auto bg-card rounded-3xl p-12 border border-border shadow-xl text-center space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="relative inline-flex">
           <div className="w-24 h-24 rounded-full border-4 border-brand-orange/20 border-t-brand-orange animate-spin" />
           <div className="absolute inset-0 flex items-center justify-center text-4xl">✂️</div>
        </div>
        <div className="space-y-4">
          <h2 className="text-2xl font-bold font-syne text-foreground">⚙️ Loading Trimmer Engine</h2>
          <Progress value={62} className="h-3 w-64 mx-auto" />
          <div className="text-muted-foreground text-sm">Initializing FFmpeg core...</div>
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
            ✂️
          </div>
          <h3 className="text-3xl font-bold font-syne mb-4 text-foreground text-center">Drop your video here to trim</h3>
          <p className="text-muted-foreground text-center text-lg max-w-lg">MP4, MOV, AVI, MKV, WebM supported • Max 2GB</p>
          <Button className="mt-8 bg-zinc-900 dark:bg-white dark:text-zinc-900 hover:scale-105 transition-transform rounded-full px-10 h-14 font-bold text-lg">Browse Files</Button>
        </div>
      )}

      {file && videoInfo && status !== 'done' && (
        <div className="grid lg:grid-cols-1 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
          
          <div className="bg-card rounded-[2.5rem] border border-border shadow-2xl overflow-hidden p-8 space-y-8">
            {/* Header / Info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-brand-orange/10 rounded-2xl flex items-center justify-center">
                  <Video className="size-6 text-brand-orange" />
                </div>
                <div>
                  <h4 className="font-bold text-lg truncate max-w-[300px]">{videoInfo.name}</h4>
                  <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">{videoInfo.width}×{videoInfo.height} • {(videoInfo.size/1024/1024).toFixed(1)} MB</p>
                </div>
              </div>
              <Button variant="ghost" className="text-red-500 rounded-full" onClick={() => {setFile(null); setVideoInfo(null); setStatus('idle')}}><RotateCcw className="size-4 mr-2" /> Start Over</Button>
            </div>

            {/* Video Player */}
            <div className="relative rounded-3xl overflow-hidden bg-black aspect-video max-h-[500px] mx-auto border border-border shadow-inner">
               <video 
                 ref={videoRef} 
                 src={videoInfo.url} 
                 className="w-full h-full"
                 onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                 controls
               />
            </div>

            {/* Timeline Trimmer */}
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-2">
                 <h5 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                   <Scissors className="size-4" /> Timeline Trimmer
                 </h5>
                 <div className="flex gap-2">
                    <Badge variant="outline" className="border-brand-orange/30 text-brand-orange font-bold">
                       Current Clip: {formatTime(activeClip.start)} → {formatTime(activeClip.end)}
                    </Badge>
                    <Badge className="bg-zinc-900 dark:bg-white dark:text-zinc-900 font-bold">
                       Duration: {(activeClip.end - activeClip.start).toFixed(2)}s
                    </Badge>
                 </div>
              </div>

              {/* Professional Timeline */}
              <div className="relative pt-6 pb-2">
                 {/* Thumbnail Strip */}
                 <div className="h-16 w-full rounded-xl border border-border overflow-hidden flex bg-zinc-900 relative">
                    {thumbnails.map((thumb, i) => (
                      <img key={i} src={thumb.url} alt="" className="h-full flex-1 object-cover opacity-60" />
                    ))}
                    
                    {/* Other Clips visualization */}
                    {clips.map(c => (
                      <div 
                        key={c.id}
                        className={cn(
                          "absolute top-0 h-full border-x border-white/20 transition-all",
                          c.id === activeClipId ? "bg-brand-orange/40 z-10" : "bg-zinc-500/30 z-0"
                        )}
                        style={{ 
                          left: `${(c.start / videoInfo.duration) * 100}%`,
                          width: `${((c.end - c.start) / videoInfo.duration) * 100}%`
                        }}
                      />
                    ))}

                    {/* Playback Indicator */}
                    <div 
                      className="absolute top-0 h-full w-0.5 bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)] z-20 pointer-events-none"
                      style={{ left: `${(currentTime / videoInfo.duration) * 100}%` }}
                    />
                 </div>

                 {/* Dual Handle Slider Overlay */}
                 <div className="mt-4 px-2">
                    <Slider 
                      value={[activeClip.start, activeClip.end]}
                      max={videoInfo.duration}
                      step={0.01}
                      onValueChange={(v) => {
                        updateClip(activeClipId, { start: v[0], end: v[1] })
                        if (videoRef.current) videoRef.current.currentTime = v[0]
                      }}
                      className="relative z-30"
                    />
                 </div>
              </div>

              {/* Precise Time Inputs */}
              <div className="grid md:grid-cols-2 gap-8 pt-4">
                 <div className="space-y-4 p-6 bg-muted/50 rounded-[2rem] border border-border relative">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground absolute -top-2 left-6 bg-card px-2">Start Time</label>
                    <div className="flex items-center gap-3">
                       <Input 
                          type="number" 
                          value={activeClip.start.toFixed(3)} 
                          onChange={(e) => updateClip(activeClipId, { start: parseFloat(e.target.value) })}
                          className="bg-card text-center font-mono font-bold text-lg h-12 rounded-xl"
                       />
                       <Button size="sm" variant="outline" className="rounded-full h-12 px-6 hover:bg-brand-orange/5" onClick={() => videoRef.current && updateClip(activeClipId, { start: videoRef.current.currentTime })}>📍 Current</Button>
                    </div>
                 </div>
                 <div className="space-y-4 p-6 bg-muted/50 rounded-[2rem] border border-border relative">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground absolute -top-2 left-6 bg-card px-2">End Time</label>
                    <div className="flex items-center gap-3">
                       <Input 
                          type="number" 
                          value={activeClip.end.toFixed(3)} 
                          onChange={(e) => updateClip(activeClipId, { end: parseFloat(e.target.value) })}
                          className="bg-card text-center font-mono font-bold text-lg h-12 rounded-xl"
                       />
                       <Button size="sm" variant="outline" className="rounded-full h-12 px-6 hover:bg-brand-orange/5" onClick={() => videoRef.current && updateClip(activeClipId, { end: videoRef.current.currentTime })}>📍 Current</Button>
                    </div>
                 </div>
              </div>
            </div>

            {/* Clips List */}
            <div className="space-y-4 pt-4 border-t border-border">
               <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold font-syne flex items-center gap-2">
                    <Plus className="size-5 text-brand-orange" /> Multiple Clips
                  </h3>
                  <Button variant="outline" className="rounded-full h-10 border-brand-orange/30 hover:bg-brand-orange/5" onClick={addClip}>
                    <Plus className="size-4 mr-2" /> Add Another Clip
                  </Button>
               </div>
               
               <div className="grid gap-3">
                  {clips.map((clip, index) => (
                    <div 
                      key={clip.id}
                      onClick={() => setActiveClipId(clip.id)}
                      className={cn(
                        "p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group",
                        activeClipId === clip.id ? "bg-brand-orange/5 border-brand-orange shadow-lg" : "bg-muted/30 border-border hover:bg-muted"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center font-bold", activeClipId === clip.id ? "bg-brand-orange text-white" : "bg-muted-foreground/10")}>
                           {index + 1}
                        </div>
                        <div>
                           <p className="font-bold text-sm">Clip {index + 1}</p>
                           <p className="text-xs text-muted-foreground">{formatTime(clip.start)} → {formatTime(clip.end)} ({(clip.end - clip.start).toFixed(2)}s)</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <Button size="icon" variant="ghost" className="text-muted-foreground hover:text-red-500" onClick={(e) => { e.stopPropagation(); removeClip(clip.id) }}>
                            <Trash2 className="size-4" />
                         </Button>
                         <ChevronRight className="size-4 text-brand-orange" />
                      </div>
                    </div>
                  ))}
               </div>
            </div>

            {/* Bottom Controls / Settings */}
            <div className="bg-muted/30 rounded-[2.5rem] p-8 border border-border grid md:grid-cols-2 gap-10">
               <div className="space-y-6">
                  <div className="space-y-3">
                     <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Output Format</label>
                     <Tabs value={outputFormat} onValueChange={setOutputFormat} className="w-full">
                        <TabsList className="grid grid-cols-5 w-full rounded-xl bg-card border border-border h-12 p-1">
                           {['original', 'mp4', 'mov', 'webm', 'mkv'].map(fmt => (
                             <TabsTrigger key={fmt} value={fmt} className="rounded-lg uppercase text-[10px] font-black">{fmt}</TabsTrigger>
                           ))}
                        </TabsList>
                     </Tabs>
                  </div>

                  <div className="space-y-3">
                     <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Trim Method</label>
                     <div className="grid grid-cols-2 gap-4">
                        <button 
                          onClick={() => setTrimMethod('fast')}
                          className={cn(
                            "p-4 rounded-2xl border text-left transition-all",
                            trimMethod === 'fast' ? "bg-brand-orange/10 border-brand-orange shadow-inner" : "bg-card border-border hover:border-brand-orange/30"
                          )}
                        >
                           <div className="flex items-center gap-2 mb-1">
                              <Zap className="size-4 text-brand-orange fill-brand-orange" />
                              <span className="font-bold text-sm">Fast Trim</span>
                           </div>
                           <p className="text-[10px] text-muted-foreground leading-tight">Instant keyframe-based trim (±1s accuracy)</p>
                        </button>
                        <button 
                          onClick={() => setTrimMethod('precise')}
                          className={cn(
                            "p-4 rounded-2xl border text-left transition-all",
                            trimMethod === 'precise' ? "bg-brand-orange/10 border-brand-orange shadow-inner" : "bg-card border-border hover:border-brand-orange/30"
                          )}
                        >
                           <div className="flex items-center gap-2 mb-1">
                              <Scissors className="size-4 text-brand-orange" />
                              <span className="font-bold text-sm">Precise Trim</span>
                           </div>
                           <p className="text-[10px] text-muted-foreground leading-tight">Frame-accurate re-encoding (Takes longer)</p>
                        </button>
                     </div>
                  </div>
               </div>

               <div className="flex flex-col justify-center space-y-6">
                  {clips.length > 1 && (
                    <div className="flex items-center justify-between p-4 bg-card rounded-2xl border border-border">
                       <div className="flex items-center gap-3">
                          <Info className="size-4 text-brand-orange" />
                          <label className="text-sm font-bold">Merge all clips into one</label>
                       </div>
                       <Switch checked={mergeClips} onCheckedChange={setMergeClips} />
                    </div>
                  )}

                  <div className="space-y-2">
                     <Button 
                       onClick={handleTrim}
                       className="w-full bg-brand-orange hover:bg-brand-orange/90 text-white h-20 rounded-full text-2xl font-black shadow-2xl shadow-brand-orange/30 group"
                     >
                        <Scissors className="mr-3 size-8 group-hover:rotate-12 transition-transform" /> 
                        Trim Video
                     </Button>
                     <p className="text-center text-[10px] font-black text-muted-foreground uppercase tracking-widest pt-2">
                        Keyboard shortcuts: J (Rewind), L (Forward), I (Set Start), O (Set End), Space (Play)
                     </p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Processing UI */}
      {status === 'processing' && (
        <div className="max-w-2xl mx-auto bg-card rounded-[3rem] p-12 border border-border shadow-2xl text-center space-y-8 animate-in fade-in zoom-in duration-500">
           <div className="space-y-6">
              <div className="relative inline-flex">
                 <div className="w-24 h-24 rounded-full border-4 border-brand-orange/10 border-t-brand-orange animate-spin" />
                 <div className="absolute inset-0 flex items-center justify-center">
                   <Scissors className="size-10 text-brand-orange animate-pulse" />
                 </div>
              </div>
              <div className="space-y-2">
                 <h3 className="text-2xl font-bold font-syne">Trimming Video...</h3>
                 <p className="text-muted-foreground text-sm uppercase font-black tracking-widest">{statusMsg}</p>
              </div>
           </div>

           <div className="space-y-4 max-w-sm mx-auto">
              <div className="flex justify-between text-sm font-bold">
                 <span>Progress</span>
                 <span className="text-brand-orange font-black">{progress}%</span>
              </div>
              <Progress value={progress} className="h-4 rounded-full" />
              <div className="flex items-center justify-center gap-2 text-[10px] font-black text-muted-foreground uppercase mt-4">
                 <Zap className="size-3" /> Method: {trimMethod === 'fast' ? 'Fast Trim (Stream Copy)' : 'Precise Trim (Re-encode)'}
              </div>
           </div>
        </div>
      )}

      {/* Results View */}
      {status === 'done' && results.length > 0 && (
        <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-12 duration-1000">
           <div className="bg-card rounded-[3rem] border border-border shadow-2xl overflow-hidden">
              <div className="bg-green-500/5 p-10 border-b border-border flex items-center gap-6 text-green-600">
                 <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white shadow-xl shadow-green-500/20">
                   <CheckCircle2 className="size-10" />
                 </div>
                 <div>
                   <h3 className="text-3xl font-bold font-syne">Trimming Complete!</h3>
                   <p className="text-muted-foreground">Your {results.length > 1 ? 'clips are' : 'video is'} ready for download.</p>
                 </div>
              </div>

              <div className="p-10 space-y-8">
                 {results.map((res, i) => (
                    <div key={i} className="grid lg:grid-cols-2 gap-10 items-center p-6 bg-muted/20 rounded-[2.5rem] border border-border">
                       <div className="relative rounded-2xl overflow-hidden aspect-video bg-black shadow-2xl">
                          <video src={res.url} controls className="w-full h-full" />
                       </div>
                       <div className="space-y-6">
                          <div className="space-y-1">
                             <h4 className="font-bold text-lg truncate">{res.name}</h4>
                             <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Size: {(res.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                          
                          <Button 
                            onClick={() => {
                              const link = document.createElement('a')
                              link.href = res.url
                              link.download = res.name
                              link.click()
                            }}
                            className="w-full bg-brand-orange hover:bg-brand-orange/90 text-white h-16 rounded-full text-xl font-black shadow-xl shadow-brand-orange/20"
                          >
                            <DownloadCloud className="mr-3 size-6" /> Download Clip {results.length > 1 ? i + 1 : ''}
                          </Button>
                       </div>
                    </div>
                 ))}

                 <div className="flex justify-center gap-4 pt-6">
                    <Button variant="outline" className="rounded-full h-14 px-10 font-bold" onClick={() => setStatus('idle')}>
                      <RotateCcw className="size-4 mr-2" /> Adjust Trim Points
                    </Button>
                    <Button variant="outline" className="rounded-full h-14 px-10 font-bold" onClick={() => { setFile(null); setVideoInfo(null); setStatus('idle'); setResults([]); }}>
                      <RotateCcw className="size-4 mr-2" /> Trim New Video
                    </Button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  )
}
