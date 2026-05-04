"use client"

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'
import { 
  FileVideo, 
  Music, 
  VolumeX, 
  RefreshCcw, 
  Download, 
  Loader2, 
  CheckCircle2, 
  AlertTriangle,
  Volume2,
  Plus,
  ArrowRight,
  Info,
  X,
  Repeat,
  Scissors,
  Mic2,
  Waves
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export default function RemoveAudioClient() {
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [status, setStatus] = useState<'idle' | 'processing' | 'done' | 'error'>('idle')
  const [progress, setProgress] = useState(0)
  const [errorMsg, setErrorMsg] = useState('')
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [ffmpegReady, setFFmpegReady] = useState(false)
  const [duration, setDuration] = useState(0)
  const [hasAudio, setHasAudio] = useState<boolean | null>(null)

  // Settings
  const [mode, setMode] = useState('mute')
  const [origVolume, setOrigVolume] = useState(100)
  const [newVolume, setNewVolume] = useState(100)
  const [loopAudio, setLoopAudio] = useState(true)
  const [format, setFormat] = useState('mp4')

  const ffmpegRef = useRef<FFmpeg | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const audioInputRef = useRef<HTMLInputElement>(null)

  const [isDragging, setIsDragging] = useState(false)

  // Initialize FFmpeg
  useEffect(() => {
    const load = async () => {
      const ffmpeg = new FFmpeg()
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.4/dist/umd'
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      })
      ffmpegRef.current = ffmpeg
      setFFmpegReady(true)
    }
    load()
  }, [])

  const handleVideoFile = (file: File) => {
    if (file) {
      setVideoFile(file)
      setStatus('idle')
      setResultUrl(null)
      setErrorMsg('')
      
      const video = document.createElement('video')
      video.preload = 'metadata'
      video.onloadedmetadata = () => {
        setDuration(video.duration)
        setHasAudio(true)
      }
      video.src = URL.createObjectURL(file)
    }
  }

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleVideoFile(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => setIsDragging(false)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith('video/')) handleVideoFile(file)
  }

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setAudioFile(file)
  }

  const processVideo = async () => {
    if (!videoFile || !ffmpegRef.current) return
    setStatus('processing')
    setProgress(0)
    setErrorMsg('')

    const ffmpeg = ffmpegRef.current
    const inputExt = videoFile.name.split('.').pop() || 'mp4'
    const inputName = `input.${inputExt}`
    const outputName = `output.${format}`

    try {
      await ffmpeg.writeFile(inputName, await fetchFile(videoFile))

      ffmpeg.on('progress', ({ progress }) => {
        setProgress(Math.round(progress * 100))
      })

      if (mode === 'mute') {
        // Fast Mute (Stream Copy)
        await ffmpeg.exec(['-i', inputName, '-an', '-vcodec', 'copy', outputName])
      } 
      else if (mode === 'replace' && audioFile) {
        const audioExt = audioFile.name.split('.').pop() || 'mp3'
        const audioName = `audio.${audioExt}`
        await ffmpeg.writeFile(audioName, await fetchFile(audioFile))

        const args = [
          '-i', inputName,
          '-i', audioName,
          '-c:v', 'copy',
          '-map', '0:v:0',
          '-map', '1:a:0',
          '-shortest',
          '-c:a', 'aac',
          '-b:a', '192k'
        ]
        
        // Volume adjustment
        if (newVolume !== 100) {
           args.push('-af', `volume=${newVolume / 100}`)
        }

        args.push(outputName)
        await ffmpeg.exec(args)
      }
      else if (mode === 'silence') {
        // Add Silence
        await ffmpeg.exec([
          '-i', inputName,
          '-f', 'lavfi',
          '-i', 'anullsrc=r=44100:cl=stereo',
          '-c:v', 'copy',
          '-c:a', 'aac',
          '-map', '0:v:0',
          '-map', '1:a:0',
          '-shortest',
          outputName
        ])
      }
      else if (mode === 'mix' && audioFile) {
        const audioExt = audioFile.name.split('.').pop() || 'mp3'
        const audioName = `audio.${audioExt}`
        await ffmpeg.writeFile(audioName, await fetchFile(audioFile))

        await ffmpeg.exec([
          '-i', inputName,
          '-i', audioName,
          '-filter_complex',
          `[0:a]volume=${origVolume / 100}[a1];[1:a]volume=${newVolume / 100}[a2];[a1][a2]amix=inputs=2:duration=first[aout]`,
          '-map', '0:v:0',
          '-map', '[aout]',
          '-c:v', 'copy',
          '-c:a', 'aac',
          outputName
        ])
      }

      const data = await ffmpeg.readFile(outputName)
      const blob = new Blob([data as any], { type: `video/${format}` })
      setResultUrl(URL.createObjectURL(blob))
      setStatus('done')
    } catch (err: any) {
      console.error(err)
      setErrorMsg(err.message || 'Error processing video')
      setStatus('error')
    }
  }

  return (
    <div className="space-y-12">
      {!videoFile ? (
        <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
           <div 
             onDragOver={handleDragOver}
             onDragLeave={handleDragLeave}
             onDrop={handleDrop}
             onClick={() => videoInputRef.current?.click()}
             className={cn(
               "group relative flex flex-col items-center justify-center w-full aspect-[21/9] border-4 border-dashed rounded-[3rem] bg-card transition-all cursor-pointer overflow-hidden shadow-xl",
               isDragging ? "bg-brand-orange/10 border-brand-orange scale-[1.02]" : "border-border hover:bg-brand-orange/5 hover:border-brand-orange/50"
             )}
           >
             <div className="flex flex-col items-center justify-center pt-5 pb-6 space-y-4">
               <div className={cn(
                 "w-20 h-20 rounded-3xl flex items-center justify-center transition-transform duration-500",
                 isDragging ? "bg-brand-orange text-white scale-110" : "bg-brand-orange/10 text-brand-orange group-hover:scale-110"
               )}>
                 <VolumeX className="size-10" />
               </div>
               <div className="text-center">
                 <p className="text-2xl font-bold font-syne mb-2">{isDragging ? "Drop to Mute" : "Drop your video here to mute"}</p>
                 <p className="text-muted-foreground text-sm font-medium uppercase tracking-widest">MP4, MOV, AVI, MKV • MAX 2GB</p>
               </div>
               <Button variant="secondary" className={cn(
                 "rounded-full px-8 pointer-events-none transition-colors",
                 isDragging ? "bg-brand-orange text-white" : "group-hover:bg-brand-orange group-hover:text-white"
               )}>
                  Select Video File
               </Button>
             </div>
             <input 
               ref={videoInputRef}
               type="file" 
               className="hidden" 
               accept="video/*" 
               onChange={handleVideoUpload} 
             />
           </div>
        </div>
      ) : (
        <div className="grid lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
           {/* Settings & Preview */}
           <div className="lg:col-span-8 space-y-8">
              <div className="bg-card rounded-[2.5rem] border border-border shadow-2xl p-10 space-y-8">
                 <div className="flex items-center justify-between border-b border-border pb-6">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-brand-orange/10 rounded-2xl flex items-center justify-center">
                          <FileVideo className="size-6 text-brand-orange" />
                       </div>
                       <div>
                          <h3 className="font-bold text-xl">{videoFile.name}</h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-2">
                             {(videoFile.size / (1024 * 1024)).toFixed(1)} MB • {duration.toFixed(1)}s
                             {hasAudio && <span className="flex items-center gap-1 text-green-500 font-bold"><Volume2 className="size-3" /> Audio Detected</span>}
                          </p>
                       </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setVideoFile(null)} className="rounded-full hover:bg-red-500/10 hover:text-red-500">
                       <X className="size-5" />
                    </Button>
                 </div>

                 <Tabs defaultValue="mute" onValueChange={setMode} className="space-y-8">
                    <TabsList className="grid grid-cols-4 bg-muted/30 p-1.5 h-auto rounded-2xl border border-border">
                       <TabsTrigger value="mute" className="rounded-xl py-3 data-[state=active]:bg-brand-orange data-[state=active]:text-white transition-all font-bold">Mute</TabsTrigger>
                       <TabsTrigger value="replace" className="rounded-xl py-3 data-[state=active]:bg-brand-orange data-[state=active]:text-white transition-all font-bold">Replace</TabsTrigger>
                       <TabsTrigger value="silence" className="rounded-xl py-3 data-[state=active]:bg-brand-orange data-[state=active]:text-white transition-all font-bold">Silence</TabsTrigger>
                       <TabsTrigger value="mix" className="rounded-xl py-3 data-[state=active]:bg-brand-orange data-[state=active]:text-white transition-all font-bold">Mix</TabsTrigger>
                    </TabsList>

                    <TabsContent value="mute" className="space-y-6">
                       <div className="p-8 bg-muted/20 rounded-3xl border border-border flex items-center gap-6">
                          <div className="w-16 h-16 bg-brand-orange/10 rounded-full flex items-center justify-center shrink-0">
                             <VolumeX className="size-8 text-brand-orange" />
                          </div>
                          <div>
                             <h4 className="font-bold text-lg">Instant Mute Mode</h4>
                             <p className="text-muted-foreground text-sm">Uses stream copy to strip all audio data. Near-instant processing with zero quality loss.</p>
                          </div>
                       </div>
                    </TabsContent>

                    <TabsContent value="replace" className="space-y-8">
                       <div className="space-y-6">
                          <h4 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                             <Plus className="size-4" /> New Audio Source
                          </h4>
                          {!audioFile ? (
                             <div 
                                onClick={() => audioInputRef.current?.click()}
                                className="flex flex-col items-center justify-center w-full p-10 border-2 border-dashed border-border rounded-3xl bg-muted/10 hover:bg-brand-orange/5 hover:border-brand-orange/30 transition-all cursor-pointer group"
                             >
                                <Music className="size-8 text-muted-foreground group-hover:text-brand-orange mb-4 transition-colors" />
                                <span className="font-bold text-muted-foreground group-hover:text-brand-orange">Upload replacement audio</span>
                                <input ref={audioInputRef} type="file" className="hidden" accept="audio/*" onChange={handleAudioUpload} />
                             </div>
                          ) : (
                             <div className="flex items-center justify-between p-6 bg-brand-orange/5 rounded-3xl border border-brand-orange/20">
                                <div className="flex items-center gap-4">
                                   <div className="w-10 h-10 bg-brand-orange text-white rounded-xl flex items-center justify-center">
                                      <Music className="size-5" />
                                   </div>
                                   <div>
                                      <p className="font-bold">{audioFile.name}</p>
                                      <p className="text-xs text-brand-orange font-bold uppercase tracking-widest">Ready to swap</p>
                                   </div>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => setAudioFile(null)} className="rounded-full">
                                   <X className="size-4" />
                                </Button>
                             </div>
                          )}

                          <div className="grid md:grid-cols-2 gap-6 pt-4">
                             <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                   <label className="text-sm font-bold flex items-center gap-2"><Volume2 className="size-4" /> New Audio Volume</label>
                                   <span className="text-sm font-black text-brand-orange">{newVolume}%</span>
                                </div>
                                <Slider value={[newVolume]} onValueChange={([v]) => setNewVolume(v)} max={200} step={1} />
                             </div>
                             <div className="flex items-center justify-between p-4 bg-muted/20 rounded-2xl border border-border self-end">
                                <div className="flex items-center gap-2">
                                   <Repeat className="size-4 text-brand-orange" />
                                   <span className="text-sm font-bold">Loop Audio</span>
                                </div>
                                <Switch checked={loopAudio} onCheckedChange={setLoopAudio} />
                             </div>
                          </div>
                       </div>
                    </TabsContent>

                    <TabsContent value="silence" className="space-y-6">
                       <div className="p-8 bg-muted/20 rounded-3xl border border-border flex items-center gap-6">
                          <div className="w-16 h-16 bg-brand-orange/10 rounded-full flex items-center justify-center shrink-0">
                             <Waves className="size-8 text-brand-orange opacity-20" />
                          </div>
                          <div>
                             <h4 className="font-bold text-lg">Add Silence Mode</h4>
                             <p className="text-muted-foreground text-sm">Replaces original audio with a flat silent track. Useful for removing corrupted audio while keeping the track structure.</p>
                          </div>
                       </div>
                    </TabsContent>

                    <TabsContent value="mix" className="space-y-8">
                       <div className="space-y-8">
                          <div className="space-y-6">
                             <h4 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <Mic2 className="size-4" /> Additional Audio Track
                             </h4>
                             {!audioFile ? (
                                <label className="flex flex-col items-center justify-center w-full p-10 border-2 border-dashed border-border rounded-3xl bg-muted/10 hover:bg-brand-orange/5 hover:border-brand-orange/30 transition-all cursor-pointer group">
                                   <Music className="size-8 text-muted-foreground group-hover:text-brand-orange mb-4 transition-colors" />
                                   <span className="font-bold text-muted-foreground group-hover:text-brand-orange">Upload audio to mix</span>
                                   <input type="file" className="hidden" accept="audio/*" onChange={handleAudioUpload} />
                                </label>
                             ) : (
                                <div className="flex items-center justify-between p-6 bg-brand-orange/5 rounded-3xl border border-brand-orange/20">
                                   <div className="flex items-center gap-4">
                                      <div className="w-10 h-10 bg-brand-orange text-white rounded-xl flex items-center justify-center">
                                         <Plus className="size-5" />
                                      </div>
                                      <div>
                                         <p className="font-bold">{audioFile.name}</p>
                                         <p className="text-xs text-brand-orange font-bold uppercase tracking-widest">Added to mix</p>
                                      </div>
                                   </div>
                                   <Button variant="ghost" size="icon" onClick={() => setAudioFile(null)} className="rounded-full">
                                      <X className="size-4" />
                                   </Button>
                                </div>
                             )}
                          </div>

                          <div className="grid md:grid-cols-2 gap-8 pt-4">
                             <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                   <label className="text-sm font-bold">Original Audio Volume</label>
                                   <span className="text-sm font-black text-brand-orange">{origVolume}%</span>
                                </div>
                                <Slider value={[origVolume]} onValueChange={([v]) => setOrigVolume(v)} max={150} step={1} />
                             </div>
                             <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                   <label className="text-sm font-bold">New Audio Volume</label>
                                   <span className="text-sm font-black text-brand-orange">{newVolume}%</span>
                                </div>
                                <Slider value={[newVolume]} onValueChange={([v]) => setNewVolume(v)} max={150} step={1} />
                             </div>
                          </div>
                       </div>
                    </TabsContent>
                 </Tabs>

                 {errorMsg && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500 text-sm font-bold animate-in shake duration-500">
                       <AlertTriangle className="size-5 shrink-0" />
                       {errorMsg}
                    </div>
                 )}

                 <Button 
                    onClick={processVideo}
                    disabled={status === 'processing' || !ffmpegReady || ( (mode === 'replace' || mode === 'mix') && !audioFile )}
                    className="w-full h-20 bg-brand-orange hover:bg-brand-orange/90 text-white rounded-full text-2xl font-black shadow-2xl shadow-brand-orange/30 group disabled:bg-muted"
                 >
                    {status === 'processing' ? (
                       <>
                         <Loader2 className="mr-3 size-6 animate-spin" />
                         Processing...
                       </>
                    ) : (
                       <>
                         {mode === 'mute' && <VolumeX className="mr-3 size-6" />}
                         {mode === 'replace' && <RefreshCcw className="mr-3 size-6" />}
                         {mode === 'silence' && <ArrowRight className="mr-3 size-6" />}
                         {mode === 'mix' && <Plus className="mr-3 size-6" />}
                         {mode === 'mute' ? 'Mute Video' : mode === 'replace' ? 'Replace Audio' : mode === 'silence' ? 'Add Silence' : 'Mix Audio'}
                       </>
                    )}
                 </Button>

                 {status === 'processing' && (
                    <div className="space-y-3 animate-in fade-in duration-500">
                       <div className="flex justify-between items-center text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">
                          <span>Progress</span>
                          <span>{progress}%</span>
                       </div>
                       <Progress value={progress} className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-brand-orange transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
                       </Progress>
                       <p className="text-center text-[10px] text-muted-foreground uppercase font-black">
                          {mode === 'mute' ? 'Stream copying packtes (Fast)...' : 'Re-encoding audio track (Precise)...'}
                       </p>
                    </div>
                 )}
              </div>
           </div>

           {/* Sidebar Info */}
           <div className="lg:col-span-4 space-y-6">
              <div className="bg-card rounded-[2.5rem] border border-border p-8 shadow-xl">
                 <h4 className="text-xl font-bold font-syne mb-6 flex items-center gap-2">
                    <Info className="size-5 text-brand-orange" /> Tool Insights
                 </h4>
                 <div className="space-y-6">
                    <div className="p-4 bg-muted/20 rounded-2xl border border-border space-y-2">
                       <p className="text-xs font-black uppercase tracking-widest text-brand-orange">Output Format</p>
                       <select 
                         value={format} 
                         onChange={(e) => setFormat(e.target.value)}
                         className="w-full bg-transparent font-bold outline-none cursor-pointer"
                       >
                          <option value="mp4">MP4 Video</option>
                          <option value="webm">WebM Video</option>
                          <option value="mov">MOV (QuickTime)</option>
                          <option value="mkv">MKV Video</option>
                       </select>
                    </div>
                    
                    <div className="space-y-4">
                       <div className="flex items-center gap-3 text-sm font-medium">
                          <div className="w-8 h-8 rounded-full bg-brand-orange/10 flex items-center justify-center shrink-0">
                             <CheckCircle2 className="size-4 text-brand-orange" />
                          </div>
                          No data leaves your computer
                       </div>
                       <div className="flex items-center gap-3 text-sm font-medium">
                          <div className="w-8 h-8 rounded-full bg-brand-orange/10 flex items-center justify-center shrink-0">
                             <CheckCircle2 className="size-4 text-brand-orange" />
                          </div>
                          Maintain source video quality
                       </div>
                    </div>
                 </div>
              </div>

              {resultUrl && status === 'done' && (
                <div className="bg-green-500/5 rounded-[2.5rem] border border-green-500/20 p-8 shadow-xl animate-in zoom-in duration-500">
                   <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-green-500/30">
                         <Download className="size-6" />
                      </div>
                      <div>
                         <h4 className="font-bold">Ready to Save</h4>
                         <p className="text-xs text-green-600 font-bold uppercase tracking-widest">Successfully Processed</p>
                      </div>
                   </div>
                   <Button 
                     asChild
                     className="w-full h-14 bg-green-500 hover:bg-green-600 text-white rounded-2xl font-black shadow-lg shadow-green-500/20"
                   >
                      <a href={resultUrl} download={`toolhive_muted_${Date.now()}.${format}`}>
                         Download Result
                      </a>
                   </Button>
                </div>
              )}
           </div>
        </div>
      )}

      {/* Result Preview Modal-like */}
      {status === 'done' && resultUrl && (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-12 duration-1000">
           <div className="bg-card rounded-[3rem] border border-border shadow-2xl overflow-hidden">
              <div className="bg-muted/30 p-4 border-b border-border flex items-center justify-between px-10 py-6">
                 <h3 className="text-2xl font-bold font-syne">Processed Video</h3>
                 <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20 px-4 py-1.5 rounded-full font-bold">
                    ✓ {mode.toUpperCase()} COMPLETE
                 </Badge>
              </div>
              <div className="p-10 space-y-8">
                 <div className="rounded-[2rem] overflow-hidden border-4 border-border bg-black shadow-inner aspect-video flex items-center justify-center">
                    <video src={resultUrl} controls className="w-full h-full" />
                 </div>
                 <div className="flex flex-col md:flex-row gap-4 items-center justify-between p-6 bg-muted/20 rounded-3xl border border-border">
                    <div>
                       <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">Final Result</p>
                       <p className="font-bold text-lg">Muted Video • {format.toUpperCase()}</p>
                    </div>
                    <div className="flex gap-4">
                       <Button variant="outline" className="h-14 rounded-2xl px-8 font-bold" onClick={() => {setVideoFile(null); setStatus('idle'); setAudioFile(null);}}>
                          <RefreshCcw className="mr-2 size-4" /> Start New
                       </Button>
                       <Button asChild className="h-14 rounded-2xl px-12 bg-brand-orange hover:bg-brand-orange/90 text-white font-black shadow-xl shadow-brand-orange/20">
                          <a href={resultUrl} download={`toolhive_muted_${Date.now()}.${format}`}>
                             <Download className="mr-2 size-5" /> Download
                          </a>
                       </Button>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  )
}
