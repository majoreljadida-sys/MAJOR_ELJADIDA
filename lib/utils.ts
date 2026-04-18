import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'

// ── Tailwind class merger ─────────────────────────────────────────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ── Dates ─────────────────────────────────────────────────────────────────────
export function formatDate(date: Date | string, fmt = 'dd MMMM yyyy') {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, fmt, { locale: fr })
}

export function formatDateShort(date: Date | string) {
  return formatDate(date, 'dd/MM/yyyy')
}

export function formatDatetime(date: Date | string) {
  return formatDate(date, "dd MMMM yyyy 'à' HH'h'mm")
}

export function timeAgo(date: Date | string) {
  const d = typeof date === 'string' ? parseISO(date) : date
  return formatDistanceToNow(d, { locale: fr, addSuffix: true })
}

// ── Texte ────────────────────────────────────────────────────────────────────
export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export function initials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

export function truncate(str: string, length = 100) {
  if (str.length <= length) return str
  return str.slice(0, length).trim() + '…'
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

// ── Nombres ───────────────────────────────────────────────────────────────────
export function formatCurrency(amount: number, currency = 'MAD') {
  return new Intl.NumberFormat('fr-MA', { style: 'currency', currency }).format(amount)
}

export function formatNumber(n: number) {
  return new Intl.NumberFormat('fr-FR').format(n)
}

// ── Labels traduction ─────────────────────────────────────────────────────────
export const TRAINING_TYPE_LABELS: Record<string, string> = {
  ENDURANCE_FONDAMENTALE:  'Endurance fondamentale',
  FRACTIONNE:              'Fractionné',
  SORTIE_LONGUE:           'Sortie longue',
  PREPARATION_COMPETITION: 'Préparation compétition',
  RECUPERATION:            'Récupération',
  RENFORCEMENT:            'Renforcement',
}

export const EVENT_TYPE_LABELS: Record<string, string> = {
  COURSE_OFFICIELLE: 'Course officielle',
  COMPETITION:       'Compétition',
  SORTIE_RUNNING:    'Sortie running',
  STAGE:             'Stage',
  REGROUPEMENT:      'Regroupement',
  EVENEMENT_CLUB:    'Événement club',
}

export const PAYMENT_TYPE_LABELS: Record<string, string> = {
  COTISATION_ANNUELLE:  'Cotisation annuelle',
  COTISATION_MENSUELLE: 'Cotisation mensuelle',
  EVENEMENTIELLE:       'Événementielle',
}

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PAID:    'Payé',
  PENDING: 'En attente',
  LATE:    'En retard',
}

export const PAYMENT_STATUS_LABELS_EXT: Record<string, string> = {
  PAID:      'Payé',
  PENDING:   'En attente',
  LATE:      'En retard',
  CANCELLED: 'Annulé',
}

export const SESSION_STATUS_LABELS: Record<string, string> = {
  SCHEDULED:   'Planifiée',
  IN_PROGRESS: 'En cours',
  COMPLETED:   'Terminée',
  CANCELLED:   'Annulée',
}

export const MEMBER_STATUS_LABELS: Record<string, string> = {
  ACTIVE:    'Actif',
  EXPIRED:   'Expiré',
  SUSPENDED: 'Suspendu',
  PENDING:   'En attente',
  INACTIVE:  'Inactif',
}

export const MEMBER_CATEGORY_LABELS: Record<string, string> = {
  LOISIR:      'Loisir',
  COMPETITION: 'Compétition',
  JUNIOR:      'Junior',
  VETERAN:     'Vétéran',
  SENIOR:      'Senior',
}

export const TSHIRT_SIZE_LABELS: Record<string, string> = {
  XS: 'XS',
  S:  'S',
  M:  'M',
  L:  'L',
  XL: 'XL',
  XXL:'XXL',
}

export const ROLE_LABELS: Record<string, string> = {
  ADMIN:  'Administrateur',
  COACH:  'Coach',
  MEMBER: 'Adhérent',
}

// ── Couleurs status ───────────────────────────────────────────────────────────
export function getMemberStatusColor(status: string) {
  const map: Record<string, string> = {
    ACTIVE:    'text-major-accent  bg-major-accent/10  border-major-accent/30',
    EXPIRED:   'text-orange-400    bg-orange-900/20    border-orange-500/30',
    SUSPENDED: 'text-red-400       bg-red-900/20       border-red-500/30',
    PENDING:   'text-yellow-400    bg-yellow-900/20    border-yellow-500/30',
  }
  return map[status] ?? 'text-gray-400 bg-gray-800 border-gray-600'
}

export function getPaymentStatusColor(status: string) {
  const map: Record<string, string> = {
    PAID:    'text-major-accent bg-major-accent/10 border-major-accent/30',
    PENDING: 'text-yellow-400   bg-yellow-900/20   border-yellow-500/30',
    LATE:    'text-red-400      bg-red-900/20      border-red-500/30',
  }
  return map[status] ?? 'text-gray-400 bg-gray-800'
}

export function getEventTypeColor(type: string) {
  const map: Record<string, string> = {
    COURSE_OFFICIELLE: 'text-major-cyan  bg-major-cyan/10  border-major-cyan/30',
    COMPETITION:       'text-red-400     bg-red-900/20     border-red-500/30',
    SORTIE_RUNNING:    'text-major-accent bg-major-accent/10 border-major-accent/30',
    STAGE:             'text-purple-400  bg-purple-900/20  border-purple-500/30',
    REGROUPEMENT:      'text-yellow-400  bg-yellow-900/20  border-yellow-500/30',
    EVENEMENT_CLUB:    'text-major-primary bg-major-primary/10 border-major-primary/30',
  }
  return map[type] ?? 'text-gray-400 bg-gray-800'
}
