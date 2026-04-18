'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Loader2 } from 'lucide-react'

export function BlogDeleteButton({ postId, postTitle }: { postId: string; postTitle: string }) {
  const router  = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!confirm(`Supprimer l'article "${postTitle}" ? Cette action est irréversible.`)) return
    setLoading(true)
    await fetch(`/api/blog/${postId}`, { method: 'DELETE' })
    router.refresh()
    setLoading(false)
  }

  return (
    <button onClick={handleDelete} disabled={loading}
      className="flex items-center gap-1 text-xs text-red-500 hover:text-red-400 font-inter transition-colors disabled:opacity-50">
      {loading ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
      Supprimer
    </button>
  )
}
