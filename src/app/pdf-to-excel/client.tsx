"use client"

import React, { useState, useRef } from 'react'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { UploadCloud, FileSpreadsheet, CheckCircle2, Download, Loader2, Table } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'

// Dynamic load pdfjs
async function getPdfjs() {
  const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf')
  if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
  }
  return pdfjsLib
}

// ─── Table Detection Logic ───
async function detectTables(pdfPage: any) {
  const textContent = await pdfPage.getTextContent()
  const items = textContent.items

  // Sort by Y then X position
  const sorted = [...items].sort((a: any, b: any) => {
    const yDiff = Math.round(b.transform[5]) - Math.round(a.transform[5])
    return yDiff !== 0 ? yDiff : a.transform[4] - b.transform[4]
  })

  // Group into rows by Y position
  const rows: any[] = []
  let currentRow: any[] = []
  let lastY: number | null = null

  sorted.forEach((item: any) => {
    const y = Math.round(item.transform[5])
    if (lastY === null || Math.abs(y - lastY) < 3) {
      currentRow.push({
        text: item.str,
        x: item.transform[4],
        y: item.transform[5]
      })
    } else {
      if (currentRow.length > 1) {
        // Multiple columns = likely a table row
        rows.push(currentRow.sort((a, b) => a.x - b.x))
      }
      currentRow = [{ text: item.str, x: item.transform[4], y: item.transform[5] }]
    }
    lastY = y
  })
  
  if (currentRow.length > 1) {
     rows.push(currentRow.sort((a, b) => a.x - b.x))
  }

  return rows
}

function detectColumns(rows: any[]) {
  // Find consistent X positions across rows = columns
  const allX = rows.flatMap(row => row.map((cell: any) => Math.round(cell.x / 10) * 10))
  const xCounts: Record<string, number> = {}
  allX.forEach(x => { xCounts[x] = (xCounts[x] || 0) + 1 })

  // X positions appearing in many rows = column boundaries
  const colBoundaries = Object.entries(xCounts)
    .filter(([_, count]) => count > rows.length * 0.3)
    .map(([x]) => parseInt(x))
    .sort((a, b) => a - b)

  // Ensure 0 is the start boundary if not present
  if (colBoundaries.length > 0 && colBoundaries[0] > 50) {
     colBoundaries.unshift(0)
  }

  return colBoundaries
}

function assignCellsToColumns(row: any[], colBoundaries: number[]) {
  const cells = new Array(colBoundaries.length).fill('')
  row.forEach(item => {
    let colIndex = colBoundaries.findIndex((b, i) => {
      const next = colBoundaries[i + 1] || Infinity
      return item.x >= b - 10 && item.x < next // -10 tolerance
    })
    
    // Fallback if not found
    if (colIndex < 0) {
       colIndex = colBoundaries.length - 1
    }
    
    if (colIndex >= 0) {
      cells[colIndex] += (cells[colIndex] ? ' ' : '') + item.text
    }
  })
  return cells.map(c => c.trim())
}

