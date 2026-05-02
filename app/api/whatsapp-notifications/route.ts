import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const VALID_TYPES = ['TRAINING', 'EVENT', 'BLOG', 'CUSTOM'] as const

export async function POST(req: Request) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN')
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  try {
    const { type, refId, title, message } = await req.json()

    if (!type || !VALID_TYPES.includes(type))
      return NextResponse.json({ error: 'Type invalide.' }, { status: 400 })
    if (!title || !message)
      return NextResponse.json({ error: 'Titre et message requis.' }, { status: 400 })

    const notif = await prisma.whatsappNotification.create({
      data: {
        type,
        refId:   refId ?? null,
        title,
        message,
        sentBy:  session.user.id!,
      },
    })

    return NextResponse.json({ notification: notif }, { status: 201 })
  } catch (err) {
    console.error('[WHATSAPP NOTIF POST]', err)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
