'use client'
import React, { useState } from 'react'

const SAMPLE = `# Hello World 👋

Welcome to the **ToolHive Markdown Editor**!

## Features
- ✅ Live preview
- ✅ GitHub Flavored Markdown
- ✅ Code blocks with syntax hints
- ✅ Tables, lists, and more

## Code Block
\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}
\`\`\`

## Table
| Feature | Status |
|---------|--------|
| Bold    | ✅     |
| Italic  | ✅     |
| Links   | ✅     |

## Links & Images
[Visit ToolHive](https://toolhive.app)

> **Tip:** Edit the left panel and see the preview update in real-time!

---
*Made with ❤️ by ToolHive*
`

// Simple markdown to HTML converter (no dependencies)
function mdToHtml(md: string): string {
  let html = md
    // Code blocks
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="bg-[#0d1117] text-[#c9d1d9] p-4 rounded-xl overflow-x-auto text-sm my-4 border border-[#21262d]"><code>$2</code></pre>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code class="bg-muted px-1.5 py-0.5 rounded text-sm text-brand-orange">$1</code>')
    // Headers
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold mt-6 mb-2 font-syne">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold mt-8 mb-3 font-syne">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-3xl font-extrabold mt-8 mb-4 font-syne">$1</h1>')
    // Blockquotes
    .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-brand-orange pl-4 my-4 text-muted-foreground italic">$1</blockquote>')
    // Bold & Italic
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-brand-orange hover:underline" target="_blank">$1</a>')
    // Horizontal rule
    .replace(/^---$/gm, '<hr class="my-6 border-border" />')
    // Unordered list
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
    // Table (basic)
    .replace(/^\|(.+)\|$/gm, (match) => {
      const cells = match.split('|').filter(c => c.trim())
      if (cells.every(c => /^[\s-:]+$/.test(c))) return '<!--sep-->'
      const tag = 'td'
      return '<tr>' + cells.map(c => `<${tag} class="border border-border px-3 py-2 text-sm">${c.trim()}</${tag}>`).join('') + '</tr>'
    })
    // Paragraphs
    .replace(/\n\n/g, '</p><p class="my-3 leading-relaxed">')

  // Wrap lists
  html = html.replace(/((?:<li[^>]*>.*<\/li>\n?)+)/g, '<ul class="my-4 space-y-1">$1</ul>')
  // Wrap tables
  html = html.replace(/((?:<tr>.*<\/tr>\n?)+)/g, '<table class="w-full border-collapse my-4 border border-border rounded-xl overflow-hidden">$1</table>')
  html = html.replace(/<!--sep-->\n?/g, '')

  return '<p class="my-3 leading-relaxed">' + html + '</p>'
}

export default function MarkdownClient() {
  const [md, setMd] = useState(SAMPLE)
  const [copied, setCopied] = useState(false)
  const [copiedHtml, setCopiedHtml] = useState(false)

  const copy = (text: string, setter: (v: boolean) => void) => {
    navigator.clipboard.writeText(text); setter(true); setTimeout(() => setter(false), 2000)
  }

  const wordCount = md.trim().split(/\s+/).filter(Boolean).length

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center justify-between bg-card border border-border p-3 rounded-2xl">
        <div className="flex gap-2">
          <button onClick={() => copy(md, setCopied)} className="px-4 py-2 bg-brand-orange hover:bg-brand-orange-hover text-white rounded-xl text-sm font-bold transition-all">{copied ? '✓ Copied!' : '📋 Copy MD'}</button>
          <button onClick={() => copy(mdToHtml(md), setCopiedHtml)} className="px-4 py-2 bg-muted border border-border rounded-xl text-sm font-bold transition-all">{copiedHtml ? '✓ Copied!' : '🌐 Copy HTML'}</button>
          <button onClick={() => setMd('')} className="px-4 py-2 bg-muted border border-border rounded-xl text-sm font-bold hover:text-red-500 transition-all">🗑️ Clear</button>
        </div>
        <span className="text-xs text-muted-foreground">{wordCount} words · {md.length} chars</span>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 min-h-[600px]">
        <div className="bg-card border border-border rounded-[2rem] shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-3 border-b border-border bg-muted/10"><h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground">Markdown</h3></div>
          <textarea value={md} onChange={(e) => setMd(e.target.value)} spellCheck={false}
            className="flex-1 w-full bg-[#0d1117] text-[#c9d1d9] p-6 resize-none focus:outline-none font-mono text-sm leading-relaxed" />
        </div>
        <div className="bg-card border border-border rounded-[2rem] shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-3 border-b border-border bg-muted/10"><h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground">Preview</h3></div>
          <div className="flex-1 p-6 overflow-auto prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: mdToHtml(md) }} />
        </div>
      </div>
    </div>
  )
}
