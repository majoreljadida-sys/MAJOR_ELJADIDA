'use client'

import { Download } from 'lucide-react'

interface MemberRow {
  firstName: string
  lastName:  string
  email:     string
  phone:     string | null
  roles:     string
  status:    string
}

interface Props {
  members: MemberRow[]
}

export function AssociationExportButton({ members }: Props) {
  function toCsv() {
    const header = ['Prénom', 'Nom', 'Email', 'Téléphone', 'Rôles', 'Statut']
    const esc = (v: string | null) => {
      if (v == null) return ''
      const s = String(v)
      return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
    }
    const rows = members.map(m => [
      esc(m.firstName), esc(m.lastName), esc(m.email),
      esc(m.phone), esc(m.roles), esc(m.status),
    ].join(';'))
    return '﻿' + [header.join(';'), ...rows].join('\r\n') // BOM pour Excel FR
  }

  function download() {
    const csv  = toCsv()
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    const date = new Date().toISOString().slice(0, 10)
    a.href = url
    a.download = `association-major-${date}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <button
      type="button"
      onClick={download}
      disabled={members.length === 0}
      className="btn-primary px-4 py-2 text-sm flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
    >
      <Download size={14} />
      Exporter CSV ({members.length})
    </button>
  )
}
