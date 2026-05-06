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

// ── Classement hebdomadaire par athlète ────────────────────────────
// Source : table StravaActivity de notre DB, alimentée par le cron
// /api/cron/strava-sync. Strava n'expose pas les dates sur son API
// publique des clubs, donc on capture chaque activité au moment où on
// la voit pour la 1ère fois (`observedAt`).
export interface WeeklyStat {
  athleteKey:    string
  firstname:     string
  lastname:      string
  totalDistance: number  // mètres
  totalTime:     number  // secondes
  activities:    number
  byType:        Record<string, number>
}

// Types comptés (course/marche/trail). Vélo et autres exclus.
const RUN_TYPES = ['Run', 'TrailRun', 'VirtualRun', 'Walk', 'Hike']

function startOfWeekMonday(d: Date): Date {
  const day = d.getDay() || 7
  const monday = new Date(d)
  monday.setDate(d.getDate() - (day - 1))
  monday.setHours(0, 0, 0, 0)
  return monday
}

export async function getWeeklyStats(): Promise<WeeklyStat[]> {
  // Import dynamique pour éviter une dépendance circulaire (lib/strava
  // est aussi importé par /api/cron/strava-sync qui utilise prisma).
  const { prisma } = await import('@/lib/prisma')

  const weekStart = startOfWeekMonday(new Date())

  const rows = await prisma.stravaActivity.findMany({
    where: {
      observedAt: { gte: weekStart },
      type:       { in: RUN_TYPES },
    },
    select: {
      athleteKey: true, firstName: true, lastName: true,
      distance: true, movingTime: true, type: true,
    },
  })

  const map = new Map<string, WeeklyStat>()
  for (const a of rows) {
    let stat = map.get(a.athleteKey)
    if (!stat) {
      stat = {
        athleteKey:    a.athleteKey,
        firstname:     a.firstName,
        lastname:      a.lastName,
        totalDistance: 0, totalTime: 0, activities: 0,
        byType: {},
      }
      map.set(a.athleteKey, stat)
    }
    stat.totalDistance += a.distance
    stat.totalTime     += a.movingTime
    stat.activities    += 1
    stat.byType[a.type] = (stat.byType[a.type] ?? 0) + a.distance
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
