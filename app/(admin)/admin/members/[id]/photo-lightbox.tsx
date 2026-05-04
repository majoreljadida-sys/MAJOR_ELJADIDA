'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

export function PhotoLightbox({ photo, name, fallback }: {
  photo: string | null
  name:  string
  fallback: string
}) {
  const [open, setOpen] = useState(false)

  // Ferme avec Escape
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      <button
        type="button"
        onClick={() => photo && setOpen(true)}
        disabled={!photo}
        title={photo ? 'Cliquer pour agrandir' : ''}
        className={`w-24 h-24 rounded-full bg-major-primary/15 border-2 border-major-primary/40 flex items-center justify-center overflow-hidden flex-shrink-0 ${
          photo ? 'cursor-zoom-in hover:ring-2 hover:ring-major-accent transition-all' : 'cursor-default'
        }`}>
        {photo
          ? <img src={photo} alt={name} className="w-full h-full object-cover" />
          : <span className="font-oswald text-major-accent text-3xl font-bold">{fallback}</span>}
      </button>

      {open && photo && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in duration-150">
          <button
            onClick={() => setOpen(false)}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
            title="Fermer">
            <X size={20} />
          </button>
          <img
            src={photo}
            alt={name}
            onClick={e => e.stopPropagation()}
            className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl cursor-default"
          />
          <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white font-oswald text-lg uppercase tracking-widest px-4 py-1.5 bg-black/50 rounded-full pointer-events-none">
            {name}
          </p>
        </div>
      )}
    </>
  )
}
