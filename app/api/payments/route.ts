import { NextResponse } from 'next/server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const session = await auth()
  if (!session || (session.user.role?.toLowerCase() !== 'admin' && session.user.role?.toLowerCase() !== 'coach'))
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const status   = searchParams.get('status')
  const memberId = searchParams.get('memberId')

  const payments = await prisma.payment.findMany({
    where: {
      ...(status   ? { status: status as any } : {}),
      ...(memberId ? { memberId }              : {}),
    },
    include: { member: { include: { user: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ payments })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session || session.user.role?.toLowerCase() !== 'admin')
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  try {
    const body = await req.json()
    const { memberId, type, amount, description, status, season, dueDate, paidDate } = body

    if (!memberId || !type || !amount)
      return NextResponse.json({ error: 'Champs obligatoires manquants.' }, { status: 400 })

    const VALID_TYPES    = ['COTISATION_ANNUELLE', 'COTISATION_MENSUELLE', 'EVENEMENTIELLE']
    const VALID_STATUSES = ['PAID', 'PENDING', 'LATE', 'CANCELLED']
    if (!VALID_TYPES.includes(type))
      return NextResponse.json({ error: 'Type de paiement invalide.' }, { status: 400 })
    if (status && !VALID_STATUSES.includes(status))
      return NextResponse.json({ error: 'Statut invalide.' }, { status: 400 })

    const payment = await prisma.payment.create({
      data: {
        memberId,
        type,
        amount:    parseFloat(amount),
        notes:     description ?? null,
        status:    status ?? 'PAID',
        season:    season ?? null,
        dueDate:   dueDate  ? new Date(dueDate)  : new Date(),
        paidDate:  paidDate ? new Date(paidDate) : (status === 'PAID' || !status) ? new Date() : null,
      },
    })

    return NextResponse.json({ payment }, { status: 201 })
  } catch (err) {
    console.error('[PAYMENT POST]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
