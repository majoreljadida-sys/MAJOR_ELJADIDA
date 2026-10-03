// Copie les events (et leurs inscriptions) de la base LOCAL vers la base PROD.
//
// Usage : npx tsx scripts/sync-local-events-to-prod.ts
//
// Comportement :
//   - Pour chaque event local, on vérifie s'il existe en prod (par slug)
//     • Non → on l'insère avec un nouvel id
//     • Oui → on l'ignore (pas de mise à jour pour ne pas écraser)
//   - Les EventRegistration ne sont PAS copiées (membres non alignés
//     entre local et prod)

import { PrismaClient } from '@prisma/client'

const PROD_URL  = 'postgresql://neondb_owner:npg_F4WBLe6rxZTm@ep-sweet-unit-amybnzup-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
const LOCAL_URL = 'postgresql://postgres:Major@localhost:5432/clubmajor'

const local = new PrismaClient({ datasourceUrl: LOCAL_URL })
const prod  = new PrismaClient({ datasourceUrl: PROD_URL })

async function main() {
  console.log('🔄 Synchronisation events LOCAL → PROD\n')

  const localEvents = await local.event.findMany({ orderBy: { date: 'asc' } })
  console.log(`Events locaux trouvés : ${localEvents.length}`)

  const prodSlugs = new Set((await prod.event.findMany({ select: { slug: true } })).map(e => e.slug))
  console.log(`Events d\xE9j\xE0 en prod : ${prodSlugs.size}\n`)

  let inserted = 0, skipped = 0
  for (const e of localEvents) {
    if (prodSlugs.has(e.slug)) {
      console.log(`⏭  Skipped (existe d\xE9j\xE0) : ${e.title}`)
      skipped++
      continue
    }
    try {
      await prod.event.create({
        data: {
          title:           e.title,
          slug:            e.slug,
          description:     e.description,
          date:            e.date,
          endDate:         e.endDate,
          location:        e.location,
          city:            e.city,
          type:            e.type,
          maxParticipants: e.maxParticipants,
          imageUrl:        e.imageUrl,
          price:           e.price,
          distance:        e.distance,
          videoUrl:        e.videoUrl,
          status:          e.status,
          createdAt:       e.createdAt,
          updatedAt:       e.updatedAt,
        },
      })
      console.log(`✅ Insé\xE9 : ${e.title} (${e.date.toISOString().slice(0, 10)})`)
      inserted++
    } catch (err: any) {
      console.error(`❌ Erreur sur "${e.title}" : ${err.message}`)
    }
  }

  console.log(`\n--- Récapitulatif ---`)
  console.log(`${inserted} insé\xE9(s) · ${skipped} ignoré(s)`)
  console.log(`Prod a maintenant ${await prod.event.count()} events au total.`)
}

main()
  .catch(e => { console.error('❌', e); process.exit(1) })
  .finally(async () => { await local.$disconnect(); await prod.$disconnect() })
