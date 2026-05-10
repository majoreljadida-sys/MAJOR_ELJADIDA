'use client'

import { useState } from 'react'
import {
  Sparkles, Calendar, Target, Activity, Zap, Map, Timer, Heart, Flag,
  AlertTriangle, ChevronDown, ChevronRight, Printer, RefreshCw,
} from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  generatePlan, formatDuration,
  type Distance, type WeekCount, type SessionsPerWeek,
  type SessionType, type PlanSession, type TrainingPlan,
} from '@/lib/training-plan'

const SESSION_CFG: Record<SessionType, { color: string; bg: string; border: string; icon: any; label: string }> = {
  EF:           { color: 'text-blue-400',   bg: 'bg-blue-900/30',    border: 'border-blue-700/40',   icon: Activity, label: 'Endurance' },
  VMA:          { color: 'text-orange-400', bg: 'bg-orange-900/30',  border: 'border-orange-700/40', icon: Zap,      label: 'Fractionné' },
  SEUIL:        { color: 'text-yellow-500', bg: 'bg-yellow-900/30',  border: 'border-yellow-700/40', icon: Timer,    label: 'Seuil' },
  SORTIE_LONGUE:{ color: 'text-purple-400', bg: 'bg-purple-900/30',  border: 'border-purple-700/40', icon: Map,      label: 'Sortie longue' },
  RECUP:        { color: 'text-gray-400',   bg: 'bg-gray-900/30',    border: 'border-gray-700/40',   icon: Heart,    label: 'Récup' },
  REVEIL:       { color: 'text-cyan-500',   bg: 'bg-cyan-900/30',    border: 'border-cyan-700/40',   icon: Sparkles, label: 'Réveil' },
  COURSE:       { color: 'text-major-accent', bg: 'bg-major-primary/15', border: 'border-major-primary/50', icon: Flag, label: 'Course' },
}

const PHASE_LABELS: Record<string, { label: string; color: string }> = {
  BUILD:    { label: 'Développement', color: 'text-major-cyan' },
  AFFUTAGE: { label: 'Affûtage',      color: 'text-yellow-400' },
  COURSE:   { label: 'Semaine course', color: 'text-major-accent' },
}

interface FormState {
  vma:        string
  distance:   Distance
  goalH:      string
  goalM:      string
  goalS:      string
  raceDate:   string
  weeks:      WeekCount
  sessions:   SessionsPerWeek
}

const DEFAULT_FORM: FormState = {
  vma: '14', distance: 10, goalH: '0', goalM: '50', goalS: '00',
  raceDate: '', weeks: 8, sessions: 3,
}

function parseTimeSec(h: string, m: string, s: string): number {
  return (Number(h) || 0) * 3600 + (Number(m) || 0) * 60 + (Number(s) || 0)
}

