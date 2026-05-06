import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { slugify } from '@/lib/utils'
import { sendWelcomeEmail } from '@/lib/email'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { firstName, lastName, email, phone, password, birthDate, cin, city,
            tshirtSize, photo, medicalCertUrl, medicalCertExpiry,
            sportLevel, motivation } = body

    const missing: string[] = []
    if (!firstName)  missing.push('firstName')
    if (!lastName)   missing.push('lastName')
    if (!email)      missing.push('email')
    if (!phone)      missing.push('phone')
    if (!birthDate)  missing.push('birthDate')
    if (!cin)        missing.push('cin')
    if (!password)   missing.push('password')
    if (!sportLevel) missing.push('sportLevel')
    if (!motivation) missing.push('motivation')
    if (missing.length > 0)
      return NextResponse.json({ error: `Champs obligatoires manquants : ${missing.join(', ')}.` }, { status: 400 })

    const VALID_LEVELS = ['DEBUTANT', 'INTERMEDIAIRE', 'CONFIRME', 'COMPETITEUR'] as const
    if (!VALID_LEVELS.includes(sportLevel))
      return NextResponse.json({ error: 'Niveau sportif invalide.' }, { status: 400 })

    const VALID_MOTIVATIONS = ['HEALTH', 'WEIGHT_LOSS', 'PERFORMANCE', 'RACE_PREP'] as const
    if (!VALID_MOTIVATIONS.includes(motivation))
      return NextResponse.json({ error: 'Objectif invalide.' }, { status: 400 })

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
            phone,
            cin:           cin.toUpperCase().trim(),
            photo:         photo || null,
            licenseNumber,
            dateOfBirth:   new Date(birthDate),
            placeOfBirth:  city || null,
            tshirtSize:        tshirtSize || 'M',
            sportLevel,
            motivation,
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
