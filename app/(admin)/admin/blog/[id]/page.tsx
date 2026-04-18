import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { BlogForm } from '../blog-form'

export default async function EditBlogPostPage({ params }: { params: { id: string } }) {
  const [post, categories] = await Promise.all([
    prisma.blogPost.findUnique({ where: { id: params.id } }),
    prisma.blogCategory.findMany({ orderBy: { name: 'asc' } }),
  ])
  if (!post) notFound()
  return <BlogForm post={post as any} categories={categories} />
}
