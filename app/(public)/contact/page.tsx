'use client'

import { useState } from 'react'
import { Mail, Phone, MapPin, Clock, Send, CheckCircle, Instagram, Facebook } from 'lucide-react'
import { useLanguage } from '@/lib/i18n/context'

// Logo Strava (SVG officiel — Lucide ne fournit pas d'icône Strava)
const StravaIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066M10.463 0l-7 13.828h4.169l2.831 5.599 2.836-5.599h4.172"/>
  </svg>
)

const SOCIALS = [
  {
    name: 'Instagram',
    handle: '@major_running_club',
    href: 'https://www.instagram.com/major_running_club',
    Icon: Instagram,
    classes: 'bg-gradient-to-br from-fuchsia-500/15 to-pink-500/15 border-pink-500/30 text-pink-400 hover:from-fuchsia-500 hover:to-pink-500 hover:text-white hover:border-pink-400',
  },
  {
    name: 'Facebook',
    handle: 'Club MAJOR El Jadida',
    href: 'https://www.facebook.com/share/1aKcyRb9yd/',
    Icon: Facebook,
    classes: 'bg-blue-500/15 border-blue-500/30 text-blue-400 hover:bg-blue-500 hover:text-white hover:border-blue-400',
  },
  {
    name: 'Strava',
    handle: 'Major Running Club',
    href: 'https://www.strava.com/clubs/2075788',
    Icon: StravaIcon,
    classes: 'bg-orange-500/15 border-orange-500/30 text-orange-400 hover:bg-orange-500 hover:text-white hover:border-orange-400',
  },
]

export default function ContactPage() {
  const { t } = useLanguage()
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 1200))
    setSent(true)
    setLoading(false)
  }

  const INFO = [
    { icon: MapPin, label: t.contact.info.address, value: t.contact.info.address },
    { icon: Mail,   label: 'Email',                value: t.contact.info.email   },
    { icon: Phone,  label: t.contact.info.phone,   value: t.contact.info.phone   },
    { icon: Clock,  label: t.contact.info.hours,   value: t.contact.info.hours   },
  ]

  return (
    <div className="min-h-screen bg-major-black pb-24">
      {/* Hero */}
      <div className="bg-gradient-to-b from-[#0A1A12] to-major-black pt-16 pb-12 px-4 text-center">
        <span className="section-tag">{t.contact.tag}</span>
        <h1 className="font-bebas text-6xl text-white tracking-widest mt-2 mb-4">{t.contact.title}</h1>
        <p className="text-gray-400 font-inter text-base max-w-xl mx-auto">
          {t.contact.desc}
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">

          {/* Infos */}
          <div className="lg:col-span-2 space-y-5">
            {INFO.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-4 card-dark">
                <div className="w-10 h-10 rounded-xl bg-major-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon size={18} className="text-major-accent" />
                </div>
                <div>
                  <p className="text-gray-500 text-xs font-inter uppercase tracking-widest mb-0.5">{label}</p>
                  <p className="text-white font-inter text-sm font-medium">{value}</p>
                </div>
              </div>
            ))}

            {/* Réseaux sociaux */}
            <div className="card-dark">
              <p className="text-gray-500 text-xs font-inter uppercase tracking-widest mb-4">Suivez-nous</p>
              <div className="space-y-2.5">
                {SOCIALS.map(({ name, handle, href, Icon, classes }) => (
                  <a key={name} href={href} target="_blank" rel="noopener noreferrer"
                    aria-label={`Club MAJOR sur ${name}`}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${classes}`}>
                    <Icon size={20} />
                    <div className="flex-1 min-w-0">
                      <p className="font-inter text-sm font-semibold leading-tight">{name}</p>
                      <p className="text-xs opacity-80 truncate">{handle}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Map placeholder */}
            <div className="rounded-2xl overflow-hidden border border-major-primary/20 h-48 bg-major-surface flex items-center justify-center">
              <div className="text-center">
                <MapPin size={32} className="text-major-primary mx-auto mb-2 opacity-40" />
                <p className="text-gray-600 text-xs font-inter">El Jadida, Maroc</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-3">
            {sent ? (
              <div className="card-dark h-full flex flex-col items-center justify-center text-center py-16 gap-5">
                <div className="w-16 h-16 rounded-full bg-major-primary/10 flex items-center justify-center">
                  <CheckCircle size={32} className="text-major-accent" />
                </div>
                <h3 className="font-bebas text-3xl text-white tracking-widest">{t.contact.success.title}</h3>
                <p className="text-gray-400 font-inter text-sm max-w-xs leading-relaxed">
                  {t.contact.success.desc}
                </p>
                <button onClick={() => { setSent(false); setForm({ name: '', email: '', subject: '', message: '' }) }}
                  className="btn-secondary text-sm px-6 py-2 mt-2">
                  {t.contact.success.again}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="card-dark space-y-5">
                <h2 className="font-oswald text-white text-2xl uppercase tracking-wide mb-2">{t.contact.form.title}</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">{t.contact.form.name}</label>
                    <input className="input-dark" placeholder={t.contact.form.namePh}
                      value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                  </div>
                  <div>
                    <label className="form-label">{t.contact.form.email}</label>
                    <input type="email" className="input-dark" placeholder={t.contact.form.emailPh}
                      value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
                  </div>
                </div>

                <div>
                  <label className="form-label">{t.contact.form.subject}</label>
                  <select className="input-dark" value={form.subject}
                    onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} required>
                    <option value="">{t.contact.form.subjectPh}</option>
                    {t.contact.form.subjects.map(s => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">{t.contact.form.message}</label>
                  <textarea className="input-dark resize-none" rows={5} placeholder={t.contact.form.messagePh}
                    value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} required />
                </div>

                <button type="submit" disabled={loading}
                  className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 disabled:opacity-60 disabled:cursor-not-allowed">
                  {loading
                    ? <span className="font-inter text-sm">{t.contact.form.sending}</span>
                    : <><Send size={16} /><span className="font-inter text-sm font-medium">{t.contact.form.send}</span></>
                  }
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
