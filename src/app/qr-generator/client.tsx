'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import QRCode from 'qrcode'

type ContentType = 'url' | 'text' | 'wifi' | 'email' | 'phone' | 'sms' | 'vcard'

const CONTENT_TYPES: { id: ContentType; icon: string; label: string }[] = [
  { id: 'url', icon: '🔗', label: 'URL' },
  { id: 'text', icon: '📝', label: 'Text' },
  { id: 'wifi', icon: '📶', label: 'WiFi' },
  { id: 'email', icon: '📧', label: 'Email' },
  { id: 'phone', icon: '📞', label: 'Phone' },
  { id: 'sms', icon: '💬', label: 'SMS' },
  { id: 'vcard', icon: '👤', label: 'vCard' },
]

const PRESET_COLORS = ['#F97316', '#EF4444', '#3B82F6', '#10B981', '#8B5CF6', '#EC4899', '#000000', '#6366F1']

export default function QRCodeClient() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)

  const [contentType, setContentType] = useState<ContentType>('url')
  const [url, setUrl] = useState('https://toolhive.app')
  const [text, setText] = useState('')
  const [wifiName, setWifiName] = useState('')
  const [wifiPass, setWifiPass] = useState('')
  const [wifiEnc, setWifiEnc] = useState('WPA')
  const [email, setEmail] = useState('')
  const [emailSubject, setEmailSubject] = useState('')
  const [emailBody, setEmailBody] = useState('')
  const [phone, setPhone] = useState('')
  const [smsPhone, setSmsPhone] = useState('')
  const [smsBody, setSmsBody] = useState('')
  const [vcardName, setVcardName] = useState('')
  const [vcardPhone, setVcardPhone] = useState('')
  const [vcardEmail, setVcardEmail] = useState('')
  const [vcardOrg, setVcardOrg] = useState('')

  const [fgColor, setFgColor] = useState('#000000')
  const [bgColor, setBgColor] = useState('#FFFFFF')
  const [qrSize, setQrSize] = useState(300)
  const [errorLevel, setErrorLevel] = useState<'L' | 'M' | 'Q' | 'H'>('H')
  const [logoSrc, setLogoSrc] = useState<string | null>(null)
  const [logoSize, setLogoSize] = useState(60)

  const getQRData = useCallback(() => {
    switch (contentType) {
      case 'url': return url || 'https://toolhive.app'
      case 'text': return text || 'Hello World'
      case 'wifi': return `WIFI:T:${wifiEnc};S:${wifiName};P:${wifiPass};;`
      case 'email': return `mailto:${email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`
      case 'phone': return `tel:${phone}`
      case 'sms': return `smsto:${smsPhone}:${smsBody}`
      case 'vcard': return `BEGIN:VCARD\nVERSION:3.0\nFN:${vcardName}\nTEL:${vcardPhone}\nEMAIL:${vcardEmail}\nORG:${vcardOrg}\nEND:VCARD`
      default: return 'https://toolhive.app'
    }
  }, [contentType, url, text, wifiName, wifiPass, wifiEnc, email, emailSubject, emailBody, phone, smsPhone, smsBody, vcardName, vcardPhone, vcardEmail, vcardOrg])

  const generateQR = useCallback(async () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const data = getQRData()
    try {
      await QRCode.toCanvas(canvas, data, {
        width: qrSize, margin: 2,
        errorCorrectionLevel: errorLevel,
        color: { dark: fgColor, light: bgColor },
      })
      if (logoSrc) {
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => {
          const x = (canvas.width - logoSize) / 2
          const y = (canvas.height - logoSize) / 2
          const pad = 6
          ctx.fillStyle = bgColor
          ctx.beginPath()
          ctx.roundRect(x - pad, y - pad, logoSize + pad * 2, logoSize + pad * 2, 8)
          ctx.fill()
          ctx.drawImage(img, x, y, logoSize, logoSize)
        }
        img.src = logoSrc
      }
    } catch (err) { console.error(err) }
  }, [getQRData, qrSize, errorLevel, fgColor, bgColor, logoSrc, logoSize])

  useEffect(() => { generateQR() }, [generateQR])

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setLogoSrc(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const downloadPNG = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = 'qrcode-toolhive.png'
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  const downloadSVG = async () => {
    const data = getQRData()
    try {
      const svgString = await QRCode.toString(data, {
        type: 'svg', width: qrSize, margin: 2,
        errorCorrectionLevel: errorLevel,
        color: { dark: fgColor, light: bgColor },
      })
      const blob = new Blob([svgString], { type: 'image/svg+xml' })
      const link = document.createElement('a')
      link.download = 'qrcode-toolhive.svg'
      link.href = URL.createObjectURL(blob)
      link.click()
    } catch (err) { console.error(err) }
  }

  const InputField = ({ label, value, onChange, placeholder, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) => (
    <div>
      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-orange/50 transition-all" />
    </div>
  )

  const renderContentInputs = () => {
    switch (contentType) {
      case 'url': return <InputField label="Website URL" value={url} onChange={setUrl} placeholder="https://example.com" type="url" />
      case 'text': return (
        <div>
          <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Text Content</label>
          <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Enter any text..."
            className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 h-32 resize-none focus:outline-none focus:ring-2 focus:ring-brand-orange/50" />
        </div>
      )
      case 'wifi': return (
        <div className="space-y-4">
          <InputField label="Network Name (SSID)" value={wifiName} onChange={setWifiName} placeholder="My WiFi Network" />
          <InputField label="Password" value={wifiPass} onChange={setWifiPass} placeholder="password123" type="password" />
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Encryption</label>
            <div className="flex gap-2">
              {['WPA', 'WEP', 'nopass'].map(enc => (
                <button key={enc} onClick={() => setWifiEnc(enc)}
                  className={`flex-1 py-2 rounded-xl text-sm font-bold border transition-all ${wifiEnc === enc ? 'border-brand-orange bg-brand-orange/10 text-brand-orange' : 'border-border hover:bg-muted'}`}>
                  {enc === 'nopass' ? 'None' : enc}
                </button>
              ))}
            </div>
          </div>
        </div>
      )
      case 'email': return (
        <div className="space-y-4">
          <InputField label="Email Address" value={email} onChange={setEmail} placeholder="hello@example.com" type="email" />
          <InputField label="Subject" value={emailSubject} onChange={setEmailSubject} placeholder="Subject line" />
          <InputField label="Body" value={emailBody} onChange={setEmailBody} placeholder="Email body text" />
        </div>
      )
      case 'phone': return <InputField label="Phone Number" value={phone} onChange={setPhone} placeholder="+91 98765 43210" type="tel" />
      case 'sms': return (
        <div className="space-y-4">
          <InputField label="Phone Number" value={smsPhone} onChange={setSmsPhone} placeholder="+91 98765 43210" type="tel" />
          <InputField label="Message" value={smsBody} onChange={setSmsBody} placeholder="Your pre-filled message" />
        </div>
      )
      case 'vcard': return (
        <div className="space-y-4">
          <InputField label="Full Name" value={vcardName} onChange={setVcardName} placeholder="John Doe" />
          <InputField label="Phone" value={vcardPhone} onChange={setVcardPhone} placeholder="+91 98765 43210" type="tel" />
          <InputField label="Email" value={vcardEmail} onChange={setVcardEmail} placeholder="john@example.com" type="email" />
          <InputField label="Organization" value={vcardOrg} onChange={setVcardOrg} placeholder="Acme Corp" />
        </div>
      )
    }
  }

  return (
    <div className="grid lg:grid-cols-12 gap-8">
      {/* LEFT: Controls */}
      <div className="lg:col-span-7 space-y-6">
        {/* Content Type Tabs */}
        <div className="bg-card border border-border p-6 rounded-[2.5rem] shadow-sm">
          <h2 className="text-xl font-bold font-syne mb-6">1. Choose Content Type</h2>
          <div className="flex flex-wrap gap-2">
            {CONTENT_TYPES.map(ct => (
              <button key={ct.id} onClick={() => setContentType(ct.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border transition-all ${contentType === ct.id ? 'bg-brand-orange text-white border-brand-orange shadow-md shadow-brand-orange/20' : 'bg-card border-border text-muted-foreground hover:border-brand-orange/40'}`}>
                <span>{ct.icon}</span> {ct.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Input */}
        <div className="bg-card border border-border p-6 rounded-[2.5rem] shadow-sm">
          <h2 className="text-xl font-bold font-syne mb-6">2. Enter Content</h2>
          {renderContentInputs()}
        </div>

        {/* Design Options */}
        <div className="bg-card border border-border p-6 rounded-[2.5rem] shadow-sm space-y-8">
          <h2 className="text-xl font-bold font-syne">3. Customize Design</h2>

          {/* Colors */}
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Foreground Color</label>
              <div className="flex items-center gap-3">
                <input type="color" value={fgColor} onChange={(e) => setFgColor(e.target.value)} className="w-10 h-10 rounded-lg border border-border cursor-pointer" />
                <input type="text" value={fgColor} onChange={(e) => setFgColor(e.target.value)} className="flex-1 bg-muted/30 border border-border rounded-xl px-3 py-2 font-mono text-sm" />
              </div>
              <div className="flex gap-1.5 mt-3">
                {PRESET_COLORS.map(c => (
                  <button key={c} onClick={() => setFgColor(c)} className={`w-7 h-7 rounded-lg border-2 transition-all hover:scale-110 ${fgColor === c ? 'border-foreground scale-110' : 'border-transparent'}`} style={{ background: c }} />
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Background Color</label>
              <div className="flex items-center gap-3">
                <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-10 h-10 rounded-lg border border-border cursor-pointer" />
                <input type="text" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="flex-1 bg-muted/30 border border-border rounded-xl px-3 py-2 font-mono text-sm" />
              </div>
            </div>
          </div>

          {/* Logo Upload */}
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Logo / Image</label>
            <div className="flex gap-4 items-center">
              <button onClick={() => logoInputRef.current?.click()}
                className="px-5 py-3 bg-brand-orange/10 hover:bg-brand-orange hover:text-white text-brand-orange border border-brand-orange/20 rounded-xl font-bold text-sm transition-all">
                {logoSrc ? '🔄 Change Logo' : '📤 Upload Logo'}
              </button>
              {logoSrc && (
                <>
                  <img src={logoSrc} alt="Logo preview" className="w-10 h-10 rounded-lg object-cover border border-border" />
                  <button onClick={() => setLogoSrc(null)} className="text-xs text-red-500 hover:underline">Remove</button>
                </>
              )}
            </div>
            <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
            {logoSrc && (
              <div className="mt-4">
                <label className="block text-xs font-bold text-muted-foreground mb-2">Logo Size: {logoSize}px</label>
                <input type="range" min="30" max="120" value={logoSize} onChange={(e) => setLogoSize(parseInt(e.target.value))} className="w-full accent-brand-orange" />
              </div>
            )}
          </div>

          {/* Advanced */}
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">QR Size: {qrSize}px</label>
              <input type="range" min="150" max="600" step="10" value={qrSize} onChange={(e) => setQrSize(parseInt(e.target.value))} className="w-full accent-brand-orange" />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Error Correction</label>
              <div className="flex gap-2">
                {(['L', 'M', 'Q', 'H'] as const).map(lvl => (
                  <button key={lvl} onClick={() => setErrorLevel(lvl)}
                    className={`flex-1 py-2 rounded-xl text-sm font-bold border transition-all ${errorLevel === lvl ? 'border-brand-orange bg-brand-orange/10 text-brand-orange' : 'border-border hover:bg-muted'}`}>
                    {lvl} {lvl === 'H' && '(Best)'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT: Preview & Download */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-card border border-border p-8 rounded-[2.5rem] shadow-xl sticky top-8">
          <h2 className="text-xl font-bold font-syne mb-6 text-center">QR Code Preview</h2>

          <div className="flex justify-center mb-8">
            <div className="p-6 rounded-3xl border-2 border-dashed border-border bg-white inline-block">
              <canvas ref={canvasRef} />
            </div>
          </div>

          <div className="space-y-3">
            <button onClick={downloadPNG}
              className="w-full py-4 bg-brand-orange hover:bg-brand-orange-hover text-white font-bold rounded-2xl transition-all shadow-md shadow-brand-orange/20 text-lg">
              📥 Download PNG
            </button>
            <button onClick={downloadSVG}
              className="w-full py-3 bg-muted/50 hover:bg-muted border border-border text-foreground font-bold rounded-2xl transition-all text-sm">
              📐 Download SVG (Vector)
            </button>
          </div>

          <div className="mt-6 p-4 bg-muted/30 rounded-2xl border border-border text-xs text-muted-foreground text-center space-y-1">
            <p>✓ Free forever — No expiration</p>
            <p>✓ Unlimited scans — No limits</p>
            <p>✓ 100% private — Runs locally</p>
          </div>
        </div>
      </div>
    </div>
  )
}
