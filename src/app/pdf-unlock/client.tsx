"use client"

import React, { useState, useRef } from 'react'
import { PDFDocument } from '@cantoo/pdf-lib'
import { saveAs } from 'file-saver'
import { UploadCloud, Unlock, CheckCircle2, Download, Loader2, Eye, EyeOff, AlertTriangle, Info, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function PDFUnlockClient() {
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [unlockedBlob, setUnlockedBlob] = useState<Blob | null>(null)

  const [requiresPassword, setRequiresPassword] = useState(false)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [notProtectedMsg, setNotProtectedMsg] = useState('')
  
  const [removedOpenPwd, setRemovedOpenPwd] = useState(false)
  const [removedRestrictions, setRemovedRestrictions] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const checkProtection = async (f: File) => {
    setIsProcessing(true)
    setErrorMsg('')
    setNotProtectedMsg('')
    setRequiresPassword(false)
    setRemovedOpenPwd(false)
    setRemovedRestrictions(false)

    try {
      const arrayBuffer = await f.arrayBuffer()
      
      // Try loading without any password configuration first
      let pdfDoc: PDFDocument | null = null
      let hasOwnerPasswordOnly = false
      let notEncryptedAtAll = false
      
      try {
        pdfDoc = await PDFDocument.load(arrayBuffer)
        notEncryptedAtAll = true
      } catch (err: any) {
        if (err.message?.toLowerCase().includes('encrypted')) {
          // It's encrypted. Let's try to unlock it with an empty password
          // which works for PDFs that only have an Owner Password (restrictions).
          try {
            pdfDoc = await PDFDocument.load(arrayBuffer, { password: '' })
            hasOwnerPasswordOnly = true
          } catch (emptyPwdErr) {
            // Empty password failed, meaning it requires a real Open Password
            throw emptyPwdErr
          }
        } else {
          throw err
        }
      }
      
      // If we reach here, we successfully loaded it either completely unencrypted
      // or using the empty password (owner password bypass).
      const bytes = await pdfDoc.save()
      const blob = new Blob([bytes as any], { type: 'application/pdf' })
      
      setUnlockedBlob(blob)
      
      if (notEncryptedAtAll) {
         setNotProtectedMsg('ℹ This PDF is not password protected. No unlocking needed.')
      } else if (hasOwnerPasswordOnly) {
         setRemovedRestrictions(true)
         setCompleted(true)
      }
      
    } catch (err: any) {
      if (err.message?.toLowerCase().includes('password') || err.message?.toLowerCase().includes('encrypt')) {
        // Requires open password
        setRequiresPassword(true)
      } else {
        setErrorMsg('Failed to process the PDF. It may be corrupted.')
      }
    } finally {
      setIsProcessing(false)
    }
  }

  const handleFiles = (newFiles: FileList | null) => {
    if (!newFiles || newFiles.length === 0) return
    const f = newFiles[0]
    if (f.type !== 'application/pdf') { alert("Please upload a PDF file"); return }
    if (f.size > 100 * 1024 * 1024) { alert("File size exceeds 100MB limit."); return }
    setFile(f)
    setCompleted(false)
    setUnlockedBlob(null)
    checkProtection(f)
  }

  const handleUnlock = async () => {
    if (!file || !password) return
    setIsProcessing(true)
    setErrorMsg('')

    try {
      const arrayBuffer = await file.arrayBuffer()
      
      // Try loading with the provided password
      const pdfDoc = await PDFDocument.load(arrayBuffer, { password })

      // Save without password = unlocked
      const unlockedBytes = await pdfDoc.save()
      const blob = new Blob([unlockedBytes as any], { type: 'application/pdf' })
      
      setUnlockedBlob(blob)
      setRemovedOpenPwd(true)
      setRemovedRestrictions(true)
      setCompleted(true)
      setRequiresPassword(false) // Hide password input
    } catch (err: any) {
      console.error(err)
      if (err.message?.toLowerCase().includes('password') || err.message?.toLowerCase().includes('encrypt')) {
        setErrorMsg('Incorrect password. Please try again.')
      } else {
        setErrorMsg('An error occurred. The PDF may be corrupted or use unsupported encryption.')
      }
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownload = () => {
    if (!unlockedBlob || !file) return
    saveAs(unlockedBlob, file.name.replace('.pdf', '_unlocked.pdf'))
  }

  return (
    <div className="bg-card rounded-3xl shadow-2xl overflow-hidden border border-border flex flex-col z-20 relative font-inter">
      
      {/* Disclaimer Banner */}
      <div className="bg-amber-50 dark:bg-amber-900/10 border-b border-amber-200 dark:border-amber-800/30 px-6 py-4 flex items-start gap-3">
        <AlertTriangle className="size-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <p className="text-sm text-amber-800 dark:text-amber-300/80 leading-relaxed">
          <strong>⚠ Legal Disclaimer:</strong> Only unlock PDFs you own or have explicit permission to unlock. Removing passwords from PDFs you do not own may violate copyright laws and terms of service.
        </p>
      </div>

      <div className="p-8 md:p-12 space-y-8">

        {/* Upload */}
        {!file && (
          <div
            className={`border-3 border-dashed rounded-2xl p-16 flex flex-col items-center justify-center transition-all duration-200 ease-in-out cursor-pointer min-h-[300px]
              ${isDragging ? 'border-brand-orange bg-brand-orange/5 scale-[1.02]' : 'border-border hover:border-brand-orange/50'}
            `}
            onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={e => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files) }}
            onClick={() => fileInputRef.current?.click()}
          >
            <input type="file" ref={fileInputRef} className="hidden" accept="application/pdf" onChange={e => handleFiles(e.target.files)} />
            <div className="w-20 h-20 bg-brand-orange/10 rounded-full flex items-center justify-center mb-6">
              <UploadCloud className="size-10 text-brand-orange" />
            </div>
            <h3 className="text-2xl font-bold font-syne mb-2 text-foreground">Upload PDF to Unlock</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">Drag and drop your file here, or click to browse. Max size: 100MB.</p>
            <Button className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-full px-8 h-12 text-base font-semibold shadow-lg">
              Browse Files
            </Button>
          </div>
        )}

        {/* Not Protected State */}
        {file && notProtectedMsg && !requiresPassword && !completed && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 flex items-start gap-4">
                <Info className="size-6 text-blue-600 dark:text-blue-400 shrink-0" />
                <div>
                  <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-1">No Password Detected</h4>
                  <p className="text-blue-800 dark:text-blue-300/80 text-sm">{notProtectedMsg}</p>
                </div>
             </div>
             <div className="flex justify-center">
                <Button variant="outline" onClick={() => { setFile(null); setNotProtectedMsg('') }}>
                  Upload Another File
                </Button>
             </div>
          </div>
        )}

        {/* Requires Password State */}
        {file && requiresPassword && !completed && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* File Info */}
            <div className="bg-muted rounded-xl p-6 flex items-center justify-between border border-border">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <Unlock className="size-8 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-lg text-foreground truncate max-w-[200px] md:max-w-md">{file.name}</h4>
                  <p className="text-sm text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <Button variant="outline" onClick={() => { setFile(null); setRequiresPassword(false); setPassword('') }}>Cancel</Button>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 md:p-10 space-y-6 max-w-2xl mx-auto shadow-sm">
               <div className="text-center space-y-2 mb-8">
                 <h3 className="text-2xl font-bold font-syne flex items-center justify-center gap-2">
                   <Unlock className="size-6 text-brand-orange" /> This PDF is Protected
                 </h3>
                 <p className="text-muted-foreground text-sm">Please enter the open password to verify your authorization and decrypt the file.</p>
               </div>

               <div className="space-y-4">
                 <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Enter PDF password..."
                      className="pr-12 h-12 text-lg text-center"
                      onKeyDown={e => e.key === 'Enter' && handleUnlock()}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                    </button>
                 </div>
                 
                 {errorMsg && (
                   <p className="text-sm text-red-500 text-center animate-in slide-in-from-top-1">
                     ⚠ {errorMsg}
                   </p>
                 )}
               </div>

               <div className="pt-4">
                 <Button
                   onClick={handleUnlock}
                   disabled={isProcessing || !password}
                   className="bg-brand-orange hover:bg-brand-orange/90 text-white rounded-full h-14 text-lg font-bold shadow-xl shadow-brand-orange/20 w-full"
                 >
                   {isProcessing ? (
                     <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Verifying...</>
                   ) : (
                     <><Unlock className="mr-2 size-5" /> Unlock PDF</>
                   )}
                 </Button>
               </div>

               <div className="bg-muted rounded-lg p-4 mt-6 text-sm text-muted-foreground text-center">
                  ⚠ We cannot unlock a PDF without the correct password. We do not perform brute-force attacks.
               </div>
            </div>
          </div>
        )}

        {/* Processing State (for Owner Password bypass) */}
        {isProcessing && !requiresPassword && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
             <Loader2 className="size-12 text-brand-orange animate-spin" />
             <p className="text-lg font-medium animate-pulse text-muted-foreground">Analyzing PDF Security...</p>
          </div>
        )}

        {/* Error (General) */}
        {!requiresPassword && errorMsg && (
           <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center space-y-4">
              <p className="text-red-600 dark:text-red-400 font-medium">⚠ {errorMsg}</p>
              <Button variant="outline" onClick={() => { setFile(null); setErrorMsg('') }}>Try Another File</Button>
           </div>
        )}

        {/* Result */}
        {completed && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800/50 rounded-xl p-8 flex flex-col items-center justify-center gap-6 text-center shadow-sm">
              <div className="size-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400">
                <CheckCircle2 className="size-8" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-2xl font-bold font-syne text-foreground">PDF Unlocked Successfully!</h3>
                <p className="text-muted-foreground">The document is now fully accessible without restrictions.</p>
              </div>

              <div className="bg-white dark:bg-zinc-950 border border-green-200 dark:border-green-800/30 rounded-xl p-4 w-full max-w-sm text-left space-y-2">
                 <h4 className="text-sm font-bold text-foreground mb-3 px-1 border-b border-border pb-2">Security Removed:</h4>
                 {removedOpenPwd && (
                   <p className="text-sm text-muted-foreground flex items-center gap-2 px-1">
                      <CheckCircle2 className="size-4 text-green-500" /> Open Password
                   </p>
                 )}
                 {removedRestrictions && (
                   <>
                     <p className="text-sm text-muted-foreground flex items-center gap-2 px-1">
                        <CheckCircle2 className="size-4 text-green-500" /> Print Restrictions
                     </p>
                     <p className="text-sm text-muted-foreground flex items-center gap-2 px-1">
                        <CheckCircle2 className="size-4 text-green-500" /> Copy Restrictions
                     </p>
                     <p className="text-sm text-muted-foreground flex items-center gap-2 px-1">
                        <CheckCircle2 className="size-4 text-green-500" /> Editing Restrictions
                     </p>
                   </>
                 )}
              </div>

              <Button
                onClick={handleDownload}
                className="bg-brand-orange hover:bg-brand-orange/90 text-white font-bold h-14 px-8 rounded-full shadow-lg text-lg w-full md:w-auto mt-2"
              >
                <Download className="mr-2 size-5" /> Download Unlocked PDF
              </Button>
            </div>

            <div className="flex justify-center">
              <Button variant="ghost" onClick={() => { setFile(null); setCompleted(false); setUnlockedBlob(null); setPassword(''); setRequiresPassword(false) }}>
                Unlock Another File
              </Button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
