import Link from 'next/link'
import { ArrowLeft, Tags } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { ProductEditor } from './product-editor'

export const dynamic = 'force-dynamic'

export default async function AdminStoreArticlesPage() {
  const products = await (prisma as any).storeProduct.findMany({
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    include: { _count: { select: { items: true } } },
  }).catch(() => [])

  const missing = (products as any[]).filter(p => p.price === null).length

  return (
    <div className="p-4 sm:p-8">
      <Link href="/admin/store" className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-white font-inter mb-4">
        <ArrowLeft size={14} /> Commandes
      </Link>
      <div className="flex items-center gap-3">
        <Tags size={28} className="text-major-accent" />
        <h1 className="font-bebas text-4xl text-white tracking-widest">STORE — ARTICLES &amp; PRIX</h1>
      </div>
      <p className="text-gray-400 font-inter text-sm mt-1 mb-6">
        Saisis le <strong className="text-gray-200">prix d&apos;achat fournisseur</strong> : c&apos;est le prix de vente aux adhérents (aucun bénéfice).
        Un article sans prix reste visible mais ne peut pas être commandé.
        {missing > 0 && <span className="text-amber-300"> {missing} article{missing > 1 ? 's' : ''} sans prix.</span>}
      </p>

      {(products as any[]).length === 0 ? (
        <p className="text-gray-500 text-sm font-inter">Aucun article : lance <code>npx tsx scripts/setup-store.ts</code>.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {(products as any[]).map(p => (
            <ProductEditor key={p.id} product={{
              id: p.id, name: p.name, description: p.description, image: p.image,
              price: p.price, active: p.active, sizes: p.sizes ?? [], ordered: p._count?.items ?? 0,
            }} />
          ))}
        </div>
      )}
    </div>
  )
}
