
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { formatDate, formatCurrency, PAYMENT_STATUS_LABELS, EVENT_TYPE_LABELS, getPaymentStatusColor } from '@/lib/utils'
import { CreditCard, Calendar, Bell, TrendingUp, AlertCircle, CheckCircle, FileText, ShieldAlert } from 'lucide-react'
import Link from 'next/link'

export default async function MemberDashboardPage() {
  const session = await auth()
  if (!session?.user?.profileId) redirect('/login')

  const member = await prisma.member.findUnique({
    where:   { id: session.user.profileId },
    include: {
      user:     true,
      payments: { orderBy: { createdAt: 'desc' }, take: 5 },
      group:    true,
      registrations: {
        include: { event: true },
        orderBy: { createdAt: 'desc' },
        take: 3,
      },
    },
  })
  if (!member) redirect('/login')

  const unpaidCount = member.payments.filter(p => p.status === 'PENDING' || p.status === 'LATE').length
  const totalPaid   = member.payments.filter(p => p.status === 'PAID').reduce((s, p) => s + p.amount, 0)

  // Statut certificat médical
  const now            = new Date()
  const certExpiry     = member.medicalCertExpiry
  const certMissing    = !member.medicalCertUrl
  const certExpired    = certExpiry ? certExpiry < now : false
  const daysLeft       = certExpiry ? Math.ceil((certExpiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null
  const certExpiringSoon = daysLeft !== null && daysLeft > 0 && daysLeft <= 30

  const notifications = await prisma.notification.findMany({
    where:   { userId: member.userId, read: false },
    orderBy: { createdAt: 'desc' },
    take:    5,
  })

  const announcements = await prisma.announcement.findMany({
    where:   {},
    orderBy: { createdAt: 'desc' },
    take:    3,
  })

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-bebas text-4xl text-white tracking-widest">
          BONJOUR, {member.firstName.toUpperCase()} !
        </h1>
        <p className="text-gray-400 font-inter text-sm mt-1">
          Licence N° {member.licenseNumber} · {member.group?.name ?? 'Aucun groupe'}
        </p>
      </div>

      {/* Alert certificat manquant */}
      {certMissing && (
        <div className="flex items-center gap-3 bg-red-900/20 border border-red-700/40 rounded-xl px-5 py-4 mb-4 text-red-400 font-inter text-sm">
          <ShieldAlert size={18} className="flex-shrink-0" />
          <span>Vous n'avez pas encore fourni votre <strong>certificat médical</strong>. Il est requis pour les compétitions.</span>
          <Link href="/member/profile" className="ml-auto underline text-xs whitespace-nowrap">Ajouter</Link>
        </div>
      )}

      {/* Alert certificat expiré */}
      {!certMissing && certExpired && (
        <div className="flex items-center gap-3 bg-red-900/20 border border-red-700/40 rounded-xl px-5 py-4 mb-4 text-red-400 font-inter text-sm">
          <ShieldAlert size={18} className="flex-shrink-0" />
          <span>Votre <strong>certificat médical est expiré</strong>. Veuillez le renouveler.</span>
          <Link href="/member/profile" className="ml-auto underline text-xs whitespace-nowrap">Renouveler</Link>
        </div>
      )}

      {/* Alert certificat bientôt expiré */}
      {!certMissing && certExpiringSoon && (
        <div className="flex items-center gap-3 bg-orange-900/20 border border-orange-700/40 rounded-xl px-5 py-4 mb-4 text-orange-400 font-inter text-sm">
          <FileText size={18} className="flex-shrink-0" />
          <span>Votre certificat médical expire dans <strong>{daysLeft} jour{daysLeft! > 1 ? 's' : ''}</strong>.</span>
          <Link href="/member/profile" className="ml-auto underline text-xs whitespace-nowrap">Renouveler</Link>
        </div>
      )}

      {/* Alert unpaid */}
      {unpaidCount > 0 && (
        <div className="flex items-center gap-3 bg-yellow-900/20 border border-yellow-700/40 rounded-xl px-5 py-4 mb-6 text-yellow-400 font-inter text-sm">
          <AlertCircle size={18} className="flex-shrink-0" />
          <span>Vous avez <strong>{unpaidCount} paiement{unpaidCount > 1 ? 's' : ''}</strong> en attente ou en retard.</span>
          <Link href="/member/payments" className="ml-auto underline text-xs">Voir</Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { icon: CheckCircle, label: 'Statut',       value: member.status === 'ACTIVE' ? 'Actif' : 'En attente', color: member.status === 'ACTIVE' ? 'text-major-accent' : 'text-yellow-400' },
          { icon: CreditCard,  label: 'Total payé',   value: formatCurrency(totalPaid, 'MAD'),            color: 'text-major-accent' },
          { icon: Calendar,    label: 'Inscriptions', value: `${member.registrations.length}`,       color: 'text-major-cyan'   },
          { icon: Bell,        label: 'Notifications', value: `${notifications.length} non lue${notifications.length > 1 ? 's' : ''}`, color: 'text-white' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="card-dark">
            <Icon size={18} className={`${color} mb-3`} />
            <p className="text-gray-500 text-xs font-inter uppercase tracking-widest mb-1">{label}</p>
            <p className={`font-oswald text-xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent payments */}
        <div className="card-dark">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-oswald text-white text-lg uppercase tracking-wide">Derniers paiements</h2>
            <Link href="/member/payments" className="text-xs text-major-accent hover:text-major-primary transition-colors font-inter">Voir tout →</Link>
          </div>
          {member.payments.length === 0
            ? <p className="text-gray-600 text-sm font-inter text-center py-6">Aucun paiement.</p>
            : (
              <div className="space-y-3">
                {member.payments.map(p => (
                  <div key={p.id} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                    <div>
                      <p className="text-white text-sm font-inter font-medium">{(p as any).description ?? p.notes ?? "—"}</p>
                      <p className="text-gray-500 text-xs font-inter">{formatDate(p.createdAt, 'dd MMM yyyy')}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-major-accent font-oswald font-bold">{formatCurrency(p.amount, 'MAD')}</p>
                      <span className={`text-xs font-inter ${getPaymentStatusColor(p.status)}`}>{PAYMENT_STATUS_LABELS[p.status]}</span>
                    </div>
                  </div>
                ))}
              </div>
            )
          }
        </div>

        {/* Upcoming events */}
        <div className="card-dark">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-oswald text-white text-lg uppercase tracking-wide">Mes inscriptions</h2>
            <Link href="/events" className="text-xs text-major-accent hover:text-major-primary transition-colors font-inter">Voir les events →</Link>
          </div>
          {member.registrations.length === 0
            ? <p className="text-gray-600 text-sm font-inter text-center py-6">Aucune inscription à un événement.</p>
            : (
              <div className="space-y-3">
                {member.registrations.map(reg => (
                  <div key={reg.id} className="flex items-start gap-3 py-2 border-b border-gray-800 last:border-0">
                    <div className="text-center bg-major-primary/10 rounded-lg px-2.5 py-1.5 min-w-[48px]">
                      <p className="font-bebas text-2xl text-white leading-tight">{formatDate(reg.event.date, 'dd')}</p>
                      <p className="text-gray-500 text-[9px] font-inter uppercase">{formatDate(reg.event.date, 'MMM')}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-inter font-medium truncate">{reg.event.title}</p>
                      <p className="text-gray-500 text-xs font-inter">{reg.event.location}</p>
                    </div>
                  </div>
                ))}
              </div>
            )
          }
        </div>

        {/* Announcements */}
        {announcements.length > 0 && (
          <div className="card-dark lg:col-span-2">
            <h2 className="font-oswald text-white text-lg uppercase tracking-wide mb-4">Annonces du club</h2>
            <div className="space-y-3">
              {announcements.map(a => (
                <div key={a.id} className="flex items-start gap-3 bg-major-black/40 rounded-xl p-4">
                  <Bell size={15} className="text-major-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white text-sm font-inter font-semibold mb-0.5">{a.title}</p>
                    <p className="text-gray-400 text-xs font-inter leading-relaxed">{a.content}</p>
                    <p className="text-gray-600 text-xs font-inter mt-1">{formatDate(a.createdAt, 'dd MMM yyyy')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
