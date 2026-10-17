import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { STORE_ORDER_STATUSES } from '@/lib/store'

export const dynamic = 'force-dynamic'

const db = prisma as any
type Params = { params: { id: string } }

// PATCH — admin : statut / note interne. Adhérent : annuler sa commande tant qu'elle est « Reçue ».
export async function PATCH(req: Request, { params }: Params) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const isAdmin = session.user.role?.toLowerCase() === 'admin'

  const order = await db.storeOrder.findUnique({ where: { id: params.id } })
  if (!order) return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 })

  const body = await req.json().catch(() => ({}))
  const { status, adminNote } = body ?? {}

  if (!isAdmin) {
    const own = session.user.profileId && order.memberId === session.user.profileId
    if (!own) return NextResponse.json({ error: 'Interdit' }, { status: 403 })
    if (status !== 'CANCELLED' || order.status !== 'NEW')
      return NextResponse.json({ error: 'Cette commande ne peut plus être annulée : contacte le club.' }, { status: 400 })
    const updated = await db.storeOrder.update({ where: { id: order.id }, data: { status: 'CANCELLED' } })
    return NextResponse.json({ order: updated })
  }

  const data: any = {}
  if (status !== undefined) {
    if (!STORE_ORDER_STATUSES.some(s => s.key === status))
      return NextResponse.json({ error: 'Statut invalide' }, { status: 400 })
    data.status = status
  }
  if (adminNote !== undefined) data.adminNote = typeof adminNote === 'string' && adminNote.trim() ? adminNote.trim().slice(0, 1000) : null

  const updated = await db.storeOrder.update({ where: { id: order.id }, data })
  return NextResponse.json({ order: updated })
}
