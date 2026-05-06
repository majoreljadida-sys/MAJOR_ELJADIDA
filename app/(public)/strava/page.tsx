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
  const [club, activities, members, weeklyStats, session] = await Promise.all([
    getClubInfo(),
    getClubActivities(20),
    getClubMembers(50),  // récupère plus de membres pour la détection
    getWeeklyStats(200),
    auth(),
  ])

  // Détecte si l'utilisateur connecté est déjà dans le club Strava
  // (matching par firstName + lastName, insensible aux accents/casse)
  let isInStravaClub = false
  if (session?.user?.id) {
    const member = await prisma.member.findFirst({
      where:  { userId: session.user.id },
      select: { firstName: true, lastName: true },
    })
    if (member) {
      const myFirst = normalize(member.firstName)
      const myLast  = normalize(member.lastName)
      isInStravaClub = members.some(m =>
        normalize(m.firstname) === myFirst &&
        normalize(m.lastname)  === myLast
      )
    }
  }

  return (
    <StravaPageClient
      club={club}
      activities={activities}
      members={members}
      weeklyStats={weeklyStats}
      clubUrl={stravaClubUrl()}
      isInStravaClub={isInStravaClub}
    />
  )
}
