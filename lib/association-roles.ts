// ─────────────────────────────────────────────────────────────────────
// Classification associative — types de membre + rôles au sein du bureau
// et des comités. Source de vérité : enums `MemberType` et `AssociationRole`
// dans prisma/schema.prisma.
//
// Règle métier : seul un MEMBRE_ASSOCIATION peut porter des rôles. Un
// ADHERENT a toujours un tableau associationRoles vide.
// ─────────────────────────────────────────────────────────────────────

export const MEMBER_TYPE_KEYS = ['ADHERENT', 'MEMBRE_ASSOCIATION'] as const
export type MemberTypeKey = typeof MEMBER_TYPE_KEYS[number]

export const MEMBER_TYPES: {
  key:         MemberTypeKey
  label:       string
  short:       string
  emoji:       string
  description: string
  chipBg:      string
  chipText:    string
  chipBorder:  string
  cardBg:      string
  cardBorder:  string
  ring:        string
}[] = [
  {
    key: 'ADHERENT',
    label: 'Adhérent',
    short: 'ADH',
    emoji: '🏃',
    description: 'Bénéficie des activités du club (entraînements, événements, séances).',
    chipBg:     'bg-slate-800/60',
    chipText:   'text-slate-300',
    chipBorder: 'border-slate-600/40',
    cardBg:     'bg-slate-900/30',
    cardBorder: 'border-slate-700/40',
    ring:       'ring-slate-500',
  },
  {
    key: 'MEMBRE_ASSOCIATION',
    label: "Membre de l'association",
    short: 'MEMBRE',
    emoji: '🗳️',
    description: "Voix délibérative à l'assemblée générale. Éligible au bureau et aux comités.",
    chipBg:     'bg-major-primary/15',
    chipText:   'text-major-accent',
    chipBorder: 'border-major-primary/40',
    cardBg:     'bg-major-primary/10',
    cardBorder: 'border-major-primary/40',
    ring:       'ring-major-primary',
  },
]

export function getMemberType(key: string | null | undefined) {
  if (!key) return null
  return MEMBER_TYPES.find(t => t.key === String(key).toUpperCase()) ?? null
}

// ── Rôles au sein de l'association ──────────────────────────────────

export const ASSOCIATION_ROLE_KEYS = [
  'PRESIDENT',
  'VICE_PRESIDENT',
  'SECRETAIRE',
  'TRESORIER',
  'MEMBRE_BUREAU',
  'COMITE_TECHNIQUE',
  'COMITE_COMMUNICATION',
  'COMITE_EVENEMENTS',
  'COMITE_FINANCIER',
] as const
export type AssociationRoleKey = typeof ASSOCIATION_ROLE_KEYS[number]

export type AssociationGroup = 'BUREAU' | 'COMITE'

export const ASSOCIATION_ROLES: {
  key:         AssociationRoleKey
  label:       string
  short:       string
  group:       AssociationGroup
  emoji:       string
  order:       number  // ordre d'affichage dans la hiérarchie
  chipBg:      string
  chipText:    string
  chipBorder:  string
}[] = [
  // Bureau exécutif
  {
    key: 'PRESIDENT', label: 'Président', short: 'PRÉS', group: 'BUREAU', emoji: '👑', order: 1,
    chipBg: 'bg-amber-900/30', chipText: 'text-amber-300', chipBorder: 'border-amber-700/40',
  },
  {
    key: 'VICE_PRESIDENT', label: 'Vice-Président', short: 'V.PRÉS', group: 'BUREAU', emoji: '⭐', order: 2,
    chipBg: 'bg-amber-900/30', chipText: 'text-amber-300', chipBorder: 'border-amber-700/40',
  },
  {
    key: 'SECRETAIRE', label: 'Secrétaire', short: 'SECR', group: 'BUREAU', emoji: '📝', order: 3,
    chipBg: 'bg-blue-900/30', chipText: 'text-blue-300', chipBorder: 'border-blue-700/40',
  },
  {
    key: 'TRESORIER', label: 'Trésorier', short: 'TRÉS', group: 'BUREAU', emoji: '💰', order: 4,
    chipBg: 'bg-emerald-900/30', chipText: 'text-emerald-300', chipBorder: 'border-emerald-700/40',
  },
  {
    key: 'MEMBRE_BUREAU', label: 'Membre du bureau', short: 'BUREAU', group: 'BUREAU', emoji: '🏛️', order: 5,
    chipBg: 'bg-indigo-900/30', chipText: 'text-indigo-300', chipBorder: 'border-indigo-700/40',
  },
  // Comités
  {
    key: 'COMITE_TECHNIQUE', label: 'Comité Technique', short: 'C.TECH', group: 'COMITE', emoji: '🏃‍♂️', order: 10,
    chipBg: 'bg-cyan-900/30', chipText: 'text-cyan-300', chipBorder: 'border-cyan-700/40',
  },
  {
    key: 'COMITE_COMMUNICATION', label: 'Comité Communication', short: 'C.COM', group: 'COMITE', emoji: '📢', order: 11,
    chipBg: 'bg-pink-900/30', chipText: 'text-pink-300', chipBorder: 'border-pink-700/40',
  },
  {
    key: 'COMITE_EVENEMENTS', label: 'Comité Événements', short: 'C.EVT', group: 'COMITE', emoji: '🎉', order: 12,
    chipBg: 'bg-orange-900/30', chipText: 'text-orange-300', chipBorder: 'border-orange-700/40',
  },
  {
    key: 'COMITE_FINANCIER', label: 'Comité Financier', short: 'C.FIN', group: 'COMITE', emoji: '🧾', order: 13,
    chipBg: 'bg-teal-900/30', chipText: 'text-teal-300', chipBorder: 'border-teal-700/40',
  },
]

export function getAssociationRole(key: string | null | undefined) {
  if (!key) return null
  return ASSOCIATION_ROLES.find(r => r.key === String(key).toUpperCase()) ?? null
}

/** Résout un tableau de clés en définitions ordonnées (ordre canonique). */
export function getAssociationRoles(keys: readonly string[] | null | undefined) {
  if (!keys || keys.length === 0) return []
  const set = new Set(keys.map(k => String(k).toUpperCase()))
  return ASSOCIATION_ROLES.filter(r => set.has(r.key))
}

/** Sépare les rôles en groupes bureau / comités, chaque groupe ordonné. */
export function groupAssociationRoles(keys: readonly string[] | null | undefined) {
  const roles = getAssociationRoles(keys)
  return {
    bureau:  roles.filter(r => r.group === 'BUREAU'),
    comites: roles.filter(r => r.group === 'COMITE'),
  }
}
