'use client'

import { useState } from 'react'
import { formatDate, TRAINING_TYPE_LABELS, SESSION_STATUS_LABELS } from '@/lib/utils'
import { Users, Plus, X, Loader2, Check } from 'lucide-react'
import toast from 'react-hot-toast'

const STATUS_COLOR: Record<string, string> = {
  SCHEDULED:   'text-major-accent',
  COMPLETED:   'text-green-400',
  CANCELLED:   'text-red-400',
  IN_PROGRESS: 'text-major-cyan',
}

const TYPES = [
  { value: 'ENDURANCE_FONDAMENTALE',  label: 'Endurance Fondamentale' },
  { value: 'FRACTIONNE',              label: 'Fractionné' },
  { value: 'SORTIE_LONGUE',           label: 'Sortie Longue' },
  { value: 'PREPARATION_COMPETITION', label: 'Préparation Compétition' },
  { value: 'RECUPERATION',            label: 'Récupération' },
  { value: 'RENFORCEMENT',            label: 'Renforcement' },
]

type Session = {
  id: string; title: string; date: string; location: string; type: string
  status: string; duration: number | null; presentCount: number | null
  group: { id: string; name: string } | null
  coach: { firstName: string; lastName: string } | null
}
type Group = { id: string; name: string; _count: { members: number; sessions: number }; coach: { firstName: string; lastName: string } | null; level: string | null }
type Coach = { id: string; firstName: string; lastName: string }

function AttendanceCell({ session, onSave }: { session: Session; onSave: (id: string, count: number | null) => void }) {
  const [editing, setEditing] = useState(false)
  const [value,   setValue]   = useState(session.presentCount?.toString() ?? '')
  const [saving,  setSaving]  = useState(false)

  async function save() {
    setSaving(true)
    try {
      const res = await fetch(`/api/trainings/${session.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ presentCount: value }),
      })
      if (!res.ok) throw new Error()
      const count = value === '' ? null : parseInt(value)
      onSave(session.id, count)
      setEditing(false)
      toast.success('Présence enregistrée !')
    } catch {
      toast.error('Erreur.')
    } finally {
      setSaving(false)
    }
  }

  if (editing) {
    return (
      <div className="flex items-center gap-1">
        <input
          type="number" min="0" max="500" autoFocus
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setEditing(false) }}
          className="w-16 bg-major-black border border-major-primary rounded-lg px-2 py-1 text-white text-sm font-oswald text-center focus:outline-none"
        />
        <button onClick={save} disabled={saving} className="text-green-400 hover:text-green-300">
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
        </button>
        <button onClick={() => setEditing(false)} className="text-gray-500 hover:text-gray-300">
          <X size={14} />
        </button>
      </div>
    )
  }

  return (
    <button onClick={() => setEditing(true)}
      className="flex items-center gap-1.5 group">
      <span className={`font-oswald font-bold text-base ${session.presentCount !== null ? 'text-major-accent' : 'text-gray-600'}`}>
        {session.presentCount !== null ? session.presentCount : '—'}
      </span>
      <span className="text-gray-600 text-xs font-inter group-hover:text-gray-400 transition-colors">
        {session.presentCount !== null ? 'présents · modifier' : 'cliquer pour saisir'}
      </span>
    </button>
  )
}

export function TrainingsClient({ sessions: init, groups, coaches }: {
  sessions: Session[]; groups: Group[]; coaches: Coach[]
}) {
  const [sessions, setSessions] = useState<Session[]>(init)
  const [showNew,  setShowNew]  = useState(false)
  const [saving,   setSaving]   = useState(false)
  const [form, setForm] = useState({
    title: '', date: '', location: '', type: 'ENDURANCE_FONDAMENTALE',
    groupId: '', coachId: '', duration: '',
  })

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })) }

  function handleAttendanceSave(id: string, count: number | null) {
    setSessions(s => s.map(x => x.id === id
      ? { ...x, presentCount: count, status: count !== null ? 'COMPLETED' : x.status }
      : x
    ))
  }

  async function createSession() {
    if (!form.title || !form.date || !form.type) return toast.error('Titre, date et type requis.')
    setSaving(true)
    try {
      const res  = await fetch('/api/trainings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      const newSession: Session = {
        ...data.training,
        date:         new Date(data.training.date).toISOString(),
        presentCount: null,
        group:        groups.find(g => g.id === form.groupId) ?? null,
        coach:        coaches.find(c => c.id === form.coachId) ?? null,
      }
      setSessions(s => [newSession, ...s])
      setShowNew(false)
      setForm({ title: '', date: '', location: '', type: 'ENDURANCE_FONDAMENTALE', groupId: '', coachId: '', duration: '' })
      toast.success('Séance créée !')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  const totalPresences = sessions.reduce((sum, s) => sum + (s.presentCount ?? 0), 0)
  const avgPresence    = sessions.filter(s => s.presentCount !== null).length > 0
    ? Math.round(totalPresences / sessions.filter(s => s.presentCount !== null).length)
    : null

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-bebas text-4xl text-white tracking-widest">SÉANCES D'ENTRAÎNEMENT</h1>
          <p className="text-gray-400 font-inter text-sm mt-1">{sessions.length} séances · {groups.length} groupes</p>
        </div>
        <button onClick={() => setShowNew(true)}
          className="btn-primary flex items-center gap-2 px-5 py-2.5 text-sm font-inter font-semibold">
          <Plus size={16} /> Nouvelle séance
        </button>
      </div>

      {/* Stats rapides */}
      {avgPresence !== null && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="card-dark">
            <p className="text-gray-500 text-xs font-inter uppercase tracking-widest mb-1">Séances enregistrées</p>
            <p className="font-oswald text-2xl font-bold text-white">{sessions.filter(s => s.presentCount !== null).length}</p>
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

      {/* Groupes */}
      <section className="mb-10">
        <h2 className="font-oswald text-white text-xl uppercase tracking-wide mb-4">Groupes d'entraînement</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map(g => (
            <div key={g.id} className="card-dark">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-oswald text-white text-lg font-semibold">{g.name}</h3>
                  <p className="text-gray-500 text-sm font-inter">{g.level}</p>
                </div>
                <span className="badge text-xs">{g._count.members} membres</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400 text-sm font-inter">
                <Users size={13} className="text-major-primary" />
                Coach : {g.coach ? `${g.coach.firstName} ${g.coach.lastName}` : 'Non assigné'}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tableau séances */}
      <section>
        <h2 className="font-oswald text-white text-xl uppercase tracking-wide mb-4">Séances</h2>
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
                    <td colSpan={8} className="text-center py-12 text-gray-600 font-inter">
                      Aucune séance. Créez la première !
                    </td>
                  </tr>
                )}
                {sessions.map(s => (
                  <tr key={s.id}>
                    <td className="text-gray-400 text-xs whitespace-nowrap">{formatDate(s.date, 'dd MMM yyyy')}</td>
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
      </section>

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
                <input className="input-dark" placeholder="Ex : Sortie longue dimanche" value={form.title} onChange={e => set('title', e.target.value)} />
              </div>
              <div>
                <label className="form-label">Date *</label>
                <input type="datetime-local" className="input-dark" value={form.date} onChange={e => set('date', e.target.value)} />
              </div>
              <div>
                <label className="form-label">Durée (min)</label>
                <input type="number" className="input-dark" placeholder="90" value={form.duration} onChange={e => set('duration', e.target.value)} />
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
                <input className="input-dark" placeholder="Corniche El Jadida..." value={form.location} onChange={e => set('location', e.target.value)} />
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
