import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST — un utilisateur connecté change son mot de passe
// Body : { currentPassword, newPassword }
export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Non connecté' }, { status: 401 })

  try {
    const { currentPassword, newPassword } = await req.json()

    if (!currentPassword || !newPassword)
      return NextResponse.json({ error: 'Mot de passe actuel et nouveau requis.' }, { status: 400 })
    if (newPassword.length < 8)
      return NextResponse.json({ error: 'Le nouveau mot de passe doit faire au moins 8 caractères.' }, { status: 400 })
    if (currentPassword === newPassword)
      return NextResponse.json({ error: 'Le nouveau mot de passe doit être différent de l\'actuel.' }, { status: 400 })

    const user = await prisma.user.findUnique({ where: { id: session.user.id } })
    if (!user) return NextResponse.json({ error: 'Compte introuvable.' }, { status: 404 })

    const isValid = await bcrypt.compare(currentPassword, user.password)
    if (!isValid) return NextResponse.json({ error: 'Mot de passe actuel incorrect.' }, { status: 400 })

    const hashed = await bcrypt.hash(newPassword, 12)
    await prisma.user.update({
      where: { id: user.id },
      data:  { password: hashed },
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[CHANGE PASSWORD]', err)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
