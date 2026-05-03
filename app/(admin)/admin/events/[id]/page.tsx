'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Trash2, Youtube, Users, Phone, Clock, X, CheckCircle2, Circle, Loader2, Download, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import { extractYoutubeId } from '@/lib/youtube'
import { formatDate } from '@/lib/utils'

type Registration = {
  id: string
  status: string
  createdAt: string
  paidAt: string | null
  member: {
    id: string; firstName: string; lastName: string; phone: string | null; photo: string | null
    cin: string | null
    tshirtSize: string | null
    dateOfBirth: string | null
  }
}

const EVENT_TYPES = [
  { value: 'RACE',       label: 'Course officielle'        },
  { value: 'TRAINING',   label: 'Sortie entraînement'      },
  { value: 'STAGE',      label: 'Stage / Camp'             },
  { value: 'COMMUNITY',  label: 'Événement communautaire'  },
  { value: 'OTHER',      label: 'Autre'                    },
]

const EVENT_STATUSES = [
  { value: 'UPCOMING',   label: 'À venir'   },
  { value: 'ONGOING',    label: 'En cours'  },
  { value: 'COMPLETED',  label: 'Terminé'   },
  { value: 'CANCELLED',  label: 'Annulé'    },
]

export default function EditEventPage() {
  const router = useRouter()
  const { id }  = useParams<{ id: string }>()
  const [loading,  setLoading]  = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [eventTitle,    setEventTitle]    = useState('')
  const [removingId,    setRemovingId]    = useState<string | null>(null)
  const [togglingPayId, setTogglingPayId] = useState<string | null>(null)
  const [search,        setSearch]        = useState('')
  const [statusFilter,  setStatusFilter]  = useState<'all' | 'CONFIRMED' | 'WAITING' | 'CANCELLED'>('all')
  const [payFilter,     setPayFilter]     = useState<'all' | 'paid' | 'unpaid'>('all')
  const [form, setForm] = useState({
    title: '', type: 'RACE', date: '', location: '', description: '',
    maxParticipants: '', price: '', distance: '', status: 'UPCOMING', videoUrl: '',
  })

  useEffect(() => {
    fetch(`/api/events/${id}`)
      .then(r => r.json())
      .then(({ event }) => {
        if (!event) return
        const d = new Date(event.date)
        const pad = (n: number) => String(n).padStart(2, '0')
        const localDate = `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
        setForm({
          title:           event.title          ?? '',
          type:            event.type           ?? 'RACE',
          date:            localDate,
          location:        event.location       ?? '',
          description:     event.description    ?? '',
          maxParticipants: event.maxParticipants ? String(event.maxParticipants) : '',
          price:           event.price          ? String(event.price) : '',
          distance:        event.distance       ?? '',
          status:          event.status         ?? 'UPCOMING',
          videoUrl:        event.videoUrl        ?? '',
        })
        setEventTitle(event.title ?? '')
        setRegistrations(event.registrations ?? [])
      })
  }, [id])

  async function removeRegistration(reg: Registration) {
    if (!confirm(`Retirer ${reg.member.firstName} ${reg.member.lastName} de la liste ?`)) return
    setRemovingId(reg.id)
    try {
      const res = await fetch(`/api/events/${id}/registrations/${reg.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setRegistrations(rs => rs.filter(r => r.id !== reg.id))
      toast.success('Inscription retirée.')
      router.refresh()
    } catch (err: any) {
      toast.error(err.message ?? 'Erreur.')
    } finally {
      setRemovingId(null)
    }
  }

  function exportCsv() {
    if (registrations.length === 0) return toast.error('Aucun inscrit à exporter.')
    const headers = ['Nom', 'Prénom', 'CIN', 'Date de naissance', 'Taille T-shirt', 'Téléphone', 'Statut', 'Paiement', 'Inscrit le']
    const escape = (v: string | null | undefined) => {
      const s = (v ?? '').toString().replace(/"/g, '""')
      return /[",;\n]/.test(s) ? `"${s}"` : s
    }
    const rows = registrations.map(r => [
      escape(r.member.lastName),
      escape(r.member.firstName),
      escape(r.member.cin),
      escape(r.member.dateOfBirth ? formatDate(r.member.dateOfBirth, 'dd/MM/yyyy') : ''),
      escape(r.member.tshirtSize),
      escape(r.member.phone),
      escape(r.status === 'CONFIRMED' ? 'Confirmé' : r.status === 'WAITING' ? 'Liste d\'attente' : 'Annulé'),
      escape(r.paidAt ? `Payé le ${formatDate(r.paidAt, 'dd/MM/yyyy')}` : 'Non payé'),
      escape(formatDate(r.createdAt, 'dd/MM/yyyy HH:mm')),
    ].join(';'))
    // BOM UTF-8 pour qu'Excel ouvre correctement les accents
    const csv = '﻿' + headers.join(';') + '\n' + rows.join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    const safeTitle = (eventTitle || 'evenement').replace(/[^a-z0-9]/gi, '_').toLowerCase()
    a.href     = url
    a.download = `inscrits_${safeTitle}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success(`${registrations.length} inscrit${registrations.length > 1 ? 's' : ''} exporté${registrations.length > 1 ? 's' : ''}.`)
  }

  async function togglePaid(reg: Registration) {
    const newPaid = !reg.paidAt
    setTogglingPayId(reg.id)
    try {
      const res = await fetch(`/api/events/${id}/registrations/${reg.id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ paid: newPaid }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setRegistrations(rs => rs.map(r => r.id === reg.id ? { ...r, paidAt: data.registration.paidAt } : r))
      toast.success(newPaid ? '✅ Paiement validé !' : 'Validation retirée.')
    } catch (err: any) {
      toast.error(err.message ?? 'Erreur.')
    } finally {
      setTogglingPayId(null)
    }
  }

  function set(key: string, value: string) { setForm(f => ({ ...f, [key]: value })) }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch(`/api/events/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? 'Erreur'); return }
      toast.success('Événement mis à jour !')
      router.push('/admin/events')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!confirm(`Supprimer "${form.title}" ? Cette action est irréversible.`)) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/events/${id}`, { method: 'DELETE' })
      if (!res.ok) { toast.error('Erreur suppression'); return }
      toast.success('Événement supprimé')
      router.push('/admin/events')
    } finally {
      setDeleting(false)
    }
  }

  const videoId = extractYoutubeId(form.videoUrl)

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/events" className="text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="font-bebas text-4xl text-white tracking-widest">MODIFIER L'ÉVÉNEMENT</h1>
      </div>

      <form onSubmit={handleSave} className="space-y-5 card-dark">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="form-label">Titre *</label>
            <input className="input-dark" required value={form.title} onChange={e => set('title', e.target.value)} />
          </div>

          <div>
            <label className="form-label">Type *</label>
            <select className="input-dark" value={form.type} onChange={e => set('type', e.target.value)}>
              {EVENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>

          <div>
            <label className="form-label">Statut</label>
            <select className="input-dark" value={form.status} onChange={e => set('status', e.target.value)}>
              {EVENT_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>

          <div>
            <label className="form-label">Date *</label>
            <input type="datetime-local" className="input-dark" required
              value={form.date} onChange={e => set('date', e.target.value)} />
          </div>

          <div>
            <label className="form-label">Lieu *</label>
            <input className="input-dark" required value={form.location} onChange={e => set('location', e.target.value)} />
          </div>

          <div>
            <label className="form-label">Distance</label>
            <input className="input-dark" value={form.distance}
              onChange={e => set('distance', e.target.value)} placeholder="10 km, Semi-marathon..." />
          </div>

          <div>
            <label className="form-label">Participants max</label>
            <input type="number" className="input-dark" value={form.maxParticipants}
              onChange={e => set('maxParticipants', e.target.value)} min="0" />
          </div>

          <div>
            <label className="form-label">Prix (MAD)</label>
            <input type="number" className="input-dark" value={form.price}
              onChange={e => set('price', e.target.value)} min="0" step="0.01" />
          </div>

          <div className="sm:col-span-2">
            <label className="form-label">Description</label>
            <textarea className="input-dark resize-none" rows={4} value={form.description}
              onChange={e => set('description', e.target.value)} />
          </div>

          {/* Vidéo YouTube */}
          <div className="sm:col-span-2">
            <label className="form-label flex items-center gap-2">
              <Youtube size={16} className="text-red-500" />
              Vidéo YouTube (compte-rendu de l'événement)
            </label>
            <input className="input-dark" value={form.videoUrl}
              onChange={e => set('videoUrl', e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..." />
            <p className="text-gray-600 text-xs font-inter mt-1">
              Allez sur YouTube → ouvrez la vidéo → copiez l'URL depuis la barre d'adresse.
            </p>
          </div>

          {/* Prévisualisation */}
          {videoId && (
            <div className="sm:col-span-2">
              <p className="text-xs text-major-accent font-inter mb-2">Aperçu de la vidéo :</p>
              <div className="relative w-full rounded-xl overflow-hidden" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title="Aperçu YouTube"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-800">
          <div className="flex gap-3">
            <button type="submit" disabled={loading}
              className="btn-primary gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
              <Save size={16} />
              {loading ? 'Enregistrement...' : 'Sauvegarder'}
            </button>
            <Link href="/admin/events" className="btn-secondary">Annuler</Link>
          </div>
          <button type="button" onClick={handleDelete} disabled={deleting}
            className="btn-danger gap-2 disabled:opacity-60">
            <Trash2 size={16} />
            {deleting ? 'Suppression...' : 'Supprimer'}
          </button>
        </div>
      </form>

      {/* ── Liste des inscrits ── */}
      <div id="inscrits" className="card-dark mt-8 scroll-mt-8">
        <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <Users size={18} className="text-major-primary" />
            <h2 className="font-oswald text-white text-xl uppercase tracking-wide">Inscrits</h2>
            <span className="badge text-xs">{registrations.length}</span>
            {registrations.filter(r => r.status === 'CONFIRMED').length > 0 && (
              <span className="text-xs text-major-accent font-inter ml-2">
                {registrations.filter(r => r.status === 'CONFIRMED').length} confirmés
              </span>
            )}
            {registrations.filter(r => r.status === 'WAITING').length > 0 && (
              <span className="text-xs text-yellow-400 font-inter">
                · {registrations.filter(r => r.status === 'WAITING').length} en attente
              </span>
            )}
          </div>
          {registrations.length > 0 && (
            <button
              onClick={exportCsv}
              className="btn-secondary flex items-center gap-2 px-4 py-2 text-xs"
              title="Télécharge un fichier CSV (ouvrable dans Excel) avec nom, prénom, CIN, date de naissance, taille t-shirt — prêt à envoyer aux organisateurs pour les dossards.">
              <Download size={13} /> Exporter CSV (dossards)
            </button>
          )}
        </div>

        {registrations.length === 0 ? (
          <p className="text-gray-500 font-inter text-sm py-6 text-center">
            Aucune inscription pour le moment.
          </p>
        ) : (
          <>
            {/* Filtres + recherche */}
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-3 mb-4">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                <input
                  type="search"
                  className="input-dark pl-9"
                  placeholder="Rechercher par nom, prénom, CIN ou téléphone…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <select className="input-dark text-sm" value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)}>
                <option value="all">Tous les statuts</option>
                <option value="CONFIRMED">✓ Confirmés</option>
                <option value="WAITING">⏳ Liste d'attente</option>
                <option value="CANCELLED">✗ Annulés</option>
              </select>
              <select className="input-dark text-sm" value={payFilter} onChange={e => setPayFilter(e.target.value as any)}>
                <option value="all">Tous (paiement)</option>
                <option value="paid">Payés</option>
                <option value="unpaid">Non payés</option>
              </select>
            </div>

            {/* Compteur (filtré / total) + paiements */}
            {(() => {
              const q = search.trim().toLowerCase()
              const filtered = registrations.filter(r => {
                if (statusFilter !== 'all' && r.status !== statusFilter) return false
                if (payFilter === 'paid'   && !r.paidAt) return false
                if (payFilter === 'unpaid' &&  r.paidAt) return false
                if (!q) return true
                const hay = [
                  r.member.firstName, r.member.lastName,
                  r.member.cin ?? '', r.member.phone ?? '',
                ].join(' ').toLowerCase()
                return hay.includes(q)
              })
              const isFiltered = q || statusFilter !== 'all' || payFilter !== 'all'
              const paidCount = registrations.filter(r => r.paidAt).length
              return (
                <>
                  <div className="mb-3 text-xs font-inter text-gray-400 flex items-center gap-3 flex-wrap">
                    <span>
                      <span className="text-white font-medium">{filtered.length}</span>
                      {isFiltered ? ` / ${registrations.length}` : ''} inscrit{filtered.length > 1 ? 's' : ''} affiché{filtered.length > 1 ? 's' : ''}
                    </span>
                    <span>·</span>
                    <span>
                      <span className="text-major-accent font-medium">{paidCount}</span> paiement{paidCount > 1 ? 's' : ''} validé{paidCount > 1 ? 's' : ''}
                    </span>
                    {isFiltered && (
                      <button onClick={() => { setSearch(''); setStatusFilter('all'); setPayFilter('all') }}
                        className="ml-auto text-major-cyan hover:text-major-accent flex items-center gap-1">
                        <X size={11} /> Réinitialiser les filtres
                      </button>
                    )}
                  </div>
            <div className="overflow-x-auto">
              <table className="table-dark">
                <thead>
                  <tr>
                    <th>Nom · Prénom</th>
                    <th>CIN</th>
                    <th>Date de naissance</th>
                    <th>T-shirt</th>
                    <th>Téléphone</th>
                    <th>Statut</th>
                    <th>Paiement</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-gray-500 font-inter text-sm italic">
                        Aucun inscrit ne correspond aux filtres.
                      </td>
                    </tr>
                  )}
                  {filtered.map(r => (
                    <tr key={r.id}>
                      <td className="text-white font-medium text-sm whitespace-nowrap">
                        <div>{r.member.lastName.toUpperCase()} {r.member.firstName}</div>
                      </td>
                      <td className="text-gray-300 text-sm font-mono">
                        {r.member.cin ?? <span className="text-red-400 text-xs italic">à compléter</span>}
                      </td>
                      <td className="text-gray-300 text-sm whitespace-nowrap">
                        {r.member.dateOfBirth
                          ? formatDate(r.member.dateOfBirth, 'dd/MM/yyyy')
                          : <span className="text-red-400 text-xs italic">à compléter</span>}
                      </td>
                      <td className="text-gray-300 text-sm">
                        {r.member.tshirtSize ?? <span className="text-red-400 text-xs italic">—</span>}
                      </td>
                      <td className="text-gray-400 text-sm whitespace-nowrap">
                        {r.member.phone ? (
                          <span className="flex items-center gap-1.5">
                            <Phone size={12} className="text-major-primary" /> {r.member.phone}
                          </span>
                        ) : <span className="text-gray-600">—</span>}
                      </td>
                      <td className="whitespace-nowrap">
                        {r.status === 'CONFIRMED' && (
                          <span className="text-xs text-major-accent font-inter font-medium">✓ Confirmé</span>
                        )}
                        {r.status === 'WAITING' && (
                          <span className="text-xs text-yellow-400 font-inter font-medium">⏳ Liste d'attente</span>
                        )}
                        {r.status === 'CANCELLED' && (
                          <span className="text-xs text-red-400 font-inter font-medium">✗ Annulé</span>
                        )}
                      </td>
                      <td>
                        <button
                          onClick={() => togglePaid(r)}
                          disabled={togglingPayId === r.id}
                          className={`flex items-center gap-1.5 text-xs font-inter font-medium transition-colors disabled:opacity-50 ${
                            r.paidAt
                              ? 'text-major-accent hover:text-major-primary'
                              : 'text-gray-500 hover:text-major-accent'
                          }`}
                          title={r.paidAt ? 'Cliquer pour annuler la validation' : 'Cliquer pour valider le paiement'}>
                          {togglingPayId === r.id
                            ? <Loader2 size={14} className="animate-spin" />
                            : r.paidAt
                              ? <CheckCircle2 size={14} />
                              : <Circle size={14} />}
                          {r.paidAt
                            ? <span>Payé · {formatDate(r.paidAt, 'dd MMM')}</span>
                            : <span>Valider</span>}
                        </button>
                      </td>
                      <td>
                        <button
                          onClick={() => removeRegistration(r)}
                          disabled={removingId === r.id}
                          className="text-gray-500 hover:text-red-400 disabled:opacity-50"
                          title="Retirer de la liste">
                          <X size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
                </>
              )
            })()}
          </>
        )}
      </div>
    </div>
  )
}
