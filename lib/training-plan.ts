// ─────────────────────────────────────────────────────────────────────
// Générateur de plan d'entraînement personnalisé.
//
// Entrées : VMA, distance objectif (10/21/42), temps cible, date de
// course, durée du plan (6/8/10 sem), séances/semaine (3 ou 4).
//
// Périodisation simple :
//   • Build (semaines 1 à N-2)   : volume progressif, alterne VMA / Seuil
//   • Affûtage (semaine N-1)     : volume réduit, intensité maintenue
//   • Course (semaine N)         : EF léger + réveil musculaire + course
//
// Allures dérivées de la VMA (% de VMA) :
//   • EF             : 65 %
//   • Endurance      : 72 %
//   • Allure 42 km   : 80 %
//   • Allure 21 km   : 86 %
//   • Allure 10 km   : 90 %
//   • Seuil          : 87 %
//   • VMA courte     : 100 %
// ─────────────────────────────────────────────────────────────────────

import { addDays, startOfWeek, differenceInCalendarDays } from 'date-fns'

export type Distance = 10 | 21 | 42
export type WeekCount = 6 | 8 | 10
export type SessionsPerWeek = 3 | 4
export type Phase = 'BUILD' | 'AFFUTAGE' | 'COURSE'

export type SessionType =
  | 'EF'
  | 'VMA'
  | 'SEUIL'
  | 'SORTIE_LONGUE'
  | 'RECUP'
  | 'REVEIL'
  | 'COURSE'

export interface PlanInput {
  vma: number
  distance: Distance
  goalTimeSeconds: number
  raceDate: Date
  weeks: WeekCount
  sessionsPerWeek: SessionsPerWeek
}

export interface PlanSession {
  date: Date
  type: SessionType
  title: string
  description: string
  durationMin?: number
  paceLabel?: string
  details?: string[]
}

export interface PlanWeek {
  index: number
  phase: Phase
  startDate: Date
  endDate: Date
  sessions: PlanSession[]
  totalMin: number
}

export interface TrainingPlan {
  input: PlanInput
  paces: {
    efSec: number
    easySec: number
    targetSec: number
    thresholdSec: number
    vmaShortSec: number
  }
  paceLabels: {
    ef: string
    easy: string
    target: string
    threshold: string
    vmaShort: string
  }
  startDate: Date
  raceDate: Date
  totalSessions: number
  totalMin: number
  weeks: PlanWeek[]
  warning?: string
}

// ── Helpers ─────────────────────────────────────────────────────────

function vmaToPaceSec(vma: number, pct: number): number {
  const speedKmh = vma * (pct / 100)
  return Math.round(3600 / speedKmh)
}

export function formatPaceSec(sec: number): string {
  if (!isFinite(sec) || sec <= 0) return '—'
  const m = Math.floor(sec / 60)
  const s = Math.round(sec - m * 60)
  return `${m}'${String(s).padStart(2, '0')}/km`
}

export function formatDuration(sec: number): string {
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = Math.round(sec % 60)
  if (h > 0) return `${h}h${String(m).padStart(2, '0')}'${String(s).padStart(2, '0')}"`
  return `${m}'${String(s).padStart(2, '0')}"`
}

function determinePhase(weekIdx: number, totalWeeks: number): Phase {
  if (weekIdx === totalWeeks)     return 'COURSE'
  if (weekIdx === totalWeeks - 1) return 'AFFUTAGE'
  return 'BUILD'
}

// Volume sortie longue (en minutes)
function longRunMin(distance: Distance, phase: Phase, weekIdx: number, totalWeeks: number): number {
  if (phase === 'AFFUTAGE') return distance === 10 ? 50 : distance === 21 ? 70 : 90
  // Build
  const start = distance === 10 ? 50 : distance === 21 ? 70 : 90
  const peak  = distance === 10 ? 80 : distance === 21 ? 120 : 180
  const buildWeeks = totalWeeks - 2 // semaines 1..N-2
  const ratio = buildWeeks > 1 ? (weekIdx - 1) / (buildWeeks - 1) : 1
  return Math.round(start + (peak - start) * ratio)
}

