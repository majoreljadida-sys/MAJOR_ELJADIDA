import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import { PenSquare, Plus, Eye, EyeOff, Trash2, Youtube } from 'lucide-react'
import { BlogDeleteButton } from './blog-actions'

export default async function AdminBlogPage() {
  const posts = await prisma.blogPost.findMany({
    orderBy: { createdAt: 'desc' },
    include: { category: true },
  })

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-bebas text-4xl text-white tracking-widest">BLOG</h1>
          <p className="text-gray-400 font-inter text-sm mt-1">{posts.length} article{posts.length > 1 ? 's' : ''} au total</p>
        </div>
        <Link href="/admin/blog/new" className="btn-primary flex items-center gap-2 px-5 py-2.5 text-sm font-semibold">
          <Plus size={16} /> Nouvel article
        </Link>
      </div>

      <div className="card-dark p-0 overflow-hidden">
        <table className="table-dark">
          <thead>
            <tr>
              <th>Article</th>
              <th>Catégorie</th>
              <th>Vues</th>
              <th>Créé le</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.map(post => (
              <tr key={post.id}>
                <td>
                  <div className="flex items-center gap-2.5">
                    {(post as any).youtubeUrl && (
                      <Youtube size={14} className="text-red-400 flex-shrink-0" />
                    )}
                    <div>
                      <p className="text-white font-medium text-sm">{post.title}</p>
                      <p className="text-gray-500 text-xs font-inter truncate max-w-[260px]">{post.excerpt}</p>
                    </div>
                  </div>
                </td>
                <td>
                  {post.category
                    ? <span className="text-xs text-major-accent font-inter">{post.category.name}</span>
                    : <span className="text-xs text-gray-600">—</span>}
                </td>
                <td className="text-gray-400 text-sm">{post.views}</td>
                <td className="text-gray-500 text-xs">{formatDate(post.createdAt, 'dd MMM yyyy')}</td>
                <td>
                  {post.published
                    ? <span className="flex items-center gap-1 text-xs text-major-accent font-inter font-medium"><Eye size={12} /> Publié</span>
                    : <span className="flex items-center gap-1 text-xs text-gray-500 font-inter"><EyeOff size={12} /> Brouillon</span>}
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/blog/${post.id}`}
                      className="flex items-center gap-1 text-xs text-major-accent hover:text-major-primary font-inter transition-colors">
                      <PenSquare size={13} /> Modifier
                    </Link>
                    <BlogDeleteButton postId={post.id} postTitle={post.title} />
                  </div>
                </td>
              </tr>
            ))}
            {posts.length === 0 && (
              <tr><td colSpan={6} className="text-center text-gray-600 py-10 font-inter text-sm">Aucun article. Créez le premier !</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
