import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/auth/check-email?email=foo@bar.com
// Retourne { available: boolean } — utilisé par le formulaire d'inscription
// pour vérifier la disponibilité d'un email avant de passer à l'étape suivante.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const email = searchParams.get('email')?.trim().toLowerCase()

  if (!email || !email.includes('@'))
    return NextResponse.json({ error: 'Email invalide.' }, { status: 400 })

  const existing = await prisma.user.findUnique({
    where:  { email },
    select: { id: true },
  })

  return NextResponse.json({ available: !existing })
}
