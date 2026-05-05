"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowRightLeft, Download, Clipboard, ChevronRight, Check, FileCode, Code2, Database } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Papa from "papaparse"
import YAML from "js-yaml"
import convert from "xml-js"
import { saveAs } from "file-saver"
import { toast } from "sonner"

export type DataFormat = 'csv' | 'json' | 'yaml' | 'xml'

interface DataConverterClientProps {
  initialFrom: DataFormat
  initialTo: DataFormat
  title: string
  description: string
}

export default function DataConverterClient({ initialFrom, initialTo, title, description }: DataConverterClientProps) {
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [from, setFrom] = useState<DataFormat>(initialFrom)
  const [to, setTo] = useState<DataFormat>(initialTo)
  const [copied, setCopied] = useState(false)

  const handleConvert = () => {
    if (!input.trim()) return

    try {
      let data: any

      // Parse Input
      if (from === 'json') {
        data = JSON.parse(input)
      } else if (from === 'csv') {
        const results = Papa.parse(input, { header: true, skipEmptyLines: true })
        if (results.errors.length > 0) throw new Error(results.errors[0].message)
        data = results.data
      } else if (from === 'yaml') {
        data = YAML.load(input)
      } else if (from === 'xml') {
        const result = convert.xml2js(input, { compact: true, spaces: 2 })
        data = result
      }

      // Generate Output
      if (to === 'json') {
        setOutput(JSON.stringify(data, null, 2))
      } else if (to === 'csv') {
        const csv = Papa.unparse(data)
        setOutput(csv)
      } else if (to === 'yaml') {
        setOutput(YAML.dump(data))
      } else if (to === 'xml') {
        const xml = convert.js2xml(data, { compact: true, spaces: 2 })
        setOutput(xml)
      }

      toast.success("Conversion successful!")
    } catch (err: any) {
      toast.error("Error: " + err.message)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output)
    setCopied(true)
    toast.success("Copied to clipboard!")
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadFile = () => {
    const blob = new Blob([output], { type: 'text/plain' })
    saveAs(blob, `toolhive-converted.${to}`)
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
        <ChevronRight className="size-4" />
        <Link href="/#developer-tools" className="hover:text-foreground transition-colors">Developer Tools</Link>
        <ChevronRight className="size-4" />
        <span className="text-foreground font-medium">{from.toUpperCase()} to {to.toUpperCase()}</span>
      </nav>

      {/* Hero Header */}
      <div className="mb-12 text-center max-w-2xl mx-auto">
        <h1 className="font-heading text-4xl sm:text-5xl font-extrabold mb-4">
          {title.split(' ')[0]} <span className="text-brand-orange">{title.split(' ').slice(1).join(' ')}</span>
        </h1>
        <p className="text-muted-foreground text-lg">
          {description}
        </p>
      </div>

      {/* Format Selector Bar */}
      <div className="bg-card border border-border rounded-2xl p-4 mb-8 flex flex-wrap items-center justify-center gap-4 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">From</span>
          <div className="flex bg-muted rounded-lg p-1">
            {(['csv', 'json', 'yaml', 'xml'] as DataFormat[]).map(f => (
              <button 
                key={f}
                onClick={() => setFrom(f)}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${from === f ? 'bg-brand-orange text-white shadow-md' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {f.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        <ArrowRightLeft className="size-5 text-brand-orange" />
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">To</span>
          <div className="flex bg-muted rounded-lg p-1">
            {(['csv', 'json', 'yaml', 'xml'] as DataFormat[]).map(f => (
              <button 
                key={f}
                onClick={() => setTo(f)}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${to === f ? 'bg-brand-orange text-white shadow-md' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {f.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr,auto,1fr] gap-6 items-start">
        {/* Input area */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <FileCode className="size-5 text-brand-orange" />
              {from.toUpperCase()} Input
            </h3>
            <Button variant="ghost" size="sm" onClick={() => setInput("")}>Clear</Button>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Paste your ${from.toUpperCase()} here...`}
            className="w-full h-[450px] bg-card border border-border rounded-2xl p-4 font-mono text-sm focus:ring-2 focus:ring-brand-orange focus:border-brand-orange outline-none transition-all resize-none shadow-inner"
          />
        </div>

        {/* Action Button */}
        <div className="lg:pt-48">
          <Button 
            className="bg-brand-orange hover:bg-brand-orange/90 text-white font-bold rounded-full size-16 shadow-lg shadow-brand-orange/20"
            onClick={handleConvert}
          >
            <ArrowRightLeft className="size-8" />
          </Button>
        </div>

        {/* Output area */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Code2 className="size-5 text-brand-orange" />
              {to.toUpperCase()} Output
            </h3>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={copyToClipboard} disabled={!output}>
                {copied ? <Check className="size-4 mr-2" /> : <Clipboard className="size-4 mr-2" />}
                Copy
              </Button>
              <Button variant="ghost" size="sm" onClick={downloadFile} disabled={!output}>
                <Download className="size-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
          <div className="w-full h-[450px] bg-muted/30 border border-border rounded-2xl p-4 font-mono text-sm overflow-auto relative shadow-inner">
            {output ? (
              <pre className="whitespace-pre-wrap">{output}</pre>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
                <Database className="size-12 mb-4" />
                <p>Converted data will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
