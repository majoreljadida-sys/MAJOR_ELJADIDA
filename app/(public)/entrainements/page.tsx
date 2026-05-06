import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { TrainingProgramContent } from './training-program-content'
import type { LevelJsonKey } from '@/lib/sport-levels'

export default async function EntrainementsPage() {
  const now   = new Date()
  const month = now.getMonth() + 1
  const year  = now.getFullYear()

  // Si membre connecté, on récupère son niveau sportif pour pré-sélection
  const session = await auth()
  let userSportLevel: LevelJsonKey | null = null
  if (session?.user?.id) {
    const member = await prisma.member.findFirst({
      where:  { userId: session.user.id },
      select: { sportLevel: true },
    })
    if (member?.sportLevel) {
      userSportLevel = member.sportLevel.toLowerCase() as LevelJsonKey
    }
  }

  // Programme du mois en cours, sinon le plus récent
  let program = await prisma.trainingProgram.findFirst({
    where:   { month, year },
    include: { sessions: { orderBy: { dateFrom: 'asc' } } },
  })

  if (!program) {
    program = await prisma.trainingProgram.findFirst({
      include: { sessions: { orderBy: { dateFrom: 'asc' } } },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    })
  }

  // Liste de tous les programmes pour le sélecteur
  const allPrograms = await prisma.trainingProgram.findMany({
    select:  { id: true, month: true, year: true, title: true },
    orderBy: [{ year: 'desc' }, { month: 'desc' }],
  })

  const serialized = program ? {
    ...program,
    sessions: program.sessions.map(s => ({
      ...s,
      dateFrom: s.dateFrom.toISOString(),
      dateTo:   s.dateTo?.toISOString() ?? null,
      levels:   s.levels as any,
    })),
  } : null

  return <TrainingProgramContent program={serialized} allPrograms={allPrograms} userSportLevel={userSportLevel} />
}
