import { prisma } from '@/lib/prisma'
import { TrainingsClient } from './trainings-client'

export default async function AdminTrainingsPage() {
  const [sessions, groups, coaches] = await Promise.all([
    prisma.trainingSession.findMany({
      orderBy: { date: 'desc' },
      take: 100,
      include: {
        group:       true,
        coach:       { include: { user: true } },
        attendances: true,
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
    ...s,
    date: s.date.toISOString(),
  }))

  return <TrainingsClient sessions={serialized} groups={groups} coaches={coaches} />
}
