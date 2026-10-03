import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Receipt, Plus, TrendingDown, Calendar } from 'lucide-react'
import { formatDate, formatCurrency } from '@/lib/utils'
import {
  EXPENSE_CATEGORIES, EXPENSE_GROUPS,
  getExpenseCategory, getPaymentMethod,
  categoriesByGroup,
  type ExpenseCategoryKey, type ExpenseGroupKey,
} from '@/lib/expenses'
import { ExpenseActions } from './expense-actions'
import { ExpenseExportButton } from './export-button'

export const dynamic = 'force-dynamic'

interface Props {
  searchParams: {
    category?: string
    group?:    string
    dateFrom?: string
    dateTo?:   string
    search?:   string
  }
}

export default async function AdminExpensesPage({ searchParams }: Props) {
  const { category, group, dateFrom, dateTo, search } = searchParams

  // Filtre par groupe : on étend aux catégories du groupe
  const groupCategories = group
    ? categoriesByGroup(group as ExpenseGroupKey).map(c => c.key)
    : null

  const where: any = {
    ...(category ? { category: category as any } : {}),
    ...(groupCategories && !category ? { category: { in: groupCategories } } : {}),
    ...((dateFrom || dateTo) ? {
      date: {
        ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
        ...(dateTo   ? { lte: new Date(dateTo) }   : {}),
      },
    } : {}),
    ...(search ? {
      OR: [
        { description: { contains: search, mode: 'insensitive' } },
        { supplier:    { contains: search, mode: 'insensitive' } },
        { notes:       { contains: search, mode: 'insensitive' } },
      ],
    } : {}),
  }

  const [expenses, totalAgg, countByGroup] = await Promise.all([
    (prisma as any).expense.findMany({
      where,
      include: {
        event:      { select: { id: true, title: true } },
        recordedBy: { select: { email: true } },
      },
      orderBy: { date: 'desc' },
    }),
    (prisma as any).expense.aggregate({ where, _sum: { amount: true } }),
    (prisma as any).expense.groupBy({ by: ['category'], _sum: { amount: true }, _count: true }),
  ])

  const totalFiltered = totalAgg._sum?.amount ?? 0

  // Agrégats par groupe pour les 4 cartes
  const groupTotals: Record<ExpenseGroupKey, { amount: number; count: number }> = {
    TRAINING: { amount: 0, count: 0 }, EVENT: { amount: 0, count: 0 },
    EQUIPMENT: { amount: 0, count: 0 }, MISC: { amount: 0, count: 0 },
  }
  for (const row of countByGroup as Array<{ category: string; _sum: { amount: number | null }; _count: number }>) {
    const def = getExpenseCategory(row.category)
    if (!def) continue
    groupTotals[def.group].amount += row._sum.amount ?? 0
    groupTotals[def.group].count  += row._count
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <Receipt size={28} className="text-major-accent" />
            <h1 className="font-bebas text-4xl text-white tracking-widest">DÉPENSES</h1>
          </div>
          <p className="text-gray-400 font-inter text-sm mt-1">
            {expenses.length} dépense{expenses.length > 1 ? 's' : ''}
            {totalFiltered > 0 && (
              <> · Total filtré <span className="text-red-400 font-semibold">{formatCurrency(totalFiltered, 'MAD')}</span></>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExpenseExportButton
            expenses={expenses.map((e: any) => ({
              date:          e.date.toISOString(),
              category:      e.category,
              description:   e.description,
              amount:        e.amount,
              supplier:      e.supplier ?? '',
              paymentMethod: e.paymentMethod,
              event:         e.event?.title ?? '',
            }))}
          />
          <Link href="/admin/expenses/new" className="btn-primary text-sm px-5 py-2.5 flex items-center gap-2">
            <Plus size={14} /> Nouvelle dépense
          </Link>
        </div>
      </div>

      {/* Cartes par groupe */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {EXPENSE_GROUPS.map(g => {
          const t = groupTotals[g.key]
          return (
            <Link
              key={g.key}
              href={`/admin/expenses?group=${g.key}`}
              className={`card-dark hover:border-major-primary/50 transition-all ${
                group === g.key ? 'ring-2 ring-major-primary' : ''
              }`}
            >
              <div className="flex items-center gap-2 text-gray-400 text-[11px] font-inter uppercase tracking-widest mb-1.5">
                <span className="text-base">{g.emoji}</span> {g.label}
              </div>
              <p className="font-bebas text-2xl text-white tracking-wider">{formatCurrency(t.amount, 'MAD')}</p>
              <p className="text-gray-500 text-xs font-inter">{t.count} ligne{t.count > 1 ? 's' : ''}</p>
            </Link>
          )
        })}
      </div>

      {/* Filtres groupes + reset */}
      <div className="flex flex-wrap gap-2 mb-3">
        <Link href="/admin/expenses"
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-inter border transition-colors ${
            !group && !category
              ? 'bg-major-primary/20 border-major-primary text-major-accent font-semibold'
              : 'border-gray-800 text-gray-500 hover:border-gray-600 hover:text-white'
          }`}>
          Tous
        </Link>
        {EXPENSE_GROUPS.map(g => (
          <Link key={g.key}
            href={`/admin/expenses?group=${g.key}`}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-inter border transition-colors ${
              group === g.key
                ? 'bg-major-primary/20 border-major-primary text-major-accent font-semibold'
                : 'border-gray-800 text-gray-500 hover:border-gray-600 hover:text-white'
            }`}>
            <span>{g.emoji}</span> {g.label}
          </Link>
        ))}
      </div>

      {/* Filtres catégories détaillées (si un groupe est sélectionné) */}
      {group && (
        <div className="flex flex-wrap gap-2 mb-6">
          {categoriesByGroup(group as ExpenseGroupKey).map(c => (
            <Link key={c.key}
              href={`/admin/expenses?group=${group}&category=${c.key}`}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-inter border transition-colors ${
                category === c.key
                  ? `${c.chipBg} ${c.chipBorder} ${c.chipText} font-semibold`
                  : 'border-gray-800 text-gray-500 hover:border-gray-600 hover:text-white'
              }`}>
              <span>{c.emoji}</span> {c.label}
            </Link>
          ))}
        </div>
      )}

      {/* Tableau */}
      <div className="card-dark overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="table-dark">
            <thead>
              <tr>
                <th>Date</th>
                <th>Catégorie</th>
                <th>Description</th>
                <th>Fournisseur</th>
                <th>Événement</th>
                <th className="text-right">Montant</th>
                <th>Mode</th>
                <th>Reçu</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-gray-600 font-inter">
                    Aucune dépense enregistrée.
                    <br />
                    <Link href="/admin/expenses/new" className="text-major-accent underline text-xs mt-2 inline-block">
                      En créer une →
                    </Link>
                  </td>
                </tr>
              )}
              {expenses.map((e: any) => {
                const cat = getExpenseCategory(e.category)
                const pm  = getPaymentMethod(e.paymentMethod)
                return (
                  <tr key={e.id}>
                    <td className="text-gray-400 text-xs">{formatDate(e.date, 'dd MMM yyyy')}</td>
                    <td>
                      {cat ? (
                        <span className={`inline-flex items-center gap-1 ${cat.chipBg} ${cat.chipText} border ${cat.chipBorder} text-[10px] font-inter font-semibold px-1.5 py-0.5 rounded`}
                              title={cat.label}>
                          <span>{cat.emoji}</span> {cat.short}
                        </span>
                      ) : <span className="text-gray-600 italic">—</span>}
                    </td>
                    <td className="text-white text-sm max-w-[260px] truncate" title={e.description}>{e.description}</td>
                    <td className="text-gray-400 text-xs">{e.supplier ?? '—'}</td>
                    <td className="text-gray-400 text-xs">
                      {e.event ? (
                        <Link href={`/admin/events/${e.event.id}`} className="text-major-cyan hover:text-major-accent underline">
                          {e.event.title}
                        </Link>
                      ) : '—'}
                    </td>
                    <td className="text-right font-oswald text-red-400 font-bold">
                      -{formatCurrency(e.amount, 'MAD')}
                    </td>
                    <td className="text-gray-400 text-xs">
                      {pm ? <>{pm.emoji} {pm.label}</> : '—'}
                    </td>
                    <td>
                      {e.receiptUrl
                        ? <a href={e.receiptUrl} target="_blank" rel="noopener noreferrer"
                             className="text-major-accent hover:text-major-primary text-xs underline">voir</a>
                        : <span className="text-gray-700 text-xs">—</span>}
                    </td>
                    <td>
                      <ExpenseActions id={e.id} description={e.description} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
