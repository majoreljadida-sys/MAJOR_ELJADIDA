import { getClubInfo, getClubActivities, getClubMembers, getWeeklyStats, stravaClubUrl } from '@/lib/strava'
import { StravaPageClient } from './strava-client'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const revalidate = 900

function normalize(s: string | null | undefined) {
  return (s ?? '').trim().toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '') // retire les accents
}

export default async function StravaPage() {
  // Chaque source est isolée : une panne Strava ou base de données ne doit
  // jamais faire tomber toute la page (erreur 500) — on affiche ce qui répond.
  const safe = async <T,>(p: Promise<T>, fallback: T, label: string): Promise<T> => {
    try { return await p } catch (e) { console.error(`[strava] ${label}:`, e); return fallback }
  }

  const [club, activities, members, weeklyStats, session, dbMembers] = await Promise.all([
    safe<Awaited<ReturnType<typeof getClubInfo>>>(getClubInfo(), null, 'clubInfo'),
    safe(getClubActivities(20), [], 'activities'),
    safe(getClubMembers(50), [], 'members'),
    safe(getWeeklyStats(), [], 'weeklyStats'),
    safe(auth().catch(() => null), null, 'auth'),
    // Tous les membres du club MAJOR (DB) — utilisé pour récupérer les
    // photos puisque Strava ne les expose pas via l'API publique.
    safe(prisma.member.findMany({
      select: { firstName: true, lastName: true, photo: true },
    }), [] as { firstName: string; lastName: string; photo: string | null }[], 'dbMembers'),
  ])

  // Enrichit chaque membre Strava avec sa photo MAJOR si on retrouve
  // un membre correspondant dans la DB (matching par prénom + initiale
  // du nom, puisque Strava tronque le lastname à la 1ère lettre).
  const enrichedMembers = members.map(m => {
    const stravaFirst   = normalize(m.firstname)
    const stravaLastInit = normalize(m.lastname).charAt(0)  // "A." → "a"
    const match = dbMembers.find(db => {
      const dbFirst    = normalize(db.firstName)
      const dbLastInit = normalize(db.lastName).charAt(0)
      return dbFirst === stravaFirst && dbLastInit === stravaLastInit
    })
    return {
      ...m,
      // Si on a trouvé une photo en DB, on l'utilise comme profile_medium
      profile_medium: m.profile_medium || match?.photo || '',
      profile:        m.profile        || match?.photo || '',
    }
  })

  // Détecte si l'utilisateur connecté est déjà dans le club Strava
  let isInStravaClub = false
  if (session?.user?.id) {
    const member = await safe<{ firstName: string; lastName: string } | null>(prisma.member.findFirst({
      where:  { userId: session.user.id },
      select: { firstName: true, lastName: true },
    }), null, 'currentMember')
    if (member) {
      const myFirst    = normalize(member.firstName)
      const myLastInit = normalize(member.lastName).charAt(0)
      isInStravaClub = members.some(m =>
        normalize(m.firstname) === myFirst &&
        normalize(m.lastname).charAt(0) === myLastInit
      )
    }
  }

  return (
    <StravaPageClient
      club={club}
      activities={activities}
      members={enrichedMembers}
      weeklyStats={weeklyStats}
      clubUrl={stravaClubUrl()}
      isInStravaClub={isInStravaClub}
    />
  )
}