// Allure spécifique pour la course (en s/km, dérivée de VMA)
function specificPaceSec(vma: number, distance: Distance): number {
  const pct = distance === 10 ? 90 : distance === 21 ? 86 : 80
  return vmaToPaceSec(vma, pct)
}

interface SessionPaces {
  efSec:        number
  easySec:      number
  thresholdSec: number
  vmaShortSec:  number
  specificSec:  number
}

// Construit la séance VMA selon la phase
function buildVmaSession(
  date: Date, weekIdx: number, totalWeeks: number, paces: SessionPaces, durationEf: number,
): PlanSession {
  // Variantes selon la semaine (alternance)
  const variants = [
    { reps: '10×400m',  rec: 'r=1\'',         note: 'à allure VMA (100 %)'                 },
    { reps: '8×500m',   rec: 'r=1\'15"',      note: 'à allure VMA (100 %)'                 },
    { reps: '6×800m',   rec: 'r=1\'30"',      note: 'à 95 % VMA'                           },
    { reps: '5×1000m',  rec: 'r=1\'30"',      note: 'à 95 % VMA'                           },
    { reps: '12×30/30', rec: '30" rapide / 30" trot', note: 'à allure VMA, en continu' },
  ]
  const v = variants[(weekIdx - 1) % variants.length]
  return {
    date,
    type: 'VMA',
    title: `Fractionné court — ${v.reps}`,
    description: `Échauffement 20\' EF puis ${v.reps} ${v.note} (${v.rec}). Retour au calme 10\'.`,
    durationMin: durationEf,
    paceLabel: formatPaceSec(paces.vmaShortSec),
    details: [
      `Échauffement : 20\' à allure EF (${formatPaceSec(paces.efSec)})`,
      `Bloc : ${v.reps} ${v.note}, récup ${v.rec}`,
      `Retour au calme : 10\' EF`,
    ],
  }
}

function buildSeuilSession(
  date: Date, weekIdx: number, _totalWeeks: number, paces: SessionPaces, durationEf: number,
): PlanSession {
  const variants = [
    { reps: '3×8\'',  rec: 'r=2\'' },
    { reps: '2×12\'', rec: 'r=3\'' },
    { reps: '4×6\'',  rec: 'r=1\'30"' },
    { reps: '20\' continu', rec: '' },
  ]
  const v = variants[(weekIdx - 1) % variants.length]
  return {
    date,
    type: 'SEUIL',
    title: `Seuil — ${v.reps}`,
    description: `Échauffement 20\' EF puis ${v.reps} à allure seuil${v.rec ? ` (${v.rec})` : ''}. Retour au calme 10\'.`,
    durationMin: durationEf,
    paceLabel: formatPaceSec(paces.thresholdSec),
    details: [
      `Échauffement : 20\' EF (${formatPaceSec(paces.efSec)})`,
      `Bloc : ${v.reps} à allure seuil (${formatPaceSec(paces.thresholdSec)})${v.rec ? `, récup ${v.rec}` : ''}`,
      `Retour au calme : 10\' EF`,
    ],
  }
}

function buildEfSession(date: Date, durationMin: number, paces: SessionPaces): PlanSession {
  return {
    date,
    type: 'EF',
    title: `Endurance fondamentale — ${durationMin}\'`,
    description: `Course en aisance respiratoire à allure EF.`,
    durationMin,
    paceLabel: formatPaceSec(paces.efSec),
    details: [
      `Allure EF : ${formatPaceSec(paces.efSec)} (65 % VMA)`,
      `Si tu peux parler en courant, c'est la bonne allure.`,
    ],
  }
}

