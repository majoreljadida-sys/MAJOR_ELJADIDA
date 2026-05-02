'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { formatDate, EVENT_TYPE_LABELS, getEventTypeColor, formatCurrency } from '@/lib/utils'
import { MapPin, Clock, Users, ArrowRight, Youtube, Check, X, Loader2, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { useLanguage } from '@/lib/i18n/context'
import { YoutubeGallery } from '@/components/youtube/youtube-gallery'
import type { YoutubeVideo } from '@/lib/youtube'
import type { Event } from '@prisma/client'

type EventWithCount = Event & { _count: { registrations: number } }
type MyRegistration = { eventId: string; status: string }

interface Props {
  upcoming:  EventWithCount[]
  completed: EventWithCount[]
  videos:    YoutubeVideo[]
  channelId: string
  isLoggedIn: boolean
  isMember:   boolean
  myRegistrations: MyRegistration[]
}

export function EventsContent({ upcoming, completed, videos, channelId, isLoggedIn, isMember, myRegistrations }: Props) {
  const { t }  = useLanguage()
  const router = useRouter()
  // Map des inscriptions actuelles : eventId → status
  const [regs, setRegs] = useState<Map<string, string>>(
    () => new Map(myRegistrations.map(r => [r.eventId, r.status]))
  )
  const [confirmEvent, setConfirmEvent] = useState<EventWithCount | null>(null)
  const [busyId,       setBusyId]       = useState<string | null>(null)

  async function register(event: EventWithCount) {
    setBusyId(event.id)
    try {
      const res  = await fetch(`/api/events/${event.id}/register`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setRegs(m => new Map(m).set(event.id, data.status))
      setConfirmEvent(null)
      toast.success(
        data.status === 'WAITING'
          ? '⏳ Inscrit en liste d\'attente.'
          : '✅ Inscription confirmée !',
        { duration: 5000 }
      )
      router.refresh()
    } catch (err: any) {
      toast.error(err.message ?? 'Erreur.')
    } finally {
      setBusyId(null)
    }
  }

  async function cancel(eventId: string) {
    if (!confirm('Confirmer l\'annulation de ton inscription ?')) return
    setBusyId(eventId)
    try {
      const res  = await fetch(`/api/events/${eventId}/register`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setRegs(m => { const next = new Map(m); next.delete(eventId); return next })
      toast.success('Inscription annulée.')
      router.refresh()
    } catch (err: any) {
      toast.error(err.message ?? 'Erreur.')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="min-h-screen bg-major-black pb-24">

      {/* ── Hero ── */}
      <div className="bg-gradient-to-b from-[#0A1A12] to-major-black pt-16 pb-12 px-4 text-center">
        <span className="section-tag">{t.events.tag}</span>
        <h1 className="font-bebas text-6xl text-white tracking-widest mt-2 mb-4">{t.events.title}</h1>
        <p className="text-gray-400 font-inter text-base max-w-xl mx-auto">{t.events.desc}</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Événements à venir ── */}
        <section className="mb-16">
          <div className="flex items-center gap-4 mb-8">
            <h2 className="font-bebas text-3xl text-white tracking-widest">{t.events.upcoming}</h2>
            <span className="badge border-major-accent/30 text-major-accent bg-major-accent/10">{upcoming.length}</span>
          </div>

          {upcoming.length === 0 ? (
            <p className="text-gray-500 font-inter text-center py-10">{t.events.noEvents}</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {upcoming.map(event => {
                const fillPct   = event.maxParticipants ? Math.round((event._count.registrations / event.maxParticipants) * 100) : null
                const typeColor = getEventTypeColor(event.type)
                return (
                  <article key={event.id} id={event.slug}
                    className="group card-dark flex flex-col hover:border-major-primary/60 hover:shadow-xl hover:shadow-major-primary/10 transition-all duration-300">
                    <div className="h-1.5 -mx-5 -mt-5 mb-5 rounded-t-xl bg-gradient-to-r from-major-primary to-major-cyan" />
                    <div className="flex items-start gap-3 mb-4">
                      <div className="text-center bg-major-primary/10 border border-major-primary/30 rounded-xl px-3 py-2.5 min-w-[56px] flex-shrink-0">
                        <p className="text-gray-500 text-[10px] font-inter uppercase">{formatDate(event.date, 'MMM yyyy')}</p>
                        <p className="font-bebas text-4xl text-white leading-tight">{formatDate(event.date, 'dd')}</p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className={`badge text-[10px] mb-1.5 ${typeColor}`}>{EVENT_TYPE_LABELS[event.type]}</span>
                        <h3 className="font-oswald text-white text-xl font-semibold leading-tight group-hover:text-major-accent transition-colors">
                          {event.title}
                        </h3>
                      </div>
                    </div>
                    <div className="space-y-1.5 mb-4 text-sm font-inter text-gray-400">
                      <div className="flex items-center gap-2"><MapPin size={13} className="text-major-primary flex-shrink-0" /><span className="truncate">{event.location}</span></div>
                      {event.distance && <div className="flex items-center gap-2"><Clock size={13} className="text-major-primary flex-shrink-0" />{event.distance}</div>}
                      {event.maxParticipants && (
                        <div className="flex items-center gap-2">
                          <Users size={13} className="text-major-primary flex-shrink-0" />
                          {event._count.registrations} / {event.maxParticipants} {t.events.registered}
                        </div>
                      )}
                    </div>
                    <p className="text-gray-500 text-sm font-inter leading-relaxed flex-1 mb-4 line-clamp-3">{event.description}</p>
                    {fillPct !== null && (
                      <div className="mb-4">
                        <div className="flex justify-between text-xs text-gray-600 mb-1 font-inter">
                          <span>{t.events.fill}</span>
                          <span className={fillPct >= 90 ? 'text-red-400' : fillPct >= 70 ? 'text-yellow-400' : 'text-major-accent'}>{fillPct}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all ${fillPct >= 90 ? 'bg-red-500' : fillPct >= 70 ? 'bg-yellow-500' : 'bg-major-primary'}`}
                            style={{ width: `${fillPct}%` }} />
                        </div>
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-800 gap-2">
                      <span className="font-oswald font-bold text-major-accent text-xl">
                        {event.price === 0 ? t.events.free : event.price ? formatCurrency(event.price, 'MAD') : t.events.onRequest}
                      </span>
                      <RegistrationButton
                        event={event}
                        isLoggedIn={isLoggedIn}
                        isMember={isMember}
                        registrationStatus={regs.get(event.id) ?? null}
                        busy={busyId === event.id}
                        onRegister={() => setConfirmEvent(event)}
                        onCancel={() => cancel(event.id)}
                      />
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </section>

        {/* ── Événements passés ── */}
        {completed.length > 0 && (
          <section className="mb-16">
            <h2 className="font-bebas text-3xl text-white tracking-widest mb-6 opacity-60">{t.events.past}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {completed.map(event => (
                <article key={event.id} className="card-dark opacity-60 flex items-start gap-4">
                  <div className="text-center min-w-[48px]">
                    <p className="text-gray-600 text-[10px] font-inter uppercase">{formatDate(event.date, 'MMM')}</p>
                    <p className="font-bebas text-3xl text-gray-500">{formatDate(event.date, 'dd')}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-oswald text-gray-400 font-semibold truncate">{event.title}</h3>
                    <p className="text-gray-600 text-xs font-inter">{event.location}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* ── Galerie vidéos YouTube ── */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <Youtube size={26} className="text-red-500" />
            <h2 className="font-bebas text-4xl text-white tracking-widest">NOS VIDÉOS</h2>
          </div>
          <YoutubeGallery videos={videos} channelId={channelId} />
        </section>

      </div>

      {/* ── Modale de confirmation d'inscription ── */}
      {confirmEvent && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-major-dark border border-major-primary/40 rounded-2xl w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-oswald text-white text-xl uppercase tracking-wide">Confirmer mon inscription</h3>
              <button onClick={() => setConfirmEvent(null)} className="text-gray-500 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-gray-300 font-inter text-sm">
                Tu vas t'inscrire à&nbsp;:
              </p>
              <div className="card-dark border-major-primary/30">
                <p className="font-oswald text-white text-lg font-semibold">{confirmEvent.title}</p>
                <p className="text-gray-400 text-xs font-inter mt-1">
                  {formatDate(confirmEvent.date, "EEEE dd MMMM yyyy")} · {confirmEvent.location}
                </p>
              </div>

              {confirmEvent.price && confirmEvent.price > 0 && (
                <div className="bg-major-primary/10 border border-major-primary/30 rounded-xl p-4 space-y-2">
                  <p className="text-gray-400 text-xs font-inter uppercase tracking-widest">Frais indicatifs</p>
                  <p className="font-bebas text-3xl text-major-accent">{formatCurrency(confirmEvent.price, 'MAD')}</p>
                  <p className="text-gray-400 text-xs font-inter italic">
                    Modalités de règlement communiquées ultérieurement par le bureau du club.
                  </p>
                </div>
              )}

              <div className="flex items-start gap-2 text-yellow-300 bg-yellow-900/10 border border-yellow-500/20 rounded-xl p-3">
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                <p className="text-xs font-inter leading-relaxed">
                  En confirmant, je m'engage formellement à participer à cet événement avec le Club MAJOR.
                  Les modalités pratiques (logistique, frais éventuels) seront communiquées par le bureau.
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setConfirmEvent(null)}
                className="btn-secondary flex-1 py-2.5 text-sm">
                Annuler
              </button>
              <button
                onClick={() => register(confirmEvent)}
                disabled={busyId === confirmEvent.id}
                className="btn-primary flex-1 flex items-center justify-center gap-2 py-2.5 text-sm disabled:opacity-50">
                {busyId === confirmEvent.id
                  ? <><Loader2 size={15} className="animate-spin" /> Inscription…</>
                  : <><Check size={15} /> Je m'engage</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function RegistrationButton({ event, isLoggedIn, isMember, registrationStatus, busy, onRegister, onCancel }: {
  event: EventWithCount
  isLoggedIn: boolean
  isMember:   boolean
  registrationStatus: string | null
  busy: boolean
  onRegister: () => void
  onCancel:   () => void
}) {
  // Pas connecté → bouton "S'inscrire" qui mène à /login
  if (!isLoggedIn) {
    return (
      <Link href="/login" className="flex items-center gap-1.5 text-sm text-major-cyan font-inter font-medium hover:text-white transition-colors whitespace-nowrap">
        S'inscrire <ArrowRight size={14} />
      </Link>
    )
  }

  // Connecté mais pas membre (admin/coach)
  if (!isMember) {
    return (
      <span className="text-xs text-gray-500 font-inter italic whitespace-nowrap">Réservé aux adhérents</span>
    )
  }

  // Membre déjà inscrit
  if (registrationStatus) {
    const isWaiting = registrationStatus === 'WAITING'
    return (
      <div className="flex flex-col items-end gap-1">
        <span className={`flex items-center gap-1 text-xs font-inter font-medium whitespace-nowrap ${isWaiting ? 'text-yellow-400' : 'text-major-accent'}`}>
          <Check size={12} /> {isWaiting ? 'Liste d\'attente' : 'Inscrit'}
        </span>
        <button
          onClick={onCancel}
          disabled={busy}
          className="text-xs text-gray-500 hover:text-red-400 font-inter underline disabled:opacity-50">
          {busy ? 'Annulation…' : 'Annuler'}
        </button>
      </div>
    )
  }

  // Membre, pas inscrit → ouvre la modale
  const isFull = event.maxParticipants !== null && event._count.registrations >= event.maxParticipants
  return (
    <button
      onClick={onRegister}
      disabled={busy}
      className="btn-primary flex items-center gap-1.5 text-sm py-2 px-4 disabled:opacity-50 whitespace-nowrap">
      {busy ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
      {isFull ? 'Liste d\'attente' : 'S\'inscrire'}
    </button>
  )
}
