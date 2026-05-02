'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import {
  LayoutDashboard, Users, Calendar, Trophy, CreditCard,
  Bell, Settings, LogOut, ChevronRight, BookOpen,
  Activity, Shield, ExternalLink, Menu, X,
} from 'lucide-react'
import { Logo } from '@/components/ui/logo'
import { initials } from '@/lib/utils'
import { RoleBadge } from '@/components/ui/badge'
import { ThemeToggle } from '@/components/ui/theme-toggle'

interface NavItem {
  href:    string
  icon:    React.ElementType
  label:   string
  badge?:  number
  roles?:  string[]
}

const NAV_ITEMS: NavItem[] = [
  { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Tableau de bord' },
  { href: '/admin/members',   icon: Users,           label: 'Adhérents'       },
  { href: '/admin/trainings', icon: Activity,        label: 'Entraînements'   },
  { href: '/admin/programs',  icon: Calendar,        label: 'Programmes'      },
  { href: '/admin/events',    icon: Trophy,          label: 'Événements'      },
  { href: '/admin/payments',  icon: CreditCard,      label: 'Paiements'       },
  { href: '/admin/blog',      icon: BookOpen,        label: 'Blog'            },
  { href: '/admin/notifications', icon: Bell,        label: 'Notifications'   },
]

const COACH_NAV: NavItem[] = [
  { href: '/coach/dashboard', icon: LayoutDashboard, label: 'Tableau de bord' },
  { href: '/coach/sessions',  icon: Activity,        label: 'Mes séances'     },
  { href: '/coach/groups',    icon: Users,           label: 'Mes groupes'     },
]

interface SidebarProps {
  variant?: 'admin' | 'coach'
}

export function AdminSidebar({ variant = 'admin' }: SidebarProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)
  const items = variant === 'coach' ? COACH_NAV : NAV_ITEMS
  const role  = session?.user?.role ?? ''
  const name  = session?.user?.name ?? ''
  const parts = name.split(' ')

  const inner = (
    <>
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-major-primary/15">
        <Logo size={48} showText textSize="md" />
        <button onClick={() => setOpen(false)} className="lg:hidden text-gray-500 hover:text-white">
          <X size={20} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {items.map(({ href, icon: Icon, label, badge }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group ${
                active
                  ? 'bg-major-primary text-white shadow-sm shadow-major-primary/30'
                  : 'text-gray-400 hover:bg-major-primary/10 hover:text-major-accent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon size={17} className={active ? 'text-white' : 'text-major-primary group-hover:text-major-accent'} />
                <span className="font-inter text-sm font-medium">{label}</span>
              </div>
              {badge ? (
                <span className="bg-red-500 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {badge}
                </span>
              ) : (
                active && <ChevronRight size={13} className="text-white/50" />
              )}
            </Link>
          )
        })}

        {/* Séparateur + raccourcis */}
        <div className="pt-3 mt-2 border-t border-gray-800/50">
          <p className="text-[10px] text-gray-600 font-inter uppercase tracking-widest px-3 mb-2">Raccourcis</p>
          <Link href="/" target="_blank"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-500 hover:text-major-accent hover:bg-major-primary/10 transition-all duration-150">
            <ExternalLink size={15} />
            <span className="font-inter text-xs">Voir le site public</span>
          </Link>
          {variant === 'admin' && (
            <Link href="/admin/settings"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-500 hover:text-major-accent hover:bg-major-primary/10 transition-all duration-150">
              <Settings size={15} />
              <span className="font-inter text-xs">Paramètres</span>
            </Link>
          )}
        </div>
      </nav>

      {/* Profil utilisateur */}
      <div className="px-3 py-4 border-t border-major-primary/15">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg mb-2">
          <div className="w-9 h-9 rounded-full bg-major-primary flex items-center justify-center text-white text-sm font-oswald font-bold flex-shrink-0">
            {initials(parts[0] ?? 'U', parts[1] ?? '')}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white text-sm font-inter font-medium truncate">{name || 'Utilisateur'}</p>
            <RoleBadge role={role} />
          </div>
        </div>
        <div className="flex items-center justify-between mb-2">
          <ThemeToggle className="flex-1" />
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="w-full flex items-center gap-2 px-3 py-2.5 text-red-400 hover:bg-red-900/10 rounded-lg transition-all text-sm font-inter"
        >
          <LogOut size={15} /> Déconnexion
        </button>
      </div>
    </>
  )

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-major-surface2 border border-gray-800 rounded-xl text-white shadow-lg">
        <Menu size={22} />
      </button>

      {open && (
        <div className="lg:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" onClick={() => setOpen(false)} />
      )}

      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-64 bg-major-surface2 border-r border-major-primary/15 flex-col z-40">
        {inner}
      </aside>

      <aside className={`lg:hidden fixed top-0 left-0 h-full w-72 bg-major-surface2 border-r border-major-primary/15 flex flex-col z-50 transform transition-transform duration-300 ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {inner}
      </aside>
    </>
  )
}
