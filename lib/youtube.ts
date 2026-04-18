/** Extrait l'ID d'une vidéo YouTube depuis n'importe quel format d'URL */
export function extractYoutubeId(url: string): string | null {
  if (!url) return null
  const patterns = [
    /[?&]v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /\/embed\/([a-zA-Z0-9_-]{11})/,
    /\/shorts\/([a-zA-Z0-9_-]{11})/,
  ]
  for (const p of patterns) {
    const m = url.match(p)
    if (m) return m[1]
  }
  return null
}

export function getYoutubeThumbnail(videoId: string, quality: 'mq' | 'hq' | 'maxres' = 'mq'): string {
  return `https://img.youtube.com/vi/${videoId}/${quality}default.jpg`
}

export interface YoutubeVideo {
  id:        string
  title:     string
  published: Date
  views:     number
  thumbnail: string
  url:       string
}

/**
 * Récupère les dernières vidéos d'une chaîne YouTube via le flux RSS public.
 * Aucune clé API nécessaire. Résultat mis en cache 1 heure.
 */
export async function fetchChannelVideos(
  channelId: string,
  maxResults = 12,
): Promise<YoutubeVideo[]> {
  try {
    const res = await fetch(
      `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`,
      { next: { revalidate: 3600 } },   // cache Next.js 1 h
    )
    if (!res.ok) return []

    const xml = await res.text()
    const entries = xml.match(/<entry>([\s\S]*?)<\/entry>/g) ?? []

    return entries
      .slice(0, maxResults)
      .map(entry => {
        const videoId   = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1] ?? ''
        const rawTitle  = entry.match(/<title>([^<]+)<\/title>/)?.[1] ?? ''
        const published = entry.match(/<published>([^<]+)<\/published>/)?.[1] ?? ''
        const views     = entry.match(/views="(\d+)"/)?.[1] ?? '0'

        const title = rawTitle
          .replace(/&amp;/g,  '&')
          .replace(/&lt;/g,   '<')
          .replace(/&gt;/g,   '>')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g,  "'")

        return {
          id:        videoId,
          title,
          published: new Date(published),
          views:     parseInt(views),
          thumbnail: getYoutubeThumbnail(videoId, 'mq'),
          url:       `https://www.youtube.com/watch?v=${videoId}`,
        }
      })
      .filter(v => v.id)
  } catch (err) {
    console.error('[YouTube RSS]', err)
    return []
  }
}
