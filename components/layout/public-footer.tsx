'use client'

import Link from 'next/link'
import { Instagram, Facebook, Youtube, MapPin, Phone, Mail } from 'lucide-react'
import { useLanguage } from '@/lib/i18n/context'

export function PublicFooter() {
  const { t } = useLanguage()

  const LINKS = {
    club:   [
      { href: '/about',       label: t.nav.club    },
      { href: '/events',      label: t.nav.events  },
      { href: '/blog',        label: t.nav.blog    },
      { href: '/contact',     label: t.nav.contact },
    ],
    membre: [
      { href: '/register',    label: t.nav.register  },
      { href: '/login',       label: t.nav.login     },
      { href: '/coach-major', label: t.nav.coach     },
    ],
  }

  return (
    <footer className="bg-major-black border-t border-major-primary/10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <span className="font-bebas text-3xl text-white tracking-widest leading-none">MAJOR</span>
              <span className="text-[10px] font-inter text-gray-500 uppercase tracking-widest leading-tight">El Jadida</span>
            </Link>
            <p className="text-gray-400 text-sm font-inter leading-relaxed mb-5 max-w-xs">
              {t.footer.tagline}
            </p>
            <div className="flex gap-3">
              {[
                { Icon: Instagram, label: 'Instagram' },
                { Icon: Facebook,  label: 'Facebook'  },
                { Icon: Youtube,   label: 'Youtube'   },
              ].map(({ Icon, label }) => (
                <a key={label} href="#" aria-label={label}
                  className="w-9 h-9 rounded-lg bg-major-surface border border-major-primary/20 flex items-center justify-center text-gray-500 hover:text-major-accent hover:border-major-accent/40 transition-all">
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Club */}
          <div>
            <h4 className="font-oswald text-major-primary text-sm font-semibold uppercase tracking-widest mb-4">
              {t.nav.club}
            </h4>
            <ul className="space-y-2.5">
              {LINKS.club.map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="text-gray-400 hover:text-major-accent text-sm font-inter transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Espace membre */}
          <div>
            <h4 className="font-oswald text-major-primary text-sm font-semibold uppercase tracking-widest mb-4">
              {t.nav.mySpace}
            </h4>
            <ul className="space-y-2.5">
              {LINKS.membre.map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="text-gray-400 hover:text-major-accent text-sm font-inter transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-oswald text-major-primary text-sm font-semibold uppercase tracking-widest mb-4">
              {t.nav.contact}
            </h4>
            <ul className="space-y-3 text-sm font-inter text-gray-400">
              <li className="flex items-start gap-2.5">
                <MapPin size={15} className="text-major-primary mt-0.5 flex-shrink-0" />
                <span>{t.footer.address}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone size={15} className="text-major-primary flex-shrink-0" />
                <a href="tel:+212000000000" className="hover:text-major-accent transition-colors">+212 6 XX XX XX XX</a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail size={15} className="text-major-primary flex-shrink-0" />
                <a href="mailto:majoreljadida@gmail.com" className="hover:text-major-accent transition-colors">majoreljadida@gmail.com</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-600 text-xs font-inter">
            © {new Date().getFullYear()} Club MAJOR. {t.footer.rights}.
          </p>
        </div>
      </div>
    </footer>
  )
}
