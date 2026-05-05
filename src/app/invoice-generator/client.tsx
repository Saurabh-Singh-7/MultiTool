'use client'
import React, { useState } from 'react'

interface LineItem { description: string; qty: number; price: number }

export default function InvoiceClient() {
  const [from, setFrom] = useState({ name: 'Your Business Name', email: 'you@email.com', address: '123 Main St, City' })
  const [to, setTo] = useState({ name: 'Client Name', email: 'client@email.com', address: '456 Client Rd, Town' })
  const [invoiceNo, setInvoiceNo] = useState('INV-001')
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0])
  const [dueDate, setDueDate] = useState(() => { const d = new Date(); d.setDate(d.getDate() + 30); return d.toISOString().split('T')[0] })
  const [items, setItems] = useState<LineItem[]>([{ description: 'Web Development', qty: 1, price: 5000 }, { description: 'UI/UX Design', qty: 2, price: 2500 }])
  const [taxRate, setTaxRate] = useState(18)
  const [discount, setDiscount] = useState(0)
  const [currency, setCurrency] = useState('₹')
  const [notes, setNotes] = useState('Thank you for your business!')

  const addItem = () => setItems([...items, { description: '', qty: 1, price: 0 }])
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i))
  const updateItem = (i: number, field: keyof LineItem, value: string | number) => {
    const newItems = [...items]; (newItems[i] as Record<string, unknown>)[field] = value; setItems(newItems)
  }

  const subtotal = items.reduce((sum, item) => sum + item.qty * item.price, 0)
  const discountAmt = subtotal * (discount / 100)
  const taxable = subtotal - discountAmt
  const taxAmt = taxable * (taxRate / 100)
  const total = taxable + taxAmt

  const fmtCurrency = (n: number) => `${currency}${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  const printInvoice = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return
    printWindow.document.write(`<!DOCTYPE html><html><head><title>Invoice ${invoiceNo}</title>
      <style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Inter,Arial,sans-serif;padding:40px;color:#1a1a1a;max-width:800px;margin:0 auto}
      .header{display:flex;justify-content:space-between;margin-bottom:40px}.header h1{font-size:32px;color:#F97316}
      .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:30px;margin-bottom:40px}
      .info-box h3{font-size:12px;text-transform:uppercase;letter-spacing:2px;color:#888;margin-bottom:8px}
      .info-box p{font-size:14px;margin-bottom:4px}
      table{width:100%;border-collapse:collapse;margin-bottom:30px}th{text-align:left;padding:12px;border-bottom:2px solid #F97316;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#888}
      td{padding:12px;border-bottom:1px solid #eee;font-size:14px}.text-right{text-align:right}
      .totals{margin-left:auto;width:300px}.totals div{display:flex;justify-content:space-between;padding:8px 0;font-size:14px}
      .totals .total{font-size:20px;font-weight:bold;color:#F97316;border-top:2px solid #F97316;padding-top:12px;margin-top:8px}
      .notes{margin-top:40px;padding:20px;background:#f9fafb;border-radius:12px;font-size:13px;color:#666}
      @media print{body{padding:20px}}</style></head><body>
      <div class="header"><div><h1>INVOICE</h1><p style="color:#888">${invoiceNo}</p></div><div style="text-align:right"><p><strong>${from.name}</strong></p><p>${from.email}</p><p>${from.address}</p></div></div>
      <div class="info-grid"><div class="info-box"><h3>Bill To</h3><p><strong>${to.name}</strong></p><p>${to.email}</p><p>${to.address}</p></div>
      <div class="info-box" style="text-align:right"><h3>Details</h3><p>Date: ${invoiceDate}</p><p>Due: ${dueDate}</p></div></div>
      <table><thead><tr><th>Description</th><th class="text-right">Qty</th><th class="text-right">Price</th><th class="text-right">Total</th></tr></thead><tbody>
      ${items.map(item => `<tr><td>${item.description}</td><td class="text-right">${item.qty}</td><td class="text-right">${fmtCurrency(item.price)}</td><td class="text-right">${fmtCurrency(item.qty * item.price)}</td></tr>`).join('')}
      </tbody></table>
      <div class="totals"><div><span>Subtotal</span><span>${fmtCurrency(subtotal)}</span></div>
      ${discount > 0 ? `<div><span>Discount (${discount}%)</span><span>-${fmtCurrency(discountAmt)}</span></div>` : ''}
      <div><span>Tax (${taxRate}%)</span><span>${fmtCurrency(taxAmt)}</span></div>
      <div class="total"><span>Total</span><span>${fmtCurrency(total)}</span></div></div>
      ${notes ? `<div class="notes"><strong>Notes:</strong> ${notes}</div>` : ''}
      </body></html>`)
    printWindow.document.close()
    setTimeout(() => printWindow.print(), 500)
  }

  const Input = ({ label, value, onChange, type = 'text', className = '' }: { label: string; value: string; onChange: (v: string) => void; type?: string; className?: string }) => (
    <div className={className}>
      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-muted/30 border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/50" />
    </div>
  )

  return (
    <div className="space-y-6">
      {/* From / To */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-card border border-border p-6 rounded-[2rem] shadow-sm space-y-4">
          <h3 className="font-bold font-syne text-lg">From (Your Details)</h3>
          <Input label="Business Name" value={from.name} onChange={(v) => setFrom({ ...from, name: v })} />
          <Input label="Email" value={from.email} onChange={(v) => setFrom({ ...from, email: v })} type="email" />
          <Input label="Address" value={from.address} onChange={(v) => setFrom({ ...from, address: v })} />
        </div>
        <div className="bg-card border border-border p-6 rounded-[2rem] shadow-sm space-y-4">
          <h3 className="font-bold font-syne text-lg">Bill To (Client)</h3>
          <Input label="Client Name" value={to.name} onChange={(v) => setTo({ ...to, name: v })} />
          <Input label="Email" value={to.email} onChange={(v) => setTo({ ...to, email: v })} type="email" />
          <Input label="Address" value={to.address} onChange={(v) => setTo({ ...to, address: v })} />
        </div>
      </div>

      {/* Invoice Details */}
      <div className="bg-card border border-border p-6 rounded-[2rem] shadow-sm">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <Input label="Invoice #" value={invoiceNo} onChange={setInvoiceNo} />
          <Input label="Date" value={invoiceDate} onChange={setInvoiceDate} type="date" />
          <Input label="Due Date" value={dueDate} onChange={setDueDate} type="date" />
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5">Currency</label>
            <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full bg-muted/30 border border-border rounded-xl px-3 py-2 text-sm">
              <option value="₹">₹ INR</option><option value="$">$ USD</option><option value="€">€ EUR</option><option value="£">£ GBP</option>
            </select>
          </div>
        </div>

        {/* Line Items */}
        <div className="space-y-3">
          <div className="grid grid-cols-12 gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">
            <span className="col-span-5">Description</span><span className="col-span-2 text-right">Qty</span><span className="col-span-3 text-right">Price</span><span className="col-span-2 text-right">Total</span>
          </div>
          {items.map((item, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 items-center group">
              <input value={item.description} onChange={(e) => updateItem(i, 'description', e.target.value)} placeholder="Item description"
                className="col-span-5 bg-muted/20 border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/50" />
              <input type="number" value={item.qty} onChange={(e) => updateItem(i, 'qty', parseFloat(e.target.value) || 0)} min={0}
                className="col-span-2 bg-muted/20 border border-border rounded-xl px-3 py-2.5 text-sm text-right font-mono focus:outline-none" />
              <input type="number" value={item.price} onChange={(e) => updateItem(i, 'price', parseFloat(e.target.value) || 0)} min={0}
                className="col-span-3 bg-muted/20 border border-border rounded-xl px-3 py-2.5 text-sm text-right font-mono focus:outline-none" />
              <div className="col-span-2 flex items-center justify-end gap-2">
                <span className="font-mono text-sm font-bold">{fmtCurrency(item.qty * item.price)}</span>
                <button onClick={() => removeItem(i)} className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity text-lg">×</button>
              </div>
            </div>
          ))}
          <button onClick={addItem} className="w-full py-2 border-2 border-dashed border-border rounded-xl text-sm font-bold text-muted-foreground hover:border-brand-orange hover:text-brand-orange transition-all">+ Add Line Item</button>
        </div>
      </div>

      {/* Totals + Notes */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-card border border-border p-6 rounded-[2rem] shadow-sm space-y-4">
          <Input label="Notes / Payment Terms" value={notes} onChange={setNotes} />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5">Tax Rate (%)</label>
              <input type="number" value={taxRate} onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)} min={0} max={100}
                className="w-full bg-muted/30 border border-border rounded-xl px-3 py-2 text-sm font-mono text-right" />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5">Discount (%)</label>
              <input type="number" value={discount} onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)} min={0} max={100}
                className="w-full bg-muted/30 border border-border rounded-xl px-3 py-2 text-sm font-mono text-right" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border p-6 rounded-[2rem] shadow-sm space-y-3">
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span className="font-mono font-bold">{fmtCurrency(subtotal)}</span></div>
          {discount > 0 && <div className="flex justify-between text-sm"><span className="text-muted-foreground">Discount ({discount}%)</span><span className="font-mono text-green-500">-{fmtCurrency(discountAmt)}</span></div>}
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">Tax ({taxRate}%)</span><span className="font-mono">{fmtCurrency(taxAmt)}</span></div>
          <div className="flex justify-between text-xl font-bold pt-4 border-t border-border"><span>Total</span><span className="text-brand-orange font-mono">{fmtCurrency(total)}</span></div>
          <button onClick={printInvoice} className="w-full mt-4 py-4 bg-brand-orange hover:bg-brand-orange-hover text-white font-bold rounded-2xl transition-all shadow-md shadow-brand-orange/20 text-lg">
            📄 Download / Print PDF
          </button>
        </div>
      </div>
    </div>
  )
}
