import { NextResponse } from 'next/server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const session = await auth()
  if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'COACH'))
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const search = searchParams.get('search')
  const page   = parseInt(searchParams.get('page') ?? '1')
  const limit  = parseInt(searchParams.get('limit') ?? '20')

  const where: any = {
    ...(status ? { status } : {}),
    ...(search ? {
      user: {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName:  { contains: search, mode: 'insensitive' } },
          { email:     { contains: search, mode: 'insensitive' } },
        ],
      },
    } : {}),
  }

  const [members, total] = await Promise.all([
    prisma.member.findMany({
      where,
      include: { user: true, group: true },
      orderBy: { createdAt: 'desc' },
      skip:  (page - 1) * limit,
      take:  limit,
    }),
    prisma.member.count({ where }),
  ])

  return NextResponse.json({ members, total, page, limit })
}
