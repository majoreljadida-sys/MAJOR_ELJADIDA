import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'

// POST FormData { file: File } → uploade sur Vercel Blob et retourne { url }
// Endpoint sans authentification pour permettre l'upload pendant l'inscription
// (le user n'a pas encore de compte). Validation stricte du type/taille.
export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file     = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'Fichier manquant.' }, { status: 400 })

    const allowed = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowed.includes(file.type))
      return NextResponse.json({ error: 'Format accepté : JPG, PNG, WebP.' }, { status: 400 })

    if (file.size > 5 * 1024 * 1024)
      return NextResponse.json({ error: 'Image trop lourde (max 5 MB).' }, { status: 400 })

    const ext      = (file.name.split('.').pop() || 'jpg').toLowerCase()
    const filename = `avatars/avatar_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`

    const blob = await put(filename, file, { access: 'public' })

    return NextResponse.json({ url: blob.url })
  } catch (err) {
    console.error('[UPLOAD AVATAR]', err)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
