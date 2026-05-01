import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { TrainingsClient } from './trainings-client'

export const dynamic = 'force-dynamic'

export default async function AdminTrainingsPage() {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') redirect('/login')

  const [rawSessions, groups, coaches] = await Promise.all([
    prisma.$queryRaw<any[]>`
      SELECT
        ts.id, ts.title, ts.date, ts.location, ts.type, ts.status,
        ts.duration, ts.present_count AS "presentCount",
        tg.id AS "groupId", tg.name AS "groupName",
        c.first_name AS "coachFirst", c.last_name AS "coachLast"
      FROM training_sessions ts
      LEFT JOIN training_groups tg ON ts.group_id = tg.id
      LEFT JOIN coaches c ON ts.coach_id = c.id
      ORDER BY ts.date DESC
      LIMIT 100
    `,
    prisma.trainingGroup.findMany({
      include: {
        coach:  { include: { user: true } },
        _count: { select: { members: true, sessions: true } },
      },
    }),
    prisma.coach.findMany({ include: { user: true } }),
  ])

  const sessions = rawSessions.map((s: any) => ({
    id:           s.id,
    title:        s.title,
    date:         new Date(s.date).toISOString(),
    location:     s.location,
    type:         s.type,
    status:       s.status,
    duration:     s.duration,
    presentCount: s.presentCount !== null ? Number(s.presentCount) : null,
    group:        s.groupId ? { id: s.groupId, name: s.groupName } : null,
    coach:        s.coachFirst ? { firstName: s.coachFirst, lastName: s.coachLast } : null,
  }))

  const serializedGroups = groups.map(g => ({
    id:     g.id,
    name:   g.name,
    level:  g.level,
    _count: g._count,
    coach:  g.coach ? { firstName: g.coach.firstName, lastName: g.coach.lastName } : null,
  }))

  const serializedCoaches = coaches.map(c => ({
    id:        c.id,
    firstName: c.firstName,
    lastName:  c.lastName,
  }))

  return <TrainingsClient sessions={sessions} groups={serializedGroups} coaches={serializedCoaches} />
}
