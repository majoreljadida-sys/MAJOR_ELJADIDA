import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { AdminProgramsClient } from './programs-client'

export default async function AdminProgramsPage() {
  const session = await auth()
  const role = session?.user.role
  if (!session || (role !== 'ADMIN' && role !== 'COACH')) redirect('/login')

  const raw = await prisma.trainingProgram.findMany({
    include: { sessions: { orderBy: { dateFrom: 'asc' } } },
    orderBy: [{ year: 'desc' }, { month: 'desc' }],
  })

  // Serialize dates to strings for client component
  const programs = raw.map(p => ({
    ...p,
    sessions: p.sessions.map(s => ({
      ...s,
      dateFrom: s.dateFrom.toISOString(),
      dateTo:   s.dateTo?.toISOString() ?? null,
      levels:   s.levels as any,  // JsonValue → typed shape côté client
    })),
  }))

  return <AdminProgramsClient programs={programs} />
}
