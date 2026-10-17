'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Loader2, Save } from 'lucide-react'
import { STORE_ORDER_STATUSES } from '@/lib/store'

export function OrderActions({ id, status, adminNote }: { id: string; status: string; adminNote: string }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState(adminNote)

  async function patch(data: Record<string, unknown>, ok: string) {
    setBusy(true)
    try {
      const res = await fetch(`/api/store/orders/${id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Erreur')
      toast.success(ok)
      router.refresh()
    } catch (e: any) {
      toast.error(e.message ?? 'Erreur')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <div className="flex flex-wrap gap-1.5">
        {STORE_ORDER_STATUSES.map(s => (
          <button key={s.key} disabled={busy || s.key === status}
            onClick={() => {
              if (s.key === 'CANCELLED' && !confirm('Annuler cette commande ?')) return
              patch({ status: s.key }, `Statut : ${s.label}`)
            }}
            className={`badge transition-all disabled:cursor-default ${
              s.key === status ? s.color + ' ring-1 ring-white/30' : 'text-gray-400 border-gray-700 hover:text-white hover:border-gray-500'
            }`}>
            {s.label}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-1.5 flex-1 min-w-[220px]">
        <input value={note} onChange={e => setNote(e.target.value)} placeholder="Note interne (paiement, remise…)"
          className="input-dark py-1.5 text-xs" maxLength={1000} />
        <button disabled={busy || note === adminNote} onClick={() => patch({ adminNote: note }, 'Note enregistrée')}
          className="p-2 rounded-lg text-gray-400 hover:text-major-accent hover:bg-major-primary/10 disabled:opacity-30" title="Enregistrer la note">
          {busy ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
        </button>
      </div>
    </div>
  )
}
