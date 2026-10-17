import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import type { StoreProductDTO } from '@/lib/store'
import { StoreClient } from './store-client'

export const metadata: Metadata = {
  title:       'Store — Club MAJOR',
  description: 'Tenues et accessoires du Club MAJOR, vendus à prix coûtant aux adhérents et membres.',
}
export const dynamic = 'force-dynamic'

export default async function StorePage() {
  const session = await auth().catch(() => null)

  let products: StoreProductDTO[] = []
  try {
    const rows = await (prisma as any).storeProduct.findMany({
      where:   { active: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    })
    products = rows.map((p: any) => ({
      id: p.id, slug: p.slug, category: p.category,
      name: p.name, nameAr: p.nameAr,
      description: p.description, descriptionAr: p.descriptionAr,
      features: p.features ?? [], featuresAr: p.featuresAr ?? [],
      sizes: p.sizes ?? [], price: p.price, image: p.image, imageBack: p.imageBack,
    }))
  } catch (e) {
    console.error('[store] produits indisponibles :', e)
  }

  // Seuls les comptes adhérents / membres actifs peuvent commander
  let access: 'guest' | 'member' | 'blocked' | 'other' = 'guest'
  if (session) {
    access = 'other'
    if (session.user.role?.toLowerCase() === 'member' && session.user.profileId) {
      const m = await prisma.member.findUnique({
        where: { id: session.user.profileId }, select: { status: true },
      }).catch(() => null)
      access = !m ? 'other' : (m.status === 'SUSPENDED' || m.status === 'INACTIVE') ? 'blocked' : 'member'
    }
  }

  return <StoreClient products={products} access={access} />
}
