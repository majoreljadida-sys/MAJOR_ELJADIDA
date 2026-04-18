import { prisma } from '@/lib/prisma'
import { TrainingProgramContent } from './training-program-content'

export default async function EntrainementsPage() {
  const now   = new Date()
  const month = now.getMonth() + 1
  const year  = now.getFullYear()

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
    })),
  } : null

  return <TrainingProgramContent program={serialized} allPrograms={allPrograms} />
}
