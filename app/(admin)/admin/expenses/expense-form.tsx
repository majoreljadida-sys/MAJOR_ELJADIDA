'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { Save, ArrowLeft, Receipt, Loader2 } from 'lucide-react'
import {
  EXPENSE_CATEGORIES, EXPENSE_GROUPS, PAYMENT_METHODS, categoriesByGroup,
  type ExpenseCategoryKey, type ExpenseGroupKey, type PaymentMethodKey,
  getExpenseCategory,
} from '@/lib/expenses'

interface EventOption { id: string; title: string }

interface Props {
  mode:          'create' | 'edit'
  expenseId?:    string
  initial?: {
    amount:        number
    date:          string
    category:      ExpenseCategoryKey
    description:   string
    supplier:      string | null
    paymentMethod: PaymentMethodKey
    receiptUrl:    string | null
    notes:         string | null
    eventId:       string | null
  }
  events: EventOption[]
}

export function ExpenseForm({ mode, expenseId, initial, events }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    amount:        initial?.amount        ? String(initial.amount) : '',
    date:          initial?.date          ?? new Date().toISOString().slice(0, 10),
    category:      initial?.category      ?? 'TRAINING_WATER' as ExpenseCategoryKey,
    description:   initial?.description   ?? '',
    supplier:      initial?.supplier      ?? '',
    paymentMethod: initial?.paymentMethod ?? 'CASH' as PaymentMethodKey,
    receiptUrl:    initial?.receiptUrl    ?? '',
    notes:         initial?.notes         ?? '',
    eventId:       initial?.eventId       ?? '',
  })

  const activeCategory = getExpenseCategory(form.category)
  const activeGroup = activeCategory?.group

  function set<K extends keyof typeof form>(k: K, v: typeof form[K]) {
    setForm(f => ({ ...f, [k]: v }))
  }

  function selectGroup(group: ExpenseGroupKey) {
    const first = categoriesByGroup(group)[0]
    if (first) set('category', first.key)
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.description.trim()) return toast.error('Description obligatoire.')
    if (!form.amount || Number(form.amount) <= 0) return toast.error('Montant invalide.')
    if (!form.date) return toast.error('Date obligatoire.')

    setSaving(true)
    try {
      const url    = mode === 'edit' ? `/api/expenses/${expenseId}` : '/api/expenses'
      const method = mode === 'edit' ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          amount:        form.amount,
          date:          form.date,
          category:      form.category,
          description:   form.description.trim(),
          supplier:      form.supplier.trim() || null,
          paymentMethod: form.paymentMethod,
          receiptUrl:    form.receiptUrl.trim() || null,
          notes:         form.notes.trim() || null,
          eventId:       form.eventId || null,
        }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d.error ?? 'Erreur serveur')
      }
      toast.success(mode === 'edit' ? 'Dépense modifiée' : 'Dépense enregistrée')
      router.push('/admin/expenses')
      router.refresh()
    } catch (err: any) {
      toast.error(err.message ?? 'Erreur')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/expenses" className="text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex items-center gap-3">
          <Receipt size={24} className="text-major-accent" />
          <h1 className="font-bebas text-4xl text-white tracking-widest">
            {mode === 'edit' ? 'MODIFIER DÉPENSE' : 'NOUVELLE DÉPENSE'}
          </h1>
        </div>
      </div>

      <form onSubmit={submit} className="card-dark space-y-5">
        {/* Groupe (sélecteur primaire) */}
        <div>
          <label className="form-label">Catégorie <span className="text-red-400">*</span></label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
            {EXPENSE_GROUPS.map(g => {
              const active = activeGroup === g.key
              return (
                <button key={g.key} type="button" onClick={() => selectGroup(g.key)}
                  className={`rounded-xl border p-3 text-left transition-all ${
                    active
                      ? 'bg-major-primary/15 border-major-primary ring-2 ring-major-primary'
                      : 'bg-major-black/30 border-gray-700 hover:border-gray-500'
                  }`}>
                  <div className="text-2xl">{g.emoji}</div>
                  <div className={`font-oswald text-sm uppercase tracking-wide mt-1 ${active ? 'text-major-accent' : 'text-white'}`}>
                    {g.label}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Sous-catégories du groupe */}
          <div className="flex flex-wrap gap-2">
            {activeGroup && categoriesByGroup(activeGroup).map(c => {
              const active = form.category === c.key
              return (
                <button key={c.key} type="button" onClick={() => set('category', c.key)}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-inter border transition-colors ${
                    active ? `${c.chipBg} ${c.chipBorder} ${c.chipText} font-semibold`
                           : 'bg-major-black/30 border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white'
                  }`}>
                  <span>{c.emoji}</span> {c.label}
                </button>
              )
            })}
          </div>
          {activeCategory && (
            <p className="text-gray-500 text-[11px] font-inter italic mt-2">{activeCategory.description}</p>
          )}
        </div>

        {/* Montant + date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Montant (MAD) <span className="text-red-400">*</span></label>
            <input type="number" step="0.01" min="0.01" className="input-dark" required
              value={form.amount} onChange={e => set('amount', e.target.value)} placeholder="150" />
          </div>
          <div>
            <label className="form-label">Date <span className="text-red-400">*</span></label>
            <input type="date" className="input-dark" required
              value={form.date} onChange={e => set('date', e.target.value)} />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="form-label">Description <span className="text-red-400">*</span></label>
          <input className="input-dark" required
            value={form.description} onChange={e => set('description', e.target.value)}
            placeholder="Ex: 10 bouteilles d'eau 1,5L" />
        </div>

        {/* Fournisseur + mode paiement */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Fournisseur <span className="text-gray-500 text-xs">(optionnel)</span></label>
            <input className="input-dark"
              value={form.supplier} onChange={e => set('supplier', e.target.value)}
              placeholder="Ex: Marjane El Jadida" />
          </div>
          <div>
            <label className="form-label">Mode de paiement</label>
            <select className="input-dark" value={form.paymentMethod}
                    onChange={e => set('paymentMethod', e.target.value as PaymentMethodKey)}>
              {PAYMENT_METHODS.map(m => (
                <option key={m.key} value={m.key}>{m.emoji} {m.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Événement lié (si groupe = EVENT) */}
        {activeGroup === 'EVENT' && (
          <div>
            <label className="form-label">Événement lié <span className="text-gray-500 text-xs">(optionnel, permet le calcul du coût réel)</span></label>
            <select className="input-dark" value={form.eventId}
                    onChange={e => set('eventId', e.target.value)}>
              <option value="">— Aucun —</option>
              {events.map(ev => (
                <option key={ev.id} value={ev.id}>{ev.title}</option>
              ))}
            </select>
          </div>
        )}

        {/* URL reçu + notes */}
        <div>
          <label className="form-label">URL du reçu <span className="text-gray-500 text-xs">(optionnel)</span></label>
          <input type="url" className="input-dark"
            value={form.receiptUrl} onChange={e => set('receiptUrl', e.target.value)}
            placeholder="https://..." />
          <p className="text-gray-500 text-[11px] font-inter mt-1">
            Si tu as scanné / photographié le reçu, colle ici le lien (Google Drive, Dropbox, imgur…).
          </p>
        </div>

        <div>
          <label className="form-label">Notes <span className="text-gray-500 text-xs">(optionnel)</span></label>
          <textarea className="input-dark resize-none" rows={3}
            value={form.notes} onChange={e => set('notes', e.target.value)}
            placeholder="Précisions, contexte, etc." />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving}
            className="btn-primary flex items-center gap-2 disabled:opacity-60">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {saving ? 'Enregistrement…' : (mode === 'edit' ? 'Enregistrer les modifications' : 'Enregistrer la dépense')}
          </button>
          <Link href="/admin/expenses" className="btn-secondary">Annuler</Link>
        </div>
      </form>
    </div>
  )
}
