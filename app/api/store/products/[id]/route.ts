import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const db = prisma as any
type Params = { params: { id: string } }

const list = (v: unknown) =>
  Array.isArray(v) ? v.map(x => String(x).trim()).filter(Boolean).slice(0, 20) : undefined

// PATCH — admin : prix coûtant, activation, textes, tailles
export async function PATCH(req: Request, { params }: Params) {
  const session = await auth()
  if (!session || session.user.role?.toLowerCase() !== 'admin')
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const data: any = {}

  if (body.price !== undefined) {
    if (body.price === null || body.price === '') data.price = null
    else {
      const n = Number(String(body.price).replace(',', '.'))
      if (!Number.isFinite(n) || n < 0 || n > 100000)
        return NextResponse.json({ error: 'Prix invalide' }, { status: 400 })
      data.price = Math.round(n * 100) / 100
    }
  }
  if (typeof body.active === 'boolean') data.active = body.active
  for (const k of ['name', 'nameAr', 'description', 'descriptionAr'] as const) {
    if (typeof body[k] === 'string') {
      const v = body[k].trim()
      if (!v && (k === 'name' || k === 'description'))
        return NextResponse.json({ error: 'Le nom et la description sont obligatoires' }, { status: 400 })
      data[k] = v || null
    }
  }
  for (const k of ['sizes', 'features', 'featuresAr'] as const) {
    const v = list(body[k]); if (v) data[k] = v
  }

  try {
    const product = await db.storeProduct.update({ where: { id: params.id }, data })
    return NextResponse.json({ product })
  } catch {
    return NextResponse.json({ error: 'Article introuvable' }, { status: 404 })
  }
}
