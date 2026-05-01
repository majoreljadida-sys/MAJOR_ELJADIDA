import { NextResponse } from 'next/server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendValidationEmail } from '@/lib/email'

interface Params { params: { id: string } }

export async function GET(_req: Request, { params }: Params) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  // Members can only fetch their own profile; admins/coaches can fetch any
  if (session.user.role?.toLowerCase() === 'member' && session.user.profileId !== params.id)
    return NextResponse.json({ error: 'Interdit' }, { status: 403 })

  const member = await prisma.member.findUnique({
    where:   { id: params.id },
    include: { user: true, group: true },
  })
  if (!member) return NextResponse.json({ error: 'Introuvable' }, { status: 404 })

  return NextResponse.json({ member, user: member.user })
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await auth()
  if (!session || session.user.role?.toLowerCase() !== 'admin')
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  try {
    const member = await prisma.member.findUnique({
      where: { id: params.id },
      select: { userId: true },
    })
    if (!member) return NextResponse.json({ error: 'Introuvable' }, { status: 404 })

    await prisma.attendance.deleteMany({ where: { memberId: params.id } })
    await prisma.eventRegistration.deleteMany({ where: { memberId: params.id } })
    await prisma.payment.deleteMany({ where: { memberId: params.id } })
    await prisma.member.delete({ where: { id: params.id } })
    await prisma.user.delete({ where: { id: member.userId } })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[MEMBER DELETE]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: Params) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const isAdmin  = session.user.role?.toLowerCase() === 'admin'
  const isSelf   = session.user.profileId === params.id

  if (!isAdmin && !isSelf)
    return NextResponse.json({ error: 'Interdit' }, { status: 403 })

  const body = await req.json()
  const {
    firstName, lastName, phone,
    city, tshirtSize, category,
    memberStatus, // admin-only field
  } = body

  try {
    // Update member fields (firstName, lastName, phone are on Member, not User)
    const memberData: any = {}
    if (firstName         !== undefined) memberData.firstName         = firstName
    if (lastName          !== undefined) memberData.lastName          = lastName
    if (phone             !== undefined) memberData.phone             = phone
    if (city              !== undefined) memberData.placeOfBirth      = city
    if (tshirtSize        !== undefined) memberData.tshirtSize        = tshirtSize
    if (category          !== undefined) memberData.category          = category
    if (isAdmin && memberStatus !== undefined) memberData.status      = memberStatus

    // Lire le statut actuel avant mise à jour (pour détecter la transition → ACTIVE)
    const before = await prisma.member.findUnique({
      where: { id: params.id },
      select: { status: true, user: { select: { email: true } } },
    })

    const updated = await prisma.member.update({
      where: { id: params.id },
      data:  memberData,
    })

    // Email de validation si le statut vient de passer à ACTIVE
    if (isAdmin && memberData.status === 'ACTIVE' && before?.status !== 'ACTIVE') {
      sendValidationEmail(
        before!.user.email,
        updated.firstName,
        updated.licenseNumber ?? '',
      ).catch(console.error)
    }

    return NextResponse.json({ member: updated })
  } catch (err) {
    console.error('[MEMBER PATCH]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
