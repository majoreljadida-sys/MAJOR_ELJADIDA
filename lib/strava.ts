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
