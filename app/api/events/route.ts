import { NextResponse } from 'next/server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/utils'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')

  const events = await prisma.event.findMany({
    where:   status ? { status: status as any } : {},
    orderBy: [{ status: 'asc' }, { date: 'asc' }],
    include: { _count: { select: { registrations: true } } },
  })

  return NextResponse.json({ events })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN')
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  try {
    const body = await req.json()
    const { title, type, date, location, description, maxParticipants, price, distance, videoUrl } = body

    if (!title || !type || !date || !location)
      return NextResponse.json({ error: 'Champs obligatoires manquants.' }, { status: 400 })

    const event = await prisma.event.create({
      data: {
        title,
        slug:            slugify(title),
        type,
        date:            new Date(date),
        location,
        description:     description ?? '',
        maxParticipants: maxParticipants ? parseInt(maxParticipants) : null,
        price:           price          ? parseFloat(price)          : null,
        distance:        distance       ?? null,
        videoUrl:        videoUrl       ?? null,
        status:          'UPCOMING',
      },
    })

    return NextResponse.json({ event }, { status: 201 })
  } catch (err) {
    console.error('[EVENT POST]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
