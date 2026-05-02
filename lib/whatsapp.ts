import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { TRAINING_TYPE_LABELS, EVENT_TYPE_LABELS } from './utils'

const SITE_URL = process.env.NEXTAUTH_URL?.replace(/\/$/, '') ?? 'https://major-club.ma'

export type TrainingForMessage = {
  title: string
  dateFrom: Date | string
  dateTo: Date | string | null
  description: string
  type: string
  programTitle: string
}

export type EventForMessage = {
  slug: string
  title: string
  date: Date | string
  location: string
  city: string | null
  type: string
  price: number | null
  distance: string | null
  description: string
}

export type BlogPostForMessage = {
  slug: string
  title: string
  excerpt: string
  readTime: number | null
  category: { name: string } | null
}

function fmtDate(d: Date | string, pattern: string) {
  const date = typeof d === 'string' ? new Date(d) : d
  return format(date, pattern, { locale: fr })
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear()
      && a.getMonth()    === b.getMonth()
      && a.getDate()     === b.getDate()
}

export function buildTrainingMessage(t: TrainingForMessage): string {
  const sessionDate = typeof t.dateFrom === 'string' ? new Date(t.dateFrom) : t.dateFrom
  const today    = new Date()
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1)

  let header: string
  if      (isSameDay(sessionDate, today))    header = '🏃 *MAJOR — Entraînement du jour*'
  else if (isSameDay(sessionDate, tomorrow)) header = '🏃 *MAJOR — Entraînement de demain*'
  else                                        header = '🏃 *MAJOR — Prochaine séance*'

  const dateRange = t.dateTo
    ? `${fmtDate(t.dateFrom, 'EEEE dd MMM')} → ${fmtDate(t.dateTo, 'EEEE dd MMM yyyy')}`
    : fmtDate(t.dateFrom, 'EEEE dd MMMM yyyy')

  const lines = [
    header,
    `_${t.programTitle}_`,
    '',
    `📅 ${dateRange}`,
    `🏋️ *${t.title}*  ·  ${TRAINING_TYPE_LABELS[t.type] ?? t.type}`,
    '',
    t.description,
    '',
    isSameDay(sessionDate, today)
      ? 'À tout à l\'heure ! 💪'
      : 'On compte sur vous ! 💪',
  ]
  return lines.join('\n')
}

export function buildEventMessage(e: EventForMessage): string {
  const lines = [
    '🏆 *MAJOR — Événement à venir*',
    '',
    `*${e.title}*`,
    `📅 ${fmtDate(e.date, "EEEE dd MMMM yyyy")}`,
    `📍 ${e.location}${e.city ? `, ${e.city}` : ''}`,
    `🎽 ${EVENT_TYPE_LABELS[e.type] ?? e.type}`,
  ]
  if (e.distance) lines.push(`📏 ${e.distance}`)
  if (e.price)    lines.push(`💰 ${e.price} MAD`)
  lines.push('', e.description)
  lines.push('', '📝 *Inscriptions ouvertes*')
  lines.push(`👉 ${SITE_URL}/evenements/${e.slug}`)
  return lines.join('\n')
}

export function buildBlogMessage(p: BlogPostForMessage): string {
  const lines = [
    '📖 *MAJOR — Nouvel article*',
    '',
    `*${p.title}*`,
  ]
  if (p.category) lines.push(`📂 ${p.category.name}`)
  lines.push('', p.excerpt)
  if (p.readTime) lines.push('', `⏱️ Lecture : ${p.readTime} min`)
  lines.push('', `👉 ${SITE_URL}/blog/${p.slug}`)
  return lines.join('\n')
}

export function whatsappShareUrl(text: string): string {
  // On utilise api.whatsapp.com/send directement (et non wa.me) car le redirect
  // wa.me → api.whatsapp.com peut re-encoder l'URL et casser les emojis UTF-8 (→ �)
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`
}
