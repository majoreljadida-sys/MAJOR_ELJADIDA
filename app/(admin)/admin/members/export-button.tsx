'use client'

import { Download } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatDate, MEMBER_STATUS_LABELS, MEMBER_CATEGORY_LABELS } from '@/lib/utils'

type ExportMember = {
  firstName:    string
  lastName:     string
  cin:          string | null
  dateOfBirth:  string | null
  tshirtSize:   string | null
  phone:        string | null
  email:        string
  category:     string | null
  group:        string | null
  status:       string
  licenseNumber: string | null
  certUrl:      string | null
  certExpiry:   string | null
  createdAt:    string
}

export function ExportMembersButton({ members, statusFilter }: {
  members: ExportMember[]
  statusFilter?: string
}) {
  function exportCsv() {
    if (members.length === 0) return toast.error('Aucun adhérent à exporter.')

    const headers = [
      'Nom', 'Prénom', 'CIN', 'Date de naissance', 'Taille T-shirt',
      'Téléphone', 'Email', 'Catégorie', 'Groupe', 'Statut',
      'N° Licence', 'Certificat médical', 'Expiration certificat', 'Inscrit le',
    ]
    const escape = (v: string | null | undefined) => {
      const s = (v ?? '').toString().replace(/"/g, '""')
      return /[",;\n]/.test(s) ? `"${s}"` : s
    }
    const rows = members.map(m => [
      escape(m.lastName),
      escape(m.firstName),
      escape(m.cin),
      escape(m.dateOfBirth ? formatDate(m.dateOfBirth, 'dd/MM/yyyy') : ''),
      escape(m.tshirtSize),
      escape(m.phone),
      escape(m.email),
      escape(m.category ? MEMBER_CATEGORY_LABELS[m.category] ?? m.category : ''),
      escape(m.group),
      escape(MEMBER_STATUS_LABELS[m.status] ?? m.status),
      escape(m.licenseNumber),
      escape(m.certUrl ? 'Oui' : 'Non'),
      escape(m.certExpiry ? formatDate(m.certExpiry, 'dd/MM/yyyy') : ''),
      escape(formatDate(m.createdAt, 'dd/MM/yyyy')),
    ].join(';'))

    // BOM UTF-8 pour qu'Excel ouvre correctement les accents
    const csv  = '﻿' + headers.join(';') + '\n' + rows.join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    const today  = new Date().toISOString().slice(0, 10)
    const suffix = statusFilter ? `_${statusFilter.toLowerCase()}` : ''
    a.href     = url
    a.download = `adherents_major${suffix}_${today}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success(`${members.length} adhérent${members.length > 1 ? 's' : ''} exporté${members.length > 1 ? 's' : ''}.`)
  }

  return (
    <button
      onClick={exportCsv}
      className="btn-secondary flex items-center gap-2 px-4 py-2.5 text-sm"
      title="Télécharge un fichier CSV (ouvrable dans Excel) avec toutes les infos des adhérents — utile pour les inscriptions aux courses, gestion club, etc.">
      <Download size={14} /> Exporter CSV
    </button>
  )
}
