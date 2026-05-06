'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Users, Activity, TrendingUp, ExternalLink, MapPin, Trophy, Medal } from 'lucide-react'
import { Logo } from '@/components/ui/logo'
import type { StravaClub, StravaActivity, StravaMember, WeeklyStat } from '@/lib/strava'

function formatDistance(meters: number) { return (meters / 1000).toFixed(1) + ' km' }
function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}h${String(m).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}
function formatPace(mps: number) {
  if (!mps) return '—'
  const secPerKm = 1000 / mps
  const m = Math.floor(secPerKm / 60)
  const s = Math.round(secPerKm % 60)
  return `${m}'${String(s).padStart(2, '0')}"/km`
}
function activityTypeIcon(type: string) {
  const map: Record<string, string> = { Run: '🏃', Ride: '🚴', Walk: '🚶', Hike: '🥾', Swim: '🏊' }
  return map[type] ?? '🏅'
}

interface Props {
  club:           StravaClub | null
  activities:     StravaActivity[]
  members:        StravaMember[]
  weeklyStats:    WeeklyStat[]
  clubUrl:        string
  isInStravaClub: boolean
}

const NOT_CONFIGURED = (clubUrl: string) => (
  <div className="min-h-screen bg-major-black flex items-center justify-center p-8">
    <div className="text-center max-w-md">
      <div className="text-6xl mb-6">🏃</div>
      <h2 className="font-bebas text-3xl text-white tracking-widest mb-3">STRAVA — CLUB MAJOR</h2>
      <p className="text-gray-400 font-inter text-sm mb-6 leading-relaxed">
        L'intégration Strava n'est pas encore configurée.<br />
        Ajoutez les variables <code className="text-major-accent">STRAVA_CLIENT_ID</code>,{' '}
        <code className="text-major-accent">STRAVA_CLIENT_SECRET</code> et{' '}
        <code className="text-major-accent">STRAVA_REFRESH_TOKEN</code> dans votre fichier <code className="text-major-accent">.env</code>.
      </p>
      <a href={clubUrl} target="_blank" rel="noopener noreferrer"
        className="btn-primary inline-flex items-center gap-2">
        <ExternalLink size={16} /> Voir le club sur Strava
      </a>
    </div>
  </div>
)

