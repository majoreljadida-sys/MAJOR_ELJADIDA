'use client'

import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell,
} from 'recharts'
import { Users, UserPlus, CreditCard, TrendingUp, Activity, Target } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { SPORT_LEVELS } from '@/lib/sport-levels'
import { MOTIVATIONS } from '@/lib/motivations'

interface Props {
  adhesionsData:   { mois: string; nouveaux: number; total: number }[]
  paymentsData:    { mois: string; montant: number }[]
  stravaData:      { mois: string; km: number }[]
  levelsData:      { niveau: string; nombre: number }[]
  motivationsData: { motivation: string; nombre: number }[]
  totals: { members: number; active: number; pending: number; revenue: number }
}

const LEVEL_COLORS: Record<string, string> = {
  DEBUTANT:      '#22c55e',
  INTERMEDIAIRE: '#3b82f6',
  CONFIRME:      '#f97316',
  COMPETITEUR:   '#ef4444',
}
const MOTIVATION_COLORS: Record<string, string> = {
  HEALTH:      '#10b981',
  WEIGHT_LOSS: '#f59e0b',
  PERFORMANCE: '#8b5cf6',
  RACE_PREP:   '#06b6d4',
}

export function StatsClient({
  adhesionsData, paymentsData, stravaData, levelsData, motivationsData, totals,
}: Props) {
  return (
    <div className="p-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-bebas text-4xl text-white tracking-widest">STATISTIQUES DU CLUB</h1>
        <p className="text-gray-400 font-inter text-sm mt-1">
          Tendances sur les 12 derniers mois · Données live depuis la base de données
        </p>
      </div>

      {/* ── KPIs globaux ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KPI icon={Users}     label="Membres total"  value={totals.members}            color="text-major-accent" />
        <KPI icon={UserPlus}  label="Membres actifs" value={totals.active}             color="text-emerald-400"  />
        <KPI icon={Activity}  label="En attente"     value={totals.pending}            color="text-amber-400"    />
        <KPI icon={CreditCard} label="Revenu encaissé" value={formatCurrency(totals.revenue, 'MAD')} color="text-major-cyan" small />
      </div>

      {/* ── Adhésions sur 12 mois ────────────────────────────── */}
      <Card title="Adhésions cumulées sur 12 mois" icon={TrendingUp}>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={adhesionsData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="g-total" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"  stopColor="#2d8c6e" stopOpacity={0.6} />
                <stop offset="100%" stopColor="#2d8c6e" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis dataKey="mois" stroke="#6b7280" tick={{ fontSize: 11 }} />
            <YAxis stroke="#6b7280" tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Area type="monotone" dataKey="total" name="Total cumulé" stroke="#4ecca3" strokeWidth={2} fill="url(#g-total)" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* ── Nouveaux inscrits par mois ───────────────────────── */}
      <Card title="Nouveaux inscrits par mois" icon={UserPlus} className="mt-6">
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={adhesionsData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis dataKey="mois" stroke="#6b7280" tick={{ fontSize: 11 }} />
            <YAxis stroke="#6b7280" tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="nouveaux" name="Nouveaux inscrits" fill="#4ecca3" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* ── Paiements par mois ──────────────────────────────── */}
      <Card title="Paiements encaissés par mois (MAD)" icon={CreditCard} className="mt-6">
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={paymentsData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis dataKey="mois" stroke="#6b7280" tick={{ fontSize: 11 }} />
            <YAxis stroke="#6b7280" tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => `${v} MAD`} />
            <Bar dataKey="montant" name="Montant encaissé" fill="#3b82f6" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* ── Km de course (Strava) par mois ──────────────────── */}
      <Card title="Km de course captés par mois (Strava)" icon={Activity} className="mt-6">
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={stravaData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="g-strava" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"  stopColor="#FC4C02" stopOpacity={0.6} />
                <stop offset="100%" stopColor="#FC4C02" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis dataKey="mois" stroke="#6b7280" tick={{ fontSize: 11 }} />
            <YAxis stroke="#6b7280" tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => `${v} km`} />
            <Area type="monotone" dataKey="km" name="Km cumulés" stroke="#FC4C02" strokeWidth={2} fill="url(#g-strava)" />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* ── Répartitions (camemberts) ───────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Niveau sportif */}
        <Card title="Répartition par niveau sportif" icon={Activity}>
          {levelsData.length === 0 ? (
            <p className="text-gray-500 text-sm font-inter text-center py-8">
              Aucun niveau renseigné pour l'instant.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={levelsData}
                  dataKey="nombre"
                  nameKey="niveau"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ niveau, nombre }) => {
                    const def = SPORT_LEVELS.find(l => l.key === niveau)
                    return `${def?.label ?? niveau}: ${nombre}`
                  }}
                  labelLine={false}
                >
                  {levelsData.map(d => (
                    <Cell key={d.niveau} fill={LEVEL_COLORS[d.niveau] ?? '#888'} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Objectif personnel */}
        <Card title="Répartition par objectif personnel" icon={Target}>
          {motivationsData.length === 0 ? (
            <p className="text-gray-500 text-sm font-inter text-center py-8">
              Aucun objectif renseigné pour l'instant.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={motivationsData}
                  dataKey="nombre"
                  nameKey="motivation"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ motivation, nombre }) => {
                    const def = MOTIVATIONS.find(m => m.key === motivation)
                    return `${def?.label ?? motivation}: ${nombre}`
                  }}
                  labelLine={false}
                >
                  {motivationsData.map(d => (
                    <Cell key={d.motivation} fill={MOTIVATION_COLORS[d.motivation] ?? '#888'} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* Note Vercel Analytics */}
      <div className="mt-8 p-4 bg-major-surface border border-major-primary/20 rounded-xl">
        <p className="text-gray-400 text-xs font-inter leading-relaxed">
          📈 <b className="text-white">Audience du site</b> (visiteurs, pages vues, sources) :
          consultable directement sur Vercel →{' '}
          <a href="https://vercel.com/majoreljadida-sys-projects/major-eljadida/analytics"
            target="_blank" rel="noopener noreferrer"
            className="text-major-accent hover:text-major-cyan underline">
            Analytics
          </a>
          {' '}— activé sur la prod via @vercel/analytics.
        </p>
      </div>
    </div>
  )
}

// ─── Composants utilitaires ──────────────────────────────────
function KPI({ icon: Icon, label, value, color, small }: {
  icon: React.ElementType; label: string; value: string | number; color: string; small?: boolean
}) {
  return (
    <div className="card-dark">
      <Icon size={18} className={`${color} mb-3`} />
      <p className="text-gray-500 text-xs font-inter uppercase tracking-widest mb-1">{label}</p>
      <p className={`font-oswald font-bold ${color} ${small ? 'text-base' : 'text-2xl'}`}>{value}</p>
    </div>
  )
}

function Card({ title, icon: Icon, children, className = '' }: {
  title: string; icon: React.ElementType; children: React.ReactNode; className?: string
}) {
  return (
    <div className={`card-dark ${className}`}>
      <h2 className="font-oswald text-white text-lg uppercase tracking-wide mb-4 flex items-center gap-2">
        <Icon size={18} className="text-major-accent" /> {title}
      </h2>
      {children}
    </div>
  )
}

const tooltipStyle = {
  backgroundColor: '#1A1A2E',
  border: '1px solid #2D8C6E60',
  borderRadius: 8,
  fontFamily: 'Inter, sans-serif',
  fontSize: 12,
}
