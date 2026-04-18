'use client'

import { useState } from 'react'
import { Mail, Phone, MapPin, Clock, Send, CheckCircle } from 'lucide-react'
import { useLanguage } from '@/lib/i18n/context'

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
