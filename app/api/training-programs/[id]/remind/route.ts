import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'

type Ctx = { params: { id: string } }

interface SessionMeta {
  meetTime?:  string  // Heure de rassemblement (ex. "06:30")
  startTime?: string  // Heure de départ (ex. "06:45")
  location?:  string  // Lieu de la séance (ex. "Corniche, parking principal")
}

import { SPORT_LEVELS, type LevelSpec, type SessionLevels } from '@/lib/sport-levels'

function formatLevels(levels: any): string {
  if (!levels || typeof levels !== 'object') return ''
  const sl = levels as SessionLevels
  const lines: string[] = []
  for (const def of SPORT_LEVELS) {
    const v = sl[def.jsonKey] as LevelSpec | undefined
    if (!v) continue
    const parts = [v.distance, v.pace].filter(Boolean).join(' · ')
    const note  = v.note ? ` _${v.note}_` : ''
    if (parts || v.note) {
      lines.push(`${def.emoji} *${def.label.toUpperCase()}* : ${parts}${note}`)
    }
  }
  return lines.length ? lines.join('\n') + '\n\n' : ''
}

// Génère le message WhatsApp pour une séance
function buildMessage(session: any, programTitle: string, meta: SessionMeta = {}): string {
  const from = formatDate(new Date(session.dateFrom), 'EEEE dd MMM')
  const to   = session.dateTo ? ` → ${formatDate(new Date(session.dateTo), 'dd MMM')}` : ''

  // Bloc logistique optionnel — n'apparaît que si au moins un champ est rempli
  const logistics: string[] = []
  if (meta.location)  logistics.push(`📍 *Lieu :* ${meta.location}`)
  if (meta.meetTime)  logistics.push(`🕐 *Rassemblement :* ${meta.meetTime}`)
  if (meta.startTime) logistics.push(`🚀 *Départ :* ${meta.startTime}`)
  const logisticsBlock = logistics.length ? logistics.join('\n') + '\n\n' : ''

  const levelsBlock = formatLevels(session.levels)

  return (
    `🏃 *Club MAJOR — ${programTitle}*\n\n` +
    `📅 *${from}${to}*\n` +
    `💪 *${session.title}*\n\n` +
    `${session.description}\n\n` +
    levelsBlock +
    logisticsBlock +
    `_Bonne séance à tous ! 💚_`
  )
}

export async function POST(req: Request, { params }: Ctx) {
  const session = await auth()
  const role = session?.user.role
  if (!session || (role !== 'ADMIN' && role !== 'COACH'))
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  try {
    const body = await req.json()
    const { sessionId, meetTime, startTime, location } = body as
      { sessionId: string } & SessionMeta

    const program = await prisma.trainingProgram.findUnique({
      where:   { id: params.id },
      include: { sessions: true },
    })
    if (!program) return NextResponse.json({ error: 'Programme introuvable' }, { status: 404 })

    const trainingSession = program.sessions.find(s => s.id === sessionId)
    if (!trainingSession) return NextResponse.json({ error: 'Séance introuvable' }, { status: 404 })

    const message = buildMessage(trainingSession, program.title, { meetTime, startTime, location })
    const encoded = encodeURIComponent(message)

    // Marquer comme envoyé
    await prisma.trainingProgramSession.update({
      where: { id: sessionId },
      data:  { reminderSent: true },
    })

    // Si groupe WhatsApp configuré
    // On utilise api.whatsapp.com/send directement (pas wa.me) pour préserver
    // l'encoding UTF-8 des emojis — wa.me redirige et re-encode parfois en cassant les bytes.
    const group = program.whatsappGroup
    let waLink: string
    if (!group) {
      waLink = `https://api.whatsapp.com/send?text=${encoded}`
    } else if (group.includes('chat.whatsapp.com')) {
      // Lien d'invitation groupe : WhatsApp ne supporte pas le pré-remplissage
      waLink = group
    } else {
      const phone = group.replace(/\D/g, '')
      waLink = `https://api.whatsapp.com/send?phone=${phone}&text=${encoded}`
    }

    return NextResponse.json({ ok: true, waLink, message })
  } catch (err) {
    console.error('[REMIND]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
