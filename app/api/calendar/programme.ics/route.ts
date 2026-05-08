import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { SPORT_LEVELS, LEVEL_JSON_KEYS, type LevelJsonKey } from '@/lib/sport-levels'

export const revalidate = 1800 // cache 30 min côté serveur

const TYPE_LABELS: Record<string, string> = {
  ENDURANCE_FONDAMENTALE:  'Endurance fondamentale',
  FRACTIONNE:              'Fractionné',
  SORTIE_LONGUE:           'Sortie longue',
  RENFORCEMENT:            'Renforcement',
  PREPARATION_COMPETITION: 'Préparation compétition',
  RECUPERATION:            'Récupération',
}

// Échappement des champs texte iCal (RFC 5545 §3.3.11)
function esc(s: string): string {
  return s
    .replace(/\\/g, '\\\\')
    .replace(/\r\n|\r|\n/g, '\\n')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
}

// Pliage des lignes à 75 octets (RFC 5545 §3.1)
function fold(line: string): string {
  const max = 75
  if (Buffer.byteLength(line, 'utf8') <= max) return line
  const out: string[] = []
  let buf = ''
  for (const ch of line) {
    const next = buf + ch
    if (Buffer.byteLength(next, 'utf8') > max) {
      out.push(buf)
      buf = ' ' + ch // continuation = espace en début
    } else {
      buf = next
    }
  }
  if (buf) out.push(buf)
  return out.join('\r\n')
}

function fmtDate(d: Date): string {
  // YYYYMMDD pour DTSTART;VALUE=DATE (événement journée)
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(d.getUTCDate()).padStart(2, '0')
  return `${y}${m}${dd}`
}

function fmtUtc(d: Date): string {
  // YYYYMMDDTHHMMSSZ pour DTSTAMP
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

function buildDescription(
  session: { description: string; type: string; levels: any },
  level: LevelJsonKey | null,
): string {
  const parts: string[] = []
  parts.push(`Type : ${TYPE_LABELS[session.type] ?? session.type}`)
  parts.push('')
  parts.push(session.description.trim())

  const levels = session.levels as Record<string, { distance?: string; pace?: string; note?: string }> | null

  if (levels) {
    if (level) {
      const v = levels[level]
      if (v && (v.distance || v.pace || v.note)) {
        const def = SPORT_LEVELS.find(l => l.jsonKey === level)
        parts.push('')
        parts.push(`— ${def?.emoji ?? ''} ${def?.label ?? level} —`)
        if (v.distance) parts.push(`Distance : ${v.distance}`)
        if (v.pace)     parts.push(`Allure : ${v.pace}`)
        if (v.note)     parts.push(v.note)
      }
    } else {
      const used = LEVEL_JSON_KEYS.filter(k => {
        const v = levels[k]
        return v && (v.distance || v.pace || v.note)
      })
      if (used.length) {
        parts.push('')
        parts.push('— Détails par niveau —')
        for (const k of used) {
          const def = SPORT_LEVELS.find(l => l.jsonKey === k)!
          const v = levels[k]
          const bits = [v.distance, v.pace].filter(Boolean).join(' · ')
          parts.push(`${def.emoji} ${def.label} : ${bits || '—'}${v.note ? ` (${v.note})` : ''}`)
        }
      }
    }
  }

  parts.push('')
  parts.push('Club MAJOR — Mazagan Athlétisme Jogging')
  return parts.join('\n')
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const levelParam = searchParams.get('level')?.toLowerCase() as LevelJsonKey | null
  const level = levelParam && (LEVEL_JSON_KEYS as readonly string[]).includes(levelParam)
    ? levelParam
    : null

  // Fenêtre : 6 mois en arrière, 12 mois en avant
  const now = new Date()
  const from = new Date(now.getFullYear(), now.getMonth() - 6, 1)
  const to   = new Date(now.getFullYear(), now.getMonth() + 12, 1)

  const sessions = await prisma.trainingProgramSession.findMany({
    where:   { dateFrom: { gte: from, lte: to } },
    orderBy: { dateFrom: 'asc' },
    include: { program: { select: { title: true, month: true, year: true } } },
  })

  const filtered = level
    ? sessions.filter(s => {
        const v = (s.levels as any)?.[level]
        return v && (v.distance || v.pace || v.note)
      })
    : sessions

  const dtstamp = fmtUtc(new Date())
  const calName = level
    ? `Programme MAJOR — ${SPORT_LEVELS.find(l => l.jsonKey === level)?.label ?? level}`
    : 'Programme MAJOR — Tous niveaux'

  const lines: string[] = []
  lines.push('BEGIN:VCALENDAR')
  lines.push('VERSION:2.0')
  lines.push('PRODID:-//Club MAJOR//Programme//FR')
  lines.push('CALSCALE:GREGORIAN')
  lines.push('METHOD:PUBLISH')
  lines.push(`X-WR-CALNAME:${esc(calName)}`)
  lines.push('X-WR-TIMEZONE:Africa/Casablanca')
  lines.push(`X-WR-CALDESC:${esc('Séances d\'entraînement Club MAJOR — El Jadida (Mazagan)')}`)
  lines.push('REFRESH-INTERVAL;VALUE=DURATION:PT12H')
  lines.push('X-PUBLISHED-TTL:PT12H')

  for (const s of filtered) {
    const start = new Date(s.dateFrom)
    const endRaw = s.dateTo ? new Date(s.dateTo) : new Date(s.dateFrom)
    // DTEND est exclusif pour les VALUE=DATE → +1 jour
    const end = new Date(endRaw)
    end.setUTCDate(end.getUTCDate() + 1)

    const summary = level
      ? `🏃 ${s.title}`
      : `🏃 ${s.title}`
    const description = buildDescription(s, level)

    lines.push('BEGIN:VEVENT')
    lines.push(fold(`UID:major-session-${s.id}@clubmajor.ma`))
    lines.push(`DTSTAMP:${dtstamp}`)
    lines.push(`DTSTART;VALUE=DATE:${fmtDate(start)}`)
    lines.push(`DTEND;VALUE=DATE:${fmtDate(end)}`)
    lines.push(fold(`SUMMARY:${esc(summary)}`))
    lines.push(fold(`DESCRIPTION:${esc(description)}`))
    lines.push(fold(`CATEGORIES:${esc(TYPE_LABELS[s.type] ?? s.type)}`))
    lines.push(fold(`LOCATION:${esc('El Jadida (Mazagan), Maroc')}`))
    lines.push('TRANSP:TRANSPARENT')
    lines.push('END:VEVENT')
  }

  lines.push('END:VCALENDAR')

  const body = lines.join('\r\n') + '\r\n'

  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type':        'text/calendar; charset=utf-8',
      'Content-Disposition': 'inline; filename="programme-major.ics"',
      'Cache-Control':       'public, s-maxage=1800, stale-while-revalidate=3600',
    },
  })
}
