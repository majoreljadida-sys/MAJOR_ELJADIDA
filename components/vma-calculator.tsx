'use client'

import { useState, useEffect } from 'react'
import { Calculator, HelpCircle, Save, CheckCircle2, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { SPORT_LEVELS, type SportLevelKey } from '@/lib/sport-levels'

// ─── VMA → niveau ────────────────────────────────────────────────────
// Bornes en km/h. Choisies pour aligner avec les 4 niveaux du club.
function levelFromVMA(vma: number): SportLevelKey | null {
  if (vma <= 0) return null
  if (vma < 12)  return 'DEBUTANT'
  if (vma < 14)  return 'INTERMEDIAIRE'
  if (vma < 17)  return 'CONFIRME'
  return 'COMPETITEUR'
}

// VMA en km/h → allure en min:ss/km
function paceFromSpeed(kmh: number): string {
  if (kmh <= 0) return '—'
  const secPerKm = 3600 / kmh
  const m = Math.floor(secPerKm / 60)
  const s = Math.round(secPerKm % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

interface Pace {
  label: string
  pct:   string
  pace:  string
  hint?: string
}

function pacesFromVMA(vma: number): Pace[] {
  return [
    { label: 'EF souple',     pct: '65 % VMA',  pace: paceFromSpeed(vma * 0.65) + '/km', hint: 'Footing très facile' },
    { label: 'EF normale',    pct: '75 % VMA',  pace: paceFromSpeed(vma * 0.75) + '/km', hint: 'Allure d\'entraînement de base' },
    { label: 'Allure marathon', pct: '80 % VMA',  pace: paceFromSpeed(vma * 0.80) + '/km' },
    { label: 'Allure semi',   pct: '85 % VMA',  pace: paceFromSpeed(vma * 0.85) + '/km' },
    { label: 'Allure 10 km',  pct: '90 % VMA',  pace: paceFromSpeed(vma * 0.90) + '/km' },
    { label: 'Allure 5 km',   pct: '95 % VMA',  pace: paceFromSpeed(vma * 0.95) + '/km' },
    { label: 'VMA',           pct: '100 % VMA', pace: paceFromSpeed(vma * 1.00) + '/km', hint: 'Pour les fractions courtes' },
  ]
}

interface Props {
  /** Si membre connecté, on propose d'enregistrer le niveau dans le profil */
  memberId?: string | null
}

export function VMACalculator({ memberId }: Props) {
  const [vmaInput, setVmaInput] = useState('')
  const [showHelp, setShowHelp] = useState(false)
  const [saving, setSaving]     = useState(false)

  // Charge la valeur précédemment saisie depuis localStorage
  useEffect(() => {
    const saved = typeof window !== 'undefined' ? window.localStorage.getItem('major-vma') : null
    if (saved) setVmaInput(saved)
  }, [])

  // Sauvegarde locale à chaque modification
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (vmaInput) window.localStorage.setItem('major-vma', vmaInput)
  }, [vmaInput])

  const vma   = parseFloat(vmaInput.replace(',', '.'))
  const valid = !isNaN(vma) && vma > 5 && vma < 25
  const lvlKey = valid ? levelFromVMA(vma) : null
  const lvl    = lvlKey ? SPORT_LEVELS.find(l => l.key === lvlKey) : null
  const paces  = valid ? pacesFromVMA(vma) : []

  async function saveLevelToProfile() {
    if (!memberId || !lvlKey) return
    setSaving(true)
    try {
      const res = await fetch(`/api/members/${memberId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sportLevel: lvlKey }),
      })
      if (!res.ok) throw new Error()
      toast.success(`Niveau ${lvl?.label} enregistré dans votre profil`)
    } catch {
      toast.error('Impossible d\'enregistrer le niveau')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-major-surface border border-major-primary/30 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between bg-major-primary/10 px-5 py-3 border-b border-major-primary/20">
        <div className="flex items-center gap-2.5">
          <Calculator size={18} className="text-major-accent" />
          <h2 className="font-oswald text-white text-sm uppercase tracking-widest">
            Calculer mon niveau via ma VMA
          </h2>
        </div>
        <button
          type="button"
          onClick={() => setShowHelp(v => !v)}
          className="text-gray-400 hover:text-major-accent transition-colors flex items-center gap-1 text-xs font-inter"
        >
          {showHelp ? <X size={13} /> : <HelpCircle size={13} />}
          {showHelp ? 'Fermer' : 'Comment tester ma VMA ?'}
        </button>
      </div>

      {/* Aide repliable */}
      {showHelp && (
        <div className="bg-major-black/40 border-b border-gray-800 px-5 py-4 text-xs font-inter text-gray-300 leading-relaxed">
          <p className="font-semibold text-white mb-2">Comment estimer votre VMA</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><b className="text-major-accent">Test demi-Cooper</b> (le plus simple) — courez la plus grande distance possible en <b>6 minutes</b> sur piste ou plat. VMA ≈ distance (m) ÷ 100.
              <br /><span className="text-gray-500">Ex. 1500 m en 6 min → VMA = 15 km/h</span>
            </li>
            <li><b className="text-major-accent">Test Cooper</b> (12 minutes) — plus précis mais plus dur. VMA ≈ distance (m) ÷ 200.</li>
            <li><b className="text-major-accent">Estimation rapide</b> à partir d'une course :
              <br /><span className="text-gray-500">VMA ≈ allure 5K + 1 km/h, ou allure 10K + 1.5 km/h.</span>
            </li>
          </ul>
          <p className="mt-3 text-gray-500">
            ℹ Un coach peut aussi vous faire un test VMA structuré lors d'un entraînement.
          </p>
        </div>
      )}

      {/* Input + résultat */}
      <div className="p-5">
        <div className="flex items-end gap-3 flex-wrap mb-4">
          <div className="flex-1 min-w-[180px]">
            <label className="form-label">Votre VMA (km/h)</label>
            <input
              type="number"
              step="0.1"
              min="5"
              max="25"
              className="input-dark text-lg font-bebas tracking-wider"
              placeholder="ex. 13.5"
              value={vmaInput}
              onChange={e => setVmaInput(e.target.value)}
            />
          </div>
          {!vmaInput && (
            <p className="text-gray-500 text-xs font-inter pb-3 italic">
              Entrez une valeur entre 5 et 25 km/h
            </p>
          )}
        </div>

        {valid && lvl && (
          <>
            {/* Niveau suggéré */}
            <div className={`rounded-xl border-2 p-4 mb-4 ${lvl.cardBg} ${lvl.cardBorder}`}>
              <div className="flex items-start gap-3">
                <span className="text-3xl">{lvl.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-[10px] font-bold uppercase tracking-widest ${lvl.chipText}`}>
                    Niveau suggéré
                  </p>
                  <h3 className="font-bebas text-2xl text-white tracking-wide mt-0.5">{lvl.label}</h3>
                  <p className="text-gray-300 font-inter text-xs mt-1">{lvl.description}</p>
                  <p className="text-gray-400 font-inter text-[11px] mt-1.5 italic">
                    <span className="font-semibold not-italic">Objectif :</span> {lvl.goal}
                  </p>
                </div>
                {memberId && (
                  <button
                    type="button"
                    onClick={saveLevelToProfile}
                    disabled={saving}
                    className={`flex-shrink-0 inline-flex items-center gap-1.5 ${lvl.fillBg} text-white text-xs font-inter font-semibold px-3 py-2 rounded-lg hover:opacity-90 disabled:opacity-50 transition-all`}
                  >
                    {saving ? '…' : <><Save size={12} /> Enregistrer</>}
                  </button>
                )}
              </div>
            </div>

            {/* Allures cibles */}
            <div>
              <p className="font-oswald text-white text-xs uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                <CheckCircle2 size={12} className="text-major-accent" /> Vos allures cibles d'entraînement
              </p>
              <div className="rounded-xl border border-gray-800 overflow-hidden">
                {paces.map((p, i) => (
                  <div key={p.label}
                    className={`flex items-center justify-between px-4 py-2.5 ${
                      i % 2 === 0 ? 'bg-major-black/30' : 'bg-major-black/10'
                    } ${i < paces.length - 1 ? 'border-b border-gray-800/60' : ''}`}>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-inter text-sm font-medium">{p.label}</p>
                      <p className="text-gray-500 text-[10px] font-inter">
                        {p.pct}{p.hint && <> · <span className="italic">{p.hint}</span></>}
                      </p>
                    </div>
                    <p className="font-mono text-major-accent text-sm font-semibold tabular-nums">
                      {p.pace}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {vmaInput && !valid && (
          <div className="rounded-lg border border-red-700/40 bg-red-900/10 px-4 py-3 text-red-400 text-xs font-inter">
            ⚠ Valeur invalide. La VMA doit être un nombre entre 5 et 25 km/h.
          </div>
        )}
      </div>
    </div>
  )
}
