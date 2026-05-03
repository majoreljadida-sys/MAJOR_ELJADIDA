import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { SettingsClient } from './settings-client'

export const dynamic = 'force-dynamic'

const SINGLETON_ID = 'singleton'

export default async function AdminSettingsPage() {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') redirect('/login')

  let settings = await prisma.clubSettings.findUnique({ where: { id: SINGLETON_ID } })
  if (!settings) {
    settings = await prisma.clubSettings.create({ data: { id: SINGLETON_ID } })
  }

  return (
    <SettingsClient
      initial={{
        clubName:          settings.clubName          ?? '',
        clubAddress:       settings.clubAddress       ?? '',
        clubLogo:          settings.clubLogo          ?? '',
        contactEmail:      settings.contactEmail      ?? '',
        contactPhone:      settings.contactPhone      ?? '',
        whatsappGroupLink: settings.whatsappGroupLink ?? '',
        facebookUrl:       settings.facebookUrl       ?? '',
        instagramUrl:      settings.instagramUrl      ?? '',
        bankAccount:       settings.bankAccount       ?? '',
        bankName:          settings.bankName          ?? '',
      }}
    />
  )
}
