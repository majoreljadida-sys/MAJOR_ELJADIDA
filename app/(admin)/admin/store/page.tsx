import Link from 'next/link'
import { ShoppingBag, Package, Inbox, Wallet, CheckCircle2, Tags } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { formatDatetime } from '@/lib/utils'
import { STORE_ORDER_STATUSES, OPEN_ORDER_STATUSES, formatMAD, getOrderStatus } from '@/lib/store'
import { OrderActions } from './order-actions'
import { GroupedExportButton } from './export-button'

export const dynamic = 'force-dynamic'

interface Props { searchParams: { status?: string } }

export default async function AdminStorePage({ searchParams }: Props) {
  const filter = searchParams.status ?? 'open'
  const db = prisma as any

  const where =
    filter === 'all'  ? {} :
    filter === 'open' ? { status: { in: OPEN_ORDER_STATUSES } } :
    { status: filter }

  const [orders, openOrders, statusCounts] = await Promise.all([
    db.storeOrder.findMany({
      where,
      include: {
        items:  { orderBy: { productName: 'asc' } },
        member: { select: { firstName: true, lastName: true, phone: true, user: { select: { email: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    db.storeOrder.findMany({
      where:   { status: { in: OPEN_ORDER_STATUSES } },
      include: { items: true },
    }),
    db.storeOrder.groupBy({ by: ['status'], _count: true, _sum: { total: true } }),
  ]).catch(() => [[], [], []])

  const stat = (k: string) => (statusCounts as any[]).find(r => r.status === k)
  const toCollect = ['NEW', 'CONFIRMED'].reduce((n, k) => n + (stat(k)?._sum.total ?? 0), 0)
  const collected = ['PAID', 'DELIVERED'].reduce((n, k) => n + (stat(k)?._sum.total ?? 0), 0)

  // Regroupement fournisseur : quantités par article et par taille (commandes en cours)
  const grouped = new Map<string, { name: string; sizes: Map<string, number>; qty: number; amount: number }>()
  for (const o of openOrders as any[]) for (const it of o.items) {
    const g = grouped.get(it.productId) ?? { name: it.productName, sizes: new Map(), qty: 0, amount: 0 }
    const sz = it.size ?? 'Unique'
    g.sizes.set(sz, (g.sizes.get(sz) ?? 0) + it.quantity)
    g.qty += it.quantity
    g.amount += it.quantity * it.unitPrice
    grouped.set(it.productId, g)
  }
  const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'S/M', 'L/XL', '39-42', '43-46', 'Unique']
  const groupedRows = Array.from(grouped.values())
    .sort((a, b) => a.name.localeCompare(b.name, 'fr'))
    .map(g => ({
      name: g.name, qty: g.qty, amount: g.amount,
      sizes: Array.from(g.sizes.entries()).sort((a, b) => SIZE_ORDER.indexOf(a[0]) - SIZE_ORDER.indexOf(b[0])),
    }))
  const groupedTotal = groupedRows.reduce((n, r) => n + r.amount, 0)

  const tabs = [
    { key: 'open', label: 'En cours' },
    ...STORE_ORDER_STATUSES.map(s => ({ key: s.key, label: s.label })),
    { key: 'all', label: 'Toutes' },
  ]

  return (
    <div className="p-4 sm:p-8">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <ShoppingBag size={28} className="text-major-accent" />
            <h1 className="font-bebas text-4xl text-white tracking-widest">STORE — COMMANDES</h1>
          </div>
          <p className="text-gray-400 font-inter text-sm mt-1">Articles vendus à prix coûtant aux adhérents et membres.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/store" target="_blank" className="btn-secondary text-sm px-4 py-2">Voir le Store</Link>
          <Link href="/admin/store/articles" className="btn-primary text-sm px-4 py-2"><Tags size={14} /> Articles &amp; prix</Link>
        </div>
      </div>

      {/* Indicateurs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {[
          { icon: Inbox,        label: 'Nouvelles commandes', value: String(stat('NEW')?._count ?? 0),       color: 'text-sky-300'     },
          { icon: Package,      label: 'Confirmées (à régler)', value: String(stat('CONFIRMED')?._count ?? 0), color: 'text-amber-300'   },
          { icon: Wallet,       label: 'Montant à encaisser', value: formatMAD(toCollect),                 color: 'text-major-accent' },
          { icon: CheckCircle2, label: 'Montant encaissé',    value: formatMAD(collected),                 color: 'text-emerald-300' },
        ].map(k => (
          <div key={k.label} className="card-dark">
            <k.icon size={18} className={k.color} />
            <p className={`font-bebas text-3xl tracking-wide mt-2 ${k.color}`}>{k.value}</p>
            <p className="text-gray-400 text-xs font-inter">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Regroupement fournisseur */}
      <section className="card-dark mb-8">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <div>
            <h2 className="font-bebas text-2xl text-white tracking-widest">COMMANDE GROUPÉE FOURNISSEUR</h2>
            <p className="text-gray-400 text-xs font-inter">Quantités à commander : commandes reçues, confirmées et réglées (hors remises et annulées).</p>
          </div>
          <GroupedExportButton rows={groupedRows.map(r => ({ name: r.name, sizes: r.sizes, qty: r.qty, amount: r.amount }))} />
        </div>
        {groupedRows.length === 0 ? (
          <p className="text-gray-500 text-sm font-inter">Aucune commande en cours.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-dark">
              <thead><tr><th>Article</th><th>Tailles × quantités</th><th className="text-right">Qté</th><th className="text-right">Montant</th></tr></thead>
              <tbody>
                {groupedRows.map(r => (
                  <tr key={r.name}>
                    <td className="px-4 py-3 text-white font-medium">{r.name}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {r.sizes.map(([sz, q]) => (
                          <span key={sz} className="badge bg-major-primary/10 border-major-primary/30 text-gray-200">
                            {sz} <span className="text-major-accent font-bold ms-1">×{q}</span>
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-white font-bold">{r.qty}</td>
                    <td className="px-4 py-3 text-right text-major-accent">{formatMAD(r.amount)}</td>
                  </tr>
                ))}
                <tr>
                  <td className="px-4 py-3 text-gray-300 font-semibold" colSpan={2}>Total</td>
                  <td className="px-4 py-3 text-right text-white font-bold">{groupedRows.reduce((n, r) => n + r.qty, 0)}</td>
                  <td className="px-4 py-3 text-right text-major-accent font-bold">{formatMAD(groupedTotal)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Commandes */}
      <div className="flex flex-wrap gap-2 mb-4">
        {tabs.map(tab => (
          <Link key={tab.key} href={`/admin/store?status=${tab.key}`}
            className={`px-3 py-1.5 rounded-full text-xs font-inter font-medium border ${
              filter === tab.key ? 'bg-major-primary text-white border-major-primary' : 'text-gray-300 border-gray-700 hover:border-major-primary/60'
            }`}>
            {tab.label}{tab.key !== 'open' && tab.key !== 'all' && stat(tab.key) ? ` (${stat(tab.key)._count})` : ''}
          </Link>
        ))}
      </div>

      {(orders as any[]).length === 0 ? (
        <p className="text-gray-500 text-sm font-inter">Aucune commande.</p>
      ) : (
        <div className="space-y-3">
          {(orders as any[]).map(o => {
            const st = getOrderStatus(o.status)
            return (
              <article key={o.id} className="card-dark">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-major-accent text-sm">{o.reference}</span>
                      <span className={`badge ${st.color}`}>{st.label}</span>
                      <span className="text-gray-500 text-xs">{formatDatetime(o.createdAt)}</span>
                    </div>
                    <p className="text-white font-inter font-semibold mt-1">{o.member.firstName} {o.member.lastName}</p>
                    <p className="text-gray-400 text-xs font-inter">
                      {o.member.phone ? <a href={`tel:${o.member.phone}`} className="hover:text-white">{o.member.phone}</a> : 'Pas de téléphone'}
                      {' · '}<a href={`mailto:${o.member.user.email}`} className="hover:text-white">{o.member.user.email}</a>
                    </p>
                  </div>
                  <p className="font-bebas text-3xl text-major-accent tracking-wide">{formatMAD(o.total)}</p>
                </div>

                <ul className="mt-3 grid sm:grid-cols-2 gap-x-6 gap-y-1">
                  {o.items.map((it: any) => (
                    <li key={it.id} className="flex justify-between gap-3 text-sm font-inter text-gray-300 border-b border-gray-800/60 py-1">
                      <span>{it.quantity} × {it.productName}{it.size ? <span className="text-gray-500"> · {it.size}</span> : null}</span>
                      <span className="text-gray-400">{formatMAD(it.quantity * it.unitPrice)}</span>
                    </li>
                  ))}
                </ul>
                {o.note && <p className="text-sm text-gray-300 font-inter mt-3 bg-black/20 border-s-2 border-major-primary px-3 py-2 rounded">💬 {o.note}</p>}

                <OrderActions id={o.id} status={o.status} adminNote={o.adminNote ?? ''} />
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
