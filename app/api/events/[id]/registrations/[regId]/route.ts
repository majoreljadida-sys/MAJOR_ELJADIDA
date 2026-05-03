import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type Ctx = { params: { id: string; regId: string } }

// PATCH — l'admin valide ou annule la validation d'un paiement
export async function PATCH(req: Request, { params }: Ctx) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN')
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  try {
    const { paid, bib, notes } = await req.json()

    const reg = await prisma.eventRegistration.findUnique({ where: { id: params.regId } })
    if (!reg)                       return NextResponse.json({ error: 'Inscription introuvable.' }, { status: 404 })
    if (reg.eventId !== params.id)  return NextResponse.json({ error: 'Inscription incohérente.' }, { status: 400 })

    const updated = await prisma.eventRegistration.update({
      where: { id: reg.id },
      data: {
        ...(paid !== undefined  && { paidAt: paid ? new Date() : null }),
        ...(bib   !== undefined && { bib }),
        ...(notes !== undefined && { notes }),
      },
    })

    revalidatePath('/admin/events')
    revalidatePath(`/admin/events/${params.id}`)
    revalidatePath('/events')

    return NextResponse.json({ registration: updated })
  } catch (err) {
    console.error('[ADMIN EVENT REG PATCH]', err)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}

// DELETE — l'admin retire un inscrit
export async function DELETE(_req: Request, { params }: Ctx) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN')
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  try {
    const reg = await prisma.eventRegistration.findUnique({ where: { id: params.regId } })
    if (!reg)                       return NextResponse.json({ error: 'Inscription introuvable.' }, { status: 404 })
    if (reg.eventId !== params.id)  return NextResponse.json({ error: 'Inscription incohérente.' }, { status: 400 })

    await prisma.eventRegistration.delete({ where: { id: reg.id } })

    revalidatePath('/admin/events')
    revalidatePath(`/admin/events/${params.id}`)
    revalidatePath('/events')

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[ADMIN EVENT REG DELETE]', err)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
