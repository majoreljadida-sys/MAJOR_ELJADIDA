import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { FinancesClient } from './finances-client'
import { EXPENSE_CATEGORIES, EXPENSE_GROUPS, getExpenseCategory, type ExpenseGroupKey } from '@/lib/expenses'

export const dynamic = 'force-dynamic'

export default async function AdminFinancesPage() {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') redirect('/login')

  const now = new Date()

  // Fenêtre 12 derniers mois
  const start = new Date(now)
  start.setMonth(start.getMonth() - 11)
  start.setDate(1); start.setHours(0, 0, 0, 0)

  // Totaux globaux
  const [paymentsPaid, pendingPayments, expensesAll, membersCount] = await Promise.all([
    prisma.payment.aggregate({ where: { status: 'PAID' }, _sum: { amount: true } }),
    prisma.payment.aggregate({ where: { status: { in: ['PENDING', 'LATE'] } }, _sum: { amount: true } }),
    (prisma as any).expense.aggregate({ _sum: { amount: true } }),
    prisma.member.count({ where: { status: 'ACTIVE' } }),
  ])
  const totalRevenue  = paymentsPaid._sum.amount ?? 0
  const pendingAmount = pendingPayments._sum.amount ?? 0
  const totalExpenses = expensesAll._sum?.amount ?? 0
  const netBalance    = totalRevenue - totalExpenses

  // Mois courant
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const [currentRev, currentExp] = await Promise.all([
    prisma.payment.aggregate({ where: { status: 'PAID', paidDate: { gte: monthStart } }, _sum: { amount: true } }),
    (prisma as any).expense.aggregate({ where: { date: { gte: monthStart } }, _sum: { amount: true } }),
  ])
  const currentMonthRev = currentRev._sum.amount ?? 0
  const currentMonthExp = currentExp._sum?.amount ?? 0

  // Détail par mois (12 derniers mois)
  function monthKey(d: Date) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  }
  function monthLabel(d: Date) {
    return d.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' })
  }
  const months: { key: string; label: string }[] = []
  for (let i = 0; i < 12; i++) {
    const d = new Date(start); d.setMonth(d.getMonth() + i)
    months.push({ key: monthKey(d), label: monthLabel(d) })
  }

  const [paymentsPerMonth, expensesPerMonth, expensesByCategory, expensesByEvent] = await Promise.all([
    prisma.payment.findMany({
      where: { status: 'PAID', paidDate: { gte: start } },
      select: { paidDate: true, amount: true },
    }),
    (prisma as any).expense.findMany({
      where: { date: { gte: start } },
      select: { date: true, amount: true, category: true, eventId: true },
    }),
    (prisma as any).expense.groupBy({
      by: ['category'],
      _sum: { amount: true },
      _count: true,
    }),
    (prisma as any).expense.groupBy({
      by: ['eventId'],
      _sum: { amount: true },
      _count: true,
      where: { eventId: { not: null } },
    }),
  ])

  // Agrégats par mois
  const revByMonth: Record<string, number> = {}
  for (const p of paymentsPerMonth) {
    if (!p.paidDate) continue
    const k = monthKey(p.paidDate)
    revByMonth[k] = (revByMonth[k] ?? 0) + p.amount
  }
  const expByMonth: Record<string, number> = {}
  for (const e of expensesPerMonth as Array<{ date: Date; amount: number }>) {
    const k = monthKey(e.date)
    expByMonth[k] = (expByMonth[k] ?? 0) + e.amount
  }
  const flowData = months.map(m => ({
    mois:     m.label,
    recettes: Math.round(revByMonth[m.key] ?? 0),
    depenses: Math.round(expByMonth[m.key] ?? 0),
    solde:    Math.round((revByMonth[m.key] ?? 0) - (expByMonth[m.key] ?? 0)),
  }))

  // Pie chart catégories
  const categoryData = (expensesByCategory as Array<{ category: string; _sum: { amount: number | null }; _count: number }>)
    .map(c => {
      const def = getExpenseCategory(c.category)
      return {
        key:    c.category,
        label:  def?.label ?? c.category,
        emoji:  def?.emoji ?? '',
        color:  def?.color ?? '#64748b',
        amount: c._sum.amount ?? 0,
        count:  c._count,
      }
    })
    .filter(c => c.amount > 0)
    .sort((a, b) => b.amount - a.amount)

  // Groupes
  const groupData: { group: ExpenseGroupKey; label: string; emoji: string; color: string; amount: number }[] = []
  for (const g of EXPENSE_GROUPS) {
    const amount = categoryData
      .filter(c => getExpenseCategory(c.key)?.group === g.key)
      .reduce((s, c) => s + c.amount, 0)
    if (amount > 0) groupData.push({ group: g.key, label: g.label, emoji: g.emoji, color: g.color, amount })
  }

  // Top événements par coût
  const eventIds = (expensesByEvent as Array<{ eventId: string | null }>).map(e => e.eventId).filter(Boolean) as string[]
  const eventsMeta = eventIds.length
    ? await prisma.event.findMany({ where: { id: { in: eventIds } }, select: { id: true, title: true, date: true } })
    : []
  const eventsMap = new Map(eventsMeta.map(e => [e.id, e]))
  const eventCostData = (expensesByEvent as Array<{ eventId: string | null; _sum: { amount: number | null }; _count: number }>)
    .map(e => {
      const ev = e.eventId ? eventsMap.get(e.eventId) : null
      return {
        eventId:   e.eventId,
        title:     ev?.title ?? 'Événement inconnu',
        date:      ev?.date?.toISOString() ?? null,
        amount:    e._sum.amount ?? 0,
        count:     e._count,
      }
    })
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 10)

  // Dépenses récentes
  const recentExpenses = await (prisma as any).expense.findMany({
    orderBy: { date: 'desc' },
    take:    10,
    include: {
      event:      { select: { id: true, title: true } },
      recordedBy: { select: { email: true } },
    },
  })

  return (
    <FinancesClient
      totals={{
        revenue:         totalRevenue,
        pending:         pendingAmount,
        expenses:        totalExpenses,
        netBalance,
        activeMembers:   membersCount,
        currentMonthRev,
        currentMonthExp,
      }}
      flowData={flowData}
      categoryData={categoryData}
      groupData={groupData}
      eventCostData={eventCostData}
      recentExpenses={recentExpenses.map((e: any) => ({
        id:          e.id,
        date:        e.date.toISOString(),
        category:    e.category,
        description: e.description,
        amount:      e.amount,
        eventTitle:  e.event?.title ?? null,
        recordedBy:  e.recordedBy?.email ?? null,
      }))}
    />
  )
}
