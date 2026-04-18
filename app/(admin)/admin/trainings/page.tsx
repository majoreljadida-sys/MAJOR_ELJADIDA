import { prisma } from '@/lib/prisma'
import { formatDate, TRAINING_TYPE_LABELS, SESSION_STATUS_LABELS } from '@/lib/utils'
import { Calendar, Users, Clock, CheckSquare } from 'lucide-react'

const STATUS_COLOR: Record<string, string> = {
  SCHEDULED:  'text-major-accent',
  COMPLETED:  'text-gray-500',
  CANCELLED:  'text-red-400',
  IN_PROGRESS:'text-major-cyan',
}

export default async function AdminTrainingsPage() {
  const [sessions, groups] = await Promise.all([
    prisma.trainingSession.findMany({
      orderBy: { date: 'desc' },
      take: 50,
      include: {
        group:       true,
        coach:       { include: { user: true } },
        attendances: true,
      },
    }),
    prisma.trainingGroup.findMany({
      include: {
        coach:   { include: { user: true } },
        _count:  { select: { members: true, sessions: true } },
      },
    }),
  ])

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-bebas text-4xl text-white tracking-widest">SÉANCES D'ENTRAÎNEMENT</h1>
        <p className="text-gray-400 font-inter text-sm mt-1">{sessions.length} séances · {groups.length} groupes</p>
      </div>

      {/* Groups */}
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
              {(g as any).schedule && (
                <div className="flex items-center gap-2 text-gray-400 text-sm font-inter mb-2">
                  <Clock size={13} className="text-major-primary" />
                  {(g as any).schedule}
                </div>
              )}
              <div className="flex items-center gap-2 text-gray-400 text-sm font-inter">
                <Users size={13} className="text-major-primary" />
                Coach : {g.coach ? `${g.coach.firstName} ${g.coach.lastName}` : 'Non assigné'}
              </div>
              <p className="text-gray-600 text-xs font-inter mt-2">{g._count.sessions} séances totales</p>
            </div>
          ))}
        </div>
      </section>

      {/* Sessions table */}
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
                  <th>Lieu</th>
                  <th>Durée</th>
                  <th>Présences</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {sessions.length === 0 && (
                  <tr>
                    <td colSpan={9} className="text-center py-12 text-gray-600 font-inter">
                      Aucune séance.
                    </td>
                  </tr>
                )}
                {sessions.map(s => (
                  <tr key={s.id}>
                    <td className="text-gray-400 text-xs whitespace-nowrap">{formatDate(s.date, 'dd MMM yyyy')}</td>
                    <td className="text-white font-medium">{s.title}</td>
                    <td><span className="badge text-xs">{TRAINING_TYPE_LABELS[s.type]}</span></td>
                    <td className="text-gray-400 text-sm">{s.group?.name ?? '—'}</td>
                    <td className="text-gray-400 text-sm whitespace-nowrap">
                      {s.coach ? `${s.coach.firstName} ${s.coach.lastName}` : '—'}
                    </td>
                    <td className="text-gray-500 text-xs max-w-[120px] truncate">{s.location ?? '—'}</td>
                    <td className="text-gray-400 text-sm">{(s as any).durationMin ?? s.duration ?? '—'} min</td>
                    <td>
                      <span className="text-major-accent font-oswald font-bold">
                        {s.attendances.filter(a => a.present).length}/{s.attendances.length}
                      </span>
                    </td>
                    <td>
                      <span className={`text-xs font-inter font-medium ${STATUS_COLOR[s.status] ?? 'text-gray-400'}`}>
                        {SESSION_STATUS_LABELS[s.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  )
}
