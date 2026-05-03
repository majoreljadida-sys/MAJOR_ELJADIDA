'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { Save, User, MapPin, Shield, FileText, Upload, Loader2, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { TSHIRT_SIZE_LABELS, MEMBER_CATEGORY_LABELS } from '@/lib/utils'

const SIZES = Object.entries(TSHIRT_SIZE_LABELS)
const CATS  = Object.entries(MEMBER_CATEGORY_LABELS)

export default function MemberProfilePage() {
  const { data: session, update: updateSession } = useSession()
  const [loading, setLoading] = useState(false)
  const [certFile, setCertFile]     = useState<File | null>(null)
  const [certExpiry, setCertExpiry] = useState('')
  const [certLoading, setCertLoading] = useState(false)
  const [certUrl, setCertUrl]       = useState<string | null>(null)
  const [form, setForm] = useState({
    firstName: '', lastName: '', phone: '', city: '', tshirtSize: 'M',
    category: 'SENIOR', emergencyContact: '', emergencyPhone: '', bio: '',
    cin: '', dateOfBirth: '', photo: '',
  })
  const [photoUploading, setPhotoUploading] = useState(false)

  useEffect(() => {
    if (!session?.user?.profileId) return
    fetch(`/api/members/${session.user.profileId}`)
      .then(r => r.json())
      .then(data => {
        if (data.member) {
          const { member } = data
          setForm({
            firstName: member.firstName       ?? '',
            lastName:  member.lastName        ?? '',
            phone:     member.phone           ?? '',
            city:      member.placeOfBirth    ?? '',
            tshirtSize: member.tshirtSize     ?? 'M',
            category:  member.category        ?? 'SENIOR',
            emergencyContact: member.emergencyContact ?? '',
            emergencyPhone:   member.emergencyPhone   ?? '',
            bio: member.bio ?? '',
            cin: member.cin ?? '',
            dateOfBirth: member.dateOfBirth ? new Date(member.dateOfBirth).toISOString().split('T')[0] : '',
            photo: member.photo ?? '',
          })
          if (member.medicalCertUrl) setCertUrl(member.medicalCertUrl)
          if (member.medicalCertExpiry) setCertExpiry(new Date(member.medicalCertExpiry).toISOString().split('T')[0])
        }
      })
  }, [session])

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })) }

  async function uploadPhoto(file: File) {
    if (!file.type.startsWith('image/')) return toast.error('Sélectionne une image (JPG, PNG, WebP).')
    if (file.size > 5 * 1024 * 1024)     return toast.error('Photo trop lourde (max 5 MB).')
    setPhotoUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res  = await fetch('/api/upload/avatar', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      set('photo', data.url)
      toast.success('Photo mise à jour. N\'oublie pas d\'enregistrer.')
    } catch (err: any) {
      toast.error(err.message ?? 'Erreur upload.')
    } finally {
      setPhotoUploading(false)
    }
  }

  async function uploadCert() {
    if (!certFile || !certExpiry) return toast.error('Fichier et date d\'expiration requis')
    setCertLoading(true)
    try {
      const fd = new FormData()
      fd.append('file', certFile)
      fd.append('expiry', certExpiry)
      fd.append('memberId', session?.user?.profileId ?? '')
      const res = await fetch('/api/upload/certificate', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setCertUrl(data.url)
      toast.success('Certificat médical ajouté !')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setCertLoading(false)
    }
  }

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
      // Rafraîchit la session pour que la sidebar récupère la nouvelle photo
      // sans devoir se déconnecter / reconnecter.
      await updateSession({ image: form.photo || null })
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
        {/* Photo de profil */}
        <div className="card-dark">
          <div className="flex items-center gap-2 mb-5">
            <User size={18} className="text-major-accent" />
            <h2 className="font-oswald text-white text-lg uppercase tracking-wide">Photo de profil</h2>
          </div>
          <div className="flex items-center gap-5">
            <div className="w-24 h-24 rounded-full bg-major-primary/10 border-2 border-major-primary/30 flex items-center justify-center overflow-hidden flex-shrink-0">
              {form.photo
                ? <img src={form.photo} alt="Profil" className="w-full h-full object-cover" />
                : <User size={36} className="text-major-primary/50" />}
            </div>
            <div className="flex-1 space-y-2">
              <label className={`flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-dashed rounded-xl text-sm font-inter cursor-pointer transition-colors ${
                photoUploading
                  ? 'border-major-cyan/40 text-major-cyan bg-major-cyan/5'
                  : 'border-gray-700 text-gray-400 hover:border-major-primary hover:text-major-accent'
              }`}>
                {photoUploading
                  ? <><Loader2 size={14} className="animate-spin" /> Téléchargement…</>
                  : <><Upload size={14} /> {form.photo ? 'Changer la photo' : 'Choisir une photo'}</>}
                <input type="file" accept="image/*" className="hidden" disabled={photoUploading}
                  onChange={e => {
                    const file = e.target.files?.[0]
                    if (file) uploadPhoto(file)
                    e.target.value = ''
                  }} />
              </label>
              {form.photo && (
                <button type="button" onClick={() => set('photo', '')}
                  className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300">
                  <X size={11} /> Retirer la photo
                </button>
              )}
              <p className="text-gray-500 text-xs font-inter">Visible par toi, ton coach et l'admin du club. Max 5 MB.</p>
            </div>
          </div>
        </div>

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
              <label className="form-label">N° CIN</label>
              <input className="input-dark" placeholder="Ex : AB123456"
                value={form.cin} onChange={e => set('cin', e.target.value.toUpperCase())} />
            </div>
            <div>
              <label className="form-label">Date de naissance</label>
              <input type="date" className="input-dark"
                value={form.dateOfBirth} onChange={e => set('dateOfBirth', e.target.value)} />
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

        {/* Certificat médical */}
        <div id="certificat" className="card-dark scroll-mt-8">
          <div className="flex items-center gap-2 mb-5">
            <FileText size={18} className="text-major-accent" />
            <h2 className="font-oswald text-white text-lg uppercase tracking-wide">Certificat médical</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="form-label">Fichier (PDF, JPG, PNG — max 5 MB)</label>
              <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp"
                onChange={e => setCertFile(e.target.files?.[0] ?? null)}
                className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-major-primary/20 file:text-major-accent hover:file:bg-major-primary/30 cursor-pointer" />
            </div>
            <div>
              <label className="form-label">Date d'expiration</label>
              <input type="date" className="input-dark" value={certExpiry}
                onChange={e => setCertExpiry(e.target.value)} />
            </div>
            {certUrl && (
              <p className="text-green-400 text-xs font-inter">✓ Certificat enregistré</p>
            )}
            <button type="button" onClick={uploadCert} disabled={certLoading || !certFile || !certExpiry}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-major-primary/20 text-major-accent border border-major-primary/30 hover:bg-major-primary/30 transition-all text-sm font-semibold font-inter disabled:opacity-40 disabled:cursor-not-allowed">
              <Upload size={15} />
              {certLoading ? 'Envoi...' : 'Envoyer le certificat'}
            </button>
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
