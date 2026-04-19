'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Calendar, MapPin, Users, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatDate, formatCurrency, EVENT_TYPE_LABELS, getEventTypeColor } from '@/lib/utils'

const STATUS_LABEL: Record<string, string> = {
  UPCOMING: 'À venir', ONGOING: 'En cours', COMPLETED: 'Terminé', CANCELLED: 'Annulé',
}
const STATUS_COLOR: Record<string, string> = {
  UPCOMING: 'text-major-accent', ONGOING: 'text-major-cyan',
  COMPLETED: 'text-gray-500',    CANCELLED: 'text-red-400',
}

interface Event {
  id: string; title: string; type: string; status: string
  date: string; location: string; price: number | null
  maxParticipants: number | null; _count: { registrations: number }
}

export function EventsListClient({ events: initial }: { events: Event[] }) {
  const router = useRouter()
  const [events, setEvents] = useState<Event[]>(initial)
  const [deleting, setDeleting] = useState<string | null>(null)

  async function deleteEvent(id: string, title: string) {
    if (!confirm(`Supprimer "${title}" ?`)) return
    setDeleting(id)
    try {
      const res = await fetch(`/api/events/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Erreur lors de la suppression')
      setEvents(ev => ev.filter(e => e.id !== id))
      toast.success('Événement supprimé')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {events.map(event => {
        const fillPct = event.maxParticipants
          ? Math.round((event._count.registrations / event.maxParticipants) * 100)
          : null

        return (
          <div key={event.id} className="card-dark flex flex-col">
            <div className="h-1 -mx-5 -mt-5 mb-4 rounded-t-xl bg-gradient-to-r from-major-primary to-major-cyan" />
            <div className="flex items-start justify-between mb-3">
              <div>
                <span className={`badge text-xs ${getEventTypeColor(event.type)}`}>
                  {EVENT_TYPE_LABELS[event.type as keyof typeof EVENT_TYPE_LABELS]}
                </span>
                <h3 className="font-oswald text-white text-lg font-semibold mt-1.5 leading-tight">
                  {event.title}
                </h3>
              </div>
              <span className={`text-xs font-inter font-medium ml-2 ${STATUS_COLOR[event.status]}`}>
                {STATUS_LABEL[event.status]}
              </span>
            </div>

            <div className="space-y-1.5 text-sm font-inter text-gray-400 mb-4">
              <div className="flex items-center gap-2">
                <Calendar size={13} className="text-major-primary" />
                {formatDate(new Date(event.date), 'dd MMM yyyy')}
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={13} className="text-major-primary" />
                {event.location}
              </div>
              <div className="flex items-center gap-2">
                <Users size={13} className="text-major-primary" />
                {event._count.registrations} inscrits
                {event.maxParticipants ? ` / ${event.maxParticipants}` : ''}
              </div>
            </div>

            {fillPct !== null && (
              <div className="mb-3">
                <div className="flex justify-between text-xs text-gray-600 mb-1 font-inter">
                  <span>Remplissage</span>
                  <span className={fillPct >= 90 ? 'text-red-400' : fillPct >= 70 ? 'text-yellow-400' : 'text-major-accent'}>
                    {fillPct}%
                  </span>
                </div>
                <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${fillPct >= 90 ? 'bg-red-500' : fillPct >= 70 ? 'bg-yellow-500' : 'bg-major-primary'}`}
                    style={{ width: `${fillPct}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-800">
              <span className="font-oswald text-major-accent font-bold">
                {event.price === 0 ? 'Gratuit' : event.price ? formatCurrency(event.price, 'MAD') : '—'}
              </span>
              <div className="flex items-center gap-3">
                {/* ── Bouton Supprimer ── */}
                <button
                  onClick={() => deleteEvent(event.id, event.title)}
                  disabled={deleting === event.id}
                  className="p-1.5 text-red-600 hover:text-red-400 transition-colors disabled:opacity-40"
                  title="Supprimer">
                  <Trash2 size={15} />
                </button>
                {/* ── Bouton Modifier ── */}
                <Link
                  href={`/admin/events/${event.id}`}
                  className="text-xs text-major-cyan hover:text-white font-inter transition-colors">
                  Modifier →
                </Link>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
