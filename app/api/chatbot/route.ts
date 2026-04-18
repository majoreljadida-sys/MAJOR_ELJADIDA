import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const SYSTEM_PROMPT = `Tu es Coach MAJOR, l'assistant running officiel du Club MAJOR de El Jadida (Mazagan), Maroc.

Tu es un coach sportif expert en course à pied, chaleureux et motivant. Tu réponds toujours en français.

Tes domaines d'expertise :
- Entraînement running (VMA, VO2max, fractionné, endurance, sortie longue)
- Préparation aux courses (10km, semi-marathon, marathon, trail)
- Nutrition sportive avant/pendant/après l'effort
- Récupération, étirements, prévention des blessures
- Choix d'équipement (chaussures, montres GPS, vêtements)
- Le Club MAJOR : entraînements, événements, adhésion à El Jadida

Règles importantes :
- Réponds toujours en français
- Sois encourageant et positif
- Donne des conseils pratiques et concrets
- Pour les blessures ou douleurs, conseille toujours de consulter un médecin
- Reste focalisé sur le running et le sport
- Mentionne le Club MAJOR quand c'est pertinent
- Réponds de façon concise (3-5 phrases max sauf si on te demande un plan détaillé)`

export async function POST(req: Request) {
  try {
    const { message, sessionId } = await req.json()
    if (!message?.trim()) return NextResponse.json({ error: 'Message vide' }, { status: 400 })

    let answer: string

    const apiKey = process.env.GROQ_API_KEY
    console.log('[CHATBOT] GROQ_API_KEY présente :', !!apiKey)

    if (apiKey) {
      // ── Réponse via Groq IA ───────────────────────────────────────────
      const groqClient = new Groq({ apiKey })
      const completion = await groqClient.chat.completions.create({
        model:    'llama-3.3-70b-versatile',
        messages: [
          { role: 'system',  content: SYSTEM_PROMPT },
          { role: 'user',    content: message },
        ],
        temperature: 0.7,
        max_tokens:  600,
      })
      answer = completion.choices[0]?.message?.content ?? 'Désolé, je n\'ai pas pu générer une réponse.'
      console.log('[CHATBOT] Réponse Groq OK')
    } else {
      answer = '⚠️ Clé GROQ_API_KEY manquante dans le fichier .env'
    }

    // Log en base (best effort)
    try {
      await prisma.chatbotLog.create({
        data: {
          sessionId: sessionId ?? 'anonymous',
          message,
          response: answer,
        },
      })
    } catch { /* ignore */ }

    return NextResponse.json({ answer })
  } catch (err) {
    console.error('[CHATBOT]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
