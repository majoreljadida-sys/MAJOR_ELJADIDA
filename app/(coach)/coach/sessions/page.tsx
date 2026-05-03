import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { CoachSessionsClient } from './sessions-client'

export const dynamic = 'force-dynamic'

// Lundi de la semaine d'une date donnée (semaine ISO — lundi à dimanche)
function startOfIsoWeek(d: Date): Date {
  const date = new Date(d)
  date.setHours(0, 0, 0, 0)
  const day = date.getDay() // 0 = dimanche, 1 = lundi…
  const diff = day === 0 ? -6 : 1 - day
  date.setDate(date.getDate() + diff)
  return date
}

export default async function CoachSessionsPage({
  searchParams,
}: {
  searchParams: { week?: string }
}) {
  const session = await auth()
  if (!session?.user?.profileId || session.user.role !== 'COACH') redirect('/login')

  const coachId = session.user.profileId

  // Borne de la semaine choisie (paramètre ?week=YYYY-MM-DD = un jour de la semaine)
  const reference = searchParams.week ? new Date(searchParams.week) : new Date()
  const weekStart = startOfIsoWeek(reference)
  const weekEnd   = new Date(weekStart); weekEnd.setDate(weekEnd.getDate() + 7)

  const [sessions, groups, presentCounts] = await Promise.all([
    prisma.trainingSession.findMany({
      where:   { coachId, date: { gte: weekStart, lt: weekEnd } },
      orderBy: { date: 'asc' },
      include: { group: { select: { id: true, name: true } } },
    }),
    prisma.trainingGroup.findMany({
      where:   { coachId },
      orderBy: { name: 'asc' },
      select:  { id: true, name: true },
    }),
    prisma.$queryRaw<{ id: string; present_count: number | null }[]>`
      SELECT id, present_count FROM training_sessions WHERE "coachId" = ${coachId}
    `,
  ])

  const countMap = Object.fromEntries(
    presentCounts.map(c => [c.id, c.present_count !== null ? Number(c.present_count) : null])
  )

  return (
    <CoachSessionsClient
      weekStart={weekStart.toISOString()}
      sessions={sessions.map(s => ({
        id:           s.id,
        title:        s.title,
        date:         s.date.toISOString(),
        location:     s.location,
        type:         s.type,
        status:       s.status,
        duration:     s.duration,
        description:  s.description,
        groupId:      s.groupId,
        groupName:    s.group?.name ?? null,
        presentCount: countMap[s.id] ?? null,
      }))}
      groups={groups}
      coachId={coachId}
    />
  )
}
