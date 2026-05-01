import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const training = await prisma.trainingSession.findUnique({
    where: { id: params.id },
    include: {
      attendances: { include: { member: true } },
      group: { include: { members: true } },
    },
  })
  if (!training) return NextResponse.json({ error: 'Séance introuvable.' }, { status: 404 })

  // Membres du groupe non encore dans attendances
  const existingIds = new Set(training.attendances.map(a => a.memberId))
  const missing = (training.group?.members ?? []).filter(m => !existingIds.has(m.id))
  if (missing.length > 0) {
    await prisma.attendance.createMany({
      data: missing.map(m => ({ memberId: m.id, sessionId: params.id, present: false })),
      skipDuplicates: true,
    })
  }

  const attendances = await prisma.attendance.findMany({
    where: { sessionId: params.id },
    include: { member: true },
    orderBy: [{ member: { lastName: 'asc' } }],
  })

  return NextResponse.json({ attendances })
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session || !['ADMIN', 'COACH'].includes(session.user.role ?? ''))
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { updates } = await req.json() as { updates: { memberId: string; present: boolean }[] }

  await Promise.all(
    updates.map(u =>
      prisma.attendance.upsert({
        where:  { memberId_sessionId: { memberId: u.memberId, sessionId: params.id } },
        update: { present: u.present },
        create: { memberId: u.memberId, sessionId: params.id, present: u.present },
      })
    )
  )

  // Marquer la séance comme COMPLETED si au moins 1 présent
  const presentCount = updates.filter(u => u.present).length
  if (presentCount > 0) {
    await prisma.trainingSession.update({
      where: { id: params.id },
      data:  { status: 'COMPLETED' },
    })
  }

  return NextResponse.json({ ok: true, updated: updates.length })
}
