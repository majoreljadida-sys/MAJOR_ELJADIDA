'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Menu, X, ChevronDown, User, LogOut, LayoutDashboard } from 'lucide-react'
import { Logo } from '@/components/ui/logo'
import { signOut } from 'next-auth/react'
import { useLanguage } from '@/lib/i18n/context'
import { ThemeToggle } from '@/components/ui/theme-toggle'

const NAV_KEYS = [
  { href: '/',            key: 'home'    },
  { href: '/about',       key: 'club'    },
  { href: '/events',      key: 'events'  },
  { href: '/blog',        key: 'blog'    },
  { href: '/entrainements', key: 'training' },
  { href: '/strava',        key: 'strava'   },
  { href: '/coach-major', key: 'coach'   },
  { href: '/contact',     key: 'contact' },
] as const

export function PublicHeader() {
  const [open,     setOpen]     = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [userMenu, setUserMenu] = useState(false)
  const pathname = usePathname()
  const { data: session } = useSession()
  const { lang, setLang, t } = useLanguage()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  function dashboardHref() {
    const role = session?.user?.role
    if (role === 'ADMIN')  return '/admin/dashboard'
    if (role === 'COACH')  return '/coach/trainings'
    return '/member/dashboard'
  }

  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-major-black/95 backdrop-blur-md shadow-lg shadow-black/20 border-b border-major-primary/20' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-32">

          {/* Logo */}
          <Link href="/" className="flex-shrink-0" onClick={() => setOpen(false)}>
            <Logo size={44} showText textSize="md" className="lg:hidden" />
            <Logo size={110} showText textSize="xl" className="hidden lg:inline-flex" />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_KEYS.map(link => {
              const active = pathname === link.href
              return (
                <Link key={link.href} href={link.href}
                  className={`px-3 py-1.5 rounded-md text-sm font-inter font-medium tracking-wide transition-all duration-200 ${
                    active ? 'text-major-accent bg-major-accent/10' : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}>
                  {t.nav[link.key]}
                </Link>
              )
            })}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Language toggle */}
            <button
              onClick={() => setLang(lang === 'fr' ? 'ar' : 'fr')}
              className="px-2.5 py-1 rounded-md border border-major-primary/40 text-xs font-bold tracking-widest text-gray-300 hover:text-white hover:border-major-accent transition-all font-mono"
            >
              {lang === 'fr' ? 'AR' : 'FR'}
            </button>

            <ThemeToggle />

            {session ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenu(v => !v)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-major-primary/10 border border-major-primary/30 text-white hover:bg-major-primary/20 transition-all text-sm font-inter"
                >
                  <User size={16} className="text-major-accent" />
                  <span className="max-w-[120px] truncate">{session.user?.name?.split(' ')[0]}</span>
                  <ChevronDown size={14} className={`text-gray-400 transition-transform ${userMenu ? 'rotate-180' : ''}`} />
                </button>
                {userMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-major-surface border border-major-primary/20 rounded-xl shadow-xl overflow-hidden">
                    <Link href={dashboardHref()} onClick={() => setUserMenu(false)}
                      className="flex items-center gap-2 px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-major-primary/10 transition-colors font-inter">
                      <LayoutDashboard size={16} /> {t.nav.mySpace}
                    </Link>
                    <hr className="border-gray-800" />
                    <button onClick={() => { signOut(); setUserMenu(false) }}
                      className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-red-900/10 transition-colors font-inter">
                      <LogOut size={16} /> {t.nav.logout}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/login" className="text-sm text-gray-300 hover:text-white font-inter transition-colors">
                  {t.nav.login}
                </Link>
                <Link href="/register" className="btn-primary text-sm py-2">
                  {t.nav.register}
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button className="lg:hidden text-white hover:text-major-accent transition-colors p-1" onClick={() => setOpen(v => !v)}>
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden bg-major-surface2 border-t border-major-primary/20">
          <nav className="px-4 py-4 space-y-1">
            {NAV_KEYS.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`block px-3 py-2.5 rounded-lg text-sm font-inter font-medium transition-colors ${
                  pathname === link.href ? 'text-major-accent bg-major-accent/10' : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {t.nav[link.key]}
              </Link>
            ))}
            <div className="pt-3 flex flex-col gap-2 border-t border-gray-800">
              {/* Language toggle mobile */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setLang(lang === 'fr' ? 'ar' : 'fr')}
                  className="px-3 py-1.5 rounded-md border border-major-primary/40 text-xs font-bold tracking-widest text-gray-300 hover:text-white hover:border-major-accent transition-all font-mono"
                >
                  {lang === 'fr' ? '🌐 العربية' : '🌐 Français'}
                </button>
                <ThemeToggle />
              </div>

              {session ? (
                <>
                  <Link href={dashboardHref()} onClick={() => setOpen(false)} className="btn-secondary text-sm py-2 justify-center">
                    {t.nav.mySpace}
                  </Link>
                  <button onClick={() => { signOut(); setOpen(false) }} className="text-red-400 text-sm font-inter hover:text-red-300 text-center py-2">
                    {t.nav.logout}
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login"    onClick={() => setOpen(false)} className="btn-secondary text-sm py-2 justify-center">{t.nav.login}</Link>
                  <Link href="/register" onClick={() => setOpen(false)} className="btn-primary  text-sm py-2 justify-center">{t.nav.register}</Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
