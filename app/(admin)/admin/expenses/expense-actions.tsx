'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface Props {
  id:          string
  description: string
}

export function ExpenseActions({ id, description }: Props) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  async function remove() {
    if (!confirm(`Supprimer "${description}" ?`)) return
    setBusy(true)
    try {
      const res = await fetch(`/api/expenses/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Erreur serveur')
      toast.success('Dépense supprimée')
      router.refresh()
    } catch (err: any) {
      toast.error(err.message ?? 'Erreur')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex items-center gap-1">
      <Link href={`/admin/expenses/${id}`}
        className="p-1.5 rounded-lg text-gray-400 hover:text-major-accent hover:bg-major-primary/10 transition-colors"
        title="Modifier">
        <Pencil size={14} />
      </Link>
      <button type="button" onClick={remove} disabled={busy}
        className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-900/10 transition-colors disabled:opacity-40"
        title="Supprimer">
        <Trash2 size={14} />
      </button>
    </div>
  )
}
