import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { TRAINING_TYPE_LABELS, EVENT_TYPE_LABELS } from './utils'

const SITE_URL = process.env.NEXTAUTH_URL?.replace(/\/$/, '') ?? 'https://major-club.ma'

export type TrainingForMessage = {
  title: string
  date: Date | string
  location: string | null
  type: string
  duration: number | null
  coach: { firstName: string; lastName: string } | null
  group: { name: string } | null
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
  const sessionDate = typeof t.date === 'string' ? new Date(t.date) : t.date
  const today    = new Date()
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1)

  let header: string
  if      (isSameDay(sessionDate, today))    header = '🏃 *MAJOR — Entraînement du jour*'
  else if (isSameDay(sessionDate, tomorrow)) header = '🏃 *MAJOR — Entraînement de demain*'
  else                                        header = '🏃 *MAJOR — Prochaine séance*'

  const lines = [
    header,
    '',
    `*${t.title}*`,
    `🕐 ${fmtDate(t.date, "EEEE dd MMMM 'à' HH'h'mm")}`,
  ]
  if (t.location)         lines.push(`📍 ${t.location}`)
  lines.push(`🏋️ ${TRAINING_TYPE_LABELS[t.type] ?? t.type}`)
  if (t.group)            lines.push(`👥 Groupe : ${t.group.name}`)
  if (t.coach)            lines.push(`👨‍🏫 Coach : ${t.coach.firstName} ${t.coach.lastName}`)
  if (t.duration)         lines.push(`⏱️ Durée : ${t.duration} min`)
  lines.push('', isSameDay(sessionDate, today)
    ? 'À tout à l\'heure ! 💪'
    : 'On compte sur vous ! 💪')
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
  return `https://wa.me/?text=${encodeURIComponent(text)}`
}
