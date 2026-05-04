'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Camera, Loader2, X } from 'lucide-react'
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
  const [lightbox,  setLightbox]  = useState(false)

  // Ferme lightbox avec Escape
  useEffect(() => {
    if (!lightbox) return
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') setLightbox(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightbox])

  async function onFile(file: File) {
    if (!file.type.startsWith('image/')) return toast.error('Sélectionne une image.')
    if (file.size > 5 * 1024 * 1024)     return toast.error('Image trop lourde (max 5 MB).')

    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const upRes  = await fetch('/api/upload/avatar', { method: 'POST', body: fd })
      const upData = await upRes.json()
      if (!upRes.ok) throw new Error(upData.error)

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

  function handleClick() {
    if (uploading) return
    if (photo) setLightbox(true)        // photo existe → preview
    else       inputRef.current?.click() // pas de photo → upload
  }

  return (
    <>
      <div className="relative w-12 h-12 flex-shrink-0 group">
        <button
          type="button"
          onClick={handleClick}
          disabled={uploading}
          title={photo ? 'Cliquer pour agrandir' : 'Cliquer pour ajouter une photo'}
          className="w-full h-full rounded-full bg-major-primary/20 flex items-center justify-center text-major-accent text-sm font-semibold overflow-hidden hover:ring-2 hover:ring-major-primary transition-all">
          {uploading ? (
            <Loader2 size={18} className="animate-spin text-major-cyan" />
          ) : photo ? (
            <img src={photo} alt={`${firstName} ${lastName}`} className="w-full h-full object-cover" />
          ) : (
            <span>{firstName?.[0]}{lastName?.[0]}</span>
          )}
        </button>

        {/* Bouton caméra en haut à droite — replace la photo (toujours visible si photo existe) */}
        {photo && !uploading && (
          <button
            type="button"
            onClick={e => { e.stopPropagation(); inputRef.current?.click() }}
            title="Remplacer la photo"
            className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-major-primary hover:bg-major-accent text-white flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera size={11} />
          </button>
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
      </div>

      {/* Lightbox plein écran */}
      {lightbox && photo && (
        <div
          onClick={() => setLightbox(false)}
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <button
            onClick={() => setLightbox(false)}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
            title="Fermer">
            <X size={20} />
          </button>
          <img
            src={photo}
            alt={`${firstName} ${lastName}`}
            onClick={e => e.stopPropagation()}
            className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
          />
          <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white font-oswald text-lg uppercase tracking-widest px-4 py-1.5 bg-black/50 rounded-full pointer-events-none">
            {firstName} {lastName}
          </p>
        </div>
      )}
    </>
  )
}