export default function PDFToExcelClient() {
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progressMsg, setProgressMsg] = useState("")
  const [progressPercent, setProgressPercent] = useState(0)
  
  // Options
  const [firstRowHeader, setFirstRowHeader] = useState(true)
  const [oneSheetPerPage, setOneSheetPerPage] = useState(true)
  
  // Results
  const [extractedData, setExtractedData] = useState<any[] | null>(null) // Array of { pageNum, data: string[][] }
  const [activeTab, setActiveTab] = useState(0)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFiles = (newFiles: FileList | null) => {
    if (!newFiles || newFiles.length === 0) return
    const f = newFiles[0]
    
    if (f.type !== 'application/pdf') {
      alert("Please upload a PDF file")
      return
    }
    if (f.size > 50 * 1024 * 1024) {
      alert("File size exceeds 50MB limit.")
      return
    }
    
    setFile(f)
    setExtractedData(null)
  }

  const handleExtract = async () => {
    if (!file) return
    setIsProcessing(true)
    setProgressMsg("Initializing PDF parser...")
    setProgressPercent(10)
    
    try {
      const pdfjsLib = await getPdfjs()
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      
      const tableData = []
      
      for (let i = 1; i <= pdf.numPages; i++) {
        setProgressMsg(`Scanning page ${i} of ${pdf.numPages} for tables...`)
        setProgressPercent(10 + Math.round((i / pdf.numPages) * 80))
        
        const page = await pdf.getPage(i)
        const rows = await detectTables(page)
        
        if (rows.length > 0) {
           const colBoundaries = detectColumns(rows)
           if (colBoundaries.length > 0) {
              const grid = rows.map(r => assignCellsToColumns(r, colBoundaries))
              tableData.push({ pageNum: i, data: grid })
           }
        }
      }
      
      if (tableData.length === 0) {
         alert("No tabular data detected in this PDF. Please try another file.")
         setIsProcessing(false)
         setFile(null)
         return
      }
      
      setExtractedData(tableData)
      setActiveTab(0)
      setProgressPercent(100)
      setProgressMsg("Extraction complete!")
      
    } catch (err) {
      console.error(err)
      alert("An error occurred during extraction.")
    } finally {
      setIsProcessing(false)
    }
  }

  const createExcel = (data: any[], filename: string, isCsv = false) => {
    const wb = XLSX.utils.book_new()
    
    if (oneSheetPerPage) {
      data.forEach((pageObj, i) => {
        const ws = XLSX.utils.aoa_to_sheet(pageObj.data)
        
        if (firstRowHeader) {
           const range = XLSX.utils.decode_range(ws['!ref'] || "A1:A1")
           for (let C = range.s.c; C <= range.e.c; C++) {
             const cell = ws[XLSX.utils.encode_cell({r:0, c:C})]
             if (cell) {
               // Note: Basic XLSX community edition doesn't save styles, but we'll try to add it for compatibility
               cell.s = { font: { bold: true }, fill: { fgColor: { rgb: 'F97316' } } }
             }
           }
        }
        XLSX.utils.book_append_sheet(wb, ws, `Page ${pageObj.pageNum}`)
      })
    } else {
      // Combine all pages into one sheet
      const combined = data.flatMap((p, i) => {
         if (i > 0 && firstRowHeader) {
            // Remove header row from subsequent pages if we are combining
            return p.data.slice(1)
         }
         return p.data
      })
      const ws = XLSX.utils.aoa_to_sheet(combined)
      XLSX.utils.book_append_sheet(wb, ws, "Combined Tables")
    }

    if (isCsv) {
       // Just grab the first sheet for CSV
       const ws = wb.Sheets[wb.SheetNames[0]]
       const csv = XLSX.utils.sheet_to_csv(ws)
       const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
       saveAs(blob, filename + '.csv')
    } else {
       XLSX.writeFile(wb, filename + '.xlsx')
    }
  }

  const updateCell = (pageIndex: number, rIndex: number, cIndex: number, val: string) => {
     if (!extractedData) return
     const newData = [...extractedData]
     newData[pageIndex].data[rIndex][cIndex] = val
     setExtractedData(newData)
  }

  // Calculate stats
  const totalRows = extractedData?.reduce((acc, curr) => acc + curr.data.length, 0) || 0
  const maxCols = extractedData?.reduce((acc, curr) => Math.max(acc, curr.data[0]?.length || 0), 0) || 0

  return (
    <div className="bg-card rounded-3xl shadow-2xl overflow-hidden border border-border flex flex-col z-20 relative font-inter">
      <div className="p-8 md:p-12 space-y-8">
        
        {!file && (
          <div 
            className={`border-3 border-dashed rounded-2xl p-16 flex flex-col items-center justify-center transition-all duration-200 ease-in-out cursor-pointer min-h-[300px]
              ${isDragging ? 'border-brand-orange bg-brand-orange/5 scale-[1.02]' : 'border-border hover:border-brand-orange/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'}
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
            <h3 className="text-2xl font-bold font-syne mb-2 text-foreground">Upload PDF</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">Drag and drop your file here containing tables, or click to browse. Max size: 50MB.</p>
            <Button className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-full px-8 h-12 text-base font-semibold shadow-lg">
              Browse Files
            </Button>
          </div>
        )}

        {file && !extractedData && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* File Info */}
            <div className="bg-muted rounded-xl p-6 flex items-center justify-between border border-border">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Table className="size-8 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-lg text-foreground truncate max-w-[200px] md:max-w-md">{file.name}</h4>
                  <p className="text-sm text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <Button variant="outline" onClick={() => setFile(null)}>Change File</Button>
            </div>

            {/* Options */}
            <div className="bg-card border border-border rounded-xl p-6 md:p-8 space-y-6">
              <h3 className="text-xl font-bold font-syne">Extraction Options</h3>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Switch id="firstRowHeader" checked={firstRowHeader} onCheckedChange={(c: boolean) => setFirstRowHeader(c)} />
                    <label htmlFor="firstRowHeader" className="text-sm font-medium leading-none">
                      First row is table header
                    </label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Switch id="oneSheetPerPage" checked={oneSheetPerPage} onCheckedChange={(c: boolean) => setOneSheetPerPage(c)} />
                    <label htmlFor="oneSheetPerPage" className="text-sm font-medium leading-none">
                      Export one sheet per PDF page
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Extract Button */}
            <div className="flex justify-center pt-4">
              <Button 
                onClick={handleExtract} 
                disabled={isProcessing}
                className="bg-brand-orange hover:bg-brand-orange/90 text-white rounded-full px-12 h-14 text-lg font-bold shadow-xl shadow-brand-orange/20 w-full md:w-auto min-w-[250px]"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Analyzing Tables...
                  </>
                ) : (
                  "Extract to Excel"
                )}
              </Button>
            </div>

            {/* Progress */}
            {isProcessing && (
              <div className="space-y-3 mt-8">
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-muted-foreground">{progressMsg}</span>
                  <span className="text-brand-orange">{progressPercent}%</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-brand-orange rounded-full transition-all duration-300 ease-out" style={{ width: `${progressPercent}%` }} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Results View */}
        {extractedData && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-green-700 dark:text-green-400 font-medium">
                <CheckCircle2 className="size-6 shrink-0" />
                <span>Found tables across {extractedData.length} pages • {totalRows} rows • {maxCols} columns.</span>
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <Button 
                  onClick={() => createExcel(extractedData, file!.name.replace('.pdf', ''), true)}
                  variant="outline"
                  className="bg-white dark:bg-zinc-900 font-bold flex-1 md:flex-none"
                >
                  <Download className="mr-2 size-4" /> CSV
                </Button>
                <Button 
                  onClick={() => createExcel(extractedData, file!.name.replace('.pdf', ''), false)}
                  className="bg-[#107c41] hover:bg-[#107c41]/90 text-white font-bold flex-1 md:flex-none" // Excel Green
                >
                  <FileSpreadsheet className="mr-2 size-4" /> Download XLSX
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-syne font-bold text-xl">Interactive Preview</h3>
                <span className="text-xs text-zinc-500">You can edit the cells below to fix any extraction errors before downloading.</span>
              </div>
              
              <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white dark:bg-zinc-950">
                 {/* Tabs */}
                 <div className="flex overflow-x-auto bg-muted border-b border-zinc-200 dark:border-zinc-800 p-1 no-scrollbar">
                    {extractedData.map((page, idx) => (
                       <button
                         key={idx}
                         onClick={() => setActiveTab(idx)}
                         className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${activeTab === idx ? 'bg-white dark:bg-zinc-800 shadow text-brand-orange' : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'}`}
                       >
                         Page {page.pageNum}
                       </button>
                    ))}
                 </div>
                 
                 {/* Table */}
                 <div className="overflow-x-auto max-h-[500px] relative">
                    <table className="w-full text-sm text-left relative">
                       <thead className="text-xs text-zinc-700 uppercase bg-muted dark:text-zinc-400 sticky top-0 z-10 shadow-sm">
                          <tr>
                            <th className="w-12 px-2 py-3 text-center bg-muted border-r border-zinc-200 dark:border-zinc-800">#</th>
                            {extractedData[activeTab].data[0]?.map((_: any, cIdx: number) => (
                               <th key={cIdx} className="px-6 py-3 border-b border-zinc-200 dark:border-zinc-800 whitespace-nowrap">Column {cIdx + 1}</th>
                            ))}
                          </tr>
                       </thead>
                       <tbody>
                          {extractedData[activeTab].data.map((row: any, rIdx: number) => (
                             <tr key={rIdx} className="bg-white border-b dark:bg-zinc-950 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                                <td className="px-2 py-2 text-center text-zinc-400 bg-muted border-r border-zinc-200 dark:border-zinc-800">{rIdx + 1}</td>
                                {row.map((cell: string, cIdx: number) => (
                                   <td key={cIdx} className="px-2 py-1 min-w-[150px] border-r border-zinc-100 dark:border-zinc-800/50 last:border-r-0">
                                      <input 
                                        type="text" 
                                        value={cell} 
                                        onChange={(e) => updateCell(activeTab, rIdx, cIdx, e.target.value)}
                                        className="w-full bg-transparent px-2 py-1 outline-none focus:ring-1 focus:ring-brand-orange rounded hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                      />
                                   </td>
                                ))}
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </div>
            </div>
            
            <div className="flex justify-center pt-6 border-t border-zinc-200 dark:border-zinc-800">
               <Button variant="outline" onClick={() => { setFile(null); setExtractedData(null) }}>
                 Extract Another File
               </Button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
