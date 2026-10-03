'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import {
  CheckCircle, AlertTriangle, Calendar, Wallet, Plus, Loader2, X,
} from 'lucide-react'
import {
  computeDuesStatus, globalStatusColor, statusColor, statusLabel,
  ADHESION_AMOUNT, COTISATION_MONTHLY_AMOUNT,
  type DuesLine,
} from '@/lib/dues'
import { formatCurrency } from '@/lib/utils'

interface Payment {
  type:      string
  amount:    number
  status:    string
  season:    string | null
  paidDate:  string | null
  dueDate:   string | null
}

interface Props {
  memberId:  string
  memberName: string
  createdAt: string
  payments:  Payment[]
}

export function DuesSection({ memberId, memberName, createdAt, payments }: Props) {
  const router = useRouter()
  const [modal, setModal] = useState<null | DuesLine>(null)
  const [saving, setSaving] = useState(false)

  const dues = useMemo(() => {
    const member = { id: memberId, createdAt: new Date(createdAt) }
    const paymentsConverted = payments.map(p => ({
      ...p,
      paidDate: p.paidDate ? new Date(p.paidDate) : null,
      dueDate:  p.dueDate  ? new Date(p.dueDate)  : null,
    }))
    return computeDuesStatus(member, paymentsConverted)
  }, [memberId, createdAt, payments])

  const g = globalStatusColor(dues.globalStatus)

  async function recordPayment(line: DuesLine) {
    setSaving(true)
    try {
      const type = line.type === 'ADHESION' ? 'COTISATION_ANNUELLE' : 'COTISATION_MENSUELLE'
      const amount = line.type === 'ADHESION'
        ? ADHESION_AMOUNT - line.paid
        : COTISATION_MONTHLY_AMOUNT - line.paid
      if (amount <= 0) {
        toast.error('Cette ligne est déjà réglée.')
        return
      }
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId,
          type,
          amount,
          status: 'PAID',
          season: dues.season,
          dueDate: line.dueDate.toISOString(),
          paidDate: new Date().toISOString(),
          description: line.label,
        }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d.error ?? 'Erreur serveur')
      }
      toast.success(`Paiement enregistré : ${line.label}`)
      setModal(null)
      router.refresh()
    } catch (err: any) {
      toast.error(err.message ?? 'Erreur lors de l\'enregistrement.')
    } finally {
      setSaving(false)
    }
  }

  const allLines: DuesLine[] = [dues.adhesion, ...dues.lines]

  return (
    <div className="card-dark mb-6">
      <h2 className="font-oswald text-white text-lg uppercase tracking-wide mb-4 flex items-center gap-2">
        <Wallet size={18} className="text-major-primary" />
        Cotisations · {dues.seasonLabel}
      </h2>

      {/* Statut global + totaux */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-5">
        <div className={`rounded-xl border p-3 ${g.bg} ${g.border}`}>
          <p className={`text-xs font-inter uppercase tracking-widest ${g.text}`}>Statut</p>
          <p className={`font-bebas text-xl tracking-wider mt-1 ${g.text}`}>{g.label}</p>
          {dues.globalStatus === 'LATE' && dues.remaining > 0 && (
            <p className="text-red-400 text-xs font-inter mt-0.5">
              Reste {formatCurrency(dues.remaining, 'MAD')} à régler
            </p>
          )}
        </div>
        <KpiLight label="Attendu"      value={formatCurrency(dues.expectedTotal, 'MAD')} />
        <KpiLight label="Payé"          value={formatCurrency(dues.paidTotal, 'MAD')} accent />
        <KpiLight label="Reste"         value={formatCurrency(dues.remaining, 'MAD')} warn={dues.remaining > 0} />
      </div>

      {/* Tableau détaillé */}
      <div className="overflow-x-auto -mx-5">
        <table className="table-dark text-sm">
          <thead>
            <tr>
              <th>Échéance</th>
              <th>Date d&apos;exigibilité</th>
              <th className="text-right">Montant dû</th>
              <th className="text-right">Montant payé</th>
              <th>Statut</th>
              <th className="text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {allLines.map(line => {
              const sc = statusColor(line.status)
              const canPay = line.status === 'DUE' || (line.status === 'UPCOMING' && line.type === 'ADHESION')
              return (
                <tr key={line.key}>
                  <td>
                    <div className="flex items-center gap-2">
                      {line.type === 'ADHESION'
                        ? <Wallet size={13} className="text-major-primary" />
                        : <Calendar size={13} className="text-major-primary" />}
                      <span className={line.status === 'BEFORE_JOIN' ? 'text-gray-600 italic' : 'text-white'}>
                        {line.label}
                      </span>
                    </div>
                  </td>
                  <td className="text-gray-400 text-xs">
                    {line.status === 'BEFORE_JOIN'
                      ? '—'
                      : line.dueDate.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="text-right text-gray-300">
                    {line.amount > 0 ? formatCurrency(line.amount, 'MAD') : '—'}
                  </td>
                  <td className="text-right text-emerald-400 font-inter font-medium">
                    {line.paid > 0 ? formatCurrency(line.paid, 'MAD') : '—'}
                  </td>
                  <td>
                    <span className={`inline-flex items-center gap-1 text-[11px] font-inter font-semibold px-2 py-0.5 rounded ${sc.bg} ${sc.text} border ${sc.border}`}>
                      {line.status === 'PAID' && <CheckCircle size={10} />}
                      {line.status === 'DUE'  && <AlertTriangle size={10} />}
                      {statusLabel(line.status)}
                    </span>
                  </td>
                  <td className="text-right">
                    {canPay ? (
                      <button
                        type="button"
                        onClick={() => setModal(line)}
                        className="inline-flex items-center gap-1 bg-major-primary/15 hover:bg-major-primary/25 border border-major-primary/40 text-major-accent text-xs font-inter font-medium px-2.5 py-1 rounded-lg transition-colors"
                      >
                        <Plus size={11} /> Marquer payé
                      </button>
                    ) : (
                      <span className="text-gray-700 text-xs">—</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <p className="text-gray-500 text-[11px] font-inter italic mt-3">
        Barème : adhésion annuelle {formatCurrency(ADHESION_AMOUNT, 'MAD')} + cotisation mensuelle {formatCurrency(COTISATION_MONTHLY_AMOUNT, 'MAD')} / mois, à partir de septembre.
      </p>

      {/* Modal confirmation enregistrement */}
      {modal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center px-4 bg-black/70 backdrop-blur-sm"
             onClick={() => !saving && setModal(null)}>
          <div onClick={e => e.stopPropagation()}
               className="w-full max-w-md bg-major-black border border-major-primary/30 rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-green-gradient px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wallet size={18} className="text-white" />
                <p className="font-bebas text-white text-base tracking-widest">ENREGISTRER PAIEMENT</p>
              </div>
              {!saving && (
                <button onClick={() => setModal(null)} aria-label="Fermer"
                        className="text-white/70 hover:text-white"><X size={18} /></button>
              )}
            </div>
            <div className="p-5 space-y-4">
              <div>
                <p className="text-gray-400 text-xs font-inter uppercase tracking-widest">Membre</p>
                <p className="text-white font-inter text-sm font-semibold">{memberName}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs font-inter uppercase tracking-widest">Échéance</p>
                <p className="text-white font-inter text-sm">{modal.label}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs font-inter uppercase tracking-widest">Montant</p>
                <p className="font-bebas text-2xl text-major-accent">
                  {formatCurrency(modal.amount - modal.paid, 'MAD')}
                </p>
              </div>
              <div className="text-xs text-gray-500 font-inter bg-gray-900/40 border border-gray-800 rounded-lg p-2.5">
                Le paiement sera enregistré avec le statut <strong className="text-emerald-400">PAID</strong> à la date d&apos;aujourd&apos;hui, saison <strong>{dues.season}</strong>.
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setModal(null)} disabled={saving}
                        className="btn-secondary flex-1 py-2.5 text-sm">
                  Annuler
                </button>
                <button type="button" onClick={() => recordPayment(modal)} disabled={saving}
                        className="btn-primary flex-1 py-2.5 text-sm flex items-center justify-center gap-2">
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                  {saving ? 'Enregistrement…' : 'Confirmer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function KpiLight({ label, value, accent, warn }: { label: string; value: string; accent?: boolean; warn?: boolean }) {
  return (
    <div className="rounded-xl border border-gray-800 bg-major-surface p-3">
      <p className="text-[10px] font-inter uppercase tracking-widest text-gray-400">{label}</p>
      <p className={`font-bebas text-xl tracking-wider mt-0.5 ${
        warn ? 'text-red-400' : accent ? 'text-major-accent' : 'text-white'
      }`}>
        {value}
      </p>
    </div>
  )
}
