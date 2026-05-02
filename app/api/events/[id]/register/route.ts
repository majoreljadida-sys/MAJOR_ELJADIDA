import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type Ctx = { params: { id: string } }

// POST — un membre s'inscrit à un événement
export async function POST(_req: Request, { params }: Ctx) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Non connecté' }, { status: 401 })
  if (session.user.role !== 'MEMBER' || !session.user.profileId)
    return NextResponse.json({ error: 'Inscription réservée aux adhérents.' }, { status: 403 })

  const memberId = session.user.profileId

  try {
    const event = await prisma.event.findUnique({
      where:   { id: params.id },
      include: { _count: { select: { registrations: true } } },
    })
    if (!event)                       return NextResponse.json({ error: 'Événement introuvable.' },  { status: 404 })
    if (event.status !== 'UPCOMING')  return NextResponse.json({ error: 'Inscriptions fermées.' },   { status: 400 })

    // Déjà inscrit ?
    const existing = await prisma.eventRegistration.findUnique({
      where: { memberId_eventId: { memberId, eventId: event.id } },
    })
    if (existing) return NextResponse.json({ error: 'Tu es déjà inscrit.' }, { status: 400 })

    // Confirmé ou liste d'attente selon capacité
    const isFull = event.maxParticipants !== null && event._count.registrations >= event.maxParticipants
    const regStatus = isFull ? 'WAITING' : 'CONFIRMED'

    const registration = await prisma.eventRegistration.create({
      data: { memberId, eventId: event.id, status: regStatus },
    })

    // Création d'un Payment PENDING si l'événement a un prix > 0 et inscription confirmée
    let payment = null
    if (event.price && event.price > 0 && regStatus === 'CONFIRMED') {
      payment = await prisma.payment.create({
        data: {
          memberId,
          amount: event.price,
          type:   'EVENEMENTIELLE',
          status: 'PENDING',
          notes:  `[reg:${registration.id}] Préinscription : ${event.title}`,
        },
      })
    }

    return NextResponse.json({ registration, payment, status: regStatus }, { status: 201 })
  } catch (err) {
    console.error('[EVENT REGISTER POST]', err)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}

// DELETE — un membre annule son inscription
export async function DELETE(_req: Request, { params }: Ctx) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Non connecté' }, { status: 401 })
  if (session.user.role !== 'MEMBER' || !session.user.profileId)
    return NextResponse.json({ error: 'Action réservée aux adhérents.' }, { status: 403 })

  const memberId = session.user.profileId

  try {
    const registration = await prisma.eventRegistration.findUnique({
      where: { memberId_eventId: { memberId, eventId: params.id } },
    })
    if (!registration) return NextResponse.json({ error: 'Inscription introuvable.' }, { status: 404 })

    // On supprime aussi le Payment PENDING associé (référence par les notes)
    await prisma.payment.deleteMany({
      where: {
        memberId,
        status: 'PENDING',
        notes:  { contains: `[reg:${registration.id}]` },
      },
    })

    await prisma.eventRegistration.delete({ where: { id: registration.id } })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[EVENT REGISTER DELETE]', err)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
