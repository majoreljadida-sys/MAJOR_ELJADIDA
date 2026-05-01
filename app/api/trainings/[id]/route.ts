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

  await prisma.$executeRaw`
    UPDATE training_sessions
    SET present_count = ${count},
        status = CASE WHEN ${count} IS NOT NULL THEN 'COMPLETED'::"SessionStatus" ELSE status END,
        updated_at = NOW()
    WHERE id = ${params.id}
  `

  return NextResponse.json({ ok: true, presentCount: count })
}
