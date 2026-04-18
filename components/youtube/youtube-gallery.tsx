'use client'

import { useState } from 'react'
import { Play, Youtube, Eye, X } from 'lucide-react'
import type { YoutubeVideo } from '@/lib/youtube'

function formatViews(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}k`
  return String(n)
}

function formatAgo(date: Date): string {
  const diff  = Date.now() - date.getTime()
  const days  = Math.floor(diff / 86_400_000)
  if (days < 1)   return "aujourd'hui"
  if (days < 7)   return `il y a ${days} j`
  if (days < 30)  return `il y a ${Math.floor(days / 7)} sem`
  if (days < 365) return `il y a ${Math.floor(days / 30)} mois`
  return `il y a ${Math.floor(days / 365)} an${Math.floor(days / 365) > 1 ? 's' : ''}`
}

interface Props {
  videos:    YoutubeVideo[]
  channelId: string
}

export function YoutubeGallery({ videos, channelId }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null)

  if (videos.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 font-inter">
        <Youtube size={40} className="mx-auto mb-3 opacity-20" />
        <p>Aucune vidéo disponible pour le moment.</p>
      </div>
    )
  }

  return (
    <>
      {/* Lecteur modal */}
      {activeId && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setActiveId(null)}
        >
          <div
            className="relative w-full max-w-4xl"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveId(null)}
              className="absolute -top-10 right-0 text-white/70 hover:text-white flex items-center gap-1.5 font-inter text-sm"
            >
              <X size={18} /> Fermer
            </button>
            <div className="relative w-full rounded-xl overflow-hidden bg-black shadow-2xl" style={{ paddingBottom: '56.25%' }}>
              <iframe
                className="absolute inset-0 w-full h-full"
                src={`https://www.youtube.com/embed/${activeId}?autoplay=1&rel=0`}
                title="Vidéo Club MAJOR"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}

      {/* Grille vidéos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {videos.map(video => (
          <button
            key={video.id}
            onClick={() => setActiveId(video.id)}
            className="group text-left flex flex-col bg-major-surface border border-major-primary/20 rounded-xl overflow-hidden hover:border-major-primary/60 hover:shadow-xl hover:shadow-major-primary/10 transition-all duration-300"
          >
            {/* Miniature */}
            <div className="relative overflow-hidden" style={{ paddingBottom: '56.25%' }}>
              <img
                src={video.thumbnail}
                alt={video.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={e => {
                  // fallback vers hqdefault si mqdefault absent
                  const img = e.target as HTMLImageElement
                  if (!img.src.includes('hq')) {
                    img.src = `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`
                  }
                }}
              />
              {/* Overlay + bouton play */}
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-14 h-14 rounded-full bg-red-600 flex items-center justify-center shadow-xl">
                  <Play size={22} className="text-white fill-white ml-1" />
                </div>
              </div>
              {/* Badge durée YouTube */}
              <div className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-inter px-1.5 py-0.5 rounded">
                ▶
              </div>
            </div>

            {/* Infos */}
            <div className="p-3 flex-1 flex flex-col gap-1.5">
              <h3 className="font-inter text-white text-sm font-medium leading-snug line-clamp-2 group-hover:text-major-accent transition-colors">
                {video.title}
              </h3>
              <div className="flex items-center gap-3 text-[11px] text-gray-500 font-inter mt-auto">
                {video.views > 0 && (
                  <span className="flex items-center gap-1">
                    <Eye size={11} /> {formatViews(video.views)}
                  </span>
                )}
                <span>{formatAgo(video.published)}</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Lien vers la chaîne */}
      <div className="text-center mt-10">
        <a
          href={`https://www.youtube.com/channel/${channelId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-inter font-semibold text-sm rounded-lg transition-colors"
        >
          <Youtube size={18} />
          Voir toutes les vidéos sur YouTube
        </a>
      </div>
    </>
  )
}
