// ─────────────────────────────────────────────────────────────────────
// Objectifs personnels / motivations — partagés entre l'inscription,
// le profil membre et l'admin.
//
// La source de vérité de l'enum est `prisma.MotivationGoal`. Ce fichier
// fournit libellés, descriptions, couleurs et helpers d'affichage.
// ─────────────────────────────────────────────────────────────────────

export const MOTIVATION_KEYS = ['HEALTH', 'WEIGHT_LOSS', 'PERFORMANCE', 'RACE_PREP'] as const
export type MotivationKey = typeof MOTIVATION_KEYS[number]

export const MOTIVATIONS: {
  key:         MotivationKey
  short:       string
  label:       string
  emoji:       string
  description: string
  detail:      string
  // Tailwind classes (cartes / chips / hover)
  chipBg:      string
  chipText:    string
  chipBorder:  string
  cardBg:      string
  cardBorder:  string
  ring:        string
}[] = [
  {
    key: 'HEALTH',
    short: 'SANTÉ',
    label: 'Santé & bien-être',
    emoji: '💚',
    description: "Courir pour se sentir bien, garder la forme, prendre soin de son corps et de sa tête.",
    detail: "Régularité prioritaire, intensité modérée, plaisir avant chrono.",
    chipBg:     'bg-emerald-900/30',
    chipText:   'text-emerald-300',
    chipBorder: 'border-emerald-700/40',
    cardBg:     'bg-emerald-950/30',
    cardBorder: 'border-emerald-800/40',
    ring:       'ring-emerald-500',
  },
  {
    key: 'WEIGHT_LOSS',
    short: 'POIDS',
    label: 'Perte de poids',
    emoji: '🔥',
    description: "Accompagner un objectif de perte de poids ou de rééquilibrage corporel.",
    detail: "Volume modéré et régulier, en zone d'endurance, complété par du renforcement.",
    chipBg:     'bg-amber-900/30',
    chipText:   'text-amber-300',
    chipBorder: 'border-amber-700/40',
    cardBg:     'bg-amber-950/30',
    cardBorder: 'border-amber-800/40',
    ring:       'ring-amber-500',
  },
  {
    key: 'PERFORMANCE',
    short: 'PERF',
    label: 'Performance / chrono',
    emoji: '⏱',
    description: "Améliorer ses temps, sa VMA, son seuil — viser des chronos précis sur les courses.",
    detail: "Travail structuré : VMA, seuil, sortie longue, allure spécifique.",
    chipBg:     'bg-violet-900/30',
    chipText:   'text-violet-300',
    chipBorder: 'border-violet-700/40',
    cardBg:     'bg-violet-950/30',
    cardBorder: 'border-violet-800/40',
    ring:       'ring-violet-500',
  },
  {
    key: 'RACE_PREP',
    short: 'COURSE',
    label: 'Préparation course',
    emoji: '🏁',
    description: "Préparer une compétition spécifique : 10 km, semi-marathon, marathon, trail.",
    detail: "Plan ciblé sur la distance et la date de la course objectif.",
    chipBg:     'bg-cyan-900/30',
    chipText:   'text-cyan-300',
    chipBorder: 'border-cyan-700/40',
    cardBg:     'bg-cyan-950/30',
    cardBorder: 'border-cyan-800/40',
    ring:       'ring-cyan-500',
  },
]

export function getMotivation(key: string | null | undefined) {
  if (!key) return null
  return MOTIVATIONS.find(m => m.key === String(key).toUpperCase()) ?? null
}
