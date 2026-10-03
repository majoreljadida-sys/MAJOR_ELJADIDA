import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { EXPENSE_CATEGORY_KEYS, PAYMENT_METHOD_KEYS } from '@/lib/expenses'

export const dynamic = 'force-dynamic'

// GET — liste des dépenses (admin + coach), avec filtres
export async function GET(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const role = session.user.role?.toLowerCase()
  if (role !== 'admin' && role !== 'coach')
    return NextResponse.json({ error: 'Interdit' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category')
  const eventId  = searchParams.get('eventId')
  const dateFrom = searchParams.get('dateFrom')
  const dateTo   = searchParams.get('dateTo')
  const search   = searchParams.get('search')

  const expenses = await (prisma as any).expense.findMany({
    where: {
      ...(category ? { category: category as any } : {}),
      ...(eventId  ? { eventId }                   : {}),
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
    },
    include: {
      event:           { select: { id: true, title: true, slug: true } },
      trainingSession: { select: { id: true, title: true, date: true } },
      recordedBy:      { select: { id: true, email: true } },
    },
    orderBy: { date: 'desc' },
  })

  return NextResponse.json({ expenses })
}

// POST — création d'une dépense (admin only)
export async function POST(req: Request) {
  const session = await auth()
  if (!session || session.user.role?.toLowerCase() !== 'admin')
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  try {
    const body = await req.json()
    const {
      amount, date, category, description, supplier, paymentMethod,
      receiptUrl, notes, eventId, trainingSessionId,
    } = body

    if (!amount || !date || !category || !description)
      return NextResponse.json({ error: 'Champs obligatoires : amount, date, category, description.' }, { status: 400 })

    if (!EXPENSE_CATEGORY_KEYS.includes(category))
      return NextResponse.json({ error: 'Catégorie invalide.' }, { status: 400 })

    if (paymentMethod && !PAYMENT_METHOD_KEYS.includes(paymentMethod))
      return NextResponse.json({ error: 'Mode de paiement invalide.' }, { status: 400 })

    const amountNum = Number(amount)
    if (!isFinite(amountNum) || amountNum <= 0)
      return NextResponse.json({ error: 'Montant invalide.' }, { status: 400 })

    const expense = await (prisma as any).expense.create({
      data: {
        amount:            amountNum,
        date:              new Date(date),
        category,
        description:       String(description).trim(),
        supplier:          supplier ? String(supplier).trim() : null,
        paymentMethod:     paymentMethod ?? 'CASH',
        receiptUrl:        receiptUrl || null,
        notes:             notes ? String(notes) : null,
        eventId:           eventId || null,
        trainingSessionId: trainingSessionId || null,
        recordedById:      session.user.id,
      },
    })

    return NextResponse.json({ expense }, { status: 201 })
  } catch (err) {
    console.error('[EXPENSE POST]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
