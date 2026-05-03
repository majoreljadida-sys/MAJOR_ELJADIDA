'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Plus, Pencil, Trash2, X, Loader2, Save, MapPin, Clock, Users, Check } from 'lucide-react'
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

type Session = {
  id: string; title: string; date: string; location: string; type: string
  status: string; duration: number | null; description: string | null
  groupId: string | null; groupName: string | null; presentCount: number | null
}
type Group = { id: string; name: string }

function fmtIso(d: Date) { return d.toISOString().slice(0, 10) }

function startOfIsoWeek(d: Date): Date {
  const date = new Date(d)
  date.setHours(0, 0, 0, 0)
  const day = date.getDay()
  const diff = day === 0 ? -6 : 1 - day
  date.setDate(date.getDate() + diff)
  return date
}

const DAY_LABELS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']

export function CoachSessionsClient({ weekStart, sessions: initialSessions, groups, coachId }: {
  weekStart: string
  sessions: Session[]
  groups:   Group[]
  coachId:  string
}) {
  const router = useRouter()
  const [sessions, setSessions] = useState(initialSessions)
  const [editing, setEditing]   = useState<Session | null>(null)
  const [creating, setCreating] = useState<string | null>(null) // ISO date du jour cliqué
  const [busy, setBusy]         = useState(false)

  const ws = new Date(weekStart)
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(ws); d.setDate(d.getDate() + i); return d
  })

  function gotoWeek(offset: number) {
    const d = new Date(ws); d.setDate(d.getDate() + offset * 7)
    router.push(`/coach/sessions?week=${fmtIso(d)}`)
  }

  function gotoCurrent() {
    router.push('/coach/sessions')
  }

  function sessionsOf(day: Date) {
    return sessions.filter(s => {
      const sd = new Date(s.date)
      return sd.getFullYear() === day.getFullYear()
          && sd.getMonth()    === day.getMonth()
          && sd.getDate()     === day.getDate()
    })
  }

  async function deleteSession(id: string) {
    if (!confirm('Supprimer cette séance ?')) return
    setBusy(true)
    try {
      const res = await fetch(`/api/trainings/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setSessions(s => s.filter(x => x.id !== id))
      toast.success('Séance supprimée.')
      router.refresh()
    } catch {
      toast.error('Erreur.')
    } finally {
      setBusy(false)
    }
  }

  async function savePresent(id: string, raw: string) {
    const value = raw === '' ? null : parseInt(raw)
    try {
      const res = await fetch(`/api/trainings/${id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ presentCount: raw }),
      })
      if (!res.ok) throw new Error()
      setSessions(s => s.map(x => x.id === id
        ? { ...x, presentCount: value, status: value !== null ? 'COMPLETED' : x.status }
        : x))
      toast.success('Présences enregistrées.')
    } catch {
      toast.error('Erreur.')
    }
  }

  const weekEnd = new Date(ws); weekEnd.setDate(weekEnd.getDate() + 6)
  const isCurrentWeek = startOfIsoWeek(new Date()).getTime() === ws.getTime()

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="font-bebas text-4xl text-white tracking-widest">MES SÉANCES — SEMAINE</h1>
        <p className="text-gray-400 font-inter text-sm mt-1">Modifier mes séances semaine par semaine.</p>
      </div>

      {/* Navigation semaine */}
      <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
        <div className="flex items-center gap-2">
          <button onClick={() => gotoWeek(-1)}
            className="btn-secondary flex items-center gap-1 px-3 py-2 text-xs">
            <ChevronLeft size={14} /> Semaine précédente
          </button>
          {!isCurrentWeek && (
            <button onClick={gotoCurrent}
              className="btn-secondary px-3 py-2 text-xs">
              Aujourd'hui
            </button>
          )}
          <button onClick={() => gotoWeek(1)}
            className="btn-secondary flex items-center gap-1 px-3 py-2 text-xs">
            Semaine suivante <ChevronRight size={14} />
          </button>
        </div>
        <div className="text-gray-300 font-oswald text-lg uppercase tracking-wide">
          {formatDate(ws, 'dd MMM')} → {formatDate(weekEnd, 'dd MMM yyyy')}
          {isCurrentWeek && <span className="ml-2 text-major-accent text-xs font-inter">· Cette semaine</span>}
        </div>
      </div>

      {/* Grille des 7 jours */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3">
        {days.map((day, i) => {
          const daySessions = sessionsOf(day)
          const isToday = new Date().toDateString() === day.toDateString()
          return (
            <div key={i}
              className={`rounded-xl border p-3 min-h-[160px] flex flex-col gap-2 ${
                isToday
                  ? 'bg-major-primary/10 border-major-primary/40'
                  : 'bg-major-surface2 border-gray-800'
              }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-[10px] font-inter uppercase tracking-widest">{DAY_LABELS[i]}</p>
                  <p className={`font-oswald text-xl font-bold ${isToday ? 'text-major-accent' : 'text-white'}`}>
                    {formatDate(day, 'dd MMM')}
                  </p>
                </div>
                <button onClick={() => setCreating(fmtIso(day))}
                  title="Ajouter une séance"
                  className="text-major-primary hover:text-major-accent transition-colors">
                  <Plus size={18} />
                </button>
              </div>

              <div className="flex-1 space-y-2">
                {daySessions.length === 0 ? (
                  <p className="text-gray-600 text-xs font-inter italic">Pas de séance.</p>
                ) : (
                  daySessions.map(s => (
                    <SessionCard key={s.id} session={s}
                      onEdit={() => setEditing(s)}
                      onDelete={() => deleteSession(s.id)}
                      onSavePresent={v => savePresent(s.id, v)}
                      busy={busy} />
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Modale Édition / Création */}
      {(editing || creating) && (
        <SessionModal
          session={editing}
          defaultDate={creating}
          groups={groups}
          coachId={coachId}
          onClose={() => { setEditing(null); setCreating(null) }}
          onSaved={(updated, isNew) => {
            if (isNew) setSessions(s => [...s, updated])
            else       setSessions(s => s.map(x => x.id === updated.id ? updated : x))
            setEditing(null); setCreating(null)
            router.refresh()
          }}
        />
      )}
    </div>
  )
}

function SessionCard({ session, onEdit, onDelete, onSavePresent, busy }: {
  session: Session
  onEdit: () => void
  onDelete: () => void
  onSavePresent: (raw: string) => void
  busy: boolean
}) {
  const [editingPresent, setEditingPresent] = useState(false)
  const [presentValue, setPresentValue]     = useState(session.presentCount?.toString() ?? '')

  return (
    <div className="bg-major-black/40 border border-gray-800 rounded-lg p-2.5 group">
      <div className="flex items-start justify-between gap-1 mb-1">
        <div className="flex-1 min-w-0">
          <p className="text-white text-xs font-inter font-semibold truncate">{session.title}</p>
          <p className="text-gray-500 text-[10px] font-inter">
            {formatDate(session.date, "HH'h'mm")} · {TRAINING_TYPE_LABELS[session.type] ?? session.type}
          </p>
        </div>
        <div className="flex gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
          <button onClick={onEdit} className="text-gray-400 hover:text-major-accent" title="Modifier">
            <Pencil size={11} />
          </button>
          <button onClick={onDelete} disabled={busy} className="text-gray-400 hover:text-red-400 disabled:opacity-50" title="Supprimer">
            <Trash2 size={11} />
          </button>
        </div>
      </div>

      {session.location && (
        <p className="text-gray-500 text-[10px] font-inter flex items-center gap-1 truncate">
          <MapPin size={9} className="flex-shrink-0" /> {session.location}
        </p>
      )}
      {session.groupName && (
        <p className="text-gray-500 text-[10px] font-inter flex items-center gap-1">
          <Users size={9} /> {session.groupName}
        </p>
      )}

      {/* Présences */}
      <div className="mt-2 pt-2 border-t border-gray-800">
        {editingPresent ? (
          <div className="flex items-center gap-1">
            <input type="number" min="0" max="500" autoFocus
              value={presentValue}
              onChange={e => setPresentValue(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') { onSavePresent(presentValue); setEditingPresent(false) }
                if (e.key === 'Escape') setEditingPresent(false)
              }}
              className="w-12 bg-major-black border border-major-primary rounded px-1 py-0.5 text-white text-xs font-oswald text-center focus:outline-none"
            />
            <button onClick={() => { onSavePresent(presentValue); setEditingPresent(false) }} className="text-green-400">
              <Check size={11} />
            </button>
            <button onClick={() => setEditingPresent(false)} className="text-gray-500">
              <X size={11} />
            </button>
          </div>
        ) : (
          <button onClick={() => setEditingPresent(true)} className="text-[10px] font-inter group/p w-full flex items-center justify-between">
            <span className={session.presentCount !== null ? 'text-major-accent font-semibold' : 'text-gray-600'}>
              {session.presentCount !== null ? `${session.presentCount} présents` : '— présents'}
            </span>
            <span className="text-gray-600 group-hover/p:text-major-accent transition-colors">
              {session.presentCount !== null ? 'modifier' : 'saisir'}
            </span>
          </button>
        )}
      </div>
    </div>
  )
}

function SessionModal({ session, defaultDate, groups, coachId, onClose, onSaved }: {
  session: Session | null
  defaultDate: string | null
  groups: Group[]
  coachId: string
  onClose: () => void
  onSaved: (updated: Session, isNew: boolean) => void
}) {
  const isNew = !session

  // Construire le datetime-local string à partir d'ISO ou d'une date
  function toLocalDt(iso: string) {
    const d = new Date(iso)
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
  }

  const initialDate = session
    ? toLocalDt(session.date)
    : defaultDate ? `${defaultDate}T07:00` : ''

  const [form, setForm] = useState({
    title:       session?.title       ?? '',
    date:        initialDate,
    location:    session?.location    ?? '',
    type:        session?.type        ?? 'ENDURANCE_FONDAMENTALE',
    duration:    session?.duration?.toString() ?? '',
    description: session?.description ?? '',
    groupId:     session?.groupId     ?? '',
  })
  const [saving, setSaving] = useState(false)

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })) }

  async function save() {
    if (!form.title.trim() || !form.date)
      return toast.error('Titre et date obligatoires.')

    setSaving(true)
    try {
      const url    = isNew ? '/api/trainings' : `/api/trainings/${session!.id}`
      const method = isNew ? 'POST' : 'PATCH'
      const body   = isNew
        ? { ...form, coachId, status: 'SCHEDULED' }
        : { ...form }

      const res  = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      const groupName = groups.find(g => g.id === form.groupId)?.name ?? null
      const updated: Session = isNew
        ? {
            id:           data.training.id,
            title:        form.title,
            date:         new Date(form.date).toISOString(),
            location:     form.location,
            type:         form.type,
            status:       'SCHEDULED',
            duration:     form.duration ? parseInt(form.duration) : null,
            description:  form.description || null,
            groupId:      form.groupId || null,
            groupName,
            presentCount: null,
          }
        : {
            ...session!,
            title:       form.title,
            date:        new Date(form.date).toISOString(),
            location:    form.location,
            type:        form.type,
            duration:    form.duration ? parseInt(form.duration) : null,
            description: form.description || null,
            groupId:     form.groupId || null,
            groupName,
          }

      onSaved(updated, isNew)
      toast.success(isNew ? 'Séance créée.' : 'Séance modifiée.')
    } catch (err: any) {
      toast.error(err.message ?? 'Erreur.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-major-dark border border-gray-800 rounded-2xl w-full max-w-lg p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-oswald text-white text-xl uppercase tracking-wide">
            {isNew ? 'Nouvelle séance' : 'Modifier la séance'}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="form-label">Titre *</label>
            <input className="input-dark" placeholder="Ex : Sortie longue dimanche"
              value={form.title} onChange={e => set('title', e.target.value)} />
          </div>
          <div>
            <label className="form-label">Date / heure *</label>
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
          <div className="col-span-2">
            <label className="form-label">Groupe</label>
            <select className="input-dark" value={form.groupId} onChange={e => set('groupId', e.target.value)}>
              <option value="">— Aucun —</option>
              {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </div>
          <div className="col-span-2">
            <label className="form-label">Lieu</label>
            <input className="input-dark" placeholder="Corniche El Jadida..."
              value={form.location} onChange={e => set('location', e.target.value)} />
          </div>
          <div className="col-span-2">
            <label className="form-label">Description</label>
            <textarea className="input-dark resize-none" rows={3}
              value={form.description} onChange={e => set('description', e.target.value)}
              placeholder="Détail de la séance, consignes…" />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="btn-secondary flex-1 py-2.5 text-sm">Annuler</button>
          <button onClick={save} disabled={saving}
            className="btn-primary flex-1 flex items-center justify-center gap-2 py-2.5 text-sm disabled:opacity-50">
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            {isNew ? 'Créer' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  )
}
