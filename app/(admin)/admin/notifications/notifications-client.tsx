'use client'

import { useState } from 'react'
import { Activity, Trophy, BookOpen, Send, Check, MessageSquare, Copy, History, Calendar, Pencil, RotateCcw, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatDate, timeAgo, TRAINING_TYPE_LABELS, EVENT_TYPE_LABELS } from '@/lib/utils'
import {
  buildTrainingMessage, buildEventMessage, buildBlogMessage,
} from '@/lib/whatsapp'

type Training = {
  id: string; title: string; dateFrom: string; dateTo: string | null
  description: string; type: string
  programTitle: string
  reminderSent: boolean
}
type Event = {
  id: string; slug: string; title: string; date: string; location: string
  city: string | null; type: string; price: number | null; distance: string | null
  description: string
}
type Post = {
  id: string; slug: string; title: string; excerpt: string
  readTime: number | null; category: { name: string } | null
}
type HistoryEntry = { id: string; type: string; title: string; sentAt: string }

type Props = {
  trainings:  Training[]
  events:     Event[]
  posts:      Post[]
  history:    HistoryEntry[]
  sentRefIds: string[]
}

export function NotificationsClient({ trainings, events, posts, history: initHistory, sentRefIds: initSent }: Props) {
  const [history,    setHistory]    = useState(initHistory)
  const [sentRefIds, setSentRefIds] = useState(new Set(initSent))
  const [customMsg,  setCustomMsg]  = useState('')

  async function logSend(type: 'TRAINING' | 'EVENT' | 'BLOG' | 'CUSTOM', refId: string | null, title: string, message: string) {
    try {
      const res = await fetch('/api/whatsapp-notifications', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ type, refId, title, message }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setHistory(h => [{
        id:     data.notification.id,
        type,
        title,
        sentAt: data.notification.sentAt,
      }, ...h])
      if (refId) setSentRefIds(s => new Set(s).add(`${type}:${refId}`))
    } catch {
      toast.error('Erreur lors de l\'enregistrement.')
    }
  }

  async function sendOnWhatsapp(message: string, type: 'TRAINING' | 'EVENT' | 'BLOG' | 'CUSTOM', refId: string | null, title: string) {
    if (!message.trim()) return toast.error('Message vide.')
    // On copie le message dans le presse-papier puis on ouvre WhatsApp Web.
    // L'URL ?text= d'api.whatsapp.com casse les emojis 4-bytes (🏃📅🏋️ → �)
    // donc on bascule sur "copier puis coller" — fiable à 100%.
    try {
      await navigator.clipboard.writeText(message)
    } catch {
      toast.error('Impossible de copier le message dans le presse-papier.')
      return
    }
    window.open('https://web.whatsapp.com/', '_blank', 'noopener,noreferrer')
    logSend(type, refId, title, message)
    toast.success('Message copié ! Sélectionne le groupe MAJOR puis colle (Ctrl+V).', { duration: 6000 })
  }

  async function copyMessage(message: string) {
    try {
      await navigator.clipboard.writeText(message)
      toast.success('Message copié !')
    } catch {
      toast.error('Impossible de copier.')
    }
  }

  function sendCustom() {
    if (!customMsg.trim()) return toast.error('Message vide.')
    sendOnWhatsapp(customMsg, 'CUSTOM', null, customMsg.slice(0, 60))
    setCustomMsg('')
  }

  return (
    <div className="p-8 space-y-10">
      <div>
        <h1 className="font-bebas text-4xl text-white tracking-widest">NOTIFICATIONS WHATSAPP</h1>
        <p className="text-gray-400 font-inter text-sm mt-1">
          Envoie au groupe WhatsApp MAJOR : entraînement du jour, événements, articles.
        </p>
        <p className="text-gray-500 font-inter text-xs mt-2 italic">
          💡 Le bouton copie le message et ouvre WhatsApp Web. Sélectionne le groupe MAJOR puis colle (Ctrl+V) et envoie.
        </p>
      </div>

      {/* ── Prochaines séances ─────────────────────────────────────────────── */}
      <Section icon={Activity} title="Prochaines séances" count={trainings.length}>
        {trainings.length === 0 ? (
          <Empty text="Aucune séance à venir." />
        ) : (
          trainings.map(t => {
            const message = buildTrainingMessage(t)
            const sent = sentRefIds.has(`TRAINING:${t.id}`) || t.reminderSent
            const dateLabel = t.dateTo
              ? `${formatDate(t.dateFrom, "EEEE dd MMM")} → ${formatDate(t.dateTo, "dd MMM")}`
              : formatDate(t.dateFrom, "EEEE dd MMMM yyyy")
            return (
              <NotifCard
                key={t.id}
                badge={TRAINING_TYPE_LABELS[t.type] ?? t.type}
                title={t.title}
                meta={`${dateLabel} · ${t.programTitle}`}
                message={message}
                sent={sent}
                onSend={msg => sendOnWhatsapp(msg, 'TRAINING', t.id, t.title)}
                onCopy={copyMessage}
              />
            )
          })
        )}
      </Section>

      {/* ── Événements ─────────────────────────────────────────────────────── */}
      <Section icon={Trophy} title="Événements ouverts aux inscriptions" count={events.length}>
        {events.length === 0 ? (
          <Empty text="Aucun événement à venir." />
        ) : (
          events.map(e => {
            const message = buildEventMessage(e)
            const sent = sentRefIds.has(`EVENT:${e.id}`)
            return (
              <NotifCard
                key={e.id}
                badge={EVENT_TYPE_LABELS[e.type] ?? e.type}
                title={e.title}
                meta={`${formatDate(e.date, "dd MMMM yyyy")} · ${e.location}${e.city ? `, ${e.city}` : ''}`}
                message={message}
                sent={sent}
                onSend={msg => sendOnWhatsapp(msg, 'EVENT', e.id, e.title)}
                onCopy={copyMessage}
              />
            )
          })
        )}
      </Section>

      {/* ── Blog ───────────────────────────────────────────────────────────── */}
      <Section icon={BookOpen} title="Derniers articles publiés" count={posts.length}>
        {posts.length === 0 ? (
          <Empty text="Aucun article publié." />
        ) : (
          posts.map(p => {
            const message = buildBlogMessage(p)
            const sent = sentRefIds.has(`BLOG:${p.id}`)
            return (
              <NotifCard
                key={p.id}
                badge={p.category?.name ?? 'Article'}
                title={p.title}
                meta={p.excerpt.slice(0, 100) + (p.excerpt.length > 100 ? '…' : '')}
                message={message}
                sent={sent}
                onSend={msg => sendOnWhatsapp(msg, 'BLOG', p.id, p.title)}
                onCopy={copyMessage}
              />
            )
          })
        )}
      </Section>

      {/* ── Message libre ──────────────────────────────────────────────────── */}
      <Section icon={MessageSquare} title="Message personnalisé">
        <div className="card-dark space-y-3">
          <p className="text-gray-400 text-xs font-inter">
            Annonce ad hoc, rappel, info diverse… Le message sera envoyé tel quel.
          </p>
          <textarea
            value={customMsg}
            onChange={e => setCustomMsg(e.target.value)}
            rows={5}
            placeholder="Ex : 🏃 Rappel — sortie longue dimanche 7h corniche !"
            className="input-dark font-inter text-sm w-full resize-y"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => copyMessage(customMsg)}
              disabled={!customMsg.trim()}
              className="btn-secondary flex items-center gap-2 px-4 py-2 text-sm disabled:opacity-50">
              <Copy size={14} /> Copier
            </button>
            <button
              onClick={sendCustom}
              disabled={!customMsg.trim()}
              className="btn-primary flex items-center gap-2 px-4 py-2 text-sm disabled:opacity-50">
              <Send size={14} /> Envoyer sur WhatsApp
            </button>
          </div>
        </div>
      </Section>

      {/* ── Historique ─────────────────────────────────────────────────────── */}
      <Section icon={History} title="Historique des envois" count={history.length}>
        {history.length === 0 ? (
          <Empty text="Aucun envoi pour le moment." />
        ) : (
          <div className="card-dark p-0 overflow-hidden">
            <table className="table-dark">
              <thead>
                <tr><th>Type</th><th>Titre</th><th>Envoyé</th></tr>
              </thead>
              <tbody>
                {history.map(h => (
                  <tr key={h.id}>
                    <td><span className="badge text-xs">{TYPE_LABELS[h.type] ?? h.type}</span></td>
                    <td className="text-white text-sm">{h.title}</td>
                    <td className="text-gray-500 text-xs">{timeAgo(h.sentAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>
    </div>
  )
}

const TYPE_LABELS: Record<string, string> = {
  TRAINING: 'Entraînement',
  EVENT:    'Événement',
  BLOG:     'Article',
  CUSTOM:   'Personnalisé',
}

function Section({ icon: Icon, title, count, children }: {
  icon: any; title: string; count?: number; children: React.ReactNode
}) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <Icon size={18} className="text-major-primary" />
        <h2 className="font-oswald text-white text-xl uppercase tracking-wide">{title}</h2>
        {count !== undefined && count > 0 && (
          <span className="badge text-xs">{count}</span>
        )}
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  )
}

function NotifCard({ badge, title, meta, message, sent, onSend, onCopy }: {
  badge: string; title: string; meta: string; message: string
  sent: boolean
  onSend: (msg: string) => void
  onCopy: (msg: string) => void
}) {
  const [showPreview, setShowPreview] = useState(false)
  const [editing,     setEditing]     = useState(false)
  const [value,       setValue]       = useState(message)
  const isModified = value !== message

  function startEdit() {
    setShowPreview(true)
    setEditing(true)
  }

  function reset() {
    setValue(message)
    setEditing(false)
  }

  return (
    <div className="card-dark">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="badge text-xs">{badge}</span>
            {sent && (
              <span className="flex items-center gap-1 text-xs text-major-accent font-inter">
                <Check size={12} /> Déjà envoyé
              </span>
            )}
            {isModified && (
              <span className="flex items-center gap-1 text-xs text-major-cyan font-inter">
                <Pencil size={11} /> Message modifié
              </span>
            )}
          </div>
          <h3 className="font-oswald text-white text-lg font-semibold">{title}</h3>
          <p className="text-gray-400 text-xs font-inter mt-0.5">{meta}</p>
        </div>
        <div className="flex flex-col gap-2 flex-shrink-0">
          <button onClick={() => onSend(value)}
            className="btn-primary flex items-center gap-2 px-4 py-2 text-sm whitespace-nowrap">
            <Send size={14} /> Envoyer
          </button>
          <button onClick={() => onCopy(value)}
            className="btn-secondary flex items-center gap-2 px-4 py-2 text-xs whitespace-nowrap">
            <Copy size={12} /> Copier
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={() => setShowPreview(s => !s)}
          className="text-major-accent hover:text-major-primary text-xs font-inter underline">
          {showPreview ? 'Masquer le message' : 'Aperçu du message'}
        </button>
        {!editing ? (
          <button
            onClick={startEdit}
            className="flex items-center gap-1 text-major-cyan hover:text-major-accent text-xs font-inter">
            <Pencil size={11} /> Modifier
          </button>
        ) : (
          <button
            onClick={() => setEditing(false)}
            className="flex items-center gap-1 text-gray-400 hover:text-white text-xs font-inter">
            <X size={11} /> Terminer l'édition
          </button>
        )}
        {isModified && (
          <button
            onClick={reset}
            className="flex items-center gap-1 text-gray-500 hover:text-major-accent text-xs font-inter">
            <RotateCcw size={11} /> Réinitialiser
          </button>
        )}
      </div>

      {showPreview && (
        <div className="mt-3 relative">
          <div className="absolute top-2 right-2 text-[10px] text-gray-500 font-inter uppercase tracking-widest pointer-events-none z-10">
            {editing ? 'Édition' : 'Aperçu WhatsApp'}
          </div>
          {editing ? (
            <textarea
              value={value}
              onChange={e => setValue(e.target.value)}
              rows={Math.min(20, Math.max(6, value.split('\n').length + 1))}
              className="w-full p-4 pt-8 bg-[#0b1410] border border-major-cyan/40 rounded-lg text-gray-100 text-sm font-inter leading-relaxed whitespace-pre-wrap focus:outline-none focus:border-major-cyan resize-y"
            />
          ) : (
            <pre className="p-4 pt-8 bg-[#0b1410] border border-major-primary/30 rounded-lg text-gray-100 text-sm font-inter leading-relaxed whitespace-pre-wrap break-words shadow-inner">
              {value}
            </pre>
          )}
        </div>
      )}
    </div>
  )
}

function Empty({ text }: { text: string }) {
  return (
    <div className="card-dark text-center py-8 text-gray-500 font-inter text-sm flex items-center justify-center gap-2">
      <Calendar size={16} className="text-gray-600" /> {text}
    </div>
  )
}
