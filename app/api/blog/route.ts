import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/utils'

export async function GET() {
  const posts = await prisma.blogPost.findMany({
    orderBy: { createdAt: 'desc' },
    include: { category: true },
  })
  return NextResponse.json({ posts })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session || session.user.role?.toLowerCase() !== 'admin')
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const body = await req.json()
  const { title, excerpt, content, coverImage, youtubeUrl, categoryId, tags, readTime, published } = body

  if (!title || !excerpt || !content)
    return NextResponse.json({ error: 'Champs obligatoires manquants.' }, { status: 400 })

  const slug = slugify(title) + '-' + Date.now().toString(36)

  const post = await (prisma.blogPost as any).create({
    data: {
      title,
      slug,
      excerpt,
      content,
      coverImage:  coverImage  || null,
      youtubeUrl:  youtubeUrl  || null,
      categoryId:  categoryId  || null,
      tags:        tags        ?? [],
      readTime:    readTime    ? Number(readTime) : null,
      published:   published   ?? false,
      publishedAt: published   ? new Date() : null,
    },
  })
  return NextResponse.json({ post }, { status: 201 })
}