function buildLongRun(
  date: Date, durationMin: number, distance: Distance, phase: Phase, paces: SessionPaces,
): PlanSession {
  const baseMin   = Math.max(0, durationMin - 15)
  const specific  = formatPaceSec(paces.specificSec)
  const specifiqueLabel = distance === 10 ? '10 km' : distance === 21 ? 'semi' : 'marathon'
  const includesSpec = phase === 'BUILD' && durationMin >= 70
  return {
    date,
    type: 'SORTIE_LONGUE',
    title: `Sortie longue — ${durationMin}\'`,
    description: includesSpec
      ? `${baseMin}\' EF + 15\' à allure ${specifiqueLabel} (${specific}).`
      : `${durationMin}\' à allure EF.`,
    durationMin,
    paceLabel: formatPaceSec(paces.efSec),
    details: includesSpec
      ? [
          `${baseMin}\' à allure EF (${formatPaceSec(paces.efSec)})`,
          `15\' à allure ${specifiqueLabel} (${specific})`,
          `Hydratation et alimentation à tester si > 90\'`,
        ]
      : [
          `Toute la sortie à allure EF (${formatPaceSec(paces.efSec)})`,
        ],
  }
}

function buildRecup(date: Date, paces: SessionPaces): PlanSession {
  return {
    date,
    type: 'RECUP',
    title: `Footing récup — 40\'`,
    description: `Footing très lent. Objectif : décrasser, pas faire d'effort.`,
    durationMin: 40,
    paceLabel: formatPaceSec(paces.efSec + 30), // un peu plus lent que EF
    details: [
      `Allure très facile, plus lente que l'EF`,
      `Étirements 5-10 min après si possible`,
    ],
  }
}

function buildReveil(date: Date, paces: SessionPaces): PlanSession {
  return {
    date,
    type: 'REVEIL',
    title: `Réveil musculaire — 25\'`,
    description: `15\' EF + 4×100m progressifs (allure 10K → VMA). Le corps se prépare à la performance du lendemain.`,
    durationMin: 25,
    paceLabel: formatPaceSec(paces.efSec),
    details: [
      `15\' EF (${formatPaceSec(paces.efSec)})`,
      `4×100m progressifs, récup en marchant`,
      `Étirements légers + dernière vérif équipement`,
    ],
  }
}

function buildRace(date: Date, distance: Distance, goalTimeSeconds: number, paces: SessionPaces): PlanSession {
  return {
    date,
    type: 'COURSE',
    title: `🏁 COURSE — ${distance} km`,
    description: `Allure cible : ${formatPaceSec(paces.specificSec)}. Objectif : ${formatDuration(goalTimeSeconds)}.`,
    durationMin: Math.round(goalTimeSeconds / 60),
    paceLabel: formatPaceSec(paces.specificSec),
    details: [
      `Distance : ${distance} km`,
      `Temps cible : ${formatDuration(goalTimeSeconds)}`,
      `Allure cible : ${formatPaceSec(paces.specificSec)}`,
      `Échauffement 15-20\' avant le départ`,
    ],
  }
}

// ── Génération ──────────────────────────────────────────────────────

