import { getClubInfo, getClubActivities, getClubMembers, stravaClubUrl } from '@/lib/strava'
import { StravaPageClient } from './strava-client'

export const revalidate = 900

export default async function StravaPage() {
  const [club, activities, members] = await Promise.all([
    getClubInfo(),
    getClubActivities(20),
    getClubMembers(30),
  ])

  return (
    <StravaPageClient
      club={club}
      activities={activities}
      members={members}
      clubUrl={stravaClubUrl()}
    />
  )
}
