import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type Ctx = { params: { id: string } }

// PATCH — modifier une séance d'entraînement
// Body peut contenir : title, date, location, type, duration, distance, description,
//                       groupId, coachId, status, maxParticipants, presentCount
export async function PATCH(req: Request, { params }: Ctx) {
  const session = await auth()
  if (!session || !['ADMIN', 'COACH'].includes(session.user.role ?? ''))
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  try {
    const body = await req.json()
    const {
      title, date, location, type, duration, distance, description,
      groupId, coachId, status, maxParticipants, presentCount,
    } = body

    // Mise à jour des champs Prisma
    const data: any = {}
    if (title           !== undefined) data.title           = title
    if (date            !== undefined) data.date            = new Date(date)
    if (location        !== undefined) data.location        = location ?? ''
    if (type            !== undefined) data.type            = type
    if (duration        !== undefined) data.duration        = duration ? parseInt(duration) : null
    if (distance        !== undefined) data.distance        = distance ? parseFloat(distance) : null
    if (description     !== undefined) data.description     = description || null
    if (groupId         !== undefined) data.groupId         = groupId || null
    if (coachId         !== undefined) data.coachId         = coachId || null
    if (status          !== undefined) data.status          = status
    if (maxParticipants !== undefined) data.maxParticipants = maxParticipants ? parseInt(maxParticipants) : null

    if (Object.keys(data).length > 0) {
      await prisma.trainingSession.update({ where: { id: params.id }, data })
    }

    // present_count est hors-schéma Prisma → SQL brut
    if (presentCount !== undefined) {
      const count = presentCount === '' || presentCount === null
        ? null
        : parseInt(presentCount)
      await prisma.$executeRaw`UPDATE training_sessions SET present_count = ${count} WHERE id = ${params.id}`
      if (count !== null && status === undefined) {
        // Si le coach saisit un nombre de présents, on passe la séance en COMPLETED automatiquement
        await prisma.trainingSession.update({ where: { id: params.id }, data: { status: 'COMPLETED' } })
      }
      return NextResponse.json({ ok: true, presentCount: count })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[TRAINING PATCH]', err)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}

// DELETE — supprimer une séance (et ses présences associées)
export async function DELETE(_req: Request, { params }: Ctx) {
  const session = await auth()
  if (!session || !['ADMIN', 'COACH'].includes(session.user.role ?? ''))
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  try {
    await prisma.attendance.deleteMany({ where: { sessionId: params.id } })
    await prisma.trainingSession.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[TRAINING DELETE]', err)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
