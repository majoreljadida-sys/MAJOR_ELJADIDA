'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, Eye, EyeOff, Youtube, Image as ImageIcon, Loader2, Save } from 'lucide-react'

interface Category { id: string; name: string }
interface BlogPost {
  id: string; title: string; excerpt: string; content: string
  coverImage?: string | null; youtubeUrl?: string | null
  categoryId?: string | null; tags: string[]; readTime?: number | null
  published: boolean
}

interface Props {
  post?: BlogPost
  categories: Category[]
}

function getYoutubeId(url: string) {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?]+)/)
  return match ? match[1] : null
}

export function BlogForm({ post, categories }: Props) {
  const router  = useRouter()
  const isEdit  = !!post

  const [loading, setLoading]   = useState(false)
  const [error,   setError]     = useState('')
  const [preview, setPreview]   = useState(false)

  const [title,      setTitle]      = useState(post?.title      ?? '')
  const [excerpt,    setExcerpt]    = useState(post?.excerpt    ?? '')
  const [content,    setContent]    = useState(post?.content    ?? '')
  const [coverImage, setCoverImage] = useState(post?.coverImage ?? '')
  const [youtubeUrl, setYoutubeUrl] = useState(post?.youtubeUrl ?? '')
  const [categoryId, setCategoryId] = useState(post?.categoryId ?? '')
  const [tags,       setTags]       = useState(post?.tags?.join(', ') ?? '')
  const [readTime,   setReadTime]   = useState(post?.readTime?.toString() ?? '')
  const [published,  setPublished]  = useState(post?.published  ?? false)

  const youtubeId = youtubeUrl ? getYoutubeId(youtubeUrl) : null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !excerpt.trim() || !content.trim()) {
      setError('Titre, résumé et contenu sont obligatoires.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const body = {
        title: title.trim(),
        excerpt: excerpt.trim(),
        content: content.trim(),
        coverImage: coverImage.trim() || null,
        youtubeUrl: youtubeUrl.trim() || null,
        categoryId: categoryId || null,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        readTime: readTime ? Number(readTime) : null,
        published,
      }
      const url    = isEdit ? `/api/blog/${post!.id}` : '/api/blog'
      const method = isEdit ? 'PATCH' : 'POST'
      const res    = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const data   = await res.json()
      if (!res.ok) throw new Error(data.error)
      router.push('/admin/blog')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-bebas text-4xl text-white tracking-widest">
            {isEdit ? 'MODIFIER L\'ARTICLE' : 'NOUVEL ARTICLE'}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setPreview(p => !p)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-700 text-gray-400 hover:text-white text-sm font-inter transition-colors">
            {preview ? <EyeOff size={15} /> : <Eye size={15} />}
            {preview ? 'Éditeur' : 'Aperçu'}
          </button>
          <button type="submit" disabled={loading}
            className="btn-primary flex items-center gap-2 px-5 py-2.5 text-sm font-semibold disabled:opacity-50">
            {loading ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            {isEdit ? 'Enregistrer' : 'Créer l\'article'}
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 bg-red-900/20 border border-red-700/40 rounded-xl px-4 py-3 mb-6 text-red-400 text-sm font-inter">
          <AlertCircle size={15} className="flex-shrink-0" />{error}
        </div>
      )}

      {preview ? (
        /* ── Aperçu ── */
        <div className="card-dark prose-invert">
          {youtubeId && (
            <div className="mb-6 rounded-xl overflow-hidden aspect-video">
              <iframe
                src={`https://www.youtube.com/embed/${youtubeId}`}
                className="w-full h-full"
                allowFullScreen
                title={title}
              />
            </div>
          )}
          {coverImage && !youtubeId && (
            <img src={coverImage} alt={title} className="w-full h-56 object-cover rounded-xl mb-6" />
          )}
          <h1 className="font-bebas text-3xl text-white tracking-widest mb-3">{title || 'Titre de l\'article'}</h1>
          <p className="text-gray-400 font-inter text-sm mb-6">{excerpt}</p>
          <div className="text-gray-300 font-inter text-sm leading-relaxed whitespace-pre-wrap">{content}</div>
        </div>
      ) : (
        /* ── Formulaire ── */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-5">
            <div className="card-dark space-y-4">
              <div>
                <label className="form-label">Titre *</label>
                <input className="input-dark" placeholder="Titre de l'article"
                  value={title} onChange={e => setTitle(e.target.value)} />
              </div>
              <div>
                <label className="form-label">Résumé *</label>
                <textarea className="input-dark resize-none" rows={2}
                  placeholder="Courte description affichée sur la liste des articles"
                  value={excerpt} onChange={e => setExcerpt(e.target.value)} />
              </div>
            </div>

            <div className="card-dark">
              <label className="form-label mb-2 block">Contenu de l'article *</label>
              <p className="text-gray-600 text-xs font-inter mb-3">
                Rédigez votre contenu librement. Utilisez des lignes vides pour séparer les paragraphes.
                Mettez en <strong style={{color:'#4ecca3'}}>**gras**</strong> avec des double étoiles.
              </p>
              <textarea className="input-dark resize-none font-mono text-sm" rows={16}
                placeholder="Rédigez votre article ici..."
                value={content} onChange={e => setContent(e.target.value)} />
            </div>
          </div>

          {/* Colonne latérale */}
          <div className="space-y-5">

            {/* Publication */}
            <div className="card-dark space-y-3">
              <h3 className="text-white font-oswald uppercase tracking-wide text-sm">Publication</h3>
              <label className="flex items-center gap-3 cursor-pointer">
                <div className={`relative w-10 h-5 rounded-full transition-colors ${published ? 'bg-major-primary' : 'bg-gray-700'}`}>
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${published ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </div>
                <span className="text-sm font-inter text-gray-300">
                  {published ? <><Eye size={13} className="inline mr-1 text-major-accent" />Publié</> : <><EyeOff size={13} className="inline mr-1" />Brouillon</>}
                </span>
                <input type="checkbox" className="hidden" checked={published} onChange={e => setPublished(e.target.checked)} />
              </label>
              <p className="text-gray-600 text-xs font-inter">
                {published ? 'Visible par tous les visiteurs.' : 'Non visible sur le blog public.'}
              </p>
            </div>

            {/* Catégorie & meta */}
            <div className="card-dark space-y-3">
              <h3 className="text-white font-oswald uppercase tracking-wide text-sm">Informations</h3>
              <div>
                <label className="form-label">Catégorie</label>
                <select className="input-dark" value={categoryId} onChange={e => setCategoryId(e.target.value)}>
                  <option value="">— Aucune —</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Temps de lecture (min)</label>
                <input type="number" className="input-dark" placeholder="5" min="1" max="60"
                  value={readTime} onChange={e => setReadTime(e.target.value)} />
              </div>
              <div>
                <label className="form-label">Tags (séparés par virgule)</label>
                <input className="input-dark" placeholder="course, endurance, conseils"
                  value={tags} onChange={e => setTags(e.target.value)} />
              </div>
            </div>

            {/* Vidéo YouTube */}
            <div className="card-dark space-y-3">
              <div className="flex items-center gap-2">
                <Youtube size={15} className="text-red-400" />
                <h3 className="text-white font-oswald uppercase tracking-wide text-sm">Vidéo YouTube</h3>
              </div>
              <div>
                <label className="form-label">URL YouTube</label>
                <input className="input-dark" placeholder="https://www.youtube.com/watch?v=..."
                  value={youtubeUrl} onChange={e => setYoutubeUrl(e.target.value)} />
              </div>
              {youtubeId && (
                <div className="rounded-xl overflow-hidden aspect-video">
                  <iframe
                    src={`https://www.youtube.com/embed/${youtubeId}`}
                    className="w-full h-full"
                    allowFullScreen
                    title="Aperçu YouTube"
                  />
                </div>
              )}
              {youtubeUrl && !youtubeId && (
                <p className="text-red-400 text-xs font-inter">URL YouTube invalide.</p>
              )}
              <p className="text-gray-600 text-xs font-inter">La vidéo s'affichera en haut de l'article, à la place de l'image.</p>
            </div>

            {/* Image de couverture */}
            <div className="card-dark space-y-3">
              <div className="flex items-center gap-2">
                <ImageIcon size={15} className="text-major-accent" />
                <h3 className="text-white font-oswald uppercase tracking-wide text-sm">Image de couverture</h3>
              </div>
              <div>
                <label className="form-label">URL de l'image</label>
                <input className="input-dark" placeholder="https://... ou /uploads/..."
                  value={coverImage} onChange={e => setCoverImage(e.target.value)} />
              </div>
              {coverImage && (
                <img src={coverImage} alt="Aperçu" className="w-full h-28 object-cover rounded-xl" />
              )}
              <p className="text-gray-600 text-xs font-inter">Ignorée si une vidéo YouTube est définie.</p>
            </div>

          </div>
        </div>
      )}
    </form>
  )
}
