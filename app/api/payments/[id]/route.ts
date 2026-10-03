import { NextResponse } from 'next/server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendPaymentConfirmationEmail } from '@/lib/email'

interface Params { params: { id: string } }

export async function PATCH(req: Request, { params }: Params) {
  const session = await auth()
  if (!session || session.user.role?.toLowerCase() !== 'admin')
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const body = await req.json()
  const { status, paidAt } = body

  try {
    const before = await prisma.payment.findUnique({
      where:   { id: params.id },
      select:  { status: true },
    })

    const paidDate = status === 'PAID' ? (paidAt ? new Date(paidAt) : new Date()) : null

    const payment = await prisma.payment.update({
      where:   { id: params.id },
      data:    { status, paidDate },
      include: { member: { include: { user: true } } },
    })

    // Email de confirmation si le paiement vient d'être marqué PAID
    if (status === 'PAID' && before?.status !== 'PAID') {
      sendPaymentConfirmationEmail(
        payment.member.user.email,
        payment.member.firstName,
        payment.amount,
        payment.notes ?? 'Cotisation Club MAJOR',
        paidDate!,
      ).catch(console.error)
    }

    return NextResponse.json({ payment })
  } catch (err) {
    return NextResponse.json({ error: 'Introuvable ou erreur' }, { status: 404 })
  }
}

/**
 * DELETE — suppression définitive d'un paiement (admin only).
 * Utilisé par la fiche membre pour corriger une erreur de saisie.
 */
export async function DELETE(_req: Request, { params }: Params) {
  const session = await auth()
  if (!session || session.user.role?.toLowerCase() !== 'admin')
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  try {
    await prisma.payment.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[PAYMENT DELETE]', err)
    return NextResponse.json({ error: 'Paiement introuvable ou erreur.' }, { status: 404 })
  }
}
