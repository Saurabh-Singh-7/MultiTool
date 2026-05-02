"use client"

import React, { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { ChevronRight, Upload, Download, Copy, Image as ImageIcon, CheckCircle2, AlertTriangle, Braces, FileText, Code2, Paintbrush, Info } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ImageBase64Client() {
  const [activeTab, setActiveTab] = useState<'encode' | 'decode'>('encode')
  
  // Encode State
  const [encodeFile, setEncodeFile] = useState<File | null>(null)
  const [encodePreview, setEncodePreview] = useState("")
  const [encodeResult, setEncodeResult] = useState("")
  const [encodeWarning, setEncodeWarning] = useState("")
  
  // Decode State
  const [decodeInput, setDecodeInput] = useState("")
  const [decodeResult, setDecodeResult] = useState("")
  const [decodeError, setDecodeError] = useState("")
  const [decodeFormat, setDecodeFormat] = useState("jpeg")
  const [decodeDims, setDecodeDims] = useState({ w: 0, h: 0 })
  
  const [isDragging, setIsDragging] = useState(false)
  const [toastMsg, setToastMsg] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (toastMsg) {
      const t = setTimeout(() => setToastMsg(""), 3000)
      return () => clearTimeout(t)
    }
  }, [toastMsg])

  const showToast = (msg: string) => setToastMsg(msg)

  // --- ENCODE LOGIC ---
  const handleFiles = (files: FileList | null) => {
    if (!files || !files.length) return
    const f = files[0]
    if (!f.type.startsWith('image/')) {
      showToast("⚠ Please upload an image file")
      return
    }
    
    if (f.size > 2 * 1024 * 1024) {
      setEncodeWarning("⚠ This is a large image. The resulting Base64 string will be extremely long and may slow down your browser if copied directly.")
    } else {
      setEncodeWarning("")
    }

    setEncodeFile(f)
    setEncodePreview(URL.createObjectURL(f))
    
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        setEncodeResult(e.target.result as string)
      }
    }
    reader.readAsDataURL(f)
  }

  const copyEncodeText = (format: 'full' | 'raw' | 'html' | 'css') => {
    if (!encodeResult) return
    
    let textToCopy = encodeResult
    
    if (format === 'raw') {
      textToCopy = encodeResult.split(',')[1]
    } else if (format === 'html') {
      textToCopy = `<img src="${encodeResult}" alt="Base64 Image" />`
    } else if (format === 'css') {
      textToCopy = `background-image: url('${encodeResult}');`
    }
    
    navigator.clipboard.writeText(textToCopy).then(() => {
      showToast("✓ Copied to clipboard")
    }).catch(() => {
      showToast("⚠ Failed to copy. String might be too large.")
    })
  }

  const downloadTxt = () => {
    if (!encodeResult || !encodeFile) return
    const a = document.createElement('a')
    const blob = new Blob([encodeResult], { type: 'text/plain' })
    a.href = URL.createObjectURL(blob)
    a.download = `${encodeFile.name.replace(/\.[^/.]+$/, "")}_base64.txt`
    a.click()
  }


  // --- DECODE LOGIC ---
  const handleDecodeInput = (val: string) => {
    setDecodeInput(val)
    setDecodeError("")
    
    if (!val.trim()) {
      setDecodeResult("")
      return
    }

    let cleanVal = val.trim()
    let dataUri = cleanVal

    // If it doesn't look like a data URI, validate and construct one
    if (!cleanVal.startsWith('data:')) {
      // Basic validation of raw base64
      try {
        // test if it's decodable (only decode a small chunk to prevent hanging on huge strings)
        atob(cleanVal.substring(0, 100))
        dataUri = `data:image/${decodeFormat};base64,${cleanVal}`
      } catch (e) {
        setDecodeError("Invalid Base64 string format.")
        setDecodeResult("")
        return
      }
    } else {
      // It is a data URI, let's extract the format if possible
      const match = cleanVal.match(/^data:image\/(\w+);base64,/)
      if (match && match[1]) {
        setDecodeFormat(match[1])
      } else {
        setDecodeError("Invalid Data URI header.")
        setDecodeResult("")
        return
      }
    }

    setDecodeResult(dataUri)
    
    // Attempt to load to get dimensions
    const img = new Image()
    img.onload = () => {
      setDecodeDims({ w: img.width, h: img.height })
    }
    img.onerror = () => {
      setDecodeError("String decoded, but the resulting image is corrupted or invalid.")
      setDecodeDims({ w: 0, h: 0 })
    }
    img.src = dataUri
  }

  // Handle format change when dealing with raw base64
  useEffect(() => {
    if (decodeInput && !decodeInput.trim().startsWith('data:')) {
       handleDecodeInput(decodeInput)
    }
  }, [decodeFormat])

  const downloadDecodedImage = () => {
    if (!decodeResult) return
    const a = document.createElement('a')
    a.href = decodeResult
    const ext = decodeFormat === 'jpeg' ? 'jpg' : decodeFormat
    a.download = `decoded_image.${ext}`
    a.click()
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B"
    const k = 1024, sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
  }

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
          <span className="text-foreground font-medium">Base64 Converter</span>
        </nav>

        <div className="mb-8 text-center max-w-3xl mx-auto">
          <h1 className="font-heading text-3xl font-bold sm:text-4xl sm:leading-[1.1] mb-3">
            Image &harr; Base64 Converter
          </h1>
          <p className="text-muted-foreground text-lg">
            Convert an image to a Base64 string for HTML/CSS, or decode a Base64 string back into an image file.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="max-w-2xl mx-auto mb-8 bg-muted p-1 rounded-xl border border-border flex">
          <button 
            onClick={() => setActiveTab('encode')}
            className={`flex-1 py-3 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${activeTab === 'encode' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <ImageIcon className="size-4" /> Image → Base64
          </button>
          <button 
            onClick={() => setActiveTab('decode')}
            className={`flex-1 py-3 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${activeTab === 'decode' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <Braces className="size-4" /> Base64 → Image
          </button>
        </div>

        {/* --- ENCODE MODE --- */}
        {activeTab === 'encode' && (
          <div className="animate-in fade-in slide-in-from-bottom-4">
            {!encodeResult ? (
              <div className="max-w-3xl mx-auto">
                <div 
                  className={`rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer overflow-hidden ${isDragging ? "border-brand-orange bg-brand-orange/5 scale-[1.01]" : "border-border hover:border-brand-orange/50 hover:bg-muted/50 bg-card"}`}
                  style={{ minHeight: '300px' }}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files) }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFiles(e.target.files)} />
                  <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                    <div className="mb-6 flex size-20 items-center justify-center rounded-3xl bg-brand-orange/10 text-brand-orange">
                      <ImageIcon className="size-10" />
                    </div>
                    <h3 className="font-heading text-xl font-bold mb-2">Upload Image to Encode</h3>
                    <p className="text-muted-foreground mb-4">Click to browse or drag and drop</p>
                    <div className="text-xs text-muted-foreground bg-background px-3 py-1.5 rounded-full border border-border">
                      Any image format, max 5MB
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
                
                {/* Result Controls */}
                <div className="space-y-6">
                  {encodeWarning && (
                    <div className="bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 p-4 rounded-xl text-sm flex items-start gap-3">
                      <AlertTriangle className="size-5 shrink-0" />
                      <div>{encodeWarning}</div>
                    </div>
                  )}

                  <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
                      <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-muted-foreground">Encoded Output</h3>
                    </div>
                    
                    <div className="p-5 space-y-6">
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Button variant="outline" className="h-14 justify-start px-4" onClick={() => copyEncodeText('full')}>
                          <Copy className="size-4 mr-3 text-muted-foreground" />
                          <div className="text-left">
                            <div className="font-bold">Copy Data URI</div>
                            <div className="text-xs text-muted-foreground font-normal mt-0.5">data:image/png;base64,...</div>
                          </div>
                        </Button>
                        <Button variant="outline" className="h-14 justify-start px-4" onClick={() => copyEncodeText('raw')}>
                          <Braces className="size-4 mr-3 text-muted-foreground" />
                          <div className="text-left">
                            <div className="font-bold">Copy Base64 Only</div>
                            <div className="text-xs text-muted-foreground font-normal mt-0.5">Without data: prefix</div>
                          </div>
                        </Button>
                        <Button variant="outline" className="h-14 justify-start px-4" onClick={() => copyEncodeText('html')}>
                          <Code2 className="size-4 mr-3 text-muted-foreground" />
                          <div className="text-left">
                            <div className="font-bold">Copy HTML Tag</div>
                            <div className="text-xs text-muted-foreground font-normal mt-0.5">&lt;img src="..." /&gt;</div>
                          </div>
                        </Button>
                        <Button variant="outline" className="h-14 justify-start px-4" onClick={() => copyEncodeText('css')}>
                          <Paintbrush className="size-4 mr-3 text-muted-foreground" />
                          <div className="text-left">
                            <div className="font-bold">Copy CSS Rule</div>
                            <div className="text-xs text-muted-foreground font-normal mt-0.5">background-image: url(...)</div>
                          </div>
                        </Button>
                      </div>

                      <div className="pt-4 border-t border-border">
                        <Button onClick={downloadTxt} className="w-full bg-brand-orange hover:bg-brand-orange-hover text-white">
                          <FileText className="size-4 mr-2" /> Download as .txt File
                        </Button>
                      </div>

                    </div>
                  </div>

                  <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-5">
                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold mb-2">
                      <Info className="size-4" /> Base64 Size Note
                    </div>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• <strong>Original Image Size:</strong> {formatBytes(encodeFile?.size || 0)}</li>
                      <li>• <strong>Base64 String Length:</strong> {encodeResult.length.toLocaleString()} characters</li>
                      <li>• <strong>Estimated Base64 Size:</strong> ~{formatBytes(encodeResult.length)} <span className="text-xs opacity-75">(~33% larger)</span></li>
                    </ul>
                  </div>

                  <div className="pt-2">
                    <button onClick={() => { setEncodeResult(""); setEncodeFile(null) }} className="text-sm text-brand-orange hover:underline font-bold">
                      &larr; Encode Another Image
                    </button>
                  </div>
                </div>

                {/* Preview */}
                <div>
                  <div className="rounded-xl border border-border bg-card p-4 sticky top-6">
                    <h4 className="text-xs font-bold uppercase text-muted-foreground mb-3 text-center">Image Preview</h4>
                    <div className="bg-muted/50 rounded-lg border border-border border-dashed p-2 flex items-center justify-center min-h-[200px]">
                      <img src={encodePreview} alt="Preview" className="max-w-full max-h-[400px] object-contain rounded" />
                    </div>
                    <div className="mt-4 p-3 bg-muted rounded text-xs font-mono text-muted-foreground break-all max-h-[150px] overflow-hidden relative">
                      {encodeResult.substring(0, 300)}...
                      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-muted to-transparent"></div>
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>
        )}

        {/* --- DECODE MODE --- */}
        {activeTab === 'decode' && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 animate-in fade-in slide-in-from-bottom-4">
            
            <div className="space-y-5">
              <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden flex flex-col">
                <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
                  <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-muted-foreground">Paste Base64 String</h3>
                  
                  {decodeInput && !decodeInput.trim().startsWith('data:') && (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-muted-foreground">Format:</span>
                      <select 
                        value={decodeFormat} 
                        onChange={(e) => setDecodeFormat(e.target.value)}
                        className="bg-background border border-border rounded px-2 py-1"
                      >
                        <option value="jpeg">JPG</option>
                        <option value="png">PNG</option>
                        <option value="webp">WebP</option>
                        <option value="gif">GIF</option>
                        <option value="svg+xml">SVG</option>
                      </select>
                    </div>
                  )}
                </div>
                <div className="flex-1 p-0 relative">
                  <textarea 
                    className="w-full h-[400px] p-5 bg-background text-sm font-mono focus:outline-none resize-none placeholder:text-muted-foreground/50"
                    placeholder="Paste your Data URI (data:image/png;base64,...) or raw Base64 string here..."
                    value={decodeInput}
                    onChange={(e) => handleDecodeInput(e.target.value)}
                    spellCheck={false}
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div className="rounded-xl border border-border bg-card p-4 sticky top-6">
                <h4 className="text-xs font-bold uppercase text-muted-foreground mb-3 text-center">Decoded Image</h4>
                
                {decodeError ? (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 p-4 rounded-lg text-sm text-center">
                    <AlertTriangle className="size-6 mx-auto mb-2 opacity-80" />
                    {decodeError}
                  </div>
                ) : decodeResult ? (
                  <>
                    <div className="bg-muted/50 rounded-lg border border-border border-dashed p-2 flex items-center justify-center min-h-[200px]">
                      <img src={decodeResult} alt="Decoded" className="max-w-full max-h-[300px] object-contain rounded" />
                    </div>
                    <div className="mt-4 flex justify-between items-center text-xs text-muted-foreground px-1">
                      <span>{decodeDims.w > 0 ? `${decodeDims.w} × ${decodeDims.h} px` : 'Calculating...'}</span>
                      <span className="uppercase">{decodeFormat}</span>
                    </div>
                    <Button onClick={downloadDecodedImage} className="w-full mt-4 bg-brand-orange hover:bg-brand-orange-hover text-white">
                      <Download className="size-4 mr-2" /> Download Image
                    </Button>
                  </>
                ) : (
                  <div className="bg-muted/50 rounded-lg border border-border border-dashed flex flex-col items-center justify-center h-[200px] text-muted-foreground">
                    <ImageIcon className="size-8 mb-2 opacity-50" />
                    <span className="text-sm font-medium">Waiting for input...</span>
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

      </div>
    </>
  )
}
