// ─────────────────────────────────────────────────────────────────────
// Catalogue des dépenses — libellés, groupes, couleurs.
// Source de vérité des clés : enums `ExpenseCategory` et
// `ExpensePaymentMethod` dans prisma/schema.prisma.
// ─────────────────────────────────────────────────────────────────────

export const EXPENSE_CATEGORY_KEYS = [
  'TRAINING_WATER', 'TRAINING_FRUITS', 'TRAINING_EQUIPMENT',
  'EVENT_TRANSPORT', 'EVENT_HAMMAM', 'EVENT_MEAL', 'EVENT_REFRESHMENT',
  'EVENT_REGISTRATION', 'EVENT_ACCOMMODATION',
  'EQUIPMENT_COLLECTIVE', 'EQUIPMENT_UNIFORM',
  'COMMUNICATION', 'ADMINISTRATION', 'OTHER',
] as const
export type ExpenseCategoryKey = typeof EXPENSE_CATEGORY_KEYS[number]

export type ExpenseGroupKey = 'TRAINING' | 'EVENT' | 'EQUIPMENT' | 'MISC'

export const EXPENSE_GROUPS: {
  key:   ExpenseGroupKey
  label: string
  emoji: string
  color: string   // hex for charts
}[] = [
  { key: 'TRAINING',  label: 'Entraînements', emoji: '🏃', color: '#3b82f6' },
  { key: 'EVENT',     label: 'Événements',     emoji: '🏆', color: '#f59e0b' },
  { key: 'EQUIPMENT', label: 'Équipement',     emoji: '👕', color: '#10b981' },
  { key: 'MISC',      label: 'Divers',          emoji: '📦', color: '#8b5cf6' },
]

