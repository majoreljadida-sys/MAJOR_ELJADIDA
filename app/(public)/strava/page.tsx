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
  const [club, activities, members, weeklyStats, session, dbMembers] = await Promise.all([
    getClubInfo(),
    getClubActivities(20),
    getClubMembers(50),
    getWeeklyStats(),
    auth(),
    // Tous les membres du club MAJOR (DB) — utilisé pour récupérer les
    // photos puisque Strava ne les expose pas via l'API publique.
    prisma.member.findMany({
      select: { firstName: true, lastName: true, photo: true },
    }),
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
    const member = await prisma.member.findFirst({
      where:  { userId: session.user.id },
      select: { firstName: true, lastName: true },
    })
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
