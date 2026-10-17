import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ShoppingBag } from 'lucide-react'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatDatetime } from '@/lib/utils'
import { formatMAD, getOrderStatus } from '@/lib/store'
import { CancelOrderButton } from './cancel-button'

export const dynamic = 'force-dynamic'

export default async function MemberOrdersPage() {
  const session = await auth()
  if (!session?.user?.profileId) redirect('/login?callbackUrl=/member/commandes')

  const orders = await (prisma as any).storeOrder.findMany({
    where:   { memberId: session.user.profileId },
    include: { items: { orderBy: { productName: 'asc' } } },
    orderBy: { createdAt: 'desc' },
  }).catch(() => [])

  return (
    <div className="p-4 sm:p-8">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-8">
        <h1 className="font-bebas text-4xl text-white tracking-widest">MES COMMANDES</h1>
        <Link href="/store" className="btn-primary text-sm px-4 py-2"><ShoppingBag size={14} /> Aller au Store</Link>
      </div>

      {(orders as any[]).length === 0 ? (
        <div className="card-dark text-center py-10">
          <p className="text-gray-400 font-inter">Tu n&apos;as pas encore passé de commande.</p>
          <p className="text-gray-500 text-sm font-inter mt-1">T-shirts, débardeurs, casquettes… à prix coûtant pour les adhérents.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {(orders as any[]).map(o => {
            const st = getOrderStatus(o.status)
            return (
              <article key={o.id} className="card-dark">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-major-accent text-sm">{o.reference}</span>
                    <span className={`badge ${st.color}`}>{st.label}</span>
                    <span className="text-gray-500 text-xs">{formatDatetime(o.createdAt)}</span>
                  </div>
                  <span className="font-bebas text-2xl text-major-accent tracking-wide">{formatMAD(o.total)}</span>
                </div>
                <ul className="mt-3 space-y-1">
                  {o.items.map((it: any) => (
                    <li key={it.id} className="flex justify-between text-sm font-inter text-gray-300">
                      <span>{it.quantity} × {it.productName}{it.size ? <span className="text-gray-500"> · {it.size}</span> : null}</span>
                      <span className="text-gray-400">{formatMAD(it.quantity * it.unitPrice)}</span>
                    </li>
                  ))}
                </ul>
                {o.status === 'NEW' && <CancelOrderButton id={o.id} />}
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
