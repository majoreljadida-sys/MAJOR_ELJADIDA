import { NextResponse } from 'next/server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/utils'

type Ctx = { params: { id: string } }

export async function GET(_: Request, { params }: Ctx) {
  const event = await prisma.event.findUnique({
    where:   { id: params.id },
    include: {
      _count:        { select: { registrations: true } },
      registrations: {
        orderBy: { createdAt: 'asc' },
        include: {
          member: { select: { id: true, firstName: true, lastName: true, phone: true, photo: true } },
        },
      },
    },
  })
  if (!event) return NextResponse.json({ error: 'Non trouvé' }, { status: 404 })
  return NextResponse.json({ event })
}

export async function PATCH(req: Request, { params }: Ctx) {
  const session = await auth()
  if (!session || session.user.role?.toLowerCase() !== 'admin')
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  try {
    const body = await req.json()
    const { title, type, date, location, description, maxParticipants, price, distance, status, videoUrl } = body

    const event = await prisma.event.update({
      where: { id: params.id },
      data: {
        ...(title          && { title, slug: slugify(title) }),
        ...(type           && { type }),
        ...(date           && { date: new Date(date) }),
        ...(location       && { location }),
        ...(description !== undefined && { description }),
        ...(status         && { status }),
        maxParticipants: maxParticipants !== undefined ? (maxParticipants ? parseInt(maxParticipants) : null) : undefined,
        price:           price !== undefined           ? (price           ? parseFloat(price)          : null) : undefined,
        distance:        distance !== undefined        ? (distance        || null)                              : undefined,
        videoUrl:        videoUrl !== undefined        ? (videoUrl        || null)                              : undefined,
      },
    })

    return NextResponse.json({ event })
  } catch (err) {
    console.error('[EVENT PATCH]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function DELETE(_: Request, { params }: Ctx) {
  const session = await auth()
  if (!session || session.user.role?.toLowerCase() !== 'admin')
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  try {
    await prisma.eventRegistration.deleteMany({ where: { eventId: params.id } })
    await prisma.event.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[EVENT DELETE]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
