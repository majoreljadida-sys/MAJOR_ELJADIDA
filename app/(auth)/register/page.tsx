'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, UserPlus, AlertCircle, CheckCircle, ScrollText, ChevronDown, ShieldCheck } from 'lucide-react'
import { TSHIRT_SIZE_LABELS, MEMBER_CATEGORY_LABELS } from '@/lib/utils'

const SIZES  = Object.entries(TSHIRT_SIZE_LABELS)
const CATS   = Object.entries(MEMBER_CATEGORY_LABELS)
const CITIES = ['El Jadida', 'Casablanca', 'Rabat', 'Marrakech', 'Agadir', 'Fès', 'Autre']

const CHARTER_FR = [
  {
    title: 'Premièrement : Engagement général',
    items: [
      "S'engager dans l'esprit d'équipe et le travail collectif au sein du groupe.",
      "Respecter tous les membres du groupe et le comité organisateur.",
      "Respecter les directives et décisions émanant du comité organisateur.",
      "Préserver la réputation du groupe et se comporter de manière à en donner une image positive.",
    ],
  },
  {
    title: 'Deuxièmement : Participation aux entraînements et compétitions',
    items: [
      "Porter le maillot du groupe lors des compétitions officielles et activités organisées.",
      "Assister aux entraînements de manière régulière — au minimum la séance du dimanche.",
      "Participer aux votes organisés dans le groupe WhatsApp (compétitions, activités).",
      "Aucun vote ou demande de participation n'est accepté après l'expiration du délai de vote.",
      "En cas de retrait après confirmation, le membre s'acquitte de l'obligation de transport définie.",
    ],
  },
  {
    title: 'Troisièmement : Engagements financiers et organisationnels',
    items: [
      "Cotisation mensuelle fixée à 20 dirhams (ravitaillement et organisation).",
      "Les décisions du comité organisateur sont contraignantes pour tous les membres.",
      "Le comité dispose des prérogatives pour sanctionner tout manquement aux règles.",
    ],
  },
  {
    title: 'Quatrièmement : Déclaration et engagement',
    items: [
      "J'ai pris connaissance de cette charte et en ai compris le contenu.",
      "Je m'engage à respecter toutes les règles et réglementations qu'elle contient.",
      "J'assume ma responsabilité dans le respect des règles et le maintien de l'esprit d'équipe.",
      "Je m'engage à respecter la décence publique, à me conformer aux règlements internes applicables et à m'abstenir de tout comportement ou acte susceptible d'offenser la pudeur publique ou de violer les bonnes mœurs.",
      "J'assume l'entière responsabilité de toute infraction à ces règles, qui pourra entraîner des sanctions disciplinaires, pouvant aller jusqu'à l'exclusion du groupe.",
      "J'autorise le Club MAJOR à utiliser mes données personnelles (nom, prénom, photo) pour les besoins de participation et de communication liés aux événements sportifs organisés par le club.",
    ],
  },
]

const CHARTER_AR = [
  {
    title: 'أولاً: الالتزام العام',
    items: [
      'الالتزام بروح الفريق والعمل الجماعي داخل المجموعة.',
      'احترام جميع أعضاء المجموعة واللجنة المنظمة.',
      'الالتزام بالتوجيهات والقرارات الصادرة عن اللجنة المنظمة.',
      'المحافظة على سمعة المجموعة والتصرف بما يعكس صورة إيجابية عنها.',
    ],
  },
  {
    title: 'ثانياً: قوانين المشاركة في التداريب والمنافسات',
    items: [
      'التوفر على قميص المجموعة في المنافسات الرسمية والأنشطة المنظمة.',
      'حضور التداريب بانتظام، وعلى الأقل المشاركة في حصة يوم الأحد.',
      'المشاركة في الاستفتاءات أو عمليات التصويت داخل مجموعة الواتساب.',
      'لا يُقبل أي تصويت أو طلب مشاركة بعد انتهاء المدة المحددة للتصويت.',
      'في حالة تأكيد المشاركة ثم الانسحاب، يلتزم العضو بأداء واجب التنقل المحدد.',
    ],
  },
  {
    title: 'ثالثاً: الالتزامات المالية والتنظيمية',
    items: [
      'الواجب الشهري محدد في مبلغ 20 درهم لتغطية مصاريف التغذية والتنظيم.',
      'قرارات اللجنة المنظمة ملزمة لجميع الأعضاء ويجب احترامها في جميع الحالات.',
      'تتوفر اللجنة المنظمة على كامل الصلاحيات لاتخاذ القرار المناسب في حق أي عضو مخالف.',
    ],
  },
  {
    title: 'رابعاً: الإقرار والالتزام',
    items: [
      'أنه اطلع على هذا الميثاق وفهم مضمونه.',
      'أنه يلتزم باحترام جميع القوانين والتنظيمات الواردة فيه.',
      'أنه يتحمل مسؤوليته في الالتزام بقواعد المجموعة والمحافظة على روح الفريق.',
      'يلتزم باحترام الآداب العامة والامتثال للوائح الداخلية المعمول بها، والامتناع عن أي سلوك أو تصرف من شأنه الإخلال بالحياء العام أو انتهاك قواعد الأخلاق الحميدة.',
      'يتحمل المسؤولية الكاملة عن أي مخالفة لهذه القواعد، مما قد يترتب عليه توقيع عقوبات تأديبية تصل إلى الطرد من المجموعة.',
      'يُجيز لنادي MAJOR استخدام بياناته الشخصية (الاسم، الصورة) لأغراض المشاركة والتواصل المرتبطة بالفعاليات الرياضية التي ينظمها النادي.',
    ],
  },
]

