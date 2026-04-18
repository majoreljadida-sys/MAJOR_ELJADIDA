'use client'

import Link from 'next/link'
import { formatDate, EVENT_TYPE_LABELS, getEventTypeColor, formatCurrency } from '@/lib/utils'
import { MapPin, Clock, Users, ArrowRight, Youtube } from 'lucide-react'
import { useLanguage } from '@/lib/i18n/context'
import { YoutubeGallery } from '@/components/youtube/youtube-gallery'
import type { YoutubeVideo } from '@/lib/youtube'
import type { Event } from '@prisma/client'

type EventWithCount = Event & { _count: { registrations: number } }

interface Props {
  upcoming:  EventWithCount[]
  completed: EventWithCount[]
  videos:    YoutubeVideo[]
  channelId: string
}

export function EventsContent({ upcoming, completed, videos, channelId }: Props) {
  const { t } = useLanguage()

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
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-800">
                      <span className="font-oswald font-bold text-major-accent text-xl">
                        {event.price === 0 ? t.events.free : event.price ? formatCurrency(event.price, 'MAD') : t.events.onRequest}
                      </span>
                      <Link href="/login" className="flex items-center gap-1.5 text-sm text-major-cyan font-inter font-medium hover:text-white transition-colors">
                        {t.events.register} <ArrowRight size={14} />
                      </Link>
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
    </div>
  )
}
