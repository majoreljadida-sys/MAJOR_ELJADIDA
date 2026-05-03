import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { formatDate, TRAINING_TYPE_LABELS, SESSION_STATUS_LABELS } from '@/lib/utils'
import { Activity, Calendar, MapPin, Users } from 'lucide-react'

export const dynamic = 'force-dynamic'

const STATUS_COLOR: Record<string, string> = {
  SCHEDULED:   'text-major-accent',
  COMPLETED:   'text-green-400',
  CANCELLED:   'text-red-400',
  IN_PROGRESS: 'text-major-cyan',
}

export default async function CoachSessionsPage() {
  const session = await auth()
  if (!session?.user?.profileId || session.user.role !== 'COACH') redirect('/login')

  const coachId = session.user.profileId

  // Toutes les séances assignées à ce coach
  const sessions = await prisma.trainingSession.findMany({
    where:   { coachId },
    orderBy: { date: 'desc' },
    include: {
      group: { select: { name: true } },
      _count: { select: { attendances: true } },
    },
  })

  // Comptage des présents via raw SQL (le champ est hors-schéma Prisma)
  const counts = await prisma.$queryRaw<{ id: string; present_count: number | null }[]>`
    SELECT id, present_count FROM training_sessions WHERE "coachId" = ${coachId}
  `
  const countMap = Object.fromEntries(
    counts.map(c => [c.id, c.present_count !== null ? Number(c.present_count) : null])
  )

  const upcoming = sessions.filter(s => new Date(s.date) >= new Date() && s.status !== 'COMPLETED' && s.status !== 'CANCELLED')
  const past     = sessions.filter(s => !upcoming.includes(s))

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-bebas text-4xl text-white tracking-widest">MES SÉANCES</h1>
        <p className="text-gray-400 font-inter text-sm mt-1">
          {sessions.length} séance{sessions.length > 1 ? 's' : ''} au total · {upcoming.length} à venir
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Stat icon={Calendar}  label="À venir"        value={upcoming.length} />
        <Stat icon={Activity}  label="Complétées"     value={sessions.filter(s => s.status === 'COMPLETED').length} />
        <Stat icon={Users}     label="Total présents" value={Object.values(countMap).filter((v): v is number => v !== null).reduce((a, b) => a + b, 0)} />
        <Stat icon={MapPin}    label="Groupes uniques" value={new Set(sessions.map(s => s.group?.name).filter(Boolean)).size} />
      </div>

      {/* Séances à venir */}
      {upcoming.length > 0 && (
        <section className="mb-10">
          <h2 className="font-oswald text-white text-xl uppercase tracking-wide mb-4">À venir</h2>
          <div className="card-dark p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="table-dark">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Séance</th>
                    <th>Type</th>
                    <th>Groupe</th>
                    <th>Lieu</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {upcoming.map(s => (
                    <tr key={s.id}>
                      <td className="text-gray-400 text-xs whitespace-nowrap">{formatDate(s.date, "EEE dd MMM 'à' HH'h'mm")}</td>
                      <td className="text-white font-medium text-sm">{s.title}</td>
                      <td><span className="badge text-xs">{TRAINING_TYPE_LABELS[s.type] ?? s.type}</span></td>
                      <td className="text-gray-400 text-sm">{s.group?.name ?? '—'}</td>
                      <td className="text-gray-400 text-xs">{s.location || '—'}</td>
                      <td>
                        <span className={`text-xs font-inter font-medium ${STATUS_COLOR[s.status] ?? 'text-gray-400'}`}>
                          {SESSION_STATUS_LABELS[s.status] ?? s.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* Séances passées */}
      <section>
        <h2 className="font-oswald text-white text-xl uppercase tracking-wide mb-4">Historique</h2>
        {past.length === 0 ? (
          <p className="text-gray-500 font-inter text-sm">Aucune séance passée.</p>
        ) : (
          <div className="card-dark p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="table-dark">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Séance</th>
                    <th>Type</th>
                    <th>Groupe</th>
                    <th>Présents</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {past.map(s => (
                    <tr key={s.id}>
                      <td className="text-gray-400 text-xs whitespace-nowrap">{formatDate(s.date, 'dd MMM yyyy')}</td>
                      <td className="text-white font-medium text-sm">{s.title}</td>
                      <td><span className="badge text-xs">{TRAINING_TYPE_LABELS[s.type] ?? s.type}</span></td>
                      <td className="text-gray-400 text-sm">{s.group?.name ?? '—'}</td>
                      <td className="text-major-accent font-oswald font-bold">
                        {countMap[s.id] !== null && countMap[s.id] !== undefined ? countMap[s.id] : '—'}
                      </td>
                      <td>
                        <span className={`text-xs font-inter font-medium ${STATUS_COLOR[s.status] ?? 'text-gray-400'}`}>
                          {SESSION_STATUS_LABELS[s.status] ?? s.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

function Stat({ icon: Icon, label, value }: { icon: any; label: string; value: number }) {
  return (
    <div className="card-dark">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={15} className="text-major-primary" />
        <p className="text-gray-500 text-xs font-inter uppercase tracking-widest">{label}</p>
      </div>
      <p className="font-oswald text-2xl font-bold text-white">{value}</p>
    </div>
  )
}
