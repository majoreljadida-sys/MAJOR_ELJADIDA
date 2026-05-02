import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { AdminProgramsClient } from '@/app/(admin)/admin/programs/programs-client'

export default async function CoachProgramsPage() {
  const session = await auth()
  const role = session?.user.role
  if (!session || (role !== 'ADMIN' && role !== 'COACH')) redirect('/login')

  const raw = await prisma.trainingProgram.findMany({
    include: { sessions: { orderBy: { dateFrom: 'asc' } } },
    orderBy: [{ year: 'desc' }, { month: 'desc' }],
  })

  const programs = raw.map(p => ({
    ...p,
    sessions: p.sessions.map(s => ({
      ...s,
      dateFrom: s.dateFrom.toISOString(),
      dateTo:   s.dateTo?.toISOString() ?? null,
    })),
  }))

  return <AdminProgramsClient programs={programs} />
}
