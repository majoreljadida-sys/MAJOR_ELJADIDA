import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface Params { params: { id: string } }

export async function PATCH(req: Request, { params }: Params) {
  const session = await auth()
  if (!session || session.user.role?.toLowerCase() !== 'admin')
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const body = await req.json()
  const { title, excerpt, content, coverImage, youtubeUrl, categoryId, tags, readTime, published } = body

  const data: any = {}
  if (title       !== undefined) data.title       = title
  if (excerpt     !== undefined) data.excerpt      = excerpt
  if (content     !== undefined) data.content      = content
  if (coverImage  !== undefined) data.coverImage   = coverImage  || null
  if (youtubeUrl  !== undefined) data.youtubeUrl   = youtubeUrl  || null
  if (categoryId  !== undefined) data.categoryId   = categoryId  || null
  if (tags        !== undefined) data.tags         = tags
  if (readTime    !== undefined) data.readTime     = readTime ? Number(readTime) : null
  if (published   !== undefined) {
    data.published   = published
    data.publishedAt = published ? new Date() : null
  }

  const post = await (prisma.blogPost as any).update({ where: { id: params.id }, data })

  revalidatePath('/admin/blog')
  revalidatePath('/blog')
  revalidatePath(`/blog/${post.slug}`)

  return NextResponse.json({ post })
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await auth()
  if (!session || session.user.role?.toLowerCase() !== 'admin')
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const post = await prisma.blogPost.delete({ where: { id: params.id } })

  revalidatePath('/admin/blog')
  revalidatePath('/blog')
  revalidatePath(`/blog/${post.slug}`)

  return NextResponse.json({ success: true })
}
