'use client'

import { useState } from 'react'
import { Calendar, Plus, Trash2, ChevronDown, ChevronUp, MessageCircle, CheckCircle, Pencil, X, Check } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

const MONTHS_FR = ['', 'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']

const TYPES = [
  { value: 'ENDURANCE_FONDAMENTALE',  label: 'Endurance Fondamentale' },
  { value: 'FRACTIONNE',             label: 'Fractionné'             },
  { value: 'SORTIE_LONGUE',          label: 'Sortie longue'          },
  { value: 'RENFORCEMENT',           label: 'Renforcement musculaire' },
  { value: 'PREPARATION_COMPETITION',label: 'Préparation compétition'},
  { value: 'RECUPERATION',           label: 'Récupération'           },
]

const TYPE_COLORS: Record<string, string> = {
  ENDURANCE_FONDAMENTALE:   'text-blue-400',
  FRACTIONNE:               'text-orange-400',
  SORTIE_LONGUE:            'text-purple-400',
  RENFORCEMENT:             'text-green-400',
  PREPARATION_COMPETITION:  'text-red-400',
  RECUPERATION:             'text-gray-400',
}

interface Session {
  id: string; dateFrom: string; dateTo: string | null
  title: string; description: string; type: string; reminderSent: boolean
}
interface Program {
  id: string; month: number; year: number; title: string
  description: string | null; whatsappGroup: string | null; sessions: Session[]
}

const EMPTY_SESSION = { dateFrom: '', dateTo: '', title: '', description: '', type: 'ENDURANCE_FONDAMENTALE' }

