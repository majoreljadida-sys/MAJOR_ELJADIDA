'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { Logo } from '@/components/ui/logo'
import {
  LayoutDashboard, User, CreditCard, Calendar, LogOut, ChevronRight, Menu, X,
} from 'lucide-react'
import { ThemeToggle } from '@/components/ui/theme-toggle'

const NAV = [
  { href: '/member/dashboard', icon: LayoutDashboard, label: 'Tableau de bord' },
  { href: '/member/profile',   icon: User,            label: 'Mon profil'       },
  { href: '/member/payments',  icon: CreditCard,      label: 'Mes paiements'    },
  { href: '/events',           icon: Calendar,        label: 'Événements'       },
]

export function MemberSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const name  = session?.user?.name  ?? 'Membre'
  const photo = session?.user?.image ?? null
  const [open, setOpen] = useState(false)

  const initials = name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()

  const sidebarContent = (
    <>
      <div className="p-5 border-b border-gray-800 flex items-center justify-between">
        <Logo size={48} showText textSize="md" />
        <button onClick={() => setOpen(false)} className="lg:hidden text-gray-500 hover:text-white">
          <X size={20} />
        </button>
      </div>

      {/* Carte profil — visible sur toutes les pages */}
      <div className="p-5 border-b border-gray-800 flex flex-col items-center text-center">
        <div className="w-20 h-20 rounded-full bg-major-primary/15 border-2 border-major-primary/40 flex items-center justify-center text-major-accent text-2xl font-oswald font-bold overflow-hidden mb-3">
          {photo
            ? <img src={photo} alt={name} className="w-full h-full object-cover" />
            : <span>{initials}</span>}
        </div>
        <p className="text-white text-sm font-inter font-semibold truncate w-full">{name}</p>
        <p className="text-gray-500 text-[11px] font-inter uppercase tracking-widest mt-0.5">Membre</p>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link key={href} href={href} onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-inter transition-all ${
                active ? 'bg-major-primary/15 text-major-accent border border-major-primary/30' : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}>
              <Icon size={17} />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight size={14} className="opacity-50" />}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-gray-800 space-y-2">
        <ThemeToggle className="w-full justify-center" />
        <button onClick={() => signOut({ callbackUrl: '/' })}
          className="flex items-center justify-center gap-2 text-gray-500 hover:text-red-400 transition-colors text-xs font-inter w-full py-2">
          <LogOut size={14} /> Se déconnecter
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Burger mobile */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-major-surface border border-gray-800 rounded-xl text-white shadow-lg">
        <Menu size={22} />
      </button>

      {/* Overlay mobile */}
      {open && (
        <div className="lg:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" onClick={() => setOpen(false)} />
      )}

      {/* Sidebar desktop (toujours visible) */}
      <aside className="hidden lg:flex fixed top-0 left-0 h-full w-64 bg-[#0E0E1A] border-r border-gray-800 flex-col z-40">
        {sidebarContent}
      </aside>

      {/* Sidebar mobile (drawer) */}
      <aside className={`lg:hidden fixed top-0 left-0 h-full w-72 bg-[#0E0E1A] border-r border-gray-800 flex flex-col z-50 transform transition-transform duration-300 ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {sidebarContent}
      </aside>
    </>
  )
}
