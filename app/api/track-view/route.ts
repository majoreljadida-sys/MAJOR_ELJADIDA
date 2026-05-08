import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Mots-clés courants des bots à exclure
const BOT_PATTERNS = /bot|crawler|spider|crawling|googlebot|bingbot|yahoo|baidu|duckduckbot|facebookexternalhit|whatsapp|telegrambot|slackbot|discordbot|twitterbot|linkedin|pinterest|applebot|petalbot|semrush|ahrefsbot|mj12bot|dotbot|seekport|seznambot|gptbot|claude-web|chatgpt-user|perplexitybot|amazonbot|bytespider/i

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const path = typeof body.path === 'string' ? body.path.slice(0, 200) : null
    if (!path) return NextResponse.json({ ok: false }, { status: 400 })

    // Ne traque pas les pages admin / coach / membre (= activité interne du club)
    if (path.startsWith('/admin') || path.startsWith('/coach') || path.startsWith('/member') || path.startsWith('/api')) {
      return NextResponse.json({ ok: true, skipped: 'internal' })
    }

    // Filtre les bots connus
    const ua = req.headers.get('user-agent') ?? ''
    if (BOT_PATTERNS.test(ua)) {
      return NextResponse.json({ ok: true, skipped: 'bot' })
    }

    // Pays (Vercel Edge ajoute ce header automatiquement)
    const country = req.headers.get('x-vercel-ip-country') ?? null

    // Referer (domaine source si externe)
    let referer: string | null = null
    const ref = req.headers.get('referer')
    if (ref) {
      try {
        const u = new URL(ref)
        // Ignore le referer interne (même domaine)
        const host = req.headers.get('host') ?? ''
        if (u.host !== host) referer = u.host.slice(0, 100)
      } catch { /* referer invalide */ }
    }

    await prisma.pageView.create({
      data: { path, country, referer },
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[TRACK VIEW]', err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
