import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { put } from '@vercel/blob'

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const formData = await req.formData()
    const file     = formData.get('file') as File | null
    const expiry   = formData.get('expiry') as string | null
    const memberId = formData.get('memberId') as string | null

    if (!file)     return NextResponse.json({ error: 'Fichier manquant.' }, { status: 400 })
    if (!expiry)   return NextResponse.json({ error: 'Date d\'expiration manquante.' }, { status: 400 })
    if (!memberId) return NextResponse.json({ error: 'Membre introuvable.' }, { status: 400 })

    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
    if (!allowed.includes(file.type))
      return NextResponse.json({ error: 'Format accepté : PDF, JPG, PNG.' }, { status: 400 })

    if (file.size > 5 * 1024 * 1024)
      return NextResponse.json({ error: 'Fichier trop volumineux (max 5 MB).' }, { status: 400 })

    const ext      = file.name.split('.').pop()
    const filename = `certificates/cert_${memberId}_${Date.now()}.${ext}`

    const blob = await put(filename, file, { access: 'public' })

    await prisma.member.update({
      where: { id: memberId },
      data: {
        medicalCertUrl:    blob.url,
        medicalCertExpiry: new Date(expiry),
      },
    })

    return NextResponse.json({ url: blob.url, expiry: new Date(expiry).toISOString() })
  } catch (err) {
    console.error('[UPLOAD CERT]', err)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