export function AdminProgramsClient({ programs: initial }: { programs: Program[] }) {
  const [programs, setPrograms] = useState<Program[]>(initial)
  const [showNew, setShowNew]   = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [sending, setSending]   = useState<string | null>(null)
  const [deletingSession, setDeletingSession] = useState<string | null>(null)

  // Edition d'une séance
  const [editingSession, setEditingSession] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<Session>>({})

  // Formulaire nouveau programme
  const [form, setForm] = useState({
    month: String(new Date().getMonth() + 1),
    year:  String(new Date().getFullYear()),
    title: '',
    description: '',
    whatsappGroup: '',
  })
  const [sessions, setSessions] = useState([{ ...EMPTY_SESSION }])
  const [saving, setSaving] = useState(false)

  function addSession() { setSessions(s => [...s, { ...EMPTY_SESSION }]) }
  function removeSession(i: number) { setSessions(s => s.filter((_, idx) => idx !== i)) }
  function updateSession(i: number, field: string, val: string) {
    setSessions(s => s.map((sess, idx) => idx === i ? { ...sess, [field]: val } : sess))
  }

  async function saveProgram() {
    if (!form.title || !form.month || !form.year) return toast.error('Titre et date obligatoires')
    setSaving(true)
    try {
      const validSessions = sessions.filter(s => s.dateFrom && s.title)
      const skipped = sessions.length - validSessions.length
      if (skipped > 0) toast(`${skipped} séance(s) ignorée(s) : date de début et titre obligatoires`, { icon: '⚠️' })
      const res = await fetch('/api/training-programs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, sessions: validSessions }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setPrograms(p => [data.program, ...p])
      setShowNew(false)
      setSessions([{ ...EMPTY_SESSION }])
      setForm({ month: String(new Date().getMonth() + 1), year: String(new Date().getFullYear()), title: '', description: '', whatsappGroup: '' })
      toast.success('Programme créé !')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function deleteProgram(id: string) {
    if (!confirm('Supprimer ce programme ?')) return
    try {
      const res = await fetch(`/api/training-programs/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Erreur suppression')
      setPrograms(p => p.filter(x => x.id !== id))
      toast.success('Programme supprimé')
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  // ── Supprimer une séance
  async function deleteSession(programId: string, sessionId: string) {
    if (!confirm('Supprimer cette séance ?')) return
    setDeletingSession(sessionId)
    try {
      const res = await fetch(`/api/training-programs/${programId}/sessions/${sessionId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Erreur suppression')
      setPrograms(ps => ps.map(p => p.id === programId
        ? { ...p, sessions: p.sessions.filter(s => s.id !== sessionId) }
        : p
      ))
      toast.success('Séance supprimée')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setDeletingSession(null)
    }
  }

  // ── Modifier une séance
  function startEdit(s: Session) {
    setEditingSession(s.id)
    setEditForm({
      dateFrom: s.dateFrom.split('T')[0],
      dateTo:   s.dateTo ? s.dateTo.split('T')[0] : '',
      title:    s.title,
      description: s.description,
      type:     s.type,
    })
  }

  async function saveEdit(programId: string, sessionId: string) {
    try {
      const res = await fetch(`/api/training-programs/${programId}/sessions/${sessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setPrograms(ps => ps.map(p => p.id === programId
        ? { ...p, sessions: p.sessions.map(s => s.id === sessionId ? { ...s, ...data.session } : s) }
        : p
      ))
      setEditingSession(null)
      toast.success('Séance modifiée')
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  async function sendReminder(programId: string, sessionId: string) {
    setSending(sessionId)
    try {
      const res  = await fetch(`/api/training-programs/${programId}/remind`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      window.open(data.waLink, '_blank')
      setPrograms(ps => ps.map(p => p.id === programId ? {
        ...p,
        sessions: p.sessions.map(s => s.id === sessionId ? { ...s, reminderSent: true } : s),
      } : p))
      toast.success('WhatsApp ouvert !')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSending(null)
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-bebas text-4xl text-white tracking-widest">PROGRAMMES D'ENTRAÎNEMENT</h1>
          <p className="text-gray-400 font-inter text-sm mt-1">Gérez et envoyez les rappels WhatsApp</p>
        </div>
        <button onClick={() => setShowNew(!showNew)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Nouveau programme
        </button>
      </div>

      {/* Formulaire nouveau programme */}
      {showNew && (
        <div className="card-dark mb-8 border-major-primary/30">
          <h2 className="font-oswald text-white text-lg uppercase tracking-wide mb-5">Nouveau programme</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="form-label">Mois</label>
              <select className="input-dark" value={form.month} onChange={e => setForm(f => ({ ...f, month: e.target.value }))}>
                {MONTHS_FR.slice(1).map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Année</label>
              <input className="input-dark" type="number" value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))} />
            </div>
            <div className="lg:col-span-2">
              <label className="form-label">Titre</label>
              <input className="input-dark" placeholder="Programme Avril 2026" value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="form-label">Description (optionnel)</label>
              <textarea className="input-dark resize-none h-20" value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div>
              <label className="form-label">Numéro/Lien groupe WhatsApp</label>
              <input className="input-dark" placeholder="+212600000000 ou lien wa.me/..." value={form.whatsappGroup}
                onChange={e => setForm(f => ({ ...f, whatsappGroup: e.target.value }))} />
            </div>
          </div>
          <div className="border-t border-gray-800 pt-4 mt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-oswald text-white uppercase tracking-wide text-sm">Séances ({sessions.length})</h3>
              <button onClick={addSession} className="text-major-accent text-xs font-inter hover:text-white transition-colors flex items-center gap-1">
                <Plus size={13} /> Ajouter une séance
              </button>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {sessions.map((s, i) => (
                <div key={i} className="bg-major-black/40 rounded-xl p-4 border border-gray-800">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                    <div>
                      <label className="form-label text-[10px]">Date début</label>
                      <input type="date" className="input-dark text-sm" value={s.dateFrom}
                        onChange={e => updateSession(i, 'dateFrom', e.target.value)} />
                    </div>
                    <div>
                      <label className="form-label text-[10px]">Date fin (optionnel)</label>
                      <input type="date" className="input-dark text-sm" value={s.dateTo}
                        onChange={e => updateSession(i, 'dateTo', e.target.value)} />
                    </div>
                    <div>
                      <label className="form-label text-[10px]">Type</label>
                      <select className="input-dark text-sm" value={s.type}
                        onChange={e => updateSession(i, 'type', e.target.value)}>
                        {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="form-label text-[10px]">Titre</label>
                      <input className="input-dark text-sm" placeholder="Fractionné 5x4'" value={s.title}
                        onChange={e => updateSession(i, 'title', e.target.value)} />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="form-label text-[10px]">Description</label>
                      <textarea className="input-dark text-sm resize-none h-16" value={s.description}
                        onChange={e => updateSession(i, 'description', e.target.value)}
                        placeholder="Détail de la séance..." />
                    </div>
                    {sessions.length > 1 && (
                      <button onClick={() => removeSession(i)}
                        className="self-end p-2 text-red-500 hover:text-red-400 transition-colors">
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-3 mt-5">
            <button onClick={saveProgram} disabled={saving} className="btn-primary">
              {saving ? 'Enregistrement...' : 'Enregistrer le programme'}
            </button>
            <button onClick={() => setShowNew(false)} className="btn-secondary">Annuler</button>
          </div>
        </div>
      )}

      {/* Liste des programmes */}
      {programs.length === 0 ? (
        <div className="text-center py-20">
          <Calendar size={48} className="text-gray-700 mx-auto mb-4" />
          <p className="text-gray-500 font-inter">Aucun programme créé.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {programs.map(p => (
            <div key={p.id} className="card-dark overflow-hidden p-0">
              {/* En-tête programme */}
              <button
                onClick={() => setExpanded(expanded === p.id ? null : p.id)}
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-white/3 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="text-center bg-major-primary/10 rounded-xl px-3 py-2 border border-major-primary/20">
                    <p className="font-bebas text-2xl text-white leading-tight">{MONTHS_FR[p.month]}</p>
                    <p className="text-major-accent text-xs font-inter">{p.year}</p>
                  </div>
                  <div>
                    <p className="text-white font-oswald text-lg">{p.title}</p>
                    <p className="text-gray-500 text-xs font-inter">{p.sessions.length} séances · {p.sessions.filter(s => s.reminderSent).length} rappels envoyés</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={e => { e.stopPropagation(); deleteProgram(p.id) }}
                    className="p-2 text-red-600 hover:text-red-400 transition-colors">
                    <Trash2 size={15} />
                  </button>
                  {expanded === p.id ? <ChevronUp size={18} className="text-gray-500" /> : <ChevronDown size={18} className="text-gray-500" />}
                </div>
              </button>

              {/* Séances */}
              {expanded === p.id && (
                <div className="border-t border-gray-800">
                  <div className="divide-y divide-gray-800/60">
                    {p.sessions.map(s => {
                      const colorClass = TYPE_COLORS[s.type] ?? 'text-gray-400'
                      const isEditing  = editingSession === s.id

                      return (
                        <div key={s.id} className="px-6 py-3">
                          {isEditing ? (
                            // ── Mode édition
                            <div className="space-y-3">
                              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                <div>
                                  <label className="form-label text-[10px]">Date début</label>
                                  <input type="date" className="input-dark text-sm"
                                    value={editForm.dateFrom as string}
                                    onChange={e => setEditForm(f => ({ ...f, dateFrom: e.target.value }))} />
                                </div>
                                <div>
                                  <label className="form-label text-[10px]">Date fin</label>
                                  <input type="date" className="input-dark text-sm"
                                    value={editForm.dateTo as string ?? ''}
                                    onChange={e => setEditForm(f => ({ ...f, dateTo: e.target.value }))} />
                                </div>
                                <div>
                                  <label className="form-label text-[10px]">Type</label>
                                  <select className="input-dark text-sm"
                                    value={editForm.type as string}
                                    onChange={e => setEditForm(f => ({ ...f, type: e.target.value }))}>
                                    {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                  </select>
                                </div>
                                <div>
                                  <label className="form-label text-[10px]">Titre</label>
                                  <input className="input-dark text-sm"
                                    value={editForm.title as string}
                                    onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))} />
                                </div>
                              </div>
                              <div>
                                <label className="form-label text-[10px]">Description</label>
                                <textarea className="input-dark text-sm resize-none h-16 w-full"
                                  value={editForm.description as string}
                                  onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} />
                              </div>
                              <div className="flex gap-2">
                                <button onClick={() => saveEdit(p.id, s.id)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-inter font-semibold bg-major-primary/20 text-major-accent border border-major-primary/30 hover:bg-major-primary/30 transition-all">
                                  <Check size={12} /> Enregistrer
                                </button>
                                <button onClick={() => setEditingSession(null)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-inter font-semibold bg-gray-800 text-gray-400 border border-gray-700 hover:text-white transition-all">
                                  <X size={12} /> Annuler
                                </button>
                              </div>
                            </div>
                          ) : (
                            // ── Mode affichage
                            <div className="flex items-center gap-4">
                              <div className="min-w-[80px]">
                                <p className="text-white text-sm font-inter font-medium">
                                  {formatDate(new Date(s.dateFrom), 'dd MMM')}
                                  {s.dateTo && ` → ${formatDate(new Date(s.dateTo), 'dd')}`}
                                </p>
                                <p className={`text-xs font-inter ${colorClass}`}>
                                  {TYPES.find(t => t.value === s.type)?.label}
                                </p>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-white text-sm font-inter truncate">{s.title}</p>
                                <p className="text-gray-500 text-xs font-inter truncate">{s.description?.split('\n')[0]}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                {/* Bouton Modifier */}
                                <button onClick={() => startEdit(s)}
                                  className="p-1.5 text-gray-500 hover:text-major-cyan transition-colors"
                                  title="Modifier">
                                  <Pencil size={13} />
                                </button>
                                {/* Bouton Supprimer */}
                                <button
                                  onClick={() => deleteSession(p.id, s.id)}
                                  disabled={deletingSession === s.id}
                                  className="p-1.5 text-red-700 hover:text-red-400 transition-colors disabled:opacity-40"
                                  title="Supprimer">
                                  <Trash2 size={13} />
                                </button>
                                {/* Bouton WhatsApp */}
                                <button
                                  onClick={() => sendReminder(p.id, s.id)}
                                  disabled={sending === s.id}
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-inter font-semibold transition-all ${
                                    s.reminderSent
                                      ? 'bg-green-900/20 text-green-400 border border-green-700/40'
                                      : 'bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/30 hover:bg-[#25D366]/20'
                                  }`}>
                                  {s.reminderSent
                                    ? <><CheckCircle size={12} /> Envoyé</>
                                    : sending === s.id
                                      ? 'Ouverture...'
                                      : <><MessageCircle size={12} /> WhatsApp</>
                                  }
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
