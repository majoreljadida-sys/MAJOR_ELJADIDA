'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Users, Activity, TrendingUp, ExternalLink, MapPin } from 'lucide-react'
import { Logo } from '@/components/ui/logo'
import type { StravaClub, StravaActivity, StravaMember } from '@/lib/strava'

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
  club:       StravaClub | null
  activities: StravaActivity[]
  members:    StravaMember[]
  clubUrl:    string
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

export function StravaPageClient({ club, activities, members, clubUrl }: Props) {
  const [tab, setTab] = useState<'activities' | 'members'>('activities')

  if (!club) return NOT_CONFIGURED(clubUrl)

  // Stats agrégées
  const totalKm      = activities.reduce((s, a) => s + a.distance, 0)
  const totalTime    = activities.reduce((s, a) => s + a.moving_time, 0)
  const totalElev    = activities.reduce((s, a) => s + a.total_elevation_gain, 0)

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
              className="flex items-center gap-2 px-4 py-2 bg-[#FC4C02] hover:bg-[#e04400] text-white text-sm font-inter font-semibold rounded-xl transition-colors flex-shrink-0">
              <ExternalLink size={15} /> Rejoindre sur Strava
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
        <div className="flex gap-1 bg-major-surface rounded-xl p-1 mb-6 w-fit">
          {(['activities', 'members'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-inter font-medium transition-all ${
                tab === t ? 'bg-[#FC4C02] text-white' : 'text-gray-400 hover:text-white'
              }`}>
              {t === 'activities' ? `🏃 Activités récentes` : `👥 Membres (${members.length})`}
            </button>
          ))}
        </div>

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

        {/* CTA rejoindre */}
        <div className="mt-10 text-center bg-major-surface border border-[#FC4C02]/20 rounded-2xl p-8">
          <div className="text-4xl mb-3">🏅</div>
          <h3 className="font-bebas text-2xl text-white tracking-widest mb-2">REJOINS LE CLUB SUR STRAVA</h3>
          <p className="text-gray-400 font-inter text-sm mb-5">
            Partage tes activités, suis tes progrès et reste connecté avec tous les membres MAJOR.
          </p>
          <a href={clubUrl} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#FC4C02] hover:bg-[#e04400] text-white font-inter font-semibold rounded-xl transition-colors">
            <ExternalLink size={16} /> Rejoindre le club Strava
          </a>
        </div>

      </div>
    </div>
  )
}
