"use client"

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'
import { 
  Monitor, 
  Mic, 
  Video, 
  Settings, 
  CheckCircle2, 
  Download, 
  Loader2, 
  AlertTriangle, 
  RotateCcw,
  Play,
  Square,
  Pause,
  Circle,
  Volume2,
  Camera,
  Layers,
  MousePointer2,
  PenTool,
  Trash2,
  DownloadCloud,
  ChevronRight,
  Info,
  Maximize
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'

interface RecordingSettings {
  source: 'screen' | 'window' | 'tab'
  systemAudio: boolean
  mic: boolean
  micDeviceId: string
  webcam: boolean
  webcamPosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  webcamSize: 'small' | 'medium' | 'large'
  resolution: '720p' | '1080p' | '4k'
  fps: 30 | 60
  format: 'webm' | 'mp4'
  countdown: number
}

export default function ScreenRecorderClient() {
  // FFmpeg for MP4 conversion
  const ffmpegRef = useRef<FFmpeg | null>(null)
  const [ffmpegReady, setFFmpegReady] = useState(false)
  const [isConverting, setIsConverting] = useState(false)
  const [convertProgress, setConvertProgress] = useState(0)

  // Recording State
  const [status, setStatus] = useState<'idle' | 'countdown' | 'recording' | 'paused' | 'done' | 'error'>('idle')
  const [countdown, setCountdown] = useState(0)
  const [duration, setDuration] = useState(0)
  const [errorMsg, setErrorMsg] = useState('')
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null)

  // Media References
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const screenStreamRef = useRef<MediaStream | null>(null)
  const micStreamRef = useRef<MediaStream | null>(null)
  const camStreamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Compositor References
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const screenVideoRef = useRef<HTMLVideoElement | null>(null)
  const camVideoRef = useRef<HTMLVideoElement | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  // Annotation State
  const [drawingMode, setDrawingMode] = useState(false)
  const [spotlightMode, setSpotlightMode] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const annotationCanvasRef = useRef<HTMLCanvasElement>(null)

  const [settings, setSettings] = useState<RecordingSettings>({
    source: 'screen',
    systemAudio: true,
    mic: false,
    micDeviceId: 'default',
    webcam: false,
    webcamPosition: 'top-right',
    webcamSize: 'medium',
    resolution: '1080p',
    fps: 30,
    format: 'webm',
    countdown: 3
  })

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

  // Timer logic
  useEffect(() => {
    if (status === 'recording') {
      timerRef.current = setInterval(() => setDuration(d => d + 1), 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [status])

  const getSupportedMimeType = () => {
    const types = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
      'video/mp4',
    ]
    return types.find(type => MediaRecorder.isTypeSupported(type)) || 'video/webm'
  }

  const formatTime = (s: number) => {
    const hrs = Math.floor(s / 3600)
    const mins = Math.floor((s % 3600) / 60)
    const secs = s % 60
    return `${hrs > 0 ? hrs.toString().padStart(2, '0') + ':' : ''}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Stable state for compositor to avoid re-creating loop
  const drawingStateRef = useRef({
    drawingMode: false,
    spotlightMode: false,
    mousePos: { x: 0, y: 0 },
    settings: settings
  })

  useEffect(() => {
    drawingStateRef.current = { drawingMode, spotlightMode, mousePos, settings }
  }, [drawingMode, spotlightMode, mousePos, settings])

  // Compositor Loop
  const composite = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    const screenVideo = screenVideoRef.current
    const camVideo = camVideoRef.current
    const annCanvas = annotationCanvasRef.current
    const { spotlightMode, mousePos, settings } = drawingStateRef.current

    if (!canvas || !ctx || !screenVideo) return

    // Draw Screen
    ctx.drawImage(screenVideo, 0, 0, canvas.width, canvas.height)

    // Draw Spotlight
    if (spotlightMode) {
      ctx.save()
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
      ctx.beginPath()
      ctx.rect(0, 0, canvas.width, canvas.height)
      ctx.arc(mousePos.x, mousePos.y, 180, 0, Math.PI * 2, true)
      ctx.fill()
      ctx.restore()
    }

    // Draw Webcam Overlay
    if (settings.webcam && camVideo && camVideo.readyState >= 2) {
      const sizeMap = { small: 240, medium: 400, large: 600 }
      const camW = sizeMap[settings.webcamSize]
      const camH = (camW / 16) * 9
      const margin = 40
      
      let x = margin
      let y = margin
      
      if (settings.webcamPosition.includes('right')) x = canvas.width - camW - margin
      if (settings.webcamPosition.includes('bottom')) y = canvas.height - camH - margin

      ctx.save()
      // Draw border/shadow
      ctx.shadowBlur = 30
      ctx.shadowColor = 'rgba(0,0,0,0.5)'
      ctx.strokeStyle = '#F97316'
      ctx.lineWidth = 6
      
      // Round rect clip
      ctx.beginPath()
      ctx.roundRect(x, y, camW, camH, 24)
      ctx.stroke()
      ctx.clip()
      ctx.drawImage(camVideo, x, y, camW, camH)
      ctx.restore()
    }

    // Draw Annotations
    if (annCanvas) {
      ctx.drawImage(annCanvas, 0, 0, canvas.width, canvas.height)
    }

    animationFrameRef.current = requestAnimationFrame(composite)
  }, [])

  const startRecording = async () => {
    try {
      setErrorMsg('')
      
      // 1. Get Screen Stream
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: settings.resolution === '4k' ? 3840 : settings.resolution === '1080p' ? 1920 : 1280 },
          height: { ideal: settings.resolution === '4k' ? 2160 : settings.resolution === '1080p' ? 1080 : 720 },
          frameRate: { ideal: settings.fps }
        },
        audio: settings.systemAudio
      })
      screenStreamRef.current = screenStream

      // 2. Get Mic Stream
      if (settings.mic) {
        try {
          const micStream = await navigator.mediaDevices.getUserMedia({
            audio: {
              deviceId: settings.micDeviceId,
              echoCancellation: true,
              noiseSuppression: true
            }
          })
          micStreamRef.current = micStream
        } catch (err) {
          console.warn("Mic access denied", err)
        }
      }

      // 3. Get Webcam Stream
      if (settings.webcam) {
        try {
          const camStream = await navigator.mediaDevices.getUserMedia({
            video: true
          })
          camStreamRef.current = camStream
        } catch (err) {
          console.warn("Webcam access denied", err)
        }
      }

      // 4. Setup Compositor
      const video = document.createElement('video')
      video.srcObject = screenStream
      await new Promise((r) => {
        video.onloadedmetadata = r
        video.play()
      })
      screenVideoRef.current = video

      if (camStreamRef.current) {
        const camVideo = document.createElement('video')
        camVideo.srcObject = camStreamRef.current
        await new Promise((r) => {
          camVideo.onloadedmetadata = r
          camVideo.play()
        })
        camVideoRef.current = camVideo
      }

      const canvas = canvasRef.current!
      const trackSettings = screenStream.getVideoTracks()[0].getSettings()
      canvas.width = trackSettings.width || 1920
      canvas.height = trackSettings.height || 1080

      // 5. Start Countdown
      if (settings.countdown > 0) {
        setStatus('countdown')
        setCountdown(settings.countdown)
        const countInt = setInterval(() => {
          setCountdown(c => {
            if (c <= 1) {
              clearInterval(countInt)
              beginCapture()
              return 0
            }
            return c - 1
          })
        }, 1000)
      } else {
        beginCapture()
      }

    } catch (err: any) {
      console.error(err)
      setErrorMsg(err.message || 'Permission denied')
      setStatus('idle')
    }
  }

  const beginCapture = () => {
    const canvas = canvasRef.current!
    const canvasStream = canvas.captureStream(settings.fps)
    
    // Mix Audio using AudioContext (CRITICAL for multi-source recording)
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
    const destination = audioCtx.createMediaStreamDestination()
    let hasAudio = false

    if (screenStreamRef.current?.getAudioTracks().length) {
      const source = audioCtx.createMediaStreamSource(new MediaStream([screenStreamRef.current.getAudioTracks()[0]]))
      source.connect(destination)
      hasAudio = true
    }
    if (micStreamRef.current?.getAudioTracks().length) {
      const source = audioCtx.createMediaStreamSource(new MediaStream([micStreamRef.current.getAudioTracks()[0]]))
      source.connect(destination)
      hasAudio = true
    }

    const audioTracks = hasAudio ? destination.stream.getAudioTracks() : []

    const combinedStream = new MediaStream([
      ...canvasStream.getVideoTracks(),
      ...audioTracks
    ])

    const recorder = new MediaRecorder(combinedStream, {
      mimeType: getSupportedMimeType(),
      videoBitsPerSecond: 5000000 // 5Mbps for high quality
    })

    recorder.onerror = (e) => {
      console.error("MediaRecorder Error:", e)
      setStatus('error')
      setErrorMsg("Recording failed: " + (e as any).error?.name)
    }

    chunksRef.current = []
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data)
    }

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' })
      setRecordedBlob(blob)
      setRecordedUrl(URL.createObjectURL(blob))
      setStatus('done')
      
      // Cleanup streams
      screenStreamRef.current?.getTracks().forEach(t => t.stop())
      micStreamRef.current?.getTracks().forEach(t => t.stop())
      camStreamRef.current?.getTracks().forEach(t => t.stop())
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
    }

    mediaRecorderRef.current = recorder
    recorder.start(1000)
    setStatus('recording')
    setDuration(0)
    composite()
  }

  const stopRecording = () => {
    mediaRecorderRef.current?.stop()
  }

  const togglePause = () => {
    if (status === 'recording') {
      mediaRecorderRef.current?.pause()
      setStatus('paused')
    } else if (status === 'paused') {
      mediaRecorderRef.current?.resume()
      setStatus('recording')
    }
  }

  // Drawing logic
  const startDrawing = (e: React.MouseEvent) => {
    if (!drawingMode) return
    const canvas = annotationCanvasRef.current
    const visibleCanvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx || !visibleCanvas) return

    const scaleX = canvas.width / visibleCanvas.clientWidth
    const scaleY = canvas.height / visibleCanvas.clientHeight

    ctx.strokeStyle = '#F97316'
    ctx.lineWidth = 5
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(e.nativeEvent.offsetX * scaleX, e.nativeEvent.offsetY * scaleY)
    
    const move = (me: MouseEvent) => {
       ctx.lineTo(me.offsetX * scaleX, me.offsetY * scaleY)
       ctx.stroke()
    }
    const up = () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseup', up)
    }
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', up)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    const canvas = annotationCanvasRef.current
    const visibleCanvas = canvasRef.current
    if (!canvas || !visibleCanvas) return
    const scaleX = canvas.width / visibleCanvas.clientWidth
    const scaleY = canvas.height / visibleCanvas.clientHeight
    setMousePos({ x: e.nativeEvent.offsetX * scaleX, y: e.nativeEvent.offsetY * scaleY })
  }

  const convertToMP4 = async () => {
    if (!recordedBlob || !ffmpegRef.current) return
    setIsConverting(true)
    setConvertProgress(0)

    const ffmpeg = ffmpegRef.current
    const inputName = 'input.webm'
    const outputName = 'output.mp4'

    await ffmpeg.writeFile(inputName, await fetchFile(recordedBlob))

    ffmpeg.on('progress', ({ progress }) => {
      setConvertProgress(Math.round(progress * 100))
    })

    // WebM to MP4 re-encode
    await ffmpeg.exec(['-i', inputName, '-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '22', '-c:a', 'aac', outputName])

    const data = await ffmpeg.readFile(outputName)
    const blob = new Blob([data as any], { type: 'video/mp4' })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `screen_recording_${Date.now()}.mp4`
    link.click()

    setIsConverting(false)
  }

  return (
    <div className="space-y-12">
      {status === 'idle' && (
        <div className="grid lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
           {/* Settings Panel */}
           <div className="lg:col-span-8 bg-card rounded-[2.5rem] border border-border shadow-2xl p-10 space-y-10">
              <div className="flex items-center gap-4 border-b border-border pb-6">
                 <div className="w-14 h-14 bg-brand-orange/10 rounded-2xl flex items-center justify-center">
                    <Settings className="size-8 text-brand-orange" />
                 </div>
                 <div>
                    <h2 className="text-3xl font-bold font-syne">Recording Settings</h2>
                    <p className="text-muted-foreground">Configure your capture source and devices</p>
                 </div>
              </div>

              <div className="grid md:grid-cols-2 gap-10">
                 {/* Video Source */}
                 <div className="space-y-6">
                    <div className="space-y-3">
                       <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                          <Monitor className="size-4" /> Capture Source
                       </h3>
                       <div className="grid grid-cols-1 gap-3">
                          {[
                            { id: 'screen', label: 'Entire Screen', icon: '🖥️' },
                            { id: 'window', label: 'Application Window', icon: '🪟' },
                            { id: 'tab', label: 'Browser Tab', icon: '📑' }
                          ].map(src => (
                            <button 
                              key={src.id}
                              onClick={() => setSettings(p => ({ ...p, source: src.id as any }))}
                              className={cn(
                                "flex items-center gap-4 p-4 rounded-2xl border transition-all text-left",
                                settings.source === src.id ? "bg-brand-orange/5 border-brand-orange shadow-lg" : "bg-muted/30 border-border hover:bg-muted"
                              )}
                            >
                               <span className="text-2xl">{src.icon}</span>
                               <div>
                                  <p className="font-bold">{src.label}</p>
                                  <p className="text-[10px] text-muted-foreground uppercase font-black">Native Browser Picker</p>
                               </div>
                            </button>
                          ))}
                       </div>
                    </div>

                    <div className="space-y-4 pt-6 border-t border-border">
                       <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                          <Volume2 className="size-4" /> Audio Options
                       </h3>
                       <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-muted/20 rounded-2xl border border-border">
                             <div className="flex items-center gap-3">
                                <Monitor className="size-4 text-brand-orange" />
                                <span className="font-bold">System Audio</span>
                             </div>
                             <Switch checked={settings.systemAudio} onCheckedChange={(c) => setSettings(p => ({ ...p, systemAudio: c }))} />
                          </div>
                          <div className="flex items-center justify-between p-4 bg-muted/20 rounded-2xl border border-border">
                             <div className="flex items-center gap-3">
                                <Mic className="size-4 text-brand-orange" />
                                <span className="font-bold">Microphone</span>
                             </div>
                             <Switch checked={settings.mic} onCheckedChange={(c) => setSettings(p => ({ ...p, mic: c }))} />
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* Webcam & Quality */}
                 <div className="space-y-6">
                    <div className="space-y-4">
                       <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                          <Camera className="size-4" /> Webcam Overlay
                       </h3>
                       <div className="p-6 bg-muted/20 rounded-3xl border border-border space-y-6">
                          <div className="flex items-center justify-between">
                             <span className="font-bold">Show Webcam Overlay</span>
                             <Switch checked={settings.webcam} onCheckedChange={(c) => setSettings(p => ({ ...p, webcam: c }))} />
                          </div>
                          
                          {settings.webcam && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                               <div className="space-y-2">
                                  <label className="text-[10px] font-black uppercase text-muted-foreground">Position</label>
                                  <div className="grid grid-cols-2 gap-2">
                                     {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map(pos => (
                                       <button 
                                         key={pos}
                                         onClick={() => setSettings(p => ({ ...p, webcamPosition: pos as any }))}
                                         className={cn(
                                           "py-2 rounded-xl text-[10px] font-bold border transition-all uppercase",
                                           settings.webcamPosition === pos ? "bg-brand-orange text-white border-brand-orange" : "bg-card border-border hover:border-brand-orange/30"
                                         )}
                                       >
                                         {pos.replace('-', ' ')}
                                       </button>
                                     ))}
                                  </div>
                               </div>
                               <div className="space-y-2">
                                  <label className="text-[10px] font-black uppercase text-muted-foreground">Size</label>
                                  <div className="grid grid-cols-3 gap-2">
                                     {['small', 'medium', 'large'].map(sz => (
                                       <button 
                                         key={sz}
                                         onClick={() => setSettings(p => ({ ...p, webcamSize: sz as any }))}
                                         className={cn(
                                           "py-2 rounded-xl text-[10px] font-bold border transition-all uppercase",
                                           settings.webcamSize === sz ? "bg-brand-orange text-white border-brand-orange" : "bg-card border-border hover:border-brand-orange/30"
                                         )}
                                       >
                                         {sz}
                                       </button>
                                     ))}
                                  </div>
                               </div>
                            </div>
                          )}
                       </div>
                    </div>

                    <div className="space-y-4 pt-6 border-t border-border">
                       <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                          <Layers className="size-4" /> Quality & Countdown
                       </h3>
                       <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase text-muted-foreground">Resolution</label>
                             <select 
                               value={settings.resolution}
                               onChange={(e) => setSettings(p => ({ ...p, resolution: e.target.value as any }))}
                               className="w-full bg-muted/50 border border-border rounded-xl h-10 px-3 text-sm font-bold outline-none focus:border-brand-orange"
                             >
                                <option value="720p">720p (HD)</option>
                                <option value="1080p">1080p (Full HD)</option>
                                <option value="4k">4K (Ultra HD)</option>
                             </select>
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase text-muted-foreground">Countdown</label>
                             <select 
                               value={settings.countdown}
                               onChange={(e) => setSettings(p => ({ ...p, countdown: parseInt(e.target.value) }))}
                               className="w-full bg-muted/50 border border-border rounded-xl h-10 px-3 text-sm font-bold outline-none focus:border-brand-orange"
                             >
                                <option value="0">No Countdown</option>
                                <option value="3">3 Seconds</option>
                                <option value="5">5 Seconds</option>
                                <option value="10">10 Seconds</option>
                             </select>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>

              {errorMsg && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500 text-sm font-bold animate-in shake duration-500">
                   <AlertTriangle className="size-5" />
                   {errorMsg}
                </div>
              )}

              <Button 
                onClick={startRecording}
                className="w-full bg-brand-orange hover:bg-brand-orange/90 text-white h-20 rounded-full text-2xl font-black shadow-2xl shadow-brand-orange/30 group"
              >
                 <Circle className="mr-3 size-6 fill-white animate-pulse" />
                 Start Recording
              </Button>
           </div>

           {/* Tips / Sidebar */}
           <div className="lg:col-span-4 space-y-6">
              <div className="bg-card rounded-[2.5rem] border border-border p-8 shadow-xl">
                 <h3 className="text-xl font-bold font-syne mb-4 flex items-center gap-2">
                    <Info className="size-5 text-brand-orange" /> Pro Tips
                 </h3>
                 <ul className="space-y-4">
                    <li className="flex gap-3">
                       <ChevronRight className="size-4 text-brand-orange shrink-0 mt-1" />
                       <p className="text-sm text-muted-foreground font-medium">Capture system audio on Chrome (Windows/Linux) by checking the "Share audio" box in the picker.</p>
                    </li>
                    <li className="flex gap-3">
                       <ChevronRight className="size-4 text-brand-orange shrink-0 mt-1" />
                       <p className="text-sm text-muted-foreground font-medium">Use 1080p for clear tutorials and 4K for high-end creative work.</p>
                    </li>
                    <li className="flex gap-3">
                       <ChevronRight className="size-4 text-brand-orange shrink-0 mt-1" />
                       <p className="text-sm text-muted-foreground font-medium">Draw on screen using the pen tool after recording starts to highlight features.</p>
                    </li>
                 </ul>
              </div>
           </div>
        </div>
      )}

      {/* Countdown Overlay */}
      {status === 'countdown' && (
        <div className="fixed inset-0 z-[100] bg-brand-navy/95 flex flex-col items-center justify-center text-white backdrop-blur-xl">
           <p className="text-2xl font-bold font-syne mb-8 uppercase tracking-[0.5em] animate-pulse">Get Ready</p>
           <div className="text-[12rem] font-black leading-none font-syne animate-in zoom-in duration-500">
              {countdown}
           </div>
           <div className="mt-12 text-zinc-400 font-bold uppercase tracking-widest text-sm">Recording Screen in Browser</div>
        </div>
      )}

      {/* Recording UI */}
      <div className={cn("space-y-8 animate-in fade-in duration-500", (status !== 'recording' && status !== 'paused') && "hidden")}>
           {/* Compositor Canvas (Visible for drawing) */}
           <div className="max-w-5xl mx-auto relative rounded-[3rem] overflow-hidden border-8 border-brand-orange shadow-2xl bg-black">
              <canvas 
                ref={canvasRef} 
                className="w-full h-auto aspect-video cursor-crosshair"
                onMouseDown={startDrawing}
                onMouseMove={handleMouseMove}
              />
              {/* Invisible Overlay for mouse events if not drawing */}
              <canvas 
                ref={annotationCanvasRef} 
                className="hidden" 
                width={1920} 
                height={1080}
              />

              {/* Status Badge */}
              <div className="absolute top-8 left-8 flex items-center gap-3">
                 <div className="bg-black/60 backdrop-blur-md px-6 py-3 rounded-full flex items-center gap-4 border border-white/10">
                    <div className={cn("w-3 h-3 rounded-full bg-red-500", status === 'recording' && "animate-pulse")} />
                    <span className="text-white font-black font-mono text-xl">{formatTime(duration)}</span>
                 </div>
                 {status === 'paused' && (
                    <Badge className="bg-brand-orange text-white px-4 py-2 text-sm font-bold animate-in bounce duration-500">PAUSED</Badge>
                 )}
              </div>

              {/* Floating Toolbar */}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/80 backdrop-blur-2xl p-3 rounded-[2.5rem] border border-white/10 shadow-2xl">
                 <div className="flex items-center gap-1 px-3 border-r border-white/10">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className={cn("rounded-full", drawingMode ? "bg-brand-orange text-white" : "text-white hover:bg-white/10")}
                      onClick={() => setDrawingMode(!drawingMode)}
                    >
                       <PenTool className="size-5" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className={cn("rounded-full", spotlightMode ? "bg-brand-orange text-white" : "text-white hover:bg-white/10")}
                      onClick={() => setSpotlightMode(!spotlightMode)}
                    >
                       <MousePointer2 className="size-5" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="rounded-full text-white hover:bg-white/10"
                      onClick={() => {
                        const ctx = annotationCanvasRef.current?.getContext('2d')
                        if (ctx) ctx.clearRect(0, 0, 1920, 1080)
                      }}
                    >
                       <Trash2 className="size-5" />
                    </Button>
                 </div>
                 
                 <div className="flex items-center gap-2 px-2">
                    <Button variant="ghost" className="text-white rounded-full hover:bg-white/10 font-bold" onClick={togglePause}>
                       {status === 'paused' ? <Play className="size-5 mr-2" /> : <Pause className="size-5 mr-2" />}
                       {status === 'paused' ? 'Resume' : 'Pause'}
                    </Button>
                    <Button className="bg-red-500 hover:bg-red-600 text-white rounded-full px-8 h-12 font-black shadow-lg shadow-red-500/30" onClick={stopRecording}>
                       <Square className="size-4 mr-2 fill-white" /> Stop
                    </Button>
                 </div>
              </div>
           </div>

           <div className="text-center">
              <p className="text-sm font-black text-muted-foreground uppercase tracking-widest flex items-center justify-center gap-3">
                 <Info className="size-4 text-brand-orange" />
                 Currently recording at {settings.resolution} • {settings.fps} FPS
              </p>
           </div>
        </div>

      {/* Results View */}
      {status === 'done' && recordedUrl && (
        <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-12 duration-1000">
           <div className="bg-card rounded-[3rem] border border-border shadow-2xl overflow-hidden">
              <div className="bg-green-500/5 p-10 border-b border-border flex items-center gap-6 text-green-600">
                 <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white shadow-xl shadow-green-500/20">
                   <CheckCircle2 className="size-10" />
                 </div>
                 <div>
                   <h3 className="text-3xl font-bold font-syne">Recording Complete!</h3>
                   <p className="text-muted-foreground">Your video is ready to be saved.</p>
                 </div>
              </div>

              <div className="p-10 grid lg:grid-cols-2 gap-10">
                 <div className="space-y-6">
                    <div className="bg-muted/30 rounded-3xl p-4 border border-border shadow-inner relative group flex items-center justify-center aspect-video overflow-hidden">
                       <video src={recordedUrl} controls className="w-full rounded-2xl shadow-2xl transition-transform group-hover:scale-[1.01]" />
                    </div>
                 </div>

                 <div className="space-y-8 flex flex-col justify-center">
                    <div className="grid grid-cols-2 gap-4">
                       <div className="bg-muted/50 p-6 rounded-3xl border border-border">
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Duration</p>
                          <p className="text-2xl font-bold font-syne">{formatTime(duration)}</p>
                       </div>
                       <div className="bg-muted/50 p-6 rounded-3xl border border-border">
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">File Size</p>
                          <p className="text-2xl font-bold font-syne">{(recordedBlob!.size / (1024 * 1024)).toFixed(1)} MB</p>
                       </div>
                    </div>

                    <div className="space-y-4">
                       <div className="flex gap-2">
                          <Button 
                            onClick={() => {
                              const link = document.createElement('a')
                              link.href = recordedUrl
                              link.download = `screen_recording_${Date.now()}.webm`
                              link.click()
                            }}
                            className="flex-1 bg-zinc-900 dark:bg-white dark:text-zinc-900 h-16 rounded-2xl text-lg font-black"
                          >
                             Download WebM
                          </Button>
                          <Button 
                            onClick={convertToMP4}
                            disabled={!ffmpegReady || isConverting}
                            className="flex-1 bg-brand-orange hover:bg-brand-orange/90 text-white h-16 rounded-2xl text-lg font-black"
                          >
                             {isConverting ? <Loader2 className="size-6 animate-spin" /> : 'Convert to MP4'}
                          </Button>
                       </div>

                       {isConverting && (
                         <div className="space-y-2">
                            <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                               <span>Converting to MP4...</span>
                               <span>{convertProgress}%</span>
                            </div>
                            <Progress value={convertProgress} className="h-2" />
                         </div>
                       )}

                       <Button variant="outline" className="w-full h-14 rounded-2xl font-bold" onClick={() => { setStatus('idle'); setRecordedBlob(null); setRecordedUrl(null); }}>
                         <RotateCcw className="size-4 mr-2" /> Record Again
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
