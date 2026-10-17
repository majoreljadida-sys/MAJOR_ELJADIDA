'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import {
  ShoppingBag, X, Check, Minus, Plus, Trash2, Loader2, LogIn, ArrowRight, BadgePercent, Users,
} from 'lucide-react'
import { useLanguage } from '@/lib/i18n/context'
import { formatMAD, STORE_MAX_QUANTITY, type StoreProductDTO } from '@/lib/store'

type Access = 'guest' | 'member' | 'blocked' | 'other'
interface CartLine { productId: string; size: string | null; quantity: number }

const CART_KEY = 'major-store-cart-v1'

function readCart(): CartLine[] {
  try {
    const raw = window.localStorage.getItem(CART_KEY)
    const v = raw ? JSON.parse(raw) : []
    return Array.isArray(v) ? v : []
  } catch { return [] }
}
function writeCart(lines: CartLine[]) {
  try { window.localStorage.setItem(CART_KEY, JSON.stringify(lines)) } catch { /* stockage indisponible */ }
}

export function StoreClient({ products, access }: { products: StoreProductDTO[]; access: Access }) {
  const { t, lang } = useLanguage()
  const s    = t.store
  const isAr = lang === 'ar'

  const [filter,   setFilter]   = useState<'ALL' | 'TEXTILE' | 'ACCESSOIRE'>('ALL')
  const [selected, setSelected] = useState<StoreProductDTO | null>(null)
  const [cart,     setCart]     = useState<CartLine[]>([])
  const [cartOpen, setCartOpen] = useState(false)
  const [note,     setNote]     = useState('')
  const [sending,  setSending]  = useState(false)
  const [done,     setDone]     = useState<string | null>(null)

  const byId = useMemo(() => new Map(products.map(p => [p.id, p])), [products])

  // Panier conservé dans le navigateur (on ignore les articles disparus)
  useEffect(() => { setCart(readCart().filter(l => byId.has(l.productId))) }, [byId])
  useEffect(() => { writeCart(cart) }, [cart])

  const name  = (p: StoreProductDTO) => (isAr && p.nameAr) || p.name
  const desc  = (p: StoreProductDTO) => (isAr && p.descriptionAr) || p.description
  const feats = (p: StoreProductDTO) => (isAr && p.featuresAr.length ? p.featuresAr : p.features)

  const visible   = products.filter(p => filter === 'ALL' || p.category === filter)
  const cartCount = cart.reduce((n, l) => n + l.quantity, 0)
  const cartTotal = cart.reduce((n, l) => n + (byId.get(l.productId)?.price ?? 0) * l.quantity, 0)

  function addToCart(p: StoreProductDTO, size: string | null, quantity: number) {
    setCart(prev => {
      const i = prev.findIndex(l => l.productId === p.id && l.size === size)
      if (i === -1) return [...prev, { productId: p.id, size, quantity }]
      const next = [...prev]
      next[i] = { ...next[i], quantity: Math.min(STORE_MAX_QUANTITY, next[i].quantity + quantity) }
      return next
    })
    toast.success(s.added)
    setSelected(null)
  }

  function setQty(idx: number, q: number) {
    setCart(prev => prev.map((l, i) => i === idx ? { ...l, quantity: Math.max(1, Math.min(STORE_MAX_QUANTITY, q)) } : l))
  }

  async function submit() {
    setSending(true)
    try {
      const res  = await fetch('/api/store/orders', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart, note }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error ?? `Erreur serveur (${res.status})`)
      setCart([]); setNote(''); setCartOpen(false); setDone(data.reference)
    } catch (e: any) {
      toast.error(e.message ?? 'Erreur')
    } finally {
      setSending(false)
    }
  }

  return (
    <div dir={isAr ? 'rtl' : 'ltr'} className="pb-24">

      {/* ── En-tête ─────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 lg:pt-12">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div>
            <p className="section-tag">{s.tag}</p>
            <h1 className="font-bebas text-6xl sm:text-7xl text-white tracking-widest mt-2">{s.title}</h1>
            <p className="text-gray-300 font-inter text-base sm:text-lg leading-relaxed mt-4 max-w-xl">{s.subtitle}</p>
            <div className="flex flex-wrap gap-2 mt-6">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-major-primary/15 border border-major-primary/40 text-major-accent text-sm font-inter font-semibold">
                <BadgePercent size={16} /> {s.costBadge}
              </span>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/15 text-gray-200 text-sm font-inter">
                <Users size={16} /> {s.reservedBadge}
              </span>
            </div>
          </div>
          <div className="relative">
            <img src="/store/collection.jpg" alt="Collection MAJOR"
                 className="w-full rounded-2xl border border-major-primary/30 shadow-2xl shadow-black/40" />
          </div>
        </div>

        {/* Comment ça marche */}
        <div className="mt-10">
          <h2 className="font-bebas text-2xl text-white tracking-widest mb-3">{s.howTitle}</h2>
          <ol className="grid sm:grid-cols-3 gap-3">
            {[s.how1, s.how2, s.how3].map((txt, i) => (
              <li key={i} className="card-dark flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-major-primary text-white font-bebas text-xl flex items-center justify-center">{i + 1}</span>
                <span className="text-gray-300 font-inter text-sm leading-relaxed">{txt}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Catalogue ───────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="flex flex-wrap gap-2 mb-6">
          {([['ALL', s.all], ['TEXTILE', s.textile], ['ACCESSOIRE', s.accessories]] as const).map(([key, label]) => (
            <button key={key} onClick={() => setFilter(key)}
              className={`px-4 py-2 rounded-full text-sm font-inter font-medium border transition-all ${
                filter === key
                  ? 'bg-major-primary text-white border-major-primary'
                  : 'bg-transparent text-gray-300 border-gray-700 hover:border-major-primary/60 hover:text-white'
              }`}>
              {label}
            </button>
          ))}
        </div>

        {visible.length === 0 ? (
          <p className="text-gray-400 font-inter">—</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {visible.map(p => (
              <article key={p.id}
                className="group bg-major-surface border border-major-primary/20 rounded-2xl overflow-hidden hover:border-major-primary/50 transition-all flex flex-col">
                <button onClick={() => setSelected(p)} className="relative aspect-square bg-[#f1f3f2] overflow-hidden" aria-label={name(p)}>
                  <img src={p.image} alt={name(p)} loading="lazy"
                       className={`absolute inset-0 w-full h-full object-contain transition-all duration-500 group-hover:scale-105 ${p.imageBack ? 'group-hover:opacity-0' : ''}`} />
                  {p.imageBack && (
                    <img src={p.imageBack} alt="" loading="lazy" aria-hidden="true"
                         className="absolute inset-0 w-full h-full object-contain opacity-0 transition-all duration-500 group-hover:opacity-100 group-hover:scale-105" />
                  )}
                  <span className="absolute top-3 start-3 px-2 py-0.5 rounded-full bg-black/70 text-white text-[11px] font-inter tracking-wide">
                    {p.category === 'TEXTILE' ? s.textile : s.accessories}
                  </span>
                </button>
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-inter font-semibold text-white leading-snug">{name(p)}</h3>
                  <p className="text-gray-400 text-xs font-inter mt-1">
                    {p.sizes.length ? `${s.sizes} : ${p.sizes.join(' · ')}` : s.oneSize}
                  </p>
                  <div className="mt-auto pt-4 flex items-center justify-between gap-2">
                    {p.price !== null
                      ? <span className="font-bebas text-2xl text-major-accent tracking-wide">{formatMAD(p.price)}</span>
                      : <span className="text-amber-300 text-sm font-inter">{s.priceTbd}</span>}
                    <button onClick={() => setSelected(p)}
                      className="inline-flex items-center gap-1 text-sm font-inter font-medium text-major-cyan hover:text-white transition-colors">
                      {s.details} <ArrowRight size={14} className={isAr ? 'rotate-180' : ''} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
        <p className="text-gray-500 text-xs font-inter mt-6">{s.disclaimer}</p>
      </section>

      {/* ── Bouton panier ───────────────────────────────────────── */}
      {(access === 'member' || cartCount > 0) && (
        <button onClick={() => setCartOpen(true)}
          className="fixed bottom-5 left-5 z-50 inline-flex items-center gap-2 px-5 py-3 rounded-full bg-major-primary text-white font-inter font-semibold shadow-xl shadow-black/40 hover:bg-major-dark transition-all">
          <ShoppingBag size={18} /> {s.cart}
          {cartCount > 0 && <span className="min-w-[22px] h-[22px] px-1.5 rounded-full bg-white text-major-primary text-xs font-bold flex items-center justify-center">{cartCount}</span>}
        </button>
      )}

      {selected && (
        <ProductModal
          product={selected} access={access} isAr={isAr} s={s}
          name={name(selected)} desc={desc(selected)} feats={feats(selected)}
          onClose={() => setSelected(null)} onAdd={addToCart}
        />
      )}

      {/* ── Panier ──────────────────────────────────────────────── */}
      {cartOpen && (
        <div className="fixed inset-0 z-[60] flex justify-end bg-black/60" onClick={() => setCartOpen(false)}>
          <aside dir={isAr ? 'rtl' : 'ltr'} onClick={e => e.stopPropagation()}
            className="w-full max-w-md h-full bg-major-surface border-s border-major-primary/30 flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-major-primary/20">
              <h2 className="font-bebas text-2xl text-white tracking-widest flex items-center gap-2"><ShoppingBag size={20} /> {s.cart}</h2>
              <button onClick={() => setCartOpen(false)} className="text-gray-400 hover:text-white" aria-label="Fermer"><X size={22} /></button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {cart.length === 0 && <p className="text-gray-400 font-inter text-sm">{s.emptyCart}</p>}
              {cart.map((l, i) => {
                const p = byId.get(l.productId); if (!p) return null
                return (
                  <div key={`${l.productId}-${l.size}`} className="flex gap-3 items-center bg-black/20 rounded-xl p-2.5">
                    <img src={p.image} alt="" className="w-16 h-16 rounded-lg object-contain bg-[#f1f3f2] flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-inter font-medium truncate">{name(p)}</p>
                      <p className="text-gray-400 text-xs font-inter">{l.size ? `${s.size} ${l.size}` : s.oneSize}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <button onClick={() => setQty(i, l.quantity - 1)} className="w-6 h-6 rounded bg-white/10 text-white flex items-center justify-center" aria-label="-"><Minus size={12} /></button>
                        <span className="text-white text-sm w-5 text-center">{l.quantity}</span>
                        <button onClick={() => setQty(i, l.quantity + 1)} className="w-6 h-6 rounded bg-white/10 text-white flex items-center justify-center" aria-label="+"><Plus size={12} /></button>
                      </div>
                    </div>
                    <div className="text-end">
                      <p className="text-major-accent text-sm font-semibold">{p.price !== null ? formatMAD(p.price * l.quantity) : '—'}</p>
                      <button onClick={() => setCart(prev => prev.filter((_, j) => j !== i))}
                        className="text-red-400 hover:text-red-300 text-xs inline-flex items-center gap-1 mt-1"><Trash2 size={12} /> {s.remove}</button>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="border-t border-major-primary/20 px-5 py-4 space-y-3">
              <label className="form-label">{s.note}</label>
              <textarea value={note} onChange={e => setNote(e.target.value)} rows={2} maxLength={1000}
                placeholder={s.notePh} className="input-dark resize-none" />
              <div className="flex items-center justify-between">
                <span className="text-gray-300 font-inter">{s.total}</span>
                <span className="font-bebas text-3xl text-major-accent tracking-wide">{formatMAD(cartTotal)}</span>
              </div>
              <OrderButton access={access} s={s} disabled={cart.length === 0 || sending} sending={sending} onClick={submit} />
            </div>
          </aside>
        </div>
      )}

      {/* ── Confirmation ────────────────────────────────────────── */}
      {done && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 px-4" onClick={() => setDone(null)}>
          <div dir={isAr ? 'rtl' : 'ltr'} onClick={e => e.stopPropagation()}
            className="max-w-md w-full bg-major-surface border border-major-primary/40 rounded-2xl p-6 text-center">
            <div className="w-14 h-14 rounded-full bg-major-primary/20 text-major-accent flex items-center justify-center mx-auto"><Check size={28} /></div>
            <h2 className="font-bebas text-3xl text-white tracking-widest mt-4">{s.successTitle}</h2>
            <p className="text-major-accent font-mono text-sm mt-1">{done}</p>
            <p className="text-gray-300 font-inter text-sm leading-relaxed mt-3">{s.successText}</p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center mt-6">
              <Link href="/member/commandes" className="btn-primary justify-center">{s.myOrders}</Link>
              <button onClick={() => setDone(null)} className="btn-secondary justify-center">{s.continue}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Bouton de commande selon l'accès ────────────────────────────────────────
function OrderButton({ access, s, disabled, sending, onClick }: {
  access: Access; s: any; disabled: boolean; sending: boolean; onClick: () => void
}) {
  if (access === 'guest') return (
    <div className="space-y-2">
      <Link href="/login?callbackUrl=/store" className="btn-primary w-full justify-center"><LogIn size={16} /> {s.loginToOrder}</Link>
      <Link href="/register" className="block text-center text-sm text-major-cyan hover:text-white font-inter">{s.joinToOrder}</Link>
    </div>
  )
  if (access !== 'member') return <p className="text-amber-300 text-sm font-inter">{s.membersOnly}</p>
  return (
    <button onClick={onClick} disabled={disabled} className="btn-primary w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed">
      {sending ? <><Loader2 size={16} className="animate-spin" /> {s.sending}</> : <><ShoppingBag size={16} /> {s.order}</>}
    </button>
  )
}

// ── Fiche article ───────────────────────────────────────────────────────────
function ProductModal({ product: p, access, isAr, s, name, desc, feats, onClose, onAdd }: {
  product: StoreProductDTO; access: Access; isAr: boolean; s: any
  name: string; desc: string; feats: string[]
  onClose: () => void; onAdd: (p: StoreProductDTO, size: string | null, qty: number) => void
}) {
  const [side, setSide] = useState<'front' | 'back'>('front')
  const [size, setSize] = useState<string | null>(p.sizes.length === 1 ? p.sizes[0] : null)
  const [qty,  setQty]  = useState(1)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const needsSize = p.sizes.length > 0
  const canAdd    = p.price !== null && (!needsSize || !!size)

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/70 sm:px-4" onClick={onClose}>
      <div dir={isAr ? 'rtl' : 'ltr'} onClick={e => e.stopPropagation()}
        className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-major-surface border border-major-primary/30 rounded-t-2xl sm:rounded-2xl">
        <button onClick={onClose} className="absolute top-3 end-3 z-10 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black" aria-label="Fermer">
          <X size={18} />
        </button>
        <div className="grid md:grid-cols-2">
          <div className="bg-[#f1f3f2] relative">
            <img src={side === 'back' && p.imageBack ? p.imageBack : p.image} alt={name} className="w-full aspect-square object-contain" />
            {p.imageBack && (
              <div className="absolute bottom-3 inset-x-0 flex justify-center gap-2">
                {(['front', 'back'] as const).map(k => (
                  <button key={k} onClick={() => setSide(k)}
                    className={`px-3 py-1 rounded-full text-xs font-inter font-semibold border ${
                      side === k ? 'bg-major-primary text-white border-major-primary' : 'bg-white/90 text-gray-700 border-gray-300'
                    }`}>
                    {k === 'front' ? s.front : s.back}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="p-5 sm:p-6 flex flex-col">
            <p className="section-tag text-xs">{p.category === 'TEXTILE' ? s.textile : s.accessories}</p>
            <h2 className="font-bebas text-3xl sm:text-4xl text-white tracking-wide mt-1">{name}</h2>
            <p className="mt-1">
              {p.price !== null
                ? <span className="font-bebas text-3xl text-major-accent tracking-wide">{formatMAD(p.price)}</span>
                : <span className="text-amber-300 font-inter">{s.priceTbd}</span>}
            </p>
            <p className="text-gray-300 font-inter text-sm leading-relaxed mt-3">{desc}</p>
            <ul className="mt-4 space-y-1.5">
              {feats.map(f => (
                <li key={f} className="flex items-start gap-2 text-gray-200 text-sm font-inter">
                  <Check size={16} className="text-major-accent flex-shrink-0 mt-0.5" /> {f}
                </li>
              ))}
            </ul>

            <div className="mt-5">
              <p className="form-label">{needsSize ? s.size : s.oneSize}</p>
              {needsSize && (
                <div className="flex flex-wrap gap-2">
                  {p.sizes.map(sz => (
                    <button key={sz} onClick={() => setSize(sz)}
                      className={`min-w-[44px] px-3 py-2 rounded-lg text-sm font-inter font-semibold border transition-all ${
                        size === sz ? 'bg-major-primary text-white border-major-primary' : 'text-gray-200 border-gray-600 hover:border-major-primary'
                      }`}>
                      {sz}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center gap-3">
              <span className="form-label mb-0">{s.quantity}</span>
              <div className="flex items-center gap-2">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-8 h-8 rounded-lg bg-white/10 text-white flex items-center justify-center" aria-label="-"><Minus size={14} /></button>
                <span className="text-white w-6 text-center">{qty}</span>
                <button onClick={() => setQty(q => Math.min(STORE_MAX_QUANTITY, q + 1))} className="w-8 h-8 rounded-lg bg-white/10 text-white flex items-center justify-center" aria-label="+"><Plus size={14} /></button>
              </div>
            </div>

            <div className="mt-6">
              {access === 'guest' ? (
                <div className="space-y-2">
                  <Link href="/login?callbackUrl=/store" className="btn-primary w-full justify-center"><LogIn size={16} /> {s.loginToOrder}</Link>
                  <Link href="/register" className="block text-center text-sm text-major-cyan hover:text-white font-inter">{s.joinToOrder}</Link>
                </div>
              ) : access !== 'member' ? (
                <p className="text-amber-300 text-sm font-inter">{s.membersOnly}</p>
              ) : (
                <>
                  <button onClick={() => canAdd && onAdd(p, needsSize ? size : null, qty)} disabled={!canAdd}
                    className="btn-primary w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed">
                    <ShoppingBag size={16} /> {s.addToCart}
                  </button>
                  {needsSize && !size && p.price !== null && <p className="text-gray-400 text-xs font-inter mt-2 text-center">{s.chooseSize}</p>}
                  {p.price === null && <p className="text-amber-300 text-xs font-inter mt-2 text-center">{s.priceTbd}</p>}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
