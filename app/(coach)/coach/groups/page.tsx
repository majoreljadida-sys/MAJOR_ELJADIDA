import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { Users, Phone, Mail, ChevronRight } from 'lucide-react'
import { MEMBER_CATEGORY_LABELS, MEMBER_STATUS_LABELS, getMemberStatusColor } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function CoachGroupsPage() {
  const session = await auth()
  if (!session?.user?.profileId || session.user.role !== 'COACH') redirect('/login')

  const coachId = session.user.profileId

  const groups = await prisma.trainingGroup.findMany({
    where:   { coachId },
    orderBy: { name: 'asc' },
    include: {
      members: {
        include: { user: { select: { email: true } } },
        orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
      },
      _count: { select: { sessions: true } },
    },
  })

  const totalMembers = groups.reduce((s, g) => s + g.members.length, 0)

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-bebas text-4xl text-white tracking-widest">MES GROUPES</h1>
        <p className="text-gray-400 font-inter text-sm mt-1">
          {groups.length} groupe{groups.length > 1 ? 's' : ''} · {totalMembers} adhérent{totalMembers > 1 ? 's' : ''} au total
        </p>
      </div>

      {groups.length === 0 ? (
        <div className="card-dark text-center py-16">
          <Users size={40} className="mx-auto text-gray-700 mb-4" />
          <p className="text-gray-400 font-inter text-sm">
            Aucun groupe ne t'est assigné pour l'instant.
          </p>
          <p className="text-gray-500 font-inter text-xs mt-2">
            Contacte un administrateur pour qu'il t'assigne un ou plusieurs groupes d'entraînement.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map(g => (
            <section key={g.id} className="card-dark">
              <div className="flex items-start justify-between mb-5 flex-wrap gap-3">
                <div>
                  <h2 className="font-oswald text-white text-2xl font-semibold">{g.name}</h2>
                  <p className="text-gray-500 text-sm font-inter mt-0.5">
                    {g.level ?? 'Tous niveaux'} · {g._count.sessions} séance{g._count.sessions > 1 ? 's' : ''} programmée{g._count.sessions > 1 ? 's' : ''}
                  </p>
                  {g.description && (
                    <p className="text-gray-400 text-sm font-inter mt-2 max-w-2xl">{g.description}</p>
                  )}
                </div>
                <span className="badge text-xs">{g.members.length} adhérent{g.members.length > 1 ? 's' : ''}</span>
              </div>

              {g.members.length === 0 ? (
                <p className="text-gray-500 font-inter text-sm py-4 text-center">
                  Aucun adhérent dans ce groupe pour l'instant.
                </p>
              ) : (
                <div className="overflow-x-auto -mx-5">
                  <table className="table-dark">
                    <thead>
                      <tr>
                        <th>Adhérent</th>
                        <th>Catégorie</th>
                        <th>Téléphone</th>
                        <th>Email</th>
                        <th>Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {g.members.map(m => (
                        <tr key={m.id}>
                          <td>
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-major-primary/20 flex items-center justify-center text-major-accent text-xs font-semibold flex-shrink-0">
                                {m.firstName[0]}{m.lastName[0]}
                              </div>
                              <div>
                                <p className="text-white text-sm font-medium">{m.firstName} {m.lastName}</p>
                                <p className="text-gray-500 text-xs font-inter">{m.licenseNumber ?? '—'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="text-gray-400 text-sm">
                            {m.category ? MEMBER_CATEGORY_LABELS[m.category] : '—'}
                          </td>
                          <td className="text-gray-400 text-sm whitespace-nowrap">
                            {m.phone ? (
                              <a href={`tel:${m.phone}`} className="flex items-center gap-1.5 hover:text-major-accent transition-colors">
                                <Phone size={12} className="text-major-primary" /> {m.phone}
                              </a>
                            ) : <span className="text-gray-600">—</span>}
                          </td>
                          <td className="text-gray-400 text-sm">
                            <a href={`mailto:${m.user.email}`} className="flex items-center gap-1.5 hover:text-major-accent transition-colors">
                              <Mail size={12} className="text-major-primary" />
                              <span className="truncate max-w-[180px]">{m.user.email}</span>
                            </a>
                          </td>
                          <td>
                            <span className={`text-xs font-inter font-medium ${getMemberStatusColor(m.status)}`}>
                              {MEMBER_STATUS_LABELS[m.status]}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
