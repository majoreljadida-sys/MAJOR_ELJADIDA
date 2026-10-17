'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Loader2, Save, Eye, EyeOff } from 'lucide-react'

interface Product {
  id: string; name: string; description: string; image: string
  price: number | null; active: boolean; sizes: string[]; ordered: number
}

export function ProductEditor({ product: p }: { product: Product }) {
  const router = useRouter()
  const [price, setPrice]   = useState(p.price === null ? '' : String(p.price))
  const [sizes, setSizes]   = useState(p.sizes.join(', '))
  const [name,  setName]    = useState(p.name)
  const [desc,  setDesc]    = useState(p.description)
  const [active, setActive] = useState(p.active)
  const [busy, setBusy]     = useState(false)

  const dirty = price !== (p.price === null ? '' : String(p.price)) || sizes !== p.sizes.join(', ')
    || name !== p.name || desc !== p.description || active !== p.active

  async function save() {
    setBusy(true)
    try {
      const res = await fetch(`/api/store/products/${p.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          price: price.trim() === '' ? null : price,
          sizes: sizes.split(',').map(s => s.trim()).filter(Boolean),
          name, description: desc, active,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Erreur')
      toast.success('Article enregistré')
      router.refresh()
    } catch (e: any) {
      toast.error(e.message ?? 'Erreur')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={`card-dark flex gap-4 ${active ? '' : 'opacity-60'}`}>
      <img src={p.image} alt="" className="w-24 h-24 sm:w-28 sm:h-28 rounded-lg object-contain bg-[#f1f3f2] flex-shrink-0" />
      <div className="flex-1 min-w-0 space-y-2">
        <input value={name} onChange={e => setName(e.target.value)} className="input-dark py-1.5 font-semibold" />
        <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={2} className="input-dark py-1.5 text-xs resize-y" />
        <div className="grid grid-cols-2 gap-2">
          <label className="text-xs text-gray-400 font-inter">Prix coûtant (DH)
            <input value={price} onChange={e => setPrice(e.target.value)} inputMode="decimal" placeholder="À confirmer"
              className={`input-dark py-1.5 mt-1 ${price.trim() === '' ? 'border-amber-500/60' : ''}`} />
          </label>
          <label className="text-xs text-gray-400 font-inter">Tailles (vide = unique)
            <input value={sizes} onChange={e => setSizes(e.target.value)} placeholder="S, M, L"
              className="input-dark py-1.5 mt-1" />
          </label>
        </div>
        <div className="flex items-center justify-between gap-2 pt-1">
          <button onClick={() => setActive(v => !v)}
            className={`inline-flex items-center gap-1.5 text-xs font-inter ${active ? 'text-major-accent' : 'text-gray-400'}`}>
            {active ? <><Eye size={14} /> Visible dans le Store</> : <><EyeOff size={14} /> Masqué</>}
          </button>
          <span className="text-xs text-gray-500 font-inter">{p.ordered} ligne{p.ordered > 1 ? 's' : ''} commandée{p.ordered > 1 ? 's' : ''}</span>
          <button onClick={save} disabled={!dirty || busy} className="btn-primary text-xs px-3 py-1.5 disabled:opacity-40">
            {busy ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />} Enregistrer
          </button>
        </div>
      </div>
    </div>
  )
}
