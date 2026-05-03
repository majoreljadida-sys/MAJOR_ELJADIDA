import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { CoachTrainingsClient } from './trainings-client'

export const dynamic = 'force-dynamic'

function startOfIsoWeek(d: Date): Date {
  const date = new Date(d)
  date.setHours(0, 0, 0, 0)
  const day = date.getDay()
  const diff = day === 0 ? -6 : 1 - day
  date.setDate(date.getDate() + diff)
  return date
}

export default async function CoachTrainingsPage({
  searchParams,
}: {
  searchParams: { week?: string }
}) {
  const session = await auth()
  const role = session?.user.role
  if (!session || (role !== 'ADMIN' && role !== 'COACH')) redirect('/login')

  const reference = searchParams.week ? new Date(searchParams.week) : new Date()
  const weekStart = startOfIsoWeek(reference)
  const weekEnd   = new Date(weekStart); weekEnd.setDate(weekEnd.getDate() + 7)

  const [sessions, groups, coaches, presentCounts, programSessionsThisWeek] = await Promise.all([
    prisma.trainingSession.findMany({
      where:   { date: { gte: weekStart, lt: weekEnd } },
      orderBy: { date: 'asc' },
      include: {
        group: true,
        coach: { include: { user: true } },
      },
    }),
    prisma.trainingGroup.findMany({
      orderBy: { name: 'asc' },
      select:  { id: true, name: true },
    }),
    prisma.coach.findMany({
      orderBy: { lastName: 'asc' },
      select:  { id: true, firstName: true, lastName: true },
    }),
    prisma.$queryRaw<{ id: string; present_count: number | null }[]>`
      SELECT id, present_count FROM training_sessions WHERE date >= ${weekStart} AND date < ${weekEnd}
    `,
    prisma.trainingProgramSession.count({
      where: { dateFrom: { gte: weekStart, lt: weekEnd } },
    }),
  ])

  const countMap = Object.fromEntries(
    presentCounts.map(c => [c.id, c.present_count !== null ? Number(c.present_count) : null])
  )

  const serialized = sessions.map(s => ({
    id:           s.id,
    title:        s.title,
    date:         s.date.toISOString(),
    location:     s.location,
    type:         s.type,
    status:       s.status,
    duration:     s.duration,
    presentCount: countMap[s.id] ?? null,
    group:        s.group ? { id: s.group.id, name: s.group.name } : null,
    coach:        s.coach ? { firstName: s.coach.firstName, lastName: s.coach.lastName } : null,
  }))

  return (
    <CoachTrainingsClient
      weekStart={weekStart.toISOString()}
      sessions={serialized}
      groups={groups}
      coaches={coaches}
      programSessionsCount={programSessionsThisWeek}
    />
  )
}
