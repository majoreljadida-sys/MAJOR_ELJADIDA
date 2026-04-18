import { prisma } from '@/lib/prisma'
import { BlogForm } from '../blog-form'

export default async function NewBlogPostPage() {
  const categories = await prisma.blogCategory.findMany({ orderBy: { name: 'asc' } })
  return <BlogForm categories={categories} />
}
