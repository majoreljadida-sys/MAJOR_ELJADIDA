'use client'
import { useRef, useState, useEffect } from 'react'
import { Music, X, Play, Pause, Download } from 'lucide-react'
import Image from 'next/image'

const AUDIO_SRC = '/hymne-major.mp3'
const FILE_NAME = 'Hymne-MAJOR-V7.mp3'

export function HymneWidget() {
  const [open, setOpen] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    const a = audioRef.current
    if (!a) return
    const onTime = () => setProgress(a.currentTime)
    const onLoaded = () => setDuration(a.duration)
    const onEnd = () => setPlaying(false)
    a.addEventListener('timeupdate', onTime)
    a.addEventListener('loadedmetadata', onLoaded)
    a.addEventListener('ended', onEnd)
    return () => {
      a.removeEventListener('timeupdate', onTime)
      a.removeEventListener('loadedmetadata', onLoaded)
      a.removeEventListener('ended', onEnd)
    }
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const toggle = () => {
    const a = audioRef.current
    if (!a) return
    if (playing) { a.pause(); setPlaying(false) }
    else { a.play(); setPlaying(true) }
  }

  const seek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const a = audioRef.current
    if (!a) return
    a.currentTime = Number(e.target.value)
    setProgress(a.currentTime)
  }

  const fmt = (s: number) => {
    if (!isFinite(s)) return '0:00'
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60).toString().padStart(2, '0')
    return `${m}:${sec}`
  }

  return (
    <>
      {/* Bouton inline — même style que le bouton Coach du hero */}
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-6 py-3.5 text-gray-300 hover:text-white text-base font-inter font-medium transition-colors group"
      >
        <span className="relative w-[22px] h-[22px] flex items-center justify-center">
          <Image src="/logo_major.png" alt="" width={22} height={22} className="object-contain group-hover:scale-110 transition-transform" />
          <span className="absolute -top-1 -right-1.5 w-3.5 h-3.5 rounded-full bg-major-accent flex items-center justify-center">
            <Music size={8} className="text-major-black" />
          </span>
        </span>
        Hymne MAJOR
      </button>

      {/* Modal lecteur */}
      {open && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center px-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="w-full max-w-md bg-major-black border border-major-primary/30 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden"
          >
            <div className="bg-green-gradient px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center">
                  <Music size={18} className="text-white" />
                </div>
                <div>
                  <p className="font-bebas text-white text-base tracking-widest leading-none">HYMNE MAJOR</p>
                  <p className="text-white/70 text-[10px] font-inter">Communauté MAJOR · V7</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} aria-label="Fermer" className="text-white/70 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <audio ref={audioRef} src={AUDIO_SRC} preload="metadata" />

              <div className="flex items-center gap-3">
                <button
                  onClick={toggle}
                  aria-label={playing ? 'Pause' : 'Lecture'}
                  className="w-12 h-12 rounded-full bg-major-primary hover:bg-major-dark flex items-center justify-center text-white transition-colors flex-shrink-0"
                >
                  {playing ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
                </button>

                <div className="flex-1 space-y-1">
                  <input
                    type="range"
                    min={0}
                    max={duration || 0}
                    step={0.1}
                    value={progress}
                    onChange={seek}
                    className="w-full h-1 bg-major-surface rounded-full appearance-none cursor-pointer accent-major-accent"
                  />
                  <div className="flex justify-between text-[10px] font-inter text-gray-400">
                    <span>{fmt(progress)}</span>
                    <span>{fmt(duration)}</span>
                  </div>
                </div>
              </div>

              <a
                href={AUDIO_SRC}
                download={FILE_NAME}
                className="flex items-center justify-center gap-2 w-full bg-major-surface hover:bg-major-primary/20 border border-major-primary/30 rounded-xl px-3 py-2.5 text-sm font-inter text-major-cyan transition-colors"
              >
                <Download size={15} />
                Télécharger l&apos;hymne
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
