
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { formatDate, SESSION_STATUS_LABELS, TRAINING_TYPE_LABELS } from '@/lib/utils'
import { Users, Calendar, CheckSquare, ClipboardList } from 'lucide-react'
import Link from 'next/link'

export default async function CoachDashboardPage() {
  const session = await auth()
  if (!session?.user?.profileId) redirect('/login')

  const coach = await prisma.coach.findUnique({
    where:   { id: session.user.profileId },
    include: { user: true, groups: { include: { _count: { select: { members: true } } } } },
  })
  if (!coach) redirect('/login')

  const upcomingSessions = await prisma.trainingSession.findMany({
    where:   { coachId: coach.id, status: 'SCHEDULED', date: { gte: new Date() } },
    orderBy: { date: 'asc' },
    take:    5,
    include: { group: true },
  })

  const recentSessions = await prisma.trainingSession.findMany({
    where:   { coachId: coach.id },
    orderBy: { date: 'desc' },
    take:    10,
    include: { group: true, attendances: true },
  })

  const totalMembers  = coach.groups.reduce((s, g) => s + g._count.members, 0)
  const totalSessions = recentSessions.length

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-bebas text-4xl text-white tracking-widest">
          ESPACE COACH — {coach.firstName.toUpperCase()} {coach.lastName.toUpperCase()}
        </h1>
        <p className="text-gray-400 font-inter text-sm mt-1">{(coach as any).specialty ?? (coach as any).speciality ?? 'Entraîneur'} · {(coach as any).certificationLevel ?? ''}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { icon: Users,        label: 'Mes groupes',   value: `${coach.groups.length}` },
          { icon: ClipboardList,label: 'Mes membres',   value: `${totalMembers}`        },
          { icon: Calendar,     label: 'Séances totales', value: `${totalSessions}`     },
          { icon: CheckSquare,  label: 'Séances à venir', value: `${upcomingSessions.length}` },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="card-dark">
            <Icon size={18} className="text-major-accent mb-3" />
            <p className="text-gray-500 text-xs font-inter uppercase tracking-widest mb-1">{label}</p>
            <p className="font-bebas text-3xl text-white">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My groups */}
        <div className="card-dark">
          <h2 className="font-oswald text-white text-lg uppercase tracking-wide mb-4">Mes groupes</h2>
          {coach.groups.length === 0
            ? <p className="text-gray-600 text-sm font-inter text-center py-6">Aucun groupe assigné.</p>
            : (
              <div className="space-y-3">
                {coach.groups.map(g => (
                  <div key={g.id} className="flex items-center justify-between p-3 bg-major-black/40 rounded-xl border border-gray-800">
                    <div>
                      <p className="text-white font-inter text-sm font-medium">{g.name}</p>
                      <p className="text-gray-500 text-xs font-inter">{g.level} · {(g as any).schedule ?? 'Horaires non définis'}</p>
                    </div>
                    <span className="badge text-xs">{g._count.members} membres</span>
                  </div>
                ))}
              </div>
            )
          }
        </div>

        {/* Upcoming sessions */}
        <div className="card-dark">
          <h2 className="font-oswald text-white text-lg uppercase tracking-wide mb-4">Prochaines séances</h2>
          {upcomingSessions.length === 0
            ? <p className="text-gray-600 text-sm font-inter text-center py-6">Aucune séance planifiée.</p>
            : (
              <div className="space-y-3">
                {upcomingSessions.map(s => (
                  <div key={s.id} className="flex items-start gap-3 p-3 bg-major-black/40 rounded-xl border border-gray-800">
                    <div className="text-center bg-major-primary/10 rounded-lg px-2.5 py-1.5 min-w-[48px]">
                      <p className="font-bebas text-2xl text-white leading-tight">{formatDate(s.date, 'dd')}</p>
                      <p className="text-gray-500 text-[9px] font-inter uppercase">{formatDate(s.date, 'MMM')}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-inter font-medium truncate">{s.title}</p>
                      <p className="text-gray-500 text-xs font-inter">{s.group?.name ?? ''} · {TRAINING_TYPE_LABELS[s.type]}</p>
                      <p className="text-gray-600 text-xs font-inter">{s.location ?? ''} · {(s as any).durationMin ?? s.duration ?? '—'} min</p>
                    </div>
                  </div>
                ))}
              </div>
            )
          }
        </div>

        {/* Recent sessions with attendance */}
        <div className="card-dark lg:col-span-2 overflow-hidden p-0">
          <div className="px-5 py-4 border-b border-gray-800">
            <h2 className="font-oswald text-white text-lg uppercase tracking-wide">Historique des séances</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="table-dark">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Séance</th>
                  <th>Groupe</th>
                  <th>Type</th>
                  <th>Présences</th>
                </tr>
              </thead>
              <tbody>
                {recentSessions.map(s => (
                  <tr key={s.id}>
                    <td className="text-gray-400 text-xs">{formatDate(s.date, 'dd MMM yyyy')}</td>
                    <td className="text-white font-medium">{s.title}</td>
                    <td className="text-gray-400 text-sm">{s.group?.name ?? '—'}</td>
                    <td><span className="badge text-xs">{TRAINING_TYPE_LABELS[s.type]}</span></td>
                    <td>
                      <span className="text-major-accent font-oswald font-bold">
                        {s.attendances.filter(a => a.present).length}/{s.attendances.length}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
