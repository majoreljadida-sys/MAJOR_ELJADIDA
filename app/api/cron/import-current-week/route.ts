import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// Lundi 00:00 de la semaine courante
function startOfIsoWeek(d: Date): Date {
  const date = new Date(d); date.setHours(0, 0, 0, 0)
  const day = date.getDay(); const diff = day === 0 ? -6 : 1 - day
  date.setDate(date.getDate() + diff); return date
}

// GET — déclenché automatiquement par Vercel Cron tous les lundis 06:00 UTC
// Importe les séances du programme du mois pour la semaine en cours.
//
// Sécurité : Vercel ajoute l'en-tête Authorization: Bearer <CRON_SECRET> sur
// chaque appel cron. On vérifie la valeur pour bloquer les appels publics.
export async function GET(req: Request) {
  const auth = req.headers.get('authorization')
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const weekStart = startOfIsoWeek(new Date())
    const weekEnd   = new Date(weekStart); weekEnd.setDate(weekEnd.getDate() + 7)

    const programSessions = await prisma.trainingProgramSession.findMany({
      where:   { dateFrom: { gte: weekStart, lt: weekEnd } },
      orderBy: { dateFrom: 'asc' },
    })

    if (programSessions.length === 0) {
      console.log('[CRON IMPORT-WEEK] Aucune séance programmée cette semaine.')
      return NextResponse.json({ created: 0, skipped: 0, message: 'Rien à importer.' })
    }

    const existing = await prisma.trainingSession.findMany({
      where:  { date: { gte: weekStart, lt: weekEnd } },
      select: { title: true, date: true },
    })
    const existsKey = (title: string, date: Date) => `${title}|${date.toISOString().slice(0, 10)}`
    const existingKeys = new Set(existing.map(s => existsKey(s.title, s.date)))

    let created = 0
    let skipped = 0
    for (const ps of programSessions) {
      if (existingKeys.has(existsKey(ps.title, ps.dateFrom))) { skipped++; continue }
      await prisma.trainingSession.create({
        data: {
          title:       ps.title,
          date:        ps.dateFrom,
          location:    '',
          type:        ps.type,
          description: ps.description,
          status:      'SCHEDULED',
        },
      })
      created++
    }

    revalidatePath('/coach/trainings')
    revalidatePath('/admin/trainings')

    console.log(`[CRON IMPORT-WEEK] ${created} créées, ${skipped} déjà existantes (semaine ${weekStart.toISOString().slice(0, 10)}).`)
    return NextResponse.json({ created, skipped, total: programSessions.length, weekStart: weekStart.toISOString() })
  } catch (err) {
    console.error('[CRON IMPORT-WEEK]', err)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
