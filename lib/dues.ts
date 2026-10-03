// ─────────────────────────────────────────────────────────────────────
// Cotisations & adhésion — logique de suivi des paiements MAJOR.
//
// Règles métier :
//   • Saison sportive : du 1er septembre au 31 août de l'année suivante.
//     Format saison = "YYYY-YYYY" (ex: "2026-2027" pour sept. 2026 → août 2027).
//   • Adhésion annuelle : 300 DH par saison, due dès que le membre rejoint.
//   • Cotisation mensuelle : 50 DH / mois, à partir du mois d'inscription
//     (prorata) jusqu'à la fin de la saison.
//   • Un paiement est pris en compte s'il porte `status = PAID` ET
//     `season = <saison concernée>`.
// ─────────────────────────────────────────────────────────────────────

export const ADHESION_AMOUNT          = 300  // DH / saison
export const COTISATION_MONTHLY_AMOUNT = 50   // DH / mois

const MONTH_LABELS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
]

const MONTH_SHORT = [
  'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin',
  'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc',
]

/** Renvoie la saison en cours au format "YYYY-YYYY". */
export function getCurrentSeason(now: Date = new Date()): string {
  const m = now.getMonth() // 0-11
  const y = now.getFullYear()
  if (m >= 8) return `${y}-${y + 1}`    // sept (8) à déc (11)
  return `${y - 1}-${y}`                // jan (0) à août (7)
}

/** Dates de début (1er sept.) et de fin (31 août) d'une saison. */
export function getSeasonBounds(season: string) {
  const [startYear] = season.split('-').map(Number)
  const start = new Date(Date.UTC(startYear, 8, 1))      // 1er sept.
  const end   = new Date(Date.UTC(startYear + 1, 7, 31)) // 31 août
  return { start, end }
}

/** Format humain. */
export function formatSeason(season: string): string {
  const [a, b] = season.split('-')
  return `Saison ${a}–${b}`
}

export interface SeasonMonth {
  /** Index 0-11 dans la saison : 0 = septembre, 11 = août. */
  seasonIdx:  number
  /** Index calendaire 0-11 (0 = jan, 8 = sept). */
  calIdx:     number
  /** Première date du mois (UTC). */
  monthDate:  Date
  label:      string     // "Septembre 2026"
  short:      string     // "Sep 26"
}

/** Liste ordonnée des 12 mois de la saison. */
export function getSeasonMonths(season: string): SeasonMonth[] {
  const [startYear] = season.split('-').map(Number)
  const months: SeasonMonth[] = []
  for (let i = 0; i < 12; i++) {
    const calMonth = (8 + i) % 12          // 8 (sept), 9, 10, 11, 0, 1, ..., 7
    const year     = startYear + (i < 4 ? 0 : 1) // sept-déc = startYear ; jan-août = startYear+1
    months.push({
      seasonIdx: i,
      calIdx:    calMonth,
      monthDate: new Date(Date.UTC(year, calMonth, 1)),
      label:     `${MONTH_LABELS[calMonth]} ${year}`,
      short:     `${MONTH_SHORT[calMonth]} ${String(year).slice(2)}`,
    })
  }
  return months
}

/** Statut d'un mois (ou de l'adhésion annuelle). */
export type DuesLineStatus =
  | 'PAID'          // montant intégralement payé
  | 'DUE'           // dû mais pas payé (en retard)
  | 'UPCOMING'      // mois futur, pas encore dû
  | 'BEFORE_JOIN'   // mois antérieur à la date d'inscription du membre

export interface DuesLine {
  key:        string
  label:      string
  dueDate:    Date
  amount:     number
  paid:       number
  status:     DuesLineStatus
  type:       'ADHESION' | 'COTISATION'
}

export interface DuesStatus {
  season:        string
  seasonLabel:   string
  expectedTotal: number
  paidTotal:     number
  remaining:     number
  /** 'UP_TO_DATE' si remaining ≤ 0, 'LATE' sinon, 'NOT_DUE' si rien n'est encore dû (futur). */
  globalStatus:  'UP_TO_DATE' | 'LATE' | 'NOT_DUE'
  lines:         DuesLine[]
  adhesion:      DuesLine
}

interface MemberLike {
  id:        string
  createdAt: Date
}

interface PaymentLike {
  type:      string          // 'COTISATION_ANNUELLE' | 'COTISATION_MENSUELLE' | ...
  amount:    number
  status:    string          // 'PAID' | 'PENDING' | ...
  season:    string | null
  paidDate?: Date | null
  dueDate?:  Date | null
}

/**
 * Calcule le statut cotisations d'un membre pour la saison en cours.
 * Les paiements sont filtrés sur `season = currentSeason` et `status = PAID`.
 */
