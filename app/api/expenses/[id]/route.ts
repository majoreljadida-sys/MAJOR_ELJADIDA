import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { EXPENSE_CATEGORY_KEYS, PAYMENT_METHOD_KEYS } from '@/lib/expenses'

interface Ctx { params: { id: string } }

export async function GET(_req: Request, { params }: Ctx) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const expense = await (prisma as any).expense.findUnique({
    where:   { id: params.id },
    include: {
      event:           { select: { id: true, title: true, slug: true } },
      trainingSession: { select: { id: true, title: true, date: true } },
      recordedBy:      { select: { id: true, email: true } },
    },
  })
  if (!expense) return NextResponse.json({ error: 'Introuvable' }, { status: 404 })
  return NextResponse.json({ expense })
}

export async function PATCH(req: Request, { params }: Ctx) {
  const session = await auth()
  if (!session || session.user.role?.toLowerCase() !== 'admin')
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  try {
    const body = await req.json()
    const {
      amount, date, category, description, supplier, paymentMethod,
      receiptUrl, notes, eventId, trainingSessionId,
    } = body

    const data: any = {}
    if (amount        !== undefined) {
      const n = Number(amount)
      if (!isFinite(n) || n <= 0) return NextResponse.json({ error: 'Montant invalide.' }, { status: 400 })
      data.amount = n
    }
    if (date          !== undefined) data.date = new Date(date)
    if (category      !== undefined) {
      if (!EXPENSE_CATEGORY_KEYS.includes(category))
        return NextResponse.json({ error: 'Catégorie invalide.' }, { status: 400 })
      data.category = category
    }
    if (description   !== undefined) data.description = String(description).trim()
    if (supplier      !== undefined) data.supplier = supplier || null
    if (paymentMethod !== undefined) {
      if (!PAYMENT_METHOD_KEYS.includes(paymentMethod))
        return NextResponse.json({ error: 'Mode invalide.' }, { status: 400 })
      data.paymentMethod = paymentMethod
    }
    if (receiptUrl    !== undefined) data.receiptUrl = receiptUrl || null
    if (notes         !== undefined) data.notes = notes || null
    if (eventId       !== undefined) data.eventId = eventId || null
    if (trainingSessionId !== undefined) data.trainingSessionId = trainingSessionId || null

    const expense = await (prisma as any).expense.update({ where: { id: params.id }, data })
    return NextResponse.json({ expense })
  } catch (err) {
    console.error('[EXPENSE PATCH]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const session = await auth()
  if (!session || session.user.role?.toLowerCase() !== 'admin')
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  try {
    await (prisma as any).expense.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[EXPENSE DELETE]', err)
    return NextResponse.json({ error: 'Introuvable ou erreur' }, { status: 404 })
  }
}
