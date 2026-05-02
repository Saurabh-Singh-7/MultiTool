"use client"

import React, { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { ChevronRight, Upload, Download, Copy, Trash2, ShieldAlert, Map, Camera, FileText, CheckCircle2, AlertTriangle, Info, MapPin, ShieldCheck, Shield, RefreshCw, Settings2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import exifr from 'exifr'

interface MetadataState {
  raw: any
  basic: any
  camera: any
  gps: any
  copyright: any
}

export default function ImageMetadataClient() {
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>("")
  const [metadata, setMetadata] = useState<MetadataState | null>(null)
  
  const [isProcessing, setIsProcessing] = useState(false)
  const [cleanUrl, setCleanUrl] = useState<string>("")
  
  const [isDragging, setIsDragging] = useState(false)
  const [toastMsg, setToastMsg] = useState("")
  const [showRaw, setShowRaw] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (toastMsg) {
      const t = setTimeout(() => setToastMsg(""), 3000)
      return () => clearTimeout(t)
    }
  }, [toastMsg])

  const showToast = (msg: string) => setToastMsg(msg)

  const handleFiles = async (files: FileList | null) => {
    if (!files || !files.length) return
    const f = files[0]
    if (!f.type.startsWith('image/')) {
      showToast("⚠ Please upload an image file")
      return
    }
    if (f.size > 50 * 1024 * 1024) {
      showToast("⚠ File is too large. Max 50MB.")
      return
    }

    const url = URL.createObjectURL(f)
    setFile(f)
    setPreviewUrl(url)
    setCleanUrl("")
    setMetadata(null)
    setShowRaw(false)
    
    setIsProcessing(true)
    try {
      // Parse metadata
      const rawData = await exifr.parse(f, {
        tiff: true,
        exif: true,
        gps: true,
        iptc: true,
        xmp: true,
        icc: true,
        jfif: true,
        ihdr: true,
      })

      if (!rawData) {
        setMetadata({ raw: {}, basic: {}, camera: {}, gps: {}, copyright: {} })
        setIsProcessing(false)
        return
      }

      // Group data
      const basic = {
        "Filename": f.name,
        "File Size": formatBytes(f.size),
        "File Type": f.type,
        "Image Width": rawData.ImageWidth || rawData.PixelXDimension || "Unknown",
        "Image Height": rawData.ImageHeight || rawData.PixelYDimension || "Unknown",
        "Color Space": rawData.ColorSpace === 1 ? "sRGB" : rawData.ColorSpace === 2 ? "Adobe RGB" : rawData.ColorSpace || "Unknown",
        "Orientation": rawData.Orientation || "Normal"
      }

      const camera = {} as any
      if (rawData.Make) camera["Camera Make"] = rawData.Make
      if (rawData.Model) camera["Camera Model"] = rawData.Model
      if (rawData.LensModel) camera["Lens"] = rawData.LensModel
      if (rawData.Software) camera["Software"] = rawData.Software
      if (rawData.DateTimeOriginal) camera["Date Taken"] = new Date(rawData.DateTimeOriginal).toLocaleString()
      if (rawData.ExposureTime) {
        const exp = rawData.ExposureTime
        camera["Exposure"] = exp < 1 ? `1/${Math.round(1/exp)}s` : `${exp}s`
      }
      if (rawData.FNumber) camera["Aperture"] = `f/${rawData.FNumber}`
      if (rawData.ISO) camera["ISO"] = rawData.ISO
      if (rawData.FocalLength) camera["Focal Length"] = `${rawData.FocalLength}mm`
      if (rawData.FocalLengthIn35mmFormat) camera["Focal Length (35mm eq.)"] = `${rawData.FocalLengthIn35mmFormat}mm`
      if (rawData.Flash !== undefined) camera["Flash"] = rawData.Flash

      const gps = {} as any
      if (rawData.latitude && rawData.longitude) {
        gps["Latitude"] = rawData.latitude
        gps["Longitude"] = rawData.longitude
      }
      if (rawData.GPSAltitude) gps["Altitude"] = `${rawData.GPSAltitude}m`

      const copyright = {} as any
      if (rawData.Artist || rawData.creator) copyright["Author/Artist"] = rawData.Artist || rawData.creator
      if (rawData.Copyright || rawData.rights) copyright["Copyright"] = rawData.Copyright || rawData.rights
      if (rawData.ImageDescription || rawData.description) copyright["Description"] = rawData.ImageDescription || rawData.description

      setMetadata({
        raw: rawData,
        basic,
        camera,
        gps,
        copyright
      })

    } catch (e) {
      console.error(e)
      setMetadata({ raw: {}, basic: {}, camera: {}, gps: {}, copyright: {} })
    } finally {
      setIsProcessing(false)
    }
  }

  const removeMetadata = () => {
    if (!file || !previewUrl) return
    setIsProcessing(true)
    
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(img, 0, 0)
        // Output as jpeg/png to strip metadata
        const format = file.type === 'image/png' ? 'image/png' : 'image/jpeg'
        canvas.toBlob((blob) => {
          if (blob) {
            setCleanUrl(URL.createObjectURL(blob))
            showToast("✓ All metadata removed successfully!")
          }
          setIsProcessing(false)
        }, format, 0.95)
      }
    }
    img.src = previewUrl
  }

  const downloadCleanImage = () => {
    if (!cleanUrl || !file) return
    const a = document.createElement('a')
    a.href = cleanUrl
    const baseName = file.name.replace(/\.[^/.]+$/, "")
    const ext = file.type === 'image/png' ? 'png' : 'jpg'
    a.download = `${baseName}_clean.${ext}`
    a.click()
  }

  const copyAsText = () => {
    if (!metadata) return
    let text = "--- IMAGE METADATA ---\n\n"
    const addSection = (title: string, obj: any) => {
      if (Object.keys(obj).length === 0) return
      text += `[ ${title} ]\n`
      for (const [key, value] of Object.entries(obj)) {
        text += `${key}: ${value}\n`
      }
      text += "\n"
    }
    addSection("FILE INFO", metadata.basic)
    addSection("CAMERA INFO", metadata.camera)
    addSection("GPS LOCATION", metadata.gps)
    addSection("COPYRIGHT", metadata.copyright)
    
    navigator.clipboard.writeText(text)
    showToast("✓ Copied to clipboard")
  }

  const exportJSON = () => {
    if (!metadata) return
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(metadata.raw, null, 2))
    const a = document.createElement('a')
    a.href = dataStr
    a.download = "metadata.json"
    a.click()
  }

  const exportCSV = () => {
    if (!metadata) return
    let csv = "Key,Value\n"
    for (const [key, value] of Object.entries(metadata.raw)) {
      if (typeof value !== 'object') {
        const cleanVal = String(value).replace(/"/g, '""')
        csv += `"${key}","${cleanVal}"\n`
      }
    }
    const dataStr = "data:text/csv;charset=utf-8," + encodeURIComponent(csv)
    const a = document.createElement('a')
    a.href = dataStr
    a.download = "metadata.csv"
    a.click()
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B"
    const k = 1024, sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
  }

  // Calculate privacy risk
  let riskLevel = 'low'
  let riskTitle = 'Low Risk'
  let riskDesc = 'No sensitive data found.'
  let riskIcon = <ShieldCheck className="size-6 text-green-500" />
  let riskColor = 'border-green-500/20 bg-green-500/10 text-green-600 dark:text-green-400'

  if (metadata) {
    const hasGps = Object.keys(metadata.gps).length > 0
    const hasCamera = Object.keys(metadata.camera).length > 0

    if (hasGps) {
      riskLevel = 'high'
      riskTitle = 'High Risk'
      riskDesc = 'GPS location data is embedded. Anyone can see where this photo was taken.'
      riskIcon = <ShieldAlert className="size-6 text-red-500" />
      riskColor = 'border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400'
    } else if (hasCamera) {
      riskLevel = 'medium'
      riskTitle = 'Medium Risk'
      riskDesc = 'Camera make/model and timestamps are visible.'
      riskIcon = <Shield className="size-6 text-amber-500" />
      riskColor = 'border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400'
    }
  }

  const metaCount = metadata ? Object.keys(metadata.raw).length : 0

  return (
    <>
      {toastMsg && (
        <div className="fixed bottom-4 right-4 z-50 animate-in fade-in slide-in-from-bottom-4 flex items-center gap-2 bg-card border border-border shadow-lg rounded-lg px-4 py-3">
          {toastMsg.startsWith('✓') ? <CheckCircle2 className="size-5 text-green-500" /> : <AlertTriangle className="size-5 text-amber-500" />}
          <span className="text-sm font-medium">{toastMsg.replace(/^[✓⚠]\s*/, '')}</span>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight className="size-3.5" />
          <Link href="/#image-tools" className="hover:text-foreground transition-colors">Image Tools</Link>
          <ChevronRight className="size-3.5" />
          <span className="text-foreground font-medium">EXIF Viewer</span>
        </nav>

        <div className="mb-8 text-center max-w-3xl mx-auto">
          <h1 className="font-heading text-3xl font-bold sm:text-4xl sm:leading-[1.1] mb-3">
            Image Metadata Viewer — <span className="text-gradient">EXIF Reader</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            View hidden camera settings, GPS location, and remove metadata for privacy. 100% private, no server upload.
          </p>
        </div>

        {!previewUrl ? (
          <div className="max-w-3xl mx-auto animate-in fade-in zoom-in-95">
            <div 
              className={`rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer overflow-hidden ${isDragging ? "border-brand-orange bg-brand-orange/5 scale-[1.01]" : "border-border hover:border-brand-orange/50 hover:bg-muted/50 bg-card"}`}
              style={{ minHeight: '300px' }}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files) }}
              onClick={() => fileInputRef.current?.click()}
            >
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/tiff,image/heic" className="hidden" onChange={(e) => handleFiles(e.target.files)} />
              <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <div className="mb-6 flex size-20 items-center justify-center rounded-3xl bg-brand-orange/10 text-brand-orange">
                  <FileText className="size-10" />
                </div>
                <h3 className="font-heading text-xl font-bold mb-2">Upload Image to View EXIF</h3>
                <p className="text-muted-foreground mb-4">Click to browse or drag and drop</p>
                <div className="text-xs text-muted-foreground bg-background px-3 py-1.5 rounded-full border border-border">
                  JPG, PNG, WebP, HEIC, TIFF up to 50MB
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-8 animate-in fade-in">
            
            {/* LEFT: Image & Actions */}
            <div className="space-y-5">
              
              <div className="rounded-xl border border-border bg-card p-4 text-center">
                <img src={previewUrl} alt="Preview" className="max-w-full max-h-[300px] object-contain rounded shadow-sm mx-auto mb-4" />
                <div className="flex justify-center">
                  <button onClick={() => { setPreviewUrl(""); setMetadata(null); setCleanUrl("") }} className="text-xs text-brand-orange hover:underline font-bold">
                    Choose Another Image
                  </button>
                </div>
              </div>

              {metadata && (
                <>
                  {/* Privacy Risk */}
                  <div className={`rounded-xl border p-5 flex gap-4 items-start ${riskColor}`}>
                    <div className="mt-0.5">{riskIcon}</div>
                    <div>
                      <h4 className="font-bold text-sm mb-1">{riskTitle}</h4>
                      <p className="text-xs opacity-90">{riskDesc}</p>
                    </div>
                  </div>

                  {/* Remove Action */}
                  <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-border bg-muted/30">
                      <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-muted-foreground">Privacy Tool</h3>
                    </div>
                    <div className="p-5 space-y-4">
                      {cleanUrl ? (
                        <div className="space-y-4 animate-in fade-in zoom-in-95">
                          <div className="flex items-center gap-2 text-sm font-bold text-green-500">
                            <CheckCircle2 className="size-4" /> Metadata successfully stripped
                          </div>
                          <div className="text-xs text-muted-foreground bg-muted p-3 rounded-lg font-mono">
                            Before: {metaCount} fields<br/>
                            After: 0 fields
                          </div>
                          <Button onClick={downloadCleanImage} className="w-full bg-brand-orange hover:bg-brand-orange-hover text-white">
                            <Download className="size-4 mr-2" /> Download Clean Image
                          </Button>
                        </div>
                      ) : (
                        <>
                          <p className="text-sm text-muted-foreground">Remove all EXIF tags, GPS location, and camera data to safely share this image.</p>
                          <Button onClick={removeMetadata} disabled={isProcessing || metaCount === 0} className="w-full" variant={metaCount > 0 ? "destructive" : "secondary"}>
                            <Trash2 className="size-4 mr-2" /> {metaCount > 0 ? "Remove All Metadata" : "No Metadata to Remove"}
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {/* Export Actions */}
                  <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-border bg-muted/30">
                      <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-muted-foreground">Export Data</h3>
                    </div>
                    <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <Button variant="outline" size="sm" onClick={copyAsText} className="text-xs" disabled={metaCount === 0}>
                        <Copy className="size-3.5 mr-2" /> Copy Text
                      </Button>
                      <Button variant="outline" size="sm" onClick={exportJSON} className="text-xs" disabled={metaCount === 0}>
                        <Download className="size-3.5 mr-2" /> Export JSON
                      </Button>
                      <Button variant="outline" size="sm" onClick={exportCSV} className="text-xs sm:col-span-2" disabled={metaCount === 0}>
                        <Download className="size-3.5 mr-2" /> Export CSV
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* RIGHT: Data Viewer */}
            <div className="space-y-5 min-w-0">
              
              {!metadata && isProcessing && (
                <div className="rounded-xl border border-border bg-card p-12 text-center flex flex-col items-center justify-center">
                  <RefreshCw className="size-8 text-brand-orange animate-spin mb-4" />
                  <p className="font-medium">Extracting EXIF data...</p>
                </div>
              )}

              {metadata && metaCount === 0 && !isProcessing && (
                <div className="rounded-xl border border-border bg-card p-12 text-center flex flex-col items-center justify-center">
                  <Info className="size-12 text-muted-foreground mb-4" />
                  <h3 className="font-heading font-bold text-xl mb-2">No Metadata Found</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    This image has been stripped of its EXIF data. This commonly happens when images are downloaded from social media platforms or compressed by other tools.
                  </p>
                </div>
              )}

              {metadata && metaCount > 0 && (
                <div className="space-y-6">
                  
                  {/* Basic Info */}
                  <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-border bg-muted/30 flex items-center gap-2">
                      <FileText className="size-4 text-muted-foreground" />
                      <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-muted-foreground">File Information</h3>
                    </div>
                    <div className="p-0">
                      <table className="w-full text-sm text-left">
                        <tbody className="divide-y divide-border">
                          {Object.entries(metadata.basic).map(([k, v]) => (
                            <tr key={k} className="hover:bg-muted/50">
                              <th className="py-3 px-5 font-medium text-muted-foreground w-1/3 bg-muted/10">{k}</th>
                              <td className="py-3 px-5 font-mono">{String(v)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* GPS Location */}
                  {Object.keys(metadata.gps).length > 0 && (
                    <div className="rounded-xl border border-red-500/30 bg-card shadow-sm overflow-hidden">
                      <div className="p-4 border-b border-red-500/20 bg-red-500/5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MapPin className="size-4 text-red-500" />
                          <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-red-500">GPS Location</h3>
                        </div>
                        <a 
                          href={`https://maps.google.com/?q=${metadata.gps.Latitude},${metadata.gps.Longitude}`}
                          target="_blank" rel="noopener noreferrer"
                          className="text-xs font-bold bg-red-500 text-white px-3 py-1.5 rounded hover:bg-red-600 transition-colors flex items-center gap-1.5"
                        >
                          <Map className="size-3.5" /> View on Map
                        </a>
                      </div>
                      <div className="p-0">
                        <table className="w-full text-sm text-left">
                          <tbody className="divide-y divide-border">
                            {Object.entries(metadata.gps).map(([k, v]) => (
                              <tr key={k} className="hover:bg-muted/50">
                                <th className="py-3 px-5 font-medium text-muted-foreground w-1/3 bg-muted/10">{k}</th>
                                <td className="py-3 px-5 font-mono text-red-500 dark:text-red-400 font-bold">{String(v)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Camera Info */}
                  {Object.keys(metadata.camera).length > 0 && (
                    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                      <div className="p-4 border-b border-border bg-muted/30 flex items-center gap-2">
                        <Camera className="size-4 text-muted-foreground" />
                        <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-muted-foreground">Camera Settings</h3>
                      </div>
                      <div className="p-0">
                        <table className="w-full text-sm text-left">
                          <tbody className="divide-y divide-border">
                            {Object.entries(metadata.camera).map(([k, v]) => (
                              <tr key={k} className="hover:bg-muted/50">
                                <th className="py-3 px-5 font-medium text-muted-foreground w-1/3 bg-muted/10">{k}</th>
                                <td className="py-3 px-5 font-mono">{String(v)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Copyright Info */}
                  {Object.keys(metadata.copyright).length > 0 && (
                    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                      <div className="p-4 border-b border-border bg-muted/30 flex items-center gap-2">
                        <Info className="size-4 text-muted-foreground" />
                        <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-muted-foreground">Copyright & Author</h3>
                      </div>
                      <div className="p-0">
                        <table className="w-full text-sm text-left">
                          <tbody className="divide-y divide-border">
                            {Object.entries(metadata.copyright).map(([k, v]) => (
                              <tr key={k} className="hover:bg-muted/50">
                                <th className="py-3 px-5 font-medium text-muted-foreground w-1/3 bg-muted/10">{k}</th>
                                <td className="py-3 px-5 font-mono">{String(v)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* RAW Data */}
                  <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                    <button 
                      onClick={() => setShowRaw(!showRaw)} 
                      className="w-full p-4 flex items-center justify-between bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Settings2 className="size-4 text-muted-foreground" />
                        <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-muted-foreground">All Raw Data ({metaCount} fields)</h3>
                      </div>
                      <ChevronRight className={`size-4 text-muted-foreground transition-transform ${showRaw ? 'rotate-90' : ''}`} />
                    </button>
                    {showRaw && (
                      <div className="p-0 max-h-[500px] overflow-y-auto border-t border-border">
                        <table className="w-full text-xs text-left">
                          <thead className="bg-muted/50 sticky top-0">
                            <tr>
                              <th className="py-2 px-4 font-bold text-muted-foreground w-1/3">EXIF Tag</th>
                              <th className="py-2 px-4 font-bold text-muted-foreground">Value</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {Object.entries(metadata.raw).map(([k, v]) => {
                              if (typeof v === 'object' && v !== null && !(v instanceof Date)) {
                                v = JSON.stringify(v)
                              }
                              return (
                                <tr key={k} className="hover:bg-muted/30">
                                  <th className="py-2 px-4 font-mono font-medium text-muted-foreground break-all">{k}</th>
                                  <td className="py-2 px-4 font-mono break-all">{String(v)}</td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
