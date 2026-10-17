'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export function CancelOrderButton({ id }: { id: string }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  async function cancel() {
    if (!confirm('Annuler cette commande ?')) return
    setBusy(true)
    try {
      const res = await fetch(`/api/store/orders/${id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'CANCELLED' }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Erreur')
      toast.success('Commande annulée')
      router.refresh()
    } catch (e: any) {
      toast.error(e.message ?? 'Erreur')
    } finally {
      setBusy(false)
    }
  }
  return (
    <button onClick={cancel} disabled={busy} className="mt-3 text-xs text-red-400 hover:text-red-300 font-inter disabled:opacity-50">
      Annuler la commande
    </button>
  )
}
