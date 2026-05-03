'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Camera, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export function MemberPhotoCell({
  memberId, photo: initialPhoto, firstName, lastName,
}: {
  memberId: string
  photo:    string | null
  firstName: string
  lastName:  string
}) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [photo, setPhoto] = useState(initialPhoto)
  const [uploading, setUploading] = useState(false)

  async function onFile(file: File) {
    if (!file.type.startsWith('image/')) return toast.error('Sélectionne une image.')
    if (file.size > 5 * 1024 * 1024)     return toast.error('Image trop lourde (max 5 MB).')

    setUploading(true)
    try {
      // 1. Upload sur Vercel Blob
      const fd = new FormData()
      fd.append('file', file)
      const upRes  = await fetch('/api/upload/avatar', { method: 'POST', body: fd })
      const upData = await upRes.json()
      if (!upRes.ok) throw new Error(upData.error)

      // 2. Sauvegarde sur le membre
      const saveRes = await fetch(`/api/members/${memberId}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ photo: upData.url }),
      })
      if (!saveRes.ok) throw new Error('Échec de la sauvegarde.')

      setPhoto(upData.url)
      toast.success('Photo enregistrée.')
      router.refresh()
    } catch (err: any) {
      toast.error(err.message ?? 'Erreur upload.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      disabled={uploading}
      title={photo ? 'Cliquer pour changer la photo' : 'Cliquer pour ajouter une photo'}
      className="relative w-12 h-12 rounded-full bg-major-primary/20 flex items-center justify-center text-major-accent text-sm font-semibold flex-shrink-0 overflow-hidden group hover:ring-2 hover:ring-major-primary transition-all">
      {uploading ? (
        <Loader2 size={18} className="animate-spin text-major-cyan" />
      ) : photo ? (
        <img src={photo} alt={`${firstName} ${lastName}`} className="w-full h-full object-cover" />
      ) : (
        <span>{firstName?.[0]}{lastName?.[0]}</span>
      )}
      {!uploading && (
        <span className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
          <Camera size={14} className="text-white" />
        </span>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => {
          const file = e.target.files?.[0]
          if (file) onFile(file)
          e.target.value = ''
        }}
      />
    </button>
  )
}
