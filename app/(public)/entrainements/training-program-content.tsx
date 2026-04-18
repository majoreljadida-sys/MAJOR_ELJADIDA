'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, ChevronLeft, ChevronRight, Dumbbell, Timer, Map, Zap, Activity } from 'lucide-react'
import { formatDate } from '@/lib/utils'

const MONTHS_FR = [
  '', 'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
]

const TYPE_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  ENDURANCE_FONDAMENTALE:  { label: 'Endurance',    color: 'text-blue-400',   bg: 'bg-blue-900/30 border-blue-700/40',   icon: Activity },
  FRACTIONNE:              { label: 'Fractionné',   color: 'text-orange-400', bg: 'bg-orange-900/30 border-orange-700/40', icon: Zap      },
  SORTIE_LONGUE:           { label: 'Sortie longue', color: 'text-purple-400', bg: 'bg-purple-900/30 border-purple-700/40', icon: Map     },
  RENFORCEMENT:            { label: 'Renforcement', color: 'text-green-400',  bg: 'bg-green-900/30 border-green-700/40',  icon: Dumbbell },
  PREPARATION_COMPETITION: { label: 'Compétition',  color: 'text-red-400',    bg: 'bg-red-900/30 border-red-700/40',      icon: Timer    },
  RECUPERATION:            { label: 'Récupération', color: 'text-gray-400',   bg: 'bg-gray-900/30 border-gray-700/40',   icon: Activity },
}

interface Session {
  id: string
  dateFrom: string
  dateTo:   string | null
  title:    string
  description: string
  type:     string
  reminderSent: boolean
}

interface Program {
  id:    string
  month: number
  year:  number
  title: string
  description: string | null
  sessions: Session[]
}

interface Props {
  program:     Program | null
  allPrograms: { id: string; month: number; year: number; title: string }[]
}

