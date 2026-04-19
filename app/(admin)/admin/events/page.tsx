import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Calendar } from 'lucide-react'
import { EventsListClient } from './events-list-client'

export default async function AdminEventsPage() {
  const events = await prisma.event.findMany({
    orderBy: [{ status: 'asc' }, { date: 'asc' }],
    include: { _count: { select: { registrations: true } } },
  })

  // Sérialiser les dates pour le Client Component
  const serialized = events.map(e => ({
    ...e,
    date:    e.date.toISOString(),
    endDate: e.endDate?.toISOString() ?? null,
  }))

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-bebas text-4xl text-white tracking-widest">GESTION DES ÉVÉNEMENTS</h1>
          <p className="text-gray-400 font-inter text-sm mt-1">
            {events.length} événement{events.length > 1 ? 's' : ''}
          </p>
        </div>
        <Link href="/admin/events/new" className="btn-primary text-sm px-5 py-2.5">
          + Nouvel événement
        </Link>
      </div>

      <EventsListClient events={serialized as any} />

      {events.length === 0 && (
        <div className="text-center py-20 text-gray-600 font-inter">
          <Calendar size={40} className="mx-auto mb-3 opacity-20" />
          Aucun événement.{' '}
          <Link href="/admin/events/new" className="text-major-accent underline">
            Créer le premier
          </Link>
        </div>
      )}
    </div>
  )
}
