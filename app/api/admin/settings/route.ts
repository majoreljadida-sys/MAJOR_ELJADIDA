import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const SINGLETON_ID = 'singleton'

// GET — récupère les paramètres du club (créé un objet vide s'il n'existe pas encore)
export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  let settings = await prisma.clubSettings.findUnique({ where: { id: SINGLETON_ID } })
  if (!settings) {
    settings = await prisma.clubSettings.create({ data: { id: SINGLETON_ID } })
  }
  return NextResponse.json({ settings })
}

// PATCH — met à jour les paramètres (admin seul)
export async function PATCH(req: Request) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN')
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  try {
    const body = await req.json()
    const allowed = [
      'clubName', 'clubAddress', 'clubLogo', 'contactEmail', 'contactPhone',
      'whatsappGroupLink', 'facebookUrl', 'instagramUrl', 'bankAccount', 'bankName',
    ]
    const data: any = {}
    for (const key of allowed) {
      if (key in body) data[key] = body[key] || null
    }

    const settings = await prisma.clubSettings.upsert({
      where:  { id: SINGLETON_ID },
      update: data,
      create: { id: SINGLETON_ID, ...data },
    })

    return NextResponse.json({ settings })
  } catch (err) {
    console.error('[CLUB SETTINGS PATCH]', err)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
