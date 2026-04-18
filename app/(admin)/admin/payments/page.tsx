import { prisma } from '@/lib/prisma'
import { formatDate, formatCurrency, PAYMENT_STATUS_LABELS, PAYMENT_TYPE_LABELS, getPaymentStatusColor } from '@/lib/utils'
import { CreditCard, AlertCircle, TrendingUp, DollarSign } from 'lucide-react'
import Link from 'next/link'

interface Props { searchParams: { status?: string } }

export default async function AdminPaymentsPage({ searchParams }: Props) {
  const { status } = searchParams

  const [payments, stats] = await Promise.all([
    prisma.payment.findMany({
      where: status ? { status: status as any } : {},
      orderBy: { createdAt: 'desc' },
      include: { member: { include: { user: true } } },
    }),
    prisma.payment.groupBy({
      by: ['status'],
      _sum: { amount: true },
      _count: true,
    }),
  ])

  const statMap = Object.fromEntries(stats.map(s => [s.status, { sum: s._sum.amount ?? 0, count: s._count }]))

  const STATUSES = ['', 'PAID', 'PENDING', 'LATE', 'CANCELLED']

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-bebas text-4xl text-white tracking-widest">GESTION DES PAIEMENTS</h1>
        <p className="text-gray-400 font-inter text-sm mt-1">{payments.length} paiement{payments.length > 1 ? 's' : ''}</p>
      </div>

      {/* Revenue summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Encaissé',    key: 'PAID',      icon: TrendingUp,  color: 'text-major-accent' },
          { label: 'En attente',  key: 'PENDING',    icon: CreditCard,  color: 'text-yellow-400'   },
          { label: 'En retard',   key: 'LATE',       icon: AlertCircle, color: 'text-red-400'      },
          { label: 'Annulé',      key: 'CANCELLED',  icon: DollarSign,  color: 'text-gray-500'     },
        ].map(({ label, key, icon: Icon, color }) => (
          <div key={key} className="card-dark">
            <Icon size={18} className={`${color} mb-3`} />
            <p className="text-gray-500 text-xs font-inter uppercase tracking-widest mb-1">{label}</p>
            <p className={`font-bebas text-2xl ${color}`}>{formatCurrency(statMap[key]?.sum ?? 0, 'MAD')}</p>
            <p className="text-gray-600 text-xs font-inter">{statMap[key]?.count ?? 0} paiements</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-5">
        {STATUSES.map(s => (
          <Link key={s || 'all'} href={s ? `/admin/payments?status=${s}` : '/admin/payments'}
            className={`px-4 py-2 rounded-xl text-sm font-inter border transition-colors ${
              (status ?? '') === s
                ? 'bg-major-primary border-major-primary text-white'
                : 'border-gray-700 text-gray-400 hover:border-gray-500'
            }`}>
            {s ? PAYMENT_STATUS_LABELS[s as any] : 'Tous'} ({statMap[s]?.count ?? (s ? 0 : payments.length)})
          </Link>
        ))}
      </div>

      {/* Table */}
      <div className="card-dark overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="table-dark">
            <thead>
              <tr>
                <th>Membre</th>
                <th>Description</th>
                <th>Type</th>
                <th>Montant</th>
                <th>Statut</th>
                <th>Date</th>
                <th>Méthode</th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-600 font-inter">
                    Aucun paiement trouvé.
                  </td>
                </tr>
              )}
              {payments.map(p => (
                <tr key={p.id}>
                  <td>
                    <div>
                      <p className="text-white text-sm font-medium">{p.member.firstName} {p.member.lastName}</p>
                      <p className="text-gray-500 text-xs">{p.member.licenseNumber}</p>
                    </div>
                  </td>
                  <td className="text-gray-300 text-sm max-w-[200px] truncate">{(p as any).description ?? '—'}</td>
                  <td><span className="badge text-xs">{PAYMENT_TYPE_LABELS[p.type]}</span></td>
                  <td className="font-oswald text-major-accent font-bold text-lg">{formatCurrency(p.amount, 'MAD')}</td>
                  <td>
                    <span className={`text-xs font-inter font-medium ${getPaymentStatusColor(p.status)}`}>
                      {PAYMENT_STATUS_LABELS[p.status]}
                    </span>
                  </td>
                  <td className="text-gray-500 text-xs">{formatDate(p.createdAt, 'dd MMM yyyy')}</td>
                  <td className="text-gray-500 text-xs">{(p as any).method ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
