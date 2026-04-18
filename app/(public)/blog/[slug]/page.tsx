import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import { ArrowLeft, Clock, Calendar, Tag, BookOpen } from 'lucide-react'

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await prisma.blogPost.findUnique({ where: { slug: params.slug } })
  if (!post) return { title: 'Article introuvable' }
  return { title: post.title, description: post.excerpt }
}

export default async function BlogPostPage({ params }: Props) {
  const post = await prisma.blogPost.findUnique({
    where:   { slug: params.slug, published: true },
    include: { category: true },
  })
  if (!post) notFound()

  // Incrémenter les vues
  await prisma.blogPost.update({ where: { id: post.id }, data: { views: { increment: 1 } } })

  // Articles connexes
  const related = await prisma.blogPost.findMany({
    where: { published: true, categoryId: post.categoryId, id: { not: post.id } },
    take:  3,
    include: { category: true },
    orderBy: { publishedAt: 'desc' },
  })

  // Rendu markdown simple (pour le seed, le contenu est en markdown-like)
  function renderContent(content: string) {
    return content
  }

  return (
    <div className="min-h-screen bg-major-black pb-24">
      {/* Vidéo YouTube ou Image de couverture */}
      {(post as any).youtubeUrl ? (() => {
        const ytId = ((post as any).youtubeUrl as string).match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?]+)/)?.[1]
        return ytId ? (
          <div className="w-full aspect-video max-h-[520px] bg-black">
            <iframe
              src={`https://www.youtube.com/embed/${ytId}`}
              className="w-full h-full"
              allowFullScreen
              title={post.title}
            />
          </div>
        ) : null
      })() : post.coverImage && (
        <div className="relative h-72 sm:h-96 overflow-hidden">
          <Image src={post.coverImage} alt={post.title} fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-major-black/40 to-major-black" />
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 py-6">
          <Link href="/blog" className="text-gray-500 hover:text-major-accent transition-colors flex items-center gap-1.5 text-sm font-inter">
            <ArrowLeft size={15} /> Blog
          </Link>
          <span className="text-gray-700">/</span>
          <span className="text-gray-400 text-sm font-inter truncate">{post.title}</span>
        </div>

        {/* Category + meta */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          {post.category && (
            <Link href={`/blog?category=${post.category.slug}`}
              className="badge text-sm px-3 py-1"
              style={{ color: post.category.color ?? '#4CAF82', backgroundColor: `${post.category.color}15`, borderColor: `${post.category.color}40` }}>
              {post.category.name}
            </Link>
          )}
          <span className="flex items-center gap-1.5 text-gray-500 text-sm font-inter">
            <Clock size={13} /> {post.readTime} min de lecture
          </span>
          <span className="flex items-center gap-1.5 text-gray-500 text-sm font-inter">
            <Calendar size={13} /> {formatDate(post.publishedAt!, 'dd MMMM yyyy')}
          </span>
          <span className="flex items-center gap-1.5 text-gray-500 text-sm font-inter">
            <BookOpen size={13} /> {post.views} vues
          </span>
        </div>

        {/* Title */}
        <h1 className="font-oswald text-white text-4xl sm:text-5xl font-bold leading-tight mb-6">
          {post.title}
        </h1>
        <p className="text-gray-400 font-inter text-lg leading-relaxed mb-8 border-l-4 border-major-primary pl-4">
          {post.excerpt}
        </p>

        {/* Content */}
        <article className="prose-major">
          {post.content.split('\n').map((line, i) => {
            if (line.startsWith('# '))  return <h1  key={i}>{line.slice(2)}</h1>
            if (line.startsWith('## ')) return <h2  key={i}>{line.slice(3)}</h2>
            if (line.startsWith('### '))return <h3  key={i}>{line.slice(4)}</h3>
            if (line.startsWith('> '))  return <blockquote key={i}>{line.slice(2)}</blockquote>
            if (line.startsWith('- '))  return <p key={i} className="flex gap-2"><span className="text-major-accent">•</span>{line.slice(2)}</p>
            if (line.match(/^\d+\. /)) return <p key={i} className="pl-4">{line}</p>
            if (line.trim() === '')   return <br key={i} />
            // Handle **bold** inline
            const parts = line.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/)
            return (
              <p key={i}>
                {parts.map((p2, j) => {
                  if (p2.startsWith('**')) return <strong key={j} className="text-white font-semibold">{p2.slice(2,-2)}</strong>
                  if (p2.startsWith('*'))  return <em key={j} className="text-major-cyan">{p2.slice(1,-1)}</em>
                  return p2
                })}
              </p>
            )
          })}
        </article>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-10 pt-6 border-t border-gray-800">
            <Tag size={14} className="text-gray-500 mt-0.5" />
            {post.tags.map(tag => (
              <span key={tag} className="text-xs font-inter text-gray-500 bg-gray-800/60 px-3 py-1 rounded-full">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* CTA club */}
        <div className="mt-12 p-6 bg-major-surface border border-major-primary/20 rounded-2xl text-center">
          <p className="font-oswald text-white text-xl uppercase tracking-wide mb-2">Progressez avec le Club MAJOR</p>
          <p className="text-gray-400 text-sm font-inter mb-4">Rejoignez nos entraînements encadrés et mettez en pratique ces conseils avec nos coachs.</p>
          <div className="flex gap-3 justify-center">
            <Link href="/register" className="btn-primary text-sm px-6 py-2">Adhérer au club</Link>
            <Link href="/coach-major" className="btn-secondary text-sm px-6 py-2">Coach MAJOR</Link>
          </div>
        </div>

        {/* Articles connexes */}
        {related.length > 0 && (
          <div className="mt-16">
            <h3 className="font-oswald text-white text-2xl uppercase tracking-wide mb-6">Articles connexes</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {related.map(r => (
                <Link key={r.id} href={`/blog/${r.slug}`} className="group card-dark hover:border-major-primary/50 transition-all">
                  <h4 className="font-oswald text-white font-semibold text-base leading-tight mb-2 group-hover:text-major-accent transition-colors">{r.title}</h4>
                  <p className="text-gray-500 text-xs font-inter">{r.readTime} min · {formatDate(r.publishedAt!, 'dd MMM yyyy')}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
