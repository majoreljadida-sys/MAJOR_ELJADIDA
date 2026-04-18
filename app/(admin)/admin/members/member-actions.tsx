'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { CheckCircle, XCircle, MoreHorizontal } from 'lucide-react'

interface Props { memberId: string; currentStatus: string }

export function MemberActions({ memberId, currentStatus }: Props) {
  const router  = useRouter()
  const [open, setOpen] = useState(false)

  async function updateStatus(status: string) {
    setOpen(false)
    try {
      const res = await fetch(`/api/members/${memberId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberStatus: status }),
      })
      if (!res.ok) throw new Error()
      toast.success('Statut mis à jour.')
      router.refresh()
    } catch {
      toast.error('Erreur lors de la mise à jour.')
    }
  }

  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)}
        className="p-1.5 text-gray-500 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
        <MoreHorizontal size={16} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-8 z-20 bg-[#1A1A2E] border border-gray-700 rounded-xl shadow-xl min-w-[160px] overflow-hidden">
            {currentStatus !== 'ACTIVE' && (
              <button onClick={() => updateStatus('ACTIVE')}
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-green-400 hover:bg-green-900/20 w-full text-left transition-colors">
                <CheckCircle size={14} /> Activer
              </button>
            )}
            {currentStatus !== 'PENDING' && (
              <button onClick={() => updateStatus('PENDING')}
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-yellow-400 hover:bg-yellow-900/20 w-full text-left transition-colors">
                <MoreHorizontal size={14} /> Mettre en attente
              </button>
            )}
            {currentStatus !== 'SUSPENDED' && (
              <button onClick={() => updateStatus('SUSPENDED')}
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-red-900/20 w-full text-left transition-colors">
                <XCircle size={14} /> Suspendre
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}