export default function RegisterPage() {
  const [step, setStep]       = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [showPw, setShowPw]   = useState(false)
  const [charterLang, setCharterLang] = useState<'fr' | 'ar'>('fr')
  const [charterRead, setCharterRead] = useState(false)
  const [approved, setApproved]       = useState(false)

  // Aptitude médicale
  const [medicalAttestation, setMedicalAttestation] = useState(false)

  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '',
    birthDate: '', cin: '', city: 'El Jadida', tshirtSize: 'M', category: 'SENIOR',
  })

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })) }

  async function handleSubmit() {
    if (!approved) { setError('Vous devez approuver la charte pour continuer.'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, medicalAttestation }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Erreur lors de l'inscription.")
      setStep(5)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  /* ── Étape 5 : Succès ─────────────────────────────── */
  if (step === 5) return (
    <div className="card-dark text-center py-10">
      <div className="w-16 h-16 rounded-full bg-major-primary/10 flex items-center justify-center mx-auto mb-5">
        <CheckCircle size={32} className="text-major-accent" />
      </div>
      <h2 className="font-bebas text-3xl text-white tracking-widest mb-3">INSCRIPTION REÇUE !</h2>
      <p className="text-gray-400 font-inter text-sm leading-relaxed mb-6 max-w-xs mx-auto">
        Votre demande d'adhésion a bien été enregistrée. Un administrateur va valider votre compte.
      </p>
      <Link href="/login" className="btn-primary text-sm px-6 py-2.5">Se connecter</Link>
    </div>
  )

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="font-bebas text-4xl text-white tracking-widest mb-2">ADHÉRER AU CLUB</h1>
        <p className="text-gray-400 font-inter text-sm">Rejoignez la communauté Club MAJOR</p>
      </div>

      {/* Indicateur d'étapes */}
      <div className="flex items-center gap-2 mb-3">
        {[1, 2, 3, 4].map(s => (
          <div key={s} className={`flex-1 h-1.5 rounded-full transition-colors ${step >= s ? 'bg-major-primary' : 'bg-gray-800'}`} />
        ))}
      </div>
      <div className="flex justify-between text-[10px] font-inter text-gray-500 mb-5 px-0.5">
        <span className={step >= 1 ? 'text-major-accent' : ''}>1. Profil</span>
        <span className={step >= 2 ? 'text-major-accent' : ''}>2. Sport</span>
        <span className={step >= 3 ? 'text-major-accent' : ''}>3. Aptitude</span>
        <span className={step >= 4 ? 'text-major-accent' : ''}>4. Charte</span>
      </div>

      <div className="card-dark">
        {error && (
          <div className="flex items-center gap-2.5 bg-red-900/20 border border-red-700/40 rounded-xl px-4 py-3 mb-5 text-red-400 text-sm font-inter">
            <AlertCircle size={16} className="flex-shrink-0" />
            {error}
          </div>
        )}

        {/* ── Étape 1 : Informations personnelles ── */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-oswald text-white text-lg uppercase tracking-wide mb-4">Informations personnelles</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Prénom *</label>
                <input className="input-dark" placeholder="Prénom" value={form.firstName} onChange={e => set('firstName', e.target.value)} />
              </div>
              <div>
                <label className="form-label">Nom *</label>
                <input className="input-dark" placeholder="Nom" value={form.lastName} onChange={e => set('lastName', e.target.value)} />
              </div>
            </div>

            <div>
              <label className="form-label">Email *</label>
              <input type="email" className="input-dark" placeholder="votre@email.com" value={form.email} onChange={e => set('email', e.target.value)} />
            </div>

            <div>
              <label className="form-label">Téléphone *</label>
              <input type="tel" className="input-dark" placeholder="+212 6XX XXX XXX" value={form.phone} onChange={e => set('phone', e.target.value)} />
            </div>

            <div>
              <label className="form-label">Date de naissance *</label>
              <input type="date" className="input-dark" value={form.birthDate} onChange={e => set('birthDate', e.target.value)} />
            </div>

            <div>
              <label className="form-label">N° CIN *</label>
              <input className="input-dark" placeholder="Ex : AB123456"
                value={form.cin}
                onChange={e => set('cin', e.target.value.toUpperCase().trim())} />
              <p className="text-gray-500 text-[11px] font-inter mt-1">
                Carte d'Identité Nationale — nécessaire pour les inscriptions aux courses officielles.
              </p>
            </div>

            <div>
              <label className="form-label">Ville</label>
              <select className="input-dark" value={form.city} onChange={e => set('city', e.target.value)}>
                {CITIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>

            <div className="relative">
              <label className="form-label">Mot de passe *</label>
              <input type={showPw ? 'text' : 'password'} className="input-dark pr-10" placeholder="8 caractères minimum"
                value={form.password} onChange={e => set('password', e.target.value)} />
              <button type="button" onClick={() => setShowPw(p => !p)}
                className="absolute right-3 bottom-3 text-gray-500 hover:text-gray-300 transition-colors">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <div>
              <label className="form-label">Confirmer le mot de passe *</label>
              <input type="password" className="input-dark" placeholder="Répéter le mot de passe"
                value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} />
            </div>

            <button type="button" onClick={() => {
              const missing: string[] = []
              if (!form.firstName.trim()) missing.push('Prénom')
              if (!form.lastName.trim())  missing.push('Nom')
              if (!form.email.trim())     missing.push('Email')
              if (!form.phone.trim())     missing.push('Téléphone')
              if (!form.birthDate)        missing.push('Date de naissance')
              if (!form.cin.trim())       missing.push('N° CIN')
              if (!form.password)         missing.push('Mot de passe')
              if (missing.length > 0)
                return setError(`Champs obligatoires manquants : ${missing.join(', ')}.`)
              if (form.password !== form.confirmPassword)
                return setError('Les mots de passe ne correspondent pas.')
              if (form.password.length < 8)
                return setError('Le mot de passe doit comporter au moins 8 caractères.')
              if (form.cin.length < 4)
                return setError('Le N° CIN saisi semble incorrect.')
              setError(''); setStep(2)
            }} className="btn-primary w-full py-3.5 font-inter text-sm font-semibold">
              Continuer →
            </button>
          </div>
        )}

        {/* ── Étape 2 : Informations sportives ── */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="font-oswald text-white text-lg uppercase tracking-wide mb-4">Informations sportives</h3>

            <div>
              <label className="form-label">Catégorie</label>
              <select className="input-dark" value={form.category} onChange={e => set('category', e.target.value)}>
                {CATS.map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>

            <div>
              <label className="form-label">Taille t-shirt</label>
              <div className="flex gap-2 flex-wrap">
                {SIZES.map(([k, v]) => (
                  <button key={k} type="button" onClick={() => set('tshirtSize', k)}
                    className={`px-4 py-2 rounded-xl text-sm font-inter font-medium border transition-colors ${
                      form.tshirtSize === k ? 'bg-major-primary border-major-primary text-white' : 'border-gray-700 text-gray-400 hover:border-gray-500'
                    }`}>
                    {v}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1 py-3 text-sm">← Retour</button>
              <button type="button" onClick={() => { setError(''); setStep(3) }} className="btn-primary flex-1 py-3 text-sm">
                Continuer →
              </button>
            </div>
          </div>
        )}

        {/* ── Étape 3 : Aptitude médicale ── */}
        {step === 3 && (
          <div className="space-y-5">
            <div className="flex items-center gap-3 mb-2">
              <ShieldCheck size={22} className="text-major-accent flex-shrink-0" />
              <div>
                <h3 className="font-oswald text-white text-lg uppercase tracking-wide">Aptitude médicale</h3>
                <p className="text-gray-500 text-xs font-inter">Déclaration sur l'honneur</p>
              </div>
            </div>

            {/* Explication */}
            <div className="bg-major-black/40 border border-gray-800 rounded-xl p-4 space-y-2">
              <p className="text-gray-300 font-inter text-sm leading-relaxed">
                La pratique de la course à pied en compétition ou en entraînement intensif nécessite
                une condition physique compatible avec l'effort sportif.
              </p>
              <p className="text-gray-400 font-inter text-xs leading-relaxed">
                Il vous est conseillé d'effectuer une visite médicale auprès de votre médecin traitant
                afin de vous assurer de votre aptitude avant de vous inscrire aux compétitions officielles.
              </p>
            </div>

            {/* Attestation */}
            <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
              medicalAttestation
                ? 'bg-major-primary/10 border-major-primary/50'
                : 'bg-major-black/40 border-gray-700 hover:border-major-primary/40'
            }`}>
              <input
                type="checkbox"
                checked={medicalAttestation}
                onChange={e => setMedicalAttestation(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-major-primary flex-shrink-0"
              />
              <div>
                <p className="text-white font-inter text-sm font-semibold">
                  Je certifie sur l'honneur
                </p>
                <p className="text-gray-400 font-inter text-xs mt-1 leading-relaxed">
                  avoir effectué une visite médicale et être médicalement apte à la pratique
                  de la course à pied et des activités sportives du Club MAJOR.
                </p>
                <p className="text-gray-500 font-cairo text-xs mt-2 leading-relaxed text-right" dir="rtl">
                  أُقرّ بأنني أجريت فحصًا طبيًا وأنني مؤهل صحيًا لممارسة الجري وأنشطة نادي ماجور.
                </p>
              </div>
            </label>

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => setStep(2)} className="btn-secondary flex-1 py-3 text-sm">← Retour</button>
              <button type="button"
                onClick={() => {
                  if (!medicalAttestation)
                    return setError('Vous devez cocher l\'attestation médicale pour continuer.')
                  setError(''); setStep(4)
                }}
                disabled={!medicalAttestation}
                className="btn-primary flex-1 py-3 text-sm disabled:opacity-40 disabled:cursor-not-allowed">
                Continuer →
              </button>
            </div>
          </div>
        )}

        {/* ── Étape 4 : Charte ── */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <ScrollText size={22} className="text-major-accent flex-shrink-0" />
              <div>
                <h3 className="font-oswald text-white text-lg uppercase tracking-wide">Charte d'Adhésion et d'Engagement</h3>
                <p className="text-gray-500 text-xs font-inter">ميثاق الانخراط والالتزام</p>
              </div>
            </div>

            {/* Toggle FR / AR */}
            <div className="flex gap-2">
              <button onClick={() => setCharterLang('fr')}
                className={`px-4 py-1.5 rounded-lg text-xs font-inter font-semibold border transition-colors ${
                  charterLang === 'fr' ? 'bg-major-primary border-major-primary text-white' : 'border-gray-700 text-gray-400 hover:border-gray-500'
                }`}>Français</button>
              <button onClick={() => setCharterLang('ar')}
                className={`px-4 py-1.5 rounded-lg text-xs font-inter font-semibold border transition-colors ${
                  charterLang === 'ar' ? 'bg-major-primary border-major-primary text-white' : 'border-gray-700 text-gray-400 hover:border-gray-500'
                }`}>العربية</button>
            </div>

            {/* Intro */}
            <div className="bg-major-black/40 rounded-xl border border-gray-800 p-4">
              {charterLang === 'fr' ? (
                <p className="text-gray-300 font-inter text-xs leading-relaxed">
                  Dans le cadre de l'organisation du groupe MAJOR, et pour renforcer l'esprit de discipline,
                  de responsabilité et de travail collectif, cette charte définit les règles fondamentales
                  régissant la participation au sein du groupe — entraînements, compétitions et activités communes.
                </p>
              ) : (
                <p className="text-gray-300 font-cairo text-xs leading-relaxed text-right" dir="rtl">
                  في إطار تنظيم عمل مجموعة ماجور، وتعزيز روح الانضباط والمسؤولية والعمل الجماعي بين جميع الأعضاء،
                  تم اعتماد هذا الميثاق ليحدد القواعد الأساسية التي تنظم المشاركة داخل المجموعة، سواء في التداريب
                  أو في المنافسات الرياضية أو في الأنشطة المشتركة.
                </p>
              )}
            </div>

            {/* Corps de la charte — scrollable */}
            <div
              className="bg-major-black/40 rounded-xl border border-gray-800 overflow-y-auto max-h-64 p-4 space-y-4"
              onScroll={e => {
                const el = e.currentTarget
                if (el.scrollTop + el.clientHeight >= el.scrollHeight - 10) setCharterRead(true)
              }}
              dir={charterLang === 'ar' ? 'rtl' : 'ltr'}
            >
              {(charterLang === 'fr' ? CHARTER_FR : CHARTER_AR).map((section, i) => (
                <div key={i}>
                  <p className={`font-semibold text-major-accent text-xs mb-2 ${charterLang === 'ar' ? 'font-cairo' : 'font-inter'}`}>
                    {section.title}
                  </p>
                  <ul className="space-y-1.5">
                    {section.items.map((item, j) => (
                      <li key={j} className={`flex gap-2 text-gray-300 text-xs leading-relaxed ${charterLang === 'ar' ? 'font-cairo' : 'font-inter'}`}>
                        <span className="text-major-primary mt-0.5 flex-shrink-0">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              {/* Slogan final */}
              <div className="pt-3 border-t border-gray-800 text-center">
                <p className="text-major-accent text-xs font-inter italic">
                  {charterLang === 'fr'
                    ? 'Ensemble vers la discipline et la cohésion sportive'
                    : 'معاً نحو الانضباط والتألق الرياضي'}
                </p>
                <p className="text-gray-500 text-[10px] font-cairo mt-1">
                  مجموعة ماجور بالفرح والسرور 🏃
                </p>
              </div>
            </div>

            {/* Indication scroll */}
            {!charterRead && (
              <div className="flex items-center gap-2 text-gray-500 text-xs font-inter justify-center animate-bounce">
                <ChevronDown size={13} />
                Faites défiler pour lire la charte complète
              </div>
            )}

            {/* Case à cocher */}
            <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
              approved
                ? 'bg-major-primary/10 border-major-primary/50'
                : charterRead
                  ? 'bg-major-black/40 border-gray-700 hover:border-major-primary/40'
                  : 'bg-major-black/20 border-gray-800 opacity-50 cursor-not-allowed'
            }`}>
              <input
                type="checkbox"
                disabled={!charterRead}
                checked={approved}
                onChange={e => setApproved(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-major-primary"
              />
              <div>
                <p className="text-white font-inter text-sm font-semibold">
                  Lu et approuvé ✓
                </p>
                <p className="text-gray-400 font-inter text-xs mt-0.5">
                  J'ai lu, compris et j'accepte la charte d'adhésion et d'engagement du Club MAJOR.
                </p>
                <p className="text-gray-500 font-cairo text-xs mt-1" dir="rtl">
                  لقد اطلعت على الميثاق وأوافق على جميع بنوده.
                </p>
              </div>
            </label>

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => setStep(3)} className="btn-secondary flex-1 py-3 text-sm">← Retour</button>
              <button type="button" onClick={handleSubmit} disabled={!approved || loading}
                className="btn-primary flex-1 flex items-center justify-center gap-2 py-3 disabled:opacity-40 disabled:cursor-not-allowed">
                {loading
                  ? <span className="font-inter text-sm">Envoi...</span>
                  : <><UserPlus size={16} /><span className="font-inter text-sm font-semibold">S'inscrire</span></>
                }
              </button>
            </div>
          </div>
        )}

        <p className="text-center text-gray-500 text-sm font-inter mt-6">
          Déjà membre ?{' '}
          <Link href="/login" className="text-major-accent hover:text-major-primary transition-colors font-medium">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  )
}
