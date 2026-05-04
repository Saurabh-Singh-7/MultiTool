"use client"

import React, { useState, useRef } from 'react'
import { PDFDocument } from '@cantoo/pdf-lib'
import { saveAs } from 'file-saver'
import { UploadCloud, Lock, CheckCircle2, Download, Loader2, Eye, EyeOff, Dices, Copy, ShieldCheck, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'

// ─── Password Strength ───
function checkStrength(pwd: string): { label: string; score: number; color: string } {
  let score = 0
  if (pwd.length >= 8) score++
  if (pwd.length >= 12) score++
  if (/[A-Z]/.test(pwd)) score++
  if (/[0-9]/.test(pwd)) score++
  if (/[^A-Za-z0-9]/.test(pwd)) score++
  const labels = ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong']
  const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-emerald-500']
  return { label: labels[Math.min(score, 4)], score, color: colors[Math.min(score, 4)] }
}

function generatePassword(length = 16): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-='
  let pwd = ''
  const arr = new Uint32Array(length)
  crypto.getRandomValues(arr)
  for (let i = 0; i < length; i++) {
    pwd += chars[arr[i] % chars.length]
  }
  return pwd
}

export default function PDFProtectClient() {
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [protectedBlob, setProtectedBlob] = useState<Blob | null>(null)

  // Password state
  const [userPassword, setUserPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [useOwnerPassword, setUseOwnerPassword] = useState(false)
  const [ownerPassword, setOwnerPassword] = useState('')
  const [generatedPwd, setGeneratedPwd] = useState('')
  const [copiedPwd, setCopiedPwd] = useState(false)

  // Permissions
  const [allowPrinting, setAllowPrinting] = useState(true)
  const [allowCopying, setAllowCopying] = useState(true)
  const [allowEditing, setAllowEditing] = useState(false)
  const [allowFormFilling, setAllowFormFilling] = useState(false)
  const [allowScreenReaders, setAllowScreenReaders] = useState(true)
  const [allowPageExtraction, setAllowPageExtraction] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const strength = checkStrength(userPassword)
  const passwordsMatch = userPassword === confirmPassword
  const canEncrypt = file && userPassword.length >= 4 && passwordsMatch

  const handleFiles = (newFiles: FileList | null) => {
    if (!newFiles || newFiles.length === 0) return
    const f = newFiles[0]
    if (f.type !== 'application/pdf') { alert("Please upload a PDF file"); return }
    if (f.size > 100 * 1024 * 1024) { alert("File size exceeds 100MB limit."); return }
    setFile(f)
    setCompleted(false)
    setProtectedBlob(null)
  }

  const handleGenerate = () => {
    const pwd = generatePassword(16)
    setGeneratedPwd(pwd)
    setUserPassword(pwd)
    setConfirmPassword(pwd)
    setCopiedPwd(false)
  }

  const handleCopyPassword = async () => {
    await navigator.clipboard.writeText(generatedPwd || userPassword)
    setCopiedPwd(true)
    setTimeout(() => setCopiedPwd(false), 2000)
  }

  const handleEncrypt = async () => {
    if (!file || !canEncrypt) return
    setIsProcessing(true)

    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)

      // @ts-ignore: pdf-lib encrypt method might not be in the type definitions
      await pdfDoc.encrypt({
        userPassword: userPassword,
        ownerPassword: useOwnerPassword && ownerPassword ? ownerPassword : userPassword + '_owner',
        permissions: {
          printing: allowPrinting ? 'highResolution' as any : 'none' as any,
          modifying: allowEditing,
          copying: allowCopying,
          annotating: allowFormFilling,
          fillingForms: allowFormFilling,
          contentAccessibility: allowScreenReaders,
          documentAssembly: allowPageExtraction,
        }
      })

      const pdfBytes = await pdfDoc.save()
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' })
      setProtectedBlob(blob)
      setCompleted(true)
    } catch (err) {
      console.error(err)
      alert("An error occurred during encryption. The PDF may already be encrypted or corrupted.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownload = () => {
    if (!protectedBlob || !file) return
    saveAs(protectedBlob, file.name.replace('.pdf', '_protected.pdf'))
  }

  return (
    <div className="bg-card rounded-3xl shadow-2xl overflow-hidden border border-border flex flex-col z-20 relative font-inter">
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
            <h3 className="text-2xl font-bold font-syne mb-2 text-foreground">Upload PDF to Protect</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">Drag and drop your file here, or click to browse. Max size: 100MB.</p>
            <Button className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-full px-8 h-12 text-base font-semibold shadow-lg">
              Browse Files
            </Button>
          </div>
        )}

        {/* Settings */}
        {file && !completed && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* File Info */}
            <div className="bg-muted rounded-xl p-6 flex items-center justify-between border border-border">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <Lock className="size-8 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-lg text-foreground truncate max-w-[200px] md:max-w-md">{file.name}</h4>
                  <p className="text-sm text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <Button variant="outline" onClick={() => setFile(null)}>Change File</Button>
            </div>

            {/* Open Password */}
            <div className="bg-card border border-border rounded-xl p-6 md:p-8 space-y-6">
              <div className="flex items-center gap-3">
                <Lock className="size-5 text-brand-orange" />
                <h3 className="text-xl font-bold font-syne">Open Password (User Password)</h3>
              </div>
              <p className="text-sm text-muted-foreground -mt-2">Password required to open the PDF</p>

              <div className="space-y-4 max-w-lg">
                <div className="space-y-2">
                  <label className="text-sm font-medium block">Password</label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={userPassword}
                      onChange={e => setUserPassword(e.target.value)}
                      placeholder="Enter password..."
                      className="pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>

                {/* Strength Indicator */}
                {userPassword.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="flex gap-1">
                      {[0, 1, 2, 3, 4].map(i => (
                        <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= strength.score - 1 ? strength.color : 'bg-muted'}`} />
                      ))}
                    </div>
                    <p className={`text-xs font-medium ${strength.score <= 1 ? 'text-red-500' : strength.score <= 2 ? 'text-yellow-500' : 'text-green-500'}`}>
                      {strength.label}
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium block">Confirm Password</label>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password..."
                  />
                  {confirmPassword.length > 0 && !passwordsMatch && (
                    <p className="text-xs text-red-500">Passwords do not match</p>
                  )}
                </div>

                {/* Password Generator */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Button variant="outline" onClick={handleGenerate} className="gap-2">
                    <Dices className="size-4" /> Generate Strong Password
                  </Button>
                  {(generatedPwd || userPassword) && (
                    <Button variant="outline" onClick={handleCopyPassword} className="gap-2">
                      <Copy className="size-4" /> {copiedPwd ? 'Copied!' : 'Copy'}
                    </Button>
                  )}
                </div>
                {generatedPwd && (
                  <div className="bg-muted rounded-lg p-3 border border-border font-mono text-sm break-all select-all">
                    {generatedPwd}
                  </div>
                )}
              </div>
            </div>

            {/* Owner Password */}
            <div className="bg-card border border-border rounded-xl p-6 md:p-8 space-y-4">
              <div className="flex items-center space-x-3">
                <Switch id="ownerPwd" checked={useOwnerPassword} onCheckedChange={(c: boolean) => setUseOwnerPassword(c)} />
                <label htmlFor="ownerPwd" className="text-sm font-medium">Set separate permissions password (Owner Password)</label>
              </div>
              <p className="text-xs text-muted-foreground">Controls what users can do with the PDF. If not set, a derived password is used automatically.</p>

              {useOwnerPassword && (
                <div className="max-w-lg pt-2">
                  <Input
                    type="password"
                    value={ownerPassword}
                    onChange={e => setOwnerPassword(e.target.value)}
                    placeholder="Enter owner password..."
                  />
                </div>
              )}
            </div>

            {/* Permissions */}
            <div className="bg-card border border-border rounded-xl p-6 md:p-8 space-y-6">
              <div className="flex items-center gap-3">
                <ShieldCheck className="size-5 text-brand-orange" />
                <h3 className="text-xl font-bold font-syne">Document Permissions</h3>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { id: 'printing', label: 'Allow printing', checked: allowPrinting, set: setAllowPrinting },
                  { id: 'copying', label: 'Allow copying text', checked: allowCopying, set: setAllowCopying },
                  { id: 'editing', label: 'Allow editing', checked: allowEditing, set: setAllowEditing },
                  { id: 'formFilling', label: 'Allow form filling', checked: allowFormFilling, set: setAllowFormFilling },
                  { id: 'screenReaders', label: 'Allow screen readers', checked: allowScreenReaders, set: setAllowScreenReaders },
                  { id: 'pageExtract', label: 'Allow page extraction', checked: allowPageExtraction, set: setAllowPageExtraction },
                ].map(perm => (
                  <div key={perm.id} className="flex items-center space-x-3 bg-muted rounded-lg p-3 border border-border">
                    <Switch id={perm.id} checked={perm.checked} onCheckedChange={(c: boolean) => perm.set(c)} />
                    <label htmlFor={perm.id} className="text-sm font-medium">{perm.label}</label>
                  </div>
                ))}
              </div>
            </div>

            {/* Encrypt Button */}
            <div className="flex justify-center pt-4">
              <Button
                onClick={handleEncrypt}
                disabled={isProcessing || !canEncrypt}
                className="bg-brand-orange hover:bg-brand-orange/90 text-white rounded-full px-12 h-14 text-lg font-bold shadow-xl shadow-brand-orange/20 w-full md:w-auto min-w-[280px]"
              >
                {isProcessing ? (
                  <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Encrypting...</>
                ) : (
                  <><Lock className="mr-2 size-5" /> Protect PDF</>
                )}
              </Button>
            </div>

            {!canEncrypt && userPassword.length > 0 && (
              <p className="text-center text-xs text-muted-foreground">
                {!passwordsMatch ? 'Passwords do not match.' : userPassword.length < 4 ? 'Password must be at least 4 characters.' : ''}
              </p>
            )}
          </div>
        )}

        {/* Result */}
        {completed && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-8 flex flex-col items-center justify-center gap-6 text-center">
              <div className="size-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400">
                <CheckCircle2 className="size-8" />
              </div>
              <div>
                <h3 className="text-2xl font-bold font-syne text-foreground mb-2">PDF Protected Successfully!</h3>
                <p className="text-muted-foreground">Your PDF has been encrypted and is ready for download.</p>
              </div>
              <Button
                onClick={handleDownload}
                className="bg-brand-orange hover:bg-brand-orange/90 text-white font-bold h-12 px-8 rounded-full shadow-lg"
              >
                <Download className="mr-2 size-5" /> Download Protected PDF
              </Button>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6 flex items-start gap-3">
              <AlertTriangle className="size-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800 dark:text-amber-300">
                <strong>⚠️ Save your password!</strong> We process everything locally and do not store your password. If you lose it, there is no way to recover access to your protected PDF.
              </div>
            </div>

            <div className="flex justify-center">
              <Button variant="outline" onClick={() => { setFile(null); setCompleted(false); setProtectedBlob(null); setUserPassword(''); setConfirmPassword(''); setGeneratedPwd('') }}>
                Protect Another File
              </Button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
