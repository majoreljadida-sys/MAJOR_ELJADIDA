import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type Ctx = { params: { id: string; sessionId: string } }

// ── PATCH : modifier une séance
export async function PATCH(req: Request, { params }: Ctx) {
  const session = await auth()
  if (!session || session.user.role?.toLowerCase() !== 'admin')
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  try {
    const body = await req.json()
    const { dateFrom, dateTo, title, description, type } = body

    const updated = await prisma.trainingProgramSession.update({
      where: { id: params.sessionId },
      data: {
        ...(dateFrom    && { dateFrom:    new Date(dateFrom) }),
        ...(dateTo      !== undefined && { dateTo: dateTo ? new Date(dateTo) : null }),
        ...(title       && { title }),
        ...(description !== undefined && { description }),
        ...(type        && { type }),
      },
    })
    return NextResponse.json({ session: updated })
  } catch (err) {
    console.error('[SESSION PATCH]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// ── DELETE : supprimer une séance
export async function DELETE(_: Request, { params }: Ctx) {
  const session = await auth()
  if (!session || session.user.role?.toLowerCase() !== 'admin')
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  try {
    await prisma.trainingProgramSession.delete({ where: { id: params.sessionId } })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[SESSION DELETE]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}