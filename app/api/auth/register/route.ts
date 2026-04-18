import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { slugify } from '@/lib/utils'
import { sendWelcomeEmail } from '@/lib/email'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { firstName, lastName, email, phone, password, birthDate, city,
            tshirtSize, category, medicalCertUrl, medicalCertExpiry } = body

    if (!firstName || !lastName || !email || !password)
      return NextResponse.json({ error: 'Champs obligatoires manquants.' }, { status: 400 })

    if (password.length < 8)
      return NextResponse.json({ error: 'Mot de passe trop court.' }, { status: 400 })

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing)
      return NextResponse.json({ error: 'Cet email est déjà utilisé.' }, { status: 409 })

    const hashedPassword = await bcrypt.hash(password, 12)
    const licenseNumber  = `MAJOR-${Date.now()}`

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role:     'MEMBER',
        member: {
          create: {
            firstName,
            lastName,
            phone:         phone || null,
            licenseNumber,
            dateOfBirth:   birthDate ? new Date(birthDate) : null,
            placeOfBirth:  city || null,
            tshirtSize:        tshirtSize || 'M',
            category:          category || 'SENIOR',
            medicalCertUrl:    medicalCertUrl    || null,
            medicalCertExpiry: medicalCertExpiry ? new Date(medicalCertExpiry) : null,
            status:            'PENDING',
          },
        },
      },
    })

    // Email de bienvenue (async, ne bloque pas la réponse)
    sendWelcomeEmail(email, firstName, licenseNumber).catch(console.error)

    return NextResponse.json({ success: true, userId: user.id }, { status: 201 })
  } catch (err) {
    console.error('[REGISTER]', err)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
