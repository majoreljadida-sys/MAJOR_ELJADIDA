'use client'

import { useState } from 'react'
import { Building2, MessageCircle, CreditCard, Lock, Save, Loader2, Eye, EyeOff, Globe, Phone, Mail } from 'lucide-react'
import toast from 'react-hot-toast'

type Settings = {
  clubName: string; clubAddress: string; clubLogo: string
  contactEmail: string; contactPhone: string
  whatsappGroupLink: string
  facebookUrl: string; instagramUrl: string
  bankAccount: string; bankName: string
}

export function SettingsClient({ initial }: { initial: Settings }) {
  const [form, setForm] = useState<Settings>(initial)
  const [saving, setSaving] = useState(false)

  // Mot de passe
  const [pwForm, setPwForm] = useState({ current: '', new: '', confirm: '' })
  const [pwLoading, setPwLoading] = useState(false)
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)

  function set<K extends keyof Settings>(k: K, v: string) { setForm(f => ({ ...f, [k]: v })) }

  async function saveSettings() {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('Paramètres enregistrés !')
    } catch (err: any) {
      toast.error(err.message ?? 'Erreur.')
    } finally {
      setSaving(false)
    }
  }

  async function changePassword() {
    if (!pwForm.current || !pwForm.new) return toast.error('Renseigne les 2 mots de passe.')
    if (pwForm.new !== pwForm.confirm) return toast.error('Les mots de passe ne correspondent pas.')
    if (pwForm.new.length < 8) return toast.error('Le nouveau mot de passe doit faire au moins 8 caractères.')

    setPwLoading(true)
    try {
      const res = await fetch('/api/auth/change-password', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ currentPassword: pwForm.current, newPassword: pwForm.new }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setPwForm({ current: '', new: '', confirm: '' })
      toast.success('Mot de passe changé ✓')
    } catch (err: any) {
      toast.error(err.message ?? 'Erreur.')
    } finally {
      setPwLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-4xl space-y-8">
      <div>
        <h1 className="font-bebas text-4xl text-white tracking-widest">PARAMÈTRES</h1>
        <p className="text-gray-400 font-inter text-sm mt-1">Configuration du club et de ton compte.</p>
      </div>

      {/* ── Identité du club ── */}
      <section className="card-dark space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Building2 size={18} className="text-major-primary" />
          <h2 className="font-oswald text-white text-lg uppercase tracking-wide">Identité du club</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Nom du club</label>
            <input className="input-dark"
              placeholder="Club MAJOR — Mazagan Athlétisme Jogging And Organisation"
              value={form.clubName} onChange={e => set('clubName', e.target.value)} />
          </div>
          <div>
            <label className="form-label">URL du logo</label>
            <input className="input-dark" placeholder="https://…"
              value={form.clubLogo} onChange={e => set('clubLogo', e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className="form-label">Adresse</label>
            <input className="input-dark" placeholder="El Jadida, Maroc"
              value={form.clubAddress} onChange={e => set('clubAddress', e.target.value)} />
          </div>
        </div>
      </section>

      {/* ── Contact ── */}
      <section className="card-dark space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Phone size={18} className="text-major-primary" />
          <h2 className="font-oswald text-white text-lg uppercase tracking-wide">Contact</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="form-label flex items-center gap-1.5"><Mail size={13} /> Email</label>
            <input type="email" className="input-dark" placeholder="contact@major-club.ma"
              value={form.contactEmail} onChange={e => set('contactEmail', e.target.value)} />
          </div>
          <div>
            <label className="form-label flex items-center gap-1.5"><Phone size={13} /> Téléphone</label>
            <input type="tel" className="input-dark" placeholder="+212 6XX XXX XXX"
              value={form.contactPhone} onChange={e => set('contactPhone', e.target.value)} />
          </div>
          <div>
            <label className="form-label flex items-center gap-1.5"><Globe size={13} /> Facebook</label>
            <input className="input-dark" placeholder="https://facebook.com/…"
              value={form.facebookUrl} onChange={e => set('facebookUrl', e.target.value)} />
          </div>
          <div>
            <label className="form-label flex items-center gap-1.5"><Globe size={13} /> Instagram</label>
            <input className="input-dark" placeholder="https://instagram.com/…"
              value={form.instagramUrl} onChange={e => set('instagramUrl', e.target.value)} />
          </div>
        </div>
      </section>

      {/* ── WhatsApp ── */}
      <section className="card-dark space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <MessageCircle size={18} className="text-major-primary" />
          <h2 className="font-oswald text-white text-lg uppercase tracking-wide">Groupe WhatsApp</h2>
        </div>

        <div>
          <label className="form-label">Lien d'invitation au groupe MAJOR</label>
          <input className="input-dark" placeholder="https://chat.whatsapp.com/…"
            value={form.whatsappGroupLink} onChange={e => set('whatsappGroupLink', e.target.value)} />
          <p className="text-gray-500 text-xs font-inter mt-1.5">
            Servira par défaut quand tu envoies un rappel WhatsApp.
          </p>
        </div>
      </section>

      {/* ── Banque ── */}
      <section className="card-dark space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <CreditCard size={18} className="text-major-primary" />
          <h2 className="font-oswald text-white text-lg uppercase tracking-wide">Coordonnées bancaires</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Banque</label>
            <input className="input-dark" placeholder="Ex : Attijariwafa Bank"
              value={form.bankName} onChange={e => set('bankName', e.target.value)} />
          </div>
          <div>
            <label className="form-label">RIB / IBAN</label>
            <input className="input-dark font-mono" placeholder="MA64 XXX XXX XXX XXX XXX XXX"
              value={form.bankAccount} onChange={e => set('bankAccount', e.target.value)} />
          </div>
        </div>
        <p className="text-gray-500 text-xs font-inter italic">
          Sera utilisé pour communiquer les modalités de paiement aux adhérents inscrits aux courses.
        </p>
      </section>

      {/* ── Bouton enregistrer ── */}
      <div className="sticky bottom-4 flex justify-end">
        <button onClick={saveSettings} disabled={saving}
          className="btn-primary flex items-center gap-2 px-6 py-3 text-sm font-semibold shadow-lg shadow-major-primary/30 disabled:opacity-50">
          {saving
            ? <><Loader2 size={16} className="animate-spin" /> Enregistrement…</>
            : <><Save size={16} /> Enregistrer les paramètres</>}
        </button>
      </div>

      {/* ── Mot de passe ── */}
      <section className="card-dark space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Lock size={18} className="text-major-primary" />
          <h2 className="font-oswald text-white text-lg uppercase tracking-wide">Changer mon mot de passe</h2>
        </div>

        <div className="grid grid-cols-1 gap-4 max-w-md">
          <div className="relative">
            <label className="form-label">Mot de passe actuel</label>
            <input type={showCurrent ? 'text' : 'password'} className="input-dark pr-10"
              value={pwForm.current} onChange={e => setPwForm(f => ({ ...f, current: e.target.value }))} />
            <button type="button" onClick={() => setShowCurrent(s => !s)}
              className="absolute right-3 bottom-3 text-gray-500 hover:text-gray-300">
              {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <div className="relative">
            <label className="form-label">Nouveau mot de passe</label>
            <input type={showNew ? 'text' : 'password'} className="input-dark pr-10"
              placeholder="8 caractères minimum"
              value={pwForm.new} onChange={e => setPwForm(f => ({ ...f, new: e.target.value }))} />
            <button type="button" onClick={() => setShowNew(s => !s)}
              className="absolute right-3 bottom-3 text-gray-500 hover:text-gray-300">
              {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <div>
            <label className="form-label">Confirmer le nouveau mot de passe</label>
            <input type="password" className="input-dark"
              value={pwForm.confirm} onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))} />
          </div>

          <div className="flex justify-start pt-2">
            <button onClick={changePassword} disabled={pwLoading}
              className="btn-primary flex items-center gap-2 px-5 py-2.5 text-sm disabled:opacity-50">
              {pwLoading
                ? <><Loader2 size={15} className="animate-spin" /> En cours…</>
                : <><Lock size={15} /> Changer le mot de passe</>}
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