export function generatePlan(input: PlanInput): TrainingPlan {
  const { vma, distance, goalTimeSeconds, raceDate, weeks, sessionsPerWeek } = input

  const paces: SessionPaces = {
    efSec:        vmaToPaceSec(vma, 65),
    easySec:      vmaToPaceSec(vma, 72),
    thresholdSec: vmaToPaceSec(vma, 87),
    vmaShortSec:  vmaToPaceSec(vma, 100),
    specificSec:  specificPaceSec(vma, distance),
  }

  // Avertissement si l'objectif est plus rapide que l'allure spécifique théorique
  const targetSec = goalTimeSeconds / distance
  let warning: string | undefined
  if (targetSec < paces.specificSec - 10) {
    warning = `Ton objectif (${formatPaceSec(targetSec)}) est plus rapide que l'allure ${distance}km théorique calculée depuis ta VMA (${formatPaceSec(paces.specificSec)}). Tu auras besoin d'un travail spécifique soutenu.`
  } else if (targetSec > paces.specificSec + 30) {
    warning = `Ton objectif est plutôt prudent par rapport à ta VMA. Tu pourrais viser plus rapide.`
  }

  // Calendrier : la course tombe dans la dernière semaine
  // weekStart = lundi de la semaine contenant la course, plan démarre N-1 lundis avant
  const raceMonday = startOfWeek(raceDate, { weekStartsOn: 1 })
  const planStart  = addDays(raceMonday, -7 * (weeks - 1))

  const planWeeks: PlanWeek[] = []
  let totalSessions = 0
  let totalMin = 0

  for (let w = 1; w <= weeks; w++) {
    const weekStart = addDays(planStart, 7 * (w - 1))
    const weekEnd   = addDays(weekStart, 6)
    const phase     = determinePhase(w, weeks)
    const sessions: PlanSession[] = []

    if (phase === 'COURSE') {
      // Semaine de course : EF léger, réveil J-1, course
      const raceDayOffset = differenceInCalendarDays(raceDate, weekStart)  // 0..6
      // Jour J-3 : footing récup (sauf si trop proche)
      if (raceDayOffset >= 4) {
        sessions.push(buildRecup(addDays(weekStart, raceDayOffset - 4), paces))
      }
      // Jour J-1 : réveil musculaire
      if (raceDayOffset >= 1) {
        sessions.push(buildReveil(addDays(weekStart, raceDayOffset - 1), paces))
      }
      // Course
      sessions.push(buildRace(raceDate, distance, goalTimeSeconds, paces))
    } else {
      // BUILD ou AFFUTAGE
      const isAffutage = phase === 'AFFUTAGE'
      const longMin    = longRunMin(distance, phase, w, weeks)

      if (sessionsPerWeek === 3) {
        // Mardi : EF
        const efMin = isAffutage ? 40 : (distance === 10 ? 50 : distance === 21 ? 55 : 60)
        sessions.push(buildEfSession(addDays(weekStart, 1), efMin, paces))
        // Jeudi : qualité (alterne VMA / Seuil)
        const efBlock = isAffutage ? 50 : 60
        const quality = (w % 2 === 1)
          ? buildVmaSession(addDays(weekStart, 3), w, weeks, paces, efBlock)
          : buildSeuilSession(addDays(weekStart, 3), w, weeks, paces, efBlock)
        sessions.push(quality)
        // Dimanche : sortie longue
        sessions.push(buildLongRun(addDays(weekStart, 6), longMin, distance, phase, paces))
      } else {
        // 4 séances : Lun récup, Mar VMA, Jeu Seuil, Dim sortie longue
        if (!isAffutage) {
          sessions.push(buildRecup(weekStart, paces))
        }
        const efBlock = isAffutage ? 45 : 55
        sessions.push(buildVmaSession(addDays(weekStart, 1),  w, weeks, paces, efBlock))
        sessions.push(buildSeuilSession(addDays(weekStart, 3), w, weeks, paces, efBlock))
        sessions.push(buildLongRun(addDays(weekStart, 6), longMin, distance, phase, paces))
      }
    }

    const wkMin = sessions.reduce((s, x) => s + (x.durationMin ?? 0), 0)
    totalSessions += sessions.length
    totalMin      += wkMin
    planWeeks.push({ index: w, phase, startDate: weekStart, endDate: weekEnd, sessions, totalMin: wkMin })
  }

  return {
    input,
    paces: {
      efSec:        paces.efSec,
      easySec:      paces.easySec,
      targetSec:    Math.round(targetSec),
      thresholdSec: paces.thresholdSec,
      vmaShortSec:  paces.vmaShortSec,
    },
    paceLabels: {
      ef:        formatPaceSec(paces.efSec),
      easy:      formatPaceSec(paces.easySec),
      target:    formatPaceSec(targetSec),
      threshold: formatPaceSec(paces.thresholdSec),
      vmaShort:  formatPaceSec(paces.vmaShortSec),
    },
    startDate: planStart,
    raceDate,
    totalSessions,
    totalMin,
    weeks: planWeeks,
    warning,
  }
}
