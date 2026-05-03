import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { put } from '@vercel/blob'

// POST FormData { file: File } → uploade sur Vercel Blob et retourne { url }
// Utilisé par le formulaire blog pour l'image de couverture.
export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN')
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const formData = await req.formData()
    const file     = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'Fichier manquant.' }, { status: 400 })

    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowed.includes(file.type))
      return NextResponse.json({ error: 'Format accepté : JPG, PNG, WebP, GIF.' }, { status: 400 })

    if (file.size > 8 * 1024 * 1024)
      return NextResponse.json({ error: 'Fichier trop volumineux (max 8 MB).' }, { status: 400 })

    const ext      = (file.name.split('.').pop() || 'jpg').toLowerCase()
    const filename = `blog/cover_${Date.now()}.${ext}`

    const blob = await put(filename, file, { access: 'public' })

    return NextResponse.json({ url: blob.url })
  } catch (err) {
    console.error('[UPLOAD BLOG IMAGE]', err)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
