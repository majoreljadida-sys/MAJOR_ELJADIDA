
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { formatDate, formatCurrency, PAYMENT_STATUS_LABELS, PAYMENT_TYPE_LABELS, getPaymentStatusColor } from '@/lib/utils'
import { CreditCard, AlertCircle, CheckCircle, Clock } from 'lucide-react'

export default async function MemberPaymentsPage() {
  const session = await auth()
  if (!session?.user?.profileId) redirect('/login')

  const payments = await prisma.payment.findMany({
    where:   { memberId: session.user.profileId },
    orderBy: { createdAt: 'desc' },
  })

  const total  = payments.reduce((s, p) => s + p.amount, 0)
  const paid   = payments.filter(p => p.status === 'PAID').reduce((s, p) => s + p.amount, 0)
  const pending = payments.filter(p => p.status === 'PENDING' || p.status === 'LATE').reduce((s, p) => s + p.amount, 0)

  const STATUS_ICON: Record<string, React.ReactNode> = {
    PAID:    <CheckCircle size={14} className="text-green-400" />,
    PENDING: <Clock        size={14} className="text-yellow-400" />,
    LATE:    <AlertCircle  size={14} className="text-red-400"   />,
    CANCELLED: <AlertCircle size={14} className="text-gray-500" />,
  }

  return (
    <div className="p-8">
      <h1 className="font-bebas text-4xl text-white tracking-widest mb-8">MES PAIEMENTS</h1>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total facturé', value: formatCurrency(total, 'MAD'),   color: 'text-white' },
          { label: 'Total payé',    value: formatCurrency(paid, 'MAD'),    color: 'text-major-accent' },
          { label: 'En attente',    value: formatCurrency(pending, 'MAD'), color: pending > 0 ? 'text-yellow-400' : 'text-major-accent' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card-dark">
            <p className="text-gray-500 text-xs font-inter uppercase tracking-widest mb-2">{label}</p>
            <p className={`font-bebas text-3xl ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card-dark overflow-hidden p-0">
        <div className="px-5 py-4 border-b border-gray-800 flex items-center gap-2">
          <CreditCard size={18} className="text-major-accent" />
          <h2 className="font-oswald text-white text-lg uppercase tracking-wide">Historique</h2>
        </div>
        {payments.length === 0 ? (
          <div className="text-center py-16 text-gray-600 font-inter text-sm">
            <CreditCard size={32} className="mx-auto mb-3 opacity-20" />
            Aucun paiement enregistré.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-dark">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Type</th>
                  <th>Montant</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(p => (
                  <tr key={p.id}>
                    <td className="text-gray-400 text-xs">{formatDate(p.createdAt, 'dd MMM yyyy')}</td>
                    <td className="text-white font-medium">{(p as any).description ?? p.notes ?? "—"}</td>
                    <td>
                      <span className="badge text-xs">{PAYMENT_TYPE_LABELS[p.type]}</span>
                    </td>
                    <td className="font-oswald text-major-accent font-bold text-lg">{formatCurrency(p.amount, 'MAD')}</td>
                    <td>
                      <span className={`flex items-center gap-1.5 text-xs font-inter font-medium ${getPaymentStatusColor(p.status)}`}>
                        {STATUS_ICON[p.status]}
                        {PAYMENT_STATUS_LABELS[p.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
