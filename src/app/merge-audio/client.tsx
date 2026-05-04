"use client"

import React, { useState, useRef, useEffect, useMemo } from 'react'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'
import { 
  DndContext, 
  closestCenter, 
  PointerSensor, 
  useSensor, 
  useSensors, 
  DragEndEvent 
} from '@dnd-kit/core'
import { 
  arrayMove, 
  SortableContext, 
  verticalListSortingStrategy, 
  horizontalListSortingStrategy,
  useSortable 
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { 
  UploadCloud, 
  Music, 
  GripVertical, 
  Trash2, 
  Play, 
  Pause, 
  Plus, 
  Settings, 
  CheckCircle2, 
  Download, 
  Loader2, 
  AlertTriangle, 
  RotateCcw,
  Clock,
  Zap,
  Info
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'



interface AudioFile {
  id: string
  file: File
  name: string
  size: number
  format: string
  durationSecs: number
  durationStr: string
  url: string
}

interface MergeSettings {
  format: 'MP3' | 'WAV' | 'AAC' | 'OGG' | 'FLAC' | 'M4A'
  bitrate: string
  silenceDuration: number
  crossfade: boolean
  crossfadeDuration: number
  normalize: boolean
  outputName: string
}

interface SortableItemProps {
  id: string
  file: AudioFile
  index: number
  onRemove: (id: string) => void
  onPlay: (url: string) => void
}

function SortableAudioItem({ id, file, index, onRemove, onPlay }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-card border border-border p-4 rounded-2xl flex items-center gap-4 transition-all ${isDragging ? 'shadow-2xl ring-2 ring-brand-orange scale-[1.02] cursor-grabbing' : 'hover:border-brand-orange/50'}`}
    >
      <div {...attributes} {...listeners} className="cursor-grab p-2 hover:bg-muted rounded-lg transition-colors">
        <GripVertical className="size-5 text-muted-foreground" />
      </div>
      
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-brand-orange/10 flex items-center justify-center text-brand-orange shrink-0">
           <span className="text-xs font-black">{index + 1}</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-bold truncate text-sm">{file.name}</p>
          <div className="flex items-center gap-2 mt-0.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            <span className="px-1.5 py-0.5 bg-muted rounded">{file.format}</span>
            <span>•</span>
            <span>{file.durationStr}</span>
            <span>•</span>
            <span>{(file.size/1024/1024).toFixed(1)} MB</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 text-brand-orange hover:bg-brand-orange/10" onClick={() => onPlay(file.url)}>
           <Play className="size-4" />
        </Button>
        <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 text-muted-foreground hover:text-red-500 hover:bg-red-50" onClick={() => onRemove(id)}>
           <Trash2 className="size-4" />
        </Button>
      </div>
    </div>
  )
}

function TimelineAudioItem({ id, file, index }: { id: string, file: AudioFile, index: number }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id })

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    // Proportional width based on duration (min 120px, max 300px)
    width: Math.min(Math.max(file.durationSecs * 2, 120), 300) + 'px'
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`h-16 shrink-0 rounded-2xl border-2 flex flex-col justify-center px-4 relative transition-all cursor-grab active:cursor-grabbing group overflow-hidden
        ${isDragging 
          ? 'border-brand-orange bg-brand-orange/20 shadow-2xl scale-105 z-50' 
          : 'border-zinc-700 bg-zinc-800/80 hover:border-brand-orange/50 hover:bg-zinc-800'}
      `}
    >
      <div className="absolute top-0 left-0 w-1 h-full bg-brand-orange/30 group-hover:bg-brand-orange transition-colors" />
      <p className="text-[10px] font-black text-brand-orange/70 mb-0.5 truncate uppercase">Track {index + 1}</p>
      <p className="text-xs font-bold truncate text-foreground">{file.name}</p>
      <div className="flex justify-between items-center mt-1">
         <span className="text-[9px] font-bold text-muted-foreground">{file.durationStr}</span>
         <Music className={`size-3 transition-colors ${isDragging ? 'text-brand-orange' : 'text-zinc-600'}`} />
      </div>
    </div>
  )
}

export default function MergeAudioClient() {
  const ffmpegRef = useRef<FFmpeg | null>(null)
  
  if (!ffmpegRef.current && typeof window !== 'undefined') {
    ffmpegRef.current = new FFmpeg()
  }
  
  const ffmpeg = ffmpegRef.current!
  const [ffmpegLoading, setFFmpegLoading] = useState(true)
  const [ffmpegReady, setFFmpegReady] = useState(false)
  
  const [files, setFiles] = useState<AudioFile[]>([])
  const [isDraggingOver, setIsDraggingOver] = useState(false)
  const [status, setStatus] = useState<'idle' | 'processing' | 'done' | 'error'>('idle')
  const [progress, setProgress] = useState(0)
  const [statusMsg, setStatusMsg] = useState('')
  
  const [settings, setSettings] = useState<MergeSettings>({
    format: 'MP3',
    bitrate: '192',
    silenceDuration: 0,
    crossfade: false,
    crossfadeDuration: 1,
    normalize: false,
    outputName: 'merged_audio'
  })

  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [resultBlob, setResultBlob] = useState<Blob | null>(null)
  const [resultInfo, setResultInfo] = useState<{ size: number; duration: string } | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const sensors = useSensors(useSensor(PointerSensor))

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
    const count = Math.min(newFiles.length, 20 - files.length)
    
    for (let i = 0; i < count; i++) {
      const f = newFiles[i]
      if (f.type.startsWith('audio/')) {
        const info = await getAudioInfo(f)
        validFiles.push({
          id: Math.random().toString(36).substr(2, 9),
          file: f,
          name: f.name,
          size: f.size,
          format: f.name.split('.').pop()?.toUpperCase() || 'Audio',
          durationSecs: info.durationSecs,
          durationStr: info.durationStr,
          url: URL.createObjectURL(f)
        })
      }
    }

    setFiles(prev => [...prev, ...validFiles])
    setStatus('idle')
  }

  const getAudioInfo = (file: File): Promise<{ durationStr: string; durationSecs: number }> => {
    return new Promise((resolve) => {
      const audio = new Audio()
      audio.src = URL.createObjectURL(file)
      audio.onloadedmetadata = () => {
        const mins = Math.floor(audio.duration / 60)
        const secs = Math.floor(audio.duration % 60)
        const durationStr = `${mins}:${secs.toString().padStart(2, '0')}`
        const durationSecs = audio.duration
        URL.revokeObjectURL(audio.src)
        resolve({ durationStr, durationSecs })
      }
      audio.onerror = () => resolve({ durationStr: '0:00', durationSecs: 0 })
    })
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (active.id !== over?.id) {
      setFiles((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id)
        const newIndex = items.findIndex((i) => i.id === over?.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  const totalDuration = useMemo(() => files.reduce((acc, f) => acc + f.durationSecs, 0), [files])
  const totalSize = useMemo(() => files.reduce((acc, f) => acc + f.size, 0), [files])

  const handleMerge = async () => {
    if (files.length < 2) return
    setStatus('processing')
    setProgress(0)
    
    const inputNames: string[] = []
    for (let i = 0; i < files.length; i++) {
      setStatusMsg(`Loading track ${i + 1}...`)
      const ext = files[i].name.split('.').pop() || 'mp3'
      const name = `input_${i}.${ext}`
      await ffmpeg.writeFile(name, await fetchFile(files[i].file))
      inputNames.push(name)
      setProgress(Math.round(((i + 1) / files.length) * 20))
    }

    const outputExt = settings.format.toLowerCase()
    const outputName = `output.${outputExt}`
    const codecMap: Record<string, string> = {
      'MP3': 'libmp3lame', 'WAV': 'pcm_s16le', 'AAC': 'aac', 'OGG': 'libvorbis', 'FLAC': 'flac', 'M4A': 'aac'
    }

    ffmpeg.on('progress', ({ progress }) => {
      setProgress(20 + Math.round(progress * 75))
    })

    try {
      // Logic for Merge
      const useComplex = settings.crossfade || settings.normalize || settings.silenceDuration > 0
      
      if (!useComplex) {
        setStatusMsg('Joining files...')
        const concatContent = inputNames.map(n => `file '${n}'`).join('\n')
        await ffmpeg.writeFile('concat.txt', new TextEncoder().encode(concatContent))
        await ffmpeg.exec([
          '-f', 'concat', '-safe', '0', '-i', 'concat.txt', 
          '-c:a', codecMap[settings.format], '-b:a', `${settings.bitrate}k`, 
          outputName
        ])
      } else {
        setStatusMsg('Applying effects and merging...')
        const inputArgs = inputNames.flatMap(n => ['-i', n])
        let filterParts: string[] = []
        let streams = inputNames.map((_, i) => `[${i}:a]`)

        // Normalize
        if (settings.normalize) {
          streams = streams.map((s, i) => {
            filterParts.push(`${s}loudnorm=I=-14:TP=-1.5:LRA=11[n${i}]`)
            return `[n${i}]`
          })
        }

        // Crossfade
        if (settings.crossfade) {
           let current = streams[0]
           for (let i = 1; i < streams.length; i++) {
             const out = i === streams.length - 1 ? '[outa]' : `[c${i}]`
             filterParts.push(`${current}${streams[i]}acrossfade=d=${settings.crossfadeDuration}:c1=tri:c2=tri${out}`)
             current = out
           }
        } else {
           // Concat with silence if needed
           if (settings.silenceDuration > 0) {
             const silStreams = []
             for (let i = 0; i < streams.length; i++) {
               silStreams.push(streams[i])
               if (i < streams.length - 1) {
                 filterParts.push(`aevalsrc=0:d=${settings.silenceDuration}[s${i}]`)
                 silStreams.push(`[s${i}]`)
               }
             }
             filterParts.push(`${silStreams.join('')}concat=n=${silStreams.length}:v=0:a=1[outa]`)
           } else {
             filterParts.push(`${streams.join('')}concat=n=${streams.length}:v=0:a=1[outa]`)
           }
        }

        await ffmpeg.exec([
          ...inputArgs,
          '-filter_complex', filterParts.join(';'),
          '-map', '[outa]',
          '-c:a', codecMap[settings.format], '-b:a', `${settings.bitrate}k`,
          outputName
        ])
      }

      const data = await ffmpeg.readFile(outputName)
      const blob = new Blob([data as any], { type: `audio/${outputExt}` })
      setResultBlob(blob)
      setResultUrl(URL.createObjectURL(blob))
      
      const audio = new Audio(URL.createObjectURL(blob))
      audio.onloadedmetadata = () => {
         const mins = Math.floor(audio.duration / 60)
         const secs = Math.floor(audio.duration % 60)
         setResultInfo({ size: blob.size, duration: `${mins}:${secs.toString().padStart(2, '0')}` })
      }
      
      setStatus('done')
      setProgress(100)
    } catch (err: any) {
      console.error(err)
      setStatus('error')
    } finally {
      for (const n of inputNames) await ffmpeg.deleteFile(n)
      try { await ffmpeg.deleteFile('concat.txt') } catch(e) {}
      try { await ffmpeg.deleteFile(outputName) } catch(e) {}
    }
  }

  const drawWaveform = async (url: string) => {
    const canvas = document.getElementById('merged-waveform') as HTMLCanvasElement
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const W = canvas.width = 1000
    const H = canvas.height = 120

    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const response = await fetch(url)
      const arrayBuffer = await response.arrayBuffer()
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer)
      const data = audioBuffer.getChannelData(0)
      
      const step = Math.ceil(data.length / W)
      const amp = H / 2

      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = '#09090b' // zinc-950
      ctx.fillRect(0, 0, W, H)

      // Calculate track segments for colored waveform
      let currentOffset = 0
      const segments = files.map((f, i) => {
        const start = currentOffset
        const duration = f.durationSecs + (i < files.length - 1 ? settings.silenceDuration : 0)
        currentOffset += duration
        return { start, end: currentOffset, name: f.name }
      })

      const totalDur = audioBuffer.duration
      const colors = ['#f97316', '#3b82f6', '#10b981', '#a855f7', '#ec4899', '#f59e0b']

      for (let i = 0; i < W; i++) {
        const currentTime = (i / W) * totalDur
        const trackIdx = segments.findIndex(s => currentTime >= s.start && currentTime <= s.end)
        ctx.strokeStyle = trackIdx !== -1 ? colors[trackIdx % colors.length] : '#52525b'
        
        let min = 1, max = -1
        for (let j = 0; j < step; j++) {
           const val = data[i * step + j] || 0
           if (val < min) min = val
           if (val > max) max = val
        }
        ctx.beginPath()
        ctx.moveTo(i, (1 + min) * amp)
        ctx.lineTo(i, (1 + max) * amp)
        ctx.stroke()

        // Markers
        if (i > 0) {
           const prevTime = ((i-1)/W) * totalDur
           const prevTrackIdx = segments.findIndex(s => prevTime >= s.start && prevTime <= s.end)
           if (trackIdx !== prevTrackIdx && trackIdx !== -1) {
              ctx.fillStyle = 'rgba(255,255,255,0.2)'
              ctx.fillRect(i, 0, 1, H)
           }
        }
      }
      audioCtx.close()
    } catch (e) { console.error(e) }
  }

  useEffect(() => {
    if (resultUrl) drawWaveform(resultUrl)
  }, [resultUrl])

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
          <h2 className="text-2xl font-bold font-syne text-foreground">⚙️ Initializing Merge Engine</h2>
          <Progress value={62} className="h-3 w-64 mx-auto" />
          <div className="text-muted-foreground text-sm">Preparing WebAssembly audio context...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <input type="file" ref={fileInputRef} className="hidden" accept="audio/*" multiple onChange={e => handleFiles(e.target.files)} />
      
      {/* Upload Zone */}
      {status === 'idle' && files.length === 0 && (
        <div
          className={`border-3 border-dashed rounded-[2.5rem] p-20 flex flex-col items-center justify-center transition-all duration-300 ease-in-out cursor-pointer min-h-[400px] relative overflow-hidden group
            ${isDraggingOver ? 'border-brand-orange bg-brand-orange/5 scale-[1.01]' : 'border-border hover:border-brand-orange/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/10'}
          `}
          onDragOver={e => { e.preventDefault(); setIsDraggingOver(true) }}
          onDragLeave={() => setIsDraggingOver(false)}
          onDrop={e => { e.preventDefault(); setIsDraggingOver(false); handleFiles(e.dataTransfer.files) }}
          onClick={() => fileInputRef.current?.click()}
        >

          <div className="w-24 h-24 bg-brand-orange/10 rounded-full flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 shadow-inner">
            <Music className="size-12 text-brand-orange animate-pulse" />
          </div>
          <h3 className="text-3xl font-bold font-syne mb-4 text-foreground text-center">Drop audio files here to merge</h3>
          <p className="text-muted-foreground text-center text-lg max-w-lg">MP3, WAV, AAC, OGG, FLAC supported • Drag to reorder after upload</p>
        </div>
      )}

      {/* Main UI */}
      {files.length > 0 && status !== 'done' && (
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* File List & Timeline */}
          <div className="lg:col-span-12 xl:col-span-8 space-y-6">
             <div className="bg-card rounded-[2.5rem] border border-border shadow-2xl overflow-hidden">
                <div className="p-8 border-b border-border bg-muted/30">
                   <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h4 className="text-xl font-bold font-syne">Merge Sequence</h4>
                        <p className="text-xs text-muted-foreground">Drag the tracks to change their order in the final audio file.</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="rounded-full" onClick={() => fileInputRef.current?.click()}><Plus className="size-4 mr-1" /> Add Files</Button>
                        <Button variant="ghost" size="sm" className="rounded-full text-red-500" onClick={() => setFiles([])}><Trash2 className="size-4 mr-1" /> Clear</Button>
                      </div>
                   </div>
                </div>
                <div className="p-6">
                   <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                      {/* Timeline View */}
                      <div className="relative mb-12 p-4 bg-zinc-900/50 rounded-3xl border border-border overflow-x-auto pb-8">
                         <div className="flex items-center gap-1 min-w-full h-24 relative">
                            {/* Timeline Background Track */}
                            <div className="absolute inset-x-0 h-1 top-1/2 -translate-y-1/2 bg-zinc-800 rounded-full" />
                            
                            <SortableContext items={files.map(f => f.id)} strategy={horizontalListSortingStrategy}>
                               {files.map((f, idx) => (
                                 <TimelineAudioItem key={f.id} id={f.id} file={f} index={idx} />
                               ))}
                            </SortableContext>
                            
                            <button 
                              onClick={() => fileInputRef.current?.click()}
                              className="h-16 w-16 shrink-0 rounded-2xl border-2 border-dashed border-zinc-700 flex flex-col items-center justify-center gap-1 text-zinc-500 hover:border-brand-orange hover:text-brand-orange transition-all ml-4"
                            >
                               <Plus className="size-5" />
                               <span className="text-[10px] font-bold">ADD</span>
                            </button>
                         </div>
                      </div>

                      {/* List View */}
                      <div className="space-y-3">
                         <SortableContext items={files.map(f => f.id)} strategy={verticalListSortingStrategy}>
                            {files.map((f, idx) => (
                              <SortableAudioItem key={f.id} id={f.id} file={f} index={idx} onRemove={(id) => setFiles(p => p.filter(x => x.id !== id))} onPlay={(url) => {}} />
                            ))}
                         </SortableContext>
                      </div>
                   </DndContext>
                </div>
                
                <div className="p-8 bg-muted/50 border-t border-border flex items-center justify-between">
                   <div className="flex gap-6">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Total Duration</p>
                        <p className="font-bold text-lg">{Math.floor(totalDuration/60)}:{(totalDuration%60).toFixed(0).padStart(2,'0')}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Merged Size</p>
                        <p className="font-bold text-lg">{(totalSize/1024/1024).toFixed(1)} MB</p>
                      </div>
                   </div>
                   <Badge className="bg-brand-orange/10 text-brand-orange border-brand-orange/20 py-1 px-4">{files.length} Tracks</Badge>
                </div>
             </div>

             {/* Timeline Visualizer */}
             <div className="bg-card rounded-3xl border border-border shadow-xl p-8 space-y-4">
                <h4 className="text-sm font-black uppercase text-muted-foreground tracking-widest">Timeline Preview</h4>
                <div className="h-16 w-full bg-muted rounded-2xl overflow-hidden flex shadow-inner border border-border">
                   {files.map((f, i) => (
                     <React.Fragment key={f.id}>
                        <div 
                          className="h-full flex items-center justify-center relative group"
                          style={{ 
                            width: `${(f.durationSecs / (totalDuration + (files.length-1) * settings.silenceDuration)) * 100}%`,
                            backgroundColor: ['#f97316', '#3b82f6', '#10b981', '#a855f7', '#ec4899', '#f59e0b'][i % 6],
                            opacity: 0.8
                          }}
                        >
                           <span className="text-[10px] font-black text-white px-2 truncate pointer-events-none">{f.name}</span>
                           <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        {i < files.length - 1 && settings.silenceDuration > 0 && (
                          <div 
                            className="h-full bg-zinc-400 opacity-30 flex items-center justify-center"
                            style={{ width: `${(settings.silenceDuration / (totalDuration + (files.length-1) * settings.silenceDuration)) * 100}%` }}
                          >
                             <div className="w-1 h-1 rounded-full bg-zinc-600" />
                          </div>
                        )}
                     </React.Fragment>
                   ))}
                </div>
                <div className="flex justify-between text-[10px] font-black text-muted-foreground uppercase">
                   <span>0:00</span>
                   <span>{Math.floor(totalDuration/60)}:{(totalDuration%60).toFixed(0).padStart(2,'0')}</span>
                </div>
             </div>
          </div>

          {/* Settings Panel */}
          <div className="lg:col-span-12 xl:col-span-4 space-y-6">
             <div className="bg-card rounded-3xl border border-border shadow-2xl p-8 space-y-8 sticky top-8">
                <div className="space-y-4">
                   <h3 className="text-xl font-bold font-syne flex items-center gap-2"><Settings className="size-5 text-brand-orange" /> Merge Settings</h3>
                   <div className="space-y-3">
                      <label className="text-xs font-bold text-muted-foreground">Output Format</label>
                      <div className="grid grid-cols-3 gap-2">
                        {['MP3', 'WAV', 'AAC', 'OGG', 'FLAC', 'M4A'].map(f => (
                          <button 
                            key={f}
                            onClick={() => setSettings(p => ({ ...p, format: f as any }))}
                            className={`py-2 rounded-xl text-xs font-bold border transition-all ${settings.format === f ? 'bg-brand-orange text-white border-brand-orange shadow-lg' : 'bg-muted border-border'}`}
                          >
                            {f}
                          </button>
                        ))}
                      </div>
                   </div>
                </div>

                <div className="space-y-6 pt-4 border-t border-border">
                   <div className="space-y-4">
                      <div className="flex justify-between items-center">
                         <label className="text-xs font-bold">Silence Between Tracks</label>
                         <span className="text-xs font-black text-brand-orange">{settings.silenceDuration}s</span>
                      </div>
                      <Slider value={[settings.silenceDuration]} max={10} step={0.5} onValueChange={(v: any) => setSettings(p => ({ ...p, silenceDuration: v[0] ?? v }))} disabled={settings.crossfade} />
                      <div className="flex gap-2">
                        {[0, 1, 2, 5].map(s => <button key={s} onClick={() => setSettings(p => ({ ...p, silenceDuration: s }))} className="px-3 py-1 bg-muted rounded-full text-[10px] font-bold border border-border hover:border-brand-orange transition-colors">{s}s</button>)}
                      </div>
                   </div>

                   <div className="space-y-4 pt-4 border-t border-border">
                      <div className="flex items-center justify-between">
                         <div className="space-y-0.5">
                            <p className="text-xs font-bold">Enable Crossfade</p>
                            <p className="text-[10px] text-muted-foreground">Overlap tracks for smoothness</p>
                         </div>
                         <Switch checked={settings.crossfade} onCheckedChange={c => setSettings(p => ({ ...p, crossfade: c, silenceDuration: c ? 0 : p.silenceDuration }))} />
                      </div>
                      {settings.crossfade && (
                        <div className="space-y-3 animate-in slide-in-from-top-2 duration-300">
                           <div className="flex justify-between text-[10px] font-bold">
                              <span>Duration</span>
                              <span>{settings.crossfadeDuration}s</span>
                           </div>
                           <Slider value={[settings.crossfadeDuration]} min={0.5} max={5} step={0.5} onValueChange={(v: any) => setSettings(p => ({ ...p, crossfadeDuration: v[0] ?? v }))} />
                        </div>
                      )}
                   </div>

                   <div className="flex items-center justify-between pt-4 border-t border-border">
                      <p className="text-xs font-bold">Normalize Volume</p>
                      <Switch checked={settings.normalize} onCheckedChange={c => setSettings(p => ({ ...p, normalize: c }))} />
                   </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-border">
                   <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Output Filename</label>
                   <Input value={settings.outputName} onChange={e => setSettings(p => ({ ...p, outputName: e.target.value }))} className="h-12 rounded-xl bg-muted border-border font-bold" />
                </div>

                <Button 
                  onClick={handleMerge}
                  disabled={files.length < 2 || status === 'processing'}
                  className="w-full bg-brand-orange hover:bg-brand-orange/90 text-white h-16 rounded-full text-xl font-bold shadow-xl shadow-brand-orange/20"
                >
                  {status === 'processing' ? <><Loader2 className="mr-3 size-6 animate-spin" /> Merging...</> : <><Zap className="mr-3 size-5" /> Merge Tracks</>}
                </Button>
                {files.length < 2 && <p className="text-center text-[10px] text-red-500 font-bold">Upload at least 2 tracks to merge</p>}
             </div>

             {status === 'processing' && (
               <div className="bg-card rounded-3xl border border-border p-8 shadow-2xl space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                  <div className="flex justify-between items-end mb-2">
                     <div className="space-y-1">
                        <h4 className="font-bold flex items-center gap-2"><Loader2 className="size-5 text-brand-orange animate-spin" /> {statusMsg}</h4>
                        <p className="text-xs text-muted-foreground">Merging {files.length} audio files...</p>
                     </div>
                     <span className="text-3xl font-black text-brand-orange">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-3" />
                  <p className="text-center text-[10px] font-black text-muted-foreground uppercase tracking-widest">Please keep this tab open</p>
               </div>
             )}
          </div>
        </div>
      )}

      {/* Result UI */}
      {status === 'done' && resultUrl && resultInfo && (
        <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-12 duration-1000">
           <div className="bg-card rounded-[3rem] border border-border shadow-2xl overflow-hidden">
              <div className="bg-green-500/5 p-10 border-b border-border flex items-center gap-6">
                 <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white shadow-xl shadow-green-500/20">
                   <CheckCircle2 className="size-10" />
                 </div>
                 <div>
                   <h3 className="text-3xl font-bold font-syne">Merge Complete!</h3>
                   <p className="text-muted-foreground">All tracks have been joined into a single audio file.</p>
                 </div>
              </div>

              <div className="p-10 space-y-10">
                 <div className="space-y-6">
                    <canvas id="merged-waveform" className="w-full h-[120px] rounded-3xl bg-zinc-950 shadow-inner" />
                    <audio controls src={resultUrl} className="w-full h-12 custom-audio-player shadow-xl rounded-full" />
                 </div>

                 <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[
                      { label: "Duration", val: resultInfo.duration, icon: Clock },
                      { label: "File Size", val: (resultInfo.size/1024/1024).toFixed(1) + " MB", icon: Music },
                      { label: "Format", val: settings.format, icon: Info },
                      { label: "Tracks", val: files.length, icon: GripVertical }
                    ].map(stat => (
                      <div key={stat.label} className="bg-muted/50 p-6 rounded-2xl border border-border text-center flex flex-col items-center gap-2">
                         <stat.icon className="size-5 text-brand-orange opacity-50" />
                         <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                         <p className="text-xl font-bold">{stat.val}</p>
                      </div>
                    ))}
                 </div>

                 <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-border">
                    <Button 
                      onClick={() => {
                        const link = document.createElement('a')
                        link.href = resultUrl
                        link.download = `${settings.outputName}.${settings.format.toLowerCase()}`
                        link.click()
                      }}
                      className="flex-1 bg-brand-orange hover:bg-brand-orange/90 text-white h-20 rounded-full text-2xl font-black shadow-2xl shadow-brand-orange/30 group"
                    >
                      <Download className="mr-4 size-8 group-hover:translate-y-1 transition-transform" /> Download Joined Audio
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => {
                         setFiles([])
                         setResultUrl(null)
                         setStatus('idle')
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
