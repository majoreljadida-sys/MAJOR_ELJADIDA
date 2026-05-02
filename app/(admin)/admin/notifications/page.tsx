import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { NotificationsClient } from './notifications-client'

export const dynamic = 'force-dynamic'

export default async function AdminNotificationsPage() {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') redirect('/login')

  // Bornes "aujourd'hui" en heure locale serveur
  const start = new Date(); start.setHours(0, 0, 0, 0)
  const end   = new Date(); end.setHours(23, 59, 59, 999)

  const [todaySessions, events, posts, history] = await Promise.all([
    prisma.trainingSession.findMany({
      where:   { date: { gte: start, lte: end }, status: { not: 'CANCELLED' } },
      orderBy: { date: 'asc' },
      include: {
        group: { select: { name: true } },
        coach: { select: { firstName: true, lastName: true } },
      },
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

  // Set des refIds déjà envoyés pour griser les boutons
  const sentRefIds = new Set(
    history.filter(h => h.refId).map(h => `${h.type}:${h.refId}`)
  )

  return (
    <NotificationsClient
      trainings={todaySessions.map(t => ({
        id:       t.id,
        title:    t.title,
        date:     t.date.toISOString(),
        location: t.location,
        type:     t.type,
        duration: t.duration,
        coach:    t.coach,
        group:    t.group,
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
