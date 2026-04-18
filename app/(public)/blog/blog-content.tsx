'use client'

import Link from 'next/link'
import Image from 'next/image'
import { formatDate } from '@/lib/utils'
import { BookOpen, Clock } from 'lucide-react'
import { useLanguage } from '@/lib/i18n/context'
import type { BlogPost, BlogCategory } from '@prisma/client'

type PostWithCat   = BlogPost & { category: BlogCategory | null }
type CatWithCount  = BlogCategory & { _count: { posts: number } }

interface Props {
  categories: CatWithCount[]
  posts:      PostWithCat[]
}

export function BlogContent({ categories, posts }: Props) {
  const { t } = useLanguage()
  const featured = posts[0]
  const rest     = posts.slice(1)

  return (
    <div className="min-h-screen bg-major-black pt-8 pb-20">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-14 text-center">
        <span className="section-tag">{t.blog.tag}</span>
        <h1 className="font-bebas text-6xl text-white tracking-widest mt-2">{t.blog.title}</h1>
        <p className="text-gray-400 font-inter text-base mt-4 max-w-xl mx-auto">
          {t.blog.desc}
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Catégories */}
        <div className="flex flex-wrap gap-2 mb-12 justify-center">
          <span className="badge border-major-primary/40 text-major-accent bg-major-primary/10 px-4 py-1.5 text-xs cursor-pointer">
            {t.blog.all} ({posts.length})
          </span>
          {categories.map(cat => (
            <span key={cat.id} className="badge px-4 py-1.5 text-xs cursor-pointer hover:opacity-80 transition-opacity"
              style={{ color: cat.color ?? '#4CAF82', backgroundColor: `${cat.color ?? '#4CAF82'}15`, borderColor: `${cat.color ?? '#4CAF82'}40` }}>
              {cat.name} ({cat._count.posts})
            </span>
          ))}
        </div>

        {/* Article featured */}
        {featured && (
          <Link href={`/blog/${featured.slug}`} className="group block mb-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 bg-major-surface border border-major-primary/20 rounded-2xl overflow-hidden hover:border-major-primary/60 transition-all duration-300 hover:shadow-xl hover:shadow-major-primary/10">
              {featured.coverImage && (
                <div className="relative h-64 lg:h-auto">
                  <Image src={featured.coverImage} alt={featured.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-major-surface/50" />
                </div>
              )}
              <div className="p-8 lg:p-10 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-4">
                  {featured.category && (
                    <span className="badge text-xs"
                      style={{ color: featured.category.color ?? '#4CAF82', backgroundColor: `${featured.category.color}15`, borderColor: `${featured.category.color}40` }}>
                      {featured.category.name}
                    </span>
                  )}
                  <span className="badge border-major-primary/30 text-major-cyan bg-major-cyan/10 text-xs">{t.blog.featured}</span>
                </div>
                <h2 className="font-oswald text-white text-3xl font-bold leading-tight mb-4 group-hover:text-major-accent transition-colors">
                  {featured.title}
                </h2>
                <p className="text-gray-400 font-inter text-sm leading-relaxed mb-6">{featured.excerpt}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500 font-inter">
                  <span className="flex items-center gap-1.5"><Clock size={12} />{featured.readTime} {t.blog.readMin}</span>
                  <span>·</span>
                  <span>{formatDate(featured.publishedAt!, 'dd MMMM yyyy')}</span>
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* Grille articles */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rest.map(post => (
            <Link key={post.id} href={`/blog/${post.slug}`} className="group card-dark flex flex-col hover:shadow-lg hover:shadow-major-primary/10 transition-all duration-300">
              {post.coverImage && (
                <div className="relative h-44 -mx-5 -mt-5 mb-5 rounded-t-xl overflow-hidden">
                  <Image src={post.coverImage} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-major-surface via-transparent to-transparent" />
                  {post.category && (
                    <span className="absolute bottom-3 left-3 badge text-[10px]"
                      style={{ color: post.category.color ?? '#4CAF82', backgroundColor: `${post.category.color}20`, borderColor: `${post.category.color}40` }}>
                      {post.category.name}
                    </span>
                  )}
                </div>
              )}
              <div className="flex-1 flex flex-col">
                <h3 className="font-oswald text-white font-semibold text-xl leading-tight mb-2 group-hover:text-major-accent transition-colors">
                  {post.title}
                </h3>
                <p className="text-gray-400 text-sm font-inter leading-relaxed flex-1 mb-4">{post.excerpt}</p>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {post.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="text-[10px] font-inter text-gray-600 bg-gray-800/50 px-2 py-0.5 rounded-full">#{tag}</span>
                  ))}
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500 font-inter border-t border-gray-800 pt-3">
                  <BookOpen size={12} />
                  <span>{post.readTime} min</span>
                  <span>·</span>
                  <span>{formatDate(post.publishedAt!, 'dd MMM yyyy')}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {posts.length === 0 && (
          <div className="text-center py-20 text-gray-500 font-inter">
            <BookOpen size={40} className="mx-auto mb-4 opacity-30" />
            <p>{t.blog.noPost}</p>
          </div>
        )}
      </div>
    </div>
  )
}
