import { prisma } from '@/lib/prisma'
import { formatDate, formatCurrency, getMemberStatusColor, MEMBER_STATUS_LABELS } from '@/lib/utils'
import { Users, CreditCard, Calendar, TrendingUp, AlertCircle, UserCheck, Clock, ShieldAlert } from 'lucide-react'
import Link from 'next/link'
import { StatCard } from '@/components/ui/stat-card'
import { EmailReminders } from '@/components/admin/email-reminders'

export default async function AdminDashboardPage() {
  const [
    memberCount, activeMembers, pendingMembers,
    coachCount, upcomingEvents,
    recentMembers, latePayments, totalRevenue, pendingRevenue,
    recentPayments,
  ] = await Promise.all([
    prisma.member.count(),
    prisma.member.count({ where: { status: 'ACTIVE' } }),
    prisma.member.count({ where: { status: 'PENDING' } }),
    prisma.coach.count(),
    prisma.event.count({ where: { status: 'UPCOMING' } }),
    prisma.member.findMany({
      take: 8, orderBy: { createdAt: 'desc' },
      include: { user: true },
    }),
    prisma.payment.findMany({
      where: { status: 'LATE' },
      include: { member: { include: { user: true } } },
      take: 5,
    }),
    prisma.payment.aggregate({ where: { status: 'PAID' }, _sum: { amount: true } }),
    prisma.payment.aggregate({ where: { status: { in: ['PENDING', 'LATE'] } }, _sum: { amount: true } }),
    prisma.payment.findMany({
      take: 5, orderBy: { createdAt: 'desc' },
      include: { member: { include: { user: true } } },
    }),
  ])

  const now = new Date()
  const in30days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
  const certIssues = await (prisma.member as any).findMany({
    where: {
      OR: [
        { medicalCertUrl: null },
        { medicalCertExpiry: { lt: now } },
        { medicalCertExpiry: { gte: now, lte: in30days } },
      ],
    },
    select: { id: true, firstName: true, lastName: true, medicalCertUrl: true, medicalCertExpiry: true },
  }) as Array<{ id: string; firstName: string; lastName: string; medicalCertUrl: string | null; medicalCertExpiry: Date | null }>
  const certMissing  = certIssues.filter(m => !m.medicalCertUrl).length
  const certExpired  = certIssues.filter(m => m.medicalCertUrl && m.medicalCertExpiry && m.medicalCertExpiry < now).length
  const certExpiring = certIssues.filter(m => m.medicalCertUrl && m.medicalCertExpiry && m.medicalCertExpiry >= now && m.medicalCertExpiry <= in30days).length

  const stats = [
    { icon: Users,      label: 'Membres actifs',    value: String(activeMembers),     color: 'primary' as const },
    { icon: CreditCard, label: 'Revenus encaissés',  value: formatCurrency(totalRevenue._sum.amount ?? 0, 'MAD'),   color: 'cyan' as const    },
    { icon: Calendar,   label: 'Événements à venir', value: String(upcomingEvents),   color: 'accent' as const  },
    { icon: TrendingUp, label: 'Revenus en attente', value: formatCurrency(pendingRevenue._sum.amount ?? 0, 'MAD'), color: 'yellow' as const  },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-bebas text-4xl text-white tracking-widest">TABLEAU DE BORD ADMIN</h1>
        <p className="text-gray-400 font-inter text-sm mt-1">Vue d'ensemble du Club MAJOR · {formatDate(new Date(), 'dd MMMM yyyy')}</p>
      </div>

      {/* Alerts */}
      {pendingMembers > 0 && (
        <div className="flex items-center gap-3 bg-yellow-900/20 border border-yellow-700/40 rounded-xl px-5 py-4 mb-6">
          <AlertCircle size={18} className="text-yellow-400 flex-shrink-0" />
          <span className="text-yellow-400 font-inter text-sm">
            <strong>{pendingMembers} membre{pendingMembers > 1 ? 's' : ''}</strong> en attente de validation.
          </span>
          <Link href="/admin/members" className="ml-auto text-xs text-yellow-400 underline">Gérer →</Link>
        </div>
      )}
      {latePayments.length > 0 && (
        <div className="flex items-center gap-3 bg-red-900/20 border border-red-700/40 rounded-xl px-5 py-4 mb-6">
          <AlertCircle size={18} className="text-red-400 flex-shrink-0" />
          <span className="text-red-400 font-inter text-sm">
            <strong>{latePayments.length} paiement{latePayments.length > 1 ? 's' : ''}</strong> en retard.
          </span>
          <Link href="/admin/payments" className="ml-auto text-xs text-red-400 underline">Voir →</Link>
        </div>
      )}
      {(certMissing > 0 || certExpired > 0) && (
        <div className="flex items-center gap-3 bg-red-900/20 border border-red-700/40 rounded-xl px-5 py-4 mb-3">
          <ShieldAlert size={18} className="text-red-400 flex-shrink-0" />
          <span className="text-red-400 font-inter text-sm">
            {certMissing > 0 && <><strong>{certMissing} membre{certMissing > 1 ? 's' : ''}</strong> sans certificat médical. </>}
            {certExpired > 0 && <><strong>{certExpired} certificat{certExpired > 1 ? 's' : ''}</strong> expiré{certExpired > 1 ? 's' : ''}.</>}
          </span>
          <Link href="/admin/members" className="ml-auto text-xs text-red-400 underline">Gérer →</Link>
        </div>
      )}
      {certExpiring > 0 && (
        <div className="flex items-center gap-3 bg-orange-900/20 border border-orange-700/40 rounded-xl px-5 py-4 mb-6">
          <ShieldAlert size={18} className="text-orange-400 flex-shrink-0" />
          <span className="text-orange-400 font-inter text-sm">
            <strong>{certExpiring} certificat{certExpiring > 1 ? 's' : ''}</strong> expire{certExpiring > 1 ? 'nt' : ''} dans les 30 prochains jours.
          </span>
          <Link href="/admin/members" className="ml-auto text-xs text-orange-400 underline">Voir →</Link>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(s => (
          <StatCard key={s.label} icon={s.icon} label={s.label} value={s.value} color={s.color} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent members */}
        <div className="card-dark lg:col-span-2 overflow-hidden p-0">
          <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserCheck size={18} className="text-major-accent" />
              <h2 className="font-oswald text-white text-lg uppercase tracking-wide">Derniers membres</h2>
            </div>
            <Link href="/admin/members" className="text-xs text-major-accent hover:text-major-primary font-inter transition-colors">Voir tout →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="table-dark">
              <thead>
                <tr>
                  <th>Membre</th>
                  <th>Licence</th>
                  <th>Statut</th>
                  <th>Inscrit le</th>
                </tr>
              </thead>
              <tbody>
                {recentMembers.map(m => (
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
                    <td>
                      <span className={`text-xs font-inter font-medium ${getMemberStatusColor(m.status)}`}>
                        {MEMBER_STATUS_LABELS[m.status]}
                      </span>
                    </td>
                    <td className="text-gray-500 text-xs">{formatDate(m.createdAt, 'dd MMM yyyy')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent payments */}
        <div className="card-dark">
          <div className="flex items-center gap-2 mb-5">
            <CreditCard size={18} className="text-major-accent" />
            <h2 className="font-oswald text-white text-lg uppercase tracking-wide">Paiements récents</h2>
          </div>
          <div className="space-y-3">
            {recentPayments.map(p => (
              <div key={p.id} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                <div>
                  <p className="text-white text-sm font-inter font-medium truncate max-w-[140px]">
                    {p.member.firstName} {p.member.lastName}
                  </p>
                  <p className="text-gray-500 text-xs">{formatDate(p.createdAt, 'dd MMM')}</p>
                </div>
                <p className="text-major-accent font-oswald font-bold">{formatCurrency(p.amount, 'MAD')}</p>
              </div>
            ))}
          </div>
          <Link href="/admin/payments" className="block text-center text-xs text-major-accent hover:text-major-primary font-inter mt-4 transition-colors">
            Voir tous les paiements →
          </Link>
        </div>
      </div>

      {/* Quick actions */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { href: '/admin/members?status=PENDING', label: 'Valider membres',      icon: UserCheck   },
          { href: '/admin/payments?status=LATE',   label: 'Paiements en retard',  icon: AlertCircle },
          { href: '/admin/events',                 label: 'Gérer événements',     icon: Calendar    },
          { href: '/admin/trainings',              label: 'Séances d\'entraîn.',  icon: Clock       },
        ].map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href}
            className="card-dark flex flex-col items-center gap-2 py-5 text-center hover:border-major-primary/50 transition-all group">
            <Icon size={22} className="text-major-primary group-hover:text-major-accent transition-colors" />
            <span className="text-gray-400 text-xs font-inter group-hover:text-white transition-colors">{label}</span>
          </Link>
        ))}
      </div>

      {/* Email reminders */}
      <EmailReminders />
    </div>
  )
}
