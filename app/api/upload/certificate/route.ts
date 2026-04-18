import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

export async function POST(req: Request) {
  try {
    const formData  = await req.formData()
    const file      = formData.get('file') as File | null
    const expiry    = formData.get('expiry') as string | null
    const memberId  = formData.get('memberId') as string | null

    if (!file) return NextResponse.json({ error: 'Fichier manquant.' }, { status: 400 })
    if (!expiry) return NextResponse.json({ error: 'Date d\'expiration manquante.' }, { status: 400 })

    // Vérification type fichier
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
    if (!allowed.includes(file.type))
      return NextResponse.json({ error: 'Format accepté : PDF, JPG, PNG.' }, { status: 400 })

    // Vérification taille (max 5 MB)
    if (file.size > 5 * 1024 * 1024)
      return NextResponse.json({ error: 'Fichier trop volumineux (max 5 MB).' }, { status: 400 })

    // Sauvegarde du fichier
    const ext      = file.name.split('.').pop()
    const filename = `cert_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'certificates')

    await mkdir(uploadDir, { recursive: true })
    const bytes  = await file.arrayBuffer()
    await writeFile(join(uploadDir, filename), Buffer.from(bytes))

    const certUrl = `/uploads/certificates/${filename}`

    // Si un memberId est fourni (mise à jour profil), on met à jour directement
    if (memberId) {
      const session = await auth()
      if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

      await prisma.member.update({
        where: { id: memberId },
        data: {
          medicalCertUrl:    certUrl,
          medicalCertExpiry: new Date(expiry),
        },
      })
    }

    return NextResponse.json({
      url:    certUrl,
      expiry: new Date(expiry).toISOString(),
    })
  } catch (err) {
    console.error('[UPLOAD CERT]', err)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