export function TrainingProgramContent({ program, allPrograms }: Props) {
  const router = useRouter()
  const [expanded, setExpanded] = useState<string | null>(null)

  // Grouper les séances par semaine
  function groupByWeek(sessions: Session[]) {
    const weeks: Session[][] = []
    let currentWeek: Session[] = []
    let lastWeekStart: number | null = null

    sessions.forEach(s => {
      const d    = new Date(s.dateFrom)
      const day  = d.getDay() // 0=dim, 1=lun...
      const monday = new Date(d)
      monday.setDate(d.getDate() - (day === 0 ? 6 : day - 1))
      const weekStart = monday.getTime()

      if (lastWeekStart === null || weekStart !== lastWeekStart) {
        if (currentWeek.length > 0) weeks.push(currentWeek)
        currentWeek = []
        lastWeekStart = weekStart
      }
      currentWeek.push(s)
    })
    if (currentWeek.length > 0) weeks.push(currentWeek)
    return weeks
  }

  const weeks = program ? groupByWeek(program.sessions) : []
  const today = new Date()

  function isCurrentWeek(sessions: Session[]) {
    if (!sessions.length) return false
    const first = new Date(sessions[0].dateFrom)
    const last  = new Date(sessions[sessions.length - 1].dateTo ?? sessions[sessions.length - 1].dateFrom)
    return today >= first && today <= last
  }

  function isToday(session: Session) {
    const from = new Date(session.dateFrom)
    const to   = session.dateTo ? new Date(session.dateTo) : from
    return today >= from && today <= to
  }

  function navigateProgram(dir: 'prev' | 'next') {
    if (!program) return
    const idx = allPrograms.findIndex(p => p.id === program.id)
    const target = dir === 'prev' ? allPrograms[idx + 1] : allPrograms[idx - 1]
    if (!target) return
    router.push(`/entrainements?m=${target.month}&y=${target.year}`)
    router.refresh()
  }

  const currentIdx = program ? allPrograms.findIndex(p => p.id === program.id) : -1

  return (
    <div className="min-h-screen bg-major-black">
      <div className="max-w-5xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-major-primary/10 rounded-xl border border-major-primary/20">
            <Calendar size={28} className="text-major-accent" />
          </div>
          <div>
            <h1 className="font-bebas text-4xl text-white tracking-widest">PROGRAMME D'ENTRAÎNEMENT</h1>
            <p className="text-gray-400 font-inter text-sm">Planification mensuelle Club MAJOR</p>
          </div>
        </div>

        {/* Sélecteur de mois */}
        {allPrograms.length > 0 && (
          <div className="flex items-center justify-between bg-major-surface border border-gray-800 rounded-xl px-5 py-3 mb-8">
            <button onClick={() => navigateProgram('prev')}
              disabled={currentIdx >= allPrograms.length - 1}
              className="p-1.5 rounded-lg hover:bg-white/5 disabled:opacity-30 transition-colors">
              <ChevronLeft size={20} className="text-gray-400" />
            </button>
            <div className="text-center">
              <p className="font-bebas text-2xl text-white tracking-widest">
                {program ? `${MONTHS_FR[program.month]} ${program.year}` : 'Aucun programme'}
              </p>
              {program && <p className="text-gray-500 text-xs font-inter">{program.sessions.length} séances</p>}
            </div>
            <button onClick={() => navigateProgram('next')}
              disabled={currentIdx <= 0}
              className="p-1.5 rounded-lg hover:bg-white/5 disabled:opacity-30 transition-colors">
              <ChevronRight size={20} className="text-gray-400" />
            </button>
          </div>
        )}

        {/* Pas de programme */}
        {!program && (
          <div className="text-center py-20">
            <Calendar size={48} className="text-gray-700 mx-auto mb-4" />
            <p className="text-gray-500 font-inter">Aucun programme disponible pour le moment.</p>
          </div>
        )}

        {/* Description */}
        {program?.description && (
          <div className="bg-major-surface border border-major-primary/20 rounded-xl px-5 py-4 mb-6 font-inter text-gray-300 text-sm leading-relaxed">
            {program.description}
          </div>
        )}

        {/* Légende */}
        {program && (
          <div className="flex flex-wrap gap-2 mb-6">
            {Object.entries(TYPE_CONFIG).map(([key, cfg]) => {
              const Icon = cfg.icon
              const used = program.sessions.some(s => s.type === key)
              if (!used) return null
              return (
                <span key={key} className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-inter font-medium ${cfg.bg} ${cfg.color}`}>
                  <Icon size={11} />
                  {cfg.label}
                </span>
              )
            })}
          </div>
        )}

        {/* Semaines */}
        {weeks.map((week, wi) => (
          <div key={wi} className={`mb-6 rounded-2xl border overflow-hidden ${
            isCurrentWeek(week) ? 'border-major-primary/50 shadow-lg shadow-major-primary/10' : 'border-gray-800'
          }`}>
            {isCurrentWeek(week) && (
              <div className="bg-major-primary/10 px-5 py-2 border-b border-major-primary/30 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-major-accent animate-pulse" />
                <span className="text-major-accent text-xs font-inter font-semibold uppercase tracking-widest">Semaine en cours</span>
              </div>
            )}
            <div className="divide-y divide-gray-800/60">
              {week.map(s => {
                const cfg    = TYPE_CONFIG[s.type] ?? TYPE_CONFIG.ENDURANCE_FONDAMENTALE
                const Icon   = cfg.icon
                const active = isToday(s)
                const open   = expanded === s.id

                return (
                  <div key={s.id}
                    className={`transition-all ${active ? 'bg-major-primary/5' : 'bg-major-surface/40'}`}>
                    <button
                      onClick={() => setExpanded(open ? null : s.id)}
                      className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-white/3 transition-colors">

                      {/* Date badge */}
                      <div className={`text-center rounded-xl px-3 py-2 min-w-[60px] border ${cfg.bg}`}>
                        <p className="font-bebas text-xl leading-tight text-white">
                          {formatDate(new Date(s.dateFrom), 'dd')}
                        </p>
                        <p className="text-[9px] font-inter uppercase text-gray-400">
                          {formatDate(new Date(s.dateFrom), 'MMM')}
                        </p>
                        {s.dateTo && (
                          <p className="text-[8px] font-inter text-gray-500">
                            → {formatDate(new Date(s.dateTo), 'dd')}
                          </p>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`flex items-center gap-1 text-[10px] font-inter font-semibold uppercase tracking-wider ${cfg.color}`}>
                            <Icon size={10} />
                            {cfg.label}
                          </span>
                          {active && (
                            <span className="text-[9px] bg-major-accent/20 text-major-accent px-2 py-0.5 rounded-full font-inter font-semibold">
                              Aujourd'hui
                            </span>
                          )}
                        </div>
                        <p className="text-white font-inter font-semibold text-sm truncate">{s.title}</p>
                        <p className="text-gray-500 text-xs font-inter mt-0.5 truncate">{s.description.split('\n')[0]}</p>
                      </div>

                      <ChevronRight size={16} className={`text-gray-600 flex-shrink-0 transition-transform ${open ? 'rotate-90' : ''}`} />
                    </button>

                    {/* Détail déplié */}
                    {open && (
                      <div className="px-5 pb-5 pt-1">
                        <div className={`rounded-xl border p-4 ${cfg.bg}`}>
                          <p className="text-gray-200 font-inter text-sm leading-relaxed whitespace-pre-line">{s.description}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        {/* Légende types de séances */}
        {program && (
          <div className="mt-8 bg-major-surface border border-gray-800 rounded-xl p-5">
            <h3 className="font-oswald text-white text-sm uppercase tracking-widest mb-3">Types de séances</h3>
            <div className="space-y-2 text-xs font-inter text-gray-400">
              <p><span className="text-blue-400 font-semibold">EF (Endurance Fondamentale)</span> — Rythme confortable, 65-75% FCM</p>
              <p><span className="text-orange-400 font-semibold">Fractionné</span> — Intervalles courts ou longs à VMA (90-100%)</p>
              <p><span className="text-green-400 font-semibold">Renforcement</span> — PPS (éducatifs) + PPG (gainage, squats, fentes)</p>
              <p><span className="text-purple-400 font-semibold">Sortie longue</span> — Départ EF, finir à allure semi-marathon</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
