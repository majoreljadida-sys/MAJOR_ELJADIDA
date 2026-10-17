import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { STORE_MAX_LINES, STORE_MAX_QUANTITY, STORE_FALLBACK_EMAIL } from '@/lib/store'
import { sendStoreOrderToClub, sendStoreOrderToMember } from '@/lib/email'

export const dynamic = 'force-dynamic'

const db = prisma as any

/** Prochaine référence CMD-AAAA-NNNN. */
async function nextReference() {
  const year   = new Date().getFullYear()
  const prefix = `CMD-${year}-`
  const last   = await db.storeOrder.findFirst({
    where:   { reference: { startsWith: prefix } },
    orderBy: { reference: 'desc' },
    select:  { reference: true },
  })
  const n = last ? parseInt(last.reference.slice(prefix.length), 10) + 1 : 1
  return `${prefix}${String(n).padStart(4, '0')}`
}

// POST — un adhérent / membre passe commande
export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Connecte-toi pour commander.' }, { status: 401 })
  if (session.user.role?.toLowerCase() !== 'member' || !session.user.profileId)
    return NextResponse.json({ error: 'Le Store est réservé aux adhérents et membres du club.' }, { status: 403 })

  const member = await prisma.member.findUnique({
    where:  { id: session.user.profileId },
    select: { id: true, firstName: true, lastName: true, phone: true, status: true, user: { select: { email: true } } },
  })
  if (!member) return NextResponse.json({ error: 'Profil adhérent introuvable.' }, { status: 403 })
  if (member.status === 'SUSPENDED' || member.status === 'INACTIVE')
    return NextResponse.json({ error: 'Ton adhésion n\'est pas active : contacte le club.' }, { status: 403 })

  let body: any
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 }) }

  const lines = Array.isArray(body?.items) ? body.items : []
  const note  = typeof body?.note === 'string' ? body.note.trim().slice(0, 1000) : ''
  if (lines.length === 0)              return NextResponse.json({ error: 'Ton panier est vide.' }, { status: 400 })
  if (lines.length > STORE_MAX_LINES)  return NextResponse.json({ error: 'Trop d\'articles dans une seule commande.' }, { status: 400 })

  const ids      = Array.from(new Set(lines.map((l: any) => String(l?.productId ?? ''))))
  const products = await db.storeProduct.findMany({ where: { id: { in: ids }, active: true } })
  const byId     = new Map<string, any>(products.map((p: any) => [p.id, p]))

  const items: { productId: string; productName: string; size: string | null; quantity: number; unitPrice: number }[] = []
  for (const l of lines) {
    const p   = byId.get(String(l?.productId ?? ''))
    const qty = Number(l?.quantity)
    if (!p) return NextResponse.json({ error: 'Un article n\'est plus disponible : recharge la page.' }, { status: 400 })
    if (p.price === null || p.price === undefined)
      return NextResponse.json({ error: `Le prix de « ${p.name} » n'est pas encore fixé.` }, { status: 400 })
    if (!Number.isInteger(qty) || qty < 1 || qty > STORE_MAX_QUANTITY)
      return NextResponse.json({ error: `Quantité invalide pour « ${p.name} ».` }, { status: 400 })
    const size = p.sizes.length ? String(l?.size ?? '') : null
    if (p.sizes.length && !p.sizes.includes(size))
      return NextResponse.json({ error: `Choisis une taille pour « ${p.name} ».` }, { status: 400 })
    items.push({ productId: p.id, productName: p.name, size, quantity: qty, unitPrice: p.price })
  }
  const total = Math.round(items.reduce((s, i) => s + i.unitPrice * i.quantity, 0) * 100) / 100

  // Création (on réessaie si deux commandes prennent la même référence en même temps)
  let order: any = null
  for (let attempt = 0; attempt < 3 && !order; attempt++) {
    try {
      order = await db.storeOrder.create({
        data: {
          reference: await nextReference(),
          memberId:  member.id,
          total,
          note:      note || null,
          items:     { create: items },
        },
      })
    } catch (e: any) {
      if (e?.code !== 'P2002') {
        console.error('[STORE ORDER]', e)
        return NextResponse.json({ error: 'Erreur serveur, réessaie.' }, { status: 500 })
      }
    }
  }
  if (!order) return NextResponse.json({ error: 'Erreur serveur, réessaie.' }, { status: 500 })

  // Emails : club + adhérent (une panne d'email n'annule pas la commande)
  const settings = await prisma.clubSettings.findUnique({ where: { id: 'singleton' } }).catch(() => null)
  const clubEmail = process.env.STORE_ORDER_EMAIL || settings?.contactEmail || STORE_FALLBACK_EMAIL
  const mail = {
    reference: order.reference, total, note: note || null, items,
    member: { firstName: member.firstName, lastName: member.lastName, email: member.user.email, phone: member.phone },
  }
  // On n'attend pas plus de 8 s les emails : la commande est déjà enregistrée
  const emails = Promise.allSettled([sendStoreOrderToClub(clubEmail, mail), sendStoreOrderToMember(mail)])
  await Promise.race([emails, new Promise(r => setTimeout(r, 8000))])

  return NextResponse.json({ reference: order.reference, total })
}
