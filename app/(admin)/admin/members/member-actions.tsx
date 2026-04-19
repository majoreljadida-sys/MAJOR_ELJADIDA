'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { CheckCircle, XCircle, MoreHorizontal, Trash2, Clock } from 'lucide-react'

interface Props { memberId: string; currentStatus: string; memberName?: string; memberEmail?: string }

export function MemberActions({ memberId, currentStatus, memberName, memberEmail }: Props) {
  const router  = useRouter()
  const [open, setOpen]         = useState(false)
  const [loading, setLoading]   = useState(false)

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

      // ── Envoyer notification si activation
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
          <div className="absolute right-0 top-8 z-20 bg-[#1A1A2E] border border-gray-700 rounded-xl shadow-xl min-w-[180px] overflow-hidden">

            {/* Activer */}
            {currentStatus !== 'ACTIVE' && (
              <button onClick={() => updateStatus('ACTIVE')}
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-green-400 hover:bg-green-900/20 w-full text-left transition-colors">
                <CheckCircle size={14} /> Activer + notifier
              </button>
            )}

            {/* Mettre en attente */}
            {currentStatus !== 'PENDING' && (
              <button onClick={() => updateStatus('PENDING')}
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-yellow-400 hover:bg-yellow-900/20 w-full text-left transition-colors">
                <Clock size={14} /> Mettre en attente
              </button>
            )}

            {/* Suspendre */}
            {currentStatus !== 'SUSPENDED' && (
              <button onClick={() => updateStatus('SUSPENDED')}
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-orange-400 hover:bg-orange-900/20 w-full text-left transition-colors">
                <XCircle size={14} /> Suspendre
              </button>
            )}

            {/* Séparateur */}
            <div className="border-t border-gray-800 my-1" />

            {/* Supprimer */}
            <button onClick={deleteMember}
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-900/20 w-full text-left transition-colors">
              <Trash2 size={14} /> Supprimer
            </button>
          </div>
        </>
      )}
    </div>
  )
}
