import { prisma } from '@/lib/prisma'
import { formatDate, formatCurrency, EVENT_TYPE_LABELS, getEventTypeColor } from '@/lib/utils'
import { Calendar, MapPin, Users } from 'lucide-react'
import Link from 'next/link'

const STATUS_LABEL: Record<string, string> = {
  UPCOMING: 'À venir', ONGOING: 'En cours', COMPLETED: 'Terminé', CANCELLED: 'Annulé',
}
const STATUS_COLOR: Record<string, string> = {
  UPCOMING: 'text-major-accent', ONGOING: 'text-major-cyan', COMPLETED: 'text-gray-500', CANCELLED: 'text-red-400',
}

export default async function AdminEventsPage() {
  const events = await prisma.event.findMany({
    orderBy: [{ status: 'asc' }, { date: 'asc' }],
    include: { _count: { select: { registrations: true } } },
  })

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-bebas text-4xl text-white tracking-widest">GESTION DES ÉVÉNEMENTS</h1>
          <p className="text-gray-400 font-inter text-sm mt-1">{events.length} événement{events.length > 1 ? 's' : ''}</p>
        </div>
        <Link href="/admin/events/new" className="btn-primary text-sm px-5 py-2.5">+ Nouvel événement</Link>
      </div>

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
                  <span className={`badge text-xs ${getEventTypeColor(event.type)}`}>{EVENT_TYPE_LABELS[event.type]}</span>
                  <h3 className="font-oswald text-white text-lg font-semibold mt-1.5 leading-tight">{event.title}</h3>
                </div>
                <span className={`text-xs font-inter font-medium ml-2 ${STATUS_COLOR[event.status]}`}>
                  {STATUS_LABEL[event.status]}
                </span>
              </div>

              <div className="space-y-1.5 text-sm font-inter text-gray-400 mb-4">
                <div className="flex items-center gap-2">
                  <Calendar size={13} className="text-major-primary" />
                  {formatDate(event.date, 'dd MMM yyyy')}
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
                    <span className={fillPct >= 90 ? 'text-red-400' : fillPct >= 70 ? 'text-yellow-400' : 'text-major-accent'}>{fillPct}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${fillPct >= 90 ? 'bg-red-500' : fillPct >= 70 ? 'bg-yellow-500' : 'bg-major-primary'}`}
                      style={{ width: `${fillPct}%` }} />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-800">
                <span className="font-oswald text-major-accent font-bold">
                  {event.price === 0 ? 'Gratuit' : event.price ? formatCurrency(event.price, 'MAD') : '—'}
                </span>
                <Link href={`/admin/events/${event.id}`}
                  className="text-xs text-major-cyan hover:text-white font-inter transition-colors">
                  Modifier →
                </Link>
              </div>
            </div>
          )
        })}
      </div>

      {events.length === 0 && (
        <div className="text-center py-20 text-gray-600 font-inter">
          <Calendar size={40} className="mx-auto mb-3 opacity-20" />
          Aucun événement. <Link href="/admin/events/new" className="text-major-accent underline">Créer le premier</Link>
        </div>
      )}
    </div>
  )
}
