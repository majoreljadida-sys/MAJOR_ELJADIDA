import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { AboutContent } from './about-content'

export const metadata: Metadata = { title: 'À propos — Club MAJOR' }

export default async function AboutPage() {
  const [memberCount, coachCount] = await Promise.all([
    prisma.member.count({ where: { status: 'ACTIVE' } }),
    prisma.coach.count(),
  ])

  return <AboutContent memberCount={memberCount} coachCount={coachCount} />
}