export const EXPENSE_CATEGORIES: {
  key:         ExpenseCategoryKey
  label:       string
  short:       string
  emoji:       string
  group:       ExpenseGroupKey
  description: string
  color:       string   // hex for pie chart
  chipBg:      string
  chipText:    string
  chipBorder:  string
}[] = [
  // Entraînements
  {
    key: 'TRAINING_WATER', label: 'Eau (entraînements)', short: 'EAU', emoji: '💧',
    group: 'TRAINING', description: 'Bouteilles d\'eau pour les séances d\'entraînement.',
    color: '#60a5fa', chipBg: 'bg-blue-900/30', chipText: 'text-blue-300', chipBorder: 'border-blue-700/40',
  },
  {
    key: 'TRAINING_FRUITS', label: 'Fruits / fruits secs', short: 'FRUITS', emoji: '🍎',
    group: 'TRAINING', description: 'Collations post-entraînement : fruits frais, dattes, amandes…',
    color: '#4ade80', chipBg: 'bg-green-900/30', chipText: 'text-green-300', chipBorder: 'border-green-700/40',
  },
  {
    key: 'TRAINING_EQUIPMENT', label: 'Matériel entraînement', short: 'MAT.ENT', emoji: '🔧',
    group: 'TRAINING', description: 'Petit matériel : plots, chronos, sifflet, trousse de secours.',
    color: '#38bdf8', chipBg: 'bg-sky-900/30', chipText: 'text-sky-300', chipBorder: 'border-sky-700/40',
  },
  // Événements
  {
    key: 'EVENT_TRANSPORT', label: 'Transport', short: 'TRANS', emoji: '🚌',
    group: 'EVENT', description: 'Bus, voitures, taxis vers les événements.',
    color: '#f97316', chipBg: 'bg-orange-900/30', chipText: 'text-orange-300', chipBorder: 'border-orange-700/40',
  },
  {
    key: 'EVENT_HAMMAM', label: 'Hammam', short: 'HAM', emoji: '💆',
    group: 'EVENT', description: 'Hammam post-course / détente.',
    color: '#ec4899', chipBg: 'bg-pink-900/30', chipText: 'text-pink-300', chipBorder: 'border-pink-700/40',
  },
  {
    key: 'EVENT_MEAL', label: 'Repas', short: 'REPAS', emoji: '🍽️',
    group: 'EVENT', description: 'Déjeuner, dîner lors des événements.',
    color: '#eab308', chipBg: 'bg-yellow-900/30', chipText: 'text-yellow-300', chipBorder: 'border-yellow-700/40',
  },
  {
    key: 'EVENT_REFRESHMENT', label: 'Ravitaillement', short: 'RAVIT', emoji: '🥤',
    group: 'EVENT', description: 'Ravitaillement au départ : eau, isotonique, gels, bananes…',
    color: '#fbbf24', chipBg: 'bg-amber-900/30', chipText: 'text-amber-300', chipBorder: 'border-amber-700/40',
  },
  {
    key: 'EVENT_REGISTRATION', label: 'Frais d\'inscription', short: 'INSC', emoji: '🎫',
    group: 'EVENT', description: 'Dossards, frais d\'inscription aux courses.',
    color: '#f87171', chipBg: 'bg-red-900/30', chipText: 'text-red-300', chipBorder: 'border-red-700/40',
  },
  {
    key: 'EVENT_ACCOMMODATION', label: 'Hébergement', short: 'HEB', emoji: '🏨',
    group: 'EVENT', description: 'Hôtel, Airbnb, auberge pour les déplacements.',
    color: '#fb923c', chipBg: 'bg-orange-900/30', chipText: 'text-orange-200', chipBorder: 'border-orange-600/40',
  },
  // Équipement
  {
    key: 'EQUIPMENT_COLLECTIVE', label: 'Équipement collectif', short: 'EQ.COL', emoji: '🚩',
    group: 'EQUIPMENT', description: 'Banderoles, drapeaux, tente, mégaphone, matériel club.',
    color: '#34d399', chipBg: 'bg-emerald-900/30', chipText: 'text-emerald-300', chipBorder: 'border-emerald-700/40',
  },
  {
    key: 'EQUIPMENT_UNIFORM', label: 'Maillots / tenues', short: 'MAIL', emoji: '👕',
    group: 'EQUIPMENT', description: 'Maillots club, vestes, casquettes.',
    color: '#06b6d4', chipBg: 'bg-cyan-900/30', chipText: 'text-cyan-300', chipBorder: 'border-cyan-700/40',
  },
  // Divers
  {
    key: 'COMMUNICATION', label: 'Communication', short: 'COMM', emoji: '📢',
    group: 'MISC', description: 'Flyers, impression, promotion, réseaux sociaux.',
    color: '#a78bfa', chipBg: 'bg-violet-900/30', chipText: 'text-violet-300', chipBorder: 'border-violet-700/40',
  },
  {
    key: 'ADMINISTRATION', label: 'Administration', short: 'ADM', emoji: '📑',
    group: 'MISC', description: 'Frais bancaires, assurance, hébergement web, licences.',
    color: '#9ca3af', chipBg: 'bg-slate-800/60', chipText: 'text-slate-300', chipBorder: 'border-slate-600/40',
  },
  {
    key: 'OTHER', label: 'Autre / divers', short: 'DIV', emoji: '📦',
    group: 'MISC', description: 'Autres dépenses qui n\'entrent dans aucune catégorie.',
    color: '#64748b', chipBg: 'bg-gray-800/60', chipText: 'text-gray-300', chipBorder: 'border-gray-600/40',
  },
]

export function getExpenseCategory(key: string | null | undefined) {
  if (!key) return null
  return EXPENSE_CATEGORIES.find(c => c.key === String(key).toUpperCase()) ?? null
}

export function categoriesByGroup(group: ExpenseGroupKey) {
  return EXPENSE_CATEGORIES.filter(c => c.group === group)
}

// ── Modes de paiement ───────────────────────────────────────────────

export const PAYMENT_METHOD_KEYS = ['CASH', 'BANK_TRANSFER', 'CHECK', 'CARD'] as const
export type PaymentMethodKey = typeof PAYMENT_METHOD_KEYS[number]

export const PAYMENT_METHODS: { key: PaymentMethodKey; label: string; emoji: string }[] = [
  { key: 'CASH',          label: 'Espèces',           emoji: '💵' },
  { key: 'BANK_TRANSFER', label: 'Virement bancaire', emoji: '🏦' },
  { key: 'CHECK',         label: 'Chèque',             emoji: '✍️' },
  { key: 'CARD',          label: 'Carte bancaire',    emoji: '💳' },
]

export function getPaymentMethod(key: string | null | undefined) {
  if (!key) return null
  return PAYMENT_METHODS.find(m => m.key === String(key).toUpperCase()) ?? null
}
