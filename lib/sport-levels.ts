// ─────────────────────────────────────────────────────────────────────
// Niveaux sportifs — partagés entre l'inscription, le profil membre,
// les programmes d'entraînement et le message WhatsApp.
//
// La source de vérité de l'enum est `prisma.SportLevel`. Ce fichier
// fournit les libellés, descriptions, couleurs et helpers d'affichage.
// ─────────────────────────────────────────────────────────────────────

export const SPORT_LEVEL_KEYS = ['DEBUTANT', 'INTERMEDIAIRE', 'CONFIRME', 'COMPETITEUR'] as const
export type SportLevelKey = typeof SPORT_LEVEL_KEYS[number]

// Clés en minuscules utilisées dans le JSON `TrainingProgramSession.levels`
export const LEVEL_JSON_KEYS = ['debutant', 'intermediaire', 'confirme', 'competiteur'] as const
export type LevelJsonKey = typeof LEVEL_JSON_KEYS[number]

export const SPORT_LEVELS: {
  key:         SportLevelKey
  jsonKey:     LevelJsonKey
  short:       string
  label:       string
  emoji:       string
  description: string
  goal:        string
  // Classes Tailwind — fond léger / texte / bordure / fond plein hover
  chipBg:      string
  chipText:    string
  chipBorder:  string
  cardBg:      string
  cardBorder:  string
  fillBg:      string  // pour bouton "sélectionné" ou hover plein
  ring:        string  // ring quand sélectionné
}[] = [
  {
    key: 'DEBUTANT',
    jsonKey: 'debutant',
    short: 'DÉB',
    label: 'Débutant',
    emoji: '🟢',
    description: 'Vous reprenez ou commencez la course à pied.',
    goal: 'Courir 20-40 min en continu.',
    chipBg:     'bg-green-900/30',
    chipText:   'text-green-300',
    chipBorder: 'border-green-700/40',
    cardBg:     'bg-green-950/30',
    cardBorder: 'border-green-800/40',
    fillBg:     'bg-green-600',
    ring:       'ring-green-500',
  },
  {
    key: 'INTERMEDIAIRE',
    jsonKey: 'intermediaire',
    short: 'INT',
    label: 'Intermédiaire',
    emoji: '🟦',
    description: 'Vous courez régulièrement (2-3 ×/semaine).',
    goal: 'Améliorer endurance et chrono (5 km / 10 km).',
    chipBg:     'bg-blue-900/30',
    chipText:   'text-blue-300',
    chipBorder: 'border-blue-700/40',
    cardBg:     'bg-blue-950/30',
    cardBorder: 'border-blue-800/40',
    fillBg:     'bg-blue-600',
    ring:       'ring-blue-500',
  },
  {
    key: 'CONFIRME',
    jsonKey: 'confirme',
    short: 'CONF',
    label: 'Confirmé',
    emoji: '🟧',
    description: 'Bonne base, vous participez à des courses.',
    goal: 'Performance sur 10 km / semi-marathon.',
    chipBg:     'bg-orange-900/30',
    chipText:   'text-orange-300',
    chipBorder: 'border-orange-700/40',
    cardBg:     'bg-orange-950/30',
    cardBorder: 'border-orange-800/40',
    fillBg:     'bg-orange-600',
    ring:       'ring-orange-500',
  },
  {
    key: 'COMPETITEUR',
    jsonKey: 'competiteur',
    short: 'COMP',
    label: 'Compétiteur',
    emoji: '🟥',
    description: 'Niveau élevé, entraînement structuré (VMA, seuil…).',
    goal: 'Podium, chrono précis.',
    chipBg:     'bg-red-900/30',
    chipText:   'text-red-300',
    chipBorder: 'border-red-700/40',
    cardBg:     'bg-red-950/30',
    cardBorder: 'border-red-800/40',
    fillBg:     'bg-red-600',
    ring:       'ring-red-500',
  },
]

export function getLevel(keyOrJsonKey: string | null | undefined) {
  if (!keyOrJsonKey) return null
  const k = String(keyOrJsonKey).toLowerCase()
  return SPORT_LEVELS.find(l => l.jsonKey === k || l.key.toLowerCase() === k) ?? null
}

// ─── Type pour les variantes par niveau dans une séance ──────────────
export interface LevelSpec {
  distance?: string
  pace?:     string
  note?:     string
}

export type SessionLevels = Partial<Record<LevelJsonKey, LevelSpec>>

// Renvoie true si AU MOINS un niveau a au moins un champ rempli
export function hasAnyLevelContent(levels: SessionLevels | null | undefined): boolean {
  if (!levels) return false
  return SPORT_LEVELS.some(def => {
    const v = levels[def.jsonKey]
    return v && (v.distance || v.pace || v.note)
  })
}

export function levelHasContent(spec: LevelSpec | null | undefined): boolean {
  if (!spec) return false
  return Boolean(spec.distance || spec.pace || spec.note)
}
