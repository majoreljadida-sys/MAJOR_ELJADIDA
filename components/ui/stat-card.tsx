import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  icon:     LucideIcon
  label:    string
  value:    string | number
  trend?:   number        // % variation
  color?:   'primary' | 'cyan' | 'accent' | 'red' | 'yellow'
  className?: string
}

const colorMap = {
  primary: { border: 'border-major-primary/40', text: 'text-major-primary',  bg: 'bg-major-primary/10'  },
  cyan:    { border: 'border-major-cyan/40',    text: 'text-major-cyan',     bg: 'bg-major-cyan/10'     },
  accent:  { border: 'border-major-accent/40',  text: 'text-major-accent',   bg: 'bg-major-accent/10'   },
  red:     { border: 'border-red-500/40',       text: 'text-red-400',        bg: 'bg-red-900/10'        },
  yellow:  { border: 'border-yellow-500/40',    text: 'text-yellow-400',     bg: 'bg-yellow-900/10'     },
}

export function StatCard({ icon: Icon, label, value, trend, color = 'primary', className }: StatCardProps) {
  const c = colorMap[color]
  const trendPositive = trend !== undefined && trend > 0
  const trendNegative = trend !== undefined && trend < 0

  return (
    <div className={cn('bg-major-surface border rounded-xl p-5 flex items-start gap-4 transition-all duration-300 hover:shadow-lg', c.border, className)}>
      <div className={cn('p-3 rounded-xl flex-shrink-0', c.bg)}>
        <Icon size={22} className={c.text} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-gray-500 text-xs font-inter uppercase tracking-wider mb-1 truncate">{label}</p>
        <p className="text-white text-2xl font-oswald font-bold">{value}</p>
        {trend !== undefined && (
          <p className={cn('text-xs font-inter mt-1 flex items-center gap-0.5', trendPositive ? 'text-major-accent' : trendNegative ? 'text-red-400' : 'text-gray-500')}>
            {trendPositive ? '↑' : trendNegative ? '↓' : '→'}
            {Math.abs(trend)}% ce mois
          </p>
        )}
      </div>
    </div>
  )
}
