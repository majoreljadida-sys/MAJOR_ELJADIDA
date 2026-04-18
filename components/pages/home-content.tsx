'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Heart, Shield, Users, Zap, ChevronRight, MapPin, Clock, BookOpen, MessageCircle, Eye } from 'lucide-react'
import { useLanguage } from '@/lib/i18n/context'
import { formatDate, EVENT_TYPE_LABELS, getEventTypeColor } from '@/lib/utils'
import type { Event, BlogPost, BlogCategory } from '@prisma/client'

type EventWithCount = Event & { _count: { registrations: number } }
type PostWithCat    = BlogPost & { category: BlogCategory | null }

const VALUE_ICONS   = [Heart, Users, Zap, Shield, Eye]
const TRAINING_COLORS = [
  'from-major-primary to-major-dark',
  'from-major-cyan to-major-primary',
  'from-major-accent to-major-primary',
  'from-purple-600 to-major-primary',
]

interface Props {
  events: EventWithCount[]
  posts:  PostWithCat[]
}

export function HomeContent({ events, posts }: Props) {
  const { t } = useLanguage()

  return (
    <>
      {/* ═══ HERO ══════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden bg-hero-gradient">
        <div className="absolute inset-0 hero-pattern opacity-60" />
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-major-black to-transparent" />

        <div className="relative z-10 flex flex-col items-center max-w-4xl mx-auto">
          <span className="font-inter text-major-cyan text-sm font-medium tracking-[0.35em] uppercase mb-3 animate-fade-up animate-delay-100">
            {t.home.hero.subtitle}
          </span>

          <h1 className="font-bebas text-[80px] sm:text-[100px] lg:text-[120px] text-white tracking-widest leading-none mb-3 animate-fade-up animate-delay-200">
            MAJOR
          </h1>

          {/* Cri de ralliement du club */}
          <div className="mb-6 animate-fade-up animate-delay-300">
            <p className="font-cairo text-3xl sm:text-4xl text-major-accent font-bold leading-tight" dir="rtl">
              {t.home.hero.slogan}
            </p>
            <p className="font-inter text-sm text-gray-400 tracking-[0.25em] uppercase mt-1">
              {t.home.hero.sloganSub}
            </p>
          </div>

          <p className="font-inter text-gray-400 text-base sm:text-lg max-w-2xl leading-relaxed mb-10 animate-fade-up animate-delay-300">
            {t.home.hero.desc}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 animate-fade-up animate-delay-500">
            <Link href="/register" className="btn-primary text-base px-8 py-3.5 group">
              {t.home.hero.cta1}
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/events" className="btn-secondary text-base px-8 py-3.5">
              {t.home.hero.cta2}
            </Link>
            <Link href="/coach-major"
              className="inline-flex items-center gap-2 px-6 py-3.5 text-gray-300 hover:text-white text-base font-inter font-medium transition-colors group">
              <MessageCircle size={18} className="text-major-accent group-hover:scale-110 transition-transform" />
              {t.nav.coach}
            </Link>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-fade-in animate-delay-500">
          <div className="w-px h-10 bg-gradient-to-b from-major-primary to-transparent" />
        </div>
      </section>

      {/* ═══ STATS BAR ════════════════════════════════════════════ */}
      <section className="bg-major-primary/8 border-y border-major-primary/20 py-10">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: '300+', label: t.home.stats.members  },
            { value: '15+',  label: t.home.stats.years    },
            { value: '50+',  label: t.home.stats.events   },
            { value: '4',    label: t.home.stats.coaches  },
          ].map(s => (
            <div key={s.label}>
              <p className="font-bebas text-5xl text-major-accent tracking-wide">{s.value}</p>
              <p className="font-inter text-gray-400 text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ VALEURS ══════════════════════════════════════════════ */}
      <section className="py-24 px-4 bg-major-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <span className="section-tag">{t.home.values.tag}</span>
            <h2 className="section-title">{t.home.values.title}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {t.home.values.items.map(({ title, desc }, i) => {
              const Icon = VALUE_ICONS[i]
              return (
                <div key={title} className="card-dark group cursor-default">
                  <div className="w-12 h-12 rounded-xl bg-major-primary/10 flex items-center justify-center mb-4 group-hover:bg-major-primary/20 transition-colors">
                    <Icon size={24} className="text-major-accent" />
                  </div>
                  <h3 className="font-oswald text-white text-lg font-semibold uppercase tracking-wide mb-3">{title}</h3>
                  <p className="font-inter text-gray-400 text-sm leading-relaxed">{desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ═══ ENTRAÎNEMENTS ════════════════════════════════════════ */}
      <section className="py-24 px-4 bg-[#0A0A14]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <span className="section-tag">{t.home.training.tag}</span>
            <h2 className="section-title">{t.home.training.title}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {t.home.training.items.map(({ label, desc }, i) => (
              <div key={label} className="group relative overflow-hidden rounded-xl bg-major-surface border border-major-primary/20 hover:border-major-primary/60 transition-all duration-300">
                <div className={`h-1.5 bg-gradient-to-r ${TRAINING_COLORS[i]}`} />
                <div className="p-5">
                  <h3 className="font-oswald text-white font-semibold text-base uppercase tracking-wide mb-2">{label}</h3>
                  <p className="text-gray-400 text-sm font-inter leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/register" className="btn-primary">
              {t.home.hero.cta1} <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ ÉVÉNEMENTS ═══════════════════════════════════════════ */}
      <section className="py-24 px-4 bg-major-black">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12 gap-4">
            <div>
              <span className="section-tag">{t.home.eventsSection.tag}</span>
              <h2 className="section-title">{t.home.eventsSection.title}</h2>
            </div>
            <Link href="/events" className="text-major-accent hover:text-white transition-colors font-inter text-sm flex items-center gap-1.5">
              {t.home.eventsSection.viewAll}
            </Link>
          </div>

          {events.length === 0 ? (
            <p className="text-gray-500 text-center font-inter py-12">{t.home.eventsSection.noEvents}</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {events.map(event => {
                const fillPct   = event.maxParticipants ? Math.round((event._count.registrations / event.maxParticipants) * 100) : 0
                const typeColor = getEventTypeColor(event.type)
                return (
                  <article key={event.id} className="card-dark group hover:shadow-lg hover:shadow-major-primary/10 transition-all duration-300">
                    <div className="h-1.5 bg-gradient-to-r from-major-primary to-major-cyan rounded-t-sm -mx-5 -mt-5 mb-5" />
                    <div className="flex items-start gap-3 mb-4">
                      <div className="text-center bg-major-primary/10 border border-major-primary/30 rounded-lg px-3 py-2 min-w-[52px] flex-shrink-0">
                        <p className="text-gray-400 text-[10px] font-inter uppercase">{formatDate(event.date, 'MMM')}</p>
                        <p className="font-bebas text-3xl text-white leading-tight">{formatDate(event.date, 'dd')}</p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className={`badge ${typeColor} text-[10px] mb-1.5`}>{EVENT_TYPE_LABELS[event.type] ?? event.type}</span>
                        <h3 className="font-oswald text-white font-semibold text-lg leading-tight group-hover:text-major-accent transition-colors">
                          {event.title}
                        </h3>
                      </div>
                    </div>
                    <div className="space-y-1.5 mb-4 text-sm font-inter text-gray-400">
                      <div className="flex items-center gap-2"><MapPin size={13} className="text-major-primary" />{event.location}</div>
                      {event.distance && <div className="flex items-center gap-2"><Clock size={13} className="text-major-primary" />{event.distance}</div>}
                    </div>
                    {event.maxParticipants && (
                      <div className="mb-4">
                        <div className="flex justify-between text-xs font-inter text-gray-500 mb-1">
                          <span>{event._count.registrations} {t.home.eventsSection.register}</span>
                          <span className={fillPct >= 90 ? 'text-red-400' : fillPct >= 70 ? 'text-yellow-400' : 'text-major-accent'}>{fillPct}%</span>
                        </div>
                        <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${fillPct >= 90 ? 'bg-red-500' : fillPct >= 70 ? 'bg-yellow-500' : 'bg-major-primary'}`} style={{ width: `${fillPct}%` }} />
                        </div>
                      </div>
                    )}
                    <Link href={`/events#${event.slug}`} className="w-full flex items-center justify-center gap-2 py-2 border border-major-primary/30 text-major-accent text-sm font-inter font-medium rounded-lg hover:bg-major-primary/10 transition-colors">
                      {t.home.eventsSection.register} <ChevronRight size={13} />
                    </Link>
                  </article>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* ═══ BLOG ═════════════════════════════════════════════════ */}
      <section className="py-24 px-4 bg-[#0A0A14]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12 gap-4">
            <div>
              <span className="section-tag">{t.home.blogSection.tag}</span>
              <h2 className="section-title">{t.home.blogSection.title}</h2>
              <p className="text-gray-400 font-inter text-sm mt-2 max-w-md">{t.home.blogSection.desc}</p>
            </div>
            <Link href="/blog" className="text-major-accent hover:text-white transition-colors font-inter text-sm flex items-center gap-1.5">
              {t.home.blogSection.viewAll}
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {posts.map(post => (
              <Link key={post.id} href={`/blog/${post.slug}`} className="group card-dark hover:shadow-lg hover:shadow-major-primary/10 transition-all duration-300 flex flex-col">
                {post.coverImage && (
                  <div className="relative h-44 -mx-5 -mt-5 mb-5 rounded-t-xl overflow-hidden">
                    <Image src={post.coverImage} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-major-surface via-transparent to-transparent" />
                    {post.category && (
                      <span className="absolute bottom-3 left-3 badge text-[10px]"
                        style={{ color: post.category.color ?? '#4CAF82', backgroundColor: `${post.category.color ?? '#4CAF82'}20`, borderColor: `${post.category.color ?? '#4CAF82'}40` }}>
                        {post.category.name}
                      </span>
                    )}
                  </div>
                )}
                <div className="flex-1 flex flex-col">
                  <h3 className="font-oswald text-white font-semibold text-lg leading-tight mb-2 group-hover:text-major-accent transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-gray-400 text-sm font-inter leading-relaxed flex-1 mb-3">{post.excerpt}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-500 font-inter">
                    <BookOpen size={12} />
                    <span>{post.readTime} {t.home.blogSection.readMin}</span>
                    <span>·</span>
                    <span>{formatDate(post.publishedAt!, 'dd MMM yyyy')}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CHATBOT CTA ══════════════════════════════════════════ */}
      <section className="py-20 px-4 bg-major-black border-y border-major-primary/10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-16 h-16 rounded-full bg-green-gradient flex items-center justify-center mx-auto mb-6 shadow-lg shadow-major-primary/30">
            <MessageCircle size={28} className="text-white" />
          </div>
          <span className="section-tag">{t.home.chatSection.tag}</span>
          <h2 className="font-bebas text-5xl text-white tracking-widest mt-2 mb-4">{t.home.chatSection.title}</h2>
          <p className="text-gray-400 font-inter text-base max-w-lg mx-auto mb-8">
            {t.home.chatSection.desc}
          </p>
          <Link href="/coach-major" className="btn-primary text-base px-8 py-3.5">
            {t.home.chatSection.cta} <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* ═══ CTA FINAL ════════════════════════════════════════════ */}
      <section className="relative py-28 px-4 overflow-hidden bg-cta-gradient">
        <div className="absolute top-0 right-0 w-80 h-80 bg-major-cyan/5 rounded-full blur-3xl" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="font-bebas text-6xl sm:text-7xl text-white tracking-widest mb-4">
            {t.home.cta.title}
          </h2>
          <p className="font-inter text-gray-300 text-lg mb-8 max-w-xl mx-auto">
            {t.home.cta.desc}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="btn-primary text-base px-10 py-4 group">
              {t.home.cta.btn1} <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/contact" className="btn-secondary text-base px-10 py-4">
              {t.home.cta.btn2}
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
