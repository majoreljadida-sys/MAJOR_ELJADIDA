'use client'

import { Download } from 'lucide-react'

interface Row { name: string; sizes: [string, number][]; qty: number; amount: number }

/** Exporte la commande groupée fournisseur en CSV (ouvrable dans Excel). */
export function GroupedExportButton({ rows }: { rows: Row[] }) {
  function download() {
    const q = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`
    const lines = [['Article', 'Taille', 'Quantité'].map(q).join(';')]
    for (const r of rows) for (const [size, n] of r.sizes) lines.push([r.name, size, n].map(q).join(';'))
    const blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `commande-groupee-store-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(a.href)
  }
  return (
    <button onClick={download} disabled={rows.length === 0}
      className="btn-secondary text-sm px-4 py-2 disabled:opacity-40 disabled:cursor-not-allowed">
      <Download size={14} /> Exporter (Excel)
    </button>
  )
}
