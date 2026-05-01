import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'

type Ctx = { params: { id: string } }

// Génère le message WhatsApp pour une séance
function buildMessage(session: any, programTitle: string): string {
  const from = formatDate(new Date(session.dateFrom), 'EEEE dd MMM')
  const to   = session.dateTo ? ` → ${formatDate(new Date(session.dateTo), 'dd MMM')}` : ''
  return (
    `🏃 *Club MAJOR — ${programTitle}*\n\n` +
    `📅 *${from}${to}*\n` +
    `💪 *${session.title}*\n\n` +
    `${session.description}\n\n` +
    `_Bonne séance à tous ! 💚_`
  )
}

export async function POST(req: Request, { params }: Ctx) {
  const session = await auth()
  if (!session || session.user.role?.toLowerCase() !== 'admin')
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  try {
    const body = await req.json()
    const { sessionId } = body

    const program = await prisma.trainingProgram.findUnique({
      where:   { id: params.id },
      include: { sessions: true },
    })
    if (!program) return NextResponse.json({ error: 'Programme introuvable' }, { status: 404 })

    const trainingSession = program.sessions.find(s => s.id === sessionId)
    if (!trainingSession) return NextResponse.json({ error: 'Séance introuvable' }, { status: 404 })

    const message = buildMessage(trainingSession, program.title)
    const encoded = encodeURIComponent(message)

    // Marquer comme envoyé
    await prisma.trainingProgramSession.update({
      where: { id: sessionId },
      data:  { reminderSent: true },
    })

    // Si groupe WhatsApp configuré
    const group = program.whatsappGroup
    let waLink: string
    if (!group) {
      waLink = `https://wa.me/?text=${encoded}`
    } else if (group.includes('chat.whatsapp.com')) {
      // Lien d'invitation groupe : WhatsApp ne supporte pas le pré-remplissage
      waLink = group
    } else {
      waLink = `https://wa.me/${group.replace(/\D/g, '')}?text=${encoded}`
    }

    return NextResponse.json({ ok: true, waLink, message })
  } catch (err) {
    console.error('[REMIND]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
