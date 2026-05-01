import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  if (searchParams.get('key') !== 'major2026seed') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  // Ajouter la colonne present_count si elle n'existe pas
  await prisma.$executeRawUnsafe(`
    ALTER TABLE training_sessions
    ADD COLUMN IF NOT EXISTS present_count INTEGER;
  `)

  return NextResponse.json({ ok: true, message: 'Colonne present_count ajoutée.' })
}
