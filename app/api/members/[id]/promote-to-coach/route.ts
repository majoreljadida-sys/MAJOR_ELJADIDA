import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type Ctx = { params: { id: string } }

// POST — promouvoir un adhérent en coach
// Crée une fiche Coach pour le User existant + change User.role = COACH.
// La fiche Member est conservée (le coach reste adhérent — paiements, présences, inscriptions).
export async function POST(req: Request, { params }: Ctx) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN')
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  try {
    const { specialty, bio } = await req.json().catch(() => ({}))

    const member = await prisma.member.findUnique({
      where:   { id: params.id },
      include: { user: { include: { coach: true } } },
    })
    if (!member)            return NextResponse.json({ error: 'Adhérent introuvable.' }, { status: 404 })
    if (member.user.coach)  return NextResponse.json({ error: 'Cette personne est déjà coach.' }, { status: 400 })

    // Création atomique : Coach + update du rôle User
    const [coach] = await prisma.$transaction([
      prisma.coach.create({
        data: {
          userId:    member.userId,
          firstName: member.firstName,
          lastName:  member.lastName,
          phone:     member.phone,
          photo:     member.photo,
          specialty: specialty || null,
          bio:       bio || null,
        },
      }),
      prisma.user.update({
        where: { id: member.userId },
        data:  { role: 'COACH' },
      }),
    ])

    return NextResponse.json({ coach }, { status: 201 })
  } catch (err) {
    console.error('[PROMOTE TO COACH]', err)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}

// DELETE — retirer le rôle coach (rebascule en MEMBER)
// Désassigne le coach de ses groupes / séances avant de supprimer la fiche Coach.
// La fiche Member reste intacte.
export async function DELETE(_req: Request, { params }: Ctx) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN')
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  try {
    const member = await prisma.member.findUnique({
      where:   { id: params.id },
      include: { user: { include: { coach: true } } },
    })
    if (!member)            return NextResponse.json({ error: 'Adhérent introuvable.' }, { status: 404 })
    if (!member.user.coach) return NextResponse.json({ error: 'Cette personne n\'est pas coach.' }, { status: 400 })

    const coachId = member.user.coach.id

    // Désassignation atomique + suppression
    await prisma.$transaction([
      prisma.trainingGroup.updateMany({
        where: { coachId },
        data:  { coachId: null },
      }),
      prisma.trainingSession.updateMany({
        where: { coachId },
        data:  { coachId: null },
      }),
      prisma.coach.delete({ where: { id: coachId } }),
      prisma.user.update({
        where: { id: member.userId },
        data:  { role: 'MEMBER' },
      }),
    ])

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[DEMOTE FROM COACH]', err)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
