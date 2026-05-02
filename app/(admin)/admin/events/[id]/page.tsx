'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Trash2, Youtube, Users, Phone, Clock, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { extractYoutubeId } from '@/lib/youtube'
import { formatDate } from '@/lib/utils'

type Registration = {
  id: string
  status: string
  createdAt: string
  member: { id: string; firstName: string; lastName: string; phone: string | null; photo: string | null }
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
    } catch (err: any) {
      toast.error(err.message ?? 'Erreur.')
    } finally {
      setRemovingId(null)
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
      <div className="card-dark mt-8">
        <div className="flex items-center gap-2 mb-4">
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

        {registrations.length === 0 ? (
          <p className="text-gray-500 font-inter text-sm py-6 text-center">
            Aucune inscription pour le moment.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-dark">
              <thead>
                <tr>
                  <th>Membre</th>
                  <th>Téléphone</th>
                  <th>Statut</th>
                  <th>Inscrit le</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {registrations.map(r => (
                  <tr key={r.id}>
                    <td className="text-white font-medium text-sm">
                      {r.member.firstName} {r.member.lastName}
                    </td>
                    <td className="text-gray-400 text-sm">
                      {r.member.phone ? (
                        <span className="flex items-center gap-1.5">
                          <Phone size={12} className="text-major-primary" /> {r.member.phone}
                        </span>
                      ) : <span className="text-gray-600">—</span>}
                    </td>
                    <td>
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
                    <td className="text-gray-500 text-xs">
                      <span className="flex items-center gap-1.5">
                        <Clock size={12} /> {formatDate(r.createdAt, "dd MMM yyyy 'à' HH'h'mm")}
                      </span>
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
        )}
      </div>
    </div>
  )
}
