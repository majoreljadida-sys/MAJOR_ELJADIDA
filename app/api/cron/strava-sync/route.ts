import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import { getClubActivities, type StravaActivity } from '@/lib/strava'

// ─────────────────────────────────────────────────────────────────────
// Synchronisation des activités du club Strava vers notre base.
// Strava ne renvoie pas la date des activités sur l'endpoint clubs,
// donc on capture chaque activité au moment où on la voit pour la 1ère
// fois (champ `observedAt`). Le hashKey assure que la même activité
// n'est jamais ré-insérée.
//
// Première exécution : si la table est vide, on insère toutes les
// activités existantes mais avec `observedAt` daté d'il y a 365 jours,
// pour qu'elles ne polluent pas le classement de la semaine en cours.
// Le compteur démarre vraiment à partir des activités vues APRÈS le
// premier seed.
// ─────────────────────────────────────────────────────────────────────

function normalize(s: string | null | undefined) {
  return (s ?? '').trim().toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
}

function hashOf(a: StravaActivity): string {
  const key = [
    normalize(a.athlete?.firstname),
    normalize(a.athlete?.lastname),
    Math.round(a.distance ?? 0),
    Math.round(a.moving_time ?? 0),
    normalize(a.name),
    a.type ?? '',
  ].join('|')
  return crypto.createHash('sha256').update(key).digest('hex').slice(0, 32)
}

export async function GET(req: Request) {
  // Authentification : Vercel Cron envoie un header Authorization
  // (cf. https://vercel.com/docs/cron-jobs/manage-cron-jobs).
  // Pour les appels manuels, on accepte aussi un query secret.
  const auth   = req.headers.get('authorization')
  const url    = new URL(req.url)
  const secret = process.env.CRON_SECRET
  const ok =
    !secret ||
    auth === `Bearer ${secret}` ||
    url.searchParams.get('secret') === secret
  if (!ok) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  try {
    const activities = await getClubActivities(50)
    if (!activities.length) {
      return NextResponse.json({ ok: true, fetched: 0, inserted: 0, message: 'Aucune activité retournée par Strava' })
    }

    // Détection du premier run : si la table est vide, on backdate
    const existingCount = await prisma.stravaActivity.count()
    const isFirstRun    = existingCount === 0
    const backdated     = new Date()
    backdated.setDate(backdated.getDate() - 365)

    let inserted = 0
    let skipped  = 0
    for (const a of activities) {
      const hashKey = hashOf(a)
      try {
        await prisma.stravaActivity.create({
          data: {
            hashKey,
            firstName:   a.athlete?.firstname ?? '',
            lastName:    a.athlete?.lastname  ?? '',
            athleteKey:  `${normalize(a.athlete?.firstname)}__${normalize(a.athlete?.lastname)}`,
            name:        a.name ?? '',
            type:        a.type ?? '',
            distance:    Math.round(a.distance ?? 0),
            movingTime:  Math.round(a.moving_time ?? 0),
            elapsedTime: Math.round(a.elapsed_time ?? 0),
            elevation:   Math.round(a.total_elevation_gain ?? 0),
            observedAt:  isFirstRun ? backdated : new Date(),
          },
        })
        inserted++
      } catch (e: any) {
        // Unique constraint = déjà vue, on ignore
        if (e?.code === 'P2002') skipped++
        else throw e
      }
    }

    return NextResponse.json({
      ok: true,
      fetched: activities.length,
      inserted,
      skipped,
      isFirstRun,
      message: isFirstRun
        ? `Premier seed : ${inserted} activités enregistrées comme "passées" (le compteur démarre maintenant)`
        : `${inserted} nouvelle(s) activité(s) capturée(s)`,
    })
  } catch (err) {
    console.error('[STRAVA SYNC]', err)
    return NextResponse.json({ error: 'Erreur de synchronisation' }, { status: 500 })
  }
}
