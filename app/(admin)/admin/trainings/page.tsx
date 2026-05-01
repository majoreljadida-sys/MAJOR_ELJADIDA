import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { TrainingsClient } from './trainings-client'

export const dynamic = 'force-dynamic'

export default async function AdminTrainingsPage() {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') redirect('/login')

  const [sessions, groups, coaches] = await Promise.all([
    prisma.trainingSession.findMany({
      orderBy: { date: 'desc' },
      take: 100,
      include: {
        group: true,
        coach: { include: { user: true } },
      },
    }),
    prisma.trainingGroup.findMany({
      include: {
        coach:  { include: { user: true } },
        _count: { select: { members: true, sessions: true } },
      },
    }),
    prisma.coach.findMany({ include: { user: true } }),
  ])

  const serialized = sessions.map(s => ({
    id:           s.id,
    title:        s.title,
    date:         s.date.toISOString(),
    location:     s.location,
    type:         s.type,
    status:       s.status,
    duration:     s.duration,
    presentCount: null as number | null,
    group:        s.group ? { id: s.group.id, name: s.group.name } : null,
    coach:        s.coach ? { firstName: s.coach.firstName, lastName: s.coach.lastName } : null,
  }))

  const serializedGroups = groups.map(g => ({
    id:    g.id,
    name:  g.name,
    level: g.level,
    _count: g._count,
    coach: g.coach ? { firstName: g.coach.firstName, lastName: g.coach.lastName } : null,
  }))

  const serializedCoaches = coaches.map(c => ({
    id:        c.id,
    firstName: c.firstName,
    lastName:  c.lastName,
  }))

  return <TrainingsClient sessions={serialized} groups={serializedGroups} coaches={serializedCoaches} />
}
