import { prisma } from '@/lib/prisma'
import { HomeContent } from '@/components/pages/home-content'

async function getData() {
  const [events, posts] = await Promise.all([
    prisma.event.findMany({
      where:   { status: 'UPCOMING' },
      orderBy: { date: 'asc' },
      take:    3,
      include: { _count: { select: { registrations: true } } },
    }),
    prisma.blogPost.findMany({
      where:   { published: true },
      orderBy: { publishedAt: 'desc' },
      take:    3,
      include: { category: true },
    }),
  ])
  return { events, posts }
}

export default async function HomePage() {
  const { events, posts } = await getData()
  return <HomeContent events={events} posts={posts} />
}
