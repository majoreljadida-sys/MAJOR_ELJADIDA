import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendPaymentReminderEmail, sendEventReminderEmail } from '@/lib/email'

export async function POST(req: Request) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN')
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { type } = await req.json() as { type: 'payments' | 'events' }
  let sent = 0

  if (type === 'payments') {
    // Membres avec paiements LATE ou PENDING depuis + de 7 jours
    const latePayments = await prisma.payment.findMany({
      where: {
        status: { in: ['LATE', 'PENDING'] },
        createdAt: { lte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
      include: { member: { include: { user: true } } },
    })

    for (const p of latePayments) {
      await sendPaymentReminderEmail(
        p.member.user.email,
        p.member.firstName,
        p.amount,
        p.notes ?? 'Cotisation Club MAJOR',
        p.dueDate ?? null,
      )
      sent++
    }
  }

  if (type === 'events') {
    // Événements dans les prochaines 48h
    const now      = new Date()
    const in48h    = new Date(now.getTime() + 48 * 60 * 60 * 1000)

    const upcoming = await prisma.event.findMany({
      where: {
        status: 'UPCOMING',
        date:   { gte: now, lte: in48h },
      },
      include: {
        registrations: {
          include: { member: { include: { user: true } } },
        },
      },
    })

    for (const event of upcoming) {
      for (const reg of event.registrations) {
        await sendEventReminderEmail(
          reg.member.user.email,
          reg.member.firstName,
          event.title,
          event.date,
          event.location ?? '',
        )
        sent++
      }
    }
  }

  return NextResponse.json({ success: true, sent })
}
