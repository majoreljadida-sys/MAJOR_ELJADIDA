import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { BlogContent } from './blog-content'

export const metadata: Metadata = { title: 'Blog — Les ABC de la course à pied' }

export default async function BlogPage() {
  const [categories, posts] = await Promise.all([
    prisma.blogCategory.findMany({ include: { _count: { select: { posts: true } } }, orderBy: { name: 'asc' } }),
    prisma.blogPost.findMany({
      where:   { published: true },
      orderBy: { publishedAt: 'desc' },
      include: { category: true },
    }),
  ])

  return <BlogContent categories={categories} posts={posts} />
}
