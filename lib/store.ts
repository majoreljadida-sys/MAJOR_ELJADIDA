// Store MAJOR — constantes partagées (pages publiques, admin, API).

export const STORE_CATEGORIES = [
  { key: 'TEXTILE',    label: 'Textile',     labelAr: 'الملابس'      },
  { key: 'ACCESSOIRE', label: 'Accessoires', labelAr: 'الإكسسوارات' },
] as const

export type StoreOrderStatusKey = 'NEW' | 'CONFIRMED' | 'PAID' | 'DELIVERED' | 'CANCELLED'

export const STORE_ORDER_STATUSES: {
  key: StoreOrderStatusKey; label: string; labelAr: string; color: string
}[] = [
  { key: 'NEW',       label: 'Reçue',      labelAr: 'مستلمة',  color: 'bg-sky-500/15 text-sky-300 border-sky-500/30'             },
  { key: 'CONFIRMED', label: 'Confirmée',  labelAr: 'مؤكدة',   color: 'bg-amber-500/15 text-amber-300 border-amber-500/30'       },
  { key: 'PAID',      label: 'Réglée',     labelAr: 'مدفوعة',  color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
  { key: 'DELIVERED', label: 'Remise',     labelAr: 'مسلّمة',  color: 'bg-gray-500/15 text-gray-300 border-gray-500/30'          },
  { key: 'CANCELLED', label: 'Annulée',    labelAr: 'ملغاة',   color: 'bg-red-500/15 text-red-300 border-red-500/30'             },
]

export function getOrderStatus(key: string) {
  return STORE_ORDER_STATUSES.find(s => s.key === key) ?? STORE_ORDER_STATUSES[0]
}

/** Statuts qui comptent dans la commande groupée fournisseur. */
export const OPEN_ORDER_STATUSES: StoreOrderStatusKey[] = ['NEW', 'CONFIRMED', 'PAID']

/** Limites de saisie d'une commande. */
export const STORE_MAX_LINES    = 20
export const STORE_MAX_QUANTITY = 20

/** Adresse qui reçoit les commandes si aucune n'est définie dans les paramètres du club. */
export const STORE_FALLBACK_EMAIL = 'majoreljadida@gmail.com'

export interface StoreProductDTO {
  id:            string
  slug:          string
  category:      string
  name:          string
  nameAr:        string | null
  description:   string
  descriptionAr: string | null
  features:      string[]
  featuresAr:    string[]
  sizes:         string[]
  price:         number | null
  image:         string
  imageBack:     string | null
}

export function formatMAD(n: number) {
  return `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(n)} DH`
}