export function computeDuesStatus(
  member:   MemberLike,
  payments: readonly PaymentLike[],
  now:      Date = new Date(),
  season?:  string,
): DuesStatus {
  const activeSeason = season ?? getCurrentSeason(now)
  const { start: seasonStart } = getSeasonBounds(activeSeason)
  const months = getSeasonMonths(activeSeason)

  // Date d'adhésion effective pour cette saison :
  //   max(createdAt, seasonStart) → si le membre existait avant la saison,
  //   on applique la saison depuis son début.
  const joinInSeason = member.createdAt > seasonStart ? member.createdAt : seasonStart

  const nowY = now.getFullYear()
  const nowM = now.getMonth()

  // Agréger les paiements PAID de la saison active
  const seasonPayments = payments.filter(p => p.season === activeSeason && p.status === 'PAID')
  const paidAdhesion = seasonPayments
    .filter(p => p.type === 'COTISATION_ANNUELLE')
    .reduce((s, p) => s + p.amount, 0)

  // Ligne adhésion
  const adhesion: DuesLine = {
    key:      'ADHESION',
    label:    'Adhésion annuelle',
    dueDate:  joinInSeason,
    amount:   ADHESION_AMOUNT,
    paid:     Math.min(paidAdhesion, ADHESION_AMOUNT),
    status:   paidAdhesion >= ADHESION_AMOUNT ? 'PAID' : 'DUE',
    type:     'ADHESION',
  }

  // Lignes cotisations mensuelles
  const monthlyLines: DuesLine[] = []
  const joinSeasonIdx = months.findIndex(m =>
    m.monthDate.getUTCFullYear() === joinInSeason.getUTCFullYear() &&
    m.monthDate.getUTCMonth()   === joinInSeason.getUTCMonth()
  )

  for (const m of months) {
    const isBeforeJoin = joinSeasonIdx > -1 && m.seasonIdx < joinSeasonIdx
    const isFutureMonth =
      m.monthDate.getUTCFullYear() > nowY ||
      (m.monthDate.getUTCFullYear() === nowY && m.monthDate.getUTCMonth() > nowM)

    // Montant payé pour ce mois précis = somme des COTISATION_MENSUELLE
    // dont le dueDate (ou paidDate à défaut) tombe dans ce mois.
    const monthPayments = seasonPayments.filter(p => {
      if (p.type !== 'COTISATION_MENSUELLE') return false
      const ref = p.dueDate ?? p.paidDate
      if (!ref) return false
      const d = new Date(ref)
      return d.getUTCFullYear() === m.monthDate.getUTCFullYear() &&
             d.getUTCMonth()   === m.monthDate.getUTCMonth()
    })
    const paid = monthPayments.reduce((s, p) => s + p.amount, 0)

    let status: DuesLineStatus
    if (isBeforeJoin)       status = 'BEFORE_JOIN'
    else if (isFutureMonth) status = paid >= COTISATION_MONTHLY_AMOUNT ? 'PAID' : 'UPCOMING'
    else                    status = paid >= COTISATION_MONTHLY_AMOUNT ? 'PAID' : 'DUE'

    monthlyLines.push({
      key:    `COTISATION_${m.seasonIdx}`,
      label:  m.label,
      dueDate: m.monthDate,
      amount: isBeforeJoin ? 0 : COTISATION_MONTHLY_AMOUNT,
      paid,
      status,
      type:   'COTISATION',
    })
  }

  // Totaux attendus = adhésion (si joined in/before season) + cotisations dues (DUE + PAID)
  const expectedTotal =
    (adhesion.status === 'DUE' || adhesion.status === 'PAID' ? ADHESION_AMOUNT : 0) +
    monthlyLines
      .filter(l => l.status === 'DUE' || l.status === 'PAID')
      .reduce((s, l) => s + l.amount, 0)
  const paidTotal = adhesion.paid + monthlyLines.reduce((s, l) => s + l.paid, 0)
  const remaining = Math.max(0, expectedTotal - paidTotal)

  const anyDue = adhesion.status === 'DUE' || monthlyLines.some(l => l.status === 'DUE')
  const globalStatus: DuesStatus['globalStatus'] =
    expectedTotal === 0 ? 'NOT_DUE' :
    (!anyDue || remaining <= 0) ? 'UP_TO_DATE' : 'LATE'

  return {
    season:        activeSeason,
    seasonLabel:   formatSeason(activeSeason),
    expectedTotal,
    paidTotal,
    remaining,
    globalStatus,
    lines:         monthlyLines,
    adhesion,
  }
}

export function statusColor(status: DuesLineStatus): { text: string; bg: string; border: string } {
  switch (status) {
    case 'PAID':        return { text: 'text-emerald-400', bg: 'bg-emerald-900/30',  border: 'border-emerald-700/40' }
    case 'DUE':         return { text: 'text-red-400',     bg: 'bg-red-900/30',      border: 'border-red-700/40'     }
    case 'UPCOMING':    return { text: 'text-gray-400',    bg: 'bg-gray-900/30',     border: 'border-gray-700/40'    }
    case 'BEFORE_JOIN': return { text: 'text-gray-600',    bg: 'bg-gray-900/20',     border: 'border-gray-800/50'    }
  }
}

export function statusLabel(status: DuesLineStatus): string {
  switch (status) {
    case 'PAID':        return 'Payé'
    case 'DUE':         return 'À régler'
    case 'UPCOMING':    return 'À venir'
    case 'BEFORE_JOIN': return '—'
  }
}

export function globalStatusColor(gs: DuesStatus['globalStatus']): { text: string; bg: string; border: string; label: string } {
  switch (gs) {
    case 'UP_TO_DATE': return { text: 'text-emerald-300', bg: 'bg-emerald-900/30', border: 'border-emerald-700/40', label: '✓ À jour' }
    case 'LATE':       return { text: 'text-red-300',     bg: 'bg-red-900/30',     border: 'border-red-700/40',     label: '⚠ En retard' }
    case 'NOT_DUE':    return { text: 'text-gray-400',    bg: 'bg-gray-900/30',    border: 'border-gray-700/40',    label: 'Nouveau' }
  }
}
