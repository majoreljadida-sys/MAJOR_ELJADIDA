'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save } from 'lucide-react'
import toast from 'react-hot-toast'

const EVENT_TYPES = [
  { value: 'RACE',       label: 'Course officielle' },
  { value: 'TRAINING',   label: 'Sortie entraînement' },
  { value: 'STAGE',      label: 'Stage / Camp' },
  { value: 'COMMUNITY',  label: 'Événement communautaire' },
  { value: 'OTHER',      label: 'Autre' },
]

export default function NewEventPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: '', type: 'RACE', date: '', location: '', description: '',
    maxParticipants: '', price: '', distance: '', videoUrl: '',
  })

  function set(key: string, value: string) {
    setForm(f => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? 'Erreur'); return }
      toast.success('Événement créé !')
      router.push('/admin/events')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/events" className="text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="font-bebas text-4xl text-white tracking-widest">NOUVEL ÉVÉNEMENT</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 card-dark">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="form-label">Titre *</label>
            <input className="input-dark" required value={form.title}
              onChange={e => set('title', e.target.value)} placeholder="Ex: 10 km du Mazagan" />
          </div>

          <div>
            <label className="form-label">Type *</label>
            <select className="input-dark" required value={form.type} onChange={e => set('type', e.target.value)}>
              {EVENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>

          <div>
            <label className="form-label">Date *</label>
            <input type="datetime-local" className="input-dark" required
              value={form.date} onChange={e => set('date', e.target.value)} />
          </div>

          <div>
            <label className="form-label">Lieu *</label>
            <input className="input-dark" required value={form.location}
              onChange={e => set('location', e.target.value)} placeholder="El Jadida, corniche..." />
          </div>

          <div>
            <label className="form-label">Distance</label>
            <input className="input-dark" value={form.distance}
              onChange={e => set('distance', e.target.value)} placeholder="10 km, Semi-marathon..." />
          </div>

          <div>
            <label className="form-label">Participants max</label>
            <input type="number" className="input-dark" value={form.maxParticipants}
              onChange={e => set('maxParticipants', e.target.value)} placeholder="100" min="0" />
          </div>

          <div>
            <label className="form-label">Prix (MAD) — laisser vide si gratuit</label>
            <input type="number" className="input-dark" value={form.price}
              onChange={e => set('price', e.target.value)} placeholder="0" min="0" step="0.01" />
          </div>

          <div className="sm:col-span-2">
            <label className="form-label">Description</label>
            <textarea className="input-dark resize-none" rows={4} value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="Décrivez l'événement..." />
          </div>

          <div className="sm:col-span-2">
            <label className="form-label">
              Vidéo YouTube (compte-rendu)
              <span className="text-gray-500 font-normal ml-2 text-xs">— optionnel, à ajouter après l'événement</span>
            </label>
            <input className="input-dark" value={form.videoUrl}
              onChange={e => set('videoUrl', e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..." />
            <p className="text-gray-600 text-xs font-inter mt-1">
              Collez l'URL de la vidéo YouTube. Elle s'affichera dans les événements passés.
            </p>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading}
            className="btn-primary gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
            <Save size={16} />
            {loading ? 'Enregistrement...' : 'Créer l\'événement'}
          </button>
          <Link href="/admin/events" className="btn-secondary">Annuler</Link>
        </div>
      </form>
    </div>
  )
}
