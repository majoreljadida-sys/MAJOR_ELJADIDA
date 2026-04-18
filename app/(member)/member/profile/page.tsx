'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { Save, User, Phone, MapPin, Shield } from 'lucide-react'
import toast from 'react-hot-toast'
import { TSHIRT_SIZE_LABELS, MEMBER_CATEGORY_LABELS } from '@/lib/utils'

const SIZES = Object.entries(TSHIRT_SIZE_LABELS)
const CATS  = Object.entries(MEMBER_CATEGORY_LABELS)

export default function MemberProfilePage() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    firstName: '', lastName: '', phone: '', city: '', tshirtSize: 'M',
    category: 'SENIOR', emergencyContact: '', emergencyPhone: '', bio: '',
  })

  useEffect(() => {
    if (!session?.user?.profileId) return
    fetch(`/api/members/${session.user.profileId}`)
      .then(r => r.json())
      .then(data => {
        if (data.member) {
          const { member, user } = data
          setForm({
            firstName: user.firstName ?? '',
            lastName:  user.lastName  ?? '',
            phone:     user.phone     ?? '',
            city:      member.city    ?? '',
            tshirtSize: member.tshirtSize ?? 'M',
            category:  member.category  ?? 'SENIOR',
            emergencyContact: member.emergencyContact ?? '',
            emergencyPhone:   member.emergencyPhone   ?? '',
            bio: member.bio ?? '',
          })
        }
      })
  }, [session])

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch(`/api/members/${session?.user?.profileId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      toast.success('Profil mis à jour !')
    } catch {
      toast.error('Erreur lors de la mise à jour.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="font-bebas text-4xl text-white tracking-widest mb-8">MON PROFIL</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal info */}
        <div className="card-dark">
          <div className="flex items-center gap-2 mb-5">
            <User size={18} className="text-major-accent" />
            <h2 className="font-oswald text-white text-lg uppercase tracking-wide">Informations personnelles</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Prénom</label>
              <input className="input-dark" value={form.firstName} onChange={e => set('firstName', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Nom</label>
              <input className="input-dark" value={form.lastName} onChange={e => set('lastName', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Téléphone</label>
              <input type="tel" className="input-dark" placeholder="+212 6XX XXX XXX"
                value={form.phone} onChange={e => set('phone', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Ville</label>
              <input className="input-dark" value={form.city} onChange={e => set('city', e.target.value)} />
            </div>
          </div>
          <div className="mt-4">
            <label className="form-label">Bio / À propos</label>
            <textarea className="input-dark resize-none" rows={3} placeholder="Parlez-nous de vous..."
              value={form.bio} onChange={e => set('bio', e.target.value)} />
          </div>
        </div>

        {/* Sport info */}
        <div className="card-dark">
          <div className="flex items-center gap-2 mb-5">
            <MapPin size={18} className="text-major-accent" />
            <h2 className="font-oswald text-white text-lg uppercase tracking-wide">Informations sportives</h2>
          </div>

          <div className="mb-4">
            <label className="form-label">Catégorie</label>
            <select className="input-dark" value={form.category} onChange={e => set('category', e.target.value)}>
              {CATS.map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>

          <div>
            <label className="form-label">Taille t-shirt</label>
            <div className="flex gap-2 flex-wrap">
              {SIZES.map(([k, v]) => (
                <button key={k} type="button" onClick={() => set('tshirtSize', k)}
                  className={`px-4 py-2 rounded-xl text-sm font-inter font-medium border transition-colors ${form.tshirtSize === k ? 'bg-major-primary border-major-primary text-white' : 'border-gray-700 text-gray-400 hover:border-gray-500'}`}>
                  {v}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Emergency contact */}
        <div className="card-dark">
          <div className="flex items-center gap-2 mb-5">
            <Shield size={18} className="text-major-accent" />
            <h2 className="font-oswald text-white text-lg uppercase tracking-wide">Contact d'urgence</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Nom</label>
              <input className="input-dark" placeholder="Nom du contact"
                value={form.emergencyContact} onChange={e => set('emergencyContact', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Téléphone</label>
              <input type="tel" className="input-dark" placeholder="+212 6XX XXX XXX"
                value={form.emergencyPhone} onChange={e => set('emergencyPhone', e.target.value)} />
            </div>
          </div>
        </div>

        <button type="submit" disabled={loading}
          className="btn-primary flex items-center gap-2 px-8 py-3 disabled:opacity-60 disabled:cursor-not-allowed">
          <Save size={16} />
          <span className="font-inter text-sm font-semibold">{loading ? 'Enregistrement...' : 'Sauvegarder'}</span>
        </button>
      </form>
    </div>
  )
}
