import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const session = await auth()
  if (!session || !['ADMIN', 'COACH'].includes(session.user.role ?? ''))
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  try {
    const { title, date, location, type, groupId, coachId, duration, description } = await req.json()
    if (!title || !date || !type) return NextResponse.json({ error: 'Champs manquants.' }, { status: 400 })

    const training = await prisma.trainingSession.create({
      data: {
        title,
        date:     new Date(date),
        location: location ?? '',
        type,
        duration: duration ? parseInt(duration) : null,
        description: description ?? null,
        groupId:  groupId || null,
        coachId:  coachId || null,
        status:   'SCHEDULED',
      },
    })

    // Auto-créer les présences pour tous les membres du groupe
    if (groupId) {
      const members = await prisma.member.findMany({ where: { groupId } })
      if (members.length > 0) {
        await prisma.attendance.createMany({
          data: members.map(m => ({ memberId: m.id, sessionId: training.id, present: false })),
          skipDuplicates: true,
        })
      }
    }

    return NextResponse.json({ training }, { status: 201 })
  } catch (err) {
    console.error('[TRAINING POST]', err)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
