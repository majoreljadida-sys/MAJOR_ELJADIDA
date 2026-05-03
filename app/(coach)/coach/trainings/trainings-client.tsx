'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Plus, X, Loader2, Check, Download, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatDate, TRAINING_TYPE_LABELS, SESSION_STATUS_LABELS } from '@/lib/utils'

const TYPES = [
  { value: 'ENDURANCE_FONDAMENTALE',  label: 'Endurance Fondamentale' },
  { value: 'FRACTIONNE',              label: 'Fractionné'             },
  { value: 'SORTIE_LONGUE',           label: 'Sortie Longue'          },
  { value: 'PREPARATION_COMPETITION', label: 'Préparation Compétition' },
  { value: 'RECUPERATION',            label: 'Récupération'           },
  { value: 'RENFORCEMENT',            label: 'Renforcement'           },
]

const STATUS_COLOR: Record<string, string> = {
  SCHEDULED:   'text-major-accent',
  COMPLETED:   'text-green-400',
  CANCELLED:   'text-red-400',
  IN_PROGRESS: 'text-major-cyan',
}

type Session = {
  id: string; title: string; date: string; location: string; type: string
  status: string; duration: number | null; presentCount: number | null
  group: { id: string; name: string } | null
  coach: { firstName: string; lastName: string } | null
}
type Group = { id: string; name: string }
type Coach = { id: string; firstName: string; lastName: string }

function fmtIso(d: Date) { return d.toISOString().slice(0, 10) }
function startOfIsoWeek(d: Date): Date {
  const date = new Date(d); date.setHours(0, 0, 0, 0)
  const day = date.getDay(); const diff = day === 0 ? -6 : 1 - day
  date.setDate(date.getDate() + diff); return date
}

