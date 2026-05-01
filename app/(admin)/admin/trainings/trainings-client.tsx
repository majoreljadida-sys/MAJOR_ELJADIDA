'use client'

import { useState } from 'react'
import { formatDate, TRAINING_TYPE_LABELS, SESSION_STATUS_LABELS } from '@/lib/utils'
import { Calendar, Users, Clock, Plus, X, CheckSquare, Square, Save, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

const STATUS_COLOR: Record<string, string> = {
  SCHEDULED:   'text-major-accent',
  COMPLETED:   'text-gray-500',
  CANCELLED:   'text-red-400',
  IN_PROGRESS: 'text-major-cyan',
}

const TYPES = [
  { value: 'ENDURANCE_FONDAMENTALE', label: 'Endurance Fondamentale' },
  { value: 'FRACTIONNE',             label: 'Fractionné' },
  { value: 'SORTIE_LONGUE',          label: 'Sortie Longue' },
  { value: 'PREPARATION_COMPETITION',label: 'Préparation Compétition' },
  { value: 'RECUPERATION',           label: 'Récupération' },
  { value: 'RENFORCEMENT',           label: 'Renforcement' },
]

type Session = {
  id: string; title: string; date: string; location: string; type: string
  status: string; duration: number | null
  group: { id: string; name: string } | null
  coach: { firstName: string; lastName: string } | null
  attendances: { present: boolean }[]
}
type Group   = { id: string; name: string; _count: { members: number; sessions: number }; coach: { firstName: string; lastName: string } | null; level: string | null }
type Coach   = { id: string; firstName: string; lastName: string }
type Attendance = { id: string; present: boolean; member: { id: string; firstName: string; lastName: string } }

export function TrainingsClient({ sessions: init, groups, coaches }: {
  sessions: Session[]; groups: Group[]; coaches: Coach[]
}) {
  const [sessions, setSessions] = useState<Session[]>(init)
  const [showNew,  setShowNew]  = useState(false)
  const [saving,   setSaving]   = useState(false)
  const [form, setForm] = useState({
    title: '', date: '', location: '', type: 'ENDURANCE_FONDAMENTALE',
    groupId: '', coachId: '', duration: '', description: '',
  })

  // Modal présences
  const [attendModal, setAttendModal] = useState<string | null>(null)
  const [attendances, setAttendances] = useState<Attendance[]>([])
  const [attendLoading, setAttendLoading] = useState(false)
  const [attendSaving,  setAttendSaving]  = useState(false)

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })) }

  async function createSession() {
    if (!form.title || !form.date || !form.type) return toast.error('Titre, date et type requis.')
    setSaving(true)
    try {
      const res  = await fetch('/api/trainings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSessions(s => [{ ...data.training, group: groups.find(g => g.id === form.groupId) ?? null, coach: coaches.find(c => c.id === form.coachId) ?? null, attendances: [] }, ...s])
      setShowNew(false)
      setForm({ title: '', date: '', location: '', type: 'ENDURANCE_FONDAMENTALE', groupId: '', coachId: '', duration: '', description: '' })
      toast.success('Séance créée !')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function openAttendance(sessionId: string) {
    setAttendModal(sessionId)
    setAttendLoading(true)
    try {
      const res  = await fetch(`/api/trainings/${sessionId}/attendance`)
      const data = await res.json()
      setAttendances(data.attendances ?? [])
    } catch {
      toast.error('Erreur de chargement.')
    } finally {
      setAttendLoading(false)
    }
  }

  function togglePresent(memberId: string) {
    setAttendances(a => a.map(x => x.member.id === memberId ? { ...x, present: !x.present } : x))
  }

  async function saveAttendance() {
    if (!attendModal) return
    setAttendSaving(true)
    try {
      const updates = attendances.map(a => ({ memberId: a.member.id, present: a.present }))
      const res  = await fetch(`/api/trainings/${attendModal}/attendance`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates }),
      })
      if (!res.ok) throw new Error()
      const presentCount = updates.filter(u => u.present).length
      setSessions(s => s.map(x => x.id === attendModal
        ? { ...x, attendances: updates.map(u => ({ present: u.present })), status: presentCount > 0 ? 'COMPLETED' : x.status }
        : x
      ))
      toast.success('Présences enregistrées !')
      setAttendModal(null)
    } catch {
      toast.error('Erreur lors de la sauvegarde.')
    } finally {
      setAttendSaving(false)
    }
  }

  const presentCount = attendances.filter(a => a.present).length

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
              <p className="text-gray-600 text-xs font-inter mt-2">{g._count.sessions} séances totales</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tableau séances */}
      <section>
        <h2 className="font-oswald text-white text-xl uppercase tracking-wide mb-4">Dernières séances</h2>
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
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sessions.length === 0 && (
                  <tr>
                    <td colSpan={9} className="text-center py-12 text-gray-600 font-inter">
                      Aucune séance. Créez la première !
                    </td>
                  </tr>
                )}
                {sessions.map(s => {
                  const present = s.attendances.filter(a => a.present).length
                  const total   = s.attendances.length
                  const pct     = total > 0 ? Math.round((present / total) * 100) : null
                  return (
                    <tr key={s.id}>
                      <td className="text-gray-400 text-xs whitespace-nowrap">{formatDate(s.date, 'dd MMM yyyy')}</td>
                      <td className="text-white font-medium text-sm">{s.title}</td>
                      <td><span className="badge text-xs">{TRAINING_TYPE_LABELS[s.type] ?? s.type}</span></td>
                      <td className="text-gray-400 text-sm">{s.group?.name ?? '—'}</td>
                      <td className="text-gray-400 text-sm whitespace-nowrap">
                        {s.coach ? `${s.coach.firstName} ${s.coach.lastName}` : '—'}
                      </td>
                      <td className="text-gray-400 text-sm">{s.duration ?? '—'} min</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <span className="text-major-accent font-oswald font-bold">{present}/{total}</span>
                          {pct !== null && (
                            <span className={`text-xs font-inter ${pct >= 75 ? 'text-green-400' : pct >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                              {pct}%
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className={`text-xs font-inter font-medium ${STATUS_COLOR[s.status] ?? 'text-gray-400'}`}>
                          {SESSION_STATUS_LABELS[s.status] ?? s.status}
                        </span>
                      </td>
                      <td>
                        <button onClick={() => openAttendance(s.id)}
                          className="flex items-center gap-1 text-xs font-inter text-major-accent hover:text-major-primary border border-major-primary/30 rounded-lg px-3 py-1.5 transition-colors">
                          <CheckSquare size={13} /> Présences
                        </button>
                      </td>
                    </tr>
                  )
                })}
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

      {/* Modal présences */}
      {attendModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-major-dark border border-gray-800 rounded-2xl w-full max-w-md flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between p-5 border-b border-gray-800">
              <div>
                <h3 className="font-oswald text-white text-xl uppercase tracking-wide">Présences</h3>
                <p className="text-gray-500 text-xs font-inter mt-0.5">
                  {sessions.find(s => s.id === attendModal)?.title}
                </p>
              </div>
              <button onClick={() => setAttendModal(null)} className="text-gray-500 hover:text-white"><X size={20} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {attendLoading && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 size={24} className="animate-spin text-major-accent" />
                </div>
              )}
              {!attendLoading && attendances.length === 0 && (
                <p className="text-gray-600 text-sm font-inter text-center py-8">
                  Aucun membre dans ce groupe.
                </p>
              )}
              {!attendLoading && attendances.map(a => (
                <button key={a.member.id} onClick={() => togglePresent(a.member.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                    a.present
                      ? 'bg-green-900/20 border-green-700/40 text-green-400'
                      : 'bg-major-black/40 border-gray-800 text-gray-400 hover:border-gray-600'
                  }`}>
                  {a.present
                    ? <CheckSquare size={18} className="flex-shrink-0" />
                    : <Square     size={18} className="flex-shrink-0" />
                  }
                  <span className="font-inter text-sm font-medium">
                    {a.member.firstName} {a.member.lastName}
                  </span>
                  {a.present && <span className="ml-auto text-xs font-inter text-green-500">Présent</span>}
                </button>
              ))}
            </div>

            {!attendLoading && attendances.length > 0 && (
              <div className="p-4 border-t border-gray-800">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-400 text-sm font-inter">
                    <span className="text-white font-bold">{presentCount}</span> / {attendances.length} présents
                  </span>
                  <span className={`text-sm font-oswald font-bold ${
                    presentCount / attendances.length >= 0.75 ? 'text-green-400' :
                    presentCount / attendances.length >= 0.5  ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {Math.round((presentCount / attendances.length) * 100)}%
                  </span>
                </div>
                <button onClick={saveAttendance} disabled={attendSaving}
                  className="btn-primary w-full flex items-center justify-center gap-2 py-2.5 text-sm disabled:opacity-50">
                  {attendSaving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                  Enregistrer les présences
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
