import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session || !['ADMIN', 'COACH'].includes(session.user.role ?? ''))
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { presentCount } = await req.json()
  const count = presentCount === '' || presentCount === null || presentCount === undefined
    ? null
    : parseInt(presentCount)

  await prisma.$executeRaw`UPDATE training_sessions SET present_count = ${count} WHERE id = ${params.id}`

  if (count !== null) {
    await prisma.trainingSession.update({ where: { id: params.id }, data: { status: 'COMPLETED' } })
  }

  return NextResponse.json({ ok: true, presentCount: count })
}
