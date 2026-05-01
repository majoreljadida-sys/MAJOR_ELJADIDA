import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  if (searchParams.get('key') !== 'major2026seed') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const deleted = await prisma.trainingProgram.deleteMany({ where: { month: 4, year: 2026 } })
  return NextResponse.json({ ok: true, deleted: deleted.count })
}
