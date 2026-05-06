const CLUB_ID        = '2075788'
const TOKEN_URL      = 'https://www.strava.com/oauth/token'
const API_BASE       = 'https://www.strava.com/api/v3'

export interface StravaClub {
  id:                number
  name:              string
  profile_medium:    string
  profile:           string
  cover_photo:       string | null
  cover_photo_small: string | null
  sport_type:        string
  city:              string
  country:           string
  member_count:      number
  athlete_count:     number
  description:       string
  url:               string
}

export interface StravaActivity {
  id:             number
  name:           string
  type:           string
  distance:       number   // mètres
  moving_time:    number   // secondes
  elapsed_time:   number
  total_elevation_gain: number
  athlete: {
    firstname: string
    lastname:  string
  }
  start_date_local: string
  average_speed:    number
  max_speed:        number
}

export interface StravaMember {
  id:              number
  firstname:       string
  lastname:        string
  profile_medium:  string
  profile:         string
  city:            string
  country:         string
}

export interface StravaLeaderboard {
  entries: {
    athlete_firstname: string
    athlete_lastname:  string
    athlete_profile:   string
    rank:              number
    distance:          number
    moving_time:       number
    elapsed_time:      number
    num_activities:    number
  }[]
}

// ── Token management ──────────────────────────────────────────
let cachedToken: { access_token: string; expires_at: number } | null = null

async function getAccessToken(): Promise<string | null> {
  const clientId     = process.env.STRAVA_CLIENT_ID
  const clientSecret = process.env.STRAVA_CLIENT_SECRET
  const refreshToken = process.env.STRAVA_REFRESH_TOKEN

  if (!clientId || !clientSecret || !refreshToken) return null

  // Utiliser le cache si encore valide (5 min de marge)
  if (cachedToken && cachedToken.expires_at > Date.now() / 1000 + 300) {
    return cachedToken.access_token
  }

  try {
    const res = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id:     clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type:    'refresh_token',
      }),
      cache: 'no-store',
    })
    if (!res.ok) return null
    const data = await res.json()
    cachedToken = { access_token: data.access_token, expires_at: data.expires_at }
    return data.access_token
  } catch {
    return null
  }
}

async function stravaFetch(path: string, revalidate = 3600) {
  const token = await getAccessToken()
  if (!token) return null
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate },
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

// ── Public API ────────────────────────────────────────────────
export async function getClubInfo(): Promise<StravaClub | null> {
  return stravaFetch(`/clubs/${CLUB_ID}`, 3600)
}

export async function getClubActivities(perPage = 20): Promise<StravaActivity[]> {
  const data = await stravaFetch(`/clubs/${CLUB_ID}/activities?per_page=${perPage}`, 900)
  return data ?? []
}

// ── Classement par athlète sur les activités récentes ─────────────
// IMPORTANT : l'API Strava /clubs/{id}/activities ne retourne PAS la
// date des activités (Strava l'a retirée pour confidentialité). On ne
// peut donc pas faire un vrai "depuis lundi" côté serveur. À la place,
// on prend les N activités les plus récentes (l'API renvoie en ordre
// anti-chronologique) et on agrège par athlète. Pour une vraie stat
// hebdo, il faudrait synchroniser dans notre DB avec des timestamps
// observés à chaque appel — à faire en feature séparée.
export interface WeeklyStat {
  athleteKey:    string  // clé d'identification (firstname + lastname)
  firstname:     string
  lastname:      string
  totalDistance: number  // mètres
  totalTime:     number  // secondes
  activities:    number
  byType:        Record<string, number>  // mètres par type d'activité
}

// Types d'activités à courte/longue distance comptées dans le classement
// d'un club de course à pied. On exclut Ride/Swim/etc. pour ne pas
// gonfler les chiffres avec du vélo (240 km de vélo en 3 jours = normal,
// 240 km de course = irréaliste).
const RUN_TYPES = new Set(['Run', 'TrailRun', 'VirtualRun', 'Walk', 'Hike'])

export async function getWeeklyStats(perPage = 50): Promise<WeeklyStat[]> {
  // 50 activités ≈ 1 semaine pour un club de 30-50 membres actifs.
  // À ajuster selon la taille du club (si le classement reste long et
  // remonte trop loin, baisser ce nombre).
  const data = await stravaFetch(`/clubs/${CLUB_ID}/activities?per_page=${perPage}`, 900)
  if (!Array.isArray(data)) return []

  const map = new Map<string, WeeklyStat>()

  for (const a of data as StravaActivity[]) {
    if (!RUN_TYPES.has(a.type)) continue  // course/marche/trail uniquement

    const key = `${(a.athlete?.firstname || '').trim().toLowerCase()}__${(a.athlete?.lastname || '').trim().toLowerCase()}`
    if (!key.replace(/[_]/g, '')) continue
    let stat = map.get(key)
    if (!stat) {
      stat = {
        athleteKey: key,
        firstname:  a.athlete?.firstname || '',
        lastname:   a.athlete?.lastname  || '',
        totalDistance: 0, totalTime: 0, activities: 0,
        byType: {},
      }
      map.set(key, stat)
    }
    stat.totalDistance += a.distance || 0
    stat.totalTime     += a.moving_time || 0
    stat.activities    += 1
    stat.byType[a.type] = (stat.byType[a.type] ?? 0) + (a.distance || 0)
  }

  return Array.from(map.values()).sort((a, b) => b.totalDistance - a.totalDistance)
}

export async function getClubMembers(perPage = 30): Promise<StravaMember[]> {
  const data = await stravaFetch(`/clubs/${CLUB_ID}/members?per_page=${perPage}`, 3600)
  return data ?? []
}

// ── Helpers ───────────────────────────────────────────────────
export function formatDistance(meters: number) {
  return (meters / 1000).toFixed(1) + ' km'
}

export function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}h${String(m).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}

export function formatPace(metersPerSec: number) {
  if (!metersPerSec) return '—'
  const secPerKm = 1000 / metersPerSec
  const m = Math.floor(secPerKm / 60)
  const s = Math.round(secPerKm % 60)
  return `${m}'${String(s).padStart(2, '0')}''/km`
}

export function activityTypeIcon(type: string) {
  const map: Record<string, string> = {
    Run:    '🏃',
    Ride:   '🚴',
    Walk:   '🚶',
    Hike:   '🥾',
    Swim:   '🏊',
    Trail:  '⛰️',
  }
  return map[type] ?? '🏅'
}

export function stravaClubUrl() {
  return `https://www.strava.com/clubs/${CLUB_ID}`
}
