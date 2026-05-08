'use client'
import { useState } from 'react'
import { CalendarPlus, X, Download, Copy, Check, ExternalLink } from 'lucide-react'
import type { LevelJsonKey } from '@/lib/sport-levels'
import { SPORT_LEVELS } from '@/lib/sport-levels'

interface Props {
  /** Niveau actif côté UI — si défini, l'export ne contient que ses séances */
  level?: LevelJsonKey | null
}

export function CalendarSubscribe({ level }: Props) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const path = level
    ? `/api/calendar/programme.ics?level=${level}`
    : '/api/calendar/programme.ics'

  const httpsUrl = typeof window !== 'undefined'
    ? window.location.origin + path
    : path
  const webcalUrl = httpsUrl.replace(/^https?:/, 'webcal:')

  const levelDef = level ? SPORT_LEVELS.find(l => l.jsonKey === level) : null

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(httpsUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignore
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-major-primary/15 hover:bg-major-primary/25 border border-major-primary/40 text-major-accent text-sm font-inter font-medium transition-colors"
      >
        <CalendarPlus size={15} />
        S&apos;abonner au calendrier
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center px-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="w-full max-w-md bg-major-black border border-major-primary/30 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden"
          >
            <div className="bg-green-gradient px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CalendarPlus size={18} className="text-white" />
                <p className="font-bebas text-white text-base tracking-widest leading-none">
                  CALENDRIER MAJOR
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Fermer"
                className="text-white/70 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <p className="text-gray-300 font-inter text-sm leading-relaxed">
                  Ajoute le programme d&apos;entraînement à ton calendrier (Google Cal, Apple Cal, Outlook).
                  Il se synchronisera automatiquement à chaque mise à jour du programme.
                </p>
                {levelDef && (
                  <p className={`mt-2 text-xs font-inter ${levelDef.chipText}`}>
                    {levelDef.emoji} Filtré : <span className="font-semibold">{levelDef.label}</span>{' '}
                    <span className="text-gray-500">(seules les séances de ce niveau)</span>
                  </p>
                )}
              </div>

              {/* Bouton 1 — Subscribe natif (webcal://) */}
              <a
                href={webcalUrl}
                className="flex items-center gap-3 w-full bg-major-primary hover:bg-major-dark border border-major-primary rounded-xl px-4 py-3 transition-colors"
              >
                <ExternalLink size={18} className="text-white flex-shrink-0" />
                <div className="text-left flex-1">
                  <p className="text-white font-inter font-semibold text-sm">S&apos;abonner (recommandé)</p>
                  <p className="text-white/70 text-xs">Apple Cal · Outlook · Calendrier iOS/Android</p>
                </div>
              </a>

              {/* Bouton 2 — Google Calendar */}
              <a
                href={`https://calendar.google.com/calendar/u/0/r?cid=${encodeURIComponent(httpsUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 w-full bg-major-surface hover:bg-major-primary/15 border border-major-primary/30 rounded-xl px-4 py-3 transition-colors"
              >
                <ExternalLink size={18} className="text-major-cyan flex-shrink-0" />
                <div className="text-left flex-1">
                  <p className="text-white font-inter font-semibold text-sm">Ajouter à Google Calendar</p>
                  <p className="text-gray-400 text-xs">Ouvre Google Cal et propose l&apos;abonnement</p>
                </div>
              </a>

              {/* Bouton 3 — Copier URL */}
              <button
                type="button"
                onClick={copy}
                className="flex items-center gap-3 w-full bg-major-surface hover:bg-major-primary/15 border border-major-primary/30 rounded-xl px-4 py-3 transition-colors text-left"
              >
                {copied ? (
                  <Check size={18} className="text-major-accent flex-shrink-0" />
                ) : (
                  <Copy size={18} className="text-major-cyan flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-inter font-semibold text-sm">
                    {copied ? 'URL copiée !' : 'Copier l\'URL du calendrier'}
                  </p>
                  <p className="text-gray-400 text-xs truncate">{httpsUrl}</p>
                </div>
              </button>

              {/* Bouton 4 — Download .ics */}
              <a
                href={path}
                download="programme-major.ics"
                className="flex items-center gap-3 w-full bg-major-surface hover:bg-major-primary/15 border border-major-primary/30 rounded-xl px-4 py-3 transition-colors"
              >
                <Download size={18} className="text-major-cyan flex-shrink-0" />
                <div className="text-left flex-1">
                  <p className="text-white font-inter font-semibold text-sm">Télécharger le fichier .ics</p>
                  <p className="text-gray-400 text-xs">Import unique (sans synchro automatique)</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
