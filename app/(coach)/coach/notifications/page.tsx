import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { NotificationsClient } from '@/app/(admin)/admin/notifications/notifications-client'

export const dynamic = 'force-dynamic'

export default async function CoachNotificationsPage() {
  const session = await auth()
  const role = session?.user.role
  if (!session || (role !== 'ADMIN' && role !== 'COACH')) redirect('/login')

  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)

  const [upcomingSessions, events, posts, history] = await Promise.all([
    prisma.trainingProgramSession.findMany({
      where:   { dateFrom: { gte: todayStart } },
      orderBy: { dateFrom: 'asc' },
      take:    3,
      include: { program: { select: { title: true, month: true, year: true } } },
    }),
    prisma.event.findMany({
      where:   { status: 'UPCOMING', date: { gte: new Date() } },
      orderBy: { date: 'asc' },
      take:    10,
    }),
    prisma.blogPost.findMany({
      where:   { published: true },
      orderBy: { publishedAt: 'desc' },
      take:    5,
      include: { category: { select: { name: true } } },
    }),
    prisma.whatsappNotification.findMany({
      orderBy: { sentAt: 'desc' },
      take:    20,
    }),
  ])

  const sentRefIds = new Set(
    history.filter(h => h.refId).map(h => `${h.type}:${h.refId}`)
  )

  return (
    <NotificationsClient
      trainings={upcomingSessions.map(t => ({
        id:           t.id,
        title:        t.title,
        dateFrom:     t.dateFrom.toISOString(),
        dateTo:       t.dateTo?.toISOString() ?? null,
        description:  t.description,
        type:         t.type,
        programTitle: t.program.title,
        reminderSent: t.reminderSent,
      }))}
      events={events.map(e => ({
        id:          e.id,
        slug:        e.slug,
        title:       e.title,
        date:        e.date.toISOString(),
        location:    e.location,
        city:        e.city,
        type:        e.type,
        price:       e.price,
        distance:    e.distance,
        description: e.description,
      }))}
      posts={posts.map(p => ({
        id:        p.id,
        slug:      p.slug,
        title:     p.title,
        excerpt:   p.excerpt,
        readTime:  p.readTime,
        category:  p.category,
      }))}
      history={history.map(h => ({
        id:      h.id,
        type:    h.type,
        title:   h.title,
        sentAt:  h.sentAt.toISOString(),
      }))}
      sentRefIds={Array.from(sentRefIds)}
    />
  )
}
