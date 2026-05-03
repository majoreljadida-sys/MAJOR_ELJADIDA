'use client'

import { useState } from 'react'
import { Trash2, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export function BlogDeleteButton({ postId, postTitle }: { postId: string; postTitle: string }) {
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!confirm(`Supprimer l'article "${postTitle}" ? Cette action est irréversible.`)) return
    setLoading(true)
    try {
      const res  = await fetch(`/api/blog/${postId}`, { method: 'DELETE' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || `Erreur ${res.status}`)
      toast.success('Article supprimé.')
      // Reload complet pour invalider le cache de la liste
      setTimeout(() => window.location.reload(), 400)
    } catch (err: any) {
      toast.error(err.message ?? 'Erreur lors de la suppression.')
      setLoading(false)
    }
  }

  return (
    <button onClick={handleDelete} disabled={loading}
      className="flex items-center gap-1 text-xs text-red-500 hover:text-red-400 font-inter transition-colors disabled:opacity-50">
      {loading ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
      Supprimer
    </button>
  )
}
