import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Lundi 00:00 de la semaine d'une date donnée
function startOfIsoWeek(d: Date): Date {
  const date = new Date(d)
  date.setHours(0, 0, 0, 0)
  const day = date.getDay()
  const diff = day === 0 ? -6 : 1 - day
  date.setDate(date.getDate() + diff)
  return date
}

// POST — importe les séances de la semaine depuis le programme du mois
// Body : { weekStart?: ISO date — un jour de la semaine cible } (défaut : semaine en cours)
export async function POST(req: Request) {
  const session = await auth()
  if (!session || !['ADMIN', 'COACH'].includes(session.user.role ?? ''))
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  try {
    const body = await req.json().catch(() => ({}))
    const reference = body.weekStart ? new Date(body.weekStart) : new Date()
    const weekStart = startOfIsoWeek(reference)
    const weekEnd   = new Date(weekStart); weekEnd.setDate(weekEnd.getDate() + 7)

    // Toutes les séances planifiées dans cette semaine via les programmes
    const programSessions = await prisma.trainingProgramSession.findMany({
      where:   { dateFrom: { gte: weekStart, lt: weekEnd } },
      orderBy: { dateFrom: 'asc' },
    })

    if (programSessions.length === 0)
      return NextResponse.json({ created: 0, skipped: 0, message: 'Aucune séance programmée cette semaine.' })

    // Séances déjà créées dans cette semaine pour éviter les doublons
    const existing = await prisma.trainingSession.findMany({
      where:  { date: { gte: weekStart, lt: weekEnd } },
      select: { title: true, date: true },
    })
    const existsKey = (title: string, date: Date) => `${title}|${date.toISOString().slice(0, 10)}`
    const existingKeys = new Set(existing.map(s => existsKey(s.title, s.date)))

    const createdSessions: any[] = []
    let skipped = 0
    for (const ps of programSessions) {
      const key = existsKey(ps.title, ps.dateFrom)
      if (existingKeys.has(key)) { skipped++; continue }
      const newSession = await prisma.trainingSession.create({
        data: {
          title:       ps.title,
          date:        ps.dateFrom,
          location:    '',
          type:        ps.type,
          description: ps.description,
          status:      'SCHEDULED',
        },
      })
      createdSessions.push({
        id:           newSession.id,
        title:        newSession.title,
        date:         newSession.date.toISOString(),
        location:     newSession.location,
        type:         newSession.type,
        status:       newSession.status,
        duration:     newSession.duration,
        presentCount: null,
        group:        null,
        coach:        null,
      })
    }

    revalidatePath('/coach/trainings')
    revalidatePath('/admin/trainings')

    return NextResponse.json({
      created: createdSessions.length,
      sessions: createdSessions,
      skipped,
      total: programSessions.length,
    })
  } catch (err) {
    console.error('[IMPORT WEEK]', err)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
