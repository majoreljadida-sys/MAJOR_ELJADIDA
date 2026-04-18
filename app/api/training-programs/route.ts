import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const month = searchParams.get('month')
  const year  = searchParams.get('year')

  const programs = await prisma.trainingProgram.findMany({
    where: {
      ...(month ? { month: parseInt(month) } : {}),
      ...(year  ? { year:  parseInt(year)  } : {}),
    },
    include: { sessions: { orderBy: { dateFrom: 'asc' } } },
    orderBy: [{ year: 'desc' }, { month: 'desc' }],
  })
  return NextResponse.json({ programs })
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN')
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  try {
    const body = await req.json()
    const { month, year, title, description, whatsappGroup, sessions } = body

    const program = await prisma.trainingProgram.create({
      data: {
        month:  parseInt(month),
        year:   parseInt(year),
        title,
        description: description ?? null,
        whatsappGroup: whatsappGroup ?? null,
        sessions: {
          create: (sessions ?? []).map((s: any) => ({
            dateFrom:    new Date(s.dateFrom),
            dateTo:      s.dateTo ? new Date(s.dateTo) : null,
            title:       s.title,
            description: s.description,
            type:        s.type,
          })),
        },
      },
      include: { sessions: true },
    })
    return NextResponse.json({ program }, { status: 201 })
  } catch (err: any) {
    if (err.code === 'P2002')
      return NextResponse.json({ error: 'Un programme existe déjà pour ce mois.' }, { status: 409 })
    console.error('[PROGRAM POST]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
