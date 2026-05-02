import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { fetchChannelVideos } from '@/lib/youtube'
import { EventsContent } from './events-content'

export const metadata: Metadata = { title: 'Événements — Club MAJOR' }

const YOUTUBE_CHANNEL_ID = 'UCT2aR5NRl-CCqL544YiEL9w'

export default async function EventsPage() {
  const session  = await auth()
  const memberId = session?.user.role === 'MEMBER' ? session.user.profileId ?? null : null

  const [events, videos, myRegistrations] = await Promise.all([
    prisma.event.findMany({
      orderBy: [{ status: 'asc' }, { date: 'asc' }],
      include: { _count: { select: { registrations: true } } },
    }),
    fetchChannelVideos(YOUTUBE_CHANNEL_ID, 12),
    memberId
      ? prisma.eventRegistration.findMany({
          where:  { memberId },
          select: { eventId: true, status: true },
        })
      : Promise.resolve([]),
  ])

  const upcoming  = events.filter(e => e.status === 'UPCOMING')
  const completed = events.filter(e => e.status === 'COMPLETED' || e.status === 'CANCELLED')

  return (
    <EventsContent
      upcoming={upcoming}
      completed={completed}
      videos={videos}
      channelId={YOUTUBE_CHANNEL_ID}
      isLoggedIn={!!session}
      isMember={!!memberId}
      myRegistrations={myRegistrations}
    />
  )
}
