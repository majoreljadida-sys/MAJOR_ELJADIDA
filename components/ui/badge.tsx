import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral'
  size?: 'sm' | 'md'
  className?: string
}

const variants = {
  success: 'text-major-accent  bg-major-accent/10  border-major-accent/30',
  warning: 'text-yellow-400    bg-yellow-900/20    border-yellow-500/30',
  danger:  'text-red-400       bg-red-900/20       border-red-500/30',
  info:    'text-major-cyan    bg-major-cyan/10    border-major-cyan/30',
  neutral: 'text-gray-400      bg-gray-800/50      border-gray-600/30',
}

export function Badge({ children, variant = 'neutral', size = 'md', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-inter font-medium border',
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-0.5 text-xs',
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}

// Helpers spécifiques aux statuts métier
export function MemberStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: BadgeProps['variant'] }> = {
    ACTIVE:    { label: 'Actif',      variant: 'success' },
    EXPIRED:   { label: 'Expiré',     variant: 'warning' },
    SUSPENDED: { label: 'Suspendu',   variant: 'danger'  },
    PENDING:   { label: 'En attente', variant: 'info'    },
  }
  const cfg = map[status] ?? { label: status, variant: 'neutral' as const }
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>
}

export function PaymentStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: BadgeProps['variant'] }> = {
    PAID:    { label: 'Payé',      variant: 'success' },
    PENDING: { label: 'En attente',variant: 'warning' },
    LATE:    { label: 'En retard', variant: 'danger'  },
  }
  const cfg = map[status] ?? { label: status, variant: 'neutral' as const }
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>
}

export function RoleBadge({ role }: { role: string }) {
  const map: Record<string, { label: string; variant: BadgeProps['variant'] }> = {
    ADMIN:  { label: 'Admin',    variant: 'danger'  },
    COACH:  { label: 'Coach',    variant: 'info'    },
    MEMBER: { label: 'Adhérent', variant: 'success' },
  }
  const cfg = map[role] ?? { label: role, variant: 'neutral' as const }
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>
}
