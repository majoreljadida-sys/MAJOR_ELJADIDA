import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, User as UserIcon, Mail, Phone, Calendar, MapPin, CreditCard as IdCardIcon,
  Shirt, FileCheck, FileX, AlertTriangle, CreditCard, Trophy, Activity, Target,
} from 'lucide-react'
import { PhotoLightbox } from './photo-lightbox'
import {
  formatDate, formatCurrency, MEMBER_STATUS_LABELS,
  TSHIRT_SIZE_LABELS, getMemberStatusColor, getPaymentStatusColor, PAYMENT_STATUS_LABELS,
  PAYMENT_TYPE_LABELS, EVENT_TYPE_LABELS,
} from '@/lib/utils'
import { getLevel } from '@/lib/sport-levels'
import { getMotivation } from '@/lib/motivations'

export const dynamic = 'force-dynamic'

export default async function AdminMemberDetailPage({ params }: { params: { id: string } }) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') redirect('/login')

  const member = await prisma.member.findUnique({
    where: { id: params.id },
    include: {
      user:  { include: { coach: { select: { id: true, specialty: true } } } },
      group: true,
      payments: { orderBy: { createdAt: 'desc' }, take: 10 },
      registrations: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { event: true },
      },
      attendances: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { session: { select: { title: true, date: true, type: true } } },
      },
    },
  })

  if (!member) notFound()

  // Statut certificat médical
  const now            = new Date()
  const certExpiry     = member.medicalCertExpiry
  const certMissing    = !member.medicalCertUrl
  const certExpired    = certExpiry ? certExpiry < now : false
  const daysLeft       = certExpiry ? Math.ceil((certExpiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null
  const certExpiringSoon = daysLeft !== null && daysLeft > 0 && daysLeft <= 30

  const totalPaid = member.payments.filter(p => p.status === 'PAID').reduce((s, p) => s + p.amount, 0)
  const unpaidCount = member.payments.filter(p => p.status === 'PENDING' || p.status === 'LATE').length
  const presentCount = member.attendances.filter(a => a.present).length

  return (
    <div className="p-8 max-w-5xl">
      <Link href="/admin/members"
        className="flex items-center gap-2 text-gray-400 hover:text-white text-sm font-inter mb-6 transition-colors">
        <ArrowLeft size={16} /> Retour à la liste
      </Link>

      {/* Header avec photo + nom */}
      <div className="card-dark mb-6">
        <div className="flex items-start gap-5 flex-wrap">
          <PhotoLightbox
            photo={member.photo}
            name={`${member.firstName} ${member.lastName}`}
            fallback={`${member.firstName[0]}${member.lastName[0]}`}
          />
          <div className="flex-1 min-w-0">
            <h1 className="font-bebas text-4xl text-white tracking-widest">
              {member.firstName.toUpperCase()} {member.lastName.toUpperCase()}
            </h1>
            <p className="text-gray-400 font-inter text-sm mt-1 flex items-center gap-2">
              <Mail size={13} className="text-major-primary" /> {member.user.email}
            </p>
            <div className="flex items-center gap-3 mt-3 flex-wrap">
              <span className={`badge text-xs font-medium ${getMemberStatusColor(member.status)}`}>
                {MEMBER_STATUS_LABELS[member.status]}
              </span>
              {(() => {
                const lvl = getLevel(member.sportLevel)
                return lvl ? (
                  <span className={`inline-flex items-center gap-1 ${lvl.chipBg} ${lvl.chipText} border ${lvl.chipBorder} text-xs font-inter font-semibold px-2 py-1 rounded`}>
                    <span>{lvl.emoji}</span> {lvl.label.toUpperCase()}
                  </span>
                ) : (
                  <span className="text-xs text-gray-500 italic font-inter">Niveau non renseigné</span>
                )
              })()}
              {(() => {
                const mot = getMotivation(member.motivation)
                return mot ? (
                  <span className={`inline-flex items-center gap-1 ${mot.chipBg} ${mot.chipText} border ${mot.chipBorder} text-xs font-inter font-semibold px-2 py-1 rounded`}>
                    <span>{mot.emoji}</span> {mot.label.toUpperCase()}
                  </span>
                ) : null
              })()}
              {member.user.coach && (
                <span className="badge text-xs text-major-cyan bg-major-cyan/10 border-major-cyan/30">
                  COACH{member.user.coach.specialty ? ` · ${member.user.coach.specialty}` : ''}
                </span>
              )}
              <span className="text-xs text-gray-500 font-inter">
                Inscrit le {formatDate(member.createdAt, 'dd MMMM yyyy')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Stat icon={CreditCard} label="Total payé"      value={formatCurrency(totalPaid, 'MAD')} color="text-major-accent" />
        <Stat icon={CreditCard} label="En attente"      value={`${unpaidCount}`}                  color={unpaidCount > 0 ? 'text-yellow-400' : 'text-gray-500'} />
        <Stat icon={Trophy}     label="Inscriptions"    value={`${member.registrations.length}`}  color="text-major-cyan" />
        <Stat icon={Activity}   label="Présences"       value={`${presentCount}`}                 color="text-major-accent" />
      </div>

      {/* Identité */}
      <div className="card-dark mb-6">
        <h2 className="font-oswald text-white text-lg uppercase tracking-wide mb-4 flex items-center gap-2">
          <UserIcon size={18} className="text-major-primary" /> Identité
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-sm font-inter">
          <Field icon={IdCardIcon}   label="N° CIN"            value={member.cin} mono missing="à compléter" />
          <Field icon={Calendar} label="Date de naissance" value={member.dateOfBirth ? formatDate(member.dateOfBirth, 'dd/MM/yyyy') : null} missing="à compléter" />
          <Field icon={Phone}    label="Téléphone"         value={member.phone} />
          <Field icon={MapPin}   label="Lieu / Ville"      value={member.placeOfBirth} />
          <Field icon={Shirt}    label="Taille T-shirt"    value={member.tshirtSize ? TSHIRT_SIZE_LABELS[member.tshirtSize] : null} />
          <Field icon={Target}   label="Objectif"          value={getMotivation(member.motivation)?.label ?? null} missing="à compléter" />
          <Field icon={IdCardIcon}   label="N° Licence"        value={member.licenseNumber} mono />
          <Field icon={Activity} label="Niveau sportif"    value={getLevel(member.sportLevel)?.label ?? null} missing="à compléter" />
          <Field icon={UserIcon} label="Groupe"            value={member.group?.name ?? null} />
        </div>
      </div>

      {/* Certificat médical */}
      <div className="card-dark mb-6">
        <h2 className="font-oswald text-white text-lg uppercase tracking-wide mb-4 flex items-center gap-2">
          <FileCheck size={18} className="text-major-primary" /> Certificat médical
        </h2>
        {certMissing ? (
          <div className="flex items-center gap-3 bg-red-900/20 border border-red-700/40 rounded-xl px-4 py-3 text-red-400 font-inter text-sm">
            <FileX size={18} className="flex-shrink-0" />
            <span>Aucun certificat médical fourni.</span>
          </div>
        ) : (
          <div className="space-y-3">
            <a href={member.medicalCertUrl!} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-major-accent hover:text-major-primary text-sm font-inter font-medium underline">
              <FileCheck size={15} /> Voir le certificat
            </a>
            <div className="text-sm font-inter">
              {certExpired ? (
                <span className="text-red-400 flex items-center gap-2">
                  <AlertTriangle size={14} /> Expiré le {formatDate(certExpiry!, 'dd/MM/yyyy')}
                </span>
              ) : certExpiringSoon ? (
                <span className="text-yellow-400 flex items-center gap-2">
                  <AlertTriangle size={14} /> Expire dans {daysLeft} jours ({formatDate(certExpiry!, 'dd/MM/yyyy')})
                </span>
              ) : (
                <span className="text-gray-400">Valable jusqu'au {certExpiry ? formatDate(certExpiry, 'dd/MM/yyyy') : 'inconnu'}</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Paiements */}
      <div className="card-dark mb-6">
        <h2 className="font-oswald text-white text-lg uppercase tracking-wide mb-4 flex items-center gap-2">
          <CreditCard size={18} className="text-major-primary" /> Paiements ({member.payments.length})
        </h2>
        {member.payments.length === 0 ? (
          <p className="text-gray-500 text-sm font-inter">Aucun paiement enregistré.</p>
        ) : (
          <div className="overflow-x-auto -mx-5">
            <table className="table-dark">
              <thead>
                <tr><th>Date</th><th>Type</th><th>Saison</th><th>Montant</th><th>Statut</th></tr>
              </thead>
              <tbody>
                {member.payments.map(p => (
                  <tr key={p.id}>
                    <td className="text-gray-400 text-xs">{formatDate(p.createdAt, 'dd MMM yyyy')}</td>
                    <td className="text-gray-300 text-sm">{PAYMENT_TYPE_LABELS[p.type] ?? p.type}</td>
                    <td className="text-gray-500 text-xs">{p.season ?? '—'}</td>
                    <td className="text-major-accent font-oswald font-bold">{formatCurrency(p.amount, 'MAD')}</td>
                    <td>
                      <span className={`badge text-xs ${getPaymentStatusColor(p.status)}`}>
                        {PAYMENT_STATUS_LABELS[p.status] ?? p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inscriptions aux événements */}
      <div className="card-dark mb-6">
        <h2 className="font-oswald text-white text-lg uppercase tracking-wide mb-4 flex items-center gap-2">
          <Trophy size={18} className="text-major-primary" /> Inscriptions aux événements ({member.registrations.length})
        </h2>
        {member.registrations.length === 0 ? (
          <p className="text-gray-500 text-sm font-inter">Aucune inscription.</p>
        ) : (
          <div className="overflow-x-auto -mx-5">
            <table className="table-dark">
              <thead>
                <tr><th>Événement</th><th>Date</th><th>Type</th><th>Statut</th><th>Paiement</th><th>Dossard</th></tr>
              </thead>
              <tbody>
                {member.registrations.map(r => (
                  <tr key={r.id}>
                    <td>
                      <Link href={`/admin/events/${r.event.id}`} className="text-white text-sm hover:text-major-accent">
                        {r.event.title}
                      </Link>
                    </td>
                    <td className="text-gray-400 text-xs">{formatDate(r.event.date, 'dd MMM yyyy')}</td>
                    <td><span className="badge text-xs">{EVENT_TYPE_LABELS[r.event.type] ?? r.event.type}</span></td>
                    <td>
                      {r.status === 'CONFIRMED' && <span className="text-xs text-major-accent">✓ Confirmé</span>}
                      {r.status === 'WAITING'   && <span className="text-xs text-yellow-400">⏳ Attente</span>}
                      {r.status === 'CANCELLED' && <span className="text-xs text-red-400">✗ Annulé</span>}
                    </td>
                    <td className="text-xs">
                      {r.paidAt
                        ? <span className="text-major-accent">Payé · {formatDate(r.paidAt, 'dd/MM/yy')}</span>
                        : <span className="text-gray-500">Non payé</span>}
                    </td>
                    <td className="text-gray-400 text-sm font-mono">{r.bib ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Présences récentes */}
      <div className="card-dark mb-6">
        <h2 className="font-oswald text-white text-lg uppercase tracking-wide mb-4 flex items-center gap-2">
          <Activity size={18} className="text-major-primary" /> Présences récentes ({member.attendances.length})
        </h2>
        {member.attendances.length === 0 ? (
          <p className="text-gray-500 text-sm font-inter">Aucune présence enregistrée individuellement.</p>
        ) : (
          <div className="overflow-x-auto -mx-5">
            <table className="table-dark">
              <thead>
                <tr><th>Séance</th><th>Date</th><th>Présent</th></tr>
              </thead>
              <tbody>
                {member.attendances.map(a => (
                  <tr key={a.id}>
                    <td className="text-white text-sm">{a.session.title}</td>
                    <td className="text-gray-400 text-xs">{formatDate(a.session.date, 'dd MMM yyyy')}</td>
                    <td>
                      {a.present
                        ? <span className="text-xs text-major-accent">✓ Présent</span>
                        : <span className="text-xs text-gray-500">— Absent</span>}
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

function Stat({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  return (
    <div className="card-dark py-3">
      <div className="flex items-center gap-2 mb-1">
        <Icon size={13} className="text-major-primary" />
        <p className="text-gray-500 text-[10px] font-inter uppercase tracking-widest">{label}</p>
      </div>
      <p className={`font-oswald text-xl font-bold ${color}`}>{value}</p>
    </div>
  )
}

function Field({ icon: Icon, label, value, mono, missing }: {
  icon: any; label: string; value: string | null; mono?: boolean; missing?: string
}) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon size={14} className="text-major-primary flex-shrink-0 mt-0.5" />
      <div className="min-w-0 flex-1">
        <p className="text-gray-500 text-xs font-inter">{label}</p>
        {value
          ? <p className={`text-white text-sm ${mono ? 'font-mono' : 'font-inter'} truncate`}>{value}</p>
          : <p className="text-red-400 text-xs italic font-inter">{missing ?? '—'}</p>}
      </div>
    </div>
  )
}
