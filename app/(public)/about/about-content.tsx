'use client'

import Link from 'next/link'
import { Heart, Users, Zap, Shield, Award, MapPin } from 'lucide-react'
import { useLanguage } from '@/lib/i18n/context'

const VALUE_ICONS = [Heart, Users, Heart, Zap, Shield]

interface Props {
  memberCount: number
  coachCount:  number
}

export function AboutContent({ memberCount, coachCount }: Props) {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen bg-major-black pb-24">
      {/* Hero */}
      <section className="relative py-28 px-4 overflow-hidden bg-hero-gradient">
        <div className="absolute inset-0 hero-pattern opacity-50" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="font-bebas text-5xl sm:text-6xl text-white tracking-widest mb-5">{t.about.hero.title}</h1>
          {/* Cri de ralliement */}
          <p className="font-cairo text-3xl sm:text-4xl text-major-accent font-bold mb-2" dir="rtl">
            ماجووور بالفرح و السرور
          </p>
          <p className="font-inter text-xs text-gray-400 tracking-[0.25em] uppercase mb-6">
            MAJOR — avec joie et allégresse
          </p>
          <p className="font-inter text-gray-300 text-base leading-relaxed max-w-2xl mx-auto">
            {t.about.hero.desc}
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-4 bg-major-primary/8 border-y border-major-primary/20">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { v: `${memberCount}+`, l: t.about.stats.members  },
            { v: `${coachCount}`,   l: t.about.stats.coaches  },
            { v: '50+',             l: t.about.stats.events   },
            { v: 'El Jadida',       l: t.about.stats.location },
          ].map(s => (
            <div key={s.l}>
              <p className="font-bebas text-4xl text-major-accent tracking-wide">{s.v}</p>
              <p className="font-inter text-gray-400 text-sm mt-1">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="section-tag">{t.about.mission.tag}</span>
              <h2 className="font-bebas text-5xl text-white tracking-widest mt-2 mb-6">{t.about.mission.title}</h2>
              <div className="space-y-4 text-gray-400 font-inter text-base leading-relaxed">
                <p>{t.about.mission.p1}</p>
                <p>{t.about.mission.p2}</p>
                <p>{t.about.mission.p3}</p>
              </div>
            </div>
            <div className="space-y-4">
              {t.about.mission.items.map(({ title, desc }, i) => {
                const icons = [MapPin, Award, Users]
                const Icon  = icons[i]
                return (
                  <div key={title} className="flex gap-4 card-dark">
                    <div className="w-10 h-10 rounded-xl bg-major-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon size={18} className="text-major-accent" />
                    </div>
                    <div>
                      <h4 className="font-oswald text-white font-semibold text-base uppercase mb-1">{title}</h4>
                      <p className="text-gray-400 text-sm font-inter">{desc}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Valeurs */}
      <section className="py-20 px-4 bg-[#0A0A14]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="section-tag">{t.about.values.tag}</span>
            <h2 className="section-title">{t.about.values.title}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {t.about.values.items.map(({ title, desc }, i) => {
              const Icon = VALUE_ICONS[i]
              return (
                <div key={title} className="card-dark text-center">
                  <div className="w-10 h-10 rounded-xl bg-major-primary/10 flex items-center justify-center mx-auto mb-3">
                    <Icon size={18} className="text-major-accent" />
                  </div>
                  <h3 className="font-oswald text-white text-sm font-bold uppercase tracking-widest mb-2">{title}</h3>
                  <p className="text-gray-400 text-xs font-inter leading-relaxed">{desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 text-center">
        <h2 className="font-bebas text-5xl text-white tracking-widest mb-4">{t.about.cta.title}</h2>
        <p className="text-gray-400 font-inter mb-8 max-w-md mx-auto">{t.about.cta.desc}</p>
        <Link href="/register" className="btn-primary text-base px-8 py-3.5">{t.about.cta.btn}</Link>
      </section>
    </div>
  )
}