export function StravaPageClient({ club, activities, members, weeklyStats, clubUrl, isInStravaClub }: Props) {
  const [tab, setTab] = useState<'weekly' | 'activities' | 'members'>('weekly')

  if (!club) return NOT_CONFIGURED(clubUrl)

  // Stats agrégées
  const totalKm      = activities.reduce((s, a) => s + a.distance, 0)
  const totalTime    = activities.reduce((s, a) => s + a.moving_time, 0)
  const totalElev    = activities.reduce((s, a) => s + a.total_elevation_gain, 0)

  // Stats hebdomadaires globales
  const weeklyTotalKm  = weeklyStats.reduce((s, w) => s + w.totalDistance, 0)
  const weeklyAthletes = weeklyStats.length

  // Lundi de la semaine en cours (pour l'affichage)
  const today        = new Date()
  const day          = today.getDay() || 7
  const monday       = new Date(today); monday.setDate(today.getDate() - (day - 1)); monday.setHours(0,0,0,0)
  const sunday       = new Date(monday); sunday.setDate(monday.getDate() + 6)
  const fmtShort     = (d: Date) => d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })

  return (
    <div className="min-h-screen bg-major-black">
      <div className="max-w-5xl mx-auto px-4 py-10">

        {/* Header club */}
        <div className="relative rounded-2xl overflow-hidden mb-8 border border-major-primary/20">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#FC4C02]/20 to-major-black/80" />
          {club.cover_photo && (
            <img src={club.cover_photo} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20" />
          )}
          <div className="relative z-10 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Logo club */}
            <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-[#FC4C02]/50 flex-shrink-0 bg-major-surface">
              {club.profile_medium
                ? <img src={club.profile_medium} alt={club.name} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center bg-major-surface p-1">
                    <Logo size={64} showText={false} />
                  </div>
              }
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-black text-[#FC4C02] text-lg tracking-tight" style={{ fontFamily: 'Arial Black, sans-serif' }}>
                  STRAVA
                </span>
                <span className="text-gray-500 text-xs font-inter">· Club officiel</span>
              </div>
              <h1 className="font-bebas text-3xl sm:text-4xl text-white tracking-widest">{club.name}</h1>
              <p className="text-gray-400 font-inter text-sm mt-1">{club.city}, {club.country === 'Morocco' ? 'Maroc' : club.country}</p>
              {club.description && (
                <p className="text-gray-300 font-inter text-xs mt-2 leading-relaxed max-w-lg">{club.description}</p>
              )}
            </div>
            <a href={clubUrl} target="_blank" rel="noopener noreferrer"
              className={`flex items-center gap-2 px-4 py-2 text-sm font-inter font-semibold rounded-xl transition-colors flex-shrink-0 ${
                isInStravaClub
                  ? 'bg-major-surface border border-[#FC4C02]/40 text-[#FC4C02] hover:bg-[#FC4C02]/10'
                  : 'bg-[#FC4C02] hover:bg-[#e04400] text-white'
              }`}>
              <ExternalLink size={15} />
              {isInStravaClub ? 'Voir le club sur Strava' : 'Rejoindre sur Strava'}
            </a>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Users,    label: 'Membres',         value: club.member_count,             suffix: '' },
            { icon: Activity, label: 'Activités (20)',  value: activities.length,              suffix: '' },
            { icon: MapPin,   label: 'Km ce mois',      value: (totalKm / 1000).toFixed(0),   suffix: ' km' },
            { icon: TrendingUp,label: 'Dénivelé',       value: Math.round(totalElev),          suffix: ' m' },
          ].map(({ icon: Icon, label, value, suffix }) => (
            <div key={label} className="card-dark text-center">
              <Icon size={20} className="text-[#FC4C02] mx-auto mb-2" />
              <p className="font-bebas text-3xl text-white">{value}{suffix}</p>
              <p className="text-gray-500 text-xs font-inter uppercase tracking-widest">{label}</p>
            </div>
          ))}
        </div>

        {/* Onglets */}
        <div className="flex flex-wrap gap-1 bg-major-surface rounded-xl p-1 mb-6 w-fit">
          {([
            { key: 'weekly',     label: `🏆 Km de la semaine` },
            { key: 'activities', label: `🏃 Activités récentes` },
            { key: 'members',    label: `👥 Membres (${members.length})` },
          ] as const).map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-5 py-2 rounded-lg text-sm font-inter font-medium transition-all ${
                tab === t.key ? 'bg-[#FC4C02] text-white' : 'text-gray-400 hover:text-white'
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Onglet Km de la semaine ─────────────────────────────────── */}
        {tab === 'weekly' && (
          <div>
            {/* Bandeau récap */}
            <div className="mb-5 flex items-center justify-between bg-gradient-to-r from-[#FC4C02]/10 to-major-surface border border-[#FC4C02]/30 rounded-xl px-5 py-4 flex-wrap gap-3">
              <div>
                <p className="font-oswald text-white text-sm uppercase tracking-widest">
                  Semaine du {fmtShort(monday)} au {fmtShort(sunday)}
                </p>
                <p className="text-gray-400 font-inter text-xs mt-1">
                  Classement des adhérents par kilométrage cumulé sur la semaine en cours.
                </p>
              </div>
              <div className="flex gap-4 text-right">
                <div>
                  <p className="font-bebas text-2xl text-[#FC4C02] leading-none">{(weeklyTotalKm / 1000).toFixed(0)}</p>
                  <p className="text-gray-500 text-[10px] font-inter uppercase">km cumulés</p>
                </div>
                <div>
                  <p className="font-bebas text-2xl text-white leading-none">{weeklyAthletes}</p>
                  <p className="text-gray-500 text-[10px] font-inter uppercase">actifs</p>
                </div>
              </div>
            </div>

            {weeklyStats.length === 0 ? (
              <div className="text-center py-16 text-gray-500 font-inter">
                Aucune activité enregistrée cette semaine.
                <br />
                <span className="text-xs">Pensez à synchroniser vos courses sur Strava !</span>
              </div>
            ) : (
              <div className="space-y-2">
                {weeklyStats.map((w, i) => {
                  const km        = (w.totalDistance / 1000)
                  const isTop3    = i < 3
                  const medalColor = i === 0 ? 'text-yellow-400'
                                   : i === 1 ? 'text-gray-300'
                                   : i === 2 ? 'text-amber-600'
                                   : 'text-gray-600'
                  return (
                    <div key={w.athleteKey}
                      className={`flex items-center gap-4 p-3 rounded-xl border transition-colors ${
                        isTop3
                          ? 'bg-[#FC4C02]/5 border-[#FC4C02]/30'
                          : 'bg-major-surface border-gray-800 hover:border-gray-600'
                      }`}>
                      {/* Rang + médaille */}
                      <div className="w-10 flex flex-col items-center flex-shrink-0">
                        {isTop3 ? (
                          <Medal size={22} className={medalColor} />
                        ) : (
                          <span className="font-bebas text-xl text-gray-500">#{i + 1}</span>
                        )}
                      </div>

                      {/* Nom */}
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-inter font-semibold text-sm truncate">
                          {w.firstname} {w.lastname[0]}.
                        </p>
                        <p className="text-gray-500 text-xs font-inter">
                          {w.activities} activité{w.activities > 1 ? 's' : ''} ·{' '}
                          {Math.floor(w.totalTime / 3600) > 0
                            ? `${Math.floor(w.totalTime / 3600)}h${String(Math.floor((w.totalTime % 3600) / 60)).padStart(2, '0')}`
                            : `${Math.floor(w.totalTime / 60)} min`}
                        </p>
                      </div>

                      {/* Km */}
                      <div className="text-right flex-shrink-0">
                        <p className="font-bebas text-2xl text-[#FC4C02] leading-none">{km.toFixed(1)}</p>
                        <p className="text-gray-500 text-[10px] font-inter uppercase">km</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Activités */}
        {tab === 'activities' && (
          <div className="space-y-3">
            {activities.length === 0 ? (
              <div className="text-center py-16 text-gray-500 font-inter">Aucune activité récente.</div>
            ) : (
              activities.map((a, i) => (
                <div key={i} className="card-dark flex items-center gap-4">
                  {/* Type */}
                  <div className="text-2xl flex-shrink-0">{activityTypeIcon(a.type)}</div>

                  {/* Info principale */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-white font-inter font-semibold text-sm truncate">{a.name}</p>
                    </div>
                    <p className="text-gray-500 text-xs font-inter">
                      {a.athlete.firstname} {a.athlete.lastname[0]}.
                      {' · '}
                      {new Date(a.start_date_local).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="hidden sm:flex items-center gap-6 text-right flex-shrink-0">
                    <div>
                      <p className="text-[#FC4C02] font-oswald font-bold text-lg">{formatDistance(a.distance)}</p>
                      <p className="text-gray-500 text-[10px] font-inter uppercase">Distance</p>
                    </div>
                    <div>
                      <p className="text-white font-oswald font-bold text-lg">{formatDuration(a.moving_time)}</p>
                      <p className="text-gray-500 text-[10px] font-inter uppercase">Durée</p>
                    </div>
                    <div>
                      <p className="text-major-cyan font-oswald font-bold text-lg">{formatPace(a.average_speed)}</p>
                      <p className="text-gray-500 text-[10px] font-inter uppercase">Allure</p>
                    </div>
                  </div>

                  {/* Mobile stats */}
                  <div className="sm:hidden text-right flex-shrink-0">
                    <p className="text-[#FC4C02] font-oswald font-bold">{formatDistance(a.distance)}</p>
                    <p className="text-gray-400 text-xs font-inter">{formatDuration(a.moving_time)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Membres */}
        {tab === 'members' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {members.length === 0 ? (
              <div className="col-span-full text-center py-16 text-gray-500 font-inter">Aucun membre trouvé.</div>
            ) : (
              members.map((m, i) => (
                <div key={i} className="card-dark flex flex-col items-center text-center py-5">
                  <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#FC4C02]/30 mb-3 bg-major-surface flex-shrink-0">
                    {m.profile_medium
                      ? <img src={m.profile_medium} alt={m.firstname} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-major-accent text-lg font-bold">
                          {m.firstname[0]}{m.lastname[0]}
                        </div>
                    }
                  </div>
                  <p className="text-white font-inter font-medium text-sm">{m.firstname} {m.lastname[0]}.</p>
                  {m.city && <p className="text-gray-500 text-xs font-inter mt-0.5">{m.city}</p>}
                </div>
              ))
            )}
          </div>
        )}

        {/* CTA — adapté selon que l'utilisateur est déjà dans le club ou non */}
        {isInStravaClub ? (
          <div className="mt-10 text-center bg-major-surface border border-[#FC4C02]/20 rounded-2xl p-8">
            <div className="text-4xl mb-3">🏅</div>
            <h3 className="font-bebas text-2xl text-white tracking-widest mb-2">VOUS FAITES PARTIE DU CLUB</h3>
            <p className="text-gray-400 font-inter text-sm mb-5">
              Continuez à publier vos activités sur Strava — elles apparaîtront ici dès qu'elles sont synchronisées.
              Pour quitter le club, rendez-vous sur la page Strava du club.
            </p>
            <a href={clubUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-major-surface border border-[#FC4C02]/40 hover:bg-[#FC4C02]/10 text-[#FC4C02] font-inter font-semibold rounded-xl transition-colors">
              <ExternalLink size={16} /> Voir le club sur Strava
            </a>
          </div>
        ) : (
          <div className="mt-10 text-center bg-major-surface border border-[#FC4C02]/20 rounded-2xl p-8">
            <div className="text-4xl mb-3">🏅</div>
            <h3 className="font-bebas text-2xl text-white tracking-widest mb-2">REJOINS LE CLUB SUR STRAVA</h3>
            <p className="text-gray-400 font-inter text-sm mb-5">
              Partage tes activités, suis tes progrès et apparais dans le classement de la semaine.
            </p>
            <a href={clubUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#FC4C02] hover:bg-[#e04400] text-white font-inter font-semibold rounded-xl transition-colors">
              <ExternalLink size={16} /> Rejoindre le club Strava
            </a>
          </div>
        )}

      </div>
    </div>
  )
}
