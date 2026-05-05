'use client'

import React, { useState, useCallback } from 'react'

type ViewMode = 'formatted' | 'tree'

interface TreeNode {
  key: string
  value: unknown
  type: string
  children?: TreeNode[]
}

const SAMPLE_JSON = `{
  "name": "ToolHive",
  "version": "1.0.0",
  "description": "Free online tools",
  "features": ["Image Tools", "PDF Tools", "Calculators"],
  "stats": {
    "tools": 50,
    "users": 100000,
    "free": true
  },
  "links": {
    "website": "https://toolhive.app",
    "github": null
  }
}`

export default function JsonFormatterClient() {
  const [input, setInput] = useState(SAMPLE_JSON)
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isValid, setIsValid] = useState<boolean | null>(null)
  const [indentSize, setIndentSize] = useState(2)
  const [viewMode, setViewMode] = useState<ViewMode>('formatted')
  const [treeData, setTreeData] = useState<TreeNode[]>([])
  const [copied, setCopied] = useState(false)
  const [stats, setStats] = useState({ keys: 0, depth: 0, size: '' })

  const getDepth = (obj: unknown, d = 0): number => {
    if (typeof obj !== 'object' || obj === null) return d
    const vals = Array.isArray(obj) ? obj : Object.values(obj)
    if (vals.length === 0) return d
    return Math.max(...vals.map(v => getDepth(v, d + 1)))
  }

  const countKeys = (obj: unknown): number => {
    if (typeof obj !== 'object' || obj === null) return 0
    if (Array.isArray(obj)) return obj.reduce((acc: number, v) => acc + countKeys(v), 0)
    return Object.keys(obj).length + Object.values(obj).reduce((acc: number, v) => acc + countKeys(v), 0)
  }

  const buildTree = (key: string, value: unknown): TreeNode => {
    const type = value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value
    if (type === 'object' || type === 'array') {
      const entries = Array.isArray(value)
        ? (value as unknown[]).map((v, i) => buildTree(`[${i}]`, v))
        : Object.entries(value as Record<string, unknown>).map(([k, v]) => buildTree(k, v))
      return { key, value, type, children: entries }
    }
    return { key, value, type }
  }

  const formatJSON = useCallback(() => {
    try {
      const parsed = JSON.parse(input)
      const formatted = JSON.stringify(parsed, null, indentSize)
      setOutput(formatted)
      setError(null)
      setIsValid(true)
      setTreeData([buildTree('root', parsed)])
      setStats({
        keys: countKeys(parsed),
        depth: getDepth(parsed),
        size: new Blob([input]).size > 1024 ? `${(new Blob([input]).size / 1024).toFixed(1)} KB` : `${new Blob([input]).size} B`
      })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid JSON'
      setError(msg)
      setIsValid(false)
      setOutput('')
      setTreeData([])
    }
  }, [input, indentSize])

  const minifyJSON = () => {
    try {
      const parsed = JSON.parse(input)
      const minified = JSON.stringify(parsed)
      setOutput(minified)
      setInput(minified)
      setError(null)
      setIsValid(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid JSON')
      setIsValid(false)
    }
  }

  const sortKeys = () => {
    try {
      const parsed = JSON.parse(input)
      const sortObj = (obj: unknown): unknown => {
        if (Array.isArray(obj)) return obj.map(sortObj)
        if (typeof obj === 'object' && obj !== null) {
          return Object.keys(obj as Record<string, unknown>).sort().reduce((acc: Record<string, unknown>, key) => {
            acc[key] = sortObj((obj as Record<string, unknown>)[key])
            return acc
          }, {})
        }
        return obj
      }
      const sorted = sortObj(parsed)
      const formatted = JSON.stringify(sorted, null, indentSize)
      setInput(formatted)
      setOutput(formatted)
      setError(null)
      setIsValid(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid JSON')
      setIsValid(false)
    }
  }

  const copyOutput = () => {
    navigator.clipboard.writeText(output || input)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Auto-format on load
  React.useEffect(() => { formatJSON() }, [])

  // ─── TREE VIEW COMPONENT ──────────────────────────────────────────────

  const TreeNodeView = ({ node, depth = 0 }: { node: TreeNode; depth?: number }) => {
    const [expanded, setExpanded] = useState(depth < 3)
    const hasChildren = node.children && node.children.length > 0
    const isRoot = node.key === 'root'

    const renderValue = () => {
      if (node.type === 'string') return <span className="text-green-400">&quot;{String(node.value)}&quot;</span>
      if (node.type === 'number') return <span className="text-blue-400">{String(node.value)}</span>
      if (node.type === 'boolean') return <span className="text-purple-400">{String(node.value)}</span>
      if (node.type === 'null') return <span className="text-red-400">null</span>
      return null
    }

    return (
      <div style={{ paddingLeft: isRoot ? 0 : 20 }}>
        <div
          className={`flex items-center gap-1 py-0.5 rounded-md hover:bg-muted/30 cursor-pointer transition-colors text-sm font-mono ${isRoot ? 'font-bold' : ''}`}
          onClick={() => hasChildren && setExpanded(!expanded)}
        >
          {hasChildren ? (
            <span className="text-muted-foreground w-4 text-center text-xs">{expanded ? '▼' : '▶'}</span>
          ) : (
            <span className="w-4" />
          )}
          {!isRoot && <span className="text-brand-orange font-semibold">{node.key}</span>}
          {!isRoot && hasChildren && <span className="text-muted-foreground">:</span>}
          {hasChildren && (
            <span className="text-muted-foreground text-xs ml-1">
              {node.type === 'array' ? `Array[${node.children!.length}]` : `Object{${node.children!.length}}`}
            </span>
          )}
          {!hasChildren && !isRoot && (
            <>
              <span className="text-muted-foreground mx-1">:</span>
              {renderValue()}
            </>
          )}
        </div>
        {hasChildren && expanded && (
          <div>
            {node.children!.map((child, i) => (
              <TreeNodeView key={`${child.key}-${i}`} node={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    )
  }

  // ─── SYNTAX HIGHLIGHTING ──────────────────────────────────────────────

  const highlightJSON = (json: string) => {
    if (!json) return ''
    return json
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"([^"]+)"(?=\s*:)/g, '<span class="text-brand-orange font-semibold">"$1"</span>')
      .replace(/:\s*"([^"]*)"/g, ': <span class="text-green-400">"$1"</span>')
      .replace(/:\s*(\d+\.?\d*)/g, ': <span class="text-blue-400">$1</span>')
      .replace(/:\s*(true|false)/g, ': <span class="text-purple-400">$1</span>')
      .replace(/:\s*(null)/g, ': <span class="text-red-400">$1</span>')
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="bg-card border border-border p-4 rounded-2xl shadow-sm flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-2">
          <button onClick={formatJSON} className="px-4 py-2 bg-brand-orange hover:bg-brand-orange-hover text-white font-bold rounded-xl text-sm transition-all shadow-sm">✨ Format</button>
          <button onClick={minifyJSON} className="px-4 py-2 bg-muted hover:bg-muted/80 border border-border font-bold rounded-xl text-sm transition-all">🗜️ Minify</button>
          <button onClick={sortKeys} className="px-4 py-2 bg-muted hover:bg-muted/80 border border-border font-bold rounded-xl text-sm transition-all">🔤 Sort Keys</button>
          <button onClick={copyOutput} className="px-4 py-2 bg-muted hover:bg-muted/80 border border-border font-bold rounded-xl text-sm transition-all">
            {copied ? '✓ Copied!' : '📋 Copy'}
          </button>
          <button onClick={() => { setInput(''); setOutput(''); setError(null); setIsValid(null); setTreeData([]) }}
            className="px-4 py-2 bg-muted hover:bg-red-500/10 hover:text-red-500 border border-border font-bold rounded-xl text-sm transition-all">🗑️ Clear</button>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-muted-foreground">Indent:</span>
            {[2, 4].map(s => (
              <button key={s} onClick={() => setIndentSize(s)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${indentSize === s ? 'bg-brand-orange text-white' : 'bg-muted border border-border'}`}>
                {s}
              </button>
            ))}
          </div>
          <div className="bg-muted/50 p-1 rounded-xl flex text-xs font-bold">
            <button onClick={() => setViewMode('formatted')} className={`px-3 py-1.5 rounded-lg transition-all ${viewMode === 'formatted' ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}>Code</button>
            <button onClick={() => setViewMode('tree')} className={`px-3 py-1.5 rounded-lg transition-all ${viewMode === 'tree' ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}>Tree</button>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      {isValid !== null && (
        <div className={`flex items-center justify-between p-3 rounded-xl text-sm font-medium ${isValid ? 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'}`}>
          <div className="flex items-center gap-2">
            <span>{isValid ? '✅' : '❌'}</span>
            <span>{isValid ? 'Valid JSON' : `Invalid JSON: ${error}`}</span>
          </div>
          {isValid && (
            <div className="flex gap-4 text-xs opacity-80">
              <span>{stats.keys} keys</span>
              <span>Depth {stats.depth}</span>
              <span>{stats.size}</span>
            </div>
          )}
        </div>
      )}

      {/* Editor Panels */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input */}
        <div className="bg-card border border-border rounded-[2rem] shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-3 border-b border-border bg-muted/10 flex justify-between items-center">
            <h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground">Input JSON</h3>
            <button onClick={() => setInput(SAMPLE_JSON)} className="text-xs text-brand-orange hover:underline">Load Sample</button>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Tab') { e.preventDefault(); const s = e.currentTarget.selectionStart; setInput(input.substring(0, s) + '  ' + input.substring(e.currentTarget.selectionEnd)); setTimeout(() => { e.currentTarget.selectionStart = e.currentTarget.selectionEnd = s + 2 }, 0) }}}
            placeholder='Paste your JSON here...'
            spellCheck={false}
            className="flex-1 w-full bg-[#0d1117] text-[#c9d1d9] p-6 resize-none focus:outline-none font-mono text-sm leading-relaxed min-h-[500px]"
          />
        </div>

        {/* Output */}
        <div className="bg-card border border-border rounded-[2rem] shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-3 border-b border-border bg-muted/10 flex justify-between items-center">
            <h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground">
              {viewMode === 'formatted' ? 'Formatted Output' : 'Tree View'}
            </h3>
            {output && <span className="text-xs text-muted-foreground">{output.split('\n').length} lines</span>}
          </div>

          {viewMode === 'formatted' ? (
            <div className="flex-1 overflow-auto bg-[#0d1117] min-h-[500px]">
              {output ? (
                <div className="flex">
                  <div className="py-6 pr-2 pl-4 text-right select-none text-[#484f58] font-mono text-sm leading-relaxed border-r border-[#21262d] min-w-[48px]">
                    {output.split('\n').map((_, i) => <div key={i}>{i + 1}</div>)}
                  </div>
                  <pre
                    className="p-6 font-mono text-sm leading-relaxed text-[#c9d1d9] overflow-x-auto flex-1"
                    dangerouslySetInnerHTML={{ __html: highlightJSON(output) }}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground p-12 text-center">
                  <div>
                    <div className="text-5xl mb-4 opacity-40">{ }</div>
                    <p>Click <strong>Format</strong> or paste JSON to see output</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 overflow-auto bg-[#0d1117] p-6 min-h-[500px] text-[#c9d1d9]">
              {treeData.length > 0 ? (
                treeData.map((node, i) => <TreeNodeView key={i} node={node} />)
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground text-center">
                  <div>
                    <div className="text-5xl mb-4 opacity-40">🌳</div>
                    <p>Format valid JSON to see the tree view</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
