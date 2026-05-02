'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { CheckCircle, XCircle, MoreHorizontal, Trash2, Clock, UserCog, X, Loader2 } from 'lucide-react'

interface Props {
  memberId: string
  currentStatus: string
  memberName?:    string
  memberEmail?:   string
  isAlreadyCoach?: boolean
  currentRole?:   string
}

export function MemberActions({ memberId, currentStatus, memberName, memberEmail, isAlreadyCoach, currentRole }: Props) {
  const router  = useRouter()
  const [open, setOpen]         = useState(false)
  const [loading, setLoading]   = useState(false)
  const [showPromote, setShowPromote] = useState(false)
  const [promoting, setPromoting]     = useState(false)
  const [specialty, setSpecialty]     = useState('')
  const [bio, setBio]                 = useState('')

  async function updateStatus(status: string) {
    setOpen(false)
    setLoading(true)
    try {
      const res = await fetch(`/api/members/${memberId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberStatus: status }),
      })
      if (!res.ok) throw new Error()

      if (status === 'ACTIVE' && memberEmail) {
        await fetch('/api/members/notify-active', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: memberEmail, name: memberName }),
        })
      }

      toast.success(
        status === 'ACTIVE'    ? '✅ Membre activé — notification envoyée !' :
        status === 'SUSPENDED' ? '🚫 Membre suspendu.' :
        status === 'PENDING'   ? '⏳ Membre mis en attente.' :
        'Statut mis à jour.'
      )
      router.refresh()
    } catch {
      toast.error('Erreur lors de la mise à jour.')
    } finally {
      setLoading(false)
    }
  }

  async function deleteMember() {
    setOpen(false)
    if (!confirm(`Supprimer définitivement ce membre ? Cette action est irréversible.`)) return
    setLoading(true)
    try {
      const res = await fetch(`/api/members/${memberId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success('Membre supprimé.')
      router.refresh()
    } catch {
      toast.error('Erreur lors de la suppression.')
    } finally {
      setLoading(false)
    }
  }

  async function promoteToCoach() {
    setPromoting(true)
    try {
      const res = await fetch(`/api/members/${memberId}/promote-to-coach`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ specialty: specialty.trim(), bio: bio.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success(`🎯 ${memberName ?? 'Membre'} est maintenant coach !`)
      setShowPromote(false)
      setSpecialty('')
      setBio('')
      router.refresh()
    } catch (err: any) {
      toast.error(err.message ?? 'Erreur.')
    } finally {
      setPromoting(false)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        disabled={loading}
        className="p-1.5 text-gray-500 hover:text-white hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-40">
        <MoreHorizontal size={16} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-8 z-20 bg-[#1A1A2E] border border-gray-700 rounded-xl shadow-xl min-w-[200px] overflow-hidden">

            {currentStatus !== 'ACTIVE' && (
              <button onClick={() => updateStatus('ACTIVE')}
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-green-400 hover:bg-green-900/20 w-full text-left transition-colors">
                <CheckCircle size={14} /> Activer + notifier
              </button>
            )}

            {currentStatus !== 'PENDING' && (
              <button onClick={() => updateStatus('PENDING')}
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-yellow-400 hover:bg-yellow-900/20 w-full text-left transition-colors">
                <Clock size={14} /> Mettre en attente
              </button>
            )}

            {currentStatus !== 'SUSPENDED' && (
              <button onClick={() => updateStatus('SUSPENDED')}
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-orange-400 hover:bg-orange-900/20 w-full text-left transition-colors">
                <XCircle size={14} /> Suspendre
              </button>
            )}

            {/* Séparateur + Promouvoir coach */}
            <div className="border-t border-gray-800 my-1" />

            {isAlreadyCoach ? (
              <div className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-500 italic">
                <UserCog size={14} /> Déjà coach
              </div>
            ) : (
              <button
                onClick={() => { setOpen(false); setShowPromote(true) }}
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-major-cyan hover:bg-major-cyan/10 w-full text-left transition-colors">
                <UserCog size={14} /> Promouvoir coach
              </button>
            )}

            <div className="border-t border-gray-800 my-1" />

            <button onClick={deleteMember}
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-900/20 w-full text-left transition-colors">
              <Trash2 size={14} /> Supprimer
            </button>
          </div>
        </>
      )}

      {/* Modale promotion coach */}
      {showPromote && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-major-dark border border-major-primary/40 rounded-2xl w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-oswald text-white text-xl uppercase tracking-wide flex items-center gap-2">
                <UserCog size={20} className="text-major-cyan" />
                Promouvoir coach
              </h3>
              <button onClick={() => setShowPromote(false)} className="text-gray-500 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <p className="text-gray-300 font-inter text-sm">
              <span className="text-white font-semibold">{memberName}</span> deviendra coach et conservera son statut d'adhérent (paiements, présences, inscriptions aux courses inchangés).
            </p>

            <div className="space-y-3">
              <div>
                <label className="form-label">Spécialité <span className="text-gray-500">(optionnel)</span></label>
                <input className="input-dark" placeholder="Ex : Demi-fond, Trail, Préparation marathon"
                  value={specialty} onChange={e => setSpecialty(e.target.value)} />
              </div>
              <div>
                <label className="form-label">Bio <span className="text-gray-500">(optionnel)</span></label>
                <textarea className="input-dark resize-none" rows={3}
                  placeholder="Quelques mots sur le coach (parcours, expérience…)"
                  value={bio} onChange={e => setBio(e.target.value)} />
              </div>
            </div>

            <div className="bg-major-cyan/10 border border-major-cyan/30 rounded-xl p-3 text-xs font-inter text-major-cyan">
              Une fois promu, ce coach pourra gérer les programmes d'entraînement et envoyer des notifications WhatsApp.
            </div>

            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setShowPromote(false)}
                className="btn-secondary flex-1 py-2.5 text-sm">
                Annuler
              </button>
              <button
                onClick={promoteToCoach}
                disabled={promoting}
                className="btn-primary flex-1 flex items-center justify-center gap-2 py-2.5 text-sm disabled:opacity-50">
                {promoting
                  ? <><Loader2 size={15} className="animate-spin" /> En cours…</>
                  : <><UserCog size={15} /> Confirmer la promotion</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
