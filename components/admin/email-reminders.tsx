'use client'

import { useState } from 'react'
import { Mail, CreditCard, Calendar, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

type Status = 'idle' | 'loading' | 'success' | 'error'

export function EmailReminders() {
  const [payStatus, setPayStatus] = useState<Status>('idle')
  const [evtStatus, setEvtStatus] = useState<Status>('idle')
  const [paySent,   setPaySent]   = useState(0)
  const [evtSent,   setEvtSent]   = useState(0)

  async function send(type: 'payments' | 'events') {
    const set = type === 'payments' ? setPayStatus : setEvtStatus
    const setSent = type === 'payments' ? setPaySent : setEvtSent
    set('loading')
    try {
      const res  = await fetch('/api/email/reminders', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ type }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSent(data.sent)
      set('success')
    } catch {
      set('error')
    }
  }

  return (
    <div className="mt-4 card-dark">
      <div className="flex items-center gap-2 mb-4">
        <Mail size={16} className="text-major-accent" />
        <h3 className="font-oswald text-white uppercase tracking-wide">Rappels par email</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

        {/* Paiements en retard */}
        <div className="flex items-center justify-between bg-major-black/40 border border-gray-800 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2.5">
            <CreditCard size={16} className="text-yellow-400" />
            <div>
              <p className="text-white text-sm font-inter font-medium">Paiements en attente</p>
              <p className="text-gray-500 text-xs font-inter">Rappel aux membres concernés</p>
            </div>
          </div>
          <button
            onClick={() => send('payments')}
            disabled={payStatus === 'loading'}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-inter font-semibold transition-all disabled:opacity-50
              bg-yellow-900/30 border border-yellow-700/40 text-yellow-400 hover:bg-yellow-900/50"
          >
            {payStatus === 'loading' && <Loader2 size={12} className="animate-spin" />}
            {payStatus === 'success' && <CheckCircle size={12} />}
            {payStatus === 'error'   && <AlertCircle size={12} />}
            {payStatus === 'success' ? `${paySent} envoyé${paySent > 1 ? 's' : ''}` :
             payStatus === 'error'   ? 'Erreur' :
             payStatus === 'loading' ? 'Envoi...' : 'Envoyer'}
          </button>
        </div>

        {/* Rappels événements */}
        <div className="flex items-center justify-between bg-major-black/40 border border-gray-800 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2.5">
            <Calendar size={16} className="text-major-accent" />
            <div>
              <p className="text-white text-sm font-inter font-medium">Événements dans 48h</p>
              <p className="text-gray-500 text-xs font-inter">Rappel aux inscrits</p>
            </div>
          </div>
          <button
            onClick={() => send('events')}
            disabled={evtStatus === 'loading'}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-inter font-semibold transition-all disabled:opacity-50
              bg-major-primary/20 border border-major-primary/40 text-major-accent hover:bg-major-primary/30"
          >
            {evtStatus === 'loading' && <Loader2 size={12} className="animate-spin" />}
            {evtStatus === 'success' && <CheckCircle size={12} />}
            {evtStatus === 'error'   && <AlertCircle size={12} />}
            {evtStatus === 'success' ? `${evtSent} envoyé${evtSent > 1 ? 's' : ''}` :
             evtStatus === 'error'   ? 'Erreur' :
             evtStatus === 'loading' ? 'Envoi...' : 'Envoyer'}
          </button>
        </div>

      </div>
    </div>
  )
}
