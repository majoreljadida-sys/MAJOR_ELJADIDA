import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { StatsClient } from './stats-client'

export const dynamic = 'force-dynamic'

export default async function AdminStatsPage() {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') redirect('/login')

  // ── Fenêtre : 12 derniers mois ──────────────────────────────
  const now    = new Date()
  const start  = new Date(now)
  start.setMonth(start.getMonth() - 11)
  start.setDate(1); start.setHours(0, 0, 0, 0)

  // ── Adhésions par mois ──────────────────────────────────────
  const members = await prisma.member.findMany({
    where:  { createdAt: { gte: start } },
    select: { createdAt: true, status: true, sportLevel: true, motivations: true },
    orderBy: { createdAt: 'asc' },
  })

  // ── Paiements par mois ──────────────────────────────────────
  const payments = await prisma.payment.findMany({
    where:  { createdAt: { gte: start } },
    select: { createdAt: true, amount: true, status: true },
  })

  // ── Activités Strava par mois (si on a quelque chose) ──────
  const stravaActivities = await prisma.stravaActivity.findMany({
    where:  { observedAt: { gte: start } },
    select: { observedAt: true, distance: true, type: true },
  })

  // ── Visites du site sur 30 jours ────────────────────────────
  const since30 = new Date()
  since30.setDate(since30.getDate() - 29)
  since30.setHours(0, 0, 0, 0)
  const pageViews = await prisma.pageView.findMany({
    where:  { viewedAt: { gte: since30 } },
    select: { viewedAt: true, path: true },
  })

  // ── Totaux globaux ──────────────────────────────────────────
  const totalMembers       = await prisma.member.count()
  const activeMembers      = await prisma.member.count({ where: { status: 'ACTIVE' } })
  const pendingMembers     = await prisma.member.count({ where: { status: 'PENDING' } })
  const totalRevenueAgg    = await prisma.payment.aggregate({ where: { status: 'PAID' }, _sum: { amount: true } })
  const totalRevenue       = totalRevenueAgg._sum.amount ?? 0

  // ── Compter par mois ────────────────────────────────────────
  function monthKey(d: Date) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  }
  function monthLabel(d: Date) {
    return d.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' })
  }

  // Initialise tous les mois (même vides) pour avoir un graphique propre
  const monthsArr: { key: string; label: string; date: Date }[] = []
  for (let i = 0; i < 12; i++) {
    const d = new Date(start)
    d.setMonth(d.getMonth() + i)
    monthsArr.push({ key: monthKey(d), label: monthLabel(d), date: new Date(d) })
  }

  // Adhésions par mois
  const newPerMonth: Record<string, number> = {}
  for (const m of members) {
    const k = monthKey(m.createdAt)
    newPerMonth[k] = (newPerMonth[k] ?? 0) + 1
  }

  // Cumul adhésions (en remontant le temps)
  // On part du total avant la fenêtre puis on accumule
  const beforeStartCount = await prisma.member.count({ where: { createdAt: { lt: start } } })
  let cumul = beforeStartCount
  const adhesionsData = monthsArr.map(m => {
    const newM = newPerMonth[m.key] ?? 0
    cumul += newM
    return { mois: m.label, nouveaux: newM, total: cumul }
  })

  // Paiements par mois
  const paidPerMonth: Record<string, number> = {}
  for (const p of payments) {
    if (p.status !== 'PAID') continue
    const k = monthKey(p.createdAt)
    paidPerMonth[k] = (paidPerMonth[k] ?? 0) + p.amount
  }
  const paymentsData = monthsArr.map(m => ({
    mois:   m.label,
    montant: paidPerMonth[m.key] ?? 0,
  }))

  // Strava km par mois (course uniquement)
  const RUN_TYPES = new Set(['Run', 'TrailRun', 'VirtualRun', 'Walk', 'Hike'])
  const kmPerMonth: Record<string, number> = {}
  for (const a of stravaActivities) {
    if (!RUN_TYPES.has(a.type)) continue
    const k = monthKey(a.observedAt)
    kmPerMonth[k] = (kmPerMonth[k] ?? 0) + (a.distance / 1000)
  }
  const stravaData = monthsArr.map(m => ({
    mois: m.label,
    km:   Math.round(kmPerMonth[m.key] ?? 0),
  }))

  // Répartition par niveau sportif
  const levelsCount = await prisma.member.groupBy({
    by:       ['sportLevel'],
    _count:   { _all: true },
  })
  const levelsData = levelsCount
    .filter(l => l.sportLevel !== null)
    .map(l => ({ niveau: l.sportLevel as string, nombre: l._count._all }))

  // Répartition par objectif (un membre peut compter dans plusieurs catégories)
  const allMembersForMotiv = await prisma.member.findMany({
    select: { motivations: true },
  })
  const motivCounts: Record<string, number> = {}
  for (const m of allMembersForMotiv) {
    for (const k of m.motivations ?? []) {
      motivCounts[k] = (motivCounts[k] ?? 0) + 1
    }
  }
  const motivationsData = Object.entries(motivCounts).map(([motivation, nombre]) => ({
    motivation, nombre,
  }))

  // ── Visites par jour (30 derniers jours) ──────────────────
  function dayKey(d: Date) {
    return d.toISOString().slice(0, 10)  // "YYYY-MM-DD"
  }
  function dayLabel(d: Date) {
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
  }
  const daysArr: { key: string; label: string }[] = []
  for (let i = 0; i < 30; i++) {
    const d = new Date(since30); d.setDate(d.getDate() + i)
    daysArr.push({ key: dayKey(d), label: dayLabel(d) })
  }
  const viewsPerDay: Record<string, number> = {}
  for (const v of pageViews) {
    const k = dayKey(v.viewedAt)
    viewsPerDay[k] = (viewsPerDay[k] ?? 0) + 1
  }
  const visitsData = daysArr.map(d => ({
    jour:  d.label,
    vues:  viewsPerDay[d.key] ?? 0,
  }))
  const totalViews30 = pageViews.length

  // Top pages (30 derniers jours)
  const pathCount: Record<string, number> = {}
  for (const v of pageViews) {
    pathCount[v.path] = (pathCount[v.path] ?? 0) + 1
  }
  const topPages = Object.entries(pathCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([path, count]) => ({ path, count }))

  return (
    <StatsClient
      adhesionsData={adhesionsData}
      paymentsData={paymentsData}
      stravaData={stravaData}
      levelsData={levelsData}
      motivationsData={motivationsData}
      visitsData={visitsData}
      topPages={topPages}
      totalViews30={totalViews30}
      totals={{
        members: totalMembers,
        active:  activeMembers,
        pending: pendingMembers,
        revenue: totalRevenue,
      }}
    />
  )
}