function AttendanceCell({ session, onSave }: { session: Session; onSave: (id: string, count: number | null) => void }) {
  const [editing, setEditing] = useState(false)
  const [value,   setValue]   = useState(session.presentCount?.toString() ?? '')
  const [saving,  setSaving]  = useState(false)

  async function save() {
    setSaving(true)
    try {
      const res = await fetch(`/api/trainings/${session.id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ presentCount: value }),
      })
      if (!res.ok) throw new Error()
      const count = value === '' ? null : parseInt(value)
      onSave(session.id, count)
      setEditing(false)
      toast.success('Présences enregistrées.')
    } catch {
      toast.error('Erreur.')
    } finally {
      setSaving(false)
    }
  }

  if (editing) return (
    <div className="flex items-center gap-1">
      <input type="number" min="0" max="500" autoFocus
        value={value} onChange={e => setValue(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setEditing(false) }}
        className="w-16 bg-major-black border border-major-primary rounded-lg px-2 py-1 text-white text-sm font-oswald text-center focus:outline-none" />
      <button onClick={save} disabled={saving} className="text-green-400 hover:text-green-300">
        {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
      </button>
      <button onClick={() => setEditing(false)} className="text-gray-500 hover:text-gray-300">
        <X size={14} />
      </button>
    </div>
  )

  return (
    <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 group">
      <span className={`font-oswald font-bold text-base ${session.presentCount !== null ? 'text-major-accent' : 'text-gray-600'}`}>
        {session.presentCount !== null ? session.presentCount : '—'}
      </span>
      <span className="text-gray-600 text-xs font-inter group-hover:text-gray-400 transition-colors">
        {session.presentCount !== null ? 'présents · modifier' : 'cliquer pour saisir'}
      </span>
    </button>
  )
}

export function CoachTrainingsClient({
  weekStart, sessions: init, groups, coaches, programSessionsCount,
}: {
  weekStart: string
  sessions: Session[]
  groups: Group[]
  coaches: Coach[]
  programSessionsCount: number
}) {
  const router = useRouter()
  const [sessions, setSessions] = useState(init)
  const [showNew, setShowNew]   = useState(false)
  const [saving, setSaving]     = useState(false)
  const [importing, setImporting] = useState(false)
  const [form, setForm] = useState({
    title: '', date: '', location: '', type: 'ENDURANCE_FONDAMENTALE',
    groupId: '', coachId: '', duration: '',
  })

  const ws = new Date(weekStart)
  const we = new Date(ws); we.setDate(we.getDate() + 6)
  const isCurrentWeek = startOfIsoWeek(new Date()).getTime() === ws.getTime()

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })) }
  function gotoWeek(offset: number) {
    const d = new Date(ws); d.setDate(d.getDate() + offset * 7)
    router.push(`/coach/trainings?week=${fmtIso(d)}`)
  }

  function handleAttendanceSave(id: string, count: number | null) {
    setSessions(s => s.map(x => x.id === id
      ? { ...x, presentCount: count, status: count !== null ? 'COMPLETED' : x.status }
      : x))
  }

  async function importWeek() {
    setImporting(true)
    try {
      const res = await fetch('/api/trainings/import-week', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ weekStart: fmtIso(ws) }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      if (data.created > 0)
        toast.success(`${data.created} séance${data.created > 1 ? 's' : ''} importée${data.created > 1 ? 's' : ''} depuis le programme.${data.skipped ? ` (${data.skipped} déjà existante${data.skipped > 1 ? 's' : ''})` : ''}`)
      else if (data.skipped > 0)
        toast(`Toutes les séances de cette semaine sont déjà importées (${data.skipped}).`)
      else
        toast(data.message || 'Rien à importer pour cette semaine.', { icon: 'ℹ️' })
      router.refresh()
    } catch (err: any) {
      toast.error(err.message ?? 'Erreur.')
    } finally {
      setImporting(false)
    }
  }

  async function createSession() {
    if (!form.title || !form.date || !form.type) return toast.error('Titre, date et type requis.')
    setSaving(true)
    try {
      const res = await fetch('/api/trainings', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      const newSession: Session = {
        ...data.training,
        date:         new Date(data.training.date).toISOString(),
        presentCount: null,
        group:        groups.find(g => g.id === form.groupId)
                        ? { id: form.groupId, name: groups.find(g => g.id === form.groupId)!.name }
                        : null,
        coach:        coaches.find(c => c.id === form.coachId)
                        ? { firstName: coaches.find(c => c.id === form.coachId)!.firstName,
                            lastName:  coaches.find(c => c.id === form.coachId)!.lastName }
                        : null,
      }
      setSessions(s => [...s, newSession].sort((a, b) => +new Date(a.date) - +new Date(b.date)))
      setShowNew(false)
      setForm({ title: '', date: '', location: '', type: 'ENDURANCE_FONDAMENTALE', groupId: '', coachId: '', duration: '' })
      toast.success('Séance créée.')
      router.refresh()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  const totalPresences = sessions.reduce((sum, s) => sum + (s.presentCount ?? 0), 0)
  const recordedSessions = sessions.filter(s => s.presentCount !== null).length
  const avgPresence = recordedSessions > 0 ? Math.round(totalPresences / recordedSessions) : null

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <div>
          <h1 className="font-bebas text-4xl text-white tracking-widest">ENTRAÎNEMENTS</h1>
          <p className="text-gray-400 font-inter text-sm mt-1">
            {sessions.length} séance{sessions.length > 1 ? 's' : ''} cette semaine
          </p>
        </div>
        <button onClick={() => setShowNew(true)}
          className="btn-primary flex items-center gap-2 px-5 py-2.5 text-sm font-inter font-semibold">
          <Plus size={16} /> Nouvelle séance
        </button>
      </div>

      {/* Navigation semaine + bouton import */}
      <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
        <div className="flex items-center gap-2">
          <button onClick={() => gotoWeek(-1)} className="btn-secondary flex items-center gap-1 px-3 py-2 text-xs">
            <ChevronLeft size={14} /> Précédente
          </button>
          {!isCurrentWeek && (
            <button onClick={() => router.push('/coach/trainings')} className="btn-secondary px-3 py-2 text-xs">
              Cette semaine
            </button>
          )}
          <button onClick={() => gotoWeek(1)} className="btn-secondary flex items-center gap-1 px-3 py-2 text-xs">
            Suivante <ChevronRight size={14} />
          </button>
          <span className="text-gray-300 font-oswald text-base uppercase tracking-wide ml-2">
            {formatDate(ws, 'dd MMM')} → {formatDate(we, 'dd MMM yyyy')}
            {isCurrentWeek && <span className="ml-2 text-major-accent text-xs font-inter">· Cette semaine</span>}
          </span>
        </div>

        <button onClick={importWeek} disabled={importing || programSessionsCount === 0}
          title={programSessionsCount === 0
            ? 'Aucune séance n\'est planifiée pour cette semaine dans le programme du mois.'
            : `Crée les séances de la semaine à partir des ${programSessionsCount} séances du programme.`}
          className="btn-primary flex items-center gap-2 px-4 py-2 text-xs disabled:opacity-50 disabled:cursor-not-allowed">
          {importing ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
          {importing ? 'Import…' : `Importer depuis le programme${programSessionsCount > 0 ? ` (${programSessionsCount})` : ''}`}
        </button>
      </div>

      {/* Stats rapides */}
      {avgPresence !== null && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="card-dark">
            <p className="text-gray-500 text-xs font-inter uppercase tracking-widest mb-1">Séances enregistrées</p>
            <p className="font-oswald text-2xl font-bold text-white">{recordedSessions}</p>
          </div>
          <div className="card-dark">
            <p className="text-gray-500 text-xs font-inter uppercase tracking-widest mb-1">Moyenne présences</p>
            <p className="font-oswald text-2xl font-bold text-major-accent">{avgPresence}</p>
          </div>
          <div className="card-dark">
            <p className="text-gray-500 text-xs font-inter uppercase tracking-widest mb-1">Total présences</p>
            <p className="font-oswald text-2xl font-bold text-major-cyan">{totalPresences}</p>
          </div>
        </div>
      )}

      {/* Tableau séances */}
      <div className="card-dark overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="table-dark">
            <thead>
              <tr>
                <th>Date</th>
                <th>Séance</th>
                <th>Type</th>
                <th>Groupe</th>
                <th>Coach</th>
                <th>Durée</th>
                <th>Présences</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {sessions.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2 text-gray-600 font-inter">
                      <Calendar size={32} className="text-gray-700" />
                      <p>Aucune séance pour cette semaine.</p>
                      {programSessionsCount > 0 && (
                        <p className="text-xs text-gray-500">
                          {programSessionsCount} séance{programSessionsCount > 1 ? 's' : ''} prévue{programSessionsCount > 1 ? 's' : ''} dans le programme — clique <span className="text-major-accent">"Importer depuis le programme"</span> ci-dessus.
                        </p>
                      )}
                    </div>
                  </td>
                </tr>
              )}
              {sessions.map(s => (
                <tr key={s.id}>
                  <td className="text-gray-400 text-xs whitespace-nowrap">{formatDate(s.date, "EEE dd MMM 'à' HH'h'mm")}</td>
                  <td className="text-white font-medium text-sm">{s.title}</td>
                  <td><span className="badge text-xs">{TRAINING_TYPE_LABELS[s.type] ?? s.type}</span></td>
                  <td className="text-gray-400 text-sm">{s.group?.name ?? '—'}</td>
                  <td className="text-gray-400 text-sm whitespace-nowrap">
                    {s.coach ? `${s.coach.firstName} ${s.coach.lastName}` : '—'}
                  </td>
                  <td className="text-gray-400 text-sm">{s.duration ?? '—'} min</td>
                  <td><AttendanceCell session={s} onSave={handleAttendanceSave} /></td>
                  <td>
                    <span className={`text-xs font-inter font-medium ${STATUS_COLOR[s.status] ?? 'text-gray-400'}`}>
                      {SESSION_STATUS_LABELS[s.status] ?? s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal nouvelle séance */}
      {showNew && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-major-dark border border-gray-800 rounded-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-oswald text-white text-xl uppercase tracking-wide">Nouvelle séance</h3>
              <button onClick={() => setShowNew(false)} className="text-gray-500 hover:text-white"><X size={20} /></button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="form-label">Titre *</label>
                <input className="input-dark" placeholder="Ex : Sortie longue dimanche"
                  value={form.title} onChange={e => set('title', e.target.value)} />
              </div>
              <div>
                <label className="form-label">Date *</label>
                <input type="datetime-local" className="input-dark"
                  value={form.date} onChange={e => set('date', e.target.value)} />
              </div>
              <div>
                <label className="form-label">Durée (min)</label>
                <input type="number" className="input-dark" placeholder="90"
                  value={form.duration} onChange={e => set('duration', e.target.value)} />
              </div>
              <div className="col-span-2">
                <label className="form-label">Type *</label>
                <select className="input-dark" value={form.type} onChange={e => set('type', e.target.value)}>
                  {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Groupe</label>
                <select className="input-dark" value={form.groupId} onChange={e => set('groupId', e.target.value)}>
                  <option value="">— Aucun —</option>
                  {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Coach</label>
                <select className="input-dark" value={form.coachId} onChange={e => set('coachId', e.target.value)}>
                  <option value="">— Aucun —</option>
                  {coaches.map(c => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="form-label">Lieu</label>
                <input className="input-dark" placeholder="Corniche El Jadida..."
                  value={form.location} onChange={e => set('location', e.target.value)} />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowNew(false)} className="btn-secondary flex-1 py-2.5 text-sm">Annuler</button>
              <button onClick={createSession} disabled={saving}
                className="btn-primary flex-1 flex items-center justify-center gap-2 py-2.5 text-sm disabled:opacity-50">
                {saving ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
                Créer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
