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
    const { memberId, type, amount, description, status } = body

    if (!memberId || !type || !amount)
      return NextResponse.json({ error: 'Champs obligatoires manquants.' }, { status: 400 })

    const payment = await prisma.payment.create({
      data: {
        memberId,
        type,
        amount:  parseFloat(amount),
        notes:   description ?? null,
        status:  status ?? 'PENDING',
        dueDate: new Date(),
      },
    })

    return NextResponse.json({ payment }, { status: 201 })
  } catch (err) {
    console.error('[PAYMENT POST]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
