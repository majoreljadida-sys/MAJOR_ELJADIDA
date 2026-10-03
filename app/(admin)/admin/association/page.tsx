import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Vote, Users, Mail, Phone } from 'lucide-react'
import {
  ASSOCIATION_ROLES, getAssociationRoles, groupAssociationRoles,
  MEMBER_TYPES,
} from '@/lib/association-roles'
import { AssociationExportButton } from './export-button'
import { formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function AdminAssociationPage() {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') redirect('/login')

  // Récupère tous les membres classés MEMBRE_ASSOCIATION, triés par nom
  const members = await (prisma.member as any).findMany({
    where:   { memberType: 'MEMBRE_ASSOCIATION' },
    include: { user: { select: { email: true } } },
    orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
  }) as Array<{
    id: string
    firstName: string
    lastName: string
    phone: string | null
    photo: string | null
    memberType: string
    associationRoles: string[]
    status: string
    createdAt: Date
    user: { email: string }
  }>

  const totalAssociation = members.length
  const totalAdherents   = await prisma.member.count({ where: { memberType: 'ADHERENT' as any } })

  // Compter les membres par rôle (pour la vue d'ensemble)
  const roleStats = ASSOCIATION_ROLES.map(def => ({
    def,
    count: members.filter(m => (m.associationRoles ?? []).includes(def.key)).length,
  }))

  // Membres sans rôle particulier (juste MEMBRE_ASSOCIATION, pas de bureau ni comité)
  const simpleMembers = members.filter(m => !m.associationRoles || m.associationRoles.length === 0)

  return (
    <div className="p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Vote size={28} className="text-major-accent" />
            <h1 className="font-bebas text-4xl text-white tracking-widest">ASSOCIATION</h1>
          </div>
          <p className="text-gray-400 font-inter text-sm">
            Membres éligibles à l'assemblée générale, au bureau et aux comités.
          </p>
        </div>
        <AssociationExportButton
          members={members.map(m => ({
            firstName: m.firstName,
            lastName:  m.lastName,
            email:     m.user.email,
            phone:     m.phone,
            roles:     (m.associationRoles ?? []).join('|'),
            status:    m.status,
          }))}
        />
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <Kpi label="Membres de l'asso." value={totalAssociation} accent />
        <Kpi label="Simples adhérents"   value={totalAdherents} />
        <Kpi label="Bureau"
             value={members.filter(m => (m.associationRoles ?? []).some(r =>
               ['PRESIDENT','VICE_PRESIDENT','SECRETAIRE','TRESORIER','MEMBRE_BUREAU'].includes(r)
             )).length} />
        <Kpi label="En comité(s)"
             value={members.filter(m => (m.associationRoles ?? []).some(r => r.startsWith('COMITE_'))).length} />
      </div>

      {/* Répartition par rôle */}
      <div className="card-dark mb-8">
        <h2 className="font-oswald text-white text-lg uppercase tracking-wide mb-4 flex items-center gap-2">
          <Users size={18} className="text-major-primary" /> Répartition par rôle
        </h2>
        <div className="flex flex-wrap gap-2">
          {roleStats.map(({ def, count }) => (
            <span key={def.key}
              className={`inline-flex items-center gap-1.5 ${def.chipBg} ${def.chipText} border ${def.chipBorder} text-xs font-inter font-semibold px-3 py-1.5 rounded-lg`}
              title={def.label}>
              <span>{def.emoji}</span>
              {def.label}
              <span className="ml-1 bg-black/30 rounded-full px-1.5 text-[10px]">{count}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Tableau détaillé */}
      <div className="card-dark overflow-hidden p-0">
        <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
          <h2 className="font-oswald text-white text-lg uppercase tracking-wide">
            Liste nominative ({totalAssociation})
          </h2>
          {simpleMembers.length > 0 && (
            <span className="text-xs text-gray-500 font-inter">
              dont {simpleMembers.length} sans rôle particulier
            </span>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="table-dark">
            <thead>
              <tr>
                <th>Membre</th>
                <th>Contact</th>
                <th>Rôle(s) bureau</th>
                <th>Comité(s)</th>
                <th>Statut</th>
                <th>Depuis</th>
              </tr>
            </thead>
            <tbody>
              {members.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-500 font-inter text-sm">
                    Aucun membre de l'association pour le moment.
                    <br />
                    <Link href="/admin/members" className="text-major-accent underline text-xs mt-2 inline-block">
                      Classer un adhérent en membre →
                    </Link>
                  </td>
                </tr>
              )}
              {members.map(m => {
                const { bureau, comites } = groupAssociationRoles(m.associationRoles)
                return (
                  <tr key={m.id}>
                    <td>
                      <Link href={`/admin/members/${m.id}`} className="flex items-center gap-3 group">
                        <div className="w-9 h-9 rounded-full bg-major-primary/20 flex items-center justify-center text-major-accent text-xs font-semibold flex-shrink-0 overflow-hidden">
                          {m.photo
                            ? <img src={m.photo} alt="" className="w-full h-full object-cover" />
                            : <>{m.firstName[0]}{m.lastName[0]}</>}
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium group-hover:text-major-accent transition-colors">
                            {m.firstName} {m.lastName}
                          </p>
                          <p className="text-gray-500 text-[11px] font-inter">{m.user.email}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="text-gray-400 text-xs">
                      {m.phone
                        ? <span className="flex items-center gap-1"><Phone size={11} />{m.phone}</span>
                        : <span className="text-gray-600 italic">—</span>}
                    </td>
                    <td>
                      {bureau.length === 0
                        ? <span className="text-gray-600 italic text-xs">—</span>
                        : <div className="flex flex-wrap gap-1">
                            {bureau.map(r => (
                              <span key={r.key}
                                className={`inline-flex items-center gap-0.5 ${r.chipBg} ${r.chipText} text-[10px] font-inter font-semibold px-1.5 py-0.5 rounded`}
                                title={r.label}>
                                {r.emoji} {r.short}
                              </span>
                            ))}
                          </div>}
                    </td>
                    <td>
                      {comites.length === 0
                        ? <span className="text-gray-600 italic text-xs">—</span>
                        : <div className="flex flex-wrap gap-1">
                            {comites.map(r => (
                              <span key={r.key}
                                className={`inline-flex items-center gap-0.5 ${r.chipBg} ${r.chipText} text-[10px] font-inter font-semibold px-1.5 py-0.5 rounded`}
                                title={r.label}>
                                {r.emoji} {r.short}
                              </span>
                            ))}
                          </div>}
                    </td>
                    <td className="text-xs text-gray-400">{m.status}</td>
                    <td className="text-xs text-gray-500">{formatDate(m.createdAt, 'dd MMM yyyy')}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* CTA retour liste */}
      <div className="mt-6 text-center">
        <Link href="/admin/members"
          className="text-xs text-gray-500 hover:text-major-accent font-inter transition-colors">
          Promouvoir d'autres adhérents en membres → /admin/members
        </Link>
      </div>
    </div>
  )
}

function Kpi({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className={`rounded-xl border p-3 ${
      accent
        ? 'bg-major-primary/10 border-major-primary/40'
        : 'bg-major-surface border-gray-800'
    }`}>
      <p className="text-[10px] font-inter uppercase tracking-widest text-gray-400">{label}</p>
      <p className={`font-bebas text-2xl tracking-wider mt-1 ${accent ? 'text-major-accent' : 'text-white'}`}>
        {value}
      </p>
    </div>
  )
}
