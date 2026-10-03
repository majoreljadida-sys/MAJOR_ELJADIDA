'use client'

import Link from 'next/link'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import {
  TrendingUp, TrendingDown, Wallet, Scale, Users, Receipt, Calendar, ChevronRight,
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { getExpenseCategory } from '@/lib/expenses'

interface Props {
  totals: {
    revenue:          number
    pending:          number
    expenses:         number
    netBalance:       number
    activeMembers:    number
    currentMonthRev:  number
    currentMonthExp:  number
  }
  flowData:   { mois: string; recettes: number; depenses: number; solde: number }[]
  categoryData: {
    key:    string; label: string; emoji: string; color: string
    amount: number; count:  number
  }[]
  groupData: {
    group: string; label: string; emoji: string; color: string; amount: number
  }[]
  eventCostData: {
    eventId: string | null; title: string; date: string | null
    amount: number; count: number
  }[]
  recentExpenses: {
    id: string; date: string; category: string; description: string
    amount: number; eventTitle: string | null; recordedBy: string | null
  }[]
}

export function FinancesClient({
  totals, flowData, categoryData, groupData, eventCostData, recentExpenses,
}: Props) {
  const netPositive = totals.netBalance >= 0
  const monthNet    = totals.currentMonthRev - totals.currentMonthExp

  return (
    <div className="p-8 max-w-7xl">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <Scale size={28} className="text-major-accent" />
            <h1 className="font-bebas text-4xl text-white tracking-widest">CONTRÔLE DE GESTION</h1>
          </div>
          <p className="text-gray-400 font-inter text-sm mt-1">
            Vue d&apos;ensemble des flux financiers de l&apos;association.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/expenses" className="btn-secondary text-sm px-4 py-2 flex items-center gap-2">
            <Receipt size={14} /> Dépenses
          </Link>
          <Link href="/admin/payments" className="btn-secondary text-sm px-4 py-2 flex items-center gap-2">
            <Wallet size={14} /> Paiements
          </Link>
        </div>
      </div>

      {/* KPIs principaux */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Kpi icon={TrendingUp}  label="Revenus encaissés"  value={formatCurrency(totals.revenue, 'MAD')}  color="text-emerald-400" />
        <Kpi icon={TrendingDown} label="Dépenses totales"  value={formatCurrency(totals.expenses, 'MAD')} color="text-red-400" />
        <Kpi
          icon={Scale} label="Solde net"
          value={formatCurrency(totals.netBalance, 'MAD')}
          color={netPositive ? 'text-major-accent' : 'text-red-400'}
          sub={netPositive ? '✓ Positif' : '⚠ Déficitaire'}
        />
        <Kpi icon={Users} label="Membres actifs" value={String(totals.activeMembers)} color="text-major-cyan" />
      </div>

      {/* KPIs du mois en cours */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
        <Kpi icon={TrendingUp}  label="Revenus du mois"  value={formatCurrency(totals.currentMonthRev, 'MAD')} color="text-emerald-300" small />
        <Kpi icon={TrendingDown} label="Dépenses du mois" value={formatCurrency(totals.currentMonthExp, 'MAD')} color="text-red-300" small />
        <Kpi icon={Scale}       label="Résultat du mois"
             value={formatCurrency(monthNet, 'MAD')}
             color={monthNet >= 0 ? 'text-major-accent' : 'text-red-400'} small />
      </div>

      {/* Chart recettes vs dépenses */}
      <Card title="Flux financiers — 12 derniers mois" icon={Calendar}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={flowData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="mois" stroke="#9ca3af" fontSize={11} />
            <YAxis stroke="#9ca3af" fontSize={11} />
            <Tooltip
              contentStyle={{ background: '#0a0a0a', border: '1px solid #374151', borderRadius: 8, fontSize: 12 }}
              formatter={(v: number) => formatCurrency(v, 'MAD')}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="recettes" fill="#10b981" name="Recettes" radius={[4, 4, 0, 0]} />
            <Bar dataKey="depenses" fill="#ef4444" name="Dépenses" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Évolution du solde cumulé */}
      <Card title="Solde net par mois" icon={Scale} className="mt-4">
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={flowData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="mois" stroke="#9ca3af" fontSize={11} />
            <YAxis stroke="#9ca3af" fontSize={11} />
            <Tooltip
              contentStyle={{ background: '#0a0a0a', border: '1px solid #374151', borderRadius: 8, fontSize: 12 }}
              formatter={(v: number) => formatCurrency(v, 'MAD')}
            />
            <Line type="monotone" dataKey="solde" stroke="#4ecca3" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* 2 colonnes : Pie chart catégories + Top événements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <Card title="Répartition des dépenses par catégorie" icon={Receipt}>
          {categoryData.length === 0 ? (
            <p className="text-gray-500 text-sm font-inter text-center py-10">
              Aucune dépense enregistrée pour le moment.
            </p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={categoryData} dataKey="amount" nameKey="label" cx="50%" cy="50%" outerRadius={90}
                       label={({ emoji, amount }) => `${emoji} ${amount}`}>
                    {categoryData.map(c => <Cell key={c.key} fill={c.color} />)}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#0a0a0a', border: '1px solid #374151', borderRadius: 8, fontSize: 12 }}
                    formatter={(v: number) => formatCurrency(v, 'MAD')}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-3 space-y-1 text-xs font-inter">
                {categoryData.map(c => {
                  const pct = totals.expenses > 0 ? (c.amount / totals.expenses) * 100 : 0
                  return (
                    <div key={c.key} className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-sm" style={{ background: c.color }} />
                      <span className="text-gray-300 flex-1">{c.emoji} {c.label}</span>
                      <span className="text-gray-400">{formatCurrency(c.amount, 'MAD')}</span>
                      <span className="text-gray-600 w-10 text-right">{pct.toFixed(0)}%</span>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </Card>

        <Card title="Top événements par coût" icon={Calendar}>
          {eventCostData.length === 0 ? (
            <p className="text-gray-500 text-sm font-inter text-center py-10">
              Aucune dépense liée à un événement.
            </p>
          ) : (
            <div className="space-y-2">
              {eventCostData.map(ec => (
                <Link key={ec.eventId}
                  href={ec.eventId ? `/admin/events/${ec.eventId}` : '/admin/expenses'}
                  className="flex items-center justify-between gap-3 py-2 px-3 rounded-lg border border-gray-800 hover:border-major-primary/40 hover:bg-major-primary/5 transition-all">
                  <div className="min-w-0 flex-1">
                    <p className="text-white font-inter text-sm font-medium truncate">{ec.title}</p>
                    <p className="text-gray-500 text-[11px] font-inter">
                      {ec.date && formatDate(ec.date, 'dd MMM yyyy')} · {ec.count} dépense{ec.count > 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-oswald text-red-400 font-bold">{formatCurrency(ec.amount, 'MAD')}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Groupes de dépenses — barres horizontales simples */}
      {groupData.length > 0 && (
        <Card title="Dépenses par grand groupe" icon={Receipt} className="mt-4">
          <div className="space-y-3">
            {groupData.map(g => {
              const pct = totals.expenses > 0 ? (g.amount / totals.expenses) * 100 : 0
              return (
                <div key={g.group}>
                  <div className="flex items-center justify-between text-sm font-inter mb-1">
                    <span className="text-white">{g.emoji} {g.label}</span>
                    <span className="text-gray-400">
                      {formatCurrency(g.amount, 'MAD')} · <span className="text-gray-600">{pct.toFixed(1)}%</span>
                    </span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: g.color }} />
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* Dépenses récentes */}
      <Card title="Dernières dépenses" icon={Receipt} className="mt-4">
        {recentExpenses.length === 0 ? (
          <p className="text-gray-500 text-sm font-inter text-center py-6">
            Aucune dépense récente.
          </p>
        ) : (
          <div className="overflow-x-auto -mx-5">
            <table className="table-dark text-sm">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Catégorie</th>
                  <th>Description</th>
                  <th>Événement</th>
                  <th className="text-right">Montant</th>
                </tr>
              </thead>
              <tbody>
                {recentExpenses.map(e => {
                  const cat = getExpenseCategory(e.category)
                  return (
                    <tr key={e.id}>
                      <td className="text-gray-400 text-xs">{formatDate(e.date, 'dd MMM yyyy')}</td>
                      <td>
                        {cat && (
                          <span className={`inline-flex items-center gap-1 ${cat.chipBg} ${cat.chipText} border ${cat.chipBorder} text-[10px] font-inter font-semibold px-1.5 py-0.5 rounded`}>
                            <span>{cat.emoji}</span> {cat.short}
                          </span>
                        )}
                      </td>
                      <td className="text-white text-sm max-w-[280px] truncate">{e.description}</td>
                      <td className="text-gray-400 text-xs">{e.eventTitle ?? '—'}</td>
                      <td className="text-right font-oswald text-red-400 font-bold">-{formatCurrency(e.amount, 'MAD')}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
        <div className="mt-3 text-right">
          <Link href="/admin/expenses"
            className="text-xs text-major-accent hover:text-major-primary font-inter inline-flex items-center gap-1">
            Voir toutes les dépenses <ChevronRight size={11} />
          </Link>
        </div>
      </Card>
    </div>
  )
}

function Kpi({ icon: Icon, label, value, color, sub, small }: {
  icon: any; label: string; value: string; color: string; sub?: string; small?: boolean
}) {
  return (
    <div className="card-dark">
      <div className="flex items-center gap-2 mb-1.5">
        <Icon size={14} className={color} />
        <p className="text-gray-400 text-[10px] font-inter uppercase tracking-widest">{label}</p>
      </div>
      <p className={`font-bebas ${small ? 'text-xl' : 'text-3xl'} tracking-wider ${color}`}>{value}</p>
      {sub && <p className="text-[11px] font-inter mt-0.5 text-gray-400">{sub}</p>}
    </div>
  )
}

function Card({ title, icon: Icon, children, className = '' }: {
  title: string; icon: any; children: React.ReactNode; className?: string
}) {
  return (
    <div className={`card-dark ${className}`}>
      <h2 className="font-oswald text-white text-base uppercase tracking-wide mb-4 flex items-center gap-2">
        <Icon size={16} className="text-major-primary" /> {title}
      </h2>
      {children}
    </div>
  )
}
