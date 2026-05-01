import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session || !['ADMIN', 'COACH'].includes(session.user.role ?? ''))
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { presentCount, status } = await req.json()

  const updated = await prisma.trainingSession.update({
    where: { id: params.id },
    data: {
      ...(presentCount !== undefined ? { presentCount: presentCount === '' ? null : parseInt(presentCount) } : {}),
      ...(status ? { status } : {}),
      ...(presentCount !== undefined && presentCount !== '' ? { status: 'COMPLETED' } : {}),
    },
  })

  return NextResponse.json({ training: updated })
}