export default function MonProgrammePage() {
  const [form, setForm] = useState<FormState>(DEFAULT_FORM)
  const [plan, setPlan] = useState<TrainingPlan | null>(null)
  const [error, setError] = useState('')
  const [openWeek, setOpenWeek] = useState<number | null>(null)

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm(f => ({ ...f, [k]: v }))
  }

  function handleGenerate() {
    setError('')
    const vma = Number(form.vma)
    if (!vma || vma < 8 || vma > 24) {
      setError('VMA invalide. Saisis une valeur entre 8 et 24 km/h.')
      return
    }
    const goalSec = parseTimeSec(form.goalH, form.goalM, form.goalS)
    if (goalSec <= 0) {
      setError('Saisis un temps cible valide (au moins quelques minutes).')
      return
    }
    if (!form.raceDate) {
      setError('Choisis la date de ta course objectif.')
      return
    }
    const raceDate = new Date(form.raceDate + 'T08:00:00')
    if (isNaN(raceDate.getTime())) {
      setError('Date de course invalide.')
      return
    }
    const minDate = new Date()
    minDate.setDate(minDate.getDate() + form.weeks * 7 - 6)
    if (raceDate < minDate) {
      setError(`La course doit être au moins ${form.weeks} semaines après aujourd'hui.`)
      return
    }
    const generated = generatePlan({
      vma,
      distance: form.distance,
      goalTimeSeconds: goalSec,
      raceDate,
      weeks: form.weeks,
      sessionsPerWeek: form.sessions,
    })
    setPlan(generated)
    // ouvre la semaine 1 par défaut
    setOpenWeek(1)
    // scroll vers le résultat
    setTimeout(() => {
      document.getElementById('plan-result')?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  function handlePrint() { window.print() }

  return (
    <div className="p-8 max-w-5xl">
      {/* Filigrane logo MAJOR — visible uniquement à l'impression */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo_major.png"
        alt=""
        aria-hidden="true"
        className="print-watermark hidden print:block"
      />

      <div className="mb-8 print:hidden">
        <h1 className="font-bebas text-4xl text-white tracking-widest">MON PROGRAMME PERSO</h1>
        <p className="text-gray-400 font-inter text-sm mt-1">
          Génère ton plan d&apos;entraînement personnalisé pour ta prochaine course (10 km, semi ou marathon).
          Cette page n&apos;affecte pas le programme du club.
        </p>
      </div>

      {/* Form */}
      <div className="card-dark mb-6 print:hidden">
        <div className="flex items-center gap-2 mb-5">
          <Sparkles size={18} className="text-major-accent" />
          <h2 className="font-oswald text-white text-lg uppercase tracking-wide">Paramètres</h2>
        </div>

        {error && (
          <div className="flex items-center gap-2.5 bg-red-900/20 border border-red-700/40 rounded-xl px-4 py-3 mb-5 text-red-400 text-sm font-inter">
            <AlertTriangle size={16} className="flex-shrink-0" />
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* VMA */}
          <div>
            <label className="form-label flex items-center gap-1.5">
              <Activity size={13} /> VMA actuelle <span className="text-red-400">*</span>
            </label>
            <p className="text-gray-500 text-[11px] font-inter mb-2">
              En km/h. Si tu ne la connais pas, fais un test (ex : Cooper 12 min) ou utilise le calculateur de la page Programme.
            </p>
            <div className="flex items-center gap-2">
              <input type="number" step="0.1" min="8" max="24"
                className="input-dark w-32" value={form.vma}
                onChange={e => set('vma', e.target.value)} />
              <span className="text-gray-400 font-inter text-sm">km/h</span>
            </div>
          </div>

          {/* Distance */}
          <div>
            <label className="form-label flex items-center gap-1.5">
              <Target size={13} /> Distance objectif <span className="text-red-400">*</span>
            </label>
            <div className="flex gap-2 mt-1">
              {([10, 21, 42] as Distance[]).map(d => (
                <button key={d} type="button" onClick={() => set('distance', d)}
                  className={`flex-1 px-3 py-2.5 rounded-xl text-sm font-inter font-medium border transition-colors ${
                    form.distance === d
                      ? 'bg-major-primary border-major-primary text-white'
                      : 'border-gray-700 text-gray-400 hover:border-gray-500'
                  }`}>
                  {d} km
                </button>
              ))}
            </div>
          </div>

          {/* Temps cible */}
          <div>
            <label className="form-label flex items-center gap-1.5">
              <Timer size={13} /> Temps cible <span className="text-red-400">*</span>
            </label>
            <p className="text-gray-500 text-[11px] font-inter mb-2">Format hh:mm:ss</p>
            <div className="flex items-center gap-2">
              <input type="number" min="0" max="10" placeholder="h"
                className="input-dark w-20 text-center" value={form.goalH}
                onChange={e => set('goalH', e.target.value)} />
              <span className="text-gray-500">:</span>
              <input type="number" min="0" max="59" placeholder="m"
                className="input-dark w-20 text-center" value={form.goalM}
                onChange={e => set('goalM', e.target.value)} />
              <span className="text-gray-500">:</span>
              <input type="number" min="0" max="59" placeholder="s"
                className="input-dark w-20 text-center" value={form.goalS}
                onChange={e => set('goalS', e.target.value)} />
            </div>
          </div>

          {/* Race date */}
          <div>
            <label className="form-label flex items-center gap-1.5">
              <Calendar size={13} /> Date de la course <span className="text-red-400">*</span>
            </label>
            <p className="text-gray-500 text-[11px] font-inter mb-2">Le plan recule de N semaines à partir de cette date.</p>
            <input type="date" className="input-dark w-full"
              value={form.raceDate} onChange={e => set('raceDate', e.target.value)} />
          </div>

          {/* Nb semaines */}
          <div>
            <label className="form-label">Nombre de semaines <span className="text-red-400">*</span></label>
            <div className="flex gap-2 mt-1">
              {([6, 8, 10] as WeekCount[]).map(w => (
                <button key={w} type="button" onClick={() => set('weeks', w)}
                  className={`flex-1 px-3 py-2.5 rounded-xl text-sm font-inter font-medium border transition-colors ${
                    form.weeks === w
                      ? 'bg-major-primary border-major-primary text-white'
                      : 'border-gray-700 text-gray-400 hover:border-gray-500'
                  }`}>
                  {w} sem.
                </button>
              ))}
            </div>
          </div>

          {/* Nb séances/sem */}
          <div>
            <label className="form-label">Séances par semaine <span className="text-red-400">*</span></label>
            <div className="flex gap-2 mt-1">
              {([3, 4] as SessionsPerWeek[]).map(s => (
                <button key={s} type="button" onClick={() => set('sessions', s)}
                  className={`flex-1 px-3 py-2.5 rounded-xl text-sm font-inter font-medium border transition-colors ${
                    form.sessions === s
                      ? 'bg-major-primary border-major-primary text-white'
                      : 'border-gray-700 text-gray-400 hover:border-gray-500'
                  }`}>
                  {s} séances
                </button>
              ))}
            </div>
          </div>
        </div>

        <button type="button" onClick={handleGenerate}
          className="btn-primary w-full mt-6 py-3.5 flex items-center justify-center gap-2">
          <Sparkles size={16} />
          <span className="font-inter text-sm font-semibold">
            {plan ? 'Régénérer mon programme' : 'Générer mon programme'}
          </span>
        </button>
      </div>

      {/* Plan généré */}
      {plan && (
        <div id="plan-result" className="space-y-5">
          {/* Header du plan */}
          <div className="card-dark">
            <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
              <div>
                <h2 className="font-bebas text-3xl text-white tracking-widest">
                  PLAN {plan.input.distance} KM · {plan.input.weeks} SEMAINES
                </h2>
                <p className="text-gray-400 font-inter text-sm mt-1">
                  Du {format(plan.startDate, 'dd MMMM yyyy', { locale: fr })}
                  {' '}au{' '}
                  <span className="text-major-accent font-semibold">
                    {format(plan.raceDate, 'dd MMMM yyyy', { locale: fr })}
                  </span>
                </p>
              </div>
              <div className="flex gap-2 print:hidden">
                <button type="button" onClick={() => setPlan(null)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-700 text-gray-400 hover:text-white text-xs font-inter transition-colors">
                  <RefreshCw size={13} /> Modifier
                </button>
                <button type="button" onClick={handlePrint}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-major-primary/15 border border-major-primary/40 text-major-accent text-xs font-inter font-medium hover:bg-major-primary/25 transition-colors">
                  <Printer size={13} /> Imprimer
                </button>
              </div>
            </div>

            {plan.warning && (
              <div className="flex items-start gap-2.5 bg-yellow-900/20 border border-yellow-700/40 rounded-xl px-4 py-3 mb-4 text-yellow-300 text-xs font-inter">
                <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
                {plan.warning}
              </div>
            )}

            {/* Allures */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <PaceCard label="EF"             value={plan.paceLabels.ef}        sub="65 % VMA"  />
              <PaceCard label="Endurance"      value={plan.paceLabels.easy}      sub="72 % VMA"  />
              <PaceCard label="Allure cible"   value={plan.paceLabels.target}    sub="course"    accent />
              <PaceCard label="Seuil"          value={plan.paceLabels.threshold} sub="87 % VMA"  />
              <PaceCard label="VMA"            value={plan.paceLabels.vmaShort}  sub="100 % VMA" />
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3 text-center text-xs font-inter">
              <Stat label="Séances totales" value={String(plan.totalSessions)} />
              <Stat label="Volume total"     value={`${Math.round(plan.totalMin / 60)} h`} />
              <Stat label="Séances/sem"      value={String(plan.input.sessionsPerWeek)} />
            </div>
          </div>

          {/* Semaines */}
          {plan.weeks.map(week => {
            const isOpen = openWeek === week.index
            const phaseInfo = PHASE_LABELS[week.phase]
            return (
              <div key={week.index}
                className={`rounded-2xl border overflow-hidden ${
                  week.phase === 'COURSE' ? 'border-major-primary/50' :
                  week.phase === 'AFFUTAGE' ? 'border-yellow-700/40' :
                  'border-gray-800'
                }`}>
                <button type="button"
                  onClick={() => setOpenWeek(isOpen ? null : week.index)}
                  className="w-full flex items-center justify-between gap-3 px-5 py-3.5 bg-major-surface hover:bg-major-surface/80 transition-colors text-left print:bg-transparent">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-bebas text-2xl text-white tracking-widest">
                      SEMAINE {week.index}
                    </span>
                    <span className={`text-xs font-inter font-semibold uppercase tracking-widest ${phaseInfo.color}`}>
                      {phaseInfo.label}
                    </span>
                    <span className="text-gray-500 text-xs font-inter">
                      {format(week.startDate, 'dd MMM', { locale: fr })}
                      {' → '}
                      {format(week.endDate, 'dd MMM', { locale: fr })}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-gray-400 text-xs font-inter">
                      {week.totalMin}&apos; · {week.sessions.length} séances
                    </span>
                    <ChevronDown size={16} className={`text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                <div className={`divide-y divide-gray-800/60 ${isOpen ? '' : 'hidden print:block'}`}>
                  {week.sessions.map((s, i) => (
                    <SessionRow key={i} session={s} />
                  ))}
                </div>
              </div>
            )
          })}

          {/* Nutrition & Pratiques — visible à l'écran et imprimé */}
          <NutritionSection distance={plan.input.distance} />
        </div>
      )}

      <style jsx global>{`
        @media print {
          @page { margin: 14mm; }
          body { background: white !important; color: black !important; }
          .print\\:hidden { display: none !important; }
          .card-dark { background: white !important; border: 1px solid #ddd !important; color: black !important; }
          /* Filigrane MAJOR centré sur chaque page */
          .print-watermark {
            position: fixed;
            top: 50%;
            left: 50%;
            width: 60vw;
            max-width: 480px;
            height: auto;
            transform: translate(-50%, -50%);
            opacity: 0.08;
            z-index: 0;
            pointer-events: none;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          /* Le contenu doit passer au-dessus du filigrane */
          .card-dark, h1, h2, h3 { position: relative; z-index: 1; }
        }
        @media screen {
          .print-watermark { display: none !important; }
        }
      `}</style>
    </div>
  )
}

function PaceCard({ label, value, sub, accent }: { label: string; value: string; sub: string; accent?: boolean }) {
  return (
    <div className={`rounded-xl border p-3 text-center ${
      accent
        ? 'bg-major-primary/15 border-major-primary/50'
        : 'bg-major-surface border-gray-800'
    }`}>
      <p className={`text-[10px] font-inter uppercase tracking-widest ${accent ? 'text-major-accent' : 'text-gray-400'}`}>
        {label}
      </p>
      <p className="font-bebas text-xl text-white tracking-wider mt-1">{value}</p>
      <p className="text-[10px] font-inter text-gray-400 mt-0.5">{sub}</p>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-800 bg-major-surface p-3">
      <p className="text-[10px] font-inter uppercase tracking-widest text-gray-400">{label}</p>
      <p className="font-bebas text-xl text-major-accent tracking-wider mt-0.5">{value}</p>
    </div>
  )
}

function NutritionSection({ distance }: { distance: Distance }) {
  const isLong = distance === 21 || distance === 42
  return (
    <div className="card-dark space-y-6 print:break-before-page">
      <div className="flex items-center gap-2">
        <span className="text-2xl">🥗</span>
        <h2 className="font-bebas text-2xl text-white tracking-widest">NUTRITION & PRATIQUES</h2>
      </div>

      {/* Hydratation */}
      <Section title="💧 Hydratation" items={[
        'Au quotidien : 1,5 à 2 L d\'eau, plus 500 ml par heure d\'entraînement.',
        'Vérifie ta couleur d\'urine — claire = bien hydraté.',
        'Pendant l\'effort > 1 h : boire 150-200 ml toutes les 15-20 min.',
        'Évite l\'alcool 48 h avant la course (déshydrate, altère le sommeil).',
      ]} />

      {/* Alimentation entraînement */}
      <Section title="🍞 Alimentation au quotidien" items={[
        'Petit-déjeuner : glucides complexes (avoine, pain complet) + protéines (œufs, fromage blanc).',
        'Déjeuner : féculents (riz, pâtes, semoule, lentilles) + légumes + protéines maigres (poulet, poisson, légumineuses).',
        'Dîner : plus léger, idéalement 3 h avant le coucher.',
        'Collation 1 h avant la séance : banane, dattes, compote, ou poignée de fruits secs.',
        'Récup post-séance dans les 30 min : 1 fruit + 1 source de protéines (yaourt, lait, fromage blanc).',
      ]} />

      {/* Semaine de course */}
      <Section title={`🏁 Semaine de la course ${distance >= 21 ? '(carbo-loading)' : ''}`} items={
        isLong ? [
          'J-7 à J-3 : alimentation normale, légèrement plus riche en glucides.',
          'J-3 à J-1 : augmenter les féculents (pâtes, riz, semoule) à chaque repas. Réduire les graisses et les fibres irritantes (légumineuses, choux).',
          'J-1 dîner : pâtes / riz cuits simples, peu de sauce, un peu de poulet ou de poisson, banane en dessert.',
          'Boire régulièrement, sans excès. Pas d\'alcool.',
          'Préparer son sac la veille : dossard, chaussures, vêtements, gels, montre chargée.',
        ] : [
          'J-3 à J-1 : repas équilibrés avec un peu plus de glucides que d\'habitude.',
          'J-1 dîner : féculents + protéines maigres + légumes cuits. Pas de plat nouveau, pas d\'épices fortes.',
          'Hydratation régulière, pas d\'alcool.',
          'Préparer ton sac la veille (dossard, chaussures, montre chargée).',
        ]
      } />

      {/* Jour J */}
      <Section title="🥇 Le jour J" items={[
        'Petit-déjeuner 3 h avant le départ : pain/biscottes + miel/confiture + compote + thé/café léger.',
        'Évite tout aliment nouveau ou riche en graisses.',
        'Échauffement 15-20 min : footing très lent + 4×100m progressifs + étirements dynamiques.',
        ...(distance >= 21
          ? ['Pendant la course : 1 gel ou 25 g de glucides toutes les 30-40 min après la 1ʳᵉ heure.',
             'Boire à chaque ravitaillement, par petites gorgées.']
          : ['Pour 10 km : pas besoin de manger pendant la course. Boire 1 ou 2 gorgées si fortes chaleurs.']),
        'Toilettes 30 min avant le départ.',
      ]} />

      {/* Récupération */}
      <Section title="💆 Récupération" items={[
        'Dans les 30 min après la séance : eau + 1 fruit + protéines (yaourt, lait).',
        'Sommeil : viser 7-9 h par nuit. C\'est dans le sommeil que les progrès se font.',
        'Étirements légers après les séances faciles. Pas de gros étirements après les fractionnés intenses.',
        'Auto-massages (rouleau) 2-3 fois par semaine sur les jambes.',
        'Une journée OFF complète par semaine — c\'est non négociable pour progresser.',
      ]} />

      {/* Pratiques d'entraînement */}
      <Section title="🏋️ Bonnes pratiques" items={[
        'Respecte les allures — courir trop vite à l\'EF est l\'erreur la plus fréquente.',
        'L\'EF doit être lente : tu dois pouvoir tenir une conversation.',
        'Renforcement musculaire 1×/semaine (gainage, squats, fentes, pompes) — protège des blessures.',
        'Écoute ton corps : douleur aiguë = stop. Fatigue extrême = remplace la séance dure par un EF.',
        'Tiens un journal : ressenti, sommeil, allures, météo. Tu apprendras énormément sur toi.',
        'Investis dans une bonne paire de chaussures adaptée à ta foulée. Renouvelle après 800-1000 km.',
      ]} />

      <p className="text-gray-500 text-[11px] font-inter italic pt-2 border-t border-gray-800">
        Ces conseils sont génériques. En cas de doute, consulte un médecin du sport ou un nutritionniste.
        Le Club MAJOR ne se substitue pas à un avis médical individuel.
      </p>
    </div>
  )
}

function Section({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="font-oswald text-major-accent text-sm uppercase tracking-widest mb-2">{title}</h3>
      <ul className="space-y-1.5">
        {items.map((it, i) => (
          <li key={i} className="flex gap-2 text-sm font-inter text-gray-200 leading-relaxed">
            <span className="text-major-primary mt-1 flex-shrink-0">•</span>
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function SessionRow({ session }: { session: PlanSession }) {
  const cfg = SESSION_CFG[session.type]
  const Icon = cfg.icon
  return (
    <div className={`px-5 py-4 flex items-start gap-4 ${cfg.bg}`}>
      <div className={`text-center rounded-xl px-3 py-2 min-w-[60px] border ${cfg.border}`}>
        <p className="font-bebas text-xl leading-tight text-white">
          {format(session.date, 'dd', { locale: fr })}
        </p>
        <p className="text-[9px] font-inter uppercase text-gray-400">
          {format(session.date, 'EEE', { locale: fr })}
        </p>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className={`flex items-center gap-1 text-[10px] font-inter font-semibold uppercase tracking-wider ${cfg.color}`}>
            <Icon size={11} />
            {cfg.label}
          </span>
          {session.paceLabel && (
            <span className="text-[10px] text-gray-400 font-mono">{session.paceLabel}</span>
          )}
          {session.durationMin !== undefined && session.durationMin > 0 && (
            <span className="text-[10px] text-gray-500 font-inter">· {session.durationMin}&apos;</span>
          )}
        </div>
        <p className="text-white font-inter font-semibold text-sm">{session.title}</p>
        <p className="text-gray-400 text-xs font-inter mt-0.5">{session.description}</p>
        {session.details && session.details.length > 0 && (
          <ul className="mt-2 space-y-1">
            {session.details.map((d, i) => (
              <li key={i} className="flex gap-2 text-[12px] font-inter text-gray-300">
                <span className={cfg.color}>•</span>
                <span>{d}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
