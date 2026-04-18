import { prisma } from '@/lib/prisma'
import { formatDate, getMemberStatusColor, MEMBER_STATUS_LABELS, MEMBER_CATEGORY_LABELS } from '@/lib/utils'
import { Users, Search, Filter } from 'lucide-react'
import Link from 'next/link'
import { MemberActions } from './member-actions'

interface Props { searchParams: { status?: string; search?: string } }

export default async function AdminMembersPage({ searchParams }: Props) {
  const { status, search } = searchParams

  const members = await prisma.member.findMany({
    where: {
      ...(status ? { status: status as any } : {}),
      ...(search ? {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName:  { contains: search, mode: 'insensitive' } },
          { user: { email: { contains: search, mode: 'insensitive' } } },
        ],
      } : {}),
    },
    include: { user: true, group: true },
    orderBy: { createdAt: 'desc' },
  })

  const counts = await prisma.member.groupBy({ by: ['status'], _count: true })
  const countMap = Object.fromEntries(counts.map(c => [c.status, c._count]))

  const STATUSES = ['', 'ACTIVE', 'PENDING', 'SUSPENDED', 'INACTIVE']

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-bebas text-4xl text-white tracking-widest">GESTION DES MEMBRES</h1>
          <p className="text-gray-400 font-inter text-sm mt-1">{members.length} membre{members.length > 1 ? 's' : ''} trouvé{members.length > 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        {STATUSES.map(s => {
          const count = s ? countMap[s] ?? 0 : Object.values(countMap).reduce((a, b) => a + b, 0)
          return (
            <Link key={s || 'all'} href={s ? `/admin/members?status=${s}` : '/admin/members'}
              className={`px-4 py-2 rounded-xl text-sm font-inter border transition-colors ${
                (status ?? '') === s
                  ? 'bg-major-primary border-major-primary text-white'
                  : 'border-gray-700 text-gray-400 hover:border-gray-500'
              }`}>
              {s ? MEMBER_STATUS_LABELS[s as any] : 'Tous'} ({count})
            </Link>
          )
        })}
      </div>

      {/* Table */}
      <div className="card-dark overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="table-dark">
            <thead>
              <tr>
                <th>Membre</th>
                <th>Licence</th>
                <th>Catégorie</th>
                <th>Groupe</th>
                <th>Statut</th>
                <th>Inscrit le</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-600 font-inter">
                    Aucun membre trouvé.
                  </td>
                </tr>
              )}
              {members.map(m => (
                <tr key={m.id}>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-major-primary/20 flex items-center justify-center text-major-accent text-xs font-semibold flex-shrink-0">
                        {m.firstName?.[0]}{m.lastName?.[0]}
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">{m.firstName} {m.lastName}</p>
                        <p className="text-gray-500 text-xs">{m.user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="text-gray-400 text-xs font-mono">{m.licenseNumber}</td>
                  <td className="text-gray-400 text-sm">{m.category ? MEMBER_CATEGORY_LABELS[m.category] : '—'}</td>
                  <td className="text-gray-400 text-sm">{m.group?.name ?? '—'}</td>
                  <td>
                    <span className={`text-xs font-inter font-medium ${getMemberStatusColor(m.status)}`}>
                      {MEMBER_STATUS_LABELS[m.status]}
                    </span>
                  </td>
                  <td className="text-gray-500 text-xs">{formatDate(m.createdAt, 'dd MMM yyyy')}</td>
                  <td>
                    <MemberActions memberId={m.id} currentStatus={m.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
