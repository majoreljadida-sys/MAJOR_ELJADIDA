'use client'

import { Download } from 'lucide-react'
import { getExpenseCategory, getPaymentMethod } from '@/lib/expenses'

interface Row {
  date:          string
  category:      string
  description:   string
  amount:        number
  supplier:      string
  paymentMethod: string
  event:         string
}

export function ExpenseExportButton({ expenses }: { expenses: Row[] }) {
  function toCsv() {
    const header = ['Date', 'Groupe', 'Catégorie', 'Description', 'Fournisseur', 'Montant (MAD)', 'Mode', 'Événement']
    const esc = (v: string | number | null) => {
      if (v == null) return ''
      const s = String(v)
      return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
    }
    const rows = expenses.map(e => {
      const cat = getExpenseCategory(e.category)
      const pm  = getPaymentMethod(e.paymentMethod)
      return [
        esc(e.date.slice(0, 10)),
        esc(cat?.group ?? ''),
        esc(cat?.label ?? e.category),
        esc(e.description),
        esc(e.supplier),
        esc(e.amount),
        esc(pm?.label ?? e.paymentMethod),
        esc(e.event),
      ].join(';')
    })
    return '﻿' + [header.join(';'), ...rows].join('\r\n')
  }

  function download() {
    const csv  = toCsv()
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    const date = new Date().toISOString().slice(0, 10)
    a.href = url
    a.download = `depenses-major-${date}.csv`
    document.body.appendChild(a); a.click(); document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <button type="button" onClick={download} disabled={expenses.length === 0}
      className="btn-secondary px-4 py-2 text-sm flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
      <Download size={14} /> Exporter CSV ({expenses.length})
    </button>
  )
}
