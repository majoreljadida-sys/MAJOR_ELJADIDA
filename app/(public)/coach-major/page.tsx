'use client'

import Image from 'next/image'
import { Brain, Zap, BookOpen, Users, Sparkles, Bot } from 'lucide-react'
import { useLanguage } from '@/lib/i18n/context'

const FEATURE_ICONS = [Brain, BookOpen, Zap, Users]

const SAMPLE_QUESTIONS_FR = [
  { q: "C'est quoi la VMA ?", a: "La VMA (Vitesse Maximale Aérobie) est la vitesse minimale à laquelle vous consommez votre VO2max. Travailler à cette intensité en fractionné est la méthode la plus efficace pour progresser !" },
  { q: "Comment débuter la course à pied ?", a: "Commencez par alterner marche et course (ex: 1 min course / 2 min marche × 8). L'essentiel : allez à un rythme où vous pouvez parler, et augmentez progressivement." },
  { q: "Quelle fréquence d'entraînement ?", a: "Pour un débutant, 3 séances par semaine sont idéales. Alternez intensités légères et modérées, avec au moins 1 jour de repos entre chaque sortie." },
]

const SAMPLE_QUESTIONS_AR = [
  { q: "ما هي الـ VMA؟", a: "VMA (السرعة الهوائية القصوى) هي أدنى سرعة تستهلك فيها VO2max. العمل بهذه الشدة في التدريب المتقطع هو الطريقة الأكثر فعالية للتقدم!" },
  { q: "كيف أبدأ في الجري؟", a: "ابدأ بالتناوب بين المشي والجري (مثال: 1 دقيقة جري / 2 دقيقة مشي × 8). الأهم: امشِ بإيقاع تستطيع التحدث فيه، وازد تدريجياً." },
  { q: "ما هي تكرار التدريب المثالية؟", a: "للمبتدئين، 3 جلسات أسبوعياً مثالية. بادل بين الشدة الخفيفة والمعتدلة مع يوم راحة على الأقل بين كل جلسة." },
]

export default function CoachMajorPage() {
  const { t, lang } = useLanguage()
  const samples = lang === 'ar' ? SAMPLE_QUESTIONS_AR : SAMPLE_QUESTIONS_FR

  return (
    <div className="min-h-screen bg-major-black pb-24">
      {/* Hero */}
      <section className="relative py-24 px-4 overflow-hidden bg-hero-gradient">
        <div className="absolute inset-0 hero-pattern opacity-50" />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          {/* Avatar Coach IA */}
          <div className="relative mx-auto mb-8 w-36 h-36">
            {/* Halo animé */}
            <div className="absolute inset-[-6px] rounded-full border border-major-cyan/30 animate-spin" style={{ animationDuration: '10s' }} />
            <div className="absolute inset-[-3px] rounded-full border border-major-primary/20 animate-spin" style={{ animationDuration: '6s', animationDirection: 'reverse' }} />
            <div className="absolute inset-0 rounded-full shadow-2xl shadow-major-primary/60" />

            {/* Photo robot Coach MAJOR */}
            <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-major-primary/60">
              <Image
                src="/coach-robot.jpg"
                alt="Coach MAJOR IA"
                fill
                className="object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-major-dark/40 via-transparent to-transparent" />
            </div>

            {/* Badge IA */}
            <div className="absolute bottom-0 right-0 bg-gradient-to-br from-major-cyan to-major-primary text-white text-[10px] font-inter font-black px-2 py-0.5 rounded-full tracking-wider shadow-lg border border-white/20">
              IA
            </div>
          </div>
          <span className="section-tag">{t.coach.tag}</span>
          <h1 className="font-bebas text-7xl text-white tracking-widest mt-2 mb-4">{t.coach.title}</h1>
          <p className="font-inter text-gray-300 text-lg leading-relaxed mb-8">
            {t.coach.desc}
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-major-accent/10 border border-major-accent/30 rounded-full text-major-accent text-sm font-inter">
            <span className="w-2 h-2 rounded-full bg-major-accent animate-pulse" />
            {t.coach.available}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-bebas text-4xl text-white text-center tracking-widest mb-10">{t.coach.features.title}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {t.coach.features.items.map(({ title, desc }, i) => {
              const Icon = FEATURE_ICONS[i]
              return (
                <div key={title} className="card-dark text-center">
                  <div className="w-12 h-12 rounded-xl bg-major-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Icon size={22} className="text-major-accent" />
                  </div>
                  <h3 className="font-oswald text-white text-base font-semibold uppercase tracking-wide mb-2">{title}</h3>
                  <p className="text-gray-400 text-sm font-inter">{desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Exemples de dialogue */}
      <section className="py-16 px-4 bg-[#0A0A14]">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-bebas text-4xl text-white text-center tracking-widest mb-10">{t.coach.examples}</h2>
          <div className="space-y-6">
            {samples.map(({ q, a }, i) => (
              <div key={i} className="space-y-3">
                <div className="flex justify-end">
                  <div className="bg-major-primary text-white rounded-2xl rounded-br-sm px-4 py-3 max-w-sm text-sm font-inter leading-relaxed">
                    {q}
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-gradient flex-shrink-0 flex items-center justify-center font-bebas text-white text-sm border border-major-primary/30">M</div>
                  <div className="bg-major-surface border border-major-primary/20 rounded-2xl rounded-bl-sm px-4 py-3 max-w-md text-sm font-inter text-gray-200 leading-relaxed">
                    {a}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-10 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-gray-600 text-xs font-inter leading-relaxed">
            {t.coach.disclaimer}
          </p>
        </div>
      </section>
    </div>
  )
}
