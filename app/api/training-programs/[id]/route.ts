import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type Ctx = { params: { id: string } }

export async function GET(_: Request, { params }: Ctx) {
  const program = await prisma.trainingProgram.findUnique({
    where:   { id: params.id },
    include: { sessions: { orderBy: { dateFrom: 'asc' } } },
  })
  if (!program) return NextResponse.json({ error: 'Introuvable' }, { status: 404 })
  return NextResponse.json({ program })
}

export async function PATCH(req: Request, { params }: Ctx) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN')
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  try {
    const body = await req.json()
    const { title, description, whatsappGroup } = body

    const program = await prisma.trainingProgram.update({
      where: { id: params.id },
      data: {
        ...(title          !== undefined && { title }),
        ...(description    !== undefined && { description }),
        ...(whatsappGroup  !== undefined && { whatsappGroup }),
      },
      include: { sessions: { orderBy: { dateFrom: 'asc' } } },
    })
    return NextResponse.json({ program })
  } catch (err) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function DELETE(_: Request, { params }: Ctx) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN')
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  await prisma.trainingProgram.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
